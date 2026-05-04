import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useSlotHold from './useSlotHold';

const STEPS = ['service', 'datetime', 'info', 'review', 'verification'];

// Session ID management (use sessionStorage so it clears when tab closes)
const STORAGE_KEY = 'guest_session_id';
const GUEST_BOOKING_STATE_KEY = 'guest_booking_state';

const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const getOrCreateSessionId = () => {
    let sessionId = localStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(STORAGE_KEY, sessionId);
    }
    return sessionId;
};

/**
 * Manages guest booking wizard state and submission.
 *
 * Features:
 * - Session ID generation/persistence in sessionStorage
 * - Step navigation with validation
 * - Form data management with field updates
 * - API submission with timeout handling
 * - Error clearing on user interaction
 *
 * @param {string} initialServiceId - Pre-select service from ?service=uuid
 * @param {string} initialServiceName - Pre-select service name
 * @returns {object} booking state and actions
 */
const DEFAULT_FORM_DATA = {
    service_id: '',
    service_name: '',
    service_duration: '',
    date: '',
    time: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix_name: '',
    email: '',
    phone: '',
    dentist_id: '',
    service_tier: '',
    patient_note: '',
    birthday: '', // ✅ NEW: Guest birthday
    agreed_to_terms: false, // ✅ NEW: Terms agreement
};

/**
 * Manages guest booking wizard state and submission.
 *
 * Features:
 * - Session ID generation/persistence in sessionStorage
 * - Step navigation with validation
 * - Form data management with field updates
 * - API submission with timeout handling
 * - Error clearing on user interaction
 * - Persistence across refreshes via sessionStorage
 *
 * @param {string} initialServiceId - Pre-select service from ?service=uuid
 * @param {string} initialServiceName - Pre-select service name
 * @returns {object} booking state and actions
 */
