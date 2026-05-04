import React from 'react';
import { Users, User, ShieldAlert, UserPlus, Link2 } from 'lucide-react';
import { Button } from '../../../ui';

const FamilyTab = ({ patient, dependents, navigate, onManageDependents, onAddDependent }) => {
    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h4 className='text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2'>
                    <Users size={14} /> Dependents & Family Members
                </h4>
                <div className='flex items-center gap-3'>
                    <Button 
                        onClick={onAddDependent}
                        className='h-10 px-4 bg-brand-500 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-brand-500/20'
                    >
                        <UserPlus size={14} className="mr-2" />
                        Add Dependent
                    </Button>
                </div>
            </div>

            {dependents.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {dependents.map(dep => (
                        <div 
                            key={dep.id}
                            onClick={() => navigate(`/patients/profile/${dep.id}`)}
                            className='p-4 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-brand-500/50 transition-all cursor-pointer bg-white dark:bg-white/[0.02] group'
                        >
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center'>
                                    {dep.avatar_url ? (
                                        <img src={dep.avatar_url} alt={dep.full_name} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <User size={18} className='text-gray-400 group-hover:text-brand-500 transition-colors' />
                                    )}
                                </div>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <p className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>{dep.full_name}</p>
                                        {dep.relationship_to_primary && (
                                            <span className='px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[9px] font-black uppercase tracking-tighter'>
                                                {dep.relationship_to_primary}
                                            </span>
                                        )}
                                    </div>
                                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5'>
                                        {dep.phone || 'No phone set'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='p-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center'>
                    <Users size={32} className='mx-auto text-gray-300 dark:text-gray-700 mb-4' />
                    <h4 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>No Dependents Linked</h4>
                    <p className='text-xs text-gray-500 mt-2 max-w-xs mx-auto'>
                        You can create new dependent profiles or link existing offline records to this primary account.
                    </p>
                    <div className='mt-6 flex items-center justify-center'>
                        <Button onClick={onAddDependent} className="text-[10px] h-9 px-4 uppercase tracking-widest">Add Dependent</Button>
                    </div>
                </div>
            )}

            {!patient.email && (
                <div className='p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 flex items-start gap-3'>
                    <ShieldAlert size={18} className='text-amber-500 shrink-0 mt-0.5' />
                    <p className='text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed'>
                        <span className='font-bold block uppercase mb-1'>Limited Functionality</span>
                        To link existing accounts via OTP verification, this primary profile requires a registered email address. You can still create new stub dependents without an email.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FamilyTab;
