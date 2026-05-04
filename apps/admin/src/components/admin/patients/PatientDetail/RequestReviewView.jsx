import React, { useState, useEffect } from 'react';
import { 
    MessageSquare
} from 'lucide-react';
import { api } from '../../../../utils/api';

// Sub-components
import ReviewTimeline from './RequestReview/ReviewTimeline';
import PatientProfileCard from './RequestReview/PatientProfileCard';
import RecentHistoryList from './RequestReview/RecentHistoryList';
import RequestDetailsCard from './RequestReview/RequestDetailsCard';
import ConflictChecker from './RequestReview/ConflictChecker';
import DecisionActions from './RequestReview/DecisionActions';

const RequestReviewView = ({ appointment, token, onActionSuccess, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [dentistSchedule, setDentistSchedule] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (appointment) {
            fetchReviewData();
        }
    }, [appointment]);

    const fetchReviewData = async () => {
        try {
            setLoading(true);
            const [historyRes, scheduleRes] = await Promise.all([
                api.get(`/admin/patients/${appointment.patient_id}/history`, token),
                appointment.dentist_id 
                    ? api.get(`/admin/dentists/${appointment.dentist_id}/day-schedule?date=${appointment.appointment_date}`, token)
                    : Promise.resolve({ base_schedule: null, appointments: [], blocks: [] })
            ]);
            
            setPatientHistory(historyRes.appointments || []);
            setDentistSchedule(scheduleRes);
        } catch (err) {
            console.error('Failed to fetch review data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (note) => {
        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointment.id}/approve`, {
                note
            }, token);
            onActionSuccess('Appointment approved successfully');
            onBack();
        } catch (err) {
            alert(err.message || 'Approval failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (reason) => {
        if (!reason) return alert('Please provide a reason for rejection');

        try {
            setActionLoading(true);
            await api.patch(`/admin/appointments/${appointment.id}/reject`, {
                reason
            }, token);
            onActionSuccess('Appointment rejected');
            onBack();
        } catch (err) {
            alert(err.message || 'Rejection failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (!appointment) return null;

    const patientStats = {
        completed: patientHistory.filter(a => a.status === 'COMPLETED').length,
        noShow: patientHistory.filter(a => a.status === 'NO_SHOW').length,
        cancelled: patientHistory.filter(a => a.status === 'CANCELLED' || a.status === 'LATE_CANCEL').length,
    };

    return (
        <div className='flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300'>
            
            {/* Standard Tab Header */}
            <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Appointment Review
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                            Evaluate patient requests and doctor schedule compatibility
                        </p>
                    </div>
                </div>

                <div className='space-y-8'>
                    {/* Row 1: Timeline */}
                    <ReviewTimeline 
                        createdAt={appointment.created_at} 
                        status={appointment.status}
                        updatedAt={appointment.updated_at}
                    />

                    {/* Row 2: Grid Layout */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        {/* Left Side: Profile & Details */}
                        <div className='space-y-8'>
                            <PatientProfileCard 
                                patient={appointment.patient}
                                stats={patientStats}
                            />
                            
                            <RequestDetailsCard 
                                appointment={appointment}
                            />

                            {/* Patient Notes */}
                            <div className='p-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01] space-y-3'>
                                <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                                    <MessageSquare size={14} /> Patient Request Notes
                                </h4>
                                <p className='text-xs text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed'>
                                    {appointment.notes || "The patient did not provide any specific notes for this booking."}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: History List */}
                        <RecentHistoryList 
                            history={patientHistory}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>

            {/* Row 3: Full Width Conflict Checker */}
            <ConflictChecker 
                schedule={dentistSchedule}
                requestedSlot={{ start: appointment.start_time, end: appointment.end_time }}
                loading={loading}
            />

            {/* Row 4: Final Actions */}
            <DecisionActions 
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={onBack}
                actionLoading={actionLoading}
            />
        </div>
    );
};

export default RequestReviewView;
