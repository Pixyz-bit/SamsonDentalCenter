import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppointmentDetail from '../../hooks/useAppointmentDetail';
import useUserReschedule from '../../hooks/useUserReschedule';
import UserRescheduleWizard from '../../components/user-reschedule/UserRescheduleWizard';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const UserReschedulePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    
    // Fetch appointment
    const { appointment, loading: aptLoading, error: aptError } = useAppointmentDetail(id);
    
    // Initialize reschedule flow
    const reschedule = useUserReschedule(id, appointment);
    const { setIsDarkModeAllowed } = useTheme();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate(`/login?redirect=/patient/appointments/${id}/reschedule`);
        }
    }, [user, authLoading, navigate, id]);

    // Theme Guard: Allow dark mode while page is mounted
    useEffect(() => {
        setIsDarkModeAllowed(true);
        return () => setIsDarkModeAllowed(false);
    }, [setIsDarkModeAllowed]);

    if (authLoading || aptLoading) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center'>
                <Loader2 className='w-12 h-12 text-brand-500 animate-spin' />
            </div>
        );
    }

    if (aptError || !appointment) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-error-500 text-lg font-bold mb-2'>Appointment Not Found</h2>
                    <button 
                        onClick={() => navigate('/patient/appointments')}
                        className='text-brand-500 hover:text-brand-600 font-medium'
                    >
                        Return to My Appointments
                    </button>
                </div>
            </div>
        );
    }
    
    // Validate that it CAN be rescheduled (not cancelled/completed and not already rescheduled)
    const canReschedule = !['CANCELLED', 'LATE_CANCEL', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED'].includes(appointment.status) && (appointment.reschedule_count || 0) < 1;
    if (!canReschedule) {
        const isLimitReached = (appointment.reschedule_count || 0) >= 1;
        return (
            <div className='flex flex-col items-center justify-center min-h-[60vh] p-8 text-center'>
                <div className='bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-theme-sm border border-gray-100 dark:border-gray-800 max-w-md w-full'>
                    <div className='w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                        <AlertCircle className='text-amber-600 dark:text-amber-400' size={32} />
                    </div>
                    <h2 className='text-amber-500 text-xl font-bold mb-2'>
                        {isLimitReached ? 'Reschedule Limit Reached' : 'Cannot Reschedule'}
                    </h2>
                    <p className='text-slate-500 dark:text-slate-400 mb-6'>
                        {isLimitReached 
                            ? "This appointment has already been rescheduled once and cannot be changed again through the portal."
                            : `This appointment cannot be rescheduled because its current status is ${appointment.status}.`
                        }
                    </p>
                    <button 
                        onClick={() => navigate(`/patient/appointments/${id}`)}
                        className='w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-3 px-6 rounded-xl transition-all'
                    >
                        Back to Details
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <UserRescheduleWizard reschedule={reschedule} appointment={appointment} />
    );
};

export default UserReschedulePage;
