import React from 'react';
import { Calendar, Clock, User, Timer } from 'lucide-react';

const CombinedOverview = ({
    dentistName,
    specialization,
    dateFormatted,
    timeFormatted,
    duration,
    patientLabel,
    isRepresentativeBooking,
}) => {
    return (
        <div className='flex flex-col lg:flex-row gap-8 lg:gap-16 items-start'>
            {/* Left Column: Assigned Doctor */}
            <div className='w-full lg:w-[40%] space-y-4 sm:space-y-6 sm:px-0'>
                <div>
                    <h3 className='text-[9px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-[0.2em] mb-3 sm:mb-4'>
                        Assigned Doctor
                    </h3>
                    <div className='flex items-center gap-4 sm:gap-5'>
                        <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-black text-xl sm:text-2xl border border-brand-500/20 shrink-0'>
                            {dentistName
                                .replace(/^Dr\.\s*/i, '')
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div className='space-y-0.5 sm:space-y-1 overflow-hidden'>
                            <h4 className='text-base sm:text-xl font-black text-gray-900 dark:text-white truncate leading-tight'>
                                {dentistName}
                            </h4>
                            <p className='text-xs sm:text-[13px] text-brand-600 dark:text-brand-400 font-bold'>
                                {specialization || 'General Dentistry'}
                            </p>
                        </div>
                    </div>
                </div>
                <p className='text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed opacity-80'>
                    Experience exceptional care with your assigned doctor, dedicated to ensuring a comfortable and professional environment.
                </p>
            </div>

            {/* Divider (Mobile only) */}
            <div className='block lg:hidden w-full h-px bg-gray-200 dark:bg-white/10'></div>

            {/* Right Column: Appointment Logistics */}
            <div className='flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 sm:gap-y-10 w-full sm:px-0'>
                {/* Date Selection */}
                <div className='space-y-2 sm:space-y-3'>
                    <div className='flex items-center gap-2 text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-[0.15em]'>
                        <Calendar className='w-3 h-3' />
                        Date
                    </div>
                    <div className='text-[13px] sm:text-[16px] font-black text-gray-900 dark:text-white'>
                        {dateFormatted}
                    </div>
                </div>

                {/* Time Selection */}
                <div className='space-y-2 sm:space-y-3'>
                    <div className='flex items-center gap-2 text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-[0.15em]'>
                        <Clock className='w-3 h-3' />
                        Time
                    </div>
                    <div className='text-[13px] sm:text-[16px] font-black text-gray-900 dark:text-white'>
                        {timeFormatted}
                    </div>
                </div>

                {/* Duration */}
                <div className='space-y-2 sm:space-y-3'>
                    <div className='flex items-center gap-2 text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-[0.15em]'>
                        <Timer className='w-3 h-3' />
                        Duration
                    </div>
                    <div className='text-[13px] sm:text-[16px] font-black text-gray-900 dark:text-white'>
                        {duration || '30 - 60 mins'}
                    </div>
                </div>

                {/* Patient Information */}
                <div className='space-y-2 sm:space-y-3'>
                    <div className='flex items-center gap-2 text-[9px] text-gray-400 dark:text-gray-500 font-extrabold uppercase tracking-[0.15em]'>
                        <User className='w-3 h-3' />
                        Patient
                    </div>
                    <div className='space-y-2'>
                        <div className='text-[13px] sm:text-[16px] font-black text-gray-900 dark:text-white'>
                            {patientLabel}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombinedOverview;
