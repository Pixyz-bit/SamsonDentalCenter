import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import useUserBooking from '../../hooks/useUserBooking';
import UserBookingWizard from '../../components/user-booking/UserBookingWizard';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const UserBookingPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, loading } = useAuth();

    // Deep link awareness
    const serviceId = searchParams.get('service');
    const serviceName = decodeURIComponent(searchParams.get('service_name') || '');
    const returnTo = searchParams.get('returnTo');

    // Pass pre-selected service to hook
    const booking = useUserBooking(serviceId, serviceName);
    const { setIsDarkModeAllowed } = useTheme();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login?redirect=/patient/book');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (serviceId && booking.step === 0 && booking.formData.service_id) {
            booking.nextStep();
        }
    }, [serviceId, booking.step, booking.formData.service_id]);

    // Theme Guard: Allow dark mode while page is mounted
    useEffect(() => {
        setIsDarkModeAllowed(true);
        return () => setIsDarkModeAllowed(false);
    }, [setIsDarkModeAllowed]);

    if (loading) {
        return (
            <div className='min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center'>
                <div className='w-12 h-12 border-4 border-slate-100 dark:border-gray-800 border-t-sky-500 rounded-full animate-spin' />
            </div>
        );
    }

    if (!user) return null;

    return (
        <UserBookingWizard booking={booking} returnTo={returnTo} />
    );
};

export default UserBookingPage;
