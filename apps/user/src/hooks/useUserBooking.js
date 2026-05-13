import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useAppointmentState } from '../context/AppointmentContext';
import { useNotificationState } from '../context/NotificationContext';
import useSlotHold from './useSlotHold';

const STEPS = ['service', 'datetime', 'other_info', 'review', 'confirm'];

// Storage Keys
const WIZARD_STATE_KEY = 'user_booking_wizard_state';
const SESSION_ID_KEY = 'user_booking_session_id';

const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
};

const getSavedState = () => {
    try {
        const saved = localStorage.getItem(WIZARD_STATE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Manages user booking wizard state and submission.
 */
const useUserBooking = (initialServiceId = null, initialServiceName = null) => {
    const { token, user } = useAuth();
    const { refresh: refreshAppts } = useAppointmentState();
    const { refresh: refreshNotifs } = useNotificationState();

    // Initialize state from localStorage (if available)
    const savedState = getSavedState();
    const [sessionId, setSessionId] = useState(() => {
        const id = getOrCreateSessionId();
        console.log('[UserBooking DEBUG] Initializing Session ID:', id);
        return id;
    });

    console.log('[UserBooking DEBUG] Initializing Wizard State. Hydrated:', !!savedState, savedState);
    const [book_for_others, setBookForOthers] = useState(savedState?.book_for_others || false);
    const [step, setStep] = useState(savedState?.step || 0);
    const [formData, setFormData] = useState(() => {
        const defaultData = {
            service_id: initialServiceId || '',
            service_name: initialServiceName || '',
            date: '',
            time: '',
            booked_for_first_name: '',
            booked_for_last_name: '',
            booked_for_middle_name: '',
            booked_for_suffix_name: '',
            booked_for_birthday: '',
            booked_for_relationship: '',
            booked_for_sex: '',
            dentist_id: '',
            service_tier: '',
            patient_profile_id: '',
            patient_note: '',
            agreed_to_terms: false,
        };

        // Deep links override saved state for service selection
        return {
            ...defaultData,
            ...(savedState?.formData || {}),
            ...(initialServiceId ? { service_id: initialServiceId } : {}),
            ...(initialServiceName ? { service_name: initialServiceName } : {}),
        };
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [lastSubmissionTime, setLastSubmissionTime] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Initialize slot hold hook
    const slotHold = useSlotHold(sessionId);

    // ✅ Sync state to localStorage
    useEffect(() => {
        if (!result) {
            const stateToSave = {
                step,
                formData,
                book_for_others
            };
            console.log('[UserBooking DEBUG] Saving state to localStorage:', stateToSave);
            localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify(stateToSave));
        }
    }, [step, formData, book_for_others, result]);

    // Dynamically choose steps based on booking preference
    const steps = STEPS;
    const currentStep = steps[step];

    // Clear error when user makes changes
    const updateField = (field, value) => {
        setError(null);
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateFields = (fields) => {
        setError(null);
        setFormData((prev) => ({ ...prev, ...fields }));
    };

    const setBookForOthersMode = (enabled) => {
        setBookForOthers(enabled);
        if (!enabled) {
            setFormData((prev) => ({
                ...prev,
                booked_for_first_name: '',
                booked_for_last_name: '',
                booked_for_middle_name: '',
                booked_for_suffix_name: '',
                patient_profile_id: '',
            }));
        }
    };

    const nextStep = () => {
        if (step === 0 && slotHold.activeHold && formData.service_id !== slotHold.activeHold.service_id) {
            slotHold.releaseHold().catch(() => {});
            setFormData(prev => ({
                ...prev,
                date: '',
                time: '',
                dentist_id: '',
            }));
        }
        if (step < steps.length - 1) setStep((s) => s + 1);
    };

    const prevStep = () => {
        if (step > 0) {
            setError(null);
            setStep(step - 1);
        }
    };

    const goToStep = (index) => {
        if (index < step) {
            setError(null);
            setStep(index);
        }
    };

    /**
     * Pre-flight validation for anti-abuse rules.
     * Intercepts: Overlapping slots, quotas, and dependent limits.
     */
    const validateAbuse = async () => {
        setIsVerifying(true);
        setError(null);
        try {
            await api.post('/appointments/user-validate', {
                service_id: formData.service_id,
                date: formData.date,
                time: formData.time,
                patient_profile_id: formData.patient_profile_id
            }, token);
            return { success: true };
        } catch (err) {
            const message = err.message || 'Verification failed. Please check your schedule.';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsVerifying(false);
        }
    };

    // Submit booking to API with unified atomic endpoint
    const submit = async () => {
        console.log('[useUserBooking DEBUG] Final formData before submit:', formData);
        // ✅ Implement client-side rate limiting (minimum 1 second between submissions)
        const now = Date.now();
        if (lastSubmissionTime && now - lastSubmissionTime < 1000) {
            setError('Please wait a moment before trying again.');
            return;
        }

        setSubmitting(true);
        setError(null);
        setLastSubmissionTime(now);

        // 15 second timeout
        const timeoutId = setTimeout(() => {
            setSubmitting(false);
            setError('Request timed out. Please try again.');
        }, 15000);

        try {
            // ✅ Unified Atomic Body
            const isNewMember = !formData.patient_profile_id || formData.patient_profile_id === 'new';
            const body = {
                service_id: formData.service_id,
                booking: {
                    date: formData.date,
                    time: formData.time,
                    dentist_id: formData.dentist_id || null,
                    booked_for_name_parts: {
                        first: formData.booked_for_first_name || user?.first_name || null,
                        last: formData.booked_for_last_name || user?.last_name || null,
                        middle: formData.booked_for_middle_name || user?.middle_name || null,
                        suffix: formData.booked_for_suffix_name || user?.suffix || null,
                        birthday: formData.booked_for_birthday || user?.date_of_birth || null,
                        relationship: isNewMember
                            ? (formData.booked_for_relationship || null)
                            : (formData.booked_for_relationship || 'Self'),
                        sex: formData.booked_for_sex || user?.sex || null,
                    },
                    user_session_id: sessionId,
                    patient_profile_id: formData.patient_profile_id === 'new' ? null : (formData.patient_profile_id || null),
                    notes: formData.patient_note || null,
                    accepted_terms: formData.agreed_to_terms || false,
                    terms_accepted_at: formData.agreed_to_terms ? new Date().toISOString() : null,
                }
            };

            console.log('[useUserBooking DEBUG] FINAL BODY TO SEND:', JSON.stringify(body, null, 2));
            const response = await api.post('/appointments/submit-wizard', body, token);
            
            clearTimeout(timeoutId);

            // Clean up the active hold after processing results
            slotHold.clearHold();

            const { booking } = response;

            // Handle results based on what was requested and what succeeded
            const bookingSuccess = !!booking?.booked;

            if (bookingSuccess) {
                // Clear persistence on success
                localStorage.removeItem(WIZARD_STATE_KEY);

                // ✅ Proactively refresh application state to eliminate realtime latency
                if (typeof refreshAppts === 'function') refreshAppts();
                if (typeof refreshNotifs === 'function') refreshNotifs();

                setResult({
                    success: true,
                    booked: true,
                    appointment: booking.appointment,
                    formData: formData,
                    message: 'Appointment confirmed!',
                });
            }
            // ✅ SCENARIO: Failure
            else {
                setResult(null);
                const message = booking?.message || 'The selected slot is no longer available. Please try another time.';
                setError(message);
                
                // ✅ RETRY LOGIC: Only go back if the slot is actually gone
                // If it's a generic failure, stay on Review so they can retry.
                if (message.toLowerCase().includes('available') || message.toLowerCase().includes('slot') || booking?.error_code === 409) {
                    setStep(STEPS.indexOf('datetime'));
                }
            }

            setSubmitting(false);
        } catch (err) {
            clearTimeout(timeoutId);
            setSubmitting(false);

            // Backend returns specific error stage if one fails
            const prefix = err.stage ? `[${err.stage}] ` : '';
            setError(`${prefix}${err.message || 'Submission failed. Please try again.'}`);
            
            // If it's a conflict error, go back to datetime
            if (err.status === 409) {
                setStep(STEPS.indexOf('datetime'));
            }
        }
    };

    const reset = async () => {
        // ✅ Release the hold on the backend first
        await slotHold.releaseHold().catch(() => {});

        // Clear persistence
        localStorage.removeItem(WIZARD_STATE_KEY);

        setStep(0);
        setFormData({
            service_id: '',
            service_name: '',
            date: '',
            time: '',
            booked_for_first_name: '',
            booked_for_last_name: '',
            booked_for_middle_name: '',
            booked_for_suffix_name: '',
            booked_for_birthday: '',
            booked_for_relationship: '',
            booked_for_sex: '',
            dentist_id: '',
            patient_profile_id: '',
            patient_note: '',
            agreed_to_terms: false,
        });
        setError(null);
        setSubmitting(false);
        setResult(null);
        setBookForOthers(false);

        // ✅ Rotate session ID
        const newId = generateSessionId();
        localStorage.setItem(SESSION_ID_KEY, newId);
        setSessionId(newId);

        slotHold.clearHold();
    };

    return {
        // State
        sessionId,
        step,
        currentStep,
        steps,
        book_for_others,
        formData,
        submitting,
        error,
        result,
        slotHold, // pass the hold hook to children
        // Actions
        updateField,
        updateFields,
        setBookForOthersMode,
        nextStep,
        prevStep,
        goToStep,
        isVerifying,
        validateAbuse,
        submit,
        reset,
    };
};

export default useUserBooking;
