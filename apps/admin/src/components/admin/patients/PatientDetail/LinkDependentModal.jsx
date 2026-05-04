import React, { useState } from 'react';
import { UserSearch, Mail, CheckCircle2, AlertCircle, Loader2, Link2, Search } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui';
import { api } from '../../../../utils/api';

const LinkDependentModal = ({ isOpen, onClose, patientId, patientEmail, token, onSuccess }) => {
    const [searchEmail, setSearchEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [foundAccount, setFoundAccount] = useState(null);
    const [error, setError] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');

    const handleSearch = async () => {
        if (!searchEmail) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.get(`/admin/patients/search-by-email?email=${searchEmail}`, token);
            if (data.patient) {
                setFoundAccount(data.patient);
            } else {
                setError('No registered account found with this email.');
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
            await api.post(`/admin/patients/${foundAccount.id}/request-dependency-consent`, {}, token);
            setOtpSent(true);
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
            await api.patch(`/admin/patients/${patientId}`, {
                primary_profile_id: foundAccount.id,
                resolution: 'LINK_DEPENDENT',
                otp: otp
            }, token);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <>
            <Button variant='outline' onClick={onClose} disabled={loading} className="px-8">
                Cancel
            </Button>
            {!foundAccount ? (
                <Button onClick={handleSearch} loading={loading} disabled={!searchEmail} className="px-8 shadow-lg shadow-brand-500/20">
                    <Search size={18} className="mr-2" />
                    Search Account
                </Button>
            ) : !otpSent ? (
                <Button onClick={handleSendOtp} loading={loading} className="bg-brand-500 hover:bg-brand-600 px-8 shadow-lg shadow-brand-500/20">
                    Send Verification Code
                </Button>
            ) : (
                <Button onClick={handleVerifyAndLink} loading={loading} disabled={!otp} className="bg-success-600 hover:bg-success-700 px-8 shadow-lg shadow-success-500/20">
                    Verify & Link
                </Button>
            )}
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Link to Primary Account"
            subtitle="Connect this patient to a registered family head or guardian."
            footer={footer}
            className="max-w-xl"
        >
            <div className='space-y-8'>
                {!foundAccount ? (
                    <div className='space-y-6'>
                        <div className='p-5 rounded-2xl bg-brand-50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10 flex items-start gap-4'>
                            <AlertCircle size={20} className='text-brand-500 shrink-0 mt-0.5' />
                            <p className='text-xs text-brand-700 dark:text-brand-400 font-bold leading-relaxed uppercase tracking-tight'>
                                To link a dependent, you must first find the primary account holder's registered email address.
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>Primary Email Address</label>
                            <div className='relative'>
                                <Mail size={18} className='absolute left-5 top-1/2 -translate-y-1/2 text-gray-400' />
                                <input
                                    type='email'
                                    placeholder='Search by email...'
                                    value={searchEmail}
                                    onChange={(e) => setSearchEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className='w-full h-16 pl-14 pr-5 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white font-bold'
                                />
                            </div>
                        </div>
                    </div>
                ) : !otpSent ? (
                    <div className='space-y-8 py-4'>
                        <div className='flex flex-col items-center text-center space-y-4'>
                            <div className='w-20 h-20 rounded-[2.5rem] bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/20'>
                                <UserSearch size={36} />
                            </div>
                            <div>
                                <h5 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight'>{foundAccount.full_name}</h5>
                                <p className='text-sm text-gray-500 font-bold tracking-tight'>{foundAccount.email}</p>
                            </div>
                        </div>
                        <div className='p-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center text-center space-y-2'>
                            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Verification Required</p>
                            <p className='text-xs text-gray-600 dark:text-gray-300 font-medium px-4'>
                                A security code will be sent to the primary account to authorize this linkage.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='space-y-8 py-4'>
                        <div className='text-center space-y-4'>
                            <div className='w-20 h-20 rounded-[2.5rem] bg-success-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-success-500/20'>
                                <CheckCircle2 size={36} />
                            </div>
                            <div className='space-y-2'>
                                <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight'>Enter Authorization Code</h3>
                                <p className='text-xs text-gray-500 font-bold px-8 leading-relaxed'>
                                    We've sent a 6-digit code to <span className='text-brand-500'>{foundAccount.email}</span>.
                                </p>
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1'>OTP Verification</label>
                            <input 
                                type='text'
                                placeholder='000000'
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className='w-full h-20 text-center text-4xl font-black tracking-[1em] rounded-3xl border-2 border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 focus:border-success-500 transition-all outline-none text-gray-900 dark:text-white'
                            />
                        </div>
                    </div>
                )}

                {error && (
                    <div className='p-4 bg-error-50 dark:bg-error-500/10 border border-error-100 dark:border-error-500/20 rounded-2xl flex items-center gap-3 text-error-600 dark:text-error-400 text-sm animate-in fade-in slide-in-from-top-2'>
                        <AlertCircle size={18} />
                        <p className='font-bold uppercase tracking-tight'>{error}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default LinkDependentModal;
