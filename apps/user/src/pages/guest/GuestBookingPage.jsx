import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useGuestBooking from '../../hooks/useGuestBooking';
import GuestBookingWizard from '../../components/guest-booking/GuestBookingWizard';
import useServices from '../../hooks/useServices';
import { useClinicSettings } from '../../hooks/useClinicSettings';

const GuestBookingPage = () => {
    const [searchParams] = useSearchParams();
    const initialServiceId = searchParams.get('service');
    const [initialServiceName, setInitialServiceName] = useState(null);

    const { services } = useServices();

    // Issue #4: Pre-populate service name from services list
    useEffect(() => {
        if (initialServiceId && services && services.length > 0) {
            // Note: Ensure types match (e.g., string vs number) when comparing IDs
            const service = services.find((s) => String(s.id) === String(initialServiceId));
            if (service) {
                setInitialServiceName(service.name);
            }
        }
    }, [initialServiceId, services]);

    const booking = useGuestBooking(initialServiceId, initialServiceName);
    const { settings, loading } = useClinicSettings();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (settings && settings.email_notifications_enabled === false) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                        Booking Unavailable
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                        Online Guest Booking is currently unavailable. Please log in to your account or contact the clinic directly at <strong className="text-gray-900 dark:text-white">{settings.phone_primary || 'our office'}</strong> to schedule your appointment.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link to="/login" className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors">
                            Log In to Account
                        </Link>
                        <Link to="/" className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-colors">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <GuestBookingWizard booking={booking} />
    );
};

export default GuestBookingPage;
