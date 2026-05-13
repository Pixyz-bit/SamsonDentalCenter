import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import PatientPortalLayout from '../layouts/PatientPortalLayout';

// Route utils
import ProtectedRoute from './ProtectedRoute';
import GuestOnlyRoute from './GuestOnlyRoute';
import ScrollToTop from './ScrollToTop';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ClaimProfilePage from '../pages/auth/ClaimProfilePage';
import AccountSetupPage from '../pages/auth/AccountSetupPage';

// Email link pages (Module 06A)
import ConfirmAppointmentPage from '../pages/guest/ConfirmAppointmentPage';
import AppointmentConfirmedPage from '../pages/guest/AppointmentConfirmedPage';
import AppointmentErrorPage from '../pages/guest/AppointmentErrorPage';
import AppointmentAlreadyConfirmedPage from '../pages/guest/AppointmentAlreadyConfirmedPage';
import CancelAppointmentPage from '../pages/guest/CancelAppointmentPage';
import AppointmentCancelledPage from '../pages/guest/AppointmentCancelledPage';
import RescheduleAppointmentPage from '../pages/guest/RescheduleAppointmentPage';
import AppointmentRescheduledPage from '../pages/guest/AppointmentRescheduledPage';
// Public website pages
import HomePage from '../pages/public/HomePage';
import AboutPage from '../pages/public/AboutPage';
import ServicesPage from '../pages/public/ServicesPage';
import ServiceDetailPage from '../pages/public/ServiceDetailPage';
import InquiriesPage from '../pages/public/InquiriesPage';
import ContactPage from '../pages/public/ContactPage';
import PrivacyPolicyPage from '../pages/public/PrivacyPolicyPage';
import TermsOfServicePage from '../pages/public/TermsOfServicePage';

// Guest booking (Module 05)
import GuestBookingPage from '../pages/guest/GuestBookingPage';

// Patient pages
import PatientDashboard from '../pages/patient/PatientDashboard';
import MyAppointments from '../pages/patient/MyAppointments';
import MyRequests from '../pages/patient/MyRequests';
import AppointmentHistory from '../pages/patient/AppointmentHistory';
import AppointmentDetails from '../pages/patient/AppointmentDetails';
import PatientProfile from '../pages/patient/PatientProfile';
import NotificationsPage from '../pages/patient/NotificationsPage';
import SettingsPage from '../pages/patient/SettingsPage';
import UserBookingPage from '../pages/patient/UserBookingPage';
import UserReschedulePage from '../pages/patient/UserReschedulePage';
import DependentsPage from '../pages/patient/DependentsPage';

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* ── Public Website ── */}
                <Route element={<PublicLayout />}>
                    <Route
                        path='/'
                        element={<HomePage />}
                    />
                    <Route
                        path='/about'
                        element={<AboutPage />}
                    />
                    <Route
                        path='/services'
                        element={<ServicesPage />}
                    />
                    <Route
                        path='/services/:id'
                        element={<ServiceDetailPage />}
                    />
                    <Route
                        path='/inquiries'
                        element={<InquiriesPage />}
                    />
                    <Route
                        path='/contact'
                        element={<ContactPage />}
                    />
                    <Route
                        path='/privacy-policy'
                        element={<PrivacyPolicyPage />}
                    />
                    <Route
                        path='/terms-of-service'
                        element={<TermsOfServicePage />}
                    />

                    {/* Guest Booking — logged-in users are redirected to /patient/book */}
                    <Route
                        path='/book'
                        element={
                            <GuestOnlyRoute>
                                <GuestBookingPage />
                            </GuestOnlyRoute>
                        }
                    />
                </Route>

                {/* ── Auth ── */}
                <Route
                    path='/login'
                    element={
                        <GuestOnlyRoute redirectTo='/'>
                            <LoginPage />
                        </GuestOnlyRoute>
                    }
                />
                <Route
                    path='/register'
                    element={
                        <GuestOnlyRoute redirectTo='/'>
                            <RegisterPage />
                        </GuestOnlyRoute>
                    }
                />
                <Route
                    path='/auth/claim-profile'
                    element={
                        <GuestOnlyRoute redirectTo='/'>
                            <ClaimProfilePage />
                        </GuestOnlyRoute>
                    }
                />
                <Route
                    path='/auth/setup'
                    element={
                        <GuestOnlyRoute redirectTo='/'>
                            <AccountSetupPage />
                        </GuestOnlyRoute>
                    }
                />

                {/* ── Email Link Pages (Standalone) ── */}
                <Route
                    path='/email/confirm'
                    element={<ConfirmAppointmentPage />}
                />
                <Route
                    path='/email/confirmed'
                    element={<AppointmentConfirmedPage />}
                />
                <Route
                    path='/email/error'
                    element={<AppointmentErrorPage />}
                />
                <Route
                    path='/email/already-confirmed'
                    element={<AppointmentAlreadyConfirmedPage />}
                />
                <Route
                    path='/email/cancel'
                    element={<CancelAppointmentPage />}
                />
                <Route
                    path='/email/cancelled'
                    element={<AppointmentCancelledPage />}
                />
                <Route
                    path='/email/reschedule'
                    element={<RescheduleAppointmentPage />}
                />
                <Route
                    path='/email/rescheduled'
                    element={<AppointmentRescheduledPage />}
                />
                {/* ── Patient Portal (Sidebar Layout) ── */}
                <Route
                    path='/patient'
                    element={
                        <ProtectedRoute>
                            <PatientPortalLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<PatientDashboard />} />
                    <Route path='appointments' element={<MyAppointments />} />
                    <Route path='history' element={<AppointmentHistory />} />
                    <Route path='requests' element={<MyRequests />} />
                    <Route path='appointments/:id' element={<AppointmentDetails />} />
                    <Route path='profile' element={<PatientProfile />} />
                    <Route path='dependents' element={<DependentsPage />} />
                    <Route path='notifications' element={<NotificationsPage />} />
                    <Route path='settings' element={<SettingsPage />} />
                </Route>

                {/* ── Patient Booking (standalone — no sidebar layout) ── */}
                <Route
                    path='/patient/book'
                    element={
                        <ProtectedRoute>
                            <UserBookingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path='/patient/appointments/:id/reschedule'
                    element={
                        <ProtectedRoute>
                            <UserReschedulePage />
                        </ProtectedRoute>
                    }
                />

                {/* ── Catch-all ── */}
                <Route
                    path='*'
                    element={
                        <Navigate
                            to='/'
                            replace
                        />
                    }
                />
            </Routes>
        </>
    );
};

export default AppRoutes;
