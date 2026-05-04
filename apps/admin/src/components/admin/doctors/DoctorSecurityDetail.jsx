import React from 'react';
import { Shield, Lock, UserX, RefreshCw } from 'lucide-react';
import { Button } from '../../ui';

const DoctorSecurityDetail = ({ doctor }) => {
    return (
        <div className='animate-in fade-in duration-300'>
            <div className='p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit'>
                            Security & Account Management
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-1 font-bold'>
                            Authorized Administrative Controls
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Password Reset */}
                    <div className='p-6 border border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50/20 dark:bg-white/[0.01]'>
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400'>
                                <Lock size={20} />
                            </div>
                            <h5 className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Credential Reset</h5>
                        </div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>
                            Initiate a secure password reset sequence for the email: <span className='font-black text-gray-900 dark:text-white'>{doctor.email}</span>.
                        </p>
                        <Button variant='outline' className='w-full h-11 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-white/5 rounded-xl'>
                            <RefreshCw size={14} className='mr-2' /> Send Link
                        </Button>
                    </div>

                    {/* Account Status */}
                    <div className='p-6 border border-gray-200 dark:border-white/5 rounded-2xl bg-gray-50/20 dark:bg-white/[0.01]'>
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400'>
                                <UserX size={20} />
                            </div>
                            <h5 className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Account Access</h5>
                        </div>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mb-8 leading-relaxed'>
                            Temporarily disable clinical access. Status: <span className={`font-black ${doctor.is_active ? 'text-success-600' : 'text-red-500'}`}>{doctor.is_active ? 'ACTIVE' : 'LOCKED'}</span>.
                        </p>
                        <Button variant='outline' className={`w-full h-11 text-[10px] font-black uppercase tracking-widest rounded-xl ${doctor.is_active ? 'text-red-600 border-red-500/20' : 'text-success-600 border-success-500/20'}`}>
                            {doctor.is_active ? 'Restrict Access' : 'Restore Access'}
                        </Button>
                    </div>
                </div>

                <div className='mt-10 pt-8 border-t border-gray-200 dark:border-gray-800'>
                    <div className='flex items-center gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10'>
                        <Shield className='text-amber-500 shrink-0' size={20} />
                        <div>
                            <p className='text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-1'>Audit Notice</p>
                            <p className='text-[11px] text-amber-700 dark:text-amber-400/80 font-medium leading-relaxed'>
                                All security actions performed on this account are recorded in the System Audit Log including your administrative ID and timestamp.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorSecurityDetail;
