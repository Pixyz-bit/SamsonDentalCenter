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
} from '../services/appointment.service.js';
import {
    confirmAppointmentByToken,
    resendConfirmationEmail,
    validateGuestActionToken,
    markGuestTokenUsed,
    sendCancellationEmail,
    sendRescheduleEmail,
} from '../services/email-confirmation.service.js';
import { notifyWaitlist, joinWaitlist } from '../services/waitlist.service.js';
import { getAvailableSlots } from '../services/slot.service.js';
import { assignDentist } from '../services/dentist-assignment.service.js';
import { holdSlot, releaseHold, getActiveHoldBySession } from '../services/slot-hold.service.js';
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
            birthday // ✅ Extract birthday
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
            birthday // ✅ Pass birthday
        );
        return res.status(result.booked ? 201 : 409).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/appointments/confirm-email?token=xxx
 * Public endpoint — guest clicks the email link.
 * Validates token → updates appointment status to CONFIRMED.
 *
 * Option A: Return JSON (if frontend handles the redirect)
 * Option B: Redirect to frontend success/error page
 */
export const confirmEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        const result = await confirmAppointmentByToken(token);

        // Return JSON — frontend (React Router) handles the navigation
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/appointments/resend-confirmation
 * Body: { appointment_id, email }
 * Public endpoint — guest can request a new confirmation email.
 */
export const resendConfirmation = async (req, res) => {
    try {
        const { appointment_id, email } = req.body;

        const result = await resendConfirmationEmail(appointment_id, email);
        return res.json(result);
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
            booked_for_relationship
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
            booked_for_relationship
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
                    booking.patient_profile_id,      // ✅ patientProfileId
                    booking.booked_for_name_parts?.birthday || null,
                    booking.booked_for_name_parts?.relationship || null
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

/**
 * GET /api/appointments/guest/cancel?token=xxx
 * Returns appointment details so the frontend can show "Are you sure?" page.
 */
export const guestCancelInfo = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token is required.' });

        const result = await validateGuestActionToken(token, 'cancel');
        res.json({
            message: 'Token valid. Confirm cancellation to proceed.',
            appointment: {
                id: result.appointment.id,
                date: result.appointment.appointment_date,
                time: result.appointment.start_time,
                service: result.appointment.service?.name,
                dentist: result.appointment.dentist?.profile?.full_name || 'Assigned',
                guest_name: result.appointment.guest_name,
            },
        });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * POST /api/appointments/guest/cancel?token=xxx
 * Guest confirms they want to cancel.
 */
export const guestCancelConfirm = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token is required.' });

        const result = await validateGuestActionToken(token, 'cancel');

        // Cancel the appointment
        const updated = await cancelGuestAppointmentAction(result.appointment.id, 'Cancelled by guest via reminder email link.');

        // Mark token as used
        await markGuestTokenUsed(result.token_id);

        // Trigger waitlist if someone is waiting
        await notifyWaitlist({
            date: updated.appointment_date,
            start_time: updated.start_time,
            end_time: updated.end_time,
            service_id: updated.service_id,
        });

        // Send cancellation email
        await sendCancellationEmail(result.appointment.guest_email, result.appointment.guest_name, {
            date: updated.appointment_date,
            start_time: updated.start_time,
            service: result.appointment.service?.name || 'Dental appointment',
            isLastMinute: false,
        });

        res.json({
            message: 'Appointment cancelled successfully.',
            cancelled_appointment: {
                id: updated.id,
                date: updated.appointment_date,
                time: updated.start_time,
                status: updated.status,
            },
        });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * GET /api/appointments/guest/reschedule?token=xxx
 * Returns appointment details + available slots so the frontend can show a slot picker.
 */
export const guestRescheduleInfo = async (req, res, next) => {
    try {
        const { token } = req.query;

        const result = await validateGuestActionToken(token, 'reschedule');

        // Get available slots for the same service on the same date
        const slots = await getAvailableSlots(
            result.appointment.appointment_date,
            result.appointment.service?.id,
        );

        res.json({
            message: 'Token valid. Select a new time to reschedule.',
            current_appointment: {
                id: result.appointment.id,
                date: result.appointment.appointment_date,
                time: result.appointment.start_time,
                service: result.appointment.service?.name,
                service_id: result.appointment.service?.id,
                dentist: result.appointment.dentist?.profile?.full_name || 'Assigned',
                guest_name: result.appointment.guest_name,
            },
            available_slots: slots.all_slots,
        });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

/**
 * POST /api/appointments/guest/reschedule?token=xxx
 * Body: { date, time } — the new date and time the guest chose.
 *
 * Flow:
 * 1. Validate the token
 * 2. Book the new slot (as guest, CONFIRMED — they already verified email)
 * 3. Cancel the old appointment
 * 4. Mark token as used
 * 5. Send reschedule email
 */
export const guestRescheduleConfirm = async (req, res, next) => {
    try {
        const { token } = req.query;
        const { date, time, user_session_id } = req.body;

        const result = await validateGuestActionToken(token, 'reschedule');
        const oldAppt = result.appointment;

        // Atomic Reschedule: Book new -> Cancel old
        const outcome = await rescheduleGuestAppointment(oldAppt, date, time, user_session_id);

        if (!outcome.rescheduled) {
            return res.status(outcome.message ? 409 : 200).json(outcome);
        }

        const { newAppointment } = outcome;

        // 5. Trigger waitlist for the freed old slot (Backgrounded)
        notifyWaitlist({
            date: oldAppt.appointment_date,
            start_time: oldAppt.start_time,
            end_time: oldAppt.end_time,
            service_id: oldAppt.service?.id,
        }).catch(err => console.error('[Waitlist] Failed to notify:', err.message));

        // 6. Mark token as used
        await markGuestTokenUsed(result.token_id);

        // 7. Send reschedule email (Backgrounded)
        sendRescheduleEmail(oldAppt.guest_email, oldAppt.guest_name, {
            oldDate: oldAppt.appointment_date,
            oldTime: oldAppt.start_time,
            newDate: newAppointment.appointment_date,
            newTime: newAppointment.start_time,
            service: newAppointment.service?.name || 'Dental appointment',
            dentist: newAppointment.dentist?.profile?.full_name || 'Assigned',
        }).catch(err => console.error('[Email] Failed to send guest reschedule email:', err.message));

        res.json({
            message: 'Appointment rescheduled successfully!',
            old_appointment: {
                date: oldAppt.appointment_date,
                time: oldAppt.start_time,
                status: 'CANCELLED',
            },
            new_appointment: {
                id: newAppointment.id,
                date: newAppointment.appointment_date,
                time: newAppointment.start_time,
                service: newAppointment.service?.name,
                dentist: newAppointment.dentist?.profile?.full_name || 'Assigned',
                status: 'CONFIRMED',
            },
        });
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
