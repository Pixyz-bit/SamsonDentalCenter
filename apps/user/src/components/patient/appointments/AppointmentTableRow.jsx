import { Badge, Dropdown, DropdownItem } from '../../ui';
import { ThreeDotsIcon } from './AppointmentIcons';
import { STATUS_LABEL, STATUS_COLOR, getDisplayStatus, formatDate, formatTime } from '../../../hooks/useAppointments';
import { Calendar, Clock, User, UserCheck, ChevronRight } from 'lucide-react';

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

    // Custom date formatter to handle mobile (no day name) vs desktop
    const formatMobileDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div 
            onClick={() => onViewDetails(appointment.id)}
            className='group relative bg-white dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-row'
        >
            {/* 1. Left Side: Schedule Block (Desktop Only) */}
            <div className='hidden sm:flex w-44 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-200 dark:border-gray-800 shrink-0 flex-col text-center'>
                <div className='px-4 py-2.5 flex-1 flex flex-col justify-center'>
                    <p className='text-[10px] font-bold text-gray-400 mb-0.5'>Date</p>
                    <p className='text-[14px] font-bold text-gray-900 dark:text-white leading-tight'>
                        {formatDate(appointment.date)}
                    </p>
                </div>
                <div className='h-px w-full bg-gray-200 dark:bg-gray-700/50' />
                <div className='px-4 py-2.5 flex-1 flex flex-col justify-center'>
                    <p className='text-[10px] font-bold text-gray-400 mb-0.5'>Time</p>
                    <p className='text-[13px] font-bold text-brand-500 leading-tight'>
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </p>
                </div>
            </div>

            {/* 2. Middle: Content Area */}
            <div className='flex-grow px-4 py-3 sm:px-8 sm:py-3 flex items-center gap-4 sm:gap-6 min-w-0'>
                <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-sm sm:text-xl shadow-lg shadow-brand-500/10 shrink-0'>
                    {getInitial(appointment.service)}
                </div>
                <div className='flex flex-col min-w-0'>
                    <h3 className='text-[13px] sm:text-[16px] font-bold text-gray-900 dark:text-white truncate leading-tight group-hover:text-brand-500 transition-colors'>
                        {appointment.service}
                    </h3>
                    
                    <div className='flex flex-col gap-0.5 mt-0.5'>
                        <div className='flex items-center gap-1.5 text-gray-400'>
                            <User size={12} className='shrink-0 sm:w-3.5 sm:h-3.5' />
                            <span className='text-[11px] sm:text-[13px] font-medium truncate'>
                                {patientName} {isSelf && <span className='text-brand-500 opacity-70 ml-1'>(You)</span>}
                            </span>
                        </div>
                        
                        {/* Mobile-Only Schedule Detail */}
                        <div className='sm:hidden flex items-center gap-2 text-gray-500 font-bold text-[10px] mt-0.5'>
                            <span className='text-gray-900 dark:text-white'>{formatMobileDate(appointment.date)}</span>
                            <span className='text-gray-300'>•</span>
                            <span className='text-brand-500'>{formatTime(appointment.start_time)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Right Side: Status & Action Block */}
            <div className='w-24 sm:w-44 bg-gray-50/50 dark:bg-gray-800/20 border-l border-gray-200 dark:border-gray-800 shrink-0 flex flex-col text-center'>
                <div className='px-1 py-2 sm:px-4 sm:py-2.5 flex-1 flex flex-col justify-center items-center'>
                    <p className='hidden sm:block text-[10px] font-bold text-gray-400 mb-1'>Status</p>
                    <Badge size='sm' color={badgeColor} className='font-bold text-[9px] sm:text-[11px] px-2.5 sm:px-4 py-0.5 sm:py-1 rounded-md border-0'>
                        {displayStatus}
                    </Badge>
                </div>
                <div className='h-px w-full bg-gray-200 dark:bg-gray-700/50' />
                <div className='px-1 py-2 sm:px-4 sm:py-2.5 flex-1 flex items-center justify-center'>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(appointment.id);
                        }}
                        className='px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] sm:text-[12px] font-bold flex items-center gap-2 hover:border-brand-500 hover:text-brand-500 transition-all active:scale-95'
                    >
                        <span className='hidden sm:inline text-gray-500 dark:text-gray-400'>View</span>
                        <ChevronRight size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentTableRow;
