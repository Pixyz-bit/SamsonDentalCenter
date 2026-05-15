import React from 'react';
import { Mail, Phone, Camera } from 'lucide-react';
import { Button } from '../../ui';

const ProfileTab = ({ patient }) => {
    const getInitials = () => {
        const first = patient.first_name?.[0] || patient.full_name?.[0] || 'U';
        const last = patient.last_name?.[0] || '';
        return (first + last).toUpperCase();
    };

    return (
        <div className='space-y-4 sm:space-y-6 animate-in fade-in duration-300'>
            {/* Card 1: Identity Summary */}
            <div className='w-full p-4 sm:p-6 border border-gray-100 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                    <div>
                        <h4 className='text-sm sm:text-base font-bold text-[#0B1120] dark:text-white uppercase tracking-wider font-outfit'>
                            Patient Demographics
                        </h4>
                        <p className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400'>
                            Core identity and registry management
                        </p>
                    </div>
                    <Button
                        variant='outline'
                        className='h-9 sm:h-10 px-4 sm:px-5 text-[10px] sm:text-xs font-black tracking-widest hover:border-brand-500 hover:text-brand-500 transition-all shadow-sm shrink-0 flex items-center gap-2 rounded-xl'
                    >
                        <Camera size={14} />
                        <span>Update Avatar</span>
                    </Button>
                </div>

                <div className='flex flex-col xl:flex-row gap-6 items-center xl:items-start'>
                    {/* Avatar Display */}
                    <div className='w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 border-white dark:border-gray-800 rounded-2xl shadow-lg flex items-center justify-center bg-gray-50 dark:bg-white/5 relative group shrink-0'>
                        {patient.avatar_url ? (
                            <img src={patient.avatar_url} alt={patient.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-xl sm:text-2xl font-outfit'>
                                {getInitials()}
                            </div>
                        )}
                    </div>
 
                    {/* Quick Metadata Grid */}
                    <div className='flex-grow w-full space-y-4'>
                        <div className='text-center xl:text-left'>
                            <h3 className='text-base sm:text-lg font-bold text-[#0B1120] dark:text-white font-outfit truncate'>
                                {patient.full_name}
                            </h3>
                            <div className='flex flex-wrap items-center justify-center xl:justify-start gap-2'>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${patient.is_registered ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400'}`}>
                                    {patient.is_registered ? 'Verified' : 'Guest'}
                                </span>
                                <span className="text-gray-300 dark:text-gray-700 hidden sm:block">•</span>
                                <p className='text-[9px] text-brand-600 dark:text-brand-400 font-black uppercase tracking-widest'>
                                    ID: {patient.id?.slice(0, 8)?.toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            <div className='flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]'>
                                <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 shrink-0'>
                                    <Mail size={14} />
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Primary Email</p>
                                    <p className='text-[10px] sm:text-xs font-bold text-[#0B1120] dark:text-white truncate'>{patient.email || '—'}</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]'>
                                <div className='p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 shrink-0'>
                                    <Phone size={14} />
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Phone Number</p>
                                    <p className='text-[10px] sm:text-xs font-bold text-[#0B1120] dark:text-white truncate'>{patient.phone || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2: Personal Details */}
            <div className='w-full p-4 sm:p-6 border border-gray-100 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                    <div>
                        <h4 className='text-sm sm:text-base font-bold text-[#0B1120] dark:text-white uppercase tracking-wider font-outfit'>
                            Personal Details
                        </h4>
                        <p className='text-[10px] sm:text-xs text-gray-500 dark:text-gray-400'>
                            Full name and naming conventions
                        </p>
                    </div>
                </div>
 
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                    {[
                        { label: 'Last Name', value: patient?.last_name },
                        { label: 'First Name', value: patient?.first_name },
                        { label: 'Middle Name', value: patient?.middle_name },
                        { label: 'Suffix', value: patient?.suffix },
                    ].map((item, idx) => (
                        <div key={idx} className='p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]'>
                            <p className='text-[7px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>{item.label}</p>
                            <p className='text-[10px] sm:text-xs font-bold text-[#0B1120] dark:text-white truncate'>{item.value || '—'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
