import React from 'react';
import AppointmentDetailActionBar from '../approval_details/AppointmentDetailActionBar';
import ApprovalStatusTimeline from '../approval_details/ApprovalStatusTimeline';
import PatientOverview from '../approval_details/PatientOverview';
import DoctorOverview from '../approval_details/DoctorOverview';
import AppointmentLogistics from '../approval_details/AppointmentLogistics';
import { X, CheckCircle2, RotateCcw } from 'lucide-react';
import { formatDate } from '../../../hooks/useAppointments';

const AppointmentDetailView = ({ appointment, onBack, onCancel, onReschedule, onComplete, isProcessing }) => {
    if (!appointment) return null;

    // Derive display status color mapping matching user portal
    const getStatusStyles = (status) => {
        const s = status?.toUpperCase();
        switch (s) {
            case 'COMPLETED': return { label: 'Completed', color: 'success' };
            case 'CONFIRMED': 
            case 'UPCOMING': 
            case 'APPROVED': return { label: 'Approved', color: 'info' };
            case 'IN_PROGRESS': return { label: 'In Progress', color: 'warning' };
            case 'CANCELLED': return { label: 'Cancelled', color: 'error' };
            default: return { label: status, color: 'info' };
        }
    };

    const { label: displayStatus, color: badgeColor } = getStatusStyles(appointment.status);

    return (
        <div className='flex-grow min-h-0 relative sm:mx-0'>
            <div className='flex-grow flex flex-col h-full bg-white dark:bg-gray-900 sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]'>
                
                <AppointmentDetailActionBar onBack={onBack} />

                {/* Content Area - Minimalist Secretary View */}
                <div className='px-0 py-6 sm:p-8 md:p-10 overflow-y-auto grow no-scrollbar pb-28 sm:pb-8 md:pb-10 bg-white/50 dark:bg-transparent'>
                    <div className='w-full space-y-3 sm:space-y-8'>
                        
                        {/* 1. Header Section: Service Name & Status */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 px-4 py-5 sm:p-8 shadow-theme-xs'>
                            <div className='flex flex-row items-center justify-between gap-4'>
                                <div className='space-y-2'>
                                    <h2 className='text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-outfit leading-tight tracking-tight'>
                                        {appointment.service.name}
                                    </h2>
                                    <div className='flex items-center gap-2 text-[10px] sm:text-[12px] font-bold'>
                                        <span className='uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500'>Appointment ID:</span>
                                        <span className='font-mono text-brand-600 dark:text-brand-400 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded-lg'>
                                            {appointment.id?.toString().substring(0, 8).toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className='shrink-0'>
                                    <span
                                        className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl uppercase tracking-wider shadow-sm ${
                                            badgeColor === 'success'
                                                ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400 shadow-success-500/5'
                                                : badgeColor === 'warning'
                                                  ? 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400 shadow-warning-500/5'
                                                  : badgeColor === 'error'
                                                    ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 shadow-error-500/5'
                                                    : 'bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400 shadow-info-500/5'
                                        }`}
                                    >
                                        {displayStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Timeline Section */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                            <ApprovalStatusTimeline
                                status={appointment.status}
                                createdAt={appointment.date}
                                updatedAt={appointment.date}
                                approvalStatus="APPROVED"
                                rawId={appointment.id}
                            />
                        </div>

                        {/* 3. Patient Profile (Now contains Permanent Patient Note) */}
                        <PatientOverview 
                            patient={appointment.patient} 
                            appointmentNote={appointment.notes}
                            completedCount={5} 
                        />

                        {/* 4. Assigned Doctor Section */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                            <DoctorOverview
                                dentistName={appointment.doctor.name}
                                specialization="General Dentistry"
                            />
                        </div>

                        {/* 5. Appointment Logistics Section */}
                        <div className='bg-white dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-2xl mx-4 sm:mx-0 p-4 sm:p-8 shadow-theme-xs'>
                            <AppointmentLogistics
                                date={formatDate(appointment.date)}
                                time={appointment.time}
                                duration="1h"
                                patientName={appointment.patient.name}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer Actions - Matched to User Portal side-by-side mobile layout */}
                <div className='fixed bottom-0 left-0 right-0 sm:relative z-20 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sm:shadow-none py-5 sm:py-6'>
                    <div className='px-4 sm:px-8 md:px-10 flex items-center justify-end gap-2 sm:gap-3 w-full'>
                        <button 
                            onClick={onCancel}
                            disabled={isProcessing}
                            className={`flex-1 sm:flex-none sm:min-w-[160px] inline-flex items-center justify-center gap-1.5 px-2 py-2.5 sm:py-3 bg-white dark:bg-gray-800 text-error-600 font-bold text-[10px] sm:text-[14px] rounded-xl border border-error-100 dark:border-error-500/20 transition-all hover:bg-error-50 active:scale-95 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <X size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                            {isProcessing ? 'Processing...' : 'Cancel Appointment'}
                        </button>
                        <button 
                            onClick={onReschedule}
                            disabled={isProcessing}
                            className={`flex-1 sm:flex-none sm:min-w-[160px] inline-flex items-center justify-center gap-1.5 px-2 py-2.5 sm:py-3 bg-brand-500 text-white font-bold text-[10px] sm:text-[14px] rounded-xl shadow-theme-lg active:scale-95 hover:bg-brand-600 transition-all ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                            Reschedule Appointment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailView;
