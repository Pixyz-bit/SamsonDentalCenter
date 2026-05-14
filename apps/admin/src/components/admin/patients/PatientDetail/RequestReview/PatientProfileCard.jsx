import React from 'react';
import { ShieldCheck, ShieldAlert, Mail, Phone } from 'lucide-react';

const PatientProfileCard = ({ patient, stats }) => {
    const isCredible = stats.noShow === 0 && (stats.completed >= stats.cancelled);

    return (
        <div className='p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] shadow-sm'>
            <div className='flex items-center gap-4 mb-6'>
                <div className='w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-black text-xl uppercase'>
                    {patient?.full_name?.charAt(0)}
                </div>
                <div>
                    <h3 className='text-sm font-bold text-gray-900 dark:text-white tracking-tight'>
                        {patient?.full_name}
                    </h3>
                    <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        isCredible ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
                    }`}>
                        {isCredible ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                        {isCredible ? 'Credible Patient' : 'High Risk'}
                    </div>
                </div>
            </div>

            <div className='space-y-4'>
                <div className='grid grid-cols-3 gap-2'>
                    <div className='p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-center border border-gray-50 dark:border-gray-800'>
                        <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Visits</span>
                        <span className='text-sm font-bold text-gray-900 dark:text-white'>{stats.completed}</span>
                    </div>
                    <div className='p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-center border border-gray-50 dark:border-gray-800'>
                        <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-widest'>No-Show</span>
                        <span className={`text-sm font-bold ${stats.noShow > 0 ? 'text-error-600' : 'text-gray-900 dark:text-white'}`}>{stats.noShow}</span>
                    </div>
                    <div className='p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-center border border-gray-50 dark:border-gray-800'>
                        <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Cancel</span>
                        <span className='text-sm font-bold text-gray-900 dark:text-white'>{stats.cancelled}</span>
                    </div>
                </div>

                <div className='pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3'>
                    <div className='flex items-center gap-3'>
                        <Mail size={12} className='text-gray-400' />
                        <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate'>{patient?.email}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Phone size={12} className='text-gray-400' />
                        <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400'>{patient?.phone}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfileCard;
