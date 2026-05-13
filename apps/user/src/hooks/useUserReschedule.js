import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import useSlotHold from './useSlotHold';
import { useAuth } from '../context/AuthContext';
import { useAppointmentState } from '../context/AppointmentContext';
import { useNotificationState } from '../context/NotificationContext';

const useUserReschedule = (appointmentId, originalAppointment) => {
    const { token } = useAuth();
    const { refresh: refreshAppts } = useAppointmentState();
    const { refresh: refreshNotifs } = useNotificationState();
    // Storage Keys (Scoped to appointment ID)
    const STATE_KEY = `reschedule_state_${appointmentId}`;
    const SESSION_KEY = `reschedule_session_${appointmentId}`;

    const [sessionId] = useState(() => {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) return saved;
        const newId = Math.random().toString(36).substring(2, 10);
        localStorage.setItem(SESSION_KEY, newId);
        return newId;
    });

    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem(STATE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved).step || 1;
            } catch (e) { return 1; }
        }
        return 1;
    });

    const [formData, setFormData] = useState(() => {
        const saved = localStorage.getItem(STATE_KEY);
        const defaultData = {
            date: '',
            time: '',
            dentist_id: originalAppointment?.is_dentist_preferred ? (originalAppointment.dentist_id || '') : '',
        };
        if (saved) {
            try {
                return { ...defaultData, ...JSON.parse(saved).formData };
            } catch (e) { return defaultData; }
        }
        return defaultData;
    });

    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // ✅ Sync state to localStorage
    useEffect(() => {
        if (!result) {
            localStorage.setItem(STATE_KEY, JSON.stringify({ step, formData }));
        } else {
            localStorage.removeItem(STATE_KEY);
            localStorage.removeItem(SESSION_KEY);
        }
    }, [step, formData, result, STATE_KEY, SESSION_KEY]);

    // ✅ Sync formData when originalAppointment is loaded asynchronously
    useEffect(() => {
        if (originalAppointment && !formData.dentist_id) {
            if (originalAppointment.is_dentist_preferred) {
                setFormData(prev => ({
                    ...prev,
                    dentist_id: originalAppointment.dentist_id || ''
                }));
            }
        }
    }, [originalAppointment]);

    const slotHold = useSlotHold(sessionId);

    const steps = ['datetime', 'review', 'success'];
    const currentStep = steps[step - 1];

    const updateFields = (fields) => {
        setFormData((prev) => ({ ...prev, ...fields }));
        setError(null);
    };

    const nextStep = () => {
        setError(null);
        setStep((s) => Math.min(s + 1, steps.length));
    };
    const prevStep = () => {
        setError(null);
        setStep((s) => Math.max(s - 1, 1));
    };
    const goToStep = (s) => {
        setError(null);
        setStep(s);
    };

    const submit = async () => {
        setSubmitting(true);
        setError(null);
        try {
            const { date, time } = formData;
            if (!date || !time) throw new Error('Please select a new date and time');

            const payload = { 
                date, 
                time,
                user_session_id: sessionId,
                dentist_id: formData.dentist_id,
            };
            
            const response = await api.patch(`/appointments/${appointmentId}/reschedule`, payload, token);
            
            if (response.rescheduled === false) {
                throw new Error(response.message || 'Slot is no longer available. Please choose another time.');
            }

            setResult({ success: true, data: response });

            // ✅ Proactively refresh application state to eliminate realtime latency
            if (typeof refreshAppts === 'function') refreshAppts();
            if (typeof refreshNotifs === 'function') refreshNotifs();

            nextStep(); // go to success
            
            // Release hold after successful reschedule
            if (slotHold.activeHold) {
                await slotHold.releaseHold();
            }

            // Cleanup storage
            localStorage.removeItem(STATE_KEY);
            localStorage.removeItem(SESSION_KEY);
        } catch (err) {
            setError(err.message || 'Failed to reschedule appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const reset = async () => {
        if (slotHold?.releaseHold) {
            await slotHold.releaseHold().catch(() => {});
        }
        
        localStorage.removeItem(STATE_KEY);
        localStorage.removeItem(SESSION_KEY);

        setStep(1);
        setFormData({
            date: '',
            time: '',
            dentist_id: originalAppointment?.is_dentist_preferred ? (originalAppointment.dentist_id || '') : '',
        });
        setError(null);
        setResult(null);
    };

    return {
        sessionId,
        step,
        currentStep,
        formData,
        error,
        submitting,
        result,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        submit,
        reset,
        slotHold,
    };
};

export default useUserReschedule;
