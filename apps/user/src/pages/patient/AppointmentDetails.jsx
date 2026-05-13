import React, { useState } from 'react'; // Nudge for refresh
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import useAppointmentDetail from '../../hooks/useAppointmentDetail';
import { STATUS_LABEL, STATUS_COLOR, getDisplayStatus, formatDate, formatTime } from '../../hooks/useAppointments';

// Subcomponents
import AppointmentDetailActionBar from '../../components/patient/appointment_details/AppointmentDetailActionBar';
import AppointmentDetailStatus from '../../components/patient/appointment_details/AppointmentDetailStatus';
import AppointmentDetailTabs from '../../components/patient/appointment_details/AppointmentDetailTabs';
import AppointmentDetailFooter from '../../components/patient/appointment_details/AppointmentDetailFooter';
import AppointmentCancelModal from '../../components/patient/appointment_details/AppointmentCancelModal';
import ReschedulePolicyModal from '../../components/patient/appointment_details/ReschedulePolicyModal';
import CombinedOverview from '../../components/patient/appointment_details/CombinedOverview';
import AppointmentDetailSkeleton from '../../components/patient/appointment_details/AppointmentDetailSkeleton';
import ErrorState from '../../components/common/ErrorState';

// ---------------------------------------------------------------------------
// Compute a human-readable duration
// ---------------------------------------------------------------------------
const getDuration = (start, end) => {
    if (!start || !end) return null;
    const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    const diff = toMinutes(end) - toMinutes(start);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h && m) return `${h}h ${m}min`;
    if (h) return `${h} Hour${h > 1 ? 's' : ''}`;
    return `${m} min`;
};


