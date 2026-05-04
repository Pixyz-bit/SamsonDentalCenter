import React from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import StaffRow from './StaffRow';

const FILTERS = [
    { id: 'all', label: 'All Staff' },
    { id: 'admin', label: 'Administrators' },
    { id: 'secretary', label: 'Secretaries' },
    { id: 'receptionist', label: 'Receptionists' },
];

const StaffInbox = ({ 
    staffMembers = [], 
    onStaffClick, 
    searchQuery, 
    onSearchChange,
    activeFilter,
    onFilterChange,
    activeTab,
    onAddClick,
    loading,
    error
}) => {
    // Filter logic
    const filteredStaff = staffMembers.filter(person => {
        const matchesSearch = 
            person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.email?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
            activeFilter === 'all' || 
            person.role?.toLowerCase() === activeFilter.toLowerCase();

        return matchesSearch && matchesFilter;
    });

    const displayStaff = filteredStaff;

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-2xl border-t sm:border border-gray-300 dark:border-gray-800 overflow-hidden shadow-sm'>
            {/* Header / Search Area */}
            <div className='px-4 sm:px-6 py-6 border-b border-gray-200 dark:border-gray-800 space-y-5 bg-white dark:bg-transparent'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='relative flex-grow'>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-5 text-gray-400'>
                            <Search size={20} />
                        </span>
                        <input
                            type='text'
                            placeholder='Search staff by name or email...'
                            className='w-full pl-12 pr-6 py-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-bold text-gray-900 dark:text-white uppercase tracking-tight placeholder:text-gray-400 placeholder:normal-case'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={onAddClick}
                        className='hidden sm:flex items-center gap-3 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shrink-0 shadow-lg shadow-gray-900/10 dark:shadow-white/5'
                    >
                        <UserPlus size={18} strokeWidth={3} />
                        <span>Add Member</span>
                    </button>
                </div>

                {/* Filters */}
                <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1'>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => onFilterChange(filter.id)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all border ${
                                activeFilter === filter.id
                                    ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20'
                                    : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10 border-gray-100 dark:border-white/5'
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
                        <p className='text-sm text-gray-500'>Loading staff members...</p>
                    </div>
                ) : error ? (
                    <div className='flex flex-col items-center justify-center py-20 text-center px-4 text-red-500'>
                        <p className='text-sm font-bold'>Error loading staff</p>
                        <p className='text-xs'>{error}</p>
                    </div>
                ) : displayStaff.length > 0 ? (
                    displayStaff.map((person) => (
                        <StaffRow 
                            key={person.id} 
                            person={person} 
                            activeTab={activeTab}
                            onClick={() => onStaffClick(person.id)} 
                        />
                    ))
                ) : (
                    <div className='flex flex-col items-center justify-center py-20 text-center px-4'>
                        <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-300 dark:text-gray-600 mb-4'>
                            <Users size={32} />
                        </div>
                        <h4 className='text-lg font-bold text-gray-800 dark:text-white mb-1'>
                            No staff found
                        </h4>
                        <p className='text-sm text-gray-500 max-w-[280px]'>
                            Try adjusting your search or filters to find what you're looking for.
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

export default StaffInbox;
