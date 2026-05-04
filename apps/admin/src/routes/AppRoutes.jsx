import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminPortalLayout from '../layouts/AdminPortalLayout';

// Route utils
import ProtectedRoute from './ProtectedRoute';
import ScrollToTop from './ScrollToTop';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Doctors from '../pages/admin/Doctors';
import Staff from '../pages/admin/Staff';
import Patients from '../pages/admin/Patients';
import Services from '../pages/admin/Services';
import ServiceDetail from '../pages/admin/ServiceDetail';
import Settings from '../pages/admin/Settings';
import AuditLogs from '../pages/admin/AuditLogs';
import MessageActivityPage from '../pages/admin/message-activity/MessageActivityPage';
import PageError from '../components/common/PageError';
import AdminProfile from '../pages/admin/AdminProfile';

const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* ── Auth ── */}
                <Route
                    path='/login'
                    element={<LoginPage />}
                />

                {/* ── Admin Portal (Sidebar Layout) ── */}
                <Route
                    path='/'
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminPortalLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path='doctors'>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path=':tab/:id?' element={<Doctors />} />
                    </Route>
                    <Route path='staff'>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path=':tab/:id?' element={<Staff />} />
                    </Route>
                    <Route path='patients'>
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path=':tab/:id?' element={<Patients />} />
                    </Route>
                    <Route path='services'>
                        <Route index element={<Services />} />
                        <Route path=':id' element={<ServiceDetail />} />
                    </Route>
                    <Route path='settings'>
                        <Route index element={<Navigate to="website" replace />} />
                        <Route path=':tab?' element={<Settings />} />
                    </Route>
                    <Route path='audit-logs' element={<AuditLogs />} />
                    <Route path='message-activity' element={<MessageActivityPage />} />
                    <Route path='profile' element={<AdminProfile />} />
                </Route>

                {/* Global Catch-all (Outside layout) */}
                <Route path='*' element={<PageError type="404" fullPage />} />
            </Routes>
        </>
    );
};
export default AppRoutes;
