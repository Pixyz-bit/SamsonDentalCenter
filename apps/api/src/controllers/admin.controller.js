import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { markNoShow } from '../services/noshow.service.js';
import { notifyWaitlist } from '../services/waitlist.service.js';
import {
    bookAppointment,
    getPatientAppointments,
    getAppointmentById,
    bookAppointmentGuest,
    getPatientAppointmentStats,
    cancelAppointment,
    rescheduleAppointment,
    cancelGuestAppointmentAction,
    insertConfirmedGuestAppointment,
    rescheduleGuestAppointment,
    bookAppointmentAdmin,
    rescheduleAppointmentAdmin,
} from '../services/appointment.service.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';
import { 
    sendBookingSuccessEmail, 
    sendCancellationEmail, 
    sendAccountSetupInviteEmail,
    sendBookingRejectedEmail,
    sendAppointmentDisplacedEmail
} from '../services/email-confirmation.service.js';
import {
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getClinicSettings,
    updateClinicSettings,
    getAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    getDentistSchedule,
    getDentistDaySchedule,
    setDentistSchedule,
    setBulkSchedule,
    getBlocks,
    bulkCancelForBlock,
    getPatientAppointmentHistory,
    setPatientRestriction,
    markAppointmentComplete,
    adminCancelAppointment,
    blockDentistSchedule,
    bulkBlockDentistSchedule, // NEW
    removeAvailabilityBlock,
    getAllAppointmentsFiltered,
    getTodayAppointmentsFiltered,
    searchPatients,
    getDentistsList,
    getDentistById,
    updateDentistProfileData,
    replaceDentistServices,
    recordPayment,
    getPaymentDetails,
    updatePayment,
    getPromotions,
    createPromotion,
    getHolidays,
    createHoliday,
    getFeedback,
    getAppointmentComments,
    addAppointmentComment,
    getScheduleRequests,
    approveScheduleRequest,
    rejectScheduleRequest,
    getAllUsers,
    createSystemUser,
    changeUserRole,
    deactivateUser,
    getSystemHealth,
    quickRegisterPatient,
    checkDuplicatePatient,
    mergePatientRecords,
    getAvailableDentistsForSlot,
    reassignAppointmentToDentist,
    onboardDentistProfile,
    getPatientProfile,
    updatePatientProfileData,
    sendDependencyConsentOTP,
    verifyDependencyConsent
} from '../services/admin.service.js';

import {
    sendApprovalNotice,
    sendRejectionNotice,
    sendCancellationNotice,
} from '../services/notification.service.js';

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════

/**
 * Shared helper to flatten the dentist object to match frontend expectations.
 */
const formatDoctorResponse = (d) => {
    if (!d) return null;
    return {
        id: d.id,
        profile_id: d.profile?.id,
        full_name: d.profile?.full_name,
        first_name: d.profile?.first_name,
        last_name: d.profile?.last_name,
        middle_name: d.profile?.middle_name,
        suffix: d.profile?.suffix,
        email: d.profile?.email,
        phone: d.profile?.phone,
        tier: d.tier,
        license_number: d.license_number,
        specialization: d.specialization,
        bio: d.bio,
        photo_url: d.photo_url,
        is_active: d.is_active,
        created_at: d.created_at,
        services: (d.dentist_services || []).map((ds) => ({
            id: ds.service?.id,
            name: ds.service?.name,
            tier: ds.service?.tier,
        })),
        service_count: (d.dentist_services || []).length,
    };
};

// ═══════════════════════════════════════════════
// APPOINTMENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/appointments
 *
 * View all appointments with filters.
 * Query params: ?date=2026-03-02&status=CONFIRMED&dentist_id=xxx&tier=specialized&page=1&limit=20
 */
