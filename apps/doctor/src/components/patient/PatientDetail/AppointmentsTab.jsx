import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../../utils/api';

const AppointmentsTab = ({ patient, filterMode }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('sb-access-token');

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const statusFilter = filterMode === 'upcoming' ? 'upcoming' : 'history';
            const data = await api.get(`/doctor/patients/${patient.id}/appointments?status=${statusFilter}`, token);
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error('Failed to fetch patient appointments:', err);
            setError('Could not load appointment history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patient?.id) {
            fetchAppointments();
        }
    }, [patient?.id, filterMode]);

    if (loading) {
        return (
            <div className='flex items-center justify-center py-20'>
                <Loader2 className='animate-spin text-brand-500' size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className='p-8 text-center bg-red-50 dark:bg-red-500/5 rounded-2xl'>
                <AlertCircle className='mx-auto text-red-500 mb-2' size={24} />
                <p className='text-sm text-red-600 dark:text-red-400 font-medium'>{error}</p>
            </div>
        );
    }

    const formatTime = (time) => {
        if (!time) return '';
        try {
            const [hours, minutes] = time.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h % 12 || 12;
            return `${displayH}:${minutes} ${ampm}`;
        } catch (e) {
            return time;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Pending';
            case 'CONFIRMED': return 'Confirmed';
            case 'COMPLETED': return 'Completed';
            case 'CANCELLED': return 'Cancelled';
            case 'NO_SHOW': return 'No Show';
            default: return status;
        }
    };

    const isUpcoming = (status) => ['PENDING', 'CONFIRMED'].includes(status);

    return (
        <div className='space-y-4 animate-in fade-in duration-300'>
            <div className='flex items-center justify-between mb-2'>
                <h4 className='text-sm font-bold text-[#0B1120] dark:text-white uppercase tracking-wider font-outfit'>
                    {filterMode === 'upcoming' ? 'Future Sessions' : 'Clinical History'}
                </h4>
                <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                    {appointments.length} total entries
                </span>
            </div>

            {appointments.length > 0 ? (
                <div className='grid gap-3'>
                    {appointments.map(apt => (
                        <div key={apt.id} className='p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all'>
                            <div className='flex items-center gap-4'>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    isUpcoming(apt.status) ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10'
                                }`}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h5 className='text-sm font-bold text-gray-900 dark:text-white font-outfit'>{apt.service?.name || 'Dental Service'}</h5>
                                    <div className='flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium'>
                                        <Clock size={12} />
                                        <span>{apt.appointment_date} at {formatTime(apt.start_time)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-center justify-between sm:justify-end gap-6'>
                                <div className='hidden lg:block text-right'>
                                    <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Attending Doctor</p>
                                    <p className='text-[10px] font-bold text-gray-700 dark:text-gray-300'>
                                        {apt.dentist?.profile?.full_name || 'Clinic Dentist'}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    isUpcoming(apt.status) ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                }`}>
                                    {getStatusLabel(apt.status)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl'>
                    <AlertCircle className='mx-auto text-gray-300 mb-3' size={32} />
                    <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>No appointment records found for this category.</p>
                </div>
            )}
        </div>
    );
};

export default AppointmentsTab;
