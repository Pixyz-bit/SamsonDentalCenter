import React from 'react';
import { ChevronRight } from 'lucide-react';
import Badge from '../../ui/Badge';

const getInitial = (name = '') => name.charAt(0).toUpperCase();

const ApprovalRow = ({ request, onClick }) => {
    const { id, patient, service, requestedDate, requestedTime, requestedEndTime, createdAt } = request;

    // Calculate status (Secretary logic preserved)
    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now - createdDate) / (1000 * 60 * 60);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];
    const isTomorrow = requestedDate === tomorrowStr || requestedDate === todayStr;

    let displayStatus = 'New';
    let badgeColor = 'info';
    if (isTomorrow) {
        displayStatus = 'Urgent';
        badgeColor = 'error';
    } else if (hoursDiff > 5) {
        displayStatus = 'Needs Attention';
        badgeColor = 'warning';
    }

    const formatMobileDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatDateStr = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div 
            onClick={() => onClick(id)}
            className='group relative bg-white dark:bg-white/[0.03] sm:rounded-xl border-b sm:border border-gray-100 dark:border-gray-800 sm:shadow-sm hover:shadow-md sm:hover:z-10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-row items-center'
        >
            {/* 1. Left Side: Schedule Block (Desktop Only) */}
            <div className='hidden sm:flex w-48 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-200 dark:border-white/10 shrink-0 flex-col text-left py-1'>
                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Requested Date</p>
                    <p className='text-[16px] font-medium text-gray-900 dark:text-white leading-tight'>
                        {formatDateStr(requestedDate)}
                    </p>
                </div>
                <div className='h-px w-full bg-gray-200 dark:bg-white/5' />
                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Time</p>
                    <p className='text-[14px] font-medium text-brand-500 leading-tight'>
                        {requestedTime} – {requestedEndTime}
                    </p>
                </div>
            </div>

            {/* 2. Content Area */}
            <div className='flex-grow flex items-center min-w-0'>
                {/* Mobile View */}
                <div className='flex sm:hidden gap-4 w-full pl-6 pr-4 py-4 items-center'>
                    <div className='shrink-0'>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${badgeColor === 'error' ? 'bg-error-500 shadow-error-500/20' : badgeColor === 'warning' ? 'bg-warning-500 shadow-warning-500/20' : 'bg-brand-500 shadow-brand-500/20'}`}>
                            {getInitial(patient.name)}
                        </div>
                    </div>
                    <div className='flex-grow min-w-0 flex flex-col gap-0.5'>
                        <div className='flex justify-between items-center min-w-0'>
                            <span className='text-[17px] font-medium text-gray-900 dark:text-white tracking-tight truncate flex-grow min-w-0'>
                                {patient.name}
                            </span>
                            <div className='shrink-0 ml-2'>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                    badgeColor === 'error' ? 'bg-error-50 text-error-600' : 
                                    badgeColor === 'warning' ? 'bg-warning-50 text-warning-600' : 
                                    'bg-brand-50 text-brand-600'
                                }`}>
                                    {displayStatus}
                                </span>
                            </div>
                        </div>
                        <div className='text-[13px] truncate text-gray-500 dark:text-gray-400 font-medium leading-tight'>
                            {service}
                        </div>
                        <div className='flex justify-between items-end mt-0.5'>
                            <div className='text-[11px] text-gray-700 dark:text-gray-400 font-medium truncate pr-4 flex items-center gap-1.5'>
                                <span>{formatMobileDate(requestedDate)}</span>
                                <span className='text-gray-400'>•</span>
                                <span className='text-gray-500/80'>{requestedTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className='shrink-0 text-brand-500 ml-2'>
                        <ChevronRight size={20} strokeWidth={3} />
                    </div>
                </div>

                {/* Desktop View */}
                <div className='hidden sm:flex flex-grow px-8 py-5 items-center gap-8 min-w-0'>
                    <div className='shrink-0'>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${badgeColor === 'error' ? 'bg-error-500 shadow-error-500/10' : badgeColor === 'warning' ? 'bg-warning-500 shadow-warning-500/10' : 'bg-brand-500 shadow-brand-500/10'}`}>
                            {getInitial(patient.name)}
                        </div>
                    </div>
                    
                    <div className='flex flex-grow items-center min-w-0'>
                        <div className='flex flex-col min-w-0 w-[240px] shrink-0'>
                            <h3 className='text-[20px] font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-brand-500 transition-colors'>
                                {patient.name}
                            </h3>
                            <div className='flex items-center gap-2 mt-0.5'>
                                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>ID:</span>
                                <span className='text-[11px] font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded'>
                                    {id.toString().substring(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-col min-w-0 w-[260px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>
                                Service
                            </p>
                            <div className='flex items-center gap-1.5 text-gray-900 dark:text-white'>
                                <span className='text-[17px] font-medium truncate'>
                                    {service}
                                </span>
                            </div>
                        </div>

                        <div className='flex flex-col min-w-0 w-[140px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>Priority</p>
                            <div className='shrink-0'>
                                <Badge color={badgeColor} size='sm'>
                                    {displayStatus}
                                </Badge>
                            </div>
                        </div>

                        <div className='flex-grow' />

                        <div className='shrink-0 ml-4 flex items-center justify-center text-brand-500 transition-all transform group-hover:translate-x-1'>
                            <ChevronRight size={24} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalRow;
