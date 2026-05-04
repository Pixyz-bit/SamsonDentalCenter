import React from 'react';
import { CalendarOff, Plus } from 'lucide-react';

const TimeOffBlocks = ({ blocks = [] }) => {

    return (
        <div className='p-[clamp(1rem,5vw,1.75rem)] border border-gray-200 rounded-xl dark:border-gray-800 bg-white dark:bg-white/[0.03] space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h4 className='text-[clamp(16px,2.5vw,18px)] font-bold text-gray-900 dark:text-white'>
                        Time Off Blocks
                    </h4>
                    <p className='text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5'>
                        Exceptions to the weekly routine.
                    </p>
                </div>
                <button className='p-2 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-all active:scale-95'>
                    <Plus size={18} />
                </button>
            </div>

            <div className='space-y-3'>
                {blocks.map((block, i) => (
                    <div 
                        key={i}
                        className='p-4 rounded-xl border border-gray-200 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01] hover:border-brand-500/30 transition-all group'
                    >
                        <div className='flex items-start justify-between gap-4'>
                            <div className='space-y-1.5'>
                                <div className='flex items-center gap-2'>
                                    <div className='w-2 h-2 rounded-full bg-amber-500' />
                                    <p className='text-[10px] font-bold uppercase tracking-widest text-amber-600/80 dark:text-amber-500/70'>
                                        Upcoming Exception
                                    </p>
                                </div>
                                <h5 className='text-sm font-bold text-gray-900 dark:text-white/90'>
                                    {block.label}
                                </h5>
                                <div className='flex items-center gap-2 text-xs font-medium text-gray-500'>
                                    <CalendarOff size={14} className='text-gray-400' />
                                    {format(new Date(block.block_date), 'MMM dd, yyyy')}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {blocks.length === 0 && (
                    <div className='py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl'>
                        <CalendarOff size={24} className='text-gray-300 mb-2' />
                        <p className='text-xs text-gray-500'>No active time-off blocks.</p>
                    </div>
                )}
            </div>

            <button className='w-full py-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-all bg-white dark:bg-transparent shadow-sm'>
                View History
            </button>
        </div>
    );
};

export default TimeOffBlocks;
