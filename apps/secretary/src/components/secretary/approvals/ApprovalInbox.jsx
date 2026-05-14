import React from 'react';
import { Search, ListFilter, SearchX, Clock, Calendar, Users, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useSidebar } from '../../../context/SidebarContext';
import ApprovalRow from './ApprovalRow';

const CATEGORIES = [
    { id: 'all', label: 'All Requests', icon: ListFilter },
    { id: 'urgent', label: 'Urgent', icon: Zap },
    { id: 'stale', label: 'Needs Attention', icon: Clock },
    { id: 'recent', label: 'Recent Request', icon: Calendar },
];

const ITEMS_PER_PAGE = 8;

const ApprovalInbox = ({
    requests,
    allRequests,
    activeFilter,
    onFilterChange,
    searchQuery,
    onSearchChange,
    selectedService,
    onServiceChange,
    availableServices = [],
    selectedDoctor,
    onDoctorChange,
    availableDoctors = [],
    onRowClick,
    currentPage,
    onPageChange
}) => {
    const { isMobileOpen } = useSidebar();

    const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
    const paginatedRequests = requests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
            
            {/* Aligned Toolbar - One to One with User Portal MyRequests */}
            <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                
                {/* Search Row */}
                <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                    <div className='relative flex-grow w-full'>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                            <Search size={18} />
                        </span>
                        <input
                            type='text'
                            placeholder='Search by patient name...'
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                        />
                    </div>
                </div>

                {/* Dropdown Filters Row - Matched to User Portal 1:1 */}
                <div className='px-4 sm:px-6 pb-5 pt-2'>
                    <div className='flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-2'>
                        
                        {/* 1. Service Filter */}
                        <div className='relative w-[170px] sm:w-[190px] shrink-0'>
                            <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                <ListFilter size={16} />
                            </div>
                            <select
                                value={selectedService}
                                onChange={(e) => onServiceChange(e.target.value)}
                                className='w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                            >
                                {availableServices.map(s => <option key={s} value={s} className='dark:bg-gray-900'>{s}</option>)}
                            </select>
                            <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                        </div>

                        {/* 2. Doctor Filter */}
                        <div className='relative w-[150px] sm:w-[170px] shrink-0'>
                            <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                <Users size={16} />
                            </div>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => onDoctorChange(e.target.value)}
                                className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                            >
                                {availableDoctors.map(d => <option key={d} value={d} className='dark:bg-gray-900'>{d}</option>)}
                            </select>
                            <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                        </div>

                        {/* 3. Priority/Category Filter */}
                        <div className='relative w-[150px] sm:w-[170px] shrink-0'>
                            <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                <Clock size={16} />
                            </div>
                            <select
                                value={activeFilter}
                                onChange={(e) => onFilterChange(e.target.value)}
                                className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                            >
                                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className='dark:bg-gray-900'>{cat.label}</option>)}
                            </select>
                            <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                        </div>
                        
                        <div className='hidden lg:block ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60'>
                            Total Requests: {requests.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Body - Style matched to AppointmentTable */}
            <div className='overflow-y-auto grow pb-24 sm:pb-8 flex flex-col gap-0 sm:gap-4 p-0 sm:p-6 no-scrollbar'>
                {paginatedRequests.length > 0 ? (
                    paginatedRequests.map((request) => (
                        <ApprovalRow
                            key={request.id}
                            request={request}
                            onClick={() => onRowClick(request.id)}
                        />
                    ))
                ) : (
                    <div className='flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-300'>
                        <div className='w-20 h-20 bg-gray-50 dark:bg-white/[0.03] rounded-[32px] flex items-center justify-center mb-6'>
                            <SearchX className='text-gray-300 dark:text-gray-700' size={32} />
                        </div>
                        <h3 className='text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight'>No matching requests</h3>
                        <p className='text-sm text-gray-400 max-w-[280px] font-medium leading-relaxed'>
                            Refine your search or filters to locate specific patient entries.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination matched to AppointmentPagination style */}
            {totalPages > 1 && (
                <div className='relative z-30 bg-white dark:bg-gray-900 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0'>
                    <div className='flex flex-row items-center justify-between w-full'>
                        <div className='hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                            Page {currentPage} of {totalPages}
                        </div>

                        <div className='flex items-center gap-2 mx-auto sm:mx-0'>
                            <button 
                                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                                className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-all'
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            
                            {[...Array(totalPages)].map((_, i) => {
                                const pageNum = i + 1;
                                // Simple logic to show current, first, last, and neighbors
                                if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) return null;
                                return (
                                    <button 
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                                            currentPage === pageNum 
                                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button 
                                onClick={() => onPageChange(currentPage + 1)}
                                className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-all'
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className='hidden sm:block w-[100px]' />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalInbox;
