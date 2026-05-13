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
    checkUserBookingAbuse,
} from '../services/appointment.service.js';
import { validateGuestBooking } from '../services/appointment-validation.service.js';
import {
    sendCancellationEmail,
    sendRescheduleEmail,
} from '../services/email-confirmation.service.js';
import { notifyWaitlist, joinWaitlist } from '../services/waitlist.service.js';
import { getAvailableSlots } from '../services/slot.service.js';
import { assignDentist } from '../services/dentist-assignment.service.js';
import { holdSlot, releaseHold, releaseHoldBySession, getActiveHoldBySession } from '../services/slot-hold.service.js';
import * as guestAuthService from '../services/guest-auth.service.js';
import { getTodayPH } from '../utils/timezone.js';
import { addMinutesToTime } from '../utils/time.js';
import { supabaseAdmin } from '../config/supabase.js';
import { APPOINTMENT_SOURCE } from '../utils/constants.js';

/**
 * POST /api/appointments/book-guest
 * Body: { service_id, date, time, email, phone, full_name }
 *
 * Creates appointment as PENDING and sends confirmation email.
 * @param {string} service_id - Service UUID
 * @param {string} date - Appointment date 'YYYY-MM-DD'
 * @param {string} time - Appointment time 'HH:MM'
 * @param {string} email - Guest email address
 * @param {string} phone - Guest phone number
 * @param {string} full_name - Guest full name
 */
export const bookGuest = async (req, res, next) => {
    try {
        const { 
            service_id, 
            date, 
            time, 
            email, 
            phone, 
            guestNameParts, 
            user_session_id, 
            verification_token,
            notes,
            birthday, // ✅ Extract birthday
            accepted_terms,
            terms_accepted_at
        } = req.body;

        if (!verification_token) {
            return res.status(403).json({ error: 'Email verification required to book as a guest.' });
        }

        // 1. Verify the token belongs to this email
        const isVerified = await guestAuthService.validateGuestVerification(email, verification_token);
        if (!isVerified) {
            return res.status(403).json({ error: 'Invalid or expired verification session. Please verify your email again.' });
        }

        const result = await bookAppointmentGuest(
            service_id,
            date,
            time,
            email,
            phone,
            guestNameParts,
            user_session_id,
            0, // rescheduleCount
            notes,
            birthday, // ✅ Pass birthday
            accepted_terms,
            terms_accepted_at
        );
        return res.status(result.booked ? 201 : 409).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/appointments/guest-validate
 * Pre-flight validation before OTP for guest bookings.
 */
export const guestValidate = async (req, res, next) => {
    try {
        const { email, date, time, service_id, duration } = req.body;
        
        await validateGuestBooking(email, date, time, service_id, duration);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Booking request is valid.' 
        });
    } catch (err) {
        next(err);
    }
};



/**
 * POST /api/appointments/book-user
 * Body: { service_id, date, time, booked_for_name? }
 *
 * booked_for_name is optional.
 * - Omit or null  → booking for self (uses account name)
 * - Provide a name → booking for someone else (stored in booked_for_name column)
 */
export const bookUser = async (req, res, next) => {
    try {
        const { 
            service_id, 
            date, 
            time, 
            booked_for_name_parts, 
            user_session_id, 
            dentist_id,
            patient_profile_id,
            booked_for_birthday,
            booked_for_relationship,
            booked_for_sex
        } = req.body;

        // Check date is in the future (using Philippine Time)
        const todayPH = getTodayPH();
        if (date < todayPH) {
            return res.status(400).json({ error: 'Cannot book appointments in the past.' });
        }

        // ── Book it ──
        const result = await bookAppointment(
            req.user.id,
            service_id,
            date,
            time,
            true, // sendEmail
            booked_for_name_parts || null, // null = for self, parts = for someone else
            APPOINTMENT_SOURCE.USER_BOOKING, // source
            user_session_id,                 // user_session_id
            dentist_id,                      // preferredDentistId
            0,                               // rescheduleCount
            null,                            // isPreferred
            patient_profile_id,              // patientProfileId
            booked_for_birthday,
            booked_for_relationship,
            null,                            // notes (default)
            booked_for_sex                   // ✅ patientSex
        );

        if (result.booked) {
            res.status(201).json(result);
        } else {
            // Slot was not available — return alternatives
            res.status(200).json(result);
        }
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }
        next(err);
    }
};