// ---------------------------------------------------------------------------
// Main Wrapper
// ---------------------------------------------------------------------------
const AppointmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        appointment: raw,
        loading,
        error,
        cancelling,
        cancelError,
        cancelAppointment,
    } = useAppointmentDetail(id);

    const [activeTab, setActiveTab] = useState('description');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // Reschedule Modals
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleMode, setRescheduleMode] = useState('warning'); // 'warning' | 'contact'

    // --- Loading ---
    if (loading) {
        return (
            <>
                <PageBreadcrumb
                    pageTitle='Appointment Details'
                    parentName='My Appointments'
                    parentPath='/patient/appointments'
                />
                <AppointmentDetailSkeleton />
            </>
        );
    }

    // --- Error / Not found ---
    if (error || !raw) {
        return (
            <>
                <PageBreadcrumb
                    pageTitle='Appointment Details'
                    parentName='My Appointments'
                    parentPath='/patient/appointments'
                />
                <ErrorState 
                    error={error} 
                    onRetry={() => window.location.reload()} 
                    title="Appointment Not Found"
                    parentName="Appointments"
                    parentPath="/patient/appointments"
                />
            </>
        );
    }

    // --- Derive data ---
    const dentistName = raw?.dentist?.profile?.first_name 
        ? `${raw.dentist.profile.last_name}, ${raw.dentist.profile.first_name} ${raw.dentist.profile.middle_name || ''} ${raw.dentist.profile.suffix || ''}`.replace(/\s+/g, ' ').trim() 
        : (raw?.dentist?.profile?.full_name || raw?.dentist || 'TBD');
    const specialization = raw?.dentist?.specialization || null;
    const serviceName = raw?.service?.name || raw?.service || '—';
    const { label: displayStatus, color: badgeColor } = getDisplayStatus(raw.status, raw.approval_status);
    const duration = raw ? getDuration(raw.start_time, raw.end_time) : null;
    const patientLabel = (raw?.last_name || raw?.guest_last_name)
        ? (raw.last_name 
            ? `${raw.last_name}, ${raw.first_name} ${raw.middle_name || ''} ${raw.suffix || ''}`.replace(/\s+/g, ' ').trim()
            : `${raw.guest_last_name}, ${raw.guest_first_name} ${raw.guest_middle_name || ''} ${raw.guest_suffix || ''}`.replace(/\s+/g, ' ').trim())
        : raw?.booked_for_name
          ? raw.booked_for_name
          : raw?.patient_id
            ? 'Yourself'
            : '—';
    const isRepresentativeBooking = !!raw?.booked_for_name;
    const isPending = raw.status === 'PENDING' && (raw.approval_status || '').toLowerCase() !== 'approved' && (raw.approval_status || '').toLowerCase() !== 'rejected';
    const isApproved = ((raw.approval_status || '').toLowerCase() === 'approved' || raw.status === 'CONFIRMED') && !['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'RESCHEDULED', 'COMPLETED', 'IN_PROGRESS'].includes(raw.status);
    const isHistory = ['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'COMPLETED'].includes(raw.status) || (raw.approval_status || '').toLowerCase() === 'rejected';

    const isCancellable = isPending || isApproved;
    // Reschedule is ONLY for Approved appointments
    const isReschedulable = isApproved;
    const rescheduleCount = raw?.reschedule_count || 0;
    const hasRescheduled = rescheduleCount >= 1;

    // Calculate if it's a late cancellation (within 24 hours)
    const appointmentDateTime = raw?.appointment_date && raw?.start_time 
        ? new Date(`${raw.appointment_date}T${raw.start_time}`) 
        : null;
    const isLate = appointmentDateTime ? (appointmentDateTime - new Date()) / (1000 * 60 * 60) < 24 : false;

    const handleCancel = async () => {
        const result = await cancelAppointment(
            cancelReason.trim() || 'Patient requested cancellation.',
        );
        if (result.success) {
            setShowCancelModal(false);
            setCancelReason('');
        }
    };

    const handleRescheduleClick = () => {
        if (hasRescheduled) {
            setRescheduleMode('contact');
            setShowRescheduleModal(true);
        } else {
            setRescheduleMode('warning');
            setShowRescheduleModal(true);
        }
    };

    const confirmReschedule = () => {
        setShowRescheduleModal(false);
        navigate(`/patient/appointments/${id}/reschedule`);
    };

    return (
        <>
            <PageBreadcrumb
                pageTitle='Appointment Details'
                parentName={isPending || (raw.approval_status || '').toLowerCase() === 'rejected' ? 'My Requests' : 'My Appointments'}
                parentPath={isPending || (raw.approval_status || '').toLowerCase() === 'rejected' ? '/patient/requests' : '/patient/appointments'}
            />

            <div className='flex-grow min-h-0 relative sm:mx-0'>
                <div className='flex-grow flex flex-col h-full bg-white dark:bg-gray-900 sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]'>
                    <AppointmentDetailActionBar onBack={() => navigate('/patient/appointments')} />

                    {/* Content Area */}
                    <div className='px-0 py-6 sm:p-8 md:p-10 overflow-y-auto grow no-scrollbar pb-28 sm:pb-8 md:pb-10 bg-white/50 dark:bg-transparent'>
                        <div className='max-w-4xl mx-auto space-y-3 sm:space-y-8'>
                            {/* Header Section: Service Name & Status */}
                            <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 px-4 py-5 sm:p-8 shadow-theme-xs'>
                                <div className='flex flex-row items-center justify-between gap-4'>
                                    <div className='space-y-2'>
                                        <h2 className='text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-outfit leading-tight tracking-tight'>
                                            {serviceName}
                                        </h2>
                                        <div className='flex items-center gap-2 text-[10px] sm:text-[12px] font-bold'>
                                            <span className='uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500'>Appointment ID:</span>
                                            <span className='font-mono text-brand-600 dark:text-brand-400 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg'>
                                                {raw.id?.slice(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className='shrink-0'>
                                        <span
                                            className={`px-4 py-2 text-[11px] sm:text-xs font-bold rounded-xl uppercase tracking-widest shadow-sm ${
                                                badgeColor === 'success'
                                                    ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 shadow-success-500/5'
                                                    : badgeColor === 'warning'
                                                      ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400 shadow-warning-500/5'
                                                      : badgeColor === 'error'
                                                        ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 shadow-error-500/5'
                                                        : badgeColor === 'info'
                                                          ? 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400 shadow-info-500/5'
                                                          : 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 shadow-error-500/5'
                                            }`}
                                        >
                                            {displayStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Section wrapped in its own container */}
                            <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                                <AppointmentDetailStatus
                                    displayStatus={displayStatus}
                                    originalStatus={raw.status}
                                    createdAt={raw.created_at}
                                    updatedAt={raw.updated_at}
                                    rawId={raw.id}
                                    cancellationReason={raw.cancellation_reason}
                                    rejectionReason={raw.rejection_reason}
                                    approvalStatus={raw.approval_status}
                                />
                            </div>

                            {/* Overview Section */}
                            <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                                <CombinedOverview
                                    dentistName={dentistName}
                                    specialization={specialization}
                                    dateFormatted={formatDate(raw.appointment_date)}
                                    timeFormatted={`${formatTime(raw.start_time)} – ${formatTime(raw.end_time)}`}
                                    duration={duration}
                                    patientLabel={patientLabel}
                                    isRepresentativeBooking={isRepresentativeBooking}
                                />
                            </div>

                            {/* Tabs Section */}
                            <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                                <AppointmentDetailTabs
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    notes={raw.notes}
                                    originalStatus={raw.status}
                                />
                            </div>
                        </div>
                    </div>

                    <AppointmentDetailFooter
                        isCancellable={isCancellable}
                        isReschedulable={isReschedulable}
                        isPending={isPending}
                        isApproved={isApproved}
                        hasRescheduled={hasRescheduled}
                        onCancelClick={() => setShowCancelModal(true)}
                        onRescheduleClick={handleRescheduleClick}
                    />
                </div>
            </div>

            <AppointmentCancelModal
                show={showCancelModal}
                onClose={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                }}
                cancelReason={cancelReason}
                setCancelReason={setCancelReason}
                rawId={raw?.id || ''}
                cancelling={cancelling}
                handleCancel={handleCancel}
                isPending={isPending}
                isLate={isLate}
                serviceName={serviceName}
            />

            <ReschedulePolicyModal
                show={showRescheduleModal}
                mode={rescheduleMode}
                onClose={() => setShowRescheduleModal(false)}
                onConfirm={confirmReschedule}
            />
        </>
    );
};

export default AppointmentDetails;
