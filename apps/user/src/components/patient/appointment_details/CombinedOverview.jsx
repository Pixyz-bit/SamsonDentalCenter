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
        <div className='flex flex-col gap-10 sm:gap-14'>
            {/* Row 1: Assigned Doctor */}
            <div className='w-full space-y-6 sm:px-0'>
                <div>
                    <h3 className='text-base sm:text-xl text-gray-900 dark:text-white font-bold tracking-tight mb-6 pb-4 border-b border-gray-100 dark:border-white/5'>
                        Assigned Doctor
                    </h3>
                    <div className='flex items-center gap-4 sm:gap-8'>
                        <div className='w-14 h-14 sm:w-24 sm:h-24 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-2xl sm:text-4xl border border-brand-500/20 shrink-0 shadow-sm'>
                            {dentistName
                                .replace(/^Dr\.\s*/i, '')
                                .charAt(0)
                                .toUpperCase()}
                        </div>
                        <div className='space-y-1 sm:space-y-2 overflow-hidden'>
                            <h4 className='text-lg sm:text-3xl font-bold text-gray-900 dark:text-white truncate leading-tight'>
                                {dentistName}
                            </h4>
                            <p className='text-sm sm:text-lg text-brand-600 dark:text-brand-400 font-bold'>
                                {specialization || 'General Dentistry'}
                            </p>
                        </div>
                    </div>
                </div>
                <p className='text-[12px] sm:text-[15px] text-gray-600 dark:text-gray-400 font-bold leading-relaxed max-w-3xl'>
                    Experience exceptional care with your assigned doctor, dedicated to ensuring a comfortable and professional environment throughout your visit.
                </p>
            </div>

            {/* Row 2: Appointment Overview (Horizontal Bento Box Style) */}
            <div className='w-full sm:px-0'>
                <h3 className='text-base sm:text-xl text-gray-900 dark:text-white font-bold tracking-tight mb-6 pb-4 border-b border-gray-100 dark:border-white/5'>
                    Appointment Overview
                </h3>
                
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
                    {/* Date Box */}
                    <div className='p-4 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'>
                        <div className='flex items-center gap-2 text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                            <Calendar className='w-4 h-4 text-brand-500' />
                            Date
                        </div>
                        <div className='text-[15px] sm:text-[17px] font-bold text-gray-900 dark:text-white'>
                            {dateFormatted}
                        </div>
                    </div>

                    {/* Time Box */}
                    <div className='p-4 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'>
                        <div className='flex items-center gap-2 text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                            <Clock className='w-4 h-4 text-brand-500' />
                            Time
                        </div>
                        <div className='text-[15px] sm:text-[17px] font-bold text-gray-900 dark:text-white'>
                            {timeFormatted}
                        </div>
                    </div>

                    {/* Duration Box */}
                    <div className='p-4 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'>
                        <div className='flex items-center gap-2 text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                            <Timer className='w-4 h-4 text-brand-500' />
                            Duration
                        </div>
                        <div className='text-[15px] sm:text-[17px] font-bold text-gray-900 dark:text-white'>
                            {duration || '30 - 60 mins'}
                        </div>
                    </div>

                    {/* Patient Box */}
                    <div className='p-4 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'>
                        <div className='flex items-center gap-2 text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                            <User className='w-4 h-4 text-brand-500' />
                            Patient
                        </div>
                        <div className='text-[15px] sm:text-[17px] font-bold text-gray-900 dark:text-white'>
                            {patientLabel}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CombinedOverview;
