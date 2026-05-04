import React from 'react';
import { Phone, Mail, Calendar, AlertCircle, CheckCircle2, User, UserSearch, ShieldCheck } from 'lucide-react';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';

const DuplicateResolver = ({ 
    formData, 
    duplicates, 
    otp, 
    setOtp, 
    otpSent, 
    setOtpSent, 
    handleSendOtp, 
    handleCreatePatient, 
    loading, 
    selectedPrimaryId
}) => {
    const hasPhoneConflict = duplicates.some(d => d.phone?.includes(formData.phone.replace(/\D/g, '')));
    const hasEmailConflict = duplicates.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase());

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* 1. New Entry Reference (Horizontal Banner) */}
            <div className="p-5 rounded-2xl bg-brand-500/[0.03] border border-brand-500/10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black shadow-lg shadow-brand-500/20 shrink-0">
                            <UserSearch size={20} />
                        </div>
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-brand-500/60 leading-none mb-1.5">New Patient Data</h5>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                {formData.first_name} {formData.middle_name ? `${formData.middle_name} ` : ''}{formData.last_name} {formData.suffix || ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-10 gap-y-2">
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">DOB</span>
                            <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-brand-500/50" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{formData.date_of_birth || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Phone</span>
                            <div className="flex items-center gap-2">
                                <Phone size={12} className="text-brand-500/50" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{formData.phone}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Email</span>
                            <div className="flex items-center gap-2">
                                <Mail size={12} className="text-brand-500/50" />
                                <span className={`text-xs font-bold ${duplicates.some(d => d.email?.toLowerCase() === formData.email?.toLowerCase()) ? 'text-error-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {formData.email || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. High-Density Comparison Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                        Similar Patients Found
                        <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-black">{duplicates.length}</span>
                    </h5>
                    <div className="flex items-center gap-2">
                        {hasPhoneConflict && (
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 flex items-center gap-2">
                                <AlertCircle size={12} /> Phone Conflict
                            </p>
                        )}
                        {hasEmailConflict && (
                            <p className="text-[10px] font-bold text-error-500 uppercase tracking-widest bg-error-500/10 px-2 py-1 rounded-lg border border-error-500/20 flex items-center gap-2">
                                <AlertCircle size={12} /> Email Conflict
                            </p>
                        )}
                    </div>
                </div>

                <div className="border border-gray-100 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.02] shadow-sm overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                                <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">First Name</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Middle</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Last Name</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Suffix</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">DOB</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</th>
                                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {duplicates.map((dup) => {
                                const isEmailMatch = formData.email && dup.email?.toLowerCase() === formData.email?.toLowerCase();
                                const isPhoneMatch = formData.phone && dup.phone?.includes(formData.phone.replace(/\D/g, ''));
                                const isDobMatch = formData.date_of_birth && dup.date_of_birth === formData.date_of_birth;
                                const isFirstNameMatch = formData.first_name?.toLowerCase() === dup.first_name?.toLowerCase();
                                const isLastNameMatch = formData.last_name?.toLowerCase() === dup.last_name?.toLowerCase();

                                return (
                                    <tr key={dup.id} className={`group transition-colors ${isEmailMatch ? 'bg-error-500/[0.02]' : isPhoneMatch ? 'bg-amber-500/[0.02]' : 'hover:bg-gray-50/50 dark:hover:bg-white/5'}`}>
                                        <td className="px-5 py-4 min-w-[120px]">
                                            <span className={`text-xs font-bold ${isFirstNameMatch ? 'text-brand-600 dark:text-brand-400 bg-brand-500/5 px-1.5 py-0.5 rounded border border-brand-500/10' : 'text-gray-900 dark:text-white'}`}>
                                                {dup.first_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-medium text-gray-500">{dup.middle_name || '—'}</span>
                                        </td>
                                        <td className="px-4 py-4 min-w-[120px]">
                                            <span className={`text-xs font-bold ${isLastNameMatch ? 'text-brand-600 dark:text-brand-400 bg-brand-500/5 px-1.5 py-0.5 rounded border border-brand-500/10' : 'text-gray-900 dark:text-white'}`}>
                                                {dup.last_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-medium text-gray-500">{dup.suffix || '—'}</span>
                                        </td>
                                        <td className="px-4 py-4 min-w-[100px]">
                                            <span className={`text-xs font-bold ${isDobMatch ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600'}`}>
                                                {dup.date_of_birth || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 min-w-[120px]">
                                            <span className={`text-xs font-bold ${isPhoneMatch ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600'}`}>
                                                {dup.phone || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 min-w-[180px]">
                                            <span className={`text-xs font-bold ${isEmailMatch ? 'text-error-600 dark:text-error-400 underline decoration-error-500/30' : 'text-gray-600'} truncate block max-w-[160px]`}>
                                                {dup.email || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right min-w-[160px]">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button 
                                                    size="xs"
                                                    variant="outline"
                                                    onClick={() => window.open(`/patients/profile/${dup.id}`, '_blank')}
                                                    className="rounded-lg h-8 px-3 text-[10px] font-black uppercase border-gray-200 dark:border-white/10 group-hover:border-brand-500 group-hover:text-brand-500 transition-all"
                                                >
                                                    View Existing Profile
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Conditional Resolution Blocks (Stacked) */}
                <div className="space-y-4">
                    {duplicates.find(d => d.email?.toLowerCase() === formData.email?.toLowerCase() && !d.is_registered) && (
                        <div className="p-5 rounded-2xl bg-error-50 dark:bg-error-500/5 border border-error-100 dark:border-error-500/10">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-error-500 text-white flex items-center justify-center shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h6 className="text-sm font-bold text-error-900 dark:text-error-100 mb-1">Strict Email Conflict</h6>
                                    <p className="text-xs text-error-800/80 dark:text-error-200/80 leading-relaxed font-medium">
                                        The email <span className="font-black underline">{formData.email}</span> is already in use by an unverified profile. 
                                        Registration is <strong>Blocked</strong> to prevent data corruption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {otpSent && (
                        <div className="p-6 rounded-3xl bg-green-50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h6 className="text-base font-bold text-green-900 dark:text-green-100 uppercase tracking-tight">Verification Required</h6>
                                    <p className="text-xs text-green-800/70 dark:text-green-200/70 font-medium">
                                        Enter the security code sent to the primary account to authorize this link.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full max-w-[200px]">
                                    <Input 
                                        placeholder="OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="text-center font-black tracking-widest text-lg h-12 rounded-2xl border-green-200 focus:ring-green-500"
                                    />
                                </div>
                                <Button 
                                    onClick={() => handleCreatePatient(selectedPrimaryId, 'LINK_DEPENDENT')}
                                    disabled={!otp || loading}
                                    loading={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 py-4 rounded-2xl font-black uppercase tracking-widest"
                                >
                                    Confirm & Link
                                </Button>
                                <button onClick={() => setOtpSent(false)} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancel Linkage</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuplicateResolver;
