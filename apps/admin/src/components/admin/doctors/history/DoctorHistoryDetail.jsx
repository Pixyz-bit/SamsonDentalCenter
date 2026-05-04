import React, { useState, useEffect } from 'react';
import { useDoctors } from '../../../../hooks/useDoctors';
import { format, parseISO } from 'date-fns';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Rejected' },
];

const DoctorHistoryDetail = ({ doctor }) => {
    const { fetchDoctorHistory } = useDoctors(false);
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, current_page: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const loadHistory = async () => {
            if (!doctor?.id) return;
            try {
                setIsLoading(true);
                setError(null);
                const result = await fetchDoctorHistory(doctor.id, { 
                    page: currentPage, 
                    limit: 10, 
                    status: activeFilter 
                });
                setHistory(result.appointments || []);
                setPagination(result.pagination || { total: 0, pages: 1, current_page: 1 });
            } catch (err) {
                console.error('Failed to load doctor history:', err);
                setError('Failed to load clinical history records.');
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [doctor?.id, fetchDoctorHistory, activeFilter, currentPage]);

    const handleFilterChange = (filterId) => {
        setActiveFilter(filterId);
        setCurrentPage(1); // Reset to first page
    };

    const getStatusStyle = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'COMPLETED') return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
        if (s === 'CANCELLED' || s === 'LATE_CANCEL' || s === 'REJECTED') return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
        if (s === 'NO_SHOW' || s === 'PENDING') return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
        if (s === 'UPCOMING' || s === 'APPROVED') return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20';
    };

    return (
        <div className='animate-in fade-in duration-300'>
            <div className='p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm flex flex-col'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit'>
                            Clinical Registry
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-1 font-bold'>
                            {pagination.total} Historical Appointments Found
                        </p>
                    </div>
                    <div className='flex items-center gap-2 overflow-x-auto no-scrollbar'>
                        {FILTERS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => handleFilterChange(f.id)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                                    activeFilter === f.id 
                                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/5'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className='grow min-h-[400px] flex flex-col justify-between'>
                    {isLoading ? (
                        <div className='py-20 flex flex-col items-center justify-center'>
                            <div className='w-10 h-10 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin mb-4' />
                            <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Syncing Registry...</span>
                        </div>
                    ) : error ? (
                        <div className='py-20 text-center'>
                            <p className='text-sm font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-tight'>{error}</p>
                            <button onClick={() => setCurrentPage(prev => prev)} className='text-[10px] font-black text-brand-500 uppercase tracking-widest hover:underline'>Retry Connection</button>
                        </div>
                    ) : history.length > 0 ? (
                        <div className='overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm'>
                            <div className='divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-transparent'>
                                {history.map((appt) => (
                                    <div key={appt.id} className='px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors group'>
                                        <div className='flex items-center gap-4'>
                                            <div className='hidden sm:flex w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 items-center justify-center font-black text-[10px] text-brand-500 uppercase group-hover:scale-105 transition-transform'>
                                                {(appt.patient?.name || 'P').split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className='text-xs sm:text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight'>{appt.patient?.name || 'Anonymous Patient'}</p>
                                                <p className='text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5'>{appt.service || 'General Service'}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-row items-center justify-between sm:flex-col sm:items-end gap-2'>
                                            <p className='text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight'>
                                                {appt.date ? format(parseISO(appt.date), 'MMM dd, yyyy') : 'No Date'}
                                            </p>
                                            <span className={`text-[8px] font-black px-3 py-1 rounded-lg border uppercase tracking-[0.15em] ${getStatusStyle(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className='py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center'>
                            <p className='text-sm font-medium text-gray-400'>No records found for this filter.</p>
                            <button onClick={() => setActiveFilter('all')} className='text-xs font-bold text-brand-500 mt-2 hover:underline'>Clear Filters</button>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className='mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-1.5'>
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className='p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all'
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <div className='flex items-center gap-1'>
                                {Array.from({ length: pagination.pages }).map((_, i) => {
                                    const p = i + 1;
                                    // Basic logic to show limited pages if many
                                    if (pagination.pages > 5 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== pagination.pages) return null;
                                    
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                                currentPage === p 
                                                    ? 'bg-brand-500 text-white shadow-sm' 
                                                    : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={currentPage === pagination.pages || isLoading}
                                className='p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30 transition-all'
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorHistoryDetail;
