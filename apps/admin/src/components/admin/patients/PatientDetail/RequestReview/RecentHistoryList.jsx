import React from 'react';
import { History, Calendar } from 'lucide-react';

const RecentHistoryList = ({ history, loading }) => {
    const pastStatuses = ['COMPLETED', 'NO_SHOW', 'CANCELLED', 'LATE_CANCEL'];
    const filteredHistory = history.filter(h => pastStatuses.includes(h.status?.toUpperCase()));

    return (
        <div className='p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] shadow-sm h-full flex flex-col'>
            <div className='flex items-center justify-between mb-6'>
                <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                    <History size={14} /> Appointment History
                </h4>
                <button className='text-[10px] font-black text-brand-600 uppercase tracking-widest hover:text-brand-700 transition-colors'>
                    View More
                </button>
            </div>
            
            <div className='space-y-2 grow'>
                {filteredHistory.slice(0, 8).map((h) => (
                    <div key={h.id} className='p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.01] flex items-center justify-between group hover:border-brand-500/20 transition-colors'>
                        <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400'>
                                <Calendar size={14} />
                            </div>
                            <div>
                                <span className='block text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight'>
                                    {new Date(h.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className='text-[9px] font-bold text-gray-400 uppercase tracking-widest'>{h.service?.name}</span>
                            </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                            h.status === 'COMPLETED' ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                            {h.status}
                        </span>
                    </div>
                ))}
                {filteredHistory.length === 0 && !loading && (
                    <div className='h-full flex flex-col items-center justify-center py-10 opacity-50'>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]'>No past record</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentHistoryList;
