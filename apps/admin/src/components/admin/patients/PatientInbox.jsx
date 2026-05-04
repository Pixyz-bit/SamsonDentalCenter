import React from 'react';
import { Search, UserPlus, Users, GitMerge } from 'lucide-react';
import PatientRow from './PatientRow';

const FILTERS = [
    { id: 'all', label: 'All Patients' },
    { id: 'verified', label: 'User Accounts' },
    { id: 'stub', label: 'Offline Profiles' },
    { id: 'restricted', label: 'Restricted' },
];

const PatientInbox = ({ 
    patients = [], 
    onPatientClick, 
    searchQuery, 
    onSearchChange,
    activeFilter,
    onFilterChange,
    activeTab,
    onAddClick,
    onMergeClick,
    loading,
    error
}) => {
    // Filter logic
    const filteredPatients = patients.filter(patient => {
        const matchesSearch = 
            patient.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.phone?.includes(searchQuery);
        
        let matchesFilter = true;
        if (activeFilter === 'verified') matchesFilter = patient.is_registered === true;
        if (activeFilter === 'stub') matchesFilter = patient.is_registered === false;
        if (activeFilter === 'restricted') matchesFilter = patient.is_booking_restricted === true;

        return matchesSearch && matchesFilter;
    });

    const displayPatients = filteredPatients;

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-100 dark:border-gray-800 overflow-hidden'>
            {/* Standardized Search & Filter Header */}
            <div className='px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 space-y-3 bg-white/50 dark:bg-white/[0.01]'>
                <div className='flex items-center justify-between gap-3'>
                    <div className='relative max-w-sm grow group'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors' size={14} />
                        <input
                            type='text'
                            placeholder='Search patients...'
                            className='w-full h-9 pl-10 pr-4 rounded-lg bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className='flex items-center gap-2'>
                        <button 
                            onClick={onMergeClick}
                            className='h-9 px-4 hidden md:flex items-center gap-2 rounded-lg bg-white dark:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95'
                        >
                            <GitMerge size={14} />
                            <span>Merge</span>
                        </button>
                        <button 
                            onClick={onAddClick}
                            className='h-9 px-4 flex items-center gap-2 rounded-lg bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95'
                        >
                            <UserPlus size={14} />
                            <span className='hidden sm:inline'>New Patient</span><span className='sm:hidden'>Add</span>
                        </button>
                    </div>
                </div>

                <div className='flex items-center gap-2 overflow-x-auto no-scrollbar'>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeFilter === filter.id
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List Area */}
            <div className='grow flex flex-col min-h-120 md:min-h-140 overflow-y-auto no-scrollbar'>
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
                        <div className='w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4'></div>
                        <p className='text-sm text-gray-500'>Loading patient directory...</p>
                    </div>
                ) : error ? (
                    <div className='flex flex-col items-center justify-center py-20 text-center px-4 text-red-500'>
                        <p className='text-sm font-bold'>Error loading patients</p>
                        <p className='text-xs'>{error}</p>
                    </div>
                ) : displayPatients.length > 0 ? (
                    displayPatients.map((patient) => (
                        <PatientRow 
                            key={patient.id} 
                            patient={patient} 
                            activeTab={activeTab}
                            onClick={() => onPatientClick(patient.id)} 
                        />
                    ))
                ) : (
                    <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
                        <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4'>
                            <Users size={32} />
                        </div>
                        <h4 className='text-lg font-bold text-gray-800 dark:text-white mb-1'>
                            No patients found
                        </h4>
                        <p className='text-sm text-gray-500 max-w-[280px]'>
                            Try adjusting your search or filters to find the patient record.
                        </p>
                    </div>
                )}
            </div>
            
            {/* Footer Area */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-5 border-t border-gray-100 dark:border-gray-800 sm:shadow-none'>
                <div className='flex flex-col items-center justify-center w-full max-w-md mx-auto'>
                    <div className='flex items-center justify-center w-full'>
                        <div className='flex gap-1'>
                            {[1].map(n => (
                                <button key={n} className='w-8 h-8 rounded-lg bg-brand-500 text-white text-xs font-bold leading-none flex items-center justify-center'>{n}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientInbox;
