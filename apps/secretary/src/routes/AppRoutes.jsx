import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import SecretaryPortalLayout from "../layouts/SecretaryPortalLayout";

// Route utils
import ProtectedRoute from "./ProtectedRoute";
import ScrollToTop from "./ScrollToTop";

// Auth pages
import LoginPage from "../pages/auth/LoginPage";

// Secretary pages
import SecretaryDashboard from "../pages/secretary/SecretaryDashboard";
import FrontDeskPage from "../pages/secretary/FrontDeskPage";
import CalendarPage from "../pages/secretary/CalendarPage";
import ApprovalsPage from "../pages/secretary/ApprovalsPage";
import BookingPage from "../pages/secretary/BookingPage";
import PatientsPage from "../pages/secretary/PatientsPage";
import DisplacedQueuePage from "../pages/secretary/DisplacedQueuePage";
import UpcomingAppointmentsPage from "../pages/secretary/UpcomingAppointmentsPage";
import AppointmentHistoryPage from "../pages/secretary/AppointmentHistoryPage";
// import AuditLogs from "../pages/secretary/AuditLogs";


const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ── Auth ── */}
        <Route path="/login" element={<LoginPage />} />

        {/* ── Secretary Portal (Sidebar Layout) ── */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["secretary", "dentist", "admin"]}>
              <SecretaryPortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SecretaryDashboard />} />
          <Route path="front-desk" element={<FrontDeskPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="calendar/:tab" element={<CalendarPage />} />
          <Route path="calendar/:tab/:id" element={<CalendarPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="history" element={<AppointmentHistoryPage />} />
          <Route path="patients">
            <Route index element={<Navigate to="profile" replace />} />
            <Route path=":tab/:id?" element={<PatientsPage />} />
          </Route>
          <Route path="displaced" element={<DisplacedQueuePage />} />
          <Route path="appointments" element={<UpcomingAppointmentsPage />} />
{/* <Route path="audit-logs" element={<AuditLogs />} /> */}

        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
