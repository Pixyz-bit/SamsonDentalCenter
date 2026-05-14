import React from 'react';
import { X, Check } from 'lucide-react';

const AppointmentDetailFooter = ({ onApprove, onRejectClick }) => {
    return (
        <div className='fixed bottom-0 left-0 right-0 sm:relative z-20 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sm:shadow-none py-5 sm:py-6'>
            <div className='px-4 sm:px-8 md:px-10 flex items-center justify-end gap-3 w-full'>
                <button 
                    onClick={onRejectClick} 
                    className="flex-1 sm:flex-none sm:min-w-[180px] inline-flex items-center justify-center gap-2 px-3 py-2.5 sm:py-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] sm:text-[14px] font-bold rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95"
                >
                    <X size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                    Reject Request
                </button>
                <button 
                    onClick={onApprove} 
                    className="flex-1 sm:flex-none sm:min-w-[180px] inline-flex items-center justify-center gap-2 px-3 py-2.5 sm:py-3 bg-success-500 text-white text-[10px] sm:text-[14px] font-bold rounded-xl shadow-theme-lg active:scale-95 hover:bg-success-600 transition-all"
                >
                    <Check size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                    Approve Request
                </button>
            </div>
        </div>
    );
};

export default AppointmentDetailFooter;
