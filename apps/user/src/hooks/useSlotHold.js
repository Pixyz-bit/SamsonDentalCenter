import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api';

/**
 * Manages slot holding with auto-switch logic:
 * - When user clicks different time on SAME date: auto-release old hold, create new hold
 * - Tracks active hold with countdown timer
 * - Auto-release on component unmount
 *
 * @param {string} sessionId - User session ID (from localStorage)
 * @returns {object} hold state and actions
 */
const useSlotHold = (sessionId) => {
    // ✅ Initialize from localStorage to persist hold when navigating away and back
    // ✅ Removed localStorage initialization to ensure hold resets on page refresh/reload
    const [activeHold, setActiveHold] = useState(null);

    const [previousHoldId, setPreviousHoldId] = useState(null);
    const [holdLoading, setHoldLoading] = useState(false);
    const [holdError, setHoldError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null); // seconds
    const holdIntervalRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // Cleanup function: release hold when component unmounts or page exits
    useEffect(() => {
        const handleUnload = () => {
            if (activeHold?.hold_id) {
                // Use keepalive: true to ensure the request finishes even if the tab is closing
                api.post('/appointments/slots/release-hold', {
                    hold_id: activeHold.hold_id,
                }, null, true).catch(() => {
                    // Silently fail - hold will auto-expire anyway
                });
            }
        };

        // Standard unmount cleanup
        return () => {
            handleUnload();

            // Clear all intervals
            if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

            // ✅ Clear localStorage on unmount - this ensures if they leave the booking it's cleared
            if (typeof window !== 'undefined') {
                localStorage.removeItem('activeSlotHold');
            }
        };
    }, [activeHold?.hold_id]);

    // Handle Page Refresh/Tab Close/Navigate away from site
    useEffect(() => {
        const handlePageHide = () => {
            if (activeHold?.hold_id) {
                // pagehide is more reliable than beforeunload for cleanup
                api.post('/appointments/slots/release-hold', {
                    hold_id: activeHold.hold_id,
                }, null, true).catch(() => {});
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('pagehide', handlePageHide);
            return () => window.removeEventListener('pagehide', handlePageHide);
        }
    }, [activeHold?.hold_id]);

    // ✅ Removed localStorage persistence effect — holds now live in memory only
    // This allows a fresh start when the user reloads the page

    // ✅ Auto-clear error after 5 seconds (for Toast UI)
    useEffect(() => {
        if (!holdError) return;
        
        const timeoutId = setTimeout(() => {
            setHoldError(null);
        }, 5000);

        return () => clearTimeout(timeoutId);
    }, [holdError]);

    // Update countdown timer every second
    useEffect(() => {
        if (!activeHold?.expires_at) {
            setTimeRemaining(null);
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            const expiresAt = new Date(activeHold.expires_at);
            const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));

            setTimeRemaining(secondsLeft);

            // Auto-clear when expired
            if (secondsLeft === 0) {
                setActiveHold(null);
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                }
            }
        };

        updateCountdown(); // Call immediately
        countdownIntervalRef.current = setInterval(updateCountdown, 1000);

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [activeHold?.expires_at]);

    /**
     * Hold a time slot - with auto-switch logic
     * If user already has a hold on DIFFERENT time on same date:
     *   → Auto-release old hold
     *   → Create new hold
     * If user already has hold on SAME time:
     *   → Return existing hold (no duplicate)
     *
     * @param {string} serviceId - Service UUID
     * @param {string} date - YYYY-MM-DD format
     * @param {string} startTime - HH:MM format
     * @param {string} [dentistId] - Optional dentist UUID
     */
    const holdSlot = useCallback(
        async (serviceId, date, startTime, dentistId = null) => {
            if (!sessionId) {
                setHoldError('Session ID required to hold slot');
                return null;
            }

            setHoldLoading(true);
            setHoldError(null);

            try {
                const response = await api.post('/appointments/slots/hold', {
                    service_id: serviceId,
                    date: date,
                    time: startTime,
                    user_session_id: sessionId,
                    dentist_id: dentistId || null,
                });

                // Response includes: hold_id, previous_hold_id, expires_at, expires_in_minutes, already_held
                if (response.hold_id) {
                    setActiveHold({
                        hold_id: response.hold_id,
                        service_id: serviceId,
                        date: date,
                        time: startTime,
                        expires_at: response.expires_at,
                        expires_in_minutes: response.expires_in_minutes,
                    });

                    // Track previous hold if auto-switched
                    if (response.previous_hold_id) {
                        setPreviousHoldId(response.previous_hold_id);
                    }

                    return {
                        success: true,
                        hold_id: response.hold_id,
                        previous_hold_id: response.previous_hold_id,
                        expires_at: response.expires_at,
                        already_held: response.already_held,
                    };
                } else {
                    setHoldError('Failed to hold slot');
                    return null;
                }
            } catch (err) {
                // ✅ FIX: Handle 409 Conflict when slot is already locked by someone else
                if (err.status === 409) {
                    const errorMsg =
                        'This time slot was just booked by someone else. Please refresh or choose a different time.';
                    setHoldError(errorMsg);
                    return {
                        success: false,
                        error: 'SLOT_TAKEN',
                        message: errorMsg,
                    };
                }

                const errorMsg = err.message || 'Failed to hold slot';
                setHoldError(errorMsg);
                return null;
            } finally {
                setHoldLoading(false);
            }
        },
        [sessionId],
    );

    /**
     * Release hold manually (if needed)
     * Usually called on component unmount, but can be called explicitly
     */
    const releaseHold = useCallback(async () => {
        if (!activeHold?.hold_id) {
            return;
        }

        try {
            await api.post('/appointments/slots/release-hold', {
                hold_id: activeHold.hold_id,
            });
            setActiveHold(null);
        } catch (err) {
            // Silently fail - hold will auto-expire
        }
    }, [activeHold?.hold_id]);

    /**
     * Format time remaining as human-readable string
     * E.g., "4:32" or "1:05"
     */
    const formatTimeRemaining = () => {
        if (timeRemaining === null) return '';
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    /**
     * Re-verify active hold from server (used for manual Refresh)
     */
    const checkActiveHold = useCallback(async () => {
        if (!sessionId) return;
        try {
            const response = await api.get(`/appointments/slots/active-hold?session_id=${sessionId}`);
            if (response && response.hold_id) {
                setActiveHold({
                    hold_id: response.hold_id,
                    service_id: response.service_id,
                    date: response.date,
                    time: response.time,
                    expires_at: response.expires_at,
                    expires_in_minutes: response.expires_in_minutes,
                });
            } else {
                setActiveHold(null);
            }
        } catch (err) {
            setActiveHold(null);
        }
    }, [sessionId]);

    /**
     * Clear hold from memory and localStorage
     */
    const clearHold = useCallback(() => {
        setActiveHold(null);
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('activeSlotHold');
            } catch (e) {
                // Silently fail if localStorage is unavailable
            }
        }
    }, []);

    return {
        // State
        activeHold,
        previousHoldId,
        holdLoading,
        holdError,
        timeRemaining,
        formattedTime: formatTimeRemaining(),

        // Actions
        holdSlot,
        releaseHold,
        clearHold,
        checkActiveHold,
    };
};

export default useSlotHold;
