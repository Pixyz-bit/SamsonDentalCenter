import { useState, useEffect } from 'react';
import { api } from '../utils/api';

const STEPS = ['service', 'datetime', 'patient_select', 'review'];

const generateSessionId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * Hook to manage Admin-initiated booking for a patient.
 * 
 * @param {Object} primaryPatient - The Primary Patient object
 * @param {string} token - Auth token
 */
const useAdminBooking = (primaryPatient, token) => {
    const [sessionId, setSessionId] = useState(null);
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        service_id: '',
        service_name: '',
        service_tier: '',
        service_duration: '',
        date: '',
        time: '',
        dentist_id: '',
        target_patient_id: primaryPatient.id, // Defaults to the primary patient
        target_patient_name: primaryPatient.full_name || 'Primary Patient',
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

    const goToStep = (index) => {
        if (index <= step) setStep(index);
    };

    const submit = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const body = {
                service_id: formData.service_id,
                date: formData.date,
                time: formData.time,
                dentist_id: formData.dentist_id || null,
                user_session_id: sessionId,
            };

            // Hit the admin-specific endpoint for the selected patient (primary or dependent)
            const response = await api.post(`/admin/patients/${formData.target_patient_id}/book`, body, token);
            
            setResult({
                success: true,
                appointment: response.appointment,
                message: response.message
            });
            setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
            setError(err.message || 'Failed to book appointment');
        }
    };

    const reset = () => {
        setStep(0);
        setFormData({
            service_id: '',
            service_name: '',
            service_tier: '',
            service_duration: '',
            date: '',
            time: '',
            dentist_id: '',
            target_patient_id: primaryPatient.id,
            target_patient_name: primaryPatient.full_name || 'Primary Patient',
        });
        setError(null);
        setResult(null);
        setSessionId(generateSessionId());
    };

    return {
        step,
        currentStep,
        steps: STEPS,
        formData,
        submitting,
        error,
        result,
        updateFields,
        nextStep,
        prevStep,
        goToStep,
        submit,
        reset,
    };
};

export default useAdminBooking;
