import React, { useState } from 'react';
import { UserSearch, Mail, CheckCircle2, AlertCircle, Loader2, Link2, Search, ChevronRight, User, Phone } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import Button from '../../../ui/Button';
import { api } from '../../../../utils/api';

const AddDependencyModal = ({ isOpen, onClose, primaryPatient, token, onSuccess }) => {
    const [step, setStep] = useState('relationship'); // 'relationship' | 'search' | 'otp'
    const [relationship, setRelationship] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState('');

    const relationships = ['Child', 'Spouse', 'Parent', 'Sibling', 'Guardian', 'Other'];

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.get(`/admin/patients?search=${searchQuery}`, token);
            setSearchResults(data.patients || []);
            if (data.patients?.length === 0) {
                setError('No patients found matching your search.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/admin/patients/${primaryPatient.id}/request-dependency-consent`, {
                dependent_id: selectedPatient.id,
                relationship: relationship
            }, token);
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndLink = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/admin/patients/${primaryPatient.id}/verify-dependency-consent`, {
                otp: otp
            }, token);
            onSuccess();
            onClose();
            resetModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setStep('relationship');
        setRelationship('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedPatient(null);
        setError(null);
        setOtp('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const renderFooter = () => {
        if (step === 'relationship') {
            return (
                <>
                    <Button variant='outline' onClick={handleClose}>Cancel</Button>
                    <Button 
                        disabled={!relationship} 
                        onClick={() => setStep('search')}
                        className="px-8 shadow-lg shadow-brand-500/20"
                    >
                        Continue
                        <ChevronRight size={16} className="ml-2" />
                    </Button>
                </>
            );
        }
        if (step === 'search') {
            return (
                <>
                    <Button variant='outline' onClick={() => setStep('relationship')}>Back</Button>
                    {selectedPatient ? (
                        <Button 
                            onClick={handleSendOtp} 
                            loading={loading}
                            className="px-8 bg-brand-500 shadow-lg shadow-brand-500/20"
                        >
                            Send Authorization OTP
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSearch} 
                            loading={loading} 
                            disabled={!searchQuery}
                            className="px-8"
                        >
                            <Search size={16} className="mr-2" />
                            Search
                        </Button>
                    )}
                </>
            );
        }
        if (step === 'otp') {
            return (
                <>
                    <Button variant='outline' onClick={() => setStep('search')} disabled={loading}>Back</Button>
                    <Button 
                        onClick={handleVerifyAndLink} 
                        loading={loading} 
                        disabled={otp.length !== 6}
                        className="px-8 bg-success-600 hover:bg-success-700 shadow-lg shadow-success-500/20"
                    >
                        Verify & Link
                    </Button>
                </>
            );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Family Dependent"
            subtitle={primaryPatient ? `Linking a new member to ${primaryPatient.full_name}'s account.` : "Connect family members together."}
            footer={renderFooter()}
            className="max-w-xl"
        >
            <div className='space-y-6'>
                {error && (
                    <div className='p-4 bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20 rounded-2xl flex items-center gap-3 text-error-600 dark:text-error-400 text-xs animate-in fade-in slide-in-from-top-2'>
                        <AlertCircle size={16} className="shrink-0" />
                        <p className='font-bold uppercase tracking-tight'>{error}</p>
                    </div>
                )}

                {step === 'relationship' && (
                    <div className='space-y-4'>
                        <div className='p-5 rounded-2xl bg-brand-500/[0.03] border border-brand-500/10 flex items-start gap-4'>
                            <div className='w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20'>
                                <Link2 size={20} />
                            </div>
                            <div>
                                <h6 className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1'>Step 1: Define Relationship</h6>
                                <p className='text-[11px] text-gray-500 font-medium leading-relaxed'>
                                    Select how this dependent is related to the primary account holder.
                                </p>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            {relationships.map(rel => (
                                <button
                                    key={rel}
                                    onClick={() => setRelationship(rel)}
                                    className={`p-4 rounded-xl border-2 transition-all text-left group ${
                                        relationship === rel 
                                            ? 'border-brand-500 bg-brand-500/5' 
                                            : 'border-gray-100 dark:border-white/5 hover:border-brand-500/30'
                                    }`}
                                >
                                    <p className={`text-xs font-black uppercase tracking-widest ${relationship === rel ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        {rel}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 'search' && (
                    <div className='space-y-6'>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Search Patient Profile</label>
                            <div className='relative'>
                                <Search size={18} className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400' />
                                <input
                                    type='text'
                                    placeholder='Search by name, phone or email...'
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSelectedPatient(null);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className='w-full h-14 pl-14 pr-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-sm font-bold'
                                />
                            </div>
                        </div>

                        {searchResults.length > 0 && !selectedPatient && (
                            <div className='space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1'>
                                {searchResults.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPatient(p)}
                                        className='w-full p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:border-brand-500/50 transition-all text-left bg-white dark:bg-white/[0.02] flex items-center justify-between group'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center'>
                                                <User size={18} className='text-gray-400 group-hover:text-brand-500' />
                                            </div>
                                            <div>
                                                <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>{p.full_name}</p>
                                                <div className='flex items-center gap-3 mt-1'>
                                                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1'>
                                                        <Phone size={10} /> {p.phone || 'No phone'}
                                                    </p>
                                                    {p.email && (
                                                        <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1'>
                                                            <Mail size={10} /> {p.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className='text-gray-300 group-hover:text-brand-500' />
                                    </button>
                                ))}
                            </div>
                        )}

                        {!selectedPatient && searchQuery && !loading && (
                            <div className='p-8 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 text-center space-y-4'>
                                <div className='w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 flex items-center justify-center mx-auto'>
                                    <UserSearch size={24} />
                                </div>
                                <div className='space-y-1'>
                                    <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Profile Not Found?</p>
                                    <p className='text-[11px] text-gray-500 font-medium px-4'>If the patient is new to the clinic, you can create a new record for them.</p>
                                </div>
                                <Button 
                                    variant='outline' 
                                    onClick={() => window.location.href = '/patients'} // Or trigger AddPatientModal
                                    className='text-[10px] font-black uppercase tracking-widest h-9 px-6'
                                >
                                    Quick Register New Patient
                                </Button>
                            </div>
                        )}

                        {selectedPatient && (
                            <div className='p-6 rounded-2xl bg-brand-500/5 border-2 border-brand-500/20 space-y-4 animate-in zoom-in-95 duration-300'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-4'>
                                        <div className='w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20'>
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h6 className='text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight'>{selectedPatient.full_name}</h6>
                                            <p className='text-[10px] text-brand-600 dark:text-brand-400 font-black uppercase tracking-[0.2em] mt-0.5'>Selected Dependent</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedPatient(null)}
                                        className='text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-error-500 transition-colors'
                                    >
                                        Change
                                    </button>
                                </div>
                                
                                <div className='pt-4 border-t border-brand-500/10 flex items-center justify-between'>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Relationship</p>
                                    <p className='text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-tight'>{relationship}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 'otp' && (
                    <div className='space-y-8 py-4'>
                        <div className='text-center space-y-4'>
                            <div className='w-20 h-20 rounded-[2.5rem] bg-success-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-success-500/20'>
                                <CheckCircle2 size={36} />
                            </div>
                            <div className='space-y-2'>
                                <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight'>Authorization Required</h3>
                                <p className='text-xs text-gray-500 font-bold px-8 leading-relaxed'>
                                    A verification code has been sent to the primary email <span className='text-brand-500'>{primaryPatient.email}</span> to authorize this linkage.
                                </p>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Enter 6-Digit OTP</label>
                            <input 
                                type='text'
                                placeholder='000000'
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className='w-full h-20 text-center text-4xl font-black tracking-[1em] rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-success-500 transition-all outline-none text-gray-900 dark:text-white'
                            />
                        </div>
                        
                        <div className='p-4 rounded-xl bg-brand-50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 flex items-start gap-3'>
                            <AlertCircle size={18} className='text-brand-500 shrink-0 mt-0.5' />
                            <p className='text-[11px] text-brand-800 dark:text-brand-400 font-bold leading-relaxed uppercase tracking-tight'>
                                This ensures the primary account holder approves managing this patient's records and appointments.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AddDependencyModal;
