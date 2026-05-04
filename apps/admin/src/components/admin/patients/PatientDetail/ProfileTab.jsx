import React from 'react';
import { Mail, Phone, Edit3, Camera } from 'lucide-react';
import { Button } from '../../../../components/ui';

const ProfileTab = ({ patient, onEditAvatar, onEditProfile, onEditContact }) => {
    const getInitials = () => {
        const first = patient.first_name?.[0] || patient.full_name?.[0] || 'U';
        const last = patient.last_name?.[0] || '';
        return (first + last).toUpperCase();
    };

    return (
        <div className='space-y-6'>
            {/* Card 1: Identity Card (Moved from Parent Header) - Inspired by UserMetaCard */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                <div className='flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between'>
                    <div className='flex flex-col items-center w-full gap-6 xl:flex-row xl:items-center'>
                        <div 
                            onClick={onEditAvatar}
                            className='w-20 h-20 overflow-hidden border border-gray-200 rounded-2xl dark:border-gray-800 flex items-center justify-center bg-gray-50 dark:bg-white/5 relative group cursor-pointer'
                        >
                            {patient.avatar_url ? (
                                <img src={patient.avatar_url} alt={patient.full_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xl'>
                                    {getInitials()}
                                </div>
                            )}
                            <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                                <div className='bg-white/20 backdrop-blur-sm p-1.5 rounded-lg border border-white/30'>
                                    <Camera size={18} className='text-white' />
                                </div>
                            </div>
                        </div>
                        <div className='text-center xl:text-left'>
                            <h4 className='mb-1 text-[clamp(18px,2.2vw,22px)] font-bold text-gray-900 dark:text-white font-outfit uppercase tracking-tight'>
                                {patient.full_name}
                            </h4>
                            <div className='flex flex-col items-center gap-2 text-center xl:flex-row xl:gap-3 xl:text-left'>
                                <p className='text-[clamp(13px,1.2vw,14px)] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-widest'>
                                    Patient Registry
                                </p>
                                <div className='hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block'></div>
                                <span className={`px-2 py-0.5 rounded-lg text-[clamp(11px,1vw,12px)] font-bold uppercase tracking-wider ${patient.is_registered && patient.is_active !== false ? 'bg-success-100 text-success-600 dark:bg-success-500/10 dark:text-success-400' : patient.email ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500'}`}>
                                    {patient.is_registered && patient.is_active !== false ? 'Active Account' : patient.email ? 'Inactive Account' : 'Offline Profile'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant='outline'
                        onClick={onEditAvatar}
                        className='h-11 px-6 text-[11px] font-black uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all shadow-sm shrink-0'
                    >
                        <Camera size={16} className='mr-2' /> Edit Avatar
                    </Button>
                </div>

                {/* Inline Metadata for Profile Tab */}
                <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex flex-wrap gap-6'>
                        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                            <Mail size={16} className='text-gray-400' /> {patient.email || 'No email set'}
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-medium'>
                            <Phone size={16} className='text-gray-400' /> {patient.phone || 'No phone set'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Personal Information - Inspired by UserInfoCard */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                    <div className="flex-1">
                        <h4 className='text-[clamp(16px,2vw,18px)] font-bold text-gray-900 dark:text-white lg:mb-6 mb-4 font-outfit uppercase tracking-tight'>
                            Personal Information
                        </h4>

                        <div className='grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8'>
                            <div>
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>Last Name</p>
                                <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient?.last_name || '—'}</p>
                            </div>
                            <div>
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>First Name</p>
                                <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient?.first_name || '—'}</p>
                            </div>
                            <div>
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>Middle Name</p>
                                <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient?.middle_name || '—'}</p>
                            </div>
                            <div>
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>Suffix</p>
                                <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient?.suffix || '—'}</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant='outline'
                        onClick={onEditProfile}
                        className='flex items-center justify-center gap-2 rounded-xl h-12 w-full lg:w-48 text-[11px] font-black uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all shadow-sm'
                    >
                        <Edit3 size={14} />
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Card 3: Contact Information - Inspired by UserContactCard */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03]'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
                    <div className="flex-1">
                        <h4 className='text-[clamp(16px,2vw,18px)] font-bold text-gray-900 dark:text-white lg:mb-6 mb-4 font-outfit uppercase tracking-tight'>
                            Contact Information
                        </h4>

                        <div className='grid grid-cols-1 gap-y-5 sm:grid-cols-2 lg:gap-x-12'>
                            <div className="sm:col-span-1">
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>Email Address</p>
                                <p className='text-sm font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2'>
                                    <Mail size={16} className="text-brand-500" />
                                    {patient?.email || 'N/A'}
                                </p>
                            </div>
                            <div className="sm:col-span-1">
                                <p className='mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400'>Phone Number</p>
                                <p className='text-sm font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2'>
                                    <Phone size={16} className="text-brand-500" />
                                    {patient?.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant='outline'
                        onClick={onEditContact}
                        className='flex items-center justify-center gap-2 rounded-xl h-12 w-full lg:w-48 text-[11px] font-black uppercase tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all shadow-sm'
                    >
                        <Edit3 size={16} />
                        Edit Contact
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
