import { Router } from 'express';
import {
    // Appointment Management
    getAllAppointments,
    getTodayAppointments,
    markAsNoShow,
    markAsComplete,
    adminCancel,
    addWalkIn,
    // Approval Workflow (Two-Tier)
    getPending,
    approve,
    reject,
    bookForPatient,
    // Content Management
    getSettings,
    updateSettings,
    listAnnouncements,
    addAnnouncement,
    editAnnouncement,
    removeAnnouncement,
    // Schedule Management
    getDentists,
    getDentistByIdHandler,
    updateDentistProfileHandler,
    updateDentistServicesHandler,
    viewDentistSchedule,
    getDentistDayScheduleHandler,
    updateDentistSchedule,
    blockDentistAvailability,
    viewDentistBlocks,
    removeDentistBlock,
    openEmergencySlot,
    // Patient Management
    getPatients,
    viewPatientHistory,
    toggleRestriction,
    quickRegisterPatientHandler,
    checkDuplicatesHandler, // NEW
    mergePatientsHandler, // NEW
    sendSetupLinkHandler, // NEW
    requestDependencyConsentHandler, // NEW
    verifyDependencyConsentHandler, // NEW
    // User Management (Admin Only)
    getUsersHandler,
    createUserHandler,
    changeUserRoleHandler,
    deactivateUserHandler,
    getSystemHealthHandler,
    // Revenue & Payments
    recordPaymentHandler,
    getPaymentDetailsHandler,
    updatePaymentHandler,
    // Content / Promotions / Holidays
    getPromotionsHandler,
    createPromotionHandler,
    getHolidaysHandler,
    createHolidayHandler,
    // Feedback & Internal Comments
    getFeedbackHandler,
    getAppointmentCommentsHandler,
    addAppointmentCommentHandler,
    // Schedule Requests
    getScheduleRequestsHandler,
    approveScheduleRequestHandler,
    rejectScheduleRequestHandler,
    // Reassignment
    reassignAppointment,
    getAvailableDentistsForReassignment,
    onboardDoctor,
    getPatientHandler, // NEW
    updatePatientHandler, // NEW
    adminReschedule,
    bulkUpdateSchedule,
    getMessageLogsHandler,
} from '../controllers/admin.controller.js';

import { 
    getAuditLogs, 
    getAuditLogDetails 
} from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin, requireAdminOrSecretary } from '../middleware/admin.middleware.js'; // UPDATED
import { validate } from '../utils/validate.js';
import { adminBookAppointmentSchema } from '../schemas/admin.schema.js';

const router = Router();

// All staff routes require: logged in + secretary/admin role
router.use(requireAuth, requireAdminOrSecretary);

// ── Appointments ──
router.get('/appointments', getAllAppointments);
router.get('/appointments/today', getTodayAppointments);
router.get('/appointments/pending', getPending); // NEW: Specialized requests
router.patch('/appointments/:id/approve', approve); // NEW: Approve specialized
router.patch('/appointments/:id/reject', reject); // NEW: Reject specialized
router.patch('/appointments/:id/noshow', markAsNoShow);
router.patch('/appointments/:id/complete', markAsComplete);
router.patch('/appointments/:id/cancel', adminCancel);
router.patch('/appointments/:id/reassign', reassignAppointment); // NEW
router.patch('/appointments/:id/reschedule', adminReschedule); // NEW: Admin reschedule
router.patch('/appointments/:id/displaced-handle', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { supabaseAdmin } = await import('../config/supabase.js');
        const { error } = await supabaseAdmin
            .from('appointments')
            .update({ cancellation_reason: 'SYSTEM_DISPLACED_HANDLED' })
            .eq('id', id);
        if (error) throw error;
        res.json({ message: 'Marked as handled.' });
    } catch (err) {
        next(err);
    }
});
router.get('/appointments/:id/comments', getAppointmentCommentsHandler);
router.post('/appointments/:id/comments', addAppointmentCommentHandler);

