import React from 'react';

const DoctorOverview = ({ dentistName, specialization }) => {
    return (
        <div className='w-full space-y-5 sm:space-y-6'>
            <div>
                <h3 className='text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-100 dark:border-white/5'>
                    Assigned Doctor
                </h3>
                <div className='flex items-center gap-4 sm:gap-6'>
                    <div className='w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[14px] sm:text-lg border border-brand-500/20 shrink-0 shadow-sm'>
                        {dentistName
                            .replace(/^Dr\.\s*/i, '')
                            .charAt(0)
                            .toUpperCase()}
                    </div>
                    <div className='space-y-0.5 sm:space-y-1 overflow-hidden'>
                        <h4 className='text-[14px] sm:text-base font-bold text-gray-900 dark:text-white truncate leading-tight'>
                            {dentistName}
                        </h4>
                        <p className='text-[11px] sm:text-xs text-brand-600 dark:text-brand-400 font-bold'>
                            {specialization || 'General Dentistry'}
                        </p>
                    </div>
                </div>
            </div>
            <p className='text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed w-full'>
                Experience exceptional care with your assigned doctor, dedicated to ensuring a comfortable and professional environment throughout your visit.
            </p>
        </div>
    );
};

export default DoctorOverview;
