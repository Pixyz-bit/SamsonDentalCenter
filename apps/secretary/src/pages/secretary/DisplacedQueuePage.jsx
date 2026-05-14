import React from 'react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { useDisplacedAppointments } from '../../hooks/useDisplacedAppointments';
import { format } from 'date-fns';
import { AlertCircle, Calendar, Clock, User, Phone, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui';

const DisplacedQueuePage = () => {
    const { appointments, loading, fetchDisplaced, markAsHandled } = useDisplacedAppointments();

    React.useEffect(() => {
        fetchDisplaced();
    }, [fetchDisplaced]);

    const handleMarkHandled = async (id) => {
        try {
            await markAsHandled(id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReschedule = (appointment) => {
        // Here we could trigger a Reschedule Modal or navigate to booking with patient data prefilled
        alert(`Reschedule flow for ${appointment.patient?.full_name} is under construction. Standard booking module will pop up.`);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return format(d, 'h:mm a');
    };

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle="Displaced Appointments" 
                subtitle="Appointments overlapping with emergency blocks that require manual outreach."
            />
            
            <div className="flex-1 px-4 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Queue is Empty</h3>
                        <p className="text-sm text-gray-500 mt-1">There are no displaced appointments pending action.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {appointments.map(appt => (
                            <div key={appt.id} className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/30 shadow-theme-xs rounded-2xl overflow-hidden flex flex-col">
                                <div className="bg-red-50 dark:bg-red-500/10 p-4 border-b border-red-100 dark:border-red-900/20 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold uppercase tracking-widest text-[10px]">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        System Displaced
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                                        {appt.patient?.full_name || 'Guest'}
                                    </h4>
                                    {appt.patient?.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                            <Phone className="w-4 h-4 text-brand-500" />
                                            {appt.patient.phone}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold">
                                            {appt.date ? format(new Date(appt.date), 'MMMM d, yyyy') : 'Invalid Date'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-semibold">{formatTime(appt.start_time)} - {formatTime(appt.end_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                                        <span className="font-medium opacity-80 text-xs uppercase">Dr. {appt.dentist?.profile?.last_name || 'Unassigned'}</span>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-gray-100 dark:border-gray-800">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1 text-xs text-red-600 hover:bg-red-50 hover:border-red-200 dark:border-gray-700 font-bold"
                                            onClick={() => handleMarkHandled(appt.id)}
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                            Mark Handled
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            size="sm" 
                                            className="flex-1 text-xs font-bold"
                                            onClick={() => handleReschedule(appt)}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                            Reschedule
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisplacedQueuePage;
