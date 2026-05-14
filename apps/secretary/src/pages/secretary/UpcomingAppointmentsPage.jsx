import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import Badge from '../../components/ui/Badge';
import AppointmentDetailView from '../../components/secretary/appointment_details';
import { 
    Search, 
    Calendar, 
    Users, 
    Filter, 
    Clock, 
    ArrowUpDown, 
    ChevronLeft, 
    ChevronRight, 
    Eye, 
    Plus,
    Tag,
    ShieldCheck,
    SearchX
} from 'lucide-react';

import useAppointments, { formatTime } from '../../hooks/useAppointments';
import { useDoctors } from '../../hooks/useDoctors';
import useServices from '../../hooks/useServices';
import { useToast } from '../../context/ToastContext';


const ITEMS_PER_PAGE = 8;

const UpcomingAppointmentsPage = () => {
    // 1. Hooks & Data
    const { doctors } = useDoctors();
    const { services } = useServices();
    
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState('All Doctors');
    const [specificDate, setSpecificDate] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);
    
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedId = searchParams.get('id') || null;

    // Map frontend statuses to backend keys
    const STATUS_MAP = {
        'Upcoming': 'CONFIRMED',
        'In Progress': 'IN_PROGRESS',
        'Completed': 'COMPLETED',
        'Pending': 'PENDING',
        'Cancelled': 'CANCELLED',
        'Displaced': 'DISPLACED'
    };

    const { 
        appointments, 
        total,
        loading, 
        actionLoading,
        page, 
        totalPages, 
        goToPage,
        updateAppointment,
        refresh 
    } = useAppointments({
        status: 'CONFIRMED',
        dentistId: selectedDoctorId,
        search: debouncedSearch,
        date: specificDate,
        sort: sortOrder,
        limit: 8
    });

    const availableStatuses = ['All Statuses', 'Upcoming', 'In Progress', 'Completed', 'Pending', 'Cancelled', 'Displaced'];

    const toast = useToast();

    const handleRowClick = (id) => setSearchParams({ id: id.toString() });
    const handleBack = () => setSearchParams({});

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        const res = await updateAppointment(id, { status: 'CANCELLED' });
        if (res.success) {
            toast.success('Appointment cancelled successfully.');
            handleBack();
        } else {
            toast.error(res.error || 'Failed to cancel appointment.');
        }
    };

    const handleReschedule = (id) => {
        // Redirect to booking with appointment ID for context
        navigate(`/booking?reschedule=${id}`);
    };

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'COMPLETED': return { color: 'success', label: 'Completed' };
            case 'IN_PROGRESS': return { color: 'warning', label: 'In Progress' };
            case 'CONFIRMED': return { color: 'info', label: 'Approved' };
            case 'PENDING': return { color: 'warning', label: 'Pending' };
            case 'CANCELLED': return { color: 'error', label: 'Cancelled' };
            case 'DISPLACED': return { color: 'secondary', label: 'Displaced' };
            default: return { color: 'info', label: status };
        }
    };

    const getInitial = (name = '') => name?.charAt(0).toUpperCase() || '?';

    const formatDateStr = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const selectedAppointment = useMemo(() => {
        if (!selectedId) return null;
        const apt = appointments.find(a => a.id?.toString() === selectedId.toString());
        if (!apt) return null;

        // Normalize for sub-components which expect the legacy/mock structure
        return {
            ...apt,
            service: { name: apt.service || 'General Service' },
            doctor: { name: apt.dentist?.profile?.full_name || apt.dentist?.full_name || 'Unassigned' },
            patient: {
                name: apt.patient?.full_name || apt.patient?.name || 'Unknown Patient',
                email: apt.patient?.email,
                phone: apt.patient?.phone,
                noShowCount: apt.patient?.no_show_count || 0,
                cancellationCount: apt.patient?.cancellation_count || 0,
                isBookingRestricted: apt.patient?.is_booking_restricted || false,
                source: apt.source // Backend might return this
            },
            time: apt.start_time && apt.end_time 
                ? `${formatTime(apt.start_time)} - ${formatTime(apt.end_time)}`
                : apt.start_time ? formatTime(apt.start_time) : ''
        };
    }, [selectedId, appointments]);

    const breadcrumbTitle = selectedAppointment ? "Appointment Details" : "Upcoming Appointments";

    return (
        <div className="flex flex-col min-h-[calc(100vh-140px)] w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle} 
                parentName={selectedAppointment ? "Upcoming Appointments" : null}
                parentPath={selectedAppointment ? "/appointments" : null}
            />
            <div className="flex-1 min-h-[600px] flex flex-col sm:mb-6">
                {selectedAppointment ? (
                    <AppointmentDetailView 
                        appointment={selectedAppointment}
                        onBack={handleBack}
                        onCancel={() => handleCancel(selectedAppointment.id)}
                        onReschedule={() => handleReschedule(selectedAppointment.id)}
                        isProcessing={actionLoading}
                    />
                ) : (
                <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm'>
                        
                        {/* Aligned Toolbar - One to One with User Portal MyAppointments */}
                        <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                            
                            {/* Row 1: Search & Action */}
                            <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                                <div className='relative flex-grow w-full'>
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search upcoming appointments...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                                    />
                                </div>

                                <button
                                    onClick={() => navigate('/booking')}
                                    className='hidden sm:flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-brand-500/20 shrink-0 whitespace-nowrap active:scale-95'
                                >
                                    <Plus size={18} />
                                    <span>New Appointment</span>
                                </button>
                            </div>

                            {/* Row 2: Filters */}
                            <div className='px-4 sm:px-6 pb-5 pt-2'>
                                <div className='flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-2'>
                                    
                                    {/* 1. Doctor Filter */}
                                    <div className='relative w-[170px] sm:w-[210px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <Users size={16} />
                                        </div>
                                        <select
                                            value={selectedDoctorId}
                                            onChange={(e) => setSelectedDoctorId(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            <option value="All Doctors">All Doctors</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.id} className='dark:bg-gray-900'>
                                                    {doc.full_name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    {/* 2. Date Filter */}
                                    <div className='relative w-[150px] sm:w-[180px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <Calendar size={16} />
                                        </div>
                                        <input
                                            type='date'
                                            value={specificDate}
                                            onChange={(e) => setSpecificDate(e.target.value)}
                                            className='w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer'
                                        />
                                    </div>

                                    {/* 3. Sort Filter */}
                                    <div className='relative w-[150px] sm:w-[180px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <ArrowUpDown size={16} />
                                        </div>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            <option value="desc">Newest First</option>
                                            <option value="asc">Oldest First</option>
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    <div className='hidden lg:block ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60'>
                                        Total Found: {total}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List Body */}
                        <div className='overflow-y-auto grow pb-24 sm:pb-8 flex flex-col gap-0 sm:gap-4 p-0 sm:p-6 no-scrollbar'>
                            {loading ? (
                                <div className='flex flex-col items-center justify-center py-20 gap-4'>
                                    <div className='w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin' />
                                    <p className='text-sm font-bold text-gray-500 animate-pulse'>Loading appointments...</p>
                                </div>
                            ) : appointments.length > 0 ? (
                                appointments.map((apt) => {
                                    const { color: badgeColor, label: displayStatus } = getStatusStyle(apt.status);
                                    const patientName = apt.patient?.full_name || apt.patient?.name || 'Unknown Patient';
                                    const doctorName = apt.dentist?.profile?.full_name || apt.dentist?.full_name || 'Unassigned';
                                    const serviceName = apt.service || 'General Service';
                                    
                                    return (
                                        <div 
                                            key={apt.id}
                                            onClick={() => handleRowClick(apt.id)}
                                            className='group relative bg-white dark:bg-white/[0.03] sm:rounded-xl border-b sm:border border-gray-100 dark:border-gray-800 sm:shadow-sm hover:shadow-md sm:hover:z-10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-row items-center'
                                        >
                                            {/* 1. Left Side: Schedule Block (Desktop Only) */}
                                            <div className='hidden sm:flex w-48 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-200 dark:border-white/10 shrink-0 flex-col text-left py-1'>
                                                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                                                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Appointment Date</p>
                                                    <p className='text-[16px] font-medium text-gray-900 dark:text-white leading-tight'>
                                                        {formatDateStr(apt.date)}
                                                    </p>
                                                </div>
                                                <div className='h-px w-full bg-gray-200 dark:bg-white/5' />
                                                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                                                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Time</p>
                                                    <p className='text-[14px] font-medium text-brand-500 leading-tight'>
                                                        {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 2. Content Area */}
                                            <div className='flex-grow flex items-center min-w-0'>
                                                {/* Mobile View */}
                                                <div className='flex sm:hidden gap-4 w-full pl-6 pr-4 py-4 items-center'>
                                                    <div className='shrink-0'>
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${badgeColor === 'error' ? 'bg-error-500 shadow-error-500/20' : badgeColor === 'warning' ? 'bg-warning-500 shadow-warning-500/20' : 'bg-brand-500 shadow-brand-500/20'}`}>
                                                            {getInitial(patientName)}
                                                        </div>
                                                    </div>
                                                    <div className='flex-grow min-w-0 flex flex-col gap-0.5'>
                                                        <div className='flex justify-between items-center min-w-0'>
                                                            <span className='text-[17px] font-medium text-gray-900 dark:text-white tracking-tight truncate flex-grow min-w-0'>
                                                                {patientName}
                                                            </span>
                                                            <div className='shrink-0 ml-2'>
                                                                <Badge size='sm' color={badgeColor} className='font-medium text-[10px] px-2.5 py-0.5 rounded-md'>
                                                                    {displayStatus}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className='text-[13px] truncate text-gray-500 dark:text-gray-400 font-medium leading-tight'>
                                                            {serviceName}
                                                        </div>
                                                        <div className='flex justify-between items-end mt-0.5'>
                                                            <div className='text-[11px] text-gray-700 dark:text-gray-400 font-medium truncate pr-4 flex items-center gap-1.5'>
                                                                <span>{apt.date}</span>
                                                                <span className='text-gray-400'>•</span>
                                                                <span className='text-gray-500/80'>
                                                                    {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='shrink-0 text-brand-500 ml-2'>
                                                        <ChevronRight size={20} strokeWidth={3} />
                                                    </div>
                                                </div>

                                                {/* Desktop View */}
                                                <div className='hidden sm:flex flex-grow px-8 py-5 items-center gap-8 min-w-0'>
                                                    <div className='shrink-0'>
                                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${badgeColor === 'error' ? 'bg-error-500 shadow-error-500/10' : badgeColor === 'warning' ? 'bg-warning-500 shadow-warning-500/10' : 'bg-brand-500 shadow-brand-500/10'}`}>
                                                            {getInitial(patientName)}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className='flex flex-grow items-center min-w-0'>
                                                        <div className='flex flex-col min-w-0 w-[240px] shrink-0'>
                                                            <h3 className='text-[20px] font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-brand-500 transition-colors'>
                                                                {patientName}
                                                            </h3>
                                                            <p className='text-[13px] font-medium text-gray-700 dark:text-gray-400'>Approved Appointment</p>
                                                        </div>

                                                        <div className='flex flex-col min-w-0 w-[260px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                                                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>Service & Doctor</p>
                                                            <div className='flex flex-col min-w-0'>
                                                                <span className='text-[17px] font-medium truncate text-gray-900 dark:text-white'>
                                                                    {serviceName}
                                                                </span>
                                                                <span className='text-[13px] font-medium text-gray-500 truncate italic'>
                                                                    with {doctorName}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col min-w-0 w-[140px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                                                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>Status</p>
                                                            <div>
                                                                <Badge size='sm' color={badgeColor} className='font-medium text-[11px] px-3.5 py-1 rounded-md'>
                                                                    {displayStatus}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className='flex-grow' />

                                                        <div className='shrink-0 ml-4 flex items-center justify-center text-brand-500 transition-all transform group-hover:translate-x-1'>
                                                            <ChevronRight size={24} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className='flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-300'>
                                    <div className='w-20 h-20 bg-gray-50 dark:bg-white/[0.03] rounded-[32px] flex items-center justify-center mb-6'>
                                        <SearchX className='text-gray-300 dark:text-gray-700' size={32} />
                                    </div>
                                    <h3 className='text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight'>No matching appointments</h3>
                                    <p className='text-sm text-gray-400 max-w-[280px] font-medium leading-relaxed'>
                                        Refine your search or filters to locate specific entries.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className='relative z-30 bg-white dark:bg-gray-900 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0'>
                                <div className='flex flex-row items-center justify-between w-full'>
                                    <div className='hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                                        Page {page} of {totalPages}
                                    </div>

                                    <div className='flex items-center gap-2 mx-auto sm:mx-0'>
                                        <button 
                                            onClick={() => goToPage(Math.max(1, page - 1))}
                                            className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-all'
                                            disabled={page === 1}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button 
                                                key={i + 1}
                                                onClick={() => goToPage(i + 1)}
                                                className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                                                    page === i + 1 
                                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button 
                                            onClick={() => goToPage(Math.min(totalPages, page + 1))}
                                            className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-all'
                                            disabled={page === totalPages}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className='hidden sm:block w-[100px]' />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
    );
};

export default UpcomingAppointmentsPage;
