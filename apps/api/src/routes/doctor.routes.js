import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireDentist } from '../middleware/doctor.middleware.js';
import {
    // Schedule
    todaySchedule,
    weeklySchedule,
    myWorkingSchedule,
    myBlocks,
    requestDayOff,
    // Patient Care
    addNote,
    getNotes,
    getPatientDetail,
    patientHistory,
    getPatientAppointmentsHandler,
    // Appointment Actions
    markComplete,
    startAppointmentHandler,
    markNoShowHandler,
    updateMedicalInfoHandler,
    addFollowUp,
    reportAppointmentDelay,
    // Content Management
    getProfile,
    updateProfile,
    // Schedule Requests & Feedback
    requestScheduleChangeHandler,
    getMyScheduleRequests,
    getMyFeedback,
} from '../controllers/doctor.controller.js';

const router = Router();

// All doctor routes require auth + dentist role
router.use(requireAuth, requireDentist);

// ── Schedule Management ──
router.get('/schedule/today', todaySchedule);
router.get('/schedule', weeklySchedule);
router.get('/my-schedule', myWorkingSchedule);
router.get('/my-blocks', myBlocks);
router.post('/request-block', requestDayOff);

// ── Patient Care ──
router.post('/treatment-notes', addNote);
router.get('/treatment-notes/:appointmentId', getNotes);
router.get('/patients/:patientId', getPatientDetail);
router.get('/patients/:patientId/history', patientHistory);
router.get('/patients/:patientId/appointments', getPatientAppointmentsHandler);

// ── Appointment Actions ──
router.patch('/appointments/:id/start', startAppointmentHandler);
router.patch('/appointments/:id/complete', markComplete);
router.patch('/appointments/:id/no-show', markNoShowHandler);
router.patch('/appointments/:id/medical-info', updateMedicalInfoHandler);
router.post('/follow-ups', addFollowUp);
router.post('/appointments/:id/delay', reportAppointmentDelay);

// ── Content Management (Profile) ──
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

// ── Schedule Requests & Feedback ──
router.post('/schedule-request', requestScheduleChangeHandler);
router.get('/schedule-requests', getMyScheduleRequests);
router.get('/my-feedback', getMyFeedback);

export default router;
