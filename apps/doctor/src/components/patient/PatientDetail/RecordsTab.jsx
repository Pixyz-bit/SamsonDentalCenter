import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui';

const RecordsTab = ({ patient }) => {
    return (
        <div className='space-y-6 animate-in fade-in duration-300'>
             <div className='flex items-center justify-between'>
                <h4 className='text-sm font-bold text-[#0B1120] dark:text-white uppercase tracking-wider font-outfit'>
                    Clinical Records
                </h4>
                <Button variant="outline" className="h-8 text-[10px] uppercase font-black tracking-widest">
                    Add Record
                </Button>
            </div>
            <div className='p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-white/[0.01]'>
                <CheckCircle2 className='mx-auto text-emerald-500/30 mb-3' size={32} />
                <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>Patient clinical records are up to date.</p>
                <p className='text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black'>No documents uploaded yet</p>
            </div>
        </div>
    );
};

export default RecordsTab;
