import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
    const [isCheckingHold, setIsCheckingHold] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const holdIntervalRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    // ✅ Persistence Logic: We NO LONGER release the hold on unmount or refresh.
    // This allows the "Recovery Interceptor" to find the hold after the page reloads.
    // The hold will naturally expire on the server after 5 minutes if the user never returns.
    useEffect(() => {
        return () => {
            // Clear all intervals
            if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

            // ✅ Note: We do NOT clear localStorage 'activeSlotHold' here anymore
            // as it might be needed for hydration if we were using it (though we use localStorage state now).
        };
    }, []);

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
                // Explicitly call release on server just in case, then clear local state
                releaseHold(); 
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
                        expires_in_minutes: response.expires_in_minutes,
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
                setIsInitialized(true);
            }
        },
        [sessionId],
    );

    /**
     * Release hold manually (if needed)
     * Usually called on component unmount, but can be called explicitly
     */
    const releaseHold = useCallback(async () => {
        try {
            if (activeHold?.hold_id) {
                await api.post('/appointments/slots/release-hold', {
                    hold_id: activeHold.hold_id,
                });
            } else if (sessionId) {
                // Fallback: cleanup anything active for this session
                await api.post('/appointments/slots/release-session-hold', {
                    user_session_id: sessionId,
                });
            }
            setActiveHold(null);
        } catch (err) {
            // Silently fail - hold will auto-expire or is already gone
        }
    }, [activeHold?.hold_id, sessionId]);

    /**
     * Format time remaining as human-readable string
     * E.g., "4:32" or "1:05"
     */
    const formatTimeRemaining = useCallback(() => {
        if (timeRemaining === null) return '';
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    /**
     * Re-verify active hold from server (used for manual Refresh)
     */
    const checkActiveHold = useCallback(async () => {
        if (!sessionId) return null;
        setIsCheckingHold(true);
        try {
            const response = await api.get(`/appointments/slots/active-hold?session_id=${sessionId}`);
            if (response && response.hold_id) {
                const hold = {
                    hold_id: response.hold_id,
                    service_id: response.service_id,
                    date: response.date,
                    time: response.time,
                    expires_at: response.expires_at,
                    expires_in_minutes: response.expires_in_minutes,
                };
                setActiveHold(hold);
                return hold;
            } else {
                setActiveHold(null);
                return null;
            }
        } catch (err) {
            setActiveHold(null);
            return null;
        } finally {
            setIsCheckingHold(false);
            setIsInitialized(true);
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

    return useMemo(() => ({
        // State
        activeHold,
        previousHoldId,
        holdLoading,
        holdError,
        setHoldError, // Added for UI control
        isCheckingHold,
        isInitialized,
        timeRemaining,
        formattedTime: formatTimeRemaining(),

        // Actions
        holdSlot,
        releaseHold,
        clearHold,
        checkActiveHold,
    }), [
        activeHold, 
        previousHoldId, 
        holdLoading, 
        holdError, 
        isCheckingHold, 
        isInitialized,
        timeRemaining, 
        formatTimeRemaining,
        holdSlot, 
        releaseHold, 
        clearHold, 
        checkActiveHold
    ]);
};

export default useSlotHold;
