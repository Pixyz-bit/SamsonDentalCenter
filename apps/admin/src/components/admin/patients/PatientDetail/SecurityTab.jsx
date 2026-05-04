import React from 'react';
import { User, Mail, Loader2, ShieldAlert, ShieldOff, ShieldCheck } from 'lucide-react';
import { Button } from '../../../ui';

const SecurityTab = ({ 
    patient, 
    loadingLink, 
    linkStatus, 
    isRestricting, 
    isDeactivating, 
    handleSendSetupLink, 
    handleToggleRestriction, 
    handleDeactivateAccount 
}) => {
    return (
        <div className='space-y-6 sm:space-y-8 animate-in fade-in duration-300'>
            {/* Card 1: Portal Access & Authentication */}
            <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Portal Access Control
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                            Patient authentication and account lifecycle
                        </p>
                    </div>
                    <div className='flex items-center gap-3'>
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${patient.is_registered && patient.is_active !== false ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50'}`}>
                            {patient.is_registered && patient.is_active !== false ? 'Portal Active' : 'Access Pending'}
                        </span>
                    </div>
                </div>

                <div className='p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01] flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                    <div className='max-w-xl'>
                        <p className='text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2'>
                            Registration Status
                        </p>
                        <p className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-wide opacity-80'>
                            {patient.is_registered && patient.is_active !== false
                                ? 'This profile is linked to a verified patient account. The user has full access to the online booking portal.' 
                                : 'This is a management-only profile. Send a secure setup link to the patient\'s registered email to enable portal access.'}
                        </p>
                        {linkStatus && (
                            <div className={`mt-4 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${linkStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                {linkStatus.message}
                            </div>
                        )}
                        {!patient.email && !patient.is_registered && (
                            <div className='mt-4 flex items-center gap-2 text-red-500'>
                                <ShieldAlert size={14} />
                                <p className='text-[9px] font-black uppercase tracking-widest italic'>Email Required for Setup</p>
                            </div>
                        )}
                    </div>

                    {!patient.is_registered && (
                        <Button 
                            onClick={handleSendSetupLink}
                            disabled={loadingLink || !patient.email}
                            className='h-11 sm:h-14 px-6 sm:px-8 bg-brand-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 flex items-center gap-3 rounded-xl'
                        >
                            {loadingLink ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
                            <span>Send Setup Invitation</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Administrative Guardrails */}
            <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Administrative Guardrails
                        </h4>
                        <p className='text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 font-bold'>
                            Security overrides and behavioral restrictions
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className={`p-6 rounded-2xl border transition-all ${patient.is_booking_restricted ? 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-gray-50/20 dark:bg-white/[0.01] border-gray-200 dark:border-white/5'}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${patient.is_booking_restricted ? 'text-red-600' : 'text-gray-400'}`}>
                            <ShieldAlert size={14} /> Booking Restriction
                        </h4>
                        <p className={`text-[11px] font-bold uppercase leading-relaxed mb-8 tracking-wide ${patient.is_booking_restricted ? 'text-red-700 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 opacity-70'}`}>
                            {patient.is_booking_restricted 
                                ? 'This patient is currently flagged. Online scheduling capabilities are revoked across all services.' 
                                : 'Enable this to prevent the patient from selecting slots or submitting new requests via the portal.'}
                        </p>
                        <Button 
                            variant='outline' 
                            onClick={handleToggleRestriction}
                            disabled={isRestricting}
                            className={`h-11 sm:h-12 w-full text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border ${patient.is_booking_restricted ? 'bg-red-600 border-red-600 text-white hover:bg-red-700' : 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10'}`}
                        >
                            {isRestricting ? <Loader2 size={16} className="animate-spin" /> : patient.is_booking_restricted ? 'Lift Restriction' : 'Restrict Online Booking'}
                        </Button>
                    </div>

                    <div className={`p-6 rounded-2xl border transition-all ${patient.is_active === false ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 shadow-lg shadow-amber-500/5' : 'bg-gray-50/20 dark:bg-white/[0.01] border-gray-200 dark:border-white/5'}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 ${patient.is_active === false ? 'text-amber-600' : 'text-gray-400'}`}>
                            {patient.is_active !== false ? <ShieldOff size={14} /> : <ShieldCheck size={14} />} 
                            Account Lifespan
                        </h4>
                        <p className={`text-[11px] font-bold uppercase leading-relaxed mb-8 tracking-wide ${patient.is_active === false ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400 opacity-70'}`}>
                            {patient.is_active !== false 
                                ? 'Deactivating this account will immediately revoke all portal session tokens and prevent future login attempts.' 
                                : 'Account is currently dormant. Reactivation will restore previous credentials and medical history access.'}
                        </p>
                        <Button 
                            variant='outline' 
                            onClick={handleDeactivateAccount}
                            disabled={isDeactivating}
                            className={`h-11 sm:h-12 w-full text-[10px] font-black uppercase tracking-widest transition-all rounded-xl border ${
                                patient.is_active !== false 
                                    ? 'border-gray-200 text-gray-500 hover:bg-red-600 hover:text-white hover:border-red-600' 
                                    : 'border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                            }`}
                        >
                            {isDeactivating ? <Loader2 size={16} className="animate-spin" /> : patient.is_active !== false ? 'Deactivate Account' : 'Reactivate Account'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;
