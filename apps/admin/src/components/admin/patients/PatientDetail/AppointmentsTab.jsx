import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, Clock, User, ChevronRight } from 'lucide-react';
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
        { id: 'ALL', label: 'All Visits' },
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

    return (
        <div className='space-y-4 animate-in fade-in duration-300'>
            {/* Integrated Search & Filter Header */}
            <div className='flex flex-col gap-3 mb-2'>
                <div className='flex items-center justify-between gap-3'>
                    <div className='relative max-w-sm grow group'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors' size={14} />
                        <input 
                            type="text" 
                            placeholder="Search appointments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full h-9 pl-10 pr-4 rounded-lg bg-gray-50/50 dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400'
                        />
                    </div>
                    {filterMode === 'attendance' && (
                        <button
                            onClick={() => setIsWizardOpen(true)}
                            className='h-9 px-4 rounded-lg bg-brand-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 flex items-center gap-2 whitespace-nowrap'
                        >
                            <Plus size={14} /> <span>Add Appointment</span>
                        </button>
                    )}
                </div>

                <div className='flex items-center gap-2 overflow-x-auto no-scrollbar'>
                    {currentFilters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setStatusFilter(f.id)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                statusFilter === f.id
                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                                    : 'bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800'>
                    <Loader2 className='animate-spin text-brand-500 mb-4' size={32} />
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Synchronizing records...</p>
                </div>
            ) : filteredAppointments.length > 0 ? (
                <div className='overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] shadow-sm'>
                    {/* Header - Desktop Only */}
                    <div className='hidden sm:grid grid-cols-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]'>
                        <div className='col-span-2 px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]'>Date</div>
                        <div className='col-span-2 px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]'>Time</div>
                        <div className='col-span-3 px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]'>Patient & Service</div>
                        <div className='col-span-3 px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]'>Doctor</div>
                        <div className='col-span-2 px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right'>Status</div>
                    </div>

                    {/* Rows */}
                    <div className='divide-y divide-gray-50 dark:divide-gray-800/50'>
                        {filteredAppointments.map((app) => (
                            <div 
                                key={app.id} 
                                className='group relative cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors'
                                onClick={() => handleRowClick(app)}
                            >
                                {/* Desktop View */}
                                <div className='hidden sm:grid grid-cols-12 items-center'>
                                    <div className='col-span-2 px-6 py-5'>
                                        <div className='flex flex-col'>
                                            <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Date of Visit</span>
                                            <span className='text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight'>{formatDate(app.appointment_date)}</span>
                                        </div>
                                    </div>
                                    <div className='col-span-2 px-6 py-5'>
                                        <div className='flex flex-col space-y-3'>
                                            <div className='flex flex-col'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Start Time</span>
                                                <span className='text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight'>{formatTime(app.start_time)}</span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>End Time</span>
                                                <span className='text-[11px] font-black text-brand-500 uppercase tracking-tight'>{formatTime(app.end_time)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-span-3 px-6 py-5'>
                                        <div className='flex flex-col space-y-3'>
                                            <div className='flex flex-col'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Patient</span>
                                                <span className='text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight'>{app.patient?.full_name}</span>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Service</span>
                                                <span className='text-[10px] font-black text-brand-600/70 dark:text-brand-400/70 uppercase tracking-widest'>{app.service?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-span-3 px-6 py-5'>
                                        <div className='flex flex-col'>
                                            <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Doctor</span>
                                            <span className='text-[11px] font-black text-gray-400 uppercase tracking-tight'>{app.dentist?.profile?.last_name || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                    <div className='col-span-2 px-6 py-5 text-right'>
                                        <div className='flex items-center justify-end gap-4'>
                                            <div className='flex flex-col items-end'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Status</span>
                                                <span className={`inline-flex px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-widest shadow-sm ${getStatusStyle(app.status)}`}>
                                                    {app.approval_status === 'rejected' ? 'REJECTED' : (app.status === 'CONFIRMED' ? 'APPROVED' : app.status)}
                                                </span>
                                            </div>
                                            <ChevronRight size={14} className='text-gray-300 group-hover:text-brand-500 transition-colors mt-3' />
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile View (Full Width Card Style) */}
                                <div className='sm:hidden p-5 flex flex-col gap-4 relative'>
                                    {/* Top Row: Date & Status */}
                                    <div className='flex justify-between items-start'>
                                        <div className='flex flex-col'>
                                            <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Date of Visit</span>
                                            <span className='text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tight'>{formatDate(app.appointment_date)}</span>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-widest shadow-sm ${getStatusStyle(app.status)}`}>
                                            {app.status === 'CONFIRMED' ? 'APPROVED' : app.status}
                                        </span>
                                    </div>

                                    {/* Middle: Patient & Service */}
                                    <div className='flex flex-col space-y-3 py-3 border-y border-gray-50 dark:border-gray-800/50'>
                                        <div className='flex flex-col'>
                                            <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Patient</span>
                                            <span className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>{app.patient?.full_name}</span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Service</span>
                                            <span className='text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest'>{app.service?.name}</span>
                                        </div>
                                    </div>

                                    {/* Bottom: Time & Doctor */}
                                    <div className='flex justify-between items-end'>
                                        <div className='flex gap-10'>
                                            <div className='flex flex-col'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Time</span>
                                                <div className='flex items-baseline gap-1.5'>
                                                    <span className='text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase'>{formatTime(app.start_time)}</span>
                                                    <span className='text-[8px] font-bold text-gray-400'>-</span>
                                                    <span className='text-[10px] font-black text-brand-500 uppercase'>{formatTime(app.end_time)}</span>
                                                </div>
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5'>Doctor</span>
                                                <span className='text-[10px] font-black text-gray-400 uppercase'>{app.dentist?.profile?.last_name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className='text-gray-300' />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center px-6'>
                    <div className='w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-gray-200 dark:text-gray-700 mb-4'>
                        <Calendar size={32} />
                    </div>
                    <h5 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>
                        {filterMode === 'request' ? 'No Pending Requests' : 
                         filterMode === 'attendance' ? 'No Approved Appointments' : 
                         'No Past Appointments'}
                    </h5>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs'>
                        {filterMode === 'request' ? 'All appointment requests for this family have been processed.' : 
                         filterMode === 'attendance' ? 'There are no confirmed appointments scheduled for this family.' :
                         'This patient has no historical visits or cancelled appointments on record.'}
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
