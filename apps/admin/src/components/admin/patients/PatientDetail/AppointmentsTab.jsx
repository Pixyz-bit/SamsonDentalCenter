import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Loader2, ChevronRight, Clock, User } from 'lucide-react';
import Button from '../../../ui/Button';
import { api } from '../../../../utils/api';

const AppointmentsTab = ({ patient, token, filterMode = 'request' }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/admin/patients/${patient.id}/history`, token);
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patient?.id) {
            fetchHistory();
        }
    }, [patient?.id]);

    const filteredAppointments = appointments.filter(app => {
        const status = app.status?.toUpperCase();
        
        if (filterMode === 'request') {
            return status === 'PENDING';
        }
        if (filterMode === 'attendance') {
            return status === 'CONFIRMED';
        }
        return false;
    });

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED':
            case 'COMPLETED':
                return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
            case 'PENDING':
                return 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400';
            case 'CANCELLED':
            case 'LATE_CANCEL':
            case 'NO_SHOW':
                return 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400';
        }
    };

    return (
        <div className='space-y-6'>
            {/* Header Actions */}
            <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                    <h4 className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>
                        {filterMode === 'request' ? 'Pending Requests' : 'Approved Attendance'}
                    </h4>
                    <p className='text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest'>
                        {filterMode === 'request' ? 'Awaiting administrative approval' : 'Confirmed family appointments'}
                    </p>
                </div>
                {filterMode === 'attendance' && (
                    <Button
                        variant='outline'
                        className='h-9 px-4 text-[10px] font-black uppercase tracking-widest border-brand-500/20 text-brand-600 hover:bg-brand-50'
                        onClick={() => alert('Add Appointment Placeholder')}
                    >
                        <Plus size={14} className='mr-2' /> Add New Appointment
                    </Button>
                )}
            </div>

            {loading ? (
                <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800'>
                    <Loader2 className='animate-spin text-brand-500 mb-4' size={32} />
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Synchronizing family records...</p>
                </div>
            ) : filteredAppointments.length > 0 ? (
                <div className='overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02]'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]'>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Date & Time</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Patient</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Service</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Dentist</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right'>Status</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-50 dark:divide-gray-800/50'>
                                {filteredAppointments.map((app) => (
                                    <tr key={app.id} className='group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer'>
                                        <td className='px-6 py-4'>
                                            <div className='flex flex-col'>
                                                <span className='text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight'>
                                                    {new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <div className='flex items-center gap-1.5 mt-1'>
                                                    <Clock size={10} className='text-gray-400' />
                                                    <span className='text-[10px] font-bold text-gray-400 uppercase leading-none'>
                                                        {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-6 h-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-400'>
                                                    <User size={12} />
                                                </div>
                                                <span className='text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight'>
                                                    {app.patient?.full_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className='text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest'>
                                                {app.service?.name}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4'>
                                            <span className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight'>
                                                {app.dentist?.profile?.full_name || 'Unassigned'}
                                            </span>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            <span className={`inline-flex px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm ${getStatusStyle(app.status)}`}>
                                                {app.approval_status === 'rejected' ? 'REJECTED' : app.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center px-6'>
                    <div className='w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm flex items-center justify-center text-gray-200 dark:text-gray-700 mb-4'>
                        <Calendar size={32} />
                    </div>
                    <h5 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>
                        {filterMode === 'request' ? 'No Pending Requests' : 'No Approved Appointments'}
                    </h5>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs'>
                        {filterMode === 'request' 
                            ? 'All appointment requests for this family have been processed.' 
                            : 'There are no confirmed appointments scheduled for this family.'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AppointmentsTab;
