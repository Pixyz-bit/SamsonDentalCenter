import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../utils/api';
import { 
    ChevronLeft, 
    MessageSquare,
    Loader2,
    Calendar,
    X,
    CheckCircle2,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { parseISO } from 'date-fns';

// Secretary-style sub-components for design consistency
import ReviewTimeline from '../patients/PatientDetail/RequestReview/ReviewTimeline';
import PatientProfileCard from '../patients/PatientDetail/RequestReview/PatientProfileCard';
import RecentHistoryList from '../patients/PatientDetail/RequestReview/RecentHistoryList';
import RequestDetailsCard from '../patients/PatientDetail/RequestReview/RequestDetailsCard';
import ConflictChecker from '../patients/PatientDetail/RequestReview/ConflictChecker';
import AdminRescheduleWizard from '../patients/PatientDetail/AdminRescheduleWizard';

/**
 * UnifiedRegistryDetailViewer
 * A universal detail viewer for all registry modes (pending, upcoming, today, displaced, history).
 * Reuses the high-fidelity ApprovalDetailViewer design language.
 */
const UnifiedRegistryDetailViewer = ({ appointmentId, mode, onBack, onStatusChange }) => {
    const { token } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [data, setData] = useState(null);
    
    // Modals state
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState({ isOpen: false, type: null, label: '', icon: null });

    useEffect(() => {
        if (appointmentId) {
            fetchAggregatedData();
        }
    }, [appointmentId]);

    const fetchAggregatedData = async () => {
        try {
            setLoading(true);
            // We use the same aggregation endpoint as approval details to get metrics/conflicts
            const result = await api.get(`/admin/appointments-approval/${appointmentId}/detail`, token);
            setData(result);
        } catch (err) {
            console.error('Failed to fetch registry details:', err);
            showToast('Failed to load record context.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointmentId}/approve`, { note: 'Approved by admin' }, token);
            showToast("Appointment Approved!", "success");
            onStatusChange?.();
        } catch (err) {
            showToast(err.message || 'Approval failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointmentId}/reject`, { reason: 'Rejected by admin' }, token);
            showToast("Appointment Rejected.", "success");
            onStatusChange?.();
        } catch (err) {
            showToast(err.message || 'Rejection failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointmentId}/cancel`, { reason: 'Cancelled by admin' }, token);
            showToast("Appointment Cancelled.", "success");
            onStatusChange?.();
        } catch (err) {
            showToast(err.message || 'Cancellation failed', 'error');
        } finally {
            setActionLoading(false);
            setConfirmAction({ isOpen: false, type: null });
        }
    };

    const handleCheckIn = async () => {
        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointmentId}/check-in`, {}, token);
            showToast("Patient Checked In!", "success");
            onStatusChange?.();
        } catch (err) {
            showToast(err.message || 'Check-in failed', 'error');
        } finally {
            setActionLoading(false);
            setConfirmAction({ isOpen: false, type: null });
        }
    };

    const handleNoShow = async () => {
        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointmentId}/noshow`, {}, token);
            showToast("Marked as No-Show.", "success");
            onStatusChange?.();
        } catch (err) {
            showToast(err.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
            setConfirmAction({ isOpen: false, type: null });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-2xl">
                <Loader2 className="animate-spin text-brand-500 mb-4" size={32} />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aggregating Context...</p>
            </div>
        );
    }

    if (!data || !data.appointment) return null;

    const { appointment, patientMetrics, doctorSchedule, dailyAppointments } = data;

    const patientStats = {
        completed: patientMetrics.completed_count,
        noShow: patientMetrics.no_show_count,
        cancelled: patientMetrics.total_bookings - patientMetrics.completed_count - patientMetrics.no_show_count,
    };

    const scheduleForChecker = {
        appointments: dailyAppointments,
        base_schedule: doctorSchedule
    };

    const getTitle = () => {
        switch (mode) {
            case 'pending': return 'Review Approval Request';
            case 'upcoming': return 'Review Scheduled Appointment';
            case 'displaced': return 'Review Rescheduling Queue';
            case 'today': return 'Review Today\'s Attendance';
            case 'history': return 'Review Clinical History';
            default: return 'Review Appointment Detail';
        }
    };

    const getSubtitle = () => {
        switch (mode) {
            case 'pending': return 'Verify Patient Integrity & Provider Availability';
            case 'today': return 'Manage Real-Time Patient Check-Ins';
            case 'history': return 'Archived Record of Patient Visit';
            default: return 'Comprehensive Overview of Appointment State';
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 font-outfit">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:px-10 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-transparent sticky top-0 z-20 backdrop-blur-md">
                <button 
                    onClick={onBack} 
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-500"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h4 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        {getTitle()}
                    </h4>
                    <p className="text-[9px] font-bold text-gray-400 tracking-widest">
                        {getSubtitle()}
                    </p>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 sm:p-6 lg:p-10 space-y-10 min-h-[400px]">
                
                <ReviewTimeline 
                    createdAt={appointment.created_at} 
                    status={appointment.status} 
                    updatedAt={appointment.updated_at} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-10">
                        <PatientProfileCard 
                            patient={appointment.patient || { 
                                full_name: appointment.guest_name, 
                                email: appointment.guest_email, 
                                phone: appointment.guest_phone 
                            }}
                            stats={patientStats}
                        />
                        
                        <RequestDetailsCard 
                            appointment={appointment}
                        />

                        <div className="p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01] space-y-3">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare size={14} /> Clinical Notes
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed">
                                {appointment.notes || "No additional notes provided for this record."}
                            </p>
                        </div>
                    </div>

                    <RecentHistoryList 
                        history={data.patientHistory || []} 
                        loading={loading}
                    />
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <ConflictChecker 
                        schedule={scheduleForChecker}
                        requestedSlot={{ start: appointment.start_time, end: appointment.end_time }}
                        loading={loading}
                    />
                </div>

                {/* Footer Actions */}
                <div className="pt-10 flex items-center justify-between">
                    <button 
                        onClick={onBack}
                        className="h-12 px-8 rounded-2xl text-[11px] font-black tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800"
                    >
                        Return
                    </button>

                    <div className="flex items-center gap-4">
                        {mode === 'pending' && (
                            <>
                                <button 
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="h-12 px-8 rounded-2xl text-[11px] font-black tracking-widest text-error-600 hover:bg-error-50 transition-all"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="h-12 px-12 rounded-2xl bg-brand-500 text-white text-[11px] font-black tracking-widest shadow-xl shadow-brand-500/20"
                                >
                                    Approve
                                </button>
                            </>
                        )}

                        {(mode === 'upcoming' || mode === 'displaced') && (
                            <>
                                <button 
                                    onClick={() => setConfirmAction({ isOpen: true, type: 'cancel', label: 'Cancel Appointment', icon: <X /> })}
                                    className="h-12 px-8 rounded-2xl text-[11px] font-black tracking-widest text-red-500 hover:bg-red-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => setIsRescheduleOpen(true)}
                                    className="h-12 px-12 rounded-2xl bg-brand-500 text-white text-[11px] font-black tracking-widest shadow-xl shadow-brand-500/20"
                                >
                                    Reschedule
                                </button>
                            </>
                        )}

                        {mode === 'today' && (
                            <>
                                <button 
                                    onClick={() => setConfirmAction({ isOpen: true, type: 'noshow', label: 'Mark as No-Show', icon: <AlertTriangle /> })}
                                    className="h-12 px-8 rounded-2xl text-[11px] font-black tracking-widest text-amber-600 hover:bg-amber-50 transition-all"
                                >
                                    No Show
                                </button>
                                <button 
                                    onClick={() => setConfirmAction({ isOpen: true, type: 'checkin', label: 'Check In Patient', icon: <CheckCircle2 /> })}
                                    className="h-12 px-12 rounded-2xl bg-success-500 text-white text-[11px] font-black tracking-widest shadow-xl shadow-success-500/20"
                                >
                                    Check In
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Reschedule Wizard Integration */}
            <AdminRescheduleWizard 
                isOpen={isRescheduleOpen}
                onClose={() => setIsRescheduleOpen(false)}
                appointment={appointment}
                token={token}
                onSuccess={() => {
                    setIsRescheduleOpen(false);
                    onStatusChange?.();
                }}
            />

            {/* Confirmation Modal */}
            {confirmAction.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setConfirmAction({ isOpen: false, type: null })} />
                    <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800 text-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner ${
                            confirmAction.type === 'cancel' ? 'bg-red-50 text-red-500' : 
                            confirmAction.type === 'noshow' ? 'bg-amber-50 text-amber-500' : 'bg-success-50 text-success-500'
                        }`}>
                            {confirmAction.icon}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                            {confirmAction.label}?
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                            Are you sure you want to proceed with this action? This will update the patient record immediately.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    if (confirmAction.type === 'cancel') handleCancel();
                                    if (confirmAction.type === 'noshow') handleNoShow();
                                    if (confirmAction.type === 'checkin') handleCheckIn();
                                }}
                                disabled={actionLoading}
                                className={`w-full py-4 rounded-2xl text-white text-[10px] font-black tracking-[0.2em] shadow-lg transition-all active:scale-95 ${
                                    confirmAction.type === 'cancel' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 
                                    confirmAction.type === 'noshow' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-success-500 hover:bg-success-600 shadow-success-500/20'
                                }`}
                            >
                                {actionLoading ? 'Processing...' : 'Yes, Proceed'}
                            </button>
                            <button
                                onClick={() => setConfirmAction({ isOpen: false, type: null })}
                                className="w-full py-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-[10px] font-black text-gray-600 dark:text-gray-300 tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedRegistryDetailViewer;
