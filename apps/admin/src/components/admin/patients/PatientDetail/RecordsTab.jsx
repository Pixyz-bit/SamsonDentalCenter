import React, { useState, useEffect } from 'react';
import { History, Loader2, Clock, User, FileText } from 'lucide-react';
import { api } from '../../../../utils/api';

const RecordsTab = ({ patient, token }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/admin/patients/${patient.id}/history`, token);
            setAppointments(data.appointments || []);
        } catch (err) {
            console.error('Failed to fetch records:', err);
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

    const historicalRecords = appointments.filter(app => {
        const status = app.status?.toUpperCase();
        const approval = app.approval_status?.toLowerCase();

        // History includes everything EXCEPT the "active" states (Pending/Confirmed)
        // Includes: COMPLETED, CANCELLED, NO_SHOW, REJECTED, RESCHEDULED
        const isActive = status === 'PENDING' || status === 'CONFIRMED';
        const isRejected = approval === 'rejected';

        // Show in history if NOT active OR if it was explicitly rejected
        return !isActive || isRejected;
    });

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED':
                return 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400';
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
            {/* Header */}
            <div className='flex flex-col'>
                <h4 className='text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2'>
                    <History size={14} /> Medical & Treatment Records
                </h4>
                <p className='text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest'>
                    Consolidated history for {patient.full_name} and family members
                </p>
            </div>

            {loading ? (
                <div className='flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800'>
                    <Loader2 className='animate-spin text-brand-500 mb-4' size={32} />
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Retrieving historical data...</p>
                </div>
            ) : historicalRecords.length > 0 ? (
                <div className='overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02]'>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]'>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Date</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Patient</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Service</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider'>Result</th>
                                    <th className='px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right'>Status</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-50 dark:divide-gray-800/50'>
                                {historicalRecords.map((app) => (
                                    <tr key={app.id} className='group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors'>
                                        <td className='px-6 py-4'>
                                            <span className='text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight'>
                                                {new Date(app.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
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
                                            <div className='flex items-center gap-2'>
                                                <FileText size={12} className='text-gray-400' />
                                                <span className='text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight'>
                                                    {app.status === 'COMPLETED' ? 'Session Finished' : 'Visit Incomplete'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 text-right'>
                                            <span className={`inline-flex px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm ${getStatusStyle(app.status)}`}>
                                                {app.status}
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
                        <History size={32} />
                    </div>
                    <h5 className='text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight'>No Historical Records</h5>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs'>
                        Treatment history will appear here once visits are completed, cancelled, or marked as no-show.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RecordsTab;
