import React, { useState, useEffect } from 'react';
import { useDoctors } from '../../../../hooks/useDoctors';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../../../context/AuthContext';
import { ChevronRight, Phone, User } from 'lucide-react';
import PastAppointmentView from '../../patients/PatientDetail/PastAppointmentView';
import RequestReviewView from '../../patients/PatientDetail/RequestReviewView';


const DoctorHistoryDetail = ({ doctor, filterMode = 'history' }) => {
    const { token } = useAuth();
    const { fetchDoctorHistory } = useDoctors(false);
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, current_page: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [view, setView] = useState('list');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const isUpcoming = filterMode === 'upcoming';
    const isPending = filterMode === 'pending';

    const currentFilters = isPending ? [
        { id: 'all', label: 'All Pending' },
        { id: 'GENERAL', label: 'General' },
        { id: 'SPECIALIZED', label: 'Specialized' },
    ] : isUpcoming ? [
        { id: 'all', label: 'All Upcoming' },
        { id: 'GENERAL', label: 'General' },
        { id: 'SPECIALIZED', label: 'Specialized' },
    ] : [
        { id: 'all', label: 'All History' },
        { id: 'COMPLETED', label: 'Completed' },
        { id: 'CANCELLED', label: 'Cancelled' },
        { id: 'NO_SHOW', label: 'No-Show' },
    ];

    useEffect(() => {
        const loadHistory = async () => {
            if (!doctor?.id) return;
            try {
                setIsLoading(true);
                setError(null);
                
                // Map activeFilter to a backend-compatible status or null
                let statusQuery = activeFilter;
                let tierQuery = null;
                
                if (isPending) {
                    // For pending tab, if filter is GENERAL/SPECIALIZED, we still fetch PENDING status
                    statusQuery = 'PENDING';
                    if (activeFilter === 'GENERAL' || activeFilter === 'SPECIALIZED') {
                        tierQuery = activeFilter.toLowerCase();
                    }
                } else if (isUpcoming) {
                    // For upcoming tab, if filter is GENERAL/SPECIALIZED, we still fetch APPROVED status
                    statusQuery = 'CONFIRMED,RESCHEDULED';
                    if (activeFilter === 'GENERAL' || activeFilter === 'SPECIALIZED') {
                        tierQuery = activeFilter.toLowerCase();
                    }
                } else {
                    // For history tab, if filter is 'all', we fetch all finalized statuses
                    if (activeFilter === 'all') statusQuery = 'COMPLETED,CANCELLED,LATE_CANCEL,NO_SHOW';
                }

                const result = await fetchDoctorHistory(doctor.id, { 
                    page: currentPage, 
                    limit: 10, 
                    status: statusQuery,
                    tier: tierQuery
                });
                setHistory(result.appointments || []);
                setPagination(result.pagination || { total: 0, pages: 1, current_page: 1 });
            } catch (err) {
                console.error('Failed to load doctor appointments:', err);
                setError('Failed to synchronize appointment records.');
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [doctor?.id, fetchDoctorHistory, activeFilter, currentPage, isUpcoming, isPending]);

    const handleFilterChange = (filterId) => {
        setActiveFilter(filterId);
        setCurrentPage(1);
    };

    const filteredHistory = history.filter(app => {
        const matchesSearch = 
            (app.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.patient?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        const status = (app.status || '').toUpperCase();
        const tier = (app.service_tier || app.service?.tier || 'general').toUpperCase();

        // 1. Tier Filtering (for Pending/Upcoming tabs)
        if (activeFilter === 'GENERAL' && tier !== 'GENERAL') return false;
        if (activeFilter === 'SPECIALIZED' && tier !== 'SPECIALIZED') return false;

        // 2. Client-side Search (handled by matchesSearch above)

        return true;
    });

    const handleRowClick = (appt) => {
        setSelectedAppointment(appt);
        setView('details');
    };

    const formatTime = (time) => {
        if (!time) return '';
        const parts = time.split(':');
        if (parts.length < 2) return time;
        const [hours, minutes] = parts;
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    const getStatusStyle = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'COMPLETED' || s === 'APPROVED' || s === 'CONFIRMED') return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
        if (s === 'CANCELLED' || s === 'LATE_CANCEL' || s === 'REJECTED') return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
        if (s === 'NO_SHOW' || s === 'PENDING') return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
        if (s === 'UPCOMING' || s === 'RESCHEDULED') return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20';
    };

    if (view === 'details' && selectedAppointment) {
        if (isPending) {
            return (
                <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
                    <RequestReviewView
                        appointment={selectedAppointment}
                        token={token}
                        onBack={() => setView('list')}
                        onActionSuccess={() => {
                            setView('list');
                            // We should really re-fetch here
                        }}
                    />
                </div>
            );
        }

        return (
            <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
                <PastAppointmentView 
                    appointment={selectedAppointment} 
                    token={token} 
                    onBack={() => setView('list')} 
                />
            </div>
        );
    }

    return (
        <div className='animate-in fade-in duration-300'>
            {/* Integrated Search & Filter Header (1:1 with User Tab) */}
            <div className='w-full p-4 sm:p-6 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm mb-6'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                    <div>
                        <h4 className='text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Appointment Registry
                        </h4>
                        <p className='text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 font-bold'>
                            {isPending ? 'Reviewing pending booking requests' : isUpcoming ? 'Monitoring future schedule volume' : 'Auditing historical clinical records'}
                        </p>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row items-center gap-3 sm:gap-4'>
                    <div className='relative flex-grow group w-full lg:w-auto'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors' size={14} />
                        <input 
                            type="text" 
                            placeholder="Search by service or provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full h-9 sm:h-10 px-10 rounded-xl bg-gray-50/50 dark:bg-white/[0.03] border border-gray-300 dark:border-gray-700 text-[10px] sm:text-[11px] font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400'
                        />
                    </div>
                    <div className='flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 w-full lg:w-auto'>
                        {currentFilters.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => handleFilterChange(f.id)}
                                className={`h-9 sm:h-10 px-3 sm:px-6 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                    activeFilter === f.id
                                        ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                                        : 'bg-white dark:bg-white/5 border-gray-300 dark:border-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className='grow min-h-[400px] flex flex-col justify-between'>
                {isLoading ? (
                        <div className='py-20 flex flex-col items-center justify-center bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-300 dark:border-gray-800 shadow-sm'>
                            <div className='w-10 h-10 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin mb-4' />
                            <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Syncing Registry...</span>
                        </div>
                    ) : error ? (
                        <div className='py-20 text-center bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-300 dark:border-gray-800 shadow-sm'>
                            <p className='text-sm font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-tight'>{error}</p>
                            <button onClick={() => setCurrentPage(prev => prev)} className='text-[10px] font-black text-brand-500 uppercase tracking-widest hover:underline'>Retry Connection</button>
                        </div>
                    ) : filteredHistory.length > 0 ? (
                        <div className='flex flex-col gap-3'>
                            {filteredHistory.map((appt) => (
                                <div 
                                    key={appt.id} 
                                    onClick={() => handleRowClick(appt)}
                                    className='group relative cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all p-0 border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-white/[0.01] shadow-sm hover:shadow-md overflow-hidden'
                                >
                                    <div className='flex flex-row w-full'>
                                        {/* Left Side: Date & Time */}
                                        <div className="flex flex-col justify-center w-24 sm:w-36 bg-gray-50/50 dark:bg-gray-800/30 border-r border-gray-300 dark:border-gray-700 shrink-0 text-center sm:text-left">
                                            <div className="px-2 sm:px-4 py-2 sm:py-3">
                                                <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
                                                <p className="text-[9px] sm:text-[11px] font-black text-gray-900 dark:text-white leading-none uppercase tracking-tighter">
                                                    {appt.date ? format(parseISO(appt.date), 'MMM dd, yyyy') : 'No Date'}
                                                </p>
                                            </div>
                                            <div className="h-[1px] w-full bg-gray-300 dark:bg-gray-700" />
                                            <div className="px-2 sm:px-4 py-2 sm:py-3">
                                                <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                                                <p className="text-[9px] sm:text-[11px] font-black text-brand-500 leading-none">
                                                    {formatTime(appt.start_time || '08:00')} - {formatTime(appt.end_time || '08:30')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Main Content Area */}
                                        <div className="flex-grow p-3 sm:p-4 flex items-center gap-3 sm:gap-4 min-w-0">
                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg shadow-brand-500/20 border-2 border-white dark:border-gray-900">
                                                    {appt.patient?.photo_url || appt.patient?.avatar_url ? (
                                                        <img src={appt.patient?.photo_url || appt.patient?.avatar_url} alt={appt.patient?.name} className='w-full h-full object-cover rounded-full' />
                                                    ) : (
                                                        (appt.patient?.name || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <p className="text-xs sm:text-base font-black text-gray-900 dark:text-white leading-tight mb-0.5 sm:mb-1 truncate uppercase tracking-tight">{appt.patient?.name || 'Anonymous Patient'}</p>
                                                <div className="flex flex-col gap-0.5 sm:gap-1">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <p className="text-[8px] sm:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">
                                                            {appt.service || 'General Clinical Service'}
                                                        </p>
                                                        <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                                                        <p className="text-[8px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate">
                                                            {appt.dentist?.profile?.last_name || doctor.last_name || 'Unassigned'}
                                                        </p>
                                                    </div>
                                                    <p className="text-[8px] sm:text-[11px] font-medium text-gray-500 flex items-center gap-1.5 sm:gap-2">
                                                        <Phone size={8} className="text-green-500 sm:w-[10px]" />
                                                        <span className="text-gray-800 dark:text-gray-200">{appt.patient?.phone || 'No Phone'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Only: Floating View Indicator */}
                                        <div className='absolute bottom-3 right-3 sm:hidden flex items-center gap-1 bg-brand-50/50 dark:bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-100 dark:border-brand-500/20'>
                                            <span className='text-[7px] font-black text-brand-500 uppercase tracking-widest'>View</span>
                                            <ChevronRight size={10} className='text-brand-500' />
                                        </div>

                                        {/* Right Side: Status Badges (Desktop Only) */}
                                        <div className="hidden sm:flex flex-col items-stretch justify-center border-l border-gray-300 dark:border-gray-700 bg-gray-50/20 dark:bg-white/[0.01] shrink-0 w-[180px]">
                                            {/* Source */}
                                            <div className="px-5 py-3.5 flex flex-col items-start gap-2">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Source</p>
                                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 truncate w-full text-left`}>
                                                    {appt.source || 'Portal Booking'}
                                                </span>
                                            </div>

                                            <div className="h-[1px] w-full bg-gray-300 dark:bg-gray-700" />

                                            {/* Status */}
                                            <div className="px-5 py-3.5 flex flex-col items-start gap-2">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                                                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border shadow-sm w-full text-center ${getStatusStyle(appt.status)}`}>
                                                    {appt.status === 'CONFIRMED' ? 'APPROVED' : appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='py-20 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center bg-gray-50/30 dark:bg-white/[0.01]'>
                            <p className='text-sm font-black text-gray-400 uppercase tracking-widest'>No records found in this category.</p>
                            <button onClick={() => setActiveFilter('all')} className='text-[10px] font-black text-brand-500 mt-2 uppercase tracking-widest hover:underline'>Clear Global Filters</button>
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
        );
};

export default DoctorHistoryDetail;
