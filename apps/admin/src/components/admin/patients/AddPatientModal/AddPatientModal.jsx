import React, { useState, useRef } from 'react';
import { UserCheck, ArrowRight, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { api } from '../../../../utils/api';
import { Modal } from '../../../ui/Modal';
import Button from '../../../ui/Button';

// Sub-components
import RegistrationForm from './RegistrationForm';
import DuplicateResolver from './DuplicateResolver';
import SuccessState from './SuccessState';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded, token }) => {
    const scrollRef = useRef(null);
    const [step, setStep] = useState('form'); // 'form' | 'duplicates' | 'success'
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        email: '',
        phone: '',
        date_of_birth: '',
    });
    const [duplicates, setDuplicates] = useState([]);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [createdPatient, setCreatedPatient] = useState(null);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [selectedPrimaryId, setSelectedPrimaryId] = useState(null);

    const validateForm = () => {
        const errors = {};
        const nameRegex = /^[A-Za-z\s.'-]+$/; // No numbers allowed

        if (!formData.first_name) errors.first_name = 'First name is required';
        else if (!nameRegex.test(formData.first_name)) errors.first_name = 'Numbers are not allowed in names';

        if (!formData.last_name) errors.last_name = 'Last name is required';
        else if (!nameRegex.test(formData.last_name)) errors.last_name = 'Numbers are not allowed in names';

        if (formData.middle_name && !nameRegex.test(formData.middle_name)) {
            errors.middle_name = 'Numbers are not allowed in names';
        }

        if (!formData.date_of_birth) {
            errors.date_of_birth = 'Date of birth is required';
        } else {
            const selectedDate = new Date(formData.date_of_birth);
            const today = new Date();
            if (selectedDate > today) {
                errors.date_of_birth = 'Date of birth cannot be in the future';
            }
        }

        if (!formData.phone) {
            errors.phone = 'Phone number is required for registration';
        }

        if (formData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Please provide a valid email address';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
        if (error) setError(null);
    };

    const handleCheckDuplicates = async (e) => {
        if (e) e.preventDefault();
        
        const errors = {};
        const nameRegex = /^[A-Za-z\s.'-]+$/;
        if (!formData.first_name) errors.first_name = 'First name is required';
        else if (!nameRegex.test(formData.first_name)) errors.first_name = 'Numbers are not allowed in names';
        if (!formData.last_name) errors.last_name = 'Last name is required';
        else if (!nameRegex.test(formData.last_name)) errors.last_name = 'Numbers are not allowed in names';
        if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
        if (!formData.phone) errors.phone = 'Phone number is required';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please correct the highlighted fields before continuing.');
            
            setTimeout(() => {
                const firstErrorField = Object.keys(errors)[0];
                const element = document.getElementById(firstErrorField);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus({ preventScroll: true });
                }
            }, 10);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const query = new URLSearchParams({
                first_name: formData.first_name,
                last_name: formData.last_name,
                date_of_birth: formData.date_of_birth,
                phone: formData.phone,
                email: formData.email,
            }).toString();

            const response = await api.get(`/admin/patients/check-duplicates?${query}`, token);
            
            if (response.duplicates && response.duplicates.length > 0) {
                setDuplicates(response.duplicates);
                setStep('duplicates');
            } else {
                await handleCreatePatient();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePatient = async (primaryProfileId = null, resolution = null) => {
        setLoading(true);
        setError(null);
        try {
            const data = { ...formData };
            if (primaryProfileId) {
                data.primary_profile_id = primaryProfileId;
                data.resolution = resolution || 'LINK_DEPENDENT';
                data.otp = otp;
                data.email = null;
            }
            const response = await api.post('/admin/walk-in/quick', data, token);
            setCreatedPatient(response.patient);
            setStep('success');
            if (onPatientAdded) onPatientAdded(response.patient);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (profileId) => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/admin/patients/${profileId}/send-setup-link`, {}, token);
            setOtpSent(true);
            setSelectedPrimaryId(profileId);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetAndClose = () => {
        setStep('form');
        setFormData({
            first_name: '', last_name: '', middle_name: '',
            suffix: '', email: '', phone: '', date_of_birth: '',
        });
        setDuplicates([]);
        setError(null);
        setFieldErrors({});
        setCreatedPatient(null);
        setOtp('');
        setOtpSent(false);
        setSelectedPrimaryId(null);
        onClose();
    };

    const ModalFooter = (
        <>
            {step === 'form' ? (
                <>
                    <Button variant="outline" onClick={resetAndClose} disabled={loading}>Cancel</Button>
                    <Button 
                        onClick={handleCheckDuplicates} 
                        loading={loading}
                        className="px-8 shadow-lg shadow-brand-500/20"
                    >
                        Verify & Continue
                    </Button>
                </>
            ) : step === 'duplicates' ? (
                <div className="flex w-full items-center justify-between">
                    <Button variant="outline" onClick={() => setStep('form')} className="border-none shadow-none text-gray-500 font-bold">
                        Back to Edit
                    </Button>
                    <Button 
                        onClick={() => handleCreatePatient()} 
                        loading={loading}
                        disabled={duplicates.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase())}
                        className="shadow-xl shadow-brand-500/25 px-8 font-black uppercase tracking-tight disabled:bg-gray-200 disabled:shadow-none"
                    >
                        Register as New Patient
                        <ArrowRight size={18} className="ml-2" />
                    </Button>
                </div>
            ) : (
                <div className="flex w-full gap-3">
                    <Button 
                        onClick={() => {
                            window.location.href = `/patients/profile/${createdPatient?.id}`;
                            resetAndClose();
                        }}
                        className="flex-1"
                    >
                        <UserCheck size={20} className="mr-2" />
                        Open Profile
                    </Button>
                    <Button variant="outline" onClick={resetAndClose}>Close</Button>
                </div>
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            title={step === 'form' ? "New Patient Registration" : step === 'duplicates' ? "Possible Duplicate Detected" : "Registration Complete"}
            subtitle={step === 'form' ? "Complete the details below to create a patient profile." : step === 'duplicates' ? "We found existing patients with similar details. Please review before creating a new record." : "The patient has been successfully added to the system."}
            footer={ModalFooter}
            className={step === 'duplicates' ? "max-w-6xl" : "max-w-2xl"}
        >
            <div ref={scrollRef} className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {error && (
                    <div className="p-4 bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20 rounded-2xl flex items-start gap-3 text-error-600 dark:text-error-400 text-sm animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {step === 'form' && (
                    <RegistrationForm 
                        formData={formData}
                        handleInputChange={handleInputChange}
                        fieldErrors={fieldErrors}
                    />
                )}

                {step === 'duplicates' && (
                    <DuplicateResolver 
                        formData={formData}
                        duplicates={duplicates}
                        otp={otp}
                        setOtp={setOtp}
                        otpSent={otpSent}
                        setOtpSent={setOtpSent}
                        handleSendOtp={handleSendOtp}
                        handleCreatePatient={handleCreatePatient}
                        loading={loading}
                        selectedPrimaryId={selectedPrimaryId}
                    />
                )}

                {step === 'success' && (
                    <SuccessState createdPatient={createdPatient} />
                )}
            </div>
        </Modal>
    );
};

export default AddPatientModal;
