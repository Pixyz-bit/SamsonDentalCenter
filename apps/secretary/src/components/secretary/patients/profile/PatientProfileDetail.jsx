import React from 'react';
import { User, Activity, FileText, Calendar, Heart, Shield } from 'lucide-react';

const PatientProfileDetail = ({ patient }) => {
    return (
        <div className='space-y-4'>
            {/* Basic Information Section */}
            <div className='p-4 sm:p-5 border border-gray-200 rounded-xl dark:border-gray-800 bg-white dark:bg-white/[0.03]'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6'>
                    <div>
                        <h4 className='text-[clamp(16px,2.5vw,18px)] font-bold text-gray-900 dark:text-white'>
                            Personal Information
                        </h4>
                        <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mt-1'>
                            Basic demographic and identification details.
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01]'>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1'>Gender</p>
                        <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient.gender || 'Not specified'}</p>
                    </div>
                    <div className='p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01]'>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1'>Age</p>
                        <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient.age || 'N/A'} years old</p>
                    </div>
                    <div className='p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01]'>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1'>Birthday</p>
                        <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient.birthday || 'Not specified'}</p>
                    </div>
                    <div className='p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01]'>
                        <p className='text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1'>Blood Type</p>
                        <p className='text-sm font-semibold text-gray-800 dark:text-white/90'>{patient.blood_type || 'Unknown'}</p>
                    </div>
                </div>
            </div>

            {/* Medical History Section */}
            <div className='p-4 sm:p-5 border border-gray-200 rounded-xl dark:border-gray-800 bg-white dark:bg-white/[0.03]'>
                <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mb-6'>
                    <div>
                        <h4 className='text-[clamp(16px,2.5vw,18px)] font-bold text-gray-900 dark:text-white'>
                            Medical History & Records
                        </h4>
                        <p className='text-sm font-medium text-gray-500 dark:text-gray-400 mt-1'>
                            Crucial clinical data for treatment planning.
                        </p>
                    </div>
                </div>

                <div className='space-y-4'>
                    <div className='p-4 rounded-lg border border-amber-100 dark:border-amber-500/20 bg-amber-50/30 dark:bg-amber-500/5'>
                        <h5 className='text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2'>
                            <Heart size={14} strokeWidth={3} />
                            Allergies & Conditions
                        </h5>
                        <p className='text-sm text-gray-700 dark:text-gray-300 font-medium'>
                            {patient.allergies || 'No known allergies or conditions recorded.'}
                        </p>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='p-4 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01]'>
                            <h5 className='text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3'>
                                <FileText size={14} />
                                Previous Treatments
                            </h5>
                            <ul className='space-y-2'>
                                {patient.previous_treatments?.length > 0 ? (
                                    patient.previous_treatments.map((t, i) => (
                                        <li key={i} className='text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2'>
                                            <div className='w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0' />
                                            {t}
                                        </li>
                                    ))
                                ) : (
                                    <li className='text-sm text-gray-400 italic'>No treatment history recorded.</li>
                                )}
                            </ul>
                        </div>

                        <div className='p-4 rounded-lg border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-white/[0.01]'>
                            <h5 className='text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 mb-3'>
                                <Shield size={14} />
                                Insurance Info
                            </h5>
                            <div className='space-y-2'>
                                <p className='text-sm text-gray-700 dark:text-gray-300'>
                                    <span className='font-bold text-gray-400'>Provider:</span> {patient.insurance?.provider || 'N/A'}
                                </p>
                                <p className='text-sm text-gray-700 dark:text-gray-300'>
                                    <span className='font-bold text-gray-400'>Policy #:</span> {patient.insurance?.policy_number || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientProfileDetail;
