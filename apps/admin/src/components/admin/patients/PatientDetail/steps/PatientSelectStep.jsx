import React from 'react';
import { User, Users, ChevronRight, ChevronLeft } from 'lucide-react';

const PatientSelectStep = ({ primaryPatient, dependents, selectedPatientId, onSelect, onNext, onPrev }) => {
    const allOptions = [
        {
            id: primaryPatient.id,
            name: primaryPatient.full_name,
            relationship: 'Primary',
            avatar: primaryPatient.avatar_url
        },
        ...dependents.map(d => ({
            id: d.id,
            name: d.full_name,
            relationship: d.relationship_to_primary || 'Dependent',
            avatar: d.avatar_url
        }))
    ];

    const handleSelect = (id) => {
        onSelect(id);
    };

    return (
        <div className='space-y-6'>
            <div className='mb-6'>
                <h3 className='text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2'>
                    <Users size={14} /> Who is this visit for?
                </h3>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {allOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group ${
                                selectedPatientId === option.id
                                ? 'border-brand-500 bg-brand-50/30 dark:bg-brand-500/10'
                                : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] hover:border-brand-500/50'
                            }`}
                        >
                            <div className='w-12 h-12 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0'>
                                {option.avatar ? (
                                    <img src={option.avatar} alt={option.name} className='w-full h-full object-cover' />
                                ) : (
                                    <User size={20} className='text-gray-400 group-hover:text-brand-500 transition-colors' />
                                )}
                            </div>
                            
                            <div className='grow'>
                                <p className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-brand-500 transition-colors'>
                                    {option.name}
                                </p>
                                <span className='px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-400 text-[9px] font-black uppercase tracking-tighter mt-1 inline-block'>
                                    {option.relationship}
                                </span>
                            </div>

                            <ChevronRight size={16} className='text-gray-300 group-hover:text-brand-500 transition-colors' />
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default PatientSelectStep;