// ── Walk-In & Patients ──
router.post('/walk-in', addWalkIn);
router.post('/walk-in/quick', quickRegisterPatientHandler);
router.get('/patients/check-duplicates', checkDuplicatesHandler); // NEW
router.post('/patients/merge', mergePatientsHandler); // NEW
router.post('/patients/:id/send-setup-link', sendSetupLinkHandler); // NEW
router.post('/patients/:id/request-dependency-consent', requestDependencyConsentHandler); // NEW
router.post('/patients/:id/verify-dependency-consent', verifyDependencyConsentHandler); // NEW
router.get('/patients/:id', getPatientHandler); // NEW
router.patch('/patients/:id', updatePatientHandler); // NEW
router.get('/patients', getPatients);
router.get('/patients/:id/history', viewPatientHistory);
router.post('/patients/:id/book', validate(adminBookAppointmentSchema), bookForPatient);
router.patch('/patients/:id/restriction', toggleRestriction);

// ── Content Management ──
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/announcements', listAnnouncements);
router.post('/announcements', addAnnouncement);
router.patch('/announcements/:id', editAnnouncement);
router.delete('/announcements/:id', removeAnnouncement);

// ── Revenue & Payments ── (NEW)
router.post('/payments', recordPaymentHandler);
router.get('/payments/:appointmentId', getPaymentDetailsHandler);
router.patch('/payments/:id', updatePaymentHandler);

// ── Promotions & Holidays ── (NEW)
router.get('/promotions', getPromotionsHandler);
router.post('/promotions', createPromotionHandler);
router.get('/holidays', getHolidaysHandler);
router.post('/holidays', createHolidayHandler);

// ── Schedule Management ──
router.get('/dentists', getDentists);
router.post('/dentists', requireAdmin, onboardDoctor); // NEW
router.get('/dentists/available', getAvailableDentistsForReassignment); // NEW
router.get('/dentists/:id', getDentistByIdHandler); // NEW
router.patch('/dentists/:id/profile', updateDentistProfileHandler); // NEW
router.patch('/dentists/:id/services', updateDentistServicesHandler); // NEW
router.get('/dentists/:id/schedule', viewDentistSchedule);
router.get('/dentists/:id/day-schedule', getDentistDayScheduleHandler);
router.put('/dentists/:id/schedule', updateDentistSchedule);
router.post('/dentists/:id/schedule/bulk', bulkUpdateSchedule); // NEW: Bulk update
router.post('/dentists/:id/block', blockDentistAvailability);
router.get('/dentists/:id/blocks', viewDentistBlocks);
router.delete('/dentists/:id/block/:blockId', removeDentistBlock);
router.post('/emergency-slot', openEmergencySlot);

// ── Doctor Schedule Requests ── (NEW)
router.get('/schedule-requests', getScheduleRequestsHandler);
router.patch('/schedule-requests/:id/approve', approveScheduleRequestHandler);
router.patch('/schedule-requests/:id/reject', rejectScheduleRequestHandler);

// ── Patient Feedback ── (NEW)
router.get('/feedback', getFeedbackHandler);

// ==========================================
// ADMIN-ONLY ROUTES (Require requireAdmin)
// ==========================================
router.get('/users', requireAdmin, getUsersHandler);
router.post('/users', requireAdmin, createUserHandler);
router.patch('/users/:id/role', requireAdmin, changeUserRoleHandler);
router.patch('/users/:id/deactivate', requireAdmin, deactivateUserHandler);
router.get('/system/health', requireAdmin, getSystemHealthHandler);

// ── Audit Logs ── (NEW)
router.get('/audit-logs', requireAdmin, getAuditLogs);
router.get('/audit-logs/:id', requireAdmin, getAuditLogDetails);

// ── Message Activity ── (NEW)
router.get('/message-logs', requireAdmin, getMessageLogsHandler);

export default router;
