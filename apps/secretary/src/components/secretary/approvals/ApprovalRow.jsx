import React from 'react';
import { Calendar, Clock, Eye } from 'lucide-react';

const ApprovalRow = ({ request, onClick }) => {
    const { id, patient, service, requestedDate, requestedTime, createdAt } = request;

    // Calculate status: Urgent, Needs Attention, or New
    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
    
    // Normalize tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];
    
    const isTomorrow = requestedDate === tomorrowStr || requestedDate === todayStr;

    let statusText = 'New';
    let statusClass = 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400';
    let rowBorderClass = 'border-l-4 border-l-transparent';
    let rowBgClass = 'bg-white dark:bg-white/[0.02]';

    if (isTomorrow) {
        statusText = 'Urgent';
        statusClass = 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 animate-pulse ring-1 ring-error-500/50';
        rowBorderClass = 'border-l-4 border-l-error-500';
        rowBgClass = 'bg-error-50/30 dark:bg-error-500/5';
    } else if (hoursDiff > 5) {
        statusText = 'Needs Attention';
        statusClass = 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
        rowBorderClass = 'border-l-4 border-l-warning-500';
        rowBgClass = 'bg-warning-50/20 dark:bg-warning-500/[0.03]';
    }

    return (
        <div 
            onClick={() => onClick(id)}
            className={`group relative flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-y border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:shadow-theme-md hover:z-10 ${rowBorderClass} ${rowBgClass}`}
        >
            {/* Desktop View (sm and up) */}
            <div className='hidden sm:flex items-center w-full gap-4'>
                <div className='w-48 lg:w-56 shrink-0 truncate flex items-center gap-3'>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-theme-sm ${isTomorrow ? 'bg-error-500' : hoursDiff > 5 ? 'bg-warning-500' : 'bg-brand-500'}`}>
                        {patient.name.charAt(0)}
                    </div>
                    <span className={`text-sm sm:text-base font-bold truncate ${isTomorrow ? 'text-error-700 dark:text-error-400' : 'text-gray-900 dark:text-white'}`}>
                        {patient.name}
                    </span>
                </div>

                <div className='flex-grow min-w-0 pr-4'>
                    <p className='text-sm sm:text-base truncate'>
                        <span className='text-gray-900 dark:text-gray-100 font-medium'>
                            {service}
                        </span>
                        <span className='text-xs sm:text-sm text-gray-400 dark:text-gray-500 font-medium ml-2'>
                            - Requested for {new Date(requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {requestedTime}
                        </span>
                    </p>
                </div>

                <div className='flex items-center gap-4 shrink-0 min-w-[150px] justify-end'>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                        {statusText}
                    </div>

                    <span className='group-hover:hidden text-xs text-gray-400 dark:text-gray-500 font-medium ml-2 w-20 text-right'>
                        {hoursDiff < 1 ? 'Just now' : `${Math.floor(hoursDiff)}h ago`}
                    </span>
                    
                    <div className='hidden group-hover:flex items-center gap-2 w-16 justify-end'>
                        <div className='p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-500/10 text-brand-500/70 hover:text-brand-600'>
                            <Eye size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile View (xs only) */}
            <div className='flex sm:hidden gap-3 w-full'>
                <div className='shrink-0'>
                    <div className='w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-sm'>
                        {patient.name.charAt(0)}
                    </div>
                </div>
                <div className='flex-grow min-w-0 flex flex-col gap-0.5'>
                    <div className='flex justify-between items-center'>
                        <span className={`text-sm tracking-tight truncate font-bold ${isTomorrow ? 'text-error-700 dark:text-error-400' : 'text-gray-900 dark:text-white'}`}>
                            {patient.name}
                        </span>
                        <span className='text-[10px] text-gray-400 font-medium'>{hoursDiff < 1 ? 'Just now' : `${Math.floor(hoursDiff)}h ago`}</span>
                    </div>
                    <div className='text-sm truncate text-gray-700 dark:text-gray-300 font-medium'>
                        {service}
                    </div>
                    <div className='flex justify-between items-end mt-1'>
                        <div className='text-xs text-gray-400 truncate pr-4 grow'>
                            {new Date(requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {requestedTime}
                        </div>
                        <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${statusClass}`}>
                            {statusText}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalRow;
