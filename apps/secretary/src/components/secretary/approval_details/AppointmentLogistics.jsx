import React from 'react';
import { Calendar, Clock, User, Timer } from 'lucide-react';

const AppointmentLogistics = ({
    date,
    time,
    duration,
    patientName
}) => {
    return (
        <div className='w-full'>
            <h3 className='text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/5'>
                Appointment Overview
            </h3>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
                {/* Date Box */}
                <div className='p-3.5 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-2 sm:gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm h-full'>
                    <div className='flex items-center gap-2 text-[10px] sm:text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                        <Calendar className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500' />
                        Date
                    </div>
                    <div className='text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white mt-auto'>
                        {date}
                    </div>
                </div>

                {/* Time Box */}
                <div className='p-3.5 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-2 sm:gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm h-full'>
                    <div className='flex items-center gap-2 text-[10px] sm:text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                        <Clock className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500' />
                        Time
                    </div>
                    <div className='text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white mt-auto'>
                        {time}
                    </div>
                </div>

                {/* Duration Box */}
                <div className='p-3.5 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-2 sm:gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm h-full'>
                    <div className='flex items-center gap-2 text-[10px] sm:text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                        <Timer className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500' />
                        Duration
                    </div>
                    <div className='text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white mt-auto'>
                        {duration || '30 - 60 mins'}
                    </div>
                </div>

                {/* Patient Box */}
                <div className='p-3.5 sm:p-6 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col gap-2 sm:gap-3 transition-all hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm h-full'>
                    <div className='flex items-center gap-2 text-[10px] sm:text-[11px] text-brand-700 dark:text-brand-400 font-bold tracking-tight'>
                        <User className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-500' />
                        Patient
                    </div>
                    <div className='text-[14px] sm:text-[15px] font-bold text-gray-900 dark:text-white mt-auto'>
                        {patientName}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentLogistics;
