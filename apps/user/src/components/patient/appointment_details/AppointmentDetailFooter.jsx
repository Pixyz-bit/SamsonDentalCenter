import React from 'react';

const AppointmentDetailFooter = ({ isCancellable, isReschedulable, isPending, isApproved, hasRescheduled, onCancelClick, onRescheduleClick }) => {
    // Hide the footer entirely if the appointment is already completed or cancelled (not cancellable)
    if (!isCancellable) return null;

    const cancelLabel = isPending ? 'Cancel Request' : 'Cancel Appointment';

    return (
        <div className='fixed bottom-0 left-0 right-0 sm:relative z-20 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sm:shadow-none'>
            <div className='flex items-center gap-3 w-full justify-between'>
                <div className='hidden sm:block sm:flex-1'></div>
                <div className='flex flex-1 sm:flex-none gap-3 sm:justify-end w-full'>
                    <button
                        onClick={onCancelClick}
                        className='flex-1 sm:flex-none sm:min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-white dark:bg-error-500/10 text-error-600 dark:text-error-500 text-[11px] sm:text-[15px] font-black rounded-lg hover:bg-error-50 dark:hover:bg-error-500/20 transition-[background-color,border-color] border border-error-100 dark:border-error-500/20'
                    >
                        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M18 6L6 18' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M6 6l12 12' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                        {cancelLabel}
                    </button>
                    
                    {isReschedulable && (
                        <button
                            onClick={onRescheduleClick}
                            className={`flex-1 sm:flex-none sm:min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-[11px] sm:text-[15px] font-black rounded-lg transition-[background-color,box-shadow] ${
                                hasRescheduled
                                    ? 'bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-white/[0.08]' 
                                    : 'bg-brand-500 text-white hover:bg-brand-600'
                            }`}
                        >
                            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'/>
                                <path d='M3 3v5h5' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'/>
                            </svg>
                            Reschedule
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailFooter;
