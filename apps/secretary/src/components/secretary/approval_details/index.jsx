import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AppointmentDetailActionBar from './AppointmentDetailActionBar';
import ApprovalStatusTimeline from './ApprovalStatusTimeline';
import PatientOverview from './PatientOverview';
import DoctorOverview from './DoctorOverview';
import AppointmentLogistics from './AppointmentLogistics';
import AppointmentDetailFooter from './AppointmentDetailFooter';
import RequestDecisionModal from './RequestDecisionModal';
import { formatDate } from '../../../hooks/useAppointments';

// ---------------------------------------------------------------------------
// Helper: Compute Slot Position (8:00 AM - 5:00 PM shift)
// ---------------------------------------------------------------------------
const timeToSlot = (timeStr) => {
    if (!timeStr) return 0;
    
    let hours = 0;
    let minutes = 0;

    // Handle "9:00 AM" style
    if (timeStr.includes(' ')) {
        const [time, period] = timeStr.split(' ');
        const [h, m] = time.split(':').map(Number);
        hours = h;
        minutes = m;
        if (period?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
    } 
    // Handle "09:00:00" style
    else if (timeStr.includes(':')) {
        const parts = timeStr.split(':');
        hours = parseInt(parts[0]);
        minutes = parseInt(parts[1]);
    }

    const totalMinutes = hours * 60 + minutes;
    const shiftStart = 8 * 60; // 8:00 AM
    const shiftEnd = 17 * 60; // 5:00 PM
    const shiftDuration = shiftEnd - shiftStart;
    
    let pos = ((totalMinutes - shiftStart) / shiftDuration) * 100;
    return Math.max(0, Math.min(95, pos));
};

const getDuration = (start, end) => {
    if (!start || !end) return null;
    const toMinutes = (timeStr) => {
        if (!timeStr) return 0;
        let hours = 0;
        let minutes = 0;

        if (timeStr.includes(' ')) {
            const [time, period] = timeStr.split(' ');
            const [h, m] = time.split(':').map(Number);
            hours = h;
            minutes = m;
            if (period?.toUpperCase() === 'PM' && hours < 12) hours += 12;
            if (period?.toUpperCase() === 'AM' && hours === 12) hours = 0;
        } else {
            const parts = timeStr.split(':').map(Number);
            hours = parts[0];
            minutes = parts[1] || 0;
        }
        return hours * 60 + minutes;
    };
    const diff = toMinutes(end) - toMinutes(start);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h && m) return `${h}h ${m}min`;
    if (h) return `${h} Hour${h > 1 ? 's' : ''}`;
    return `${m} min`;
};