export const getAllAppointments = async (req, res, next) => {
    try {
        const { date, date_from, date_to, status, dentist_id, patient_id, tier, page = 1, limit = 20 } = req.query;

        const filters = {
            date: date || null,
            date_from: date_from || null,
            date_to: date_to || null,
            status: status || null,
            dentist_id: dentist_id || null,
            patient_id: patient_id || null,
            tier: tier || null,
        };

        const result = await getAllAppointmentsFiltered(filters, parseInt(page), parseInt(limit));

        res.json({
            appointments: result.appointments.map((appt) => ({
                id: appt.id,
                date: appt.appointment_date,
                start_time: appt.start_time,
                end_time: appt.end_time,
                status: appt.status,
                service_tier: appt.service_tier,
                approval_status: appt.approval_status,
                cancellation_reason: appt.cancellation_reason,
                rejection_reason: appt.rejection_reason,
                is_walk_in: appt.is_walk_in,
                notes: appt.notes,
                patient: {
                    id: appt.patient_id,
                    full_name: appt.patient?.full_name || appt.guest_name,
                    name: appt.patient?.full_name || appt.guest_name,
                    email: appt.patient?.email || appt.guest_email,
                    phone: appt.patient?.phone || appt.guest_phone,
                },
                service: appt.service?.name,
                service_tier_label: appt.service?.tier,
                price: appt.service?.price,
                dentist: appt.dentist,
                created_at: appt.created_at,
            })),
            pagination: result.pagination,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/appointments/today
 *
 * Quick view of today's appointments.
 */
export const getTodayAppointments = async (req, res, next) => {
    try {
        const result = await getTodayAppointmentsFiltered();

        res.json({
            date: result.date,
            appointments: result.appointments.map((a) => ({
                id: a.id,
                time: `${a.start_time} - ${a.end_time}`,
                patient: a.patient?.full_name || a.guest_name,
                phone: a.patient?.phone || a.guest_phone,
                service: a.service?.name,
                service_tier: a.service?.tier,
                dentist: a.dentist?.profile?.full_name || 'Unassigned',
                status: a.status,
                approval_status: a.approval_status,
                is_walk_in: a.is_walk_in,
            })),
            total: result.appointments.length,
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// APPOINTMENT STATE CHANGES
// ═══════════════════════════════════════════════

/**
 * PATCH /api/admin/appointments/:id/complete
 *
 * Mark an appointment as completed.
 * Can transition from CONFIRMED or IN_PROGRESS to COMPLETED.
 */
export const markAsComplete = async (req, res, next) => {
    try {
        const appointment = await markAppointmentComplete(req.params.id);
        res.json({ message: 'Appointment marked as completed.', appointment });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/appointments/:id/cancel
 *
 * Admin cancels an appointment (e.g., patient called in).
 */
export const adminCancel = async (req, res, next) => {
    try {
        const { reason } = req.body;

        const result = await adminCancelAppointment(req.params.id, reason);

        // 1. In-app notification for the patient
        if (result.appointment.patient_id) {
            try {
                await sendCancellationNotice(result.appointment.patient_id, {
                    date: result.appointment.appointment_date,
                    start_time: result.appointment.start_time,
                    service: result.appointment.service?.name || 'Dental appointment',
                });
            } catch (err) {
                console.warn('[Realtime] Failed to notify patient of admin cancellation:', err.message);
            }
        }

        // 2. Notify waitlist (if Module 09 is built)
        try {
            await notifyWaitlist({
                date: result.appointment.appointment_date,
                start_time: result.appointment.start_time,
                end_time: result.appointment.end_time,
                service_id: result.appointment.service_id,
            });
        } catch (e) {
            // Non-critical, don't fail the cancel
        }

        res.json({ message: 'Appointment cancelled by admin.', appointment: result.appointment });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/appointments/:id/reschedule
 *
 * Admin/Staff reschedules any confirmed appointment on behalf of a patient.
 * Bypasses the 1-reschedule-per-booking restriction enforced on the patient side.
 * Body: { date, time, dentist_id? }
 */
export const adminReschedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, time, dentist_id, user_session_id } = req.body;

        if (!date || !time) {
            return res.status(400).json({ error: 'date and time are required.' });
        }

        const result = await rescheduleAppointmentAdmin(
            id,
            req.user.id,
            date,
            time,
            dentist_id || null,
            user_session_id || null,
        );

        // Free the old slot for waitlist
        if (result.freed_slot) {
            try {
                await notifyWaitlist(result.freed_slot);
            } catch (e) {
                // Non-critical
            }
        }

        res.json({
            message: 'Appointment rescheduled successfully.',
            ...result,
        });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};


/**
 * POST /api/admin/appointments/:id/no-show
 *
 * Mark an appointment as no-show.
 */
export const markAsNoShow = async (req, res, next) => {
    try {
        await markNoShow(req.params.id);
        res.json({ message: 'Appointment marked as no-show.' });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/appointments/pending
 *
 * View pending specialized appointment requests.
 */
export const getPending = async (req, res, next) => {
    try {
        const requests = await getPendingRequests();
        res.json({ pending_requests: requests, total: requests.length });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/appointments/:id/approve
 *
 * Approve a specialized appointment request.
 * Body: { dentist_id? } (null = auto-assign)
 */
export const approve = async (req, res, next) => {
    try {
        const { dentist_id } = req.body;
        const appointment = await approveRequest(req.params.id, req.user.id, dentist_id || null);

        // 1. Email Notification
        let emailResult = null;
        try {
            emailResult = await sendBookingSuccessEmail(appointment.patient?.email || appointment.guest_email, appointment.patient?.full_name || appointment.guest_name, {
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                service: appointment.service?.name,
                dentist: appointment.dentist?.profile?.full_name || 'Assigned',
            });
        } catch (e) {
            console.error('Failed to send approval email:', e);
            emailResult = { success: false, error: e.message };
        }

        // 2. In-app & SMS notification
        let inAppSmsResult = null;
        const recipientPhone = appointment.patient?.phone || appointment.guest_phone;
        
        // Always try to send approval notice — the service will handle the patient vs guest distinction
        // (Skipping in-app for guests, but sending SMS if phone is available)
        inAppSmsResult = await sendApprovalNotice(appointment.patient_id, {
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            service: appointment.service?.name,
        }, recipientPhone);

        res.json({ 
            message: 'Appointment approved.', 
            appointment,
            notifications: {
                email: emailResult,
                inApp: inAppSmsResult?.inAppResult,
                sms: inAppSmsResult?.smsResult
            }
        });

    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/appointments/:id/reject
 *
 * Reject a specialized appointment request.
 * Body: { reason, suggested_date? }
 */
/**
 * PATCH /api/admin/appointments/:id/reject
 *
 * Reject a specialized appointment request.
 * Body: { reason, suggested_date? }
 */
export const reject = async (req, res, next) => {
    try {
        const { reason, suggested_date } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Rejection reason is required.' });
        }

        const result = await rejectRequest(req.params.id, req.user.id, reason, suggested_date);

        // Notify patient/guest
        try {
            await sendBookingRejectedEmail(result.appointment.patient?.email || result.appointment.guest_email, result.appointment.patient?.full_name || result.appointment.guest_name, {
                service: result.appointment.service?.name,
                reason,
                suggestedDate
            });
        } catch (e) {
            console.error('Failed to send rejection email:', e);
        }

        // In-app notification
        if (result.appointment.patient_id) {
            await sendRejectionNotice(result.appointment.patient_id, {
                date: result.appointment.appointment_date,
                start_time: result.appointment.start_time,
                end_time: result.appointment.end_time,
                service: result.appointment.service?.name,
            }, reason);
        }

        res.json({
            message: 'Appointment request rejected.',
            appointment: {
                id: result.appointment.id,
                status: result.appointment.status,
                approval_status: result.appointment.approval_status,
                rejection_reason: result.appointment.rejection_reason,
                patient: result.appointment.patient?.full_name,
                service: result.appointment.service?.name,
            },
            suggested_date: result.suggested_date,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/walk-in
 *
 * Book a walk-in appointment.
 * Body: { patient_id, service_id, time?, notes? }
 */
export const addWalkIn = async (req, res, next) => {
    try {
        const { patient_id, service_id, time, notes } = req.body;

        if (!patient_id || !service_id) {
            return res.status(400).json({
                error: 'patient_id and service_id are required.',
                hint: 'Search for the patient first with GET /api/admin/patients?search=name',
            });
        }

        const result = await bookWalkIn(patient_id, service_id, time, notes);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/patients/:id/book
 *
 * Admin/Staff books an appointment on behalf of a patient.
 * Status is auto-set to CONFIRMED.
 */
export const bookForPatient = async (req, res, next) => {
    try {
        const { id: patientId } = req.params;
        const { service_id, date, time, user_session_id, dentist_id } = req.body;

        const appointment = await bookAppointmentAdmin(
            req.user.id,
            patientId,
            service_id,
            date,
            time,
            user_session_id,
            dentist_id
        );

        // Audit Log: ADMIN_BOOKING
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'ADMIN_BOOKING',
                target_type: 'appointments',
                target_id: appointment.id,
                resource_type: 'appointments',
                resource_id: appointment.id,
                new_values: appointment,
                details: {
                    source: 'ADMIN_WIZARD',
                    patient_id: patientId,
                }
            });
        } catch (auditErr) {
            console.error('Audit Log failed (bookForPatient):', auditErr.message);
        }

        res.status(201).json({
            message: 'Appointment booked and confirmed successfully.',
            appointment
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// CONTENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/settings
 *
 * Get clinic settings (hours, contact, about text).
 */
export const getSettings = async (req, res, next) => {
    try {
        const settings = await getClinicSettings();
        res.json({ settings });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/settings
 *
 * Update clinic settings.
 * Body: { clinic_name?, address?, phone?, email?, opening_hour?, closing_hour?, about_text?, ... }
 */
export const updateSettings = async (req, res, next) => {
    try {
        const settings = await updateClinicSettings(req.body);
        res.json({ message: 'Clinic settings updated.', settings });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/announcements
 *
 * List all announcements.
 */
export const listAnnouncements = async (req, res, next) => {
    try {
        const announcements = await getAnnouncements();
        res.json({ announcements });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/announcements
 *
 * Create a new announcement.
 * Body: { title, message, type?, is_active?, starts_at?, ends_at? }
 */
export const addAnnouncement = async (req, res, next) => {
    try {
        const { title, message } = req.body;
        if (!title || !message) {
            return res.status(400).json({ error: 'title and message are required.' });
        }
        const announcement = await createAnnouncement(req.body, req.user.id);
        res.status(201).json({ message: 'Announcement created.', announcement });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/announcements/:id
 *
 * Update an announcement.
 */
export const editAnnouncement = async (req, res, next) => {
    try {
        const announcement = await updateAnnouncement(req.params.id, req.body);
        res.json({ message: 'Announcement updated.', announcement });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/admin/announcements/:id
 *
 * Delete an announcement.
 */
export const removeAnnouncement = async (req, res, next) => {
    try {
        await deleteAnnouncement(req.params.id);
        res.json({ message: 'Announcement deleted.' });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// SCHEDULE MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/dentists
 *
 * List all dentists with tier and schedule info.
 */
export const getDentists = async (req, res, next) => {
    try {
        const data = await getDentistsList();

        res.json({
            dentists: data.map(formatDoctorResponse),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/dentists/:id
 *
 * Get a single dentist's full profile.
 */
export const getDentistByIdHandler = async (req, res, next) => {
    try {
        const d = await getDentistById(req.params.id);
        res.json({
            doctor: formatDoctorResponse(d),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/dentists/:id/profile
 *
 * Update a dentist's profile (bio, photo, name, contact, status).
 * Body: { bio?, photo_url?, is_active?, license_number?,
 *         first_name?, last_name?, middle_name?, suffix?, email?, phone? }
 */
export const updateDentistProfileHandler = async (req, res, next) => {
    try {
        // Fetch old values before update
        const { data: previousData } = await supabaseAdmin
            .from('dentists')
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq('id', req.params.id)
            .single();

        const updated = await updateDentistProfileData(req.params.id, req.body);

        // Audit Log: UPDATE_DOCTOR_PROFILE
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'UPDATE_DOCTOR_PROFILE',
                target_type: 'dentists',
                target_id: req.params.id,
                resource_type: 'dentists',
                resource_id: req.params.id,
                old_values: previousData,
                new_values: req.body
            });
        } catch (auditErr) {
            console.error('Audit Log failed (updateDentistProfile):', auditErr.message);
        }

        res.json({ message: 'Doctor profile updated.', doctor: formatDoctorResponse(updated) });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/dentists/:id/services
 *
 * Replace authorized services for a dentist.
 * Body: { service_ids: string[] }
 */
export const updateDentistServicesHandler = async (req, res, next) => {
    try {
        const { service_ids } = req.body;
        if (!Array.isArray(service_ids)) {
            return res.status(400).json({ error: 'service_ids must be an array of UUIDs.' });
        }

        // Fetch old values
        const { data: oldServices } = await supabaseAdmin
            .from('dentist_services')
            .select('service_id')
            .eq('dentist_id', req.params.id);

        const { doctor, displacedAppointments } = await replaceDentistServices(req.params.id, service_ids);

        // Audit Log: UPDATE_DOCTOR_SERVICES
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'UPDATE_DOCTOR_SERVICES',
                target_type: 'dentists',
                target_id: req.params.id,
                resource_type: 'dentist_services',
                resource_id: req.params.id,
                old_values: { service_ids: (oldServices || []).map((s) => s.service_id) },
                new_values: { service_ids },
            });
        } catch (auditErr) {
            console.error('Audit Log failed (updateDentistServices):', auditErr.message);
        }

        // ── Notify displaced patients ──
        if (displacedAppointments.length > 0) {
            for (const appt of displacedAppointments) {
                try {
                    await sendCancellationNotice(appt.patient_id, {
                        date: appt.appointment_date,
                        start_time: appt.start_time,
                        end_time: appt.end_time,
                        service: appt.service?.name || 'Dental appointment',
                    });

                    // Also send email
                    await sendAppointmentDisplacedEmail(appt.patient?.email || appt.guest_email, appt.patient?.full_name || appt.guest_name, {
                        service: appt.service?.name,
                        date: appt.appointment_date,
                        start_time: appt.start_time,
                        reason: 'Schedule update'
                    });
                } catch (err) {
                    console.warn(
                        `[Realtime] Failed to notify patient ${appt.patient_id} of displacement:`,
                        err.message,
                    );
                }
            }
        }

        res.json({
            message: 'Doctor services updated.',
            displaced_count: displacedAppointments.length,
            doctor: formatDoctorResponse(doctor),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create/Onboard a new doctor.
 * POST /api/admin/dentists
 */
export const createDentistHandler = async (req, res, next) => {
    try {
        const result = await onboardDentistProfile(req.body);
        res.status(201).json({
            message: 'Doctor invitation sent successfully.',
            user: result.user
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/dentists/:id/schedule
 *
 * View a dentist's weekly schedule.
 */
/**
 * GET /api/admin/dentists/:id/day-schedule?date=YYYY-MM-DD
 */
export const getDentistDayScheduleHandler = async (req, res, next) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'date query parameter is required.' });

        const data = await getDentistDaySchedule(req.params.id, date);
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const viewDentistSchedule = async (req, res, next) => {
    try {
        const schedule = await getDentistSchedule(req.params.id);
        res.json({ dentist_id: req.params.id, schedule });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/dentists/:id/schedule
 *
 * Update a dentist's schedule for a specific day.
 * Body: { day_of_week, is_available, start_time?, end_time? }
 */
export const updateDentistSchedule = async (req, res, next) => {
    try {
        const { day_of_week, is_available, start_time, end_time } = req.body;

        if (day_of_week === undefined || is_available === undefined) {
            return res.status(400).json({
                error: 'day_of_week and is_available are required.',
            });
        }

        const schedule = await setDentistSchedule(req.params.id, day_of_week, {
            is_working: is_available, // Map is_available (UI) to is_working (DB/Service)
            start_time,
            end_time,
        });
        res.json({ message: 'Dentist schedule updated.', schedule });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/dentists/:id/schedule/bulk
 *
 * Set a dentist's full weekly schedule.
 * Body: { Monday: {...}, Tuesday: {...}, ... }
 */
export const bulkUpdateSchedule = async (req, res, next) => {
    try {
        let schedules = [];
        // Support both 'force' and 'overwrite' for backward compatibility
        const force = req.query.force === 'true' || req.body.force === true || req.body.overwrite === true;

        if (Array.isArray(req.body)) {
            schedules = req.body;
        } else {
            schedules = req.body.schedules || [];
        }

        // Fetch old values for audit
        const { data: oldSchedule } = await supabaseAdmin
            .from('dentist_schedule')
            .select('*')
            .eq('dentist_id', req.params.id)
            .order('day_of_week', { ascending: true });

        await setBulkSchedule(req.params.id, schedules, force);

        // Audit Log: UPDATE_DOCTOR_SCHEDULE
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'UPDATE_DOCTOR_SCHEDULE',
                target_type: 'dentists',
                target_id: req.params.id,
                resource_type: 'dentist_schedule',
                resource_id: req.params.id,
                old_values: oldSchedule,
                new_values: { schedules, force }
            });
        } catch (auditErr) {
            console.error('Audit Log failed (bulkUpdateSchedule):', auditErr.message);
        }

        res.json({ message: 'Doctor schedule updated successfully.' });
    } catch (err) {
        if (err.status === 409) {
            return res.status(409).json({
                error: 'Conflicts detected',
                conflicts: err.conflicts,
            });
        }
        next(err);
    }
};

/**
 * POST /api/admin/dentists/:id/block
 *
 * Block a dentist's availability (leave, emergency, training).
 * Body: { block_date, start_time?, end_time?, reason, notes?, cancel_appointments? }
 * If start_time and end_time are omitted, blocks the entire day.
 * If cancel_appointments is true, auto-cancels affected appointments.
 */
export const blockDentistAvailability = async (req, res, next) => {
    try {
        const { block_date, start_time, end_time, reason, notes, cancel_appointments, overwrite } = req.body;

        if (!block_date || !reason) {
            return res.status(400).json({ error: 'block_date and reason are required.' });
        }

        const result = await blockDentistSchedule(
            req.params.id,
            block_date,
            start_time || null,
            end_time || null,
            reason,
            notes || null,
            cancel_appointments || overwrite || false,
            req.user.id,
            overwrite || false
        );

        // Audit Log: CREATE_SCHEDULE_BLOCK
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'CREATE_SCHEDULE_BLOCK',
                target_type: 'dentists',
                target_id: req.params.id,
                resource_type: 'dentist_availability_blocks',
                resource_id: result.block.id,
                old_values: null,
                new_values: req.body
            });
        } catch (auditErr) {
            console.error('Audit Log failed (blockDentistAvailability):', auditErr.message);
        }

        res.status(201).json({
            message: `Dentist availability blocked: ${reason}`,
            block: result.block,
            ...(result.cancelResult && {
                cancelled_appointments: result.cancelResult.cancelled_count,
                hint: `${result.cancelResult.cancelled_count} appointment(s) were auto-cancelled.`,
            }),
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/dentists/:id/block/bulk
 *
 * Bulk block a dentist's availability across multiple dates.
 * Body: { blocks: [{ block_date, start_time, end_time, reason, notes }], overwrite? }
 */
export const bulkBlockDentistAvailability = async (req, res, next) => {
    try {
        const { blocks, overwrite } = req.body;

        if (!blocks || !Array.isArray(blocks)) {
            return res.status(400).json({ error: 'blocks array is required.' });
        }

        const result = await bulkBlockDentistSchedule(
            req.params.id,
            blocks,
            req.user.id,
            overwrite || false
        );

        // Audit Log: CREATE_BULK_SCHEDULE_BLOCK
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'CREATE_BULK_SCHEDULE_BLOCK',
                target_type: 'dentists',
                target_id: req.params.id,
                resource_type: 'dentist_availability_blocks',
                resource_id: req.params.id,
                new_values: req.body
            });
        } catch (auditErr) {
            console.error('Audit Log failed (bulkBlockDentistAvailability):', auditErr.message);
        }

        res.status(201).json({
            message: `${result.results.length} blocks created successfully.`,
            blocks: result.results
        });
    } catch (err) {
        if (err.status === 409) {
            return res.status(409).json({
                error: 'Conflicts detected',
                conflicts: err.conflicts,
            });
        }
        next(err);
    }
};

/**
 * GET /api/admin/dentists/:id/blocks
 *
 * View all blocks for a dentist.
 */
export const viewDentistBlocks = async (req, res, next) => {
    try {
        const blocks = await getBlocks(req.params.id);
        res.json({ dentist_id: req.params.id, blocks });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/admin/dentists/:id/block/:blockId
 *
 * Remove a dentist availability block.
 */
export const removeDentistBlock = async (req, res, next) => {
    try {
        const { blockId } = req.params;

        // Fetch old values
        const { data: oldBlock } = await supabaseAdmin
            .from('dentist_availability_blocks')
            .select('*')
            .eq('id', blockId)
            .single();

        await removeAvailabilityBlock(blockId);

        // Audit Log: DELETE_SCHEDULE_BLOCK
        try {
            await supabaseAdmin.from('audit_log').insert({
                actor_id: req.user.id,
                actor_role: req.user.role,
                action: 'DELETE_SCHEDULE_BLOCK',
                target_type: 'dentists',
                target_id: req.params.id, // The dentist ID from the route
                resource_type: 'dentist_availability_blocks',
                resource_id: blockId,
                old_values: oldBlock,
                new_values: null
            });
        } catch (auditErr) {
            console.error('Audit Log failed (removeDentistBlock):', auditErr.message);
        }

        res.json({ message: 'Availability block removed.' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/emergency-slot
 *
 * Open an emergency slot outside normal availability.
 * Body: { dentist_id, date, start_time, end_time, notes? }
 */
export const openEmergencySlot = async (req, res, next) => {
    try {
        const { dentist_id, date, start_time, end_time, notes } = req.body;

        if (!dentist_id || !date || !start_time || !end_time) {
            return res.status(400).json({
                error: 'dentist_id, date, start_time, and end_time are required.',
            });
        }

        res.status(201).json({
            message: 'Emergency slot opened.',
            slot: { dentist_id, date, start_time, end_time, notes },
            hint: 'Use POST /api/admin/walk-in to book a patient into this slot.',
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// PATIENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/patients
 *
 * List all patients. Optional search by name or email.
 * Includes no-show count, cancellation count, and restriction info.
 * Query: ?search=john
 */
export const getPatients = async (req, res, next) => {
    try {
        const { search } = req.query;
        const patients = await searchPatients(search || null);
        res.json({ patients });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/patients/:id/history
 *
 * View a patient's full appointment history.
 */
export const viewPatientHistory = async (req, res, next) => {
    try {
        const history = await getPatientAppointmentHistory(req.params.id);
        res.json({
            patient_id: req.params.id,
            appointments: history,
            total: history.length,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/patients/:id/restriction
 *
 * Toggle a patient's booking restriction.
 * Body: { restricted: true/false, reason? }
 */
export const toggleRestriction = async (req, res, next) => {
    try {
        const { restricted, reason } = req.body;

        if (typeof restricted !== 'boolean') {
            return res.status(400).json({ error: 'restricted (boolean) is required.' });
        }

        const result = await setPatientRestriction(req.params.id, restricted, reason || null);
        res.json({
            message: restricted
                ? `Patient booking restricted: ${reason}`
                : 'Patient booking restriction lifted.',
            patient: result,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/walk-in/quick
 * Body: { full_name, email, phone, date_of_birth?, address? }
 */
export const quickRegisterPatientHandler = async (req, res, next) => {
    try {
        const patient = await quickRegisterPatient(req.body);
        res.status(201).json({
            message: 'Patient quick-registered.',
            patient,
        });
    } catch (err) {
        // If it's a custom error from the service
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        next(err);
    }
};

/**
 * GET /api/admin/patients/check-duplicates
 * Query: ?first_name=xxx&last_name=yyy&date_of_birth=zzz&phone=aaa&email=bbb
 */
export const checkDuplicatesHandler = async (req, res, next) => {
    try {
        const duplicates = await checkDuplicatePatient(req.query);
        res.json({ duplicates, count: duplicates.length });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/patients/merge
 * Body: { source_id, target_id }
 */
export const mergePatientsHandler = async (req, res, next) => {
    try {
        const { source_id, target_id } = req.body;
        if (!source_id || !target_id) {
            return res.status(400).json({ error: 'source_id and target_id are required.' });
        }
        const result = await mergePatientRecords(source_id, target_id);
        res.json({ message: 'Patients merged successfully.', result });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/patients/:id/request-dependency-consent
 * Body: { dependent_id }
 */
export const requestDependencyConsentHandler = async (req, res, next) => {
    try {
        const primary_id = req.params.id;
        const { dependent_id, relationship } = req.body;

        if (!dependent_id) {
            return res.status(400).json({ error: 'dependent_id is required.' });
        }
        if (!relationship) {
            return res.status(400).json({ error: 'relationship is required.' });
        }

        await sendDependencyConsentOTP(primary_id, dependent_id, relationship);
        res.json({ message: 'Dependency consent OTP sent to primary account email.' });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        next(err);
    }
};

/**
 * POST /api/admin/patients/:id/verify-dependency-consent
 * Body: { otp }
 */
export const verifyDependencyConsentHandler = async (req, res, next) => {
    try {
        const primary_id = req.params.id;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ error: 'OTP is required.' });
        }

        const result = await verifyDependencyConsent(primary_id, otp);
        res.json({ message: 'Dependency linked successfully.', result });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        next(err);
    }
};

/**
 * POST /api/admin/patients/:id/send-setup-link
 */
export const sendSetupLinkHandler = async (req, res, next) => {
    try {
        const profile_id = req.params.id;
        
        // 1. Verify profile exists and has email
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name, is_registered')
            .eq('id', profile_id)
            .single();
            
        if (!profile) return res.status(404).json({ error: 'Patient not found.' });
        if (!profile.email) return res.status(400).json({ error: 'Patient has no email address.' });
        if (profile.is_registered) return res.status(400).json({ error: 'Patient is already registered.' });

        // 2. Cooldown check (15 mins)
        const { data: recentToken } = await supabaseAdmin
            .from('account_setup_tokens')
            .select('created_at')
            .eq('profile_id', profile_id)
            .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
            .maybeSingle();

        if (recentToken) {
            return res.status(429).json({ 
                error: 'Cooldown active. Please wait 15 minutes before resending.',
                retry_after: new Date(new Date(recentToken.created_at).getTime() + 15 * 60 * 1000)
            });
        }

        // 3. Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        const { error: tokenErr } = await supabaseAdmin
            .from('account_setup_tokens')
            .insert({
                profile_id,
                token,
                expires_at
            });

        if (tokenErr) throw tokenErr;

        // 4. Trigger Email
        const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup-account?token=${token}`;
        await sendAccountSetupInviteEmail(profile.email, profile.full_name, setupUrl);

        res.json({ message: 'Account setup link sent successfully.', expires_at });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// REASSIGNMENT & AVAILABILITY
// ═══════════════════════════════════════════════

/**
 * PATCH /api/admin/appointments/:id/reassign
 * Body: { dentist_id }
 */
export const reassignAppointment = async (req, res, next) => {
    try {
        const { dentist_id } = req.body;

        if (!dentist_id) {
            return res.status(400).json({ error: 'dentist_id is required.' });
        }

        const updated = await reassignAppointmentToDentist(req.params.id, dentist_id);

        // Notify patient of dentist change
        if (updated.patient_id) {
            try {
                const { sendNotification } = await import('../services/notification.service.js');
                await sendNotification(
                    updated.patient_id,
                    'CONFIRMATION',
                    'Dentist Reassigned',
                    `Your appointment for ${updated.service?.name || 'Dental service'} on ${updated.appointment_date} has been reassigned to Dr. ${updated.dentist?.profile?.full_name}.`,
                    'in_app',
                    { 
                        appointment_id: updated.id, 
                        dentist_name: updated.dentist?.profile?.full_name,
                        action: 'dentist_reassigned'
                    }
                );
            } catch (err) {
                console.warn('[Realtime] Failed to notify patient of reassignment:', err.message);
            }
        }

        res.json({
            message: `Appointment reassigned to Dr. ${updated.dentist.profile.full_name}`,
            appointment: updated,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/dentists/available
 * Query: ?date=2026-03-20&start_time=09:00&end_time=10:00&tier=specialized
 */
export const getAvailableDentistsForReassignment = async (req, res, next) => {
    try {
        const { date, start_time, end_time, tier = 'general' } = req.query;

        if (!date || !start_time || !end_time) {
            return res.status(400).json({
                error: 'date, start_time, and end_time are required.',
            });
        }

        const available = await getAvailableDentistsForSlot(date, start_time, end_time, tier);
        res.json({ available, total: available.length });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// PAYMENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * POST /api/admin/payments
 * Body: { appointment_id, amount, payment_method, reference_number?, notes? }
 */
export const recordPaymentHandler = async (req, res, next) => {
    try {
        const payment = await recordPayment(req.body, req.user.id);
        res.status(201).json({
            message: 'Payment recorded.',
            payment,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/payments/:appointmentId
 */
export const getPaymentDetailsHandler = async (req, res, next) => {
    try {
        const payment = await getPaymentDetails(req.params.appointmentId);
        res.json({ payment });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/payments/:id
 * Body: { payment_status?, amount?, notes? }
 */
export const updatePaymentHandler = async (req, res, next) => {
    try {
        const payment = await updatePayment(req.params.id, req.body);
        res.json({
            message: 'Payment updated.',
            payment,
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// PROMOTIONS & HOLIDAYS
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/promotions
 */
export const getPromotionsHandler = async (req, res, next) => {
    try {
        const promotions = await getPromotions();
        res.json({ promotions, total: promotions.length });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/promotions
 * Body: { service_id, name, discount_type, discount_value, starts_at, ends_at, min_age?, max_age? }
 */
export const createPromotionHandler = async (req, res, next) => {
    try {
        const promotion = await createPromotion(req.body, req.user.id);
        res.status(201).json({
            message: 'Promotion created.',
            promotion,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/holidays
 */
export const getHolidaysHandler = async (req, res, next) => {
    try {
        const holidays = await getHolidays();
        res.json({ holidays, total: holidays.length });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/holidays
 * Body: { date, name, is_closed?, special_open_time?, special_close_time? }
 */
export const createHolidayHandler = async (req, res, next) => {
    try {
        const holiday = await createHoliday(req.body, req.user.id);
        res.status(201).json({
            message: 'Holiday created.',
            holiday,
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// FEEDBACK & COMMENTS
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/feedback
 * Query: ?dentist_id=...
 */
export const getFeedbackHandler = async (req, res, next) => {
    try {
        const { dentist_id } = req.query;
        const feedback = await getFeedback(dentist_id || null);
        res.json({ feedback, total: feedback.length });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/appointments/:id/comments
 */
export const getAppointmentCommentsHandler = async (req, res, next) => {
    try {
        const comments = await getAppointmentComments(req.params.id);
        res.json({ appointment_id: req.params.id, comments, total: comments.length });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/appointments/:id/comments
 * Body: { comment }
 */
export const addAppointmentCommentHandler = async (req, res, next) => {
    try {
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ error: 'comment is required.' });
        }

        const result = await addAppointmentComment(req.params.id, comment, req.user.id);
        res.status(201).json({
            message: 'Comment added.',
            comment: result,
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// SCHEDULE REQUESTS
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/schedule-requests
 */
export const getScheduleRequestsHandler = async (req, res, next) => {
    try {
        const requests = await getScheduleRequests();
        res.json({ requests, total: requests.length });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/schedule-requests/:id/approve
 */
export const approveScheduleRequestHandler = async (req, res, next) => {
    try {
        const request = await approveScheduleRequest(req.params.id, req.user.id);
        res.json({
            message: 'Schedule request approved.',
            request,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/schedule-requests/:id/reject
 * Body: { reason }
 */
export const rejectScheduleRequestHandler = async (req, res, next) => {
    try {
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'reason is required.' });
        }

        const request = await rejectScheduleRequest(req.params.id, req.user.id, reason);
        res.json({
            message: 'Schedule request rejected.',
            request,
        });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// ADMIN-ONLY USER MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * GET /api/admin/users
 * ADMIN ONLY
 */
export const getUsersHandler = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.json({ users, total: users.length });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/users
 * Body: { email, full_name, phone?, role }
 * ADMIN ONLY
 */
export const createUserHandler = async (req, res, next) => {
    try {
        const result = await createSystemUser(req.body);
        res.status(201).json({
            message: result.message,
            user: result.user,
        });
    } catch (err) {
        next(err);
    }
};


/**
 * PATCH /api/admin/users/:id/role
 * Body: { role }
 * ADMIN ONLY
 */
export const changeUserRoleHandler = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!role) {
            return res.status(400).json({ error: 'role is required.' });
        }

        const user = await changeUserRole(req.params.id, role);
        res.json({
            message: `User role changed to ${role}.`,
            user,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/users/:id/deactivate
 * ADMIN ONLY
 */
export const deactivateUserHandler = async (req, res, next) => {
    try {
        const user = await deactivateUser(req.params.id);
        res.json({
            message: 'User deactivated.',
            user,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/system/health
 * ADMIN ONLY
 */
export const getSystemHealthHandler = async (req, res, next) => {
    try {
        const health = await getSystemHealth();
        res.json(health);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/admin/dentists
 * 
 * Onboard a brand new doctor (Profile + Dentist record).
 */
export const onboardDoctor = async (req, res, next) => {
    try {
        const result = await onboardDentistProfile(req.body);

        // Audit Log: CREATE_DOCTOR
        try {
            // Find the dentist ID (created via trigger)
            const { data: dentist } = await supabaseAdmin
                .from('dentists')
                .select('id')
                .eq('profile_id', result.user.id)
                .single();

            if (dentist) {
                await supabaseAdmin.from('audit_log').insert({
                    actor_id: req.user.id,
                    actor_role: req.user.role,
                    action: 'CREATE_DOCTOR',
                    target_type: 'dentists',
                    target_id: dentist.id,
                    resource_type: 'dentists',
                    resource_id: dentist.id,
                    old_values: null,
                    new_values: {
                        email: req.body.email,
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        specialization: req.body.specialization,
                        tier: req.body.tier
                    }
                });
            }
        } catch (auditErr) {
            console.error('Audit Log failed (onboardDoctor):', auditErr.message);
        }

        res.status(201).json({
            message: 'Doctor onboarded successfully.',
            user: result.user, 
            message_detail: result.message
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/patients/:id
 */
export const getPatientHandler = async (req, res, next) => {
    try {
        const patient = await getPatientProfile(req.params.id);
        res.json(patient);
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/admin/patients/:id
 */
export const updatePatientHandler = async (req, res, next) => {
    try {
        const patient = await updatePatientProfileData(req.params.id, req.body);
        res.json({
            message: 'Patient profile updated.',
            patient
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/admin/message-logs
 */
export const getMessageLogsHandler = async (req, res, next) => {
    try {
        const { getMessageLogs } = await import('../services/message-log.service.js');
        const logs = await getMessageLogs();
        res.json({ logs });
    } catch (err) {
        next(err);
    }
};
