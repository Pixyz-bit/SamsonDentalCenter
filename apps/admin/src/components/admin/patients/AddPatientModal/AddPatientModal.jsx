import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, ArrowRight, AlertCircle, User, CheckCircle2, UserSearch } from 'lucide-react';
import { api } from '../../../../utils/api';
import { Modal } from '../../../ui/Modal';
import Button from '../../../ui/Button';

// Sub-components
import RegistrationForm from './RegistrationForm';
import DuplicateResolver from './DuplicateResolver';
import SuccessState from './SuccessState';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded, token, initialData = null }) => {
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

    // Handle initialData when modal opens
    useEffect(() => {
        if (isOpen && initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [isOpen, initialData]);

    const [duplicates, setDuplicates] = useState([]);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [createdPatient, setCreatedPatient] = useState(null);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [selectedPrimaryId, setSelectedPrimaryId] = useState(initialData?.primary_profile_id || null);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [confirmType, setConfirmType] = useState(null); // null | 'STRIP_EMAIL' | 'LINK_DEPENDENT'

    const [acknowledgedPhoneConflict, setAcknowledgedPhoneConflict] = useState(false);

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
        const hasNameConflict = duplicates.some(d => 
            d.first_name?.toLowerCase() === formData.first_name?.toLowerCase() && 
            d.last_name?.toLowerCase() === formData.last_name?.toLowerCase()
        );
        
        if (!primaryProfileId && !selectedPrimaryId && hasNameConflict && !resolution) {
            setIsConflictModalOpen(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = { ...formData };
            
            // Use passed primaryProfileId or the one from selectedPrimaryId (from initialData)
            const targetPrimaryId = primaryProfileId || selectedPrimaryId;

            if (targetPrimaryId) {
                data.primary_profile_id = targetPrimaryId;
                data.resolution = 'LINK_DEPENDENT';
                // Only require OTP if we ARE NOT already in a secure admin session adding a dependent to a known primary
                // Actually, the API might still require it if it's a strict check.
                if (otp) data.otp = otp;
                
                // If adding as dependent, we might want to strip email if it's the same as primary
                if (data.email === initialData?.email) {
                    data.email = null;
                }
            } else if (resolution === 'FORCE_OFFLINE') {
                data.email = null;
                data.resolution = 'FORCE_OFFLINE';
            } else if (resolution === 'NAME_OVERRIDE' || duplicates.length > 0) {
                data.resolution = 'OVERRIDE';
            }
            
            const response = await api.post('/admin/walk-in/quick', data, token);
            setCreatedPatient(response.patient);
            setStep('success');
            if (onPatientAdded) onPatientAdded(response.patient);
            setIsConflictModalOpen(false);
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
            await api.post(`/admin/patients/${profileId}/request-dependency-consent`, {}, token);
            setOtpSent(true);
            setSelectedPrimaryId(profileId);
            setStep('verification');
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
        setAcknowledgedPhoneConflict(false);
        setConfirmType(null);
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
                        {selectedPrimaryId ? "Add as Dependent" : "Check for Duplicates"}
                    </Button>
                </>
            ) : step === 'duplicates' ? (
                <div className="flex w-full items-center justify-between">
                    <Button variant="outline" onClick={() => setStep('form')} className="border-none shadow-none text-gray-500 font-bold hover:bg-gray-50">
                        Return to change details
                    </Button>
                    
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={() => handleCreatePatient()} 
                            loading={loading}
                            className="shadow-xl shadow-brand-500/25 px-8 font-black uppercase tracking-tight"
                        >
                            Continue Registration
                            <ArrowRight size={18} className="ml-2" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex w-full gap-3">
                    <Button variant="outline" onClick={resetAndClose} className="flex-1">Close</Button>
                    <Button 
                        onClick={() => {
                            window.location.href = `/patients/profile/${createdPatient?.id}`;
                            resetAndClose();
                        }}
                        className="flex-1"
                        startIcon={<UserCheck size={20} />}
                    >
                        Open Patient Profile
                    </Button>
                </div>
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={resetAndClose}
            title={selectedPrimaryId ? "Add New Dependent" : "Create Patient Profile"}
            subtitle={selectedPrimaryId ? "Adding a new member to this family account." : "Ensure the patient doesn't already have an existing profile."}
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

            {/* Conflict Confirmation Modal */}
            <Modal
                isOpen={isConflictModalOpen}
                onClose={() => setIsConflictModalOpen(false)}
                title="Review Similar Records"
                subtitle="We found existing patients with matching names."
                className="max-w-md"
                footer={
                    <>
                        <Button variant="outline" onClick={() => setIsConflictModalOpen(false)}>I need to check</Button>
                        <Button 
                            onClick={() => handleCreatePatient(null, 'NAME_OVERRIDE')}
                            loading={loading}
                            className="bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-600/20 font-black uppercase tracking-widest"
                        >
                            Proceed Registration
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-3xl bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/20">
                        <UserSearch size={32} />
                    </div>
                    <div className="space-y-2">
                        <h6 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Confirm Data Accuracy</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-300 font-bold leading-relaxed px-4">
                            You are about to create a new profile for <span className="text-brand-500">{formData.first_name} {formData.last_name}</span>. 
                            <br/><br/>
                            Have you reviewed the similar records found to ensure this is not a duplicate creation?
                        </p>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
};

export default AddPatientModal;
