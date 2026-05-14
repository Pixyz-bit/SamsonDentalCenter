import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import DoctorPortalLayout from "../layouts/DoctorPortalLayout";

// Route utils
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "./ScrollToTop";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";
import SetPasswordPage from "../pages/auth/SetPasswordPage";

// Doctor pages
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import AppointmentsPage from "../pages/doctor/AppointmentsPage";
import PatientsPage from "../pages/doctor/PatientsPage";
import SchedulePage from "../pages/doctor/SchedulePage";
import NotificationsPage from "../pages/doctor/NotificationsPage";
import ProfilePage from "../pages/doctor/ProfilePage";
import BillingDeskPage from "../pages/doctor/BillingDeskPage";
import PatientProfilePage from "../pages/doctor/PatientProfilePage";
import PlaceholderPage from "../pages/doctor/PlaceholderPage";

const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ── Auth ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* ── Doctor Portal (Sidebar Layout) ── */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["dentist", "admin"]}>
              <DoctorPortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="patients" element={<PatientsPage />} />

          <Route path="schedule" element={<SchedulePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="billing-desk" element={<BillingDeskPage />} />
          <Route path="patients">
            <Route index element={<PatientsPage />} />
            <Route path=":tab/:id" element={<PatientProfilePage />} />
          </Route>
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
