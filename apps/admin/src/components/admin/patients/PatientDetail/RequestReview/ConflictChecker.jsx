import React from 'react';
import { Activity, Loader2, Info } from 'lucide-react';

const ConflictChecker = ({ schedule, requestedSlot, loading }) => {
    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                    <Activity size={14} /> Conflict Checker
                </h4>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-1.5'>
                        <div className='w-2 h-2 rounded-full bg-brand-500' />
                        <span className='text-[9px] font-bold text-gray-400 uppercase'>Request</span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                        <div className='w-2 h-2 rounded-full bg-gray-300' />
                        <span className='text-[9px] font-bold text-gray-400 uppercase'>Booked</span>
                    </div>
                </div>
            </div>

            <div className='relative h-28 bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 p-6'>
                {loading ? (
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <Loader2 size={24} className='animate-spin text-brand-500' />
                    </div>
                ) : (
                    <div className='h-full flex flex-col justify-center'>
                        <div className='flex justify-between text-[7px] font-black text-gray-400 uppercase tracking-widest mb-3'>
                            <span>8AM</span>
                            <span>9AM</span>
                            <span>10AM</span>
                            <span>11AM</span>
                            <span>12PM</span>
                            <span>1PM</span>
                            <span>2PM</span>
                            <span>3PM</span>
                            <span>4PM</span>
                            <span>5PM</span>
                            <span>6PM</span>
                        </div>
                        <div className='relative h-16 bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-white/10'>
                            {/* Hour Grid Lines */}
                            {[...Array(11)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className='absolute inset-y-0 border-r-2 border-gray-300 dark:border-white/20 z-0'
                                    style={{ left: `${(i * 10)}%` }}
                                />
                            ))}
                            {/* Half-hour Grid Lines */}
                            {[...Array(10)].map((_, i) => (
                                <div 
                                    key={`h-${i}`} 
                                    className='absolute inset-y-0 border-r border-dashed border-gray-300 dark:border-white/10 z-0'
                                    style={{ left: `${(i * 10) + 5}%` }}
                                />
                            ))}
                            {schedule?.appointments?.map(appt => {
                                const startHour = parseInt(appt.start_time.split(':')[0]);
                                const startMin = parseInt(appt.start_time.split(':')[1]);
                                const endHour = parseInt(appt.end_time.split(':')[0]);
                                const endMin = parseInt(appt.end_time.split(':')[1]);
                                const startPct = ((startHour - 8) * 60 + startMin) / 6;
                                const endPct = ((endHour - 8) * 60 + endMin) / 6;
                                return (
                                    <div 
                                        key={appt.id}
                                        className='absolute inset-y-0 bg-gray-300 dark:bg-gray-700/50 border-x border-gray-400/20'
                                        style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                                    />
                                );
                            })}
                            {requestedSlot && (() => {
                                const startHour = parseInt(requestedSlot.start.split(':')[0]);
                                const startMin = parseInt(requestedSlot.start.split(':')[1]);
                                const endHour = parseInt(requestedSlot.end.split(':')[0]);
                                const endMin = parseInt(requestedSlot.end.split(':')[1]);
                                const startPct = ((startHour - 8) * 60 + startMin) / 6;
                                const endPct = ((endHour - 8) * 60 + endMin) / 6;
                                return (
                                    <div className='absolute inset-y-0 bg-brand-500 border-x-2 border-white dark:border-gray-900 shadow-xl shadow-brand-500/50 z-10'
                                         style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} 
                                    />
                                );
                            })()}
                        </div>
                        <div className='mt-4 flex items-center gap-2 text-gray-500'>
                            <Info size={12} className='text-brand-500' />
                            <p className='text-[10px] font-bold uppercase tracking-widest'>
                                {schedule?.appointments?.length || 0} Scheduled bookings for this doctor today.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConflictChecker;
