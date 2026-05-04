import React from 'react';
import { Users, User, ShieldAlert, UserPlus, Link2 } from 'lucide-react';
import { Button } from '../../../ui';

const FamilyTab = ({ patient, dependents, navigate, onManageDependents, onAddDependent }) => {
    return (
        <div className='space-y-6 sm:space-y-8 animate-in fade-in duration-300'>
            {/* Header Section */}
            <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Family Ecosystem
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                            Managing dependents and household members
                        </p>
                    </div>
                    <Button 
                        onClick={onAddDependent}
                        className='h-9 sm:h-11 px-4 sm:px-6 bg-brand-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 flex items-center gap-2 rounded-xl'
                    >
                        <UserPlus size={16} />
                        <span>Add Dependent</span>
                    </Button>
                </div>

                {dependents.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
                        {dependents.map(dep => (
                            <div 
                                key={dep.id}
                                onClick={() => navigate(`/patients/profile/${dep.id}`)}
                                className='p-4 sm:p-6 border border-gray-200 dark:border-white/5 rounded-2xl hover:border-brand-500/50 transition-all cursor-pointer bg-gray-50/20 dark:bg-white/[0.01] group flex items-center gap-5'
                            >
                                <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-xl border border-gray-200 dark:border-white/5 bg-white dark:bg-white/5 flex items-center justify-center shrink-0 shadow-sm'>
                                    {dep.avatar_url ? (
                                        <img src={dep.avatar_url} alt={dep.full_name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-white font-bold text-lg sm:text-xl rounded-xl'>
                                            {dep.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className='min-w-0'>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <p className='text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate'>{dep.full_name}</p>
                                        {dep.relationship_to_primary && (
                                            <span className='px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[8px] font-black uppercase tracking-widest'>
                                                {dep.relationship_to_primary}
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest truncate'>
                                        {dep.phone || 'NO CONTACT SET'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='py-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center flex flex-col items-center'>
                        <div className='w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 dark:text-gray-700 mb-6'>
                            <Users size={32} />
                        </div>
                        <h4 className='text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit mb-2'>Isolated Account</h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold max-w-xs mx-auto leading-relaxed'>
                            There are currently no linked dependents or family members associated with this primary profile.
                        </p>
                        <div className='mt-8'>
                            <Button onClick={onAddDependent} className="h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl">Initialize Dependent</Button>
                        </div>
                    </div>
                )}
            </div>

            {!patient.email && (
                <div className='p-5 sm:p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex items-start gap-4'>
                    <div className='p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600'>
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <p className='text-[10px] sm:text-xs text-amber-800 dark:text-amber-200 font-black uppercase tracking-tight mb-1'>Administrative Restriction</p>
                        <p className='text-[9px] sm:text-[11px] text-amber-700 dark:text-amber-400/80 font-bold leading-relaxed uppercase tracking-wide opacity-80'>
                            This profile lacks a registered email. Linking existing accounts requires OTP verification via email. Stub records can still be created manually.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyTab;
