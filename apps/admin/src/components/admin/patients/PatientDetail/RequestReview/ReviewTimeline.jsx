import React from 'react';
import { Calendar, Clock, Check, CheckCircle2, XCircle, UserX } from 'lucide-react';

const ReviewTimeline = ({ createdAt, status = 'PENDING', updatedAt }) => {
    const s = status.toUpperCase();
    
    const isApproved = ['CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'NO_SHOW'].includes(s);
    const isFinalized = ['COMPLETED', 'CHECKED_IN'].includes(s);
    const isNoShow = s === 'NO_SHOW';
    const isCancelled = s === 'CANCELLED' || s === 'LATE_CANCEL';
    const isRejected = s === 'REJECTED';

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className='bg-gray-50/50 dark:bg-white/[0.01] p-6 rounded-2xl border border-gray-100 dark:border-gray-800'>
            <div className='flex items-center justify-between max-w-2xl mx-auto'>
                {/* Step 1: Requested */}
                <div className='flex flex-col items-center gap-2 relative'>
                    <div className='w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20'>
                        <Calendar size={14} />
                    </div>
                    <span className='text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight'>Requested</span>
                    <span className='text-[9px] font-bold text-gray-400 uppercase'>
                        {formatDate(createdAt)}
                    </span>
                </div>

                <div className={`h-px grow mx-4 ${isApproved || isRejected || isCancelled ? (isApproved ? 'bg-brand-500' : 'bg-red-500') : 'bg-gray-200 dark:bg-gray-800'}`} />

                {/* Step 2: Review / Approved / Rejected / Cancelled */}
                <div className='flex flex-col items-center gap-2'>
                    {isApproved ? (
                        <div className='w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20'>
                            <CheckCircle2 size={14} />
                        </div>
                    ) : (isRejected || isCancelled) ? (
                        <div className='w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20'>
                            <XCircle size={14} />
                        </div>
                    ) : (
                        <div className='w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/20'>
                            <Clock size={14} />
                        </div>
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-tight ${
                        isApproved ? 'text-brand-600' : (isRejected || isCancelled) ? 'text-red-600' : 'text-amber-600'
                    }`}>
                        {isApproved ? 'Approved' : isRejected ? 'Rejected' : isCancelled ? 'Cancelled' : 'In Review'}
                    </span>
                    <span className='text-[9px] font-bold text-gray-400 uppercase text-center'>
                        {(isApproved || isRejected || isCancelled) ? formatDate(updatedAt) : 'Awaiting Action'}
                    </span>
                </div>

                <div className={`h-px grow mx-4 ${isFinalized || isNoShow ? (isFinalized ? 'bg-brand-500' : 'bg-red-500') : 'border-t border-dashed border-gray-200 dark:bg-gray-800'}`} />

                {/* Step 3: Finalized / No-Show */}
                <div className={`flex flex-col items-center gap-2 ${(isFinalized || isNoShow) ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isFinalized ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 
                        isNoShow ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 
                        'bg-gray-200 dark:bg-gray-800 text-gray-500'
                    }`}>
                        {isNoShow ? <UserX size={14} /> : <Check size={14} />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-tight ${isNoShow ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {isNoShow ? 'No-Show' : s === 'CHECKED_IN' ? 'Checked-In' : 'Completed'}
                    </span>
                    {(isFinalized || isNoShow) && (
                        <span className='text-[9px] font-bold text-gray-400 uppercase'>
                            {formatDate(updatedAt)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewTimeline;