/**
 * POST /api/appointments/submit-wizard
 * Atomic submission for User Booking Wizard.
 * Body: {
 *   service_id,
 *   booking: { date, time, booked_for_name, user_session_id },
 *   waitlist: { date, time, priority }
 * }
 */
export const submitWizard = async (req, res, next) => {
    try {
        const { service_id, booking, waitlist } = req.body;
        const results = { booking: null, waitlist: null };

        // 1. Process Booking if requested
        if (booking && booking.date && booking.time) {
            try {
                results.booking = await bookAppointment(
                    req.user.id,
                    service_id,
                    booking.date,
                    booking.time,
                    true, // sendEmail
                    booking.booked_for_name_parts || null,
                    APPOINTMENT_SOURCE.USER_BOOKING, // source
                    booking.user_session_id,         // user_session_id
                    booking.dentist_id,              // preferredDentistId
                    0,                               // rescheduleCount
                    null,                            // isPreferred
                    booking.patient_profile_id === 'new' ? null : (booking.patient_profile_id || null),      // ✅ patientProfileId
                    booking.booked_for_name_parts?.birthday || null,
                    booking.booked_for_name_parts?.relationship || null,
                    booking.notes || null,
                    booking.booked_for_name_parts?.sex || null,
                    booking.accepted_terms || false,
                    booking.terms_accepted_at || null
                );
            } catch (err) {
                // If booking fails, return error and stop.
                // The global handler will humanize err.message.
                err.stage = 'booking';
                return next(err);
            }
        }

        // 2. Process Waitlist if requested
        if (waitlist && (waitlist.date || waitlist.preferred_date)) {
            try {
                results.waitlist = await joinWaitlist(
                    req.user.id,
                    service_id,
                    waitlist.date || waitlist.preferred_date,
                    waitlist.time || waitlist.preferred_time || null,
                    waitlist.priority || 0,
                    waitlist.booked_for_name_parts || booking?.booked_for_name_parts || null,
                    waitlist.dentist_id || null,
                    results.booking?.appointment?.id || null, // ✅ link the bundled appointment
                    waitlist.patient_profile_id || booking?.patient_profile_id || null, // ✅ patientProfileId
                    waitlist.booked_for_name_parts?.birthday || booking?.booked_for_name_parts?.birthday || null,
                    waitlist.booked_for_name_parts?.relationship || booking?.booked_for_name_parts?.relationship || null
                );
            } catch (err) {
                // ── ATOMICITY ROLLBACK: If waitlist fails, cancel the backup booking ──
                if (results.booking?.booked && results.booking.appointment?.id) {
                    try {
                        console.warn(`⚠️ Rolling back booking ${results.booking.appointment.id} due to waitlist failure.`);
                        await cancelAppointment(
                            results.booking.appointment.id,
                            req.user.id,
                            'Rollback: waitlist registration failed during atomic submission.',
                            false, // sendEmail = false to avoid confusing the user
                        );
                    } catch (rollbackErr) {
                        console.error('❌ Critical: Rollback failed:', rollbackErr);
                    }
                }

                return res.status(err.status || 400).json({
                    error: `Waitlist registration failed: ${err.message}. We couldn't complete your request as a bundle. Please check your existing waitlist or try again with a different slot.`,
                    stage: 'waitlist',
                });
            }
        }

        res.status(200).json({
            success: true,
            ...results,
        });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * GET /api/appointments/my
 * Optional query: ?status=CONFIRMED
 */
export const getMyAppointments = async (req, res, next) => {
    try {
        const { status, sort, page = 1, limit = 10 } = req.query;
        
        const [result, stats] = await Promise.all([
            getPatientAppointments(req.user.id, status, sort, page, limit),
            getPatientAppointmentStats(req.user.id)
        ]);

        res.json({
            appointments: result.appointments,
            total: result.total,
            stats,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * GET /api/appointments/:id
 */
export const getOne = async (req, res, next) => {
    try {
        const appointment = await getAppointmentById(req.params.id, req.user.id);
        res.json({ appointment });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * PATCH /api/appointments/:id/cancel
 * Body: { reason? }
 */
export const cancel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const result = await cancelAppointment(id, req.user.id, reason);

        // ── Trigger waitlist notification (Module 09) ──
        // When a slot is freed, notify the first person waiting for it
        await notifyWaitlist(result.freed_slot);

        res.json(result);
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * PATCH /api/appointments/:id/reschedule
 * Body: { date, time }
 */
export const reschedule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date, time, user_session_id, dentist_id } = req.body;

        const result = await rescheduleAppointment(id, req.user.id, date, time, user_session_id, dentist_id);

        if (result.rescheduled) {
            // ── Trigger waitlist notification for the FREED old slot ──
            if (result.freed_slot) {
                await notifyWaitlist(result.freed_slot);
            }
            res.json(result);
        } else {
            res.status(200).json(result); // Alternatives returned
        }
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};


// Helper replaced by global utility

/**
 * POST /api/appointments/slots/hold
 * Body: { service_id, date, time, user_session_id }
 *
 * Hold a time slot for 5 minutes while user completes booking form.
 * If user already has a hold on a different time for the same date,
 * the old hold is automatically released (auto-switch behavior).
 */
export const holdSlotHandler = async (req, res, next) => {
    try {
        const { service_id, date, time, user_session_id, dentist_id } = req.body;

        const result = await holdSlot(service_id, date, time, user_session_id, dentist_id);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/appointments/slots/release-hold
 * Body: { hold_id }
 *
 * Release a slot hold (mark as released).
 * Called when user navigates away or completes booking.
 */
export const releaseSlotHold = async (req, res) => {
    try {
        const { hold_id } = req.body;

        const result = await releaseHold(hold_id);
        return res.status(200).json(result);
    } catch (err) {
        console.error('Release hold error:', err);
        return res.status(err.status || 500).json({ error: err.message });
    }
};

/**
 * POST /api/appointments/slots/release-session-hold
 * Body: { user_session_id }
 *
 * Release all slot holds for a session.
 */
export const releaseSlotHoldBySession = async (req, res) => {
    try {
        const { user_session_id } = req.body;

        const result = await releaseHoldBySession(user_session_id);
        return res.status(200).json(result);
    } catch (err) {
        console.error('Release hold by session error:', err);
        return res.status(err.status || 500).json({ error: err.message });
    }
};

/**
 * GET /api/appointments/slots/active-hold
 * Query: ?session_id=xxx
 */
export const getActiveHoldHandler = async (req, res, next) => {
    try {
        const { session_id } = req.query;
        if (!session_id) {
            return res.status(400).json({ error: 'Session ID is required.' });
        }

        const hold = await getActiveHoldBySession(session_id);
        return res.status(200).json(hold || { hold_id: null });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/appointments/user-validate
 * Pre-flight check for user booking anti-abuse rules.
 * Intercepts: Overlapping slots, active quotas, and dependent limits.
 */
export const userValidate = async (req, res, next) => {
    try {
        const { service_id, date, time, patient_profile_id } = req.body;
        
        // Normalize patient_profile_id
        const profileId = patient_profile_id === 'new' ? null : (patient_profile_id || null);

        await checkUserBookingAbuse(req.user.id, service_id, date, time, profileId);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Validation successful. You are eligible to book this slot.' 
        });
    } catch (err) {
        // If it's a known validation error, return as a clean 4xx response
        if (err.statusCode && err.statusCode < 500) {
            return res.status(err.statusCode).json({ error: err.message });
        }
        next(err);
    }
};
