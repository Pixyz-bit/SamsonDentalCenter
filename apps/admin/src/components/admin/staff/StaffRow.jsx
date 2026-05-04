import React from 'react';
import { ChevronRight, Activity, ShieldCheck, Clock, Mail, Phone, UserRound } from 'lucide-react';

const StaffRow = ({ person, onClick, activeTab }) => {
    const { full_name, role, email, phone, is_active, avatar_url, join_date } = person;

    const renderColumnContent = (isMobile = false) => {
        if (activeTab === 'security') {
            return (
                <div className={`flex items-center gap-1.5 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold ${is_active ? 'text-success-600 dark:text-success-400' : 'text-gray-500'}`}>
                    <ShieldCheck size={isMobile ? 12 : 14} /> 
                    {is_active ? 'Account Secured' : 'Access Restricted'}
                </div>
            );
        }

        if (activeTab === 'activity') {
            return (
                <div className={`flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300 ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
                    <Activity size={isMobile ? 12 : 14} className="text-brand-500"/>
                    Active Now
                </div>
            );
        }

        // Default 'profile'
        return (
            <div className='flex items-center gap-6 shrink-0 min-w-[120px] justify-end sm:justify-start flex-grow sm:flex-grow-0'>
                <span className={`group-hover:hidden ${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1`}>
                    Joined {join_date || 'N/A'}
                </span>
                {!isMobile && (
                    <div className='hidden group-hover:flex items-center gap-2'>
                        <button
                            className='p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-brand-500 transition-colors bg-gray-50 dark:bg-transparent'
                            title='View Details'
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
                !is_active ? 'bg-white dark:bg-white/[0.02]' : 'bg-brand-50/30 dark:bg-brand-500/5'
            }`}
        >
            {/* Desktop View */}
            <div className='hidden sm:flex items-center gap-4 w-full'>
                <div className='flex items-center gap-3 shrink-0 relative'>
                     <span className={`w-2.5 h-2.5 rounded-full ${is_active ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-600'}`} title={is_active ? 'Active' : 'Inactive'} />
                </div>

                <div className='w-48 lg:w-56 shrink-0 flex items-center gap-3'>
                    <div className='w-11 h-11 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center text-brand-500 font-bold text-sm border border-white dark:border-gray-800 shrink-0'>
                        {avatar_url ? (
                            <img src={avatar_url} alt={full_name} className='w-full h-full object-cover' />
                        ) : (
                            <UserRound size={20} />
                        )}
                    </div>
                    <span className={`text-sm sm:text-lg uppercase tracking-tight truncate font-outfit ${!is_active ? 'text-gray-500 font-black' : 'text-gray-900 dark:text-white font-black'}`}>
                        {full_name}
                    </span>
                </div>

                <div className='w-48 lg:w-56 shrink-0 flex items-center gap-3'>
                    <p className='text-sm sm:text-base truncate'>
                        <span className={`${!is_active ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-900 dark:text-white font-bold'}`}>
                            {role}
                        </span>
                        <span className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium ml-2'>
                            - {email}
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
                    <div className='relative w-14 h-14 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-brand-500 font-bold text-xl overflow-hidden border border-gray-200 dark:border-gray-800'>
                       {avatar_url ? (
                            <img src={avatar_url} alt={full_name} className='w-full h-full object-cover' />
                        ) : (
                            <UserRound size={24} />
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white dark:border-gray-900 ${is_active ? 'bg-success-500' : 'bg-gray-400'}`} />
                    </div>
                </div>
                <div className='flex-grow min-w-0 flex flex-col gap-0.5 justify-center'>
                    <div className='flex justify-between items-center'>
                        <span className={`text-sm tracking-tight truncate ${!is_active ? 'text-gray-500' : 'text-gray-900 dark:text-white font-bold'}`}>
                            {full_name}
                        </span>
                        <span className='text-[10px] text-gray-400 font-medium bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded'>{role}</span>
                    </div>
                    <div className='text-xs truncate text-gray-500'>{email}</div>
                    <div className='flex justify-between items-end mt-1'>
                        <div className='text-[10px] text-gray-400 truncate pr-4 flex items-center gap-1'><Phone size={10}/> {phone}</div>
                        {renderColumnContent(true)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffRow;
