import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STEPS = ['datetime', 'review'];

const generateSessionId = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });

/**
 * Manages the admin-side reschedule wizard state.
 * Pre-fills service info from the existing appointment so staff only picks a new date/time.
 *
 * @param {Object} appointment - The existing appointment object
 * @param {string} token       - Auth token
 */
const useAdminReschedule = (appointment, token) => {
    const [sessionId, setSessionId] = useState(null);
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        dentist_id: appointment?.is_dentist_preferred ? (appointment?.dentist_id || '') : '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        setSessionId(generateSessionId());
    }, []);

    const currentStep = STEPS[step];

    const updateFields = (fields) => {
        setError(null);
        setFormData((prev) => ({ ...prev, ...fields }));
    };

    const nextStep = () => {
        if (step < STEPS.length - 1) setStep((s) => s + 1);
    };

    const prevStep = () => {
        if (step > 0) setStep((s) => s - 1);
    };

    const submit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const body = {
                date: formData.date,
                time: formData.time,
                dentist_id: formData.dentist_id || null,
                user_session_id: sessionId,
            };

            const response = await api.patch(
                `/admin/appointments/${appointment.id}/reschedule`,
                body,
                token,
            );

            setResult({
                success: true,
                new_appointment: response.new_appointment,
                message: response.message,
            });
        } catch (err) {
            setError(err.message || 'Failed to reschedule appointment');
        } finally {
            setSubmitting(false);
        }
    };

    const reset = () => {
        setStep(0);
        setFormData({
            date: '',
            time: '',
            dentist_id: appointment?.is_dentist_preferred ? (appointment?.dentist_id || '') : '',
        });
        setError(null);
        setResult(null);
        setSessionId(generateSessionId());
    };

    return {
        step,
        currentStep,
        steps: STEPS,
        sessionId,
        formData,
        submitting,
        error,
        result,
        updateFields,
        nextStep,
        prevStep,
        submit,
        reset,
    };
};

export default useAdminReschedule;
