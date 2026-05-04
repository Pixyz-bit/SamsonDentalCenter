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
        <div className='space-y-6'>
            {/* Account Portal Status */}
            <div className='p-6 rounded-2xl bg-brand-50/50 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-500/10'>
                <h4 className='text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                    <User size={14} /> Portal Access
                </h4>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <div>
                        <p className='text-sm font-bold text-gray-900 dark:text-white'>
                            {patient.is_registered && patient.is_active !== false ? 'Active Account' : 'Inactive Account'}
                        </p>
                        <p className='text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-sm font-medium'>
                            {patient.is_registered && patient.is_active !== false
                                ? 'This patient has a verified account and can book appointments online.' 
                                : 'This is an Inactive Account. Send a setup link to allow the patient to access the portal.'}
                        </p>
                    </div>
                    {!patient.is_registered && (
                        <Button 
                            onClick={handleSendSetupLink}
                            disabled={loadingLink || !patient.email}
                            className='bg-brand-500 text-white font-bold h-11 px-6 text-xs uppercase shadow-lg shadow-brand-500/20'
                        >
                            {loadingLink ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} className='mr-2' />}
                            Send Account Setup Link
                        </Button>
                    )}
                </div>
                {linkStatus && (
                    <p className={`text-[10px] font-bold mt-3 uppercase tracking-wider ${linkStatus.type === 'success' ? 'text-success-600' : 'text-red-500'}`}>
                        {linkStatus.message}
                    </p>
                )}
                {!patient.email && !patient.is_registered && (
                    <p className='text-[10px] text-red-500 font-bold mt-3 italic'>
                        * Email address required to send setup link. Update contact info to proceed.
                    </p>
                )}
            </div>

            {/* Administrative Controls */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='p-6 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10'>
                    <h4 className='text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                        <ShieldAlert size={14} /> Booking Restrictions
                    </h4>
                    <p className='text-[11px] text-red-700 dark:text-red-400 font-medium leading-relaxed mb-4'>
                        Setting a restriction will prevent this patient from booking appointments online.
                    </p>
                    <Button 
                        variant='outline' 
                        onClick={handleToggleRestriction}
                        disabled={isRestricting}
                        className={`h-11 border-red-200 text-red-600 text-xs font-black uppercase hover:bg-red-50 ${patient.is_booking_restricted ? 'bg-red-500 text-white hover:bg-red-600 border-none' : ''}`}
                    >
                        {isRestricting ? <Loader2 size={16} className="animate-spin" /> : patient.is_booking_restricted ? 'Lift Booking Restriction' : 'Restrict Online Booking'}
                    </Button>
                </div>

                <div className='p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10'>
                    <h4 className='text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                        {patient.is_active !== false ? <ShieldOff size={14} /> : <ShieldCheck size={14} />} 
                        Account Security
                    </h4>
                    <p className='text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-4'>
                        {patient.is_active !== false 
                            ? 'Deactivating this account will immediately revoke all portal access for this user.' 
                            : 'Reactivating this account will restore previous portal access and permissions.'}
                    </p>
                    <Button 
                        variant='outline' 
                        onClick={handleDeactivateAccount}
                        disabled={isDeactivating}
                        className={`h-11 text-xs font-black uppercase transition-all ${
                            patient.is_active !== false 
                                ? 'border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                                : 'border-brand-200 text-brand-600 hover:bg-brand-50'
                        }`}
                    >
                        {isDeactivating ? <Loader2 size={16} className="animate-spin" /> : patient.is_active !== false ? 'Deactivate Account' : 'Reactivate Account'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;
