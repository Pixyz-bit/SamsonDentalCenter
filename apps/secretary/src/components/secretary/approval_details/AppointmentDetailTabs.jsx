import React from 'react';

const AppointmentDetailTabs = ({ activeTab, setActiveTab, notes }) => {
    return (
        <div className='space-y-6 sm:space-y-8 animate-[fadeIn_0.2s_ease-out]'>
            {/* Minimalist Tab Navigation with full width underline */}
            <div className='flex gap-6 sm:gap-10 overflow-x-auto whitespace-nowrap no-scrollbar border-b border-gray-200 dark:border-gray-800 relative'>
                {['description', 'notes', 'contact', 'faq'].map((tab) => {
                    const labels = {
                        description: 'Notes',
                        notes: 'Pre-Treatment',
                        contact: 'Contact',
                        faq: 'FAQ',
                    };
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-[11px] sm:text-sm font-bold transition-colors relative pb-3 uppercase tracking-wider ${
                                isActive
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            {labels[tab]}
                            {isActive && (
                                <span className='absolute -bottom-px left-0 w-full h-0.5 bg-gray-900 dark:bg-white rounded-t-full' />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content exactly mirrored from prose styling */}
            <div className='prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-2'>
                {activeTab === 'description' && (
                    <p className='text-gray-600 dark:text-gray-400 leading-relaxed text-[13px] sm:text-base whitespace-pre-wrap font-medium'>
                        {notes || 'No additional notes provided for this appointment.'}
                    </p>
                )}
                {activeTab === 'notes' && (
                    <ul className='list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400 leading-relaxed text-[13px] sm:text-base font-medium'>
                        <li>Please arrive 10 minutes early to fill out any necessary forms.</li>
                        <li>Avoid eating heavy meals 2 hours before the appointment.</li>
                    </ul>
                )}
                {activeTab === 'contact' && (
                    <div className='space-y-4 font-medium text-[13px] sm:text-base text-gray-600 dark:text-gray-400'>
                        <p>
                            If you have any urgent concerns prior to your appointment, please reach
                            out:
                        </p>
                        <p className='mt-4'>
                            <strong className='text-gray-900 dark:text-white tracking-widest text-[10px] sm:text-xs uppercase mr-3 opacity-60'>
                                Call Us
                            </strong>
                            <br className='sm:hidden' />
                            <span className='sm:inline-block sm:mt-0 mt-1'>09123456789</span>
                        </p>
                        <p className='mt-4'>
                            <strong className='text-gray-900 dark:text-white tracking-widest text-[10px] sm:text-xs uppercase mr-3 opacity-60'>
                                Email
                            </strong>
                            <br className='sm:hidden' />
                            <span className='sm:inline-block sm:mt-0 mt-1'>
                                samsondentalcenter@gmail.com
                            </span>
                        </p>
                    </div>
                )}
                {activeTab === 'faq' && (
                    <div className='space-y-6 sm:space-y-8'>
                        <div>
                            <p className='font-bold text-gray-900 dark:text-white text-[13px] sm:text-base mb-1.5'>
                                Do I need to arrive early?
                            </p>
                            <p className='text-gray-600 dark:text-gray-400 text-[13px] sm:text-base font-medium leading-relaxed'>
                                Please arrive at least 10 minutes prior to your scheduled time to
                                finalize any documentation.
                            </p>
                        </div>
                        <div>
                            <p className='font-bold text-gray-900 dark:text-white text-[13px] sm:text-base mb-1.5'>
                                What if I need to cancel?
                            </p>
                            <p className='text-gray-600 dark:text-gray-400 text-[13px] sm:text-base font-medium leading-relaxed'>
                                Cancellations must be made at least 24 hours in advance. You can
                                cancel directly from this page using the options below.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <p className='mt-10 sm:mt-14 text-xs sm:text-sm text-brand-600/60 dark:text-brand-400/50 italic font-medium pt-8 border-t border-gray-100/50 dark:border-gray-800'>
                Thank you for trusting Samson Dental Center,
                <br />
                We look forward to seeing you.
            </p>
        </div>
    );
};

export default AppointmentDetailTabs;
