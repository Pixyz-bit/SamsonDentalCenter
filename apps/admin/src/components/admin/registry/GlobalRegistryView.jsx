import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import { useDoctors } from '../../../hooks/useDoctors';
import { ChevronRight, Phone, User, Calendar, Clock, Filter, Search, MoreHorizontal } from 'lucide-react';
import PastAppointmentView from '../patients/PatientDetail/PastAppointmentView';

/**
 * GlobalRegistryView
 * Integrated into the administrative layout.
 * Reuses the "Inbox" container design.
 */
const GlobalRegistryView = ({ mode = 'upcoming' }) => {
    const { token } = useAuth();
    const { fetchDoctorHistory } = useDoctors(false);
    
    const [appointments, setAppointments] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, pages: 1, current_page: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [view, setView] = useState('list');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const getModeConfig = useCallback(() => {
        switch (mode) {
            case 'today':
                return {
                    filters: [
                        { id: 'all', label: 'All Today' },
                        { id: 'CONFIRMED', label: 'Confirmed' },
                        { id: 'IN_PROGRESS', label: 'In Progress' },
                        { id: 'COMPLETED', label: 'Completed' },
                    ],
                    defaultStatus: 'all',
                };
            case 'history':
                return {
                    filters: [
                        { id: 'all', label: 'All History' },
                        { id: 'COMPLETED', label: 'Completed' },
                        { id: 'CANCELLED', label: 'Cancelled' },
                        { id: 'LATE_CANCEL', label: 'Late Cancelled' },
                        { id: 'NO_SHOW', label: 'No-Show' },
                    ],
                    defaultStatus: 'COMPLETED,CANCELLED,LATE_CANCEL,NO_SHOW',
                };
            case 'displaced':
                return {
                    filters: [
                        { id: 'all', label: 'All Displaced' },
                        { id: 'SYSTEM_DISPLACED: Doctor schedule changed', label: 'Doctor Change' },
                        { id: 'SYSTEM_DISPLACED: Service no longer offered by doctor', label: 'Service Change' },
                    ],
                    defaultStatus: 'DISPLACED',
                };
            case 'pending':
                return {
                    filters: [
                        { id: 'PENDING', label: 'Action Required' },
                        { id: 'recent', label: 'New Today' },
                        { id: 'urgent', label: 'High Priority (48h)' },
                    ],
                    defaultStatus: 'PENDING',
                };
            case 'upcoming':
            default:
                return {
                    filters: [
                        { id: 'all', label: 'All Upcoming' },
                        { id: 'general', label: 'General' },
                        { id: 'specialized', label: 'Specialized' },
                    ],
                    defaultStatus: 'CONFIRMED,RESCHEDULED',
                };
        }
    }, [mode]);

    const config = getModeConfig();

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                let statusQuery = config.defaultStatus;
                let tierQuery = null;

                if (activeFilter === 'general' || activeFilter === 'specialized') {
                    tierQuery = activeFilter;
                } else if (activeFilter !== 'all') {
                    statusQuery = activeFilter;
                }

                const params = {
                    page: currentPage,
                    limit: 15,
                    status: statusQuery,
                    search: searchQuery,
                    tier: tierQuery,
                };
                
                if (mode === 'today') {
                    params.date = format(new Date(), 'yyyy-MM-dd');
                } else if (mode === 'upcoming') {
                    params.date_from = format(new Date(), 'yyyy-MM-dd');
                } else if (mode === 'pending' && activeFilter === 'urgent') {
                    const today = new Date();
                    const next48h = new Date();
                    next48h.setDate(today.getDate() + 2);
                    params.date_from = format(today, 'yyyy-MM-dd');
                    params.date_to = format(next48h, 'yyyy-MM-dd');
                }

                const result = await fetchDoctorHistory(null, params);
                let fetchedAppointments = result.appointments || [];

                // Client-side filtering for specific 'pending' filters that backend doesn't support yet
                if (mode === 'pending') {
                    if (activeFilter === 'recent') {
                        const oneDayAgo = new Date();
                        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                        fetchedAppointments = fetchedAppointments.filter(a => a.created_at && new Date(a.created_at) >= oneDayAgo);
                    }
                }

                setAppointments(fetchedAppointments);
                setPagination(result.pagination || { total: 0, pages: 1, current_page: 1 });
            } catch (err) {
                console.error('Registry Sync Failed:', err);
                setError('Failed to synchronize global records.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [mode, activeFilter, currentPage, config.defaultStatus, fetchDoctorHistory, searchQuery]);

    const handleFilterChange = (filterId) => {
        setActiveFilter(filterId);
        setCurrentPage(1);
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
        if (s === 'CANCELLED' || s === 'LATE_CANCEL' || s === 'REJECTED' || s === 'DISPLACED') return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
        if (s === 'NO_SHOW' || s === 'PENDING') return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
        if (s === 'UPCOMING' || s === 'RESCHEDULED' || s === 'IN_PROGRESS') return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20';
    };

    if (view === 'details' && selectedAppointment) {
        return (
            <div className='grow h-full bg-white dark:bg-white/[0.03] sm:rounded-2xl border border-gray-300 dark:border-gray-800 overflow-hidden shadow-sm'>
                <PastAppointmentView 
                    appointment={selectedAppointment} 
                    token={token} 
                    onBack={() => setView('list')} 
                />
            </div>
        );
    }

    return (
        <div className='flex flex-col grow h-full bg-white dark:bg-white/[0.03] border-t sm:border border-gray-200 dark:border-gray-800 sm:rounded-xl overflow-hidden shadow-sm'>
            {/* 1. Header: Search & Filters (Matching Services Catalog) */}
            <div className='px-4 sm:px-6 py-5 border-b border-gray-200 dark:border-gray-800 space-y-4 bg-white dark:bg-transparent'>
                <div className='flex items-center justify-between gap-4'>
                    <div className='relative flex-grow'>
                        <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                            <Search size={18} />
                        </span>
                        <input
                            type='text'
                            placeholder='Search by patient, provider, or clinical notes...'
                            className='w-full pl-11 pr-6 py-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1'>
                    {config.filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterChange(filter.id)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                                activeFilter === filter.id
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. List Area: Registry Cards */}
            <div className='flex-grow overflow-y-auto no-scrollbar'>
                {isLoading ? (
                    <div className='py-20 flex flex-col items-center justify-center'>
                        <div className='w-10 h-10 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin mb-4' />
                        <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>Syncing Registry...</span>
                    </div>
                ) : error ? (
                    <div className='py-20 text-center px-4'>
                        <p className='text-sm font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-tight'>{error}</p>
                        <button onClick={() => setCurrentPage(p => p)} className='text-[10px] font-black text-brand-500 uppercase tracking-widest hover:underline'>Retry Sync</button>
                    </div>
                ) : appointments.length > 0 ? (
                    <div className='p-4 sm:p-4 lg:p-6 space-y-4'>
                        {appointments.map((appt) => (
                            <div 
                                key={appt.id} 
                                onClick={() => {
                                    setSelectedAppointment(appt);
                                    setView('details');
                                }}
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
                                        <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="px-2 sm:px-4 py-2 sm:py-3">
                                            <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                                            <p className="text-[9px] sm:text-[11px] font-black text-brand-500 leading-none">
                                                {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="flex-grow p-3 sm:p-4 flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg shadow-brand-500/20 border-2 border-white dark:border-gray-900">
                                                {appt.patient?.photo_url || appt.patient?.avatar_url ? (
                                                    <img src={appt.patient?.photo_url || appt.patient?.avatar_url} alt="" className='w-full h-full object-cover rounded-full' />
                                                ) : (
                                                    (appt.patient?.name || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <p className="text-xs sm:text-base font-black text-gray-900 dark:text-white leading-tight mb-0.5 sm:mb-1 truncate uppercase tracking-tight">{appt.patient?.name || appt.guest_name || 'Anonymous'}</p>
                                            <div className="flex flex-col gap-0.5 sm:gap-1">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <p className="text-[8px] sm:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">
                                                        {appt.service || 'General Clinical Service'}
                                                    </p>
                                                    <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                                                    <p className="text-[8px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate">
                                                        {appt.dentist?.profile?.last_name || 'Unassigned'}
                                                    </p>
                                                </div>
                                                <p className="text-[8px] sm:text-[11px] font-medium text-gray-500 flex items-center gap-1.5 sm:gap-2">
                                                    <Phone size={8} className="text-green-500 sm:w-[10px]" />
                                                    <span className="text-gray-800 dark:text-gray-200">{appt.patient?.phone || appt.guest_phone || 'No Phone'}</span>
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
                                        <div className="px-5 py-3.5 flex flex-col items-start gap-2">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Source</p>
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 truncate w-full text-left`}>
                                                {appt.source || 'Portal Booking'}
                                            </span>
                                        </div>
                                        <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />
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

                        {/* Pagination Area */}
                        {pagination.pages > 1 && (
                            <div className='flex items-center justify-center gap-2 pt-4 pb-8'>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className='p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30'
                                >
                                    <ChevronRight size={20} className='rotate-180' />
                                </button>
                                <span className='text-[10px] font-black uppercase tracking-widest text-gray-400 px-4'>
                                    Page {currentPage} of {pagination.pages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={currentPage === pagination.pages || isLoading}
                                    className='p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30'
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center py-24 text-center px-4'>
                        <div className='w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300 dark:text-gray-600 mb-6'>
                            <Filter size={32} />
                        </div>
                        <h4 className='text-lg font-black text-gray-900 dark:text-white font-outfit uppercase tracking-tight mb-2'>
                            Registry Empty
                        </h4>
                        <p className='text-xs text-gray-500 uppercase font-bold tracking-widest max-w-[280px]'>
                            No matching records found for this global filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalRegistryView;
