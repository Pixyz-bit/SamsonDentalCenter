import React from 'react';
import { Calendar, Clock, Stethoscope, User, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

const ReviewStep = ({ formData, submitting, onPrev, onSubmit, result, onReset }) => {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
        }).toUpperCase();
    };

    const formatTimeRange = (time24, durationMinutes) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        
        const startDate = new Date();
        startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        const format = (d) => {
            let h = d.getHours();
            let m = d.getMinutes();
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            m = m < 10 ? '0' + m : m;
            return `${h}:${m} ${ampm}`;
        };

        if (!durationMinutes) return format(startDate);
        
        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
        return `${format(startDate)} - ${format(endDate)}`;
    };

    if (result?.success) {
        return (
            <div className='py-10 text-center animate-in zoom-in-95 duration-500'>
                <div className='w-20 h-20 bg-success-50 dark:bg-success-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-success-500/10'>
                    <CheckCircle2 size={40} className='text-success-500' />
                </div>
                <h3 className='text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2'>
                    Appointment Confirmed
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed'>
                    The visit has been successfully scheduled and marked as approved in the system.
                </p>
                
                <div className='max-w-xs mx-auto p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 text-left space-y-3 mb-8'>
                    <div className='flex items-center gap-3'>
                        <Calendar size={14} className='text-brand-500 shrink-0' />
                        <span className='text-[11px] font-bold text-gray-700 dark:text-gray-300'>{formatDate(formData.date)}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Clock size={14} className='text-brand-500 shrink-0' />
                        <span className='text-[11px] font-bold text-gray-700 dark:text-gray-300'>{formatTimeRange(formData.time, formData.service_duration)}</span>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Stethoscope size={14} className='text-brand-500 shrink-0' />
                        <span className='text-[11px] font-bold text-gray-700 dark:text-gray-300'>{formData.service_name}</span>
                    </div>
                </div>

            </div>
        );
    }

    return (
        <div className='space-y-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800'>
                    <label className='text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4'>Service Details</label>
                    <div className='flex items-start gap-4'>
                        <div className='w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500'>
                            <Stethoscope size={20} />
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>{formData.service_name}</p>
                            <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1'>
                                {formData.service_duration}m • ₱{formData.price?.toLocaleString() || '---'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800'>
                    <label className='text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-4'>Schedule</label>
                    <div className='flex items-start gap-4'>
                        <div className='w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500'>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>{formatDate(formData.date)}</p>
                            <div className='flex items-center gap-2 mt-1'>
                                <Clock size={12} className='text-brand-500' />
                                <p className='text-[10px] text-gray-400 font-bold uppercase tracking-widest'>
                                    {formatTimeRange(formData.time, formData.service_duration)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20'>
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20'>
                        <User size={24} />
                    </div>
                    <div>
                        <p className='text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mb-1'>Confirming visit for:</p>
                        <h4 className='text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight'>
                            {formData.target_patient_name}
                        </h4>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReviewStep;
