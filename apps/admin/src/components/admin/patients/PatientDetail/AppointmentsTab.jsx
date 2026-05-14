import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Clock, User, ChevronRight, Phone, Search } from 'lucide-react';
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
        return (
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 uppercase tracking-tighter">
                Patient
            </span>
        );
    };

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
                            className='h-11 px-6 rounded-lg bg-brand-500 text-white text-xs font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2 whitespace-nowrap'
                        >
                            <Plus size={18} /> <span>Create Appointment</span>
                        </button>
                    )}
                </div>

                <div className='flex flex-col lg:flex-row items-center gap-3 sm:gap-4'>
                    <div className='relative flex-grow group w-full lg:w-auto'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors' size={18} />
                        <input 
                            type="text" 
                            placeholder="Search clinical registry by service or details..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400'
                        />
                    </div>
                    <div className='flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 w-full lg:w-auto'>
                        {currentFilters.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                                    statusFilter === f.id
                                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
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
                                className='relative z-[1] flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer'
                                onClick={() => handleRowClick(app)}
                            >
                                {/* Sidebar: Schedule & Time Slot */}
                                <div className='flex flex-row sm:flex-col w-full sm:w-[140px] bg-gray-50/50 dark:bg-gray-800/30 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0'>
                                    <div className='flex-1 flex flex-col justify-center px-4 py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1'>
                                            Schedule
                                        </span>
                                        <span className='text-xs sm:text-xs font-bold text-[#0B1120] dark:text-white font-outfit truncate'>
                                            {formatDate(app.appointment_date)}
                                        </span>
                                    </div>
                                    <div className='flex-1 flex flex-col justify-center px-4 py-3'>
                                        <span className='text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1'>
                                            Time Slot
                                        </span>
                                        <span className='text-xs sm:text-xs font-bold text-brand-600 dark:text-brand-400 font-outfit truncate'>
                                            {formatTime(app.start_time)} - {formatTime(app.end_time)}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div className='flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 sm:p-5 lg:px-6 gap-6 min-w-0 w-full'>
                                    {/* Patient Info */}
                                    <div className='flex items-center gap-4 w-full lg:w-[240px] xl:w-[280px] shrink-0'>
                                        <div className='relative shrink-0'>
                                            <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center bg-brand-500 text-white overflow-hidden'>
                                                {app.patient?.avatar_url ? (
                                                    <img src={app.patient.avatar_url} alt='' className='w-full h-full object-cover' />
                                                ) : (
                                                    <span className='text-sm font-black'>{getInitials(app.patient?.full_name)}</span>
                                                )}
                                            </div>
                                            <div className='absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-[#111827] rounded-full shadow-sm bg-emerald-500'></div>
                                        </div>
                                        <div className='flex flex-col min-w-0'>
                                            <span className='font-bold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit truncate'>
                                                {app.patient?.full_name}
                                            </span>
                                            <div className='flex items-center gap-2 mt-1'>
                                                {getSourceBadge(app.source)}
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
                                            <span className='text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate' title={app.service?.name}>
                                                {app.service?.name || 'General clinical service'}
                                            </span>
                                        </div>

                                        {/* Doctor */}
                                        <div className='flex flex-col min-w-0'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500'>
                                                Doctor
                                            </span>
                                            <span className='text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate' title={app.dentist?.profile?.last_name}>
                                                {app.dentist?.profile?.last_name ? `Dr. ${app.dentist.profile.last_name}` : 'Unassigned'}
                                            </span>
                                        </div>

                                        {/* Contact */}
                                        <div className='flex flex-col min-w-0'>
                                            <span className='text-[10px] font-bold uppercase tracking-wider mb-1 text-gray-400 dark:text-gray-500'>
                                                Contact
                                            </span>
                                            <div className='flex items-center gap-1.5 min-w-0'>
                                                <Phone size={12} className='text-emerald-500 shrink-0' />
                                                <span className='text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate'>
                                                    {app.patient?.phone || 'No Phone'}
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
                                                    app.status === 'CONFIRMED' || app.status === 'CHECKED_IN' ? 'bg-emerald-500' :
                                                    app.status === 'CANCELLED' || app.status === 'LATE_CANCEL' || app.status === 'REJECTED' ? 'bg-red-500' :
                                                    'bg-amber-500'
                                                }`} />
                                                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
                                                    app.status === 'CONFIRMED' || app.status === 'CHECKED_IN' ? 'text-emerald-600 dark:text-emerald-500' :
                                                    app.status === 'CANCELLED' || app.status === 'LATE_CANCEL' || app.status === 'REJECTED' ? 'text-red-600 dark:text-red-500' :
                                                    'text-amber-600 dark:text-amber-500'
                                                }`}>
                                                    {app.status === 'CONFIRMED' ? 'APPROVED' : app.status}
                                                </span>
                                            </div>
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
