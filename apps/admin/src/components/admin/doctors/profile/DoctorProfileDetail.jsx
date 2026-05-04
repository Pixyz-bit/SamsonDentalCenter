import React from 'react';
import { ShieldCheck, Calendar, Clock, MapPin } from 'lucide-react';

const DoctorProfileDetail = ({ doctor }) => {
    return (
        <div className='space-y-8 animate-in fade-in duration-300'>
            {/* Quick Stats Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                <div className='p-6 border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.01] shadow-sm'>
                    <div className='flex items-center gap-3 mb-4'>
                        <div className='w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500'>
                            <ShieldCheck size={16} />
                        </div>
                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Verification</span>
                    </div>
                    <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Licensed Dental Pro</p>
                </div>

                <div className='p-6 border border-gray-200 dark:border-white/5 rounded-2xl bg-white dark:bg-white/[0.01] shadow-sm'>
                    <div className='flex items-center gap-3 mb-4'>
                        <div className='w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500'>
                            <Calendar size={16} />
                        </div>
                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>Joined</span>
                    </div>
                    <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Apr 2024</p>
                </div>
            </div>

            {/* Biography Card */}
            <div className='p-8 border border-gray-200 dark:border-white/5 rounded-3xl bg-white dark:bg-white/[0.01] shadow-sm'>
                <h4 className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6'>Professional Statement</h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium'>
                    {doctor.bio || 'Credentials and professional history details are currently being processed.'}
                </p>
            </div>
        </div>
    );
};

export default DoctorProfileDetail;