const useGuestBooking = (initialServiceId = null, initialServiceName = null) => {
    // ── Hydration ──
    const getSavedState = () => {
        const saved = localStorage.getItem(GUEST_BOOKING_STATE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse guest booking state:', e);
                return null;
            }
        }
        return null;
    };

    const savedState = getSavedState();

    const [sessionId, setSessionId] = useState(() => getOrCreateSessionId());
    const [step, setStep] = useState(savedState?.step || 0);
    const [formData, setFormData] = useState(() => {
        const initial = { ...DEFAULT_FORM_DATA };
        if (initialServiceId) initial.service_id = initialServiceId;
        if (initialServiceName) initial.service_name = initialServiceName;

        if (savedState?.formData) {
            return { ...initial, ...savedState.formData };
        }
        return initial;
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [verificationToken, setVerificationToken] = useState(savedState?.verificationToken || null);
    const [failedOtpAttempts, setFailedOtpAttempts] = useState(savedState?.failedOtpAttempts || 0);
    const [otpResendCount, setOtpResendCount] = useState(savedState?.otpResendCount || 0);
    const [isVerifying, setIsVerifying] = useState(false);

    // ✅ Initialize slot hold hook at the wizard level to survive step changes
    const slotHold = useSlotHold(sessionId);

    // ── Persistence ──
    // Mirror state to localStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            step,
            formData,
            verificationToken,
            sessionId,
            failedOtpAttempts,
            otpResendCount,
        };
        localStorage.setItem(GUEST_BOOKING_STATE_KEY, JSON.stringify(stateToSave));
    }, [step, formData, verificationToken, sessionId, failedOtpAttempts, otpResendCount]);

    // ✅ Auto-release hold if user goes back and changes the service
    // This handles the case where a user already picked a time, then goes back to Step 1
    useEffect(() => {
        if (slotHold.activeHold && formData.service_id && slotHold.activeHold.service_id !== formData.service_id) {
            console.log('Service changed, releasing previous hold...');
            slotHold.releaseHold();
        }
    }, [formData.service_id, slotHold.activeHold]);

    const currentStep = STEPS[step];

    // Issue #8: Clear error when user makes changes
    const updateField = (field, value) => {
        setError(null);
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateFields = (fields) => {
        setError(null);
        setFormData((prev) => ({ ...prev, ...fields }));
    };

    const nextStep = () => {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
    };

    const prevStep = () => {
        if (step > 0) {
            const nextIdx = step - 1;
            // ✅ Reset states when going back to Service step
            if (nextIdx === 0) {
                slotHold.releaseHold();
                setFormData(prev => ({
                    ...prev,
                    date: '',
                    time: '',
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    suffix_name: '',
                    email: '',
                    phone: '',
                    dentist_id: '',
                    service_tier: prev.service_tier, // Keep tier for DateTimeStep usage
                }));
            }
            setStep(nextIdx);
        }
    };

    // Issue #3: Only allow going back to completed steps
    const goToStep = (index) => {
        if (index < step) {
            // ✅ Reset states when navigating back to Service step via breadcrumbs
            if (index === 0) {
                slotHold.releaseHold();
                setFormData(prev => ({
                    ...prev,
                    date: '',
                    time: '',
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    suffix_name: '',
                    email: '',
                    phone: '',
                    dentist_id: '',
                    service_tier: prev.service_tier, // Keep tier
                }));
            }
            setStep(index);
        }
    };

    /**
     * Pre-flight validation before OTP.
     */
    const validateBooking = async () => {
        setIsVerifying(true);
        setError(null);
        try {
            await api.post('/appointments/guest-validate', {
                email: formData.email,
                date: formData.date,
                time: formData.time,
                service_id: formData.service_id,
                duration: formData.service_duration || 60,
            });
            return { success: true };
        } catch (err) {
            setError(err.message || 'Validation failed.');
            return { success: false };
        } finally {
            setIsVerifying(false);
        }
    };

    /**
     * Phase 1: Send OTP to the guest's email.
     */
    const sendGuestOTP = async () => {
        setIsVerifying(true);
        setError(null);
        try {
            await api.post('/auth/guest/send-otp', {
                email: formData.email,
                name: formData.first_name || formData.email,
            });
            setOtpResendCount(prev => prev + 1);
            return { success: true };
        } catch (err) {
            setError(err.message || 'Failed to send verification code.');
            return { success: false };
        } finally {
            setIsVerifying(false);
        }
    };

    /**
     * Phase 1: Verify the 6-digit code.
     */
    const verifyGuestOTP = async (code) => {
        setIsVerifying(true);
        setError(null);
        try {
            const data = await api.post('/auth/guest/verify-otp', {
                email: formData.email,
                otp_code: code,
            });
            if (data.verification_token) {
                setVerificationToken(data.verification_token);
                setFailedOtpAttempts(0); // Reset on success
                return { success: true, token: data.verification_token };
            }
            throw new Error('Verification failed.');
        } catch (err) {
            setFailedOtpAttempts(prev => prev + 1);
            setError(err.message || 'Invalid code. Please check your email and try again.');
            return { success: false };
        } finally {
            setIsVerifying(false);
        }
    };

    const submit = async (passedToken = null) => {
        const tokenToUse = passedToken || verificationToken;
        if (!tokenToUse) {
            setError('Please verify your email before booking.');
            return;
        }

        setSubmitting(true);
        setError(null);

        // 15 second timeout for slow networks
        const timeoutId = setTimeout(() => {
            setSubmitting(false);
            setError('Request timed out. Your internet may be slow. Please try again.');
        }, 15000);

        try {
            const body = {
                service_id: formData.service_id,
                date: formData.date,
                time: formData.time,
                email: formData.email,
                phone: formData.phone.replace(/\D/g, ''),
                guestNameParts: {
                    first: formData.first_name,
                    last: formData.last_name,
                    middle: formData.middle_name,
                    suffix: formData.suffix_name,
                },
                user_session_id: sessionId,
                verification_token: tokenToUse,
                notes: formData.patient_note,
                birthday: formData.birthday, // ✅ Pass birthday
                accepted_terms: formData.agreed_to_terms, // ✅ Pass terms agreement
                terms_accepted_at: new Date().toISOString(), // ✅ Record timestamp
            };

            const data = await api.post('/appointments/book-guest', body);

            clearTimeout(timeoutId);

            if (data.booked) {
                setResult(data);
                setSubmitting(false);
                slotHold.clearHold();
                localStorage.removeItem(GUEST_BOOKING_STATE_KEY);
            } else {
                setSubmitting(false);
                setError(data.error || 'Booking failed. Slot may no longer be available.');
            }
        } catch (err) {
            clearTimeout(timeoutId);
            setSubmitting(false);
            setError(err.message || 'Something went wrong. Please try again.');
        }
    };

    /**
     * Phase 2: Frictionless Upgrade to User Account
     */
    const upgradeToUser = async (password) => {
        setSubmitting(true);
        setError(null);
        try {
            const data = await api.post('/auth/guest-to-user', {
                email: formData.email,
                password,
                verification_token: verificationToken,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone.replace(/\D/g, ''),
            });
            return { success: true, message: data.message };
        } catch (err) {
            setError(err.message || 'Account creation failed.');
            return { success: false, message: err.message };
        } finally {
            setSubmitting(false);
        }
    };

    const resendVerification = async (appointmentId, email) => {
        try {
            await api.post('/appointments/resend-confirmation', {
                appointment_id: appointmentId,
                email: email,
            });
            return { success: true, message: 'Verification email resent!' };
        } catch (err) {
            console.error('Resend error:', err);
            return {
                success: false,
                message: err.message || 'Failed to resend. Please try again later.',
            };
        }
    };

    const reset = async () => {
        // ✅ Release the hold on the backend first
        if (slotHold.activeHold) {
            await slotHold.releaseHold();
        }

        setStep(0);
        setFormData({
            service_id: '',
            service_name: '',
            service_duration: '',
            date: '',
            time: '',
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix_name: '',
            email: '',
            phone: '',
            service_tier: '', // Total reset
            patient_note: '',
            birthday: '',
        });
        setError(null);
        setSubmitting(false);
        setResult(null);
        setFailedOtpAttempts(0);
        setOtpResendCount(0);

        const newId = generateSessionId();
        localStorage.setItem(STORAGE_KEY, newId);
        localStorage.removeItem(GUEST_BOOKING_STATE_KEY);
        setSessionId(newId);

        slotHold.clearHold();
    };

    return {
        // State
        sessionId,
        step,
        currentStep,
        steps: STEPS,
        formData,
        submitting,
        error,
        result,
        slotHold,
        verificationToken,
        isVerifying,
        failedOtpAttempts,
        otpResendCount,
        // Actions
        updateField,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        validateBooking,
        sendGuestOTP,
        verifyGuestOTP,
        submit,
        upgradeToUser,
        resendVerification,
        reset,
    };
};

export default useGuestBooking;
