import React, { useState, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../../context/AuthContext';
import { useDoctors } from '../../../hooks/useDoctors';
import {
    ChevronRight,
    Phone,
    User,
    Calendar,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    Eye,
} from 'lucide-react';
import UnifiedRegistryDetailViewer from './UnifiedRegistryDetailViewer';

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
    const [refreshKey, setRefreshKey] = useState(0);

    // Reset view when mode changes (e.g., clicking a different sidebar link)
    useEffect(() => {
        setView('list');
        setSelectedAppointment(null);
        setActiveFilter('all');
        setCurrentPage(1);
        setSearchQuery('');
    }, [mode]);

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
                        {
                            id: 'SYSTEM_DISPLACED: Service no longer offered by doctor',
                            label: 'Service Change',
                        },
                    ],
                    defaultStatus: 'DISPLACED',
                };
            case 'pending':
                return {
                    filters: [
                        { id: 'all', label: 'Action Required' },
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
                } else if (activeFilter !== 'all' && activeFilter !== 'recent' && activeFilter !== 'urgent') {
                    statusQuery = activeFilter;
                }

                const params = {
                    page: currentPage,
                    limit: 50,
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
                } else if (mode === 'pending' && activeFilter === 'recent') {
                    params.created_at = format(new Date(), 'yyyy-MM-dd');
                }

                const result = await fetchDoctorHistory(null, params);
                let fetchedAppointments = result.appointments || [];

                // Client-side filtering for specific 'pending' filters that backend doesn't support yet
                if (mode === 'pending') {
                    // No client-side filtering needed for recent anymore
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
    }, [
        mode,
        activeFilter,
        currentPage,
        config.defaultStatus,
        fetchDoctorHistory,
        searchQuery,
        refreshKey,
    ]);

    const refreshData = () => {
        setRefreshKey((prev) => prev + 1);
        setCurrentPage(1);
    };

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

    const getSourceBadge = (source) => {
        const s = source?.toLowerCase() || '';
        if (s.includes('guest')) {
            return (
                <span className="px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-[9px] font-black text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 uppercase tracking-tighter">
                    Guest
                </span>
            );
        }
        if (s.includes('user')) {
            return (
                <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 uppercase tracking-tighter">
                    Patient
                </span>
            );
        }
        if (s.includes('admin')) {
            return (
                <span className="px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-gray-500/10 text-[9px] font-black text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-500/20 uppercase tracking-tighter">
                    Admin
                </span>
            );
        }
        return null;
    };

    const getStatusStyle = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'COMPLETED' || s === 'APPROVED' || s === 'CONFIRMED')
            return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20';
        if (s === 'CANCELLED' || s === 'LATE_CANCEL' || s === 'REJECTED' || s === 'DISPLACED')
            return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border-red-100 dark:border-red-500/20';
        if (s === 'NO_SHOW' || s === 'PENDING')
            return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20';
        if (s === 'UPCOMING' || s === 'RESCHEDULED' || s === 'IN_PROGRESS')
            return 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20';
        return 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-500/10 border-slate-100 dark:border-slate-500/20';
    };

    if (view === 'details' && selectedAppointment) {
        return (
            <div className='grow min-h-full bg-white dark:bg-white/[0.03] sm:rounded-2xl border border-gray-300 dark:border-gray-800 shadow-sm'>
                <UnifiedRegistryDetailViewer
                    appointmentId={selectedAppointment.id}
                    mode={mode}
                    onBack={() => setView('list')}
                    onStatusChange={() => {
                        setView('list');
                        refreshData();
                    }}
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
                            {activeFilter === filter.id && pagination.total > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-black">
                                    {pagination.total}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. List Area: Registry Cards */}
            <div className='flex-grow overflow-y-auto no-scrollbar'>
                {isLoading ? (
                    <div className='py-20 flex flex-col items-center justify-center'>
                        <div className='w-10 h-10 border-4 border-brand-500/10 border-t-brand-500 rounded-full animate-spin mb-4' />
                        <span className='text-[10px] font-black text-gray-500 uppercase tracking-widest'>
                            Syncing Registry...
                        </span>
                    </div>
                ) : error ? (
                    <div className='py-20 text-center px-4'>
                        <p className='text-sm font-bold text-red-600 dark:text-red-400 mb-2 uppercase tracking-tight'>
                            {error}
                        </p>
                        <button
                            onClick={() => setCurrentPage((p) => p)}
                            className='text-[10px] font-black text-brand-500 uppercase tracking-widest hover:underline'
                        >
                            Retry Sync
                        </button>
                    </div>
                ) : appointments.length > 0 ? (
                    <>
                        <div className='p-4 sm:p-4 lg:p-6 space-y-4'>
                            {appointments.map((appt) => (
                                <div
                                    key={appt.id}
                                    onClick={() => {
                                        setSelectedAppointment(appt);
                                        setView('details');
                                    }}
                                    className='relative z-[1] flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer'
                                >
                                    {/* Sidebar: Schedule & Time Slot */}
                                    <div className='flex flex-row sm:flex-col w-full sm:w-[140px] bg-gray-50/50 dark:bg-gray-800/30 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0'>
                                        <div className='flex-1 flex flex-col justify-center px-4 py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1'>
                                                Schedule
                                            </span>
                                            <span className='text-xs sm:text-xs font-bold text-[#0B1120] dark:text-white font-outfit truncate'>
                                                {appt.date
                                                    ? format(parseISO(appt.date), 'MMM dd, yyyy')
                                                    : 'No Date'}
                                            </span>
                                        </div>
                                        <div className='flex-1 flex flex-col justify-center px-4 py-3'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1'>
                                                Time Slot
                                            </span>
                                            <span className='text-xs sm:text-xs font-bold text-brand-600 dark:text-brand-400 font-outfit truncate'>
                                                {formatTime(appt.start_time)} - {formatTime(appt.end_time)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className='flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 sm:p-5 lg:px-6 gap-6 min-w-0 w-full'>
                                        {/* Patient Info */}
                                        <div className='flex items-center gap-4 w-full lg:w-[240px] xl:w-[280px] shrink-0'>
                                            <div className='relative shrink-0'>
                                                <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center bg-brand-500 text-white overflow-hidden'>
                                                    {appt.patient?.photo_url ||
                                                    appt.patient?.avatar_url ? (
                                                        <img
                                                            src={
                                                                appt.patient?.photo_url ||
                                                                appt.patient?.avatar_url
                                                            }
                                                            alt=''
                                                            className='w-full h-full object-cover'
                                                        />
                                                    ) : (
                                                        <span className='text-sm font-black'>
                                                            {(
                                                                appt.patient?.name ||
                                                                appt.guest_name ||
                                                                'P'
                                                            )
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .join('')
                                                                .substring(0, 2)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className='absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-[#111827] rounded-full shadow-sm bg-emerald-500'></div>
                                            </div>
                                            <div className='flex flex-col min-w-0'>
                                                <span className='font-bold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit truncate'>
                                                    {appt.patient?.name ||
                                                        appt.guest_name ||
                                                        'Anonymous'}
                                                </span>
                                                <div className='flex items-center gap-2 mt-1'>
                                                    {getSourceBadge(appt.source)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details Columns */}
                                        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-4 w-full flex-1 min-w-0'>
                                            {/* Service */}
                                            <div className='flex flex-col min-w-0'>
                                                <span className='text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500'>
                                                    Service
                                                </span>
                                                <span
                                                    className='text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate'
                                                    title={appt.service}
                                                >
                                                    {appt.service || 'General clinical service'}
                                                </span>
                                            </div>

                                            {/* Doctor */}
                                            <div className='flex flex-col min-w-0'>
                                                <span className='text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500'>
                                                    Doctor
                                                </span>
                                                <span
                                                    className='text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate'
                                                    title={appt.dentist?.profile?.last_name}
                                                >
                                                    {appt.dentist?.profile?.last_name
                                                        ? `Dr. ${appt.dentist.profile.last_name}`
                                                        : 'Unassigned'}
                                                </span>
                                            </div>

                                            {/* Contact */}
                                            <div className='flex flex-col min-w-0'>
                                                <span className='text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500'>
                                                    Contact
                                                </span>
                                                <div className='flex items-center gap-1.5 min-w-0'>
                                                    <Phone
                                                        size={12}
                                                        className='text-emerald-500 shrink-0'
                                                    />
                                                    <span className='text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate'>
                                                        {appt.patient?.phone ||
                                                            appt.guest_phone ||
                                                            'No Phone'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className='flex flex-col min-w-0'>
                                                <span className='text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500'>
                                                    Status
                                                </span>
                                                <div className='flex items-center gap-1.5'>
                                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                                        appt.status === 'CONFIRMED' ? 'bg-emerald-500' :
                                                        appt.status === 'CANCELLED' ? 'bg-red-500' :
                                                        'bg-amber-500'
                                                    }`} />
                                                    <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                                                        appt.status === 'CONFIRMED' ? 'text-emerald-600 dark:text-emerald-500' :
                                                        appt.status === 'CANCELLED' ? 'text-red-600 dark:text-red-500' :
                                                        'text-amber-600 dark:text-amber-500'
                                                    }`}>
                                                        {appt.status === 'CONFIRMED' ? 'APPROVED' : appt.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Area */}
                        {pagination.pages > 1 && (
                            <div className='flex items-center justify-center gap-2 pt-4 pb-8'>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || isLoading}
                                    className='p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30'
                                >
                                    <ChevronRight
                                        size={20}
                                        className='rotate-180'
                                    />
                                </button>
                                <span className='text-[10px] font-black uppercase tracking-widest text-gray-400 px-4'>
                                    Page {currentPage} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() =>
                                        setCurrentPage((p) => Math.min(pagination.pages, p + 1))
                                    }
                                    disabled={currentPage === pagination.pages || isLoading}
                                    className='p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-30'
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
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
