import React from 'react';
import { Search, UserPlus, Users, GitMerge } from 'lucide-react';
import PatientRow from './PatientRow';

const FILTERS = [
    { id: 'all', label: 'All Patients' },
    { id: 'verified', label: 'Verified Accounts' },
    { id: 'stub', label: 'Stub Profiles' },
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
    // Filter logic (Note: Actual filtering should happen in the parent or via API, 
    // but we keep this for resilience with current local-first approach if needed)
    const filteredPatients = patients.filter(patient => {
        const matchesSearch = 
            patient.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.phone?.includes(searchQuery) ||
            patient.patient_id?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter === 'verified') matchesFilter = patient.is_registered === true;
        if (activeFilter === 'stub') matchesFilter = patient.is_registered === false;
        if (activeFilter === 'restricted') matchesFilter = patient.is_booking_restricted === true;
        // Legacy support for secretary filters if needed
        if (activeFilter === 'active') matchesFilter = patient.is_active;
        if (activeFilter === 'inactive') matchesFilter = !patient.is_active;

        return matchesSearch && matchesFilter;
    });

    const displayPatients = filteredPatients;

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden'>
            {/* Header / Search Area */}
            <div className='p-4 sm:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 space-y-4'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='relative flex-grow'>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                            <Search size={18} />
                        </span>
                        <input
                            type='text'
                            placeholder='Search patients by name, email or phone...'
                            className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/[0.03] border-none rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <div className='flex items-center gap-2'>
                        <button 
                            onClick={onMergeClick}
                            className='hidden md:flex items-center gap-2 px-4 py-3 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 shrink-0'
                        >
                            <GitMerge size={16} />
                            <span>Merge Records</span>
                        </button>
                        <button 
                            onClick={onAddClick}
                            className='hidden sm:flex items-center gap-2 px-4 py-3 bg-brand-500 text-white rounded-lg text-xs font-bold hover:bg-brand-600 transition-all active:scale-95 shrink-0'
                        >
                            <UserPlus size={16} />
                            <span>Register Patient</span>
                        </button>
                    </div>
                </div>


                {/* Filters */}
                <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1'>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                                activeFilter === filter.id
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
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

