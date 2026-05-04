import React from 'react';
import { Clock, Calendar, UserCheck } from 'lucide-react';

const RequestDetailsCard = ({ appointment }) => {
    const formatTime12h = (timeStr) => {
        if (!timeStr) return '';
        const [hour, min] = timeStr.split(':');
        const h = parseInt(hour);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${min} ${ampm}`;
    };

    return (
        <div className='flex flex-col gap-4'>
            {/* Service & Time Card */}
            <div className='p-6 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-start justify-between'>
                <div className='space-y-1'>
                    <span className='block text-[10px] font-black text-brand-600 uppercase tracking-widest'>Requested Service</span>
                    <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight'>{appointment.service?.name}</h3>
                </div>
                <div className='text-right flex flex-col items-end gap-1'>
                    <div className='flex items-center gap-2 px-3 py-1.5 bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20'>
                        <Clock size={14} />
                        <span className='text-[11px] font-black uppercase tracking-tight'>
                            {formatTime12h(appointment.start_time)} - {formatTime12h(appointment.end_time)}
                        </span>
                    </div>
                    <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1'>
                        {new Date(appointment.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Doctor Card */}
            <div className='p-5 rounded-2xl bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-brand-500 shadow-sm'>
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <span className='block text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5'>Assigned Specialist</span>
                        <h4 className='text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight'>
                            {appointment.dentist?.profile?.full_name || 'Unassigned'}
                        </h4>
                    </div>
                </div>
                <div className='text-right'>
                    <span className='px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[9px] font-black uppercase tracking-widest'>
                        {appointment.dentist?.specialization || 'General'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default RequestDetailsCard;
