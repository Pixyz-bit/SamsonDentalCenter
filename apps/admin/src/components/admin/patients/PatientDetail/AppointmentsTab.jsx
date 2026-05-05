import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Clock, User, ChevronRight, Phone } from 'lucide-react';
import Button from '../../../ui/Button';
import { api } from '../../../../utils/api';
import RequestReviewView from './RequestReviewView';
import UpcomingAppointmentView from './UpcomingAppointmentView';
import PastAppointmentView from './PastAppointmentView';
import AdminBookingWizard from './AdminBookingWizard';

const AppointmentsTab = ({ patient, dependents = [], token, filterMode = 'request', onSubViewChange }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [view, setView] = useState('list'); // 'list' or 'details'
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (onSubViewChange) {
            if (view === 'details') {
                const sub = filterMode === 'request' ? 'Review Request' : (filterMode === 'attendance' ? 'Attendance Details' : 'Historical Record');
                onSubViewChange(sub);
            } else {
                if (filterMode === 'attendance') {
                    onSubViewChange("Only Today's approved visits | Check-In / No-Show");
                } else if (filterMode === 'upcoming') {
                    onSubViewChange("All Future approved visits | Reschedule / Cancel");
                } else if (filterMode === 'request') {
                    onSubViewChange("Pending Only");
                } else if (filterMode === 'history') {
                    onSubViewChange("History");
                } else {
                    onSubViewChange(null);
                }
            }
        }
    }, [view, filterMode, onSubViewChange]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/admin/patients/${patient.id}/history`, token);
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patient?.id) {
            fetchHistory();
        }
    }, [patient?.id]);

    const filteredAppointments = appointments.filter(app => {
        const status = app.status?.toUpperCase();
        const matchesSearch = 
            app.service?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.dentist?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;

        // Base Type Filtering
        let typeMatches = false;
        const appDate = new Date(app.appointment_date);
        appDate.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (filterMode === 'request') {
            typeMatches = status === 'PENDING';
        } else if (filterMode === 'attendance') {
            typeMatches = (status === 'CONFIRMED' || status === 'CHECKED_IN') && appDate.getTime() === today.getTime();
        } else if (filterMode === 'upcoming') {
            typeMatches = (status === 'CONFIRMED') && appDate.getTime() > today.getTime();
        } else if (filterMode === 'history') {
            typeMatches = ['COMPLETED', 'CANCELLED', 'LATE_CANCEL', 'NO_SHOW'].includes(status) || (status === 'CONFIRMED' && appDate.getTime() < today.getTime());
        }

        if (!typeMatches) return false;

        // Sub-status Chip Filtering
        if (statusFilter === 'ALL') return true;
        if (filterMode === 'history') {
            if (statusFilter === 'COMPLETED') return status === 'COMPLETED';
            if (statusFilter === 'CANCELLED') return status === 'CANCELLED' || status === 'LATE_CANCEL';
            if (statusFilter === 'NO_SHOW') return status === 'NO_SHOW';
        } else {
            // For active/pending, maybe filter by service type?
            // Assuming specialized services have some flag or name pattern for now
            if (statusFilter === 'SPECIALIZED') return app.service?.is_specialized;
            if (statusFilter === 'GENERAL') return !app.service?.is_specialized;
        }

        return true;
    });

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED':
            case 'COMPLETED':
            case 'CHECKED_IN':
                return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
            case 'PENDING':
                return 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
            case 'CANCELLED':
            case 'LATE_CANCEL':
            case 'NO_SHOW':
                return 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400';
        }
    };

    const handleRowClick = (app) => {
        setSelectedAppointment(app);
        setView('details');
    };

    if (view === 'details' && selectedAppointment) {
        if (filterMode === 'request') {
            return (
                <RequestReviewView
                    appointment={selectedAppointment}
                    token={token}
                    onBack={() => setView('list')}
                    onActionSuccess={(msg) => {
                        fetchHistory();
                    }}
                />
            );
        }

        if (filterMode === 'attendance' || filterMode === 'upcoming') {
            return (
                <UpcomingAppointmentView
                    appointment={selectedAppointment}
                    token={token}
                    filterMode={filterMode}
                    onBack={() => setView('list')}
                    onActionSuccess={(msg) => {
                        fetchHistory();
                    }}
                />
            );
        }
        
        return (
            <PastAppointmentView
                appointment={selectedAppointment}
                token={token}
                onBack={() => setView('list')}
            />
        );
    }

    const historyFilters = [
        { id: 'ALL', label: 'All History' },
        { id: 'COMPLETED', label: 'Completed' },
        { id: 'CANCELLED', label: 'Cancelled' },
        { id: 'NO_SHOW', label: 'No-Show' },
    ];

    const activeFilters = [
        { id: 'ALL', label: filterMode === 'upcoming' ? 'All Upcoming' : 'All Visits' },
        { id: 'GENERAL', label: 'General' },
        { id: 'SPECIALIZED', label: 'Specialized' },
    ];

    const currentFilters = filterMode === 'history' ? historyFilters : activeFilters;

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        }).toUpperCase();
    };

    const getInitials = (name) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    return (
        <div className='space-y-4 sm:space-y-6 lg:space-y-10 animate-in fade-in duration-300'>
            {/* Integrated Search & Filter Header */}
            <div className='w-full p-4 sm:p-6 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
                    <div>
                        <h4 className='text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Appointment Registry
                        </h4>
                        <p className='text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5 font-bold'>
                            {filterMode === 'request' ? 'Reviewing pending booking requests' : 
                             filterMode === 'attendance' ? 'Managing today\'s patient traffic' : 
                             filterMode === 'upcoming' ? 'Monitoring future schedule volume' : 'Auditing historical clinical records'}
                        </p>
                    </div>
                    {filterMode === 'attendance' && (
                        <button
                            onClick={() => setIsWizardOpen(true)}
                            className='h-9 sm:h-11 px-4 sm:px-6 rounded-xl bg-brand-500 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2 whitespace-nowrap'
                        >
                            <Plus size={16} /> <span>Create Appointment</span>
                        </button>
                    )}
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
                                onClick={() => setStatusFilter(f.id)}
                                className={`h-9 sm:h-10 px-3 sm:px-6 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                    statusFilter === f.id
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

            {loading ? (
                <div className='flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-300 dark:border-gray-800 shadow-sm'>
                    <Loader2 className='animate-spin text-brand-500 mb-4' size={40} />
                    <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>Synchronizing Data...</p>
                </div>
            ) : filteredAppointments.length > 0 ? (
                <div className='space-y-2 sm:space-y-3'>
                    {/* Header - Removed since we are using cards now for everything */}

                    {/* Rows */}
                    <div className='flex flex-col gap-2'>
                        {filteredAppointments.map((app) => (
                            <div 
                                key={app.id} 
                                className='group relative cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all p-0 border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-white/[0.01] shadow-sm hover:shadow-md'
                                onClick={() => handleRowClick(app)}
                            >
                                <div className='flex flex-row w-full overflow-hidden'>
                                    {/* Left Side: Date & Time */}
                                    <div className="flex flex-col justify-center w-24 sm:w-40 bg-gray-50/50 dark:bg-gray-800/30 border-r border-gray-300 dark:border-gray-700 shrink-0 text-center sm:text-left">
                                        <div className="px-2 sm:px-4 py-2 sm:py-3">
                                            <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                            <p className="text-[9px] sm:text-[11px] font-black text-gray-900 dark:text-white leading-none uppercase tracking-tighter">
                                                {formatDate(app.appointment_date)}
                                            </p>
                                        </div>
                                        <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="px-2 sm:px-4 py-2 sm:py-3">
                                            <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                                            <p className="text-[9px] sm:text-[11px] font-black text-brand-500 leading-none">
                                                {formatTime(app.start_time)} - {formatTime(app.end_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="flex-grow p-3 sm:p-5 flex items-center gap-3 sm:gap-4 min-w-0">
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-[10px] sm:text-sm font-black shadow-lg shadow-brand-500/20 border-2 border-white dark:border-gray-900">
                                                {app.patient?.avatar_url ? (
                                                    <img src={app.patient.avatar_url} alt={app.patient.full_name} className='w-full h-full object-cover rounded-full' />
                                                ) : (
                                                    getInitials(app.patient?.full_name)
                                                )}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <p className="text-xs sm:text-base font-black text-gray-900 dark:text-white leading-tight mb-0.5 sm:mb-1 truncate">{app.patient?.full_name}</p>
                                            <div className="flex flex-col gap-0.5 sm:gap-1">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <p className="text-[8px] sm:text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">
                                                        {app.service?.name}
                                                    </p>
                                                    <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                                                    <p className="text-[8px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400 truncate">
                                                        {app.dentist?.profile?.last_name || 'Unassigned'}
                                                    </p>
                                                </div>
                                                <p className="text-[8px] sm:text-[11px] font-medium text-gray-500 flex items-center gap-1.5 sm:gap-2">
                                                    <Phone size={8} className="text-green-500 sm:w-[10px]" />
                                                    <span className="text-gray-800 dark:text-gray-200">{app.patient?.phone || 'No Phone'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mobile Only: Floating View Indicator */}
                                    <div className='absolute bottom-3 right-3 sm:hidden flex items-center gap-1 bg-brand-50/50 dark:bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-100 dark:border-brand-500/20'>
                                        <span className='text-[7px] font-black text-brand-500 uppercase tracking-widest'>View</span>
                                        <ChevronRight size={10} className='text-brand-500' />
                                    </div>

                                    {/* Right Side: Status & Source Badges */}
                                    <div className="hidden sm:flex flex-col items-stretch justify-center border-l border-gray-300 dark:border-gray-700 bg-gray-50/20 dark:bg-white/[0.01] shrink-0 w-[200px]">
                                        {/* Source */}
                                        <div className="px-5 py-4 flex flex-col items-start gap-2">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Source</p>
                                            <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 truncate w-full text-left`}>
                                                {app.source || 'Portal Booking'}
                                            </span>
                                        </div>

                                        <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700" />

                                        {/* Status */}
                                        <div className="px-5 py-4 flex flex-col items-start gap-2">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</p>
                                            <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded shadow-sm border ${
                                                app.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' :
                                                app.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                                'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                            } truncate w-full text-left`}>
                                                {app.status === 'CONFIRMED' ? 'APPROVED' : app.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-20 bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-300 dark:border-gray-800 text-center px-6 shadow-sm'>
                    <div className='w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-gray-300 dark:text-gray-700 mb-6 border border-gray-200 dark:border-white/5'>
                        <Calendar size={40} />
                    </div>
                    <h5 className='text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit mb-2'>
                        No Records Found
                    </h5>
                    <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold max-w-sm leading-relaxed'>
                        {filterMode === 'request' ? 'All appointment requests for this family have been processed or none have been submitted.' : 
                         filterMode === 'attendance' ? 'There are no confirmed appointments scheduled for today.' :
                         'No historical visits or cancelled appointments on record for this profile.'}
                    </p>
                </div>
            )}

            {/* Admin Booking Wizard */}
            <AdminBookingWizard 
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                primaryPatient={patient}
                dependents={dependents}
                token={token}
                onSuccess={() => {
                    setIsWizardOpen(false);
                    fetchHistory();
                }}
            />
        </div>
    );
};

export default AppointmentsTab;
