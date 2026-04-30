import React from 'react';
import { Mail, Phone, Edit3 } from 'lucide-react';
import { Button } from '../../../../components/ui';

const ProfileTab = ({ patient, onEditProfile, onEditContact }) => {
    return (
        <div className='space-y-6'>
            {/* Card 1: Personal Information - Inspired by UserInfoCard */}
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

            {/* Card 2: Contact Information - Inspired by UserContactCard */}
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
