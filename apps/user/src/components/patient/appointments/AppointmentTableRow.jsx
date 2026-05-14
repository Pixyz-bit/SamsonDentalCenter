import { Badge, Dropdown, DropdownItem } from '../../ui'; // Nudge for refresh
import { ThreeDotsIcon } from './AppointmentIcons';
import { STATUS_LABEL, STATUS_COLOR, getDisplayStatus, formatDate, formatTime } from '../../../hooks/useAppointments';
import { Calendar, Clock, User, UserCheck, ChevronRight, X } from 'lucide-react';

const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getInitial = (name = '') => name.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase();

const AppointmentTableRow = ({ appointment, user, onViewDetails }) => {
    const { label: displayStatus, color: badgeColor } = getDisplayStatus(appointment.status, appointment.approval_status, appointment.cancellation_reason);
    
    const patientName = (appointment.last_name || appointment.first_name)
        ? `${appointment.first_name || ''} ${appointment.last_name || ''}`.trim()
        : (appointment.booked_for_name || 'Yourself');

    const isSelf = patientName === 'Yourself' || patientName === (user?.full_name || '');
    const isPending = appointment.status === 'PENDING' && (appointment.approval_status || '').toLowerCase() !== 'approved' && (appointment.approval_status || '').toLowerCase() !== 'rejected';

    // Custom date formatter to handle mobile (no day name) vs desktop
    const formatMobileDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div 
            onClick={() => onViewDetails(appointment.id)}
            className='group relative bg-white dark:bg-white/[0.03] sm:rounded-xl border-b sm:border border-gray-100 dark:border-gray-800 sm:shadow-sm hover:shadow-md sm:hover:z-10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-row items-center'
        >
            {/* 1. Left Side: Schedule Block (Desktop Only) */}
            <div className='hidden sm:flex w-48 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-200 dark:border-white/10 shrink-0 flex-col text-left py-1'>
                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Date</p>
                    <p className='text-[16px] font-medium text-gray-900 dark:text-white leading-tight'>
                        {formatDate(appointment.date)}
                    </p>
                </div>
                <div className='h-px w-full bg-gray-200 dark:bg-white/5' />
                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Time</p>
                    <p className='text-[15px] font-medium text-brand-500 leading-tight'>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </p>
                </div>
            </div>

            {/* 2. Content Area (Unified but responsive) */}
            <div className='flex-grow flex items-center min-w-0'>
                {/* Mobile View (xs only) */}
                <div className='flex sm:hidden gap-4 w-full pl-6 pr-4 py-4 items-center'>
                    <div className='shrink-0'>
                        <div className='w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20'>
                            {getInitial(patientName)}
                        </div>
                    </div>
                    <div className='flex-grow min-w-0 flex flex-col gap-0.5'>
                        <div className='flex justify-between items-center min-w-0'>
                            <span className='text-[17px] font-medium text-gray-900 dark:text-white tracking-tight truncate flex-grow min-w-0'>
                                {patientName}
                            </span>
                            <div className='shrink-0 ml-2'>
                                <Badge size='sm' color={badgeColor} className='font-medium text-[10px] px-2.5 py-0.5 rounded-md'>
                                    {displayStatus}
                                </Badge>
                            </div>
                        </div>
                        <div className='text-[13px] truncate text-gray-500 dark:text-gray-400 font-medium leading-tight'>
                            {appointment.service}
                        </div>
                        <div className='flex justify-between items-end mt-0.5'>
                            <div className='text-[11px] text-gray-700 dark:text-gray-400 font-medium truncate pr-4 flex items-center gap-1.5'>
                                <span>{formatMobileDate(appointment.date)}</span>
                                <span className='text-gray-400'>•</span>
                                <span className='text-gray-500/80'>{formatTime(appointment.start_time)}</span>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Chevron Right */}
                    <div className='shrink-0 text-brand-500 ml-2'>
                        <ChevronRight size={20} strokeWidth={3} />
                    </div>
                </div>

                {/* Desktop View Content (sm and up) - Refined Columnar Layout */}
                <div className='hidden sm:flex flex-grow px-8 py-5 items-center gap-8 min-w-0'>
                    {/* Patient Profile Avatar */}
                    <div className='shrink-0'>
                        <div className='w-14 h-14 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-500/10'>
                            {getInitial(patientName)}
                        </div>
                    </div>
                    
                    <div className='flex flex-grow items-center min-w-0'>
                        {/* Patient Profile Info */}
                        <div className='flex flex-col min-w-0 w-[240px] shrink-0'>
                            <h3 className='text-[20px] font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-brand-500 transition-colors'>
                                {patientName}
                            </h3>
                            <p className='text-[13px] font-medium text-gray-700 dark:text-gray-400'>Patient</p>
                        </div>

                        {/* Service Info Column */}
                        <div className='flex flex-col min-w-0 w-[260px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>
                                {appointment.service_tier === 'specialized' ? 'Specialized service' : 'General service'}
                            </p>
                            <div className='flex items-center gap-1.5 text-gray-900 dark:text-white'>
                                <span className='text-[17px] font-medium truncate'>
                                    {appointment.service}
                                </span>
                            </div>
                        </div>

                        {/* Status Column */}
                        <div className='flex flex-col min-w-0 w-[140px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>Status</p>
                            <div>
                                <Badge size='sm' color={badgeColor} className='font-medium text-[11px] px-3.5 py-1 rounded-md'>
                                    {displayStatus}
                                </Badge>
                            </div>
                        </div>

                        <div className='flex-grow' />

                        {/* Desktop View Action - Right Floating Chevron */}
                        <div className='shrink-0 ml-4 flex items-center justify-center text-brand-500 transition-all transform group-hover:translate-x-1'>
                            <ChevronRight size={24} strokeWidth={3} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentTableRow;
