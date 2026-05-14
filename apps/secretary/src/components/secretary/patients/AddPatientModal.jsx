import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, UserCheck, Users, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../../utils/api';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal';
import Button from '../../ui/Button';

const AddPatientModal = ({ isOpen, onClose, onPatientAdded, token }) => {
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
    const [createdPatient, setCreatedPatient] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError(null);
    };

    const handleCheckDuplicates = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.first_name || !formData.last_name) {
                throw new Error('First and Last names are required.');
            }

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

    const handleCreatePatient = async (primaryProfileId = null) => {
        setLoading(true);
        setError(null);
        try {
            const data = { ...formData };
            if (primaryProfileId) {
                data.primary_profile_id = primaryProfileId;
                data.email = null; // Rule 2: Don't attach email string to dependent row
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

    const resetAndClose = () => {
        setStep('form');
        setFormData({
            first_name: '',
            last_name: '',
            middle_name: '',
            suffix: '',
            email: '',
            phone: '',
            date_of_birth: '',
        });
        setDuplicates([]);
        setError(null);
        setCreatedPatient(null);
        onClose();
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={resetAndClose}
            className="max-w-lg"
        >
            <ModalHeader 
                title={step === 'success' ? 'Success!' : step === 'duplicates' ? 'Verification' : 'Register Walk-In Patient'}
                description={step === 'form' ? 'Create a stub profile for immediate booking' : null}
                onClose={resetAndClose}
            />

            <ModalBody className="max-h-[70vh]">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {step === 'form' && (
                    <form id="add-patient-form" onSubmit={handleCheckDuplicates} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">First Name</label>
                                <input 
                                    required
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Juan"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Last Name</label>
                                <input 
                                    required
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Dela Cruz"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Middle Name</label>
                                <input 
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleInputChange}
                                    placeholder="Optional"
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Suffix</label>
                                <input 
                                    name="suffix"
                                    value={formData.suffix}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Jr."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Date of Birth</label>
                            <input 
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                            <input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="patient@example.com"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                            />
                            <p className="text-[10px] text-gray-400 ml-1 italic">Providing an email allows the patient to link their account later.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                            <input 
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+63 9XX XXX XXXX"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium transition-all"
                            />
                        </div>
                    </form>
                )}

                {step === 'duplicates' && (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4 animate-bounce">
                                <AlertCircle size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Potential Duplicates Found</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                {duplicates.length} existing record(s) match this patient's details.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {duplicates.map((dup) => (
                                <div key={dup.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold uppercase">
                                            {dup.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{dup.full_name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                                {dup.email || 'No email'} • {dup.phone || 'No phone'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => window.open(`/patients/profile/${dup.id}`, '_blank')}
                                            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-500/10 rounded-lg transition-all"
                                            title="View Profile"
                                        >
                                            <ExternalLink size={18} />
                                        </button>
                                        {dup.role === 'patient' && (
                                            <span className="text-[10px] px-2 py-1 bg-brand-500/10 text-brand-500 rounded font-bold">MATCH</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Specialized Dependent Linking Option */}
                        {duplicates.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase()) && (
                            <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-500/10 rounded-2xl border border-brand-100 dark:border-brand-500/20 text-center">
                                <div className="flex justify-center mb-3 text-brand-500">
                                    <Users size={32} />
                                </div>
                                <h5 className="text-sm font-bold text-brand-900 dark:text-brand-100 mb-1">Email Already in Use</h5>
                                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium mb-4 px-2">
                                    The email <span className="font-bold underline">{formData.email}</span> is already associated with <strong>{duplicates.find(d => d.email?.toLowerCase() === formData.email?.toLowerCase())?.full_name}</strong>.
                                    <br/><br/>
                                    You cannot create a separate account. Do you want to add this patient as a <strong>dependent</strong>?
                                </p>
                                <Button 
                                    onClick={() => {
                                        const primary = duplicates.find(d => d.email?.toLowerCase() === formData.email?.toLowerCase());
                                        handleCreatePatient(primary?.id);
                                    }}
                                    className="w-full py-3"
                                >
                                    <Users size={18} className="mr-2" />
                                    Link as Dependent
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {step === 'success' && (
                    <div className="py-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-500 mb-6 scale-110">
                            <CheckCircle2 size={40} />
                        </div>
                        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient Registered!</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-8">
                            Stub profile created successfully for <span className="font-bold text-gray-900 dark:text-white">{createdPatient?.full_name}</span>.
                        </p>
                        
                        <div className="w-full space-y-3">
                            <Button 
                                onClick={() => {
                                    window.location.href = `/patients/profile/${createdPatient?.id}`;
                                    resetAndClose();
                                }}
                                className="w-full py-4"
                            >
                                <UserCheck size={20} className="mr-2" />
                                Go to Profile
                            </Button>
                            <button 
                                onClick={resetAndClose}
                                className="w-full py-4 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </ModalBody>

            {step !== 'success' && (
                <ModalFooter>
                    {step === 'form' ? (
                        <>
                            <Button variant="outline" onClick={resetAndClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" form="add-patient-form" disabled={loading}>
                                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <ArrowRight size={18} className="mr-2" />}
                                Continue
                            </Button>
                        </>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <Button 
                                variant="outline"
                                onClick={() => setStep('form')}
                                disabled={loading}
                            >
                                Go Back
                            </Button>
                            <Button 
                                onClick={() => handleCreatePatient()}
                                disabled={loading || duplicates.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase())}
                                variant={duplicates.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase()) ? 'soft' : 'primary'}
                            >
                                {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : <UserPlus size={18} className="mr-2" />}
                                Create Anyway
                            </Button>
                        </div>
                    )}
                </ModalFooter>
            )}
        </Modal>
    );
};

export default AddPatientModal;
