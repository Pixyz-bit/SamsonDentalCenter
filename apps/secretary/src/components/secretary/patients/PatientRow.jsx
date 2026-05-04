import React from 'react';
import { ChevronRight, Calendar, User, Mail, CreditCard, Activity } from 'lucide-react';

const PatientRow = ({ patient, onClick, activeTab }) => {
    const { 
        full_name, 
        email, 
        phone, 
        last_visit, 
        status, 
        avatar_url, 
        photo_url,
        balance, 
        is_registered, 
        is_booking_restricted,
        appointments_count
    } = patient;

    const displayAvatar = avatar_url || photo_url;

    const renderColumnContent = (isMobile = false) => {
        if (activeTab === 'financial') {
            return (
                <div className={`flex items-center gap-1.5 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold ${balance === '₱ 0.00' ? 'text-success-600' : 'text-red-500'}`}>
                    <CreditCard size={isMobile ? 12 : 14} /> 
                    {balance || '₱ 0.00'}
                </div>
            );
        }

        if (activeTab === 'records') {
            return (
                <div className={`flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    <Calendar size={isMobile ? 12 : 14} className="text-brand-500"/>
                    Last: {last_visit || 'No visits'}
                </div>
            );
        }

        // Default 'profile'
        return (
            <div className='flex items-center gap-6 shrink-0 min-w-[120px] justify-end sm:justify-start flex-grow sm:flex-grow-0'>
                <span className={`group-hover:hidden ${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1`}>
                    <Activity size={isMobile ? 12 : 14} /> {appointments_count || 0} Appts
                </span>
                {!isMobile && (
                    <div className='hidden group-hover:flex items-center gap-2'>
                        <button
                            className='p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-brand-500 transition-colors bg-gray-50 dark:bg-transparent'
                            title='View Records'
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div
            onClick={onClick}
            className={`group relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:z-10 ${
                is_booking_restricted ? 'bg-red-50/30 dark:bg-red-500/5' : 'bg-white dark:bg-white/[0.02]'
            }`}
        >
            {/* Desktop View */}
            <div className='hidden sm:flex items-center gap-4 w-full'>
                <div className='flex items-center gap-3 shrink-0 relative'>
                     <span className={`w-2.5 h-2.5 rounded-full ${is_booking_restricted ? 'bg-red-500' : is_registered ? 'bg-success-500' : 'bg-amber-400'}`} title={status} />
                </div>

                <div className='w-48 lg:w-56 shrink-0 flex items-center gap-3'>
                    <div className='w-11 h-11 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 font-bold text-sm border border-white dark:border-gray-800 shrink-0'>
                        {displayAvatar ? (
                            <img src={displayAvatar} alt={full_name} className='w-full h-full object-cover' />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <span className={`text-sm sm:text-base truncate ${is_booking_restricted ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-900 dark:text-white font-bold'}`}>
                        {full_name}
                    </span>
                </div>

                <div className='w-48 lg:w-56 shrink-0 flex items-center gap-3'>
                    <p className='text-sm sm:text-base truncate'>
                        <span className={`text-gray-900 dark:text-white font-bold`}>
                            {status || (is_registered ? 'Registered' : 'Walk-in')}
                        </span>
                        <span className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium ml-2'>
                            - {email || 'No email'}
                        </span>
                    </p>
                </div>

                <div className='flex-grow min-w-0 flex justify-end'>
                    {renderColumnContent()}
                </div>
            </div>

            {/* Mobile View */}
            <div className='flex sm:hidden gap-4 w-full'>
                <div className='shrink-0'>
                    <div className='relative w-14 h-14 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 font-bold text-xl overflow-hidden border border-gray-200 dark:border-gray-800'>
                       {displayAvatar ? (
                            <img src={displayAvatar} alt={full_name} className='w-full h-full object-cover' />
                        ) : (
                            <User size={24} />
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white dark:border-gray-900 ${is_booking_restricted ? 'bg-red-500' : is_registered ? 'bg-success-500' : 'bg-amber-500'}`} />
                    </div>
                </div>
                <div className='flex-grow min-w-0 flex flex-col gap-0.5 justify-center'>
                    <div className='flex justify-between items-center'>
                        <span className={`text-sm tracking-tight truncate ${is_booking_restricted ? 'text-red-600 font-bold' : 'text-gray-900 dark:text-white font-bold'}`}>
                            {full_name}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${is_booking_restricted ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>{status || (is_registered ? 'Registered' : 'Walk-in')}</span>
                    </div>
                    <div className='text-xs truncate text-gray-500'>{phone || 'No phone'}</div>
                    <div className='flex justify-between items-end mt-1'>
                        <div className='text-[10px] text-gray-400 truncate pr-4 flex items-center gap-1'><Mail size={10}/> {email || 'No email'}</div>
                        {renderColumnContent(true)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientRow;

