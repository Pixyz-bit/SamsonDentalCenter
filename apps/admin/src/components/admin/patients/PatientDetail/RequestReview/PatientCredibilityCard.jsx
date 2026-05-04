import React from 'react';
import { ShieldCheck, ShieldAlert, Mail, Phone, History, Calendar } from 'lucide-react';

const PatientCredibilityCard = ({ patient, stats, history, loading }) => {
    const isCredible = stats.noShow === 0 && (stats.completed >= stats.cancelled);

    return (
        <div className='space-y-6'>
            <div className='p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] shadow-sm'>
                <div className='flex items-center gap-4 mb-6'>
                    <div className='w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-black text-xl uppercase'>
                        {patient?.full_name?.charAt(0)}
                    </div>
                    <div>
                        <h3 className='text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight'>
                            {patient?.full_name}
                        </h3>
                        <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isCredible ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
                        }`}>
                            {isCredible ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                            {isCredible ? 'Credible Patient' : 'High Risk'}
                        </div>
                    </div>
                </div>

                <div className='space-y-4'>
                    <div className='grid grid-cols-3 gap-2'>
                        <div className='p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-center border border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5'>
                            <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Visits</span>
                            <span className='text-sm font-black text-gray-900 dark:text-white'>{stats.completed}</span>
                        </div>
                        <div className='p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-center border border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5'>
                            <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-widest'>No-Show</span>
                            <span className={`text-sm font-black ${stats.noShow > 0 ? 'text-error-600' : 'text-gray-900 dark:text-white'}`}>{stats.noShow}</span>
                        </div>
                        <div className='p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] text-center border border-gray-50 dark:border-gray-800 transition-colors hover:bg-gray-100/50 dark:hover:bg-white/5'>
                            <span className='block text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Cancel</span>
                            <span className='text-sm font-black text-gray-900 dark:text-white'>{stats.cancelled}</span>
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

            {/* Latest History List */}
            <div className='space-y-4'>
                <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                    <History size={14} /> Recent History
                </h4>
                <div className='space-y-2'>
                    {history.slice(0, 5).map((h) => (
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
                    {history.length === 0 && !loading && (
                        <p className='text-center py-6 text-xs font-bold text-gray-400 uppercase tracking-widest'>New Patient</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientCredibilityCard;