const ApprovalDetailView = ({ 
    request, 
    onApprove, 
    onReject, 
    isProcessing = false,
    onBack, 
    fetchDentistSchedule, 
    fetchPatientStats 
}) => {
    const [decisionModal, setDecisionModal] = useState({ isOpen: false, mode: 'approve' });
    const [rejectionReason, setRejectionReason] = useState('');
    const [busySlots, setBusySlots] = useState([]);
    const [patientStats, setPatientStats] = useState({ completed: 0 });
    const [loadingSchedule, setLoadingSchedule] = useState(false);

    useEffect(() => {
        if (request && fetchDentistSchedule) {
            setLoadingSchedule(true);
            fetchDentistSchedule(request.dentistId, request.requestedDate)
                .then(appts => {
                    const slots = (appts || []).map(a => timeToSlot(a.start_time));
                    setBusySlots(slots);
                })
                .finally(() => setLoadingSchedule(false));
        }
        if (request && fetchPatientStats) {
            fetchPatientStats(request.patient.id).then(stats => setPatientStats(stats));
        }
    }, [request, fetchDentistSchedule, fetchPatientStats]);

    if (!request) return (
        <div className="flex flex-col items-center justify-center p-20 text-center animate-[fadeIn_0.2s_ease-out]">
            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <X className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Request Not Found</h3>
            <p className="text-sm text-gray-500 mb-6">The appointment request you are looking for does not exist or has been removed.</p>
            <button onClick={onBack} className="px-6 py-2 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 active:scale-95 transition-all">
                Go Back to Inbox
            </button>
        </div>
    );

    const slotPosition = timeToSlot(request.requestedTime);
    const isConflict = busySlots.some(pos => Math.abs(pos - slotPosition) < 8);
    const duration = getDuration(request.requestedTime, request.requestedEndTime);

    return (
        <div className='flex-grow min-h-0 relative sm:mx-0'>
            <div className='flex-grow flex flex-col h-full bg-white dark:bg-gray-900 sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]'>
                
                <AppointmentDetailActionBar onBack={onBack} />

                {/* Content Area - Matched to User Portal Aesthetic but Streamlined */}
                <div className='px-0 py-6 sm:p-8 md:p-10 overflow-y-auto grow no-scrollbar pb-32 sm:pb-10 bg-white/50 dark:bg-transparent'>
                    <div className='w-full space-y-3 sm:space-y-8'>
                        
                        {/* 1. Header Section: Service Name & Status */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 px-4 py-5 sm:p-8 shadow-theme-xs'>
                            <div className='flex flex-row items-center justify-between gap-4'>
                                <div className='space-y-2'>
                                    <h2 className='text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-outfit leading-tight tracking-tight'>
                                        {request.service}
                                    </h2>
                                    <div className='flex items-center gap-2 text-[10px] sm:text-[12px] font-bold'>
                                        <span className='uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500'>Request ID:</span>
                                        <span className='font-mono text-brand-600 dark:text-brand-400 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg'>
                                            {request.id?.toString().substring(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className='shrink-0'>
                                    <span className='px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl uppercase tracking-wider shadow-sm bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400 shadow-warning-500/5'>
                                        Pending Request
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Timeline Section */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                            <ApprovalStatusTimeline 
                                createdAt={request.createdAt}
                                updatedAt={request.updatedAt}
                                status={request.status}
                                approvalStatus={request.approvalStatus}
                                rawId={request.id}
                            />
                        </div>

                        {/* 3. Patient Overview (Contains Permanent Note) */}
                        <PatientOverview 
                            patient={request.patient} 
                            appointmentNote={request.notes}
                            completedCount={patientStats.completed} 
                        />

                        {/* 4. Doctor Overview Section */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                            <DoctorOverview 
                                dentistName={request.dentist}
                                specialization={request.dentistSpecialization}
                            />
                        </div>

                        {/* 5. Logistics Overview Section */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                            <AppointmentLogistics 
                                date={formatDate(request.requestedDate)}
                                time={`${request.requestedTime} – ${request.requestedEndTime}`}
                                duration={duration}
                                patientName={request.patient.name}
                            />
                        </div>


                    </div>
                </div>

                {/* Footer Actions */}
                <AppointmentDetailFooter 
                    onApprove={() => setDecisionModal({ isOpen: true, mode: 'approve' })}
                    onRejectClick={() => setDecisionModal({ isOpen: true, mode: 'reject' })}
                />

                {/* Unified Decision Modal (Matches User Portal Style) */}
                <RequestDecisionModal 
                    isOpen={decisionModal.isOpen}
                    mode={decisionModal.mode}
                    onClose={() => setDecisionModal({ ...decisionModal, isOpen: false })}
                    onConfirm={(reason) => {
                        if (decisionModal.mode === 'approve') {
                            onApprove(reason);
                        } else {
                            onReject(reason);
                        }
                        // Modal closure is handled by parent state change (refresh) or 
                        // manually if needed, but for now we let the spinner show.
                        // Actually, if it succeeds, the parent will refresh/navigate.
                        // If it fails, we want it to stay open but the parent will handle the toast.
                    }}
                    isProcessing={isProcessing}
                    serviceName={request.service}
                />
            </div>
        </div>
    );
};

export default ApprovalDetailView;
