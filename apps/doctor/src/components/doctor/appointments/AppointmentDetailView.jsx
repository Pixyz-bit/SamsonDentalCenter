import React from 'react';
import { 
    X, 
    Calendar, 
    Clock, 
    User, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    ArrowLeft,
    CreditCard,
    Stethoscope
} from 'lucide-react';
import { Badge, Button } from '../../ui';
import { formatDate, formatTime } from '../../../hooks/useAppointments';

const AppointmentDetailView = ({ appointment, onBack, onStart, onCreateInvoice }) => {
    if (!appointment) return null;

    const dentistName = appointment.dentist || 'TBD';
    const patientName = appointment.patient?.name || 'Unknown Patient';
    const statusLabel = appointment.status === 'IN_PROGRESS' ? 'In Progress' : 
                       appointment.status === 'CONFIRMED' ? 'Confirmed' : appointment.status;
    const statusColor = appointment.status === 'IN_PROGRESS' ? 'warning' : 
                       appointment.status === 'CONFIRMED' ? 'success' : 'primary';

    return (
        <div className='flex-grow flex flex-col h-full bg-white dark:bg-gray-900 sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 overflow-hidden animate-[fadeIn_0.2s_ease-out]'>
            
            {/* Header Action Bar */}
            <div className='flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]'>
                <button 
                    onClick={onBack}
                    className='flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group'
                >
                    <div className='p-1.5 rounded-lg group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors'>
                        <ArrowLeft size={18} />
                    </div>
                    Back to Schedule
                </button>

                <div className='flex items-center gap-2'>
                    {appointment.status === 'CONFIRMED' && (
                        <Button size='sm' onClick={onStart} className='font-bold px-6'>
                            Start Treatment
                        </Button>
                    )}
                    {appointment.status === 'IN_PROGRESS' && (
                        <Button size='sm' variant='primary' onClick={onCreateInvoice} className='font-bold px-6 bg-amber-500 hover:bg-amber-600 border-amber-500'>
                            Generate Invoice
                        </Button>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className='p-6 sm:p-10 overflow-y-auto grow no-scrollbar space-y-8'>
                
                {/* 1. Appointment Title & Status */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6'>
                    <div className='space-y-2'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-brand-500/10 rounded-xl text-brand-500'>
                                <Stethoscope size={24} />
                            </div>
                            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-outfit'>
                                {appointment.service}
                            </h2>
                        </div>
                        <div className='flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest'>
                            <span>Reference ID:</span>
                            <span className='text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded'>
                                {appointment.id.substring(0, 8).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <Badge color={statusColor} size='lg' className='uppercase tracking-widest font-black text-[10px]'>
                        {statusLabel}
                    </Badge>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {/* 2. Patient Profile Card */}
                    <div className='lg:col-span-2 space-y-6'>
                        <div className='bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-theme-xs'>
                            <div className='flex items-center gap-4 mb-6'>
                                <div className='w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400'>
                                    <User size={28} />
                                </div>
                                <div>
                                    <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Patient Profile</h3>
                                    <p className='text-sm text-gray-500'>{appointment.patient?.phone || 'No phone provided'}</p>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                                <div className='space-y-1'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Full Name</span>
                                    <p className='text-base font-semibold text-gray-900 dark:text-white'>{patientName}</p>
                                </div>
                                <div className='space-y-1'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Primary Dentist</span>
                                    <p className='text-base font-semibold text-gray-900 dark:text-white'>{dentistName}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Clinical Logistics */}
                        <div className='bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-theme-xs'>
                            <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
                                <Clock size={20} className='text-brand-500' />
                                Session Logistics
                            </h3>
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-8'>
                                <div className='space-y-1'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Scheduled Date</span>
                                    <div className='flex items-center gap-2 text-gray-900 dark:text-white'>
                                        <Calendar size={16} className='text-gray-400' />
                                        <span className='text-sm font-semibold'>{formatDate(appointment.date)}</span>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Time Slot</span>
                                    <div className='flex items-center gap-2 text-gray-900 dark:text-white'>
                                        <Clock size={16} className='text-gray-400' />
                                        <span className='text-sm font-semibold'>{appointment.start_time} - {appointment.end_time}</span>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>Duration</span>
                                    <div className='flex items-center gap-2 text-gray-900 dark:text-white'>
                                        <FileText size={16} className='text-gray-400' />
                                        <span className='text-sm font-semibold'>60 Minutes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Sidebar Stats/Quick Info */}
                    <div className='space-y-6'>
                        <div className='bg-brand-500 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20'>
                            <div className='flex items-center gap-3 mb-4'>
                                <CheckCircle2 size={24} />
                                <h4 className='font-bold'>Clinical Progress</h4>
                            </div>
                            <p className='text-sm text-brand-50 opacity-90 mb-6'>
                                This session is currently logged as active in your daily roster.
                            </p>
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between text-sm border-b border-white/10 pb-2'>
                                    <span>Procedure Ready</span>
                                    <span className='font-bold'>YES</span>
                                </div>
                                <div className='flex items-center justify-between text-sm border-b border-white/10 pb-2'>
                                    <span>Materials Prepped</span>
                                    <span className='font-bold'>YES</span>
                                </div>
                            </div>
                        </div>

                        <div className='bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl p-6'>
                            <div className='flex items-center gap-3 mb-4 text-amber-600 dark:text-amber-400'>
                                <AlertCircle size={24} />
                                <h4 className='font-bold'>Doctor's Note</h4>
                            </div>
                            <p className='text-sm text-amber-700 dark:text-amber-400/80 leading-relaxed italic'>
                                "Patient mentioned sensitive gums during last visit. Proceed with local anesthesia if required for extraction."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer Action */}
            <div className='p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02] flex justify-end gap-3'>
                <Button variant='ghost' onClick={onBack} className='font-bold'>
                    Cancel View
                </Button>
                {appointment.status === 'IN_PROGRESS' && (
                    <Button variant='primary' onClick={onCreateInvoice} className='font-bold bg-brand-500 shadow-lg shadow-brand-500/20 px-8'>
                        Generate Invoice & Finish
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AppointmentDetailView;
