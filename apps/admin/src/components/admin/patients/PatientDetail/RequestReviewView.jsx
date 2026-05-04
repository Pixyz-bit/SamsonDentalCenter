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
            <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                    <h4 className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>
                        Appointment Review
                    </h4>
                    <p className='text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest'>
                        Evaluate patient requests and doctor schedule compatibility
                    </p>
                </div>
            </div>

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

                    {/* Patient Notes (Move here for better space utilization) */}
                    <div className='p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01] space-y-3'>
                        <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2'>
                            <MessageSquare size={14} /> Patient Request Notes
                        </h4>
                        <p className='text-xs text-gray-600 dark:text-gray-400 italic leading-relaxed'>
                            {appointment.notes || "The patient did not provide any specific notes for this booking."}
                        </p>
                    </div>
                </div>

                {/* Right Side: History List (Takes full height of the row) */}
                <RecentHistoryList 
                    history={patientHistory}
                    loading={loading}
                />
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
