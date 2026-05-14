import React from 'react';
import { ChevronLeft } from 'lucide-react';

const AppointmentDetailActionBar = ({ onBack }) => {
    return (
        <div className='px-4 sm:px-8 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-30 sm:relative'>
            <div className='flex items-center gap-3'>
                <button 
                    onClick={onBack}
                    className='p-2 rounded-xl bg-gray-100 dark:bg-white/[0.05] text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors'
                >
                    <ChevronLeft size={20} />
                </button>
                <h1 className='text-[15px] sm:text-lg font-bold text-gray-900 dark:text-white font-outfit leading-tight sm:hidden'>
                    Appointment Details
                </h1>
            </div>
            {/* Future expansion: Action icons on the right (like Star, Menu, etc.) could go here */}
        </div>
    );
};

export default AppointmentDetailActionBar;
