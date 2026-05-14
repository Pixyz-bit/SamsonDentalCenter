import React from 'react';
import PenaltyBadges from '../approvals/PenaltyBadges';
import { Phone, Mail, User as UserIcon, StickyNote, MessageSquare } from 'lucide-react';

const PatientOverview = ({ patient, appointmentNote, completedCount = 0 }) => {
    const isGuest = patient.source === 'GUEST_BOOKING';
    
    return (
        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
            <div className='w-full space-y-5 sm:space-y-6'>
                <div>
                    <h3 className='text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/5'>
                        Patient Profile
                    </h3>
                    <div className='flex items-center gap-4 sm:gap-6'>
                        <div className='w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-[14px] sm:text-lg shadow-sm shrink-0 uppercase'>
                            {patient.name?.charAt(0) || <UserIcon size={18} />}
                        </div>
                        <div className='space-y-0.5 sm:space-y-1 overflow-hidden'>
                            <div className='flex items-center gap-2'>
                                <h4 className='text-[14px] sm:text-base font-bold text-gray-900 dark:text-white truncate leading-tight'>
                                    {patient.name}
                                </h4>
                                <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                                    isGuest ? 'bg-amber-100 text-amber-700 border border-amber-200/50' : 'bg-brand-50 text-brand-700 border border-brand-100'
                                }`}>
                                    {isGuest ? 'Guest' : 'Member'}
                                </span>
                            </div>
                            <div className='flex items-center gap-3 text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium'>
                                <div className='flex items-center gap-1'>
                                    <Phone size={10} className='text-emerald-500' />
                                    {patient.phone}
                                </div>
                                <div className='hidden sm:flex items-center gap-1'>
                                    <Mail size={10} className='text-blue-500' />
                                    {patient.email}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='pt-2 space-y-5'>
                    <PenaltyBadges 
                        noShowCount={patient.noShowCount}
                        cancellationCount={patient.cancellationCount}
                        completedCount={completedCount}
                        isBookingRestricted={patient.isBookingRestricted}
                    />

                    {/* Appointment Note (Note from patient during booking) */}
                    {appointmentNote && (
                        <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start animate-[fadeIn_0.3s_ease-out]">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700/50 shrink-0">
                                <MessageSquare size={16} className="text-brand-500" />
                            </div>
                            <div className="space-y-1.5">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Patient's Appointment Note</span>
                                <p className="text-[13px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {appointmentNote}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Permanent Patient Note (Warnings/Allergies) */}
                    {patient.patientNote && (
                        <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-xl p-4 sm:p-5 flex gap-3 sm:gap-4 items-start animate-[fadeIn_0.3s_ease-out]">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-amber-100 dark:border-amber-500/10 shrink-0">
                                <StickyNote size={16} className="text-amber-500" />
                            </div>
                            <div className="space-y-1.5">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-amber-700/60 dark:text-amber-500/60">Permanent Record Note</span>
                                <p className="text-[13px] sm:text-sm font-medium text-amber-900/80 dark:text-amber-200/70 leading-relaxed italic">
                                    "{patient.patientNote}"
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientOverview;
