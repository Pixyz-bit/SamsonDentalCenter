import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { APPOINTMENT_STATUS, CLINIC_CONFIG } from '../utils/constants.js';
import { AppError } from '../utils/errors.js';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { logCommunication } from './message-log.service.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const getTemplate = (templateName, data) => {
    const templatePath = path.join(process.cwd(), '..', '..', 'EmailTemplates', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value || '');
    }

    return html;
};

/**
 * Send an OTP code to a guest for pre-booking verification.
 *
 * @param {string} email - Guest email
 * @param {string} name - Guest name
 * @param {string} otpCode - 6-digit code
 */
export const sendOTPEmail = async (email, name, otpCode) => {
    try {
        const html = getTemplate('guest-otp.html', {
            name,
            otpCode,
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: `${otpCode} is your PrimeraDental verification code`,
            html,
        });

        // Log to database
        await logCommunication({
            recipient: email,
            channel: 'email',
            purpose: 'OTP',
            status: 'sent',
            provider_id: result.id
        });

        console.log(`📧 OTP email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message);
        throw err; // Re-throw so the service can handle it
    }
};

/**
 * Generate a secure confirmation token and save it to the database.
 *
 * @param {string} appointmentId - The appointment UUID
 * @returns {object} { token } - The generated token
 */
export const createConfirmationToken = async (appointmentId) => {
    const token = crypto.randomBytes(32).toString('hex');

    // Token expires in 15 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CLINIC_CONFIG.GUEST_CONFIRM_EXPIRY_MINUTES);

    const { error } = await supabaseAdmin.from('appointment_confirmation_tokens').insert({
        appointment_id: appointmentId,
        token,
        expires_at: expiresAt.toISOString(),
    });

    if (error) {
        console.error('Failed to create confirmation token:', error.message);
        throw new AppError('Failed to create confirmation token.', 500);
    }

    return { token };
};

/**
 * Send a confirmation email to a guest with a verification link.
 *
 * @param {string} email - Guest email address
 * @param {string} name - Guest name
 * @param {object} details - { token, date, start_time, service }
 */
export const sendGuestConfirmationEmail = async (email, name, details) => {
    const { token, date, start_time, service } = details;

    const confirmUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email/confirm?token=${token}`;

    try {
        const html = getTemplate('guest-verification.html', {
            name,
            service,
            date,
            start_time,
            confirmUrl,
            expiryMinutes: CLINIC_CONFIG.GUEST_CONFIRM_EXPIRY_MINUTES,
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: 'Verify Your Booking Request — Samson Dental',
            html,
        });

        // Log to database
        await logCommunication({
            recipient: email,
            channel: 'email',
            purpose: 'CONFIRMATION_REQUEST',
            status: 'sent',
            provider_id: result.id
        });

        console.log(`📧 Confirmation email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send confirmation email:', err.message);
        // Don't throw — appointment was created, email failure shouldn't block everything
        // The guest can request a resend later
    }
};

/**
 * Confirm an appointment via email token.
 * Called when guest clicks the confirmation link.
 *
 * @param {string} token - The confirmation token from the email link
 * @returns {object} { confirmed, appointment }
 */
export const confirmAppointmentByToken = async (token) => {
    // ── 1. Find the token ──
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
        .from('appointment_confirmation_tokens')
        .select('*, appointment:appointments(id, status, appointment_date, start_time)')
        .eq('token', token)
        .single();

    if (tokenError || !tokenRecord) {
        throw new AppError('This link is invalid or has already been used to verify your request.', 404);
    }

    // ── 2. Check if token is expired ──
    if (new Date(tokenRecord.expires_at) < new Date()) {
        throw new AppError('This verification link has expired for your security. Please request a new one or try booking again.', 410);
    }

    // ── 3. Check appointment status ──
    if (tokenRecord.appointment?.status !== APPOINTMENT_STATUS.PENDING) {
        // Already confirmed or cancelled
        return {
            confirmed: false,
            message: `Appointment is already ${tokenRecord.appointment?.status.toLowerCase()}.`,
        };
    }

    // ── 4. Update appointment to mark as verified (but stay PENDING) ──
    const { data: updatedAppointment, error: updateError } = await supabaseAdmin
        .from('appointments')
        .update({
            patient_confirmed: true, // Used here to mean "Email Verified"
            confirmed_at: new Date().toISOString(),
            // status remains PENDING for admin approval
        })
        .eq('id', tokenRecord.appointment_id)
        .select(
            `
            *,
            service:services(name, price)
        `,
        )
        .single();

    if (updateError) {
        throw new AppError('Failed to verify request.', 500);
    }

    // ── 5. Send "Verification Success" email (Awaiting Admin) ──
    try {
        const html = getTemplate('verification-success.html', {
            name: updatedAppointment.guest_name,
            serviceName: updatedAppointment.service?.name,
            appointmentDate: updatedAppointment.appointment_date,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: updatedAppointment.guest_email,
            subject: '📧 Request Verified — Samson Dental',
            html,
        });
    } catch (err) {
        console.error('Failed to send verification success email:', err.message);
    }

    // ── 6. Delete used token ──
    await supabaseAdmin.from('appointment_confirmation_tokens').delete().eq('id', tokenRecord.id);

    return {
        confirmed: true,
        message: 'Request verified! Our team will review it and notify you soon.',
        appointment: {
            id: updatedAppointment.id,
            date: updatedAppointment.appointment_date,
            start_time: updatedAppointment.start_time,
            service: updatedAppointment.service?.name,
        },
    };
};

/**
 * Resend confirmation email for a PENDING guest appointment.
 * Useful if the guest didn't receive the first email.
 *
 * @param {string} appointmentId - The appointment UUID
 * @param {string} email - Guest email (must match the one on file)
 */
export const resendConfirmationEmail = async (appointmentId, email) => {
    // ── 1. Find the appointment ──
    const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .select('*, service:services(name)')
        .eq('id', appointmentId)
        .eq('guest_email', email)
        .eq('status', APPOINTMENT_STATUS.PENDING)
        .single();

    if (!appointment) {
        throw new AppError('No pending appointment found for this email.', 404);
    }

    // ── 2. Delete old token(s) for this appointment ──
    await supabaseAdmin
        .from('appointment_confirmation_tokens')
        .delete()
        .eq('appointment_id', appointmentId);

    // ── 3. Generate new token and send email ──
    const { token } = await createConfirmationToken(appointmentId);
    await sendGuestConfirmationEmail(email, appointment.guest_name, {
        token,
        date: appointment.appointment_date,
        start_time: appointment.start_time,
        service: appointment.service?.name,
    });

    return { message: 'Confirmation email resent. Please check your inbox.' };
};

/**
 * Send a "Booking Confirmed" email after successful booking.
 * Used for:
 *   - Authenticated patients (immediately after booking)
 *   - Guests (after they click the confirmation link)
 *
 * @param {string} email - Patient/guest email
 * @param {string} name - Patient/guest name
 * @param {object} details - { date, start_time, end_time, service, dentist }
 */
export const sendBookingSuccessEmail = async (email, name, details) => {
    const { date, start_time, end_time, service, dentist } = details;

    try {
        const html = getTemplate('booking-confirmed.html', {
            name,
            service,
            date,
            start_time,
            end_time,
            dentist,
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: '✅ Appointment Confirmed — Samson Dental',
            html,
        });

        // Log to database
        await logCommunication({
            recipient: email,
            channel: 'email',
            purpose: 'BOOKING_CONFIRMATION',
            status: 'sent',
            provider_id: result.id
        });

        console.log(`✅ [Email] SUCCESS: Booking confirmation sent to ${email}`, result);
        return { success: true, result };
    } catch (err) {
        console.error('❌ [Email] FAILED to send booking success email:', err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Send a "Booking Request Received" email for authenticated patients.
 * Used when their appointment needs admin approval (all online bookings now).
 *
 * @param {string} email - Patient email
 * @param {string} name - Patient name
 * @param {object} details - { date, start_time, service }
 */
export const sendBookingRequestReceivedEmail = async (email, name, details) => {
    const { date, start_time, service } = details;

    try {
        const html = getTemplate('booking-request-received.html', {
            name,
            serviceName: service,
            appointmentDate: date,
            startTime: start_time,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: '📧 Booking Request Received — Samson Dental',
            html,
        });
        console.log(`📧 Booking request receipt sent to ${email}`);
    } catch (err) {
        console.error('Failed to send booking request receipt:', err.message);
    }
};

/**
 * Send a "Cancellation" email after a patient cancels their appointment.
 * Informational only — no action required from the patient.
 *
 * Used for:
 *   - Authenticated patients (fetch email from profiles table)
 *   - Guests (use appointment.guest_email)
 *
 * @param {string} email - Patient/guest email
 * @param {string} name - Patient/guest name
 * @param {object} details - { date, start_time, service, isLastMinute }
 */
export const sendCancellationEmail = async (email, name, details) => {
    const { date, start_time, service, isLastMinute } = details;

    const subject = isLastMinute
        ? '⚠️ Appointment Cancelled (Late Cancellation) — Samson Dental'
        : '❌ Appointment Cancelled — Samson Dental';

    const lateNotice = isLastMinute
        ? `<p style="color: #f59e0b; font-weight: bold;">
               ⚠️ This was a late cancellation (less than ${CLINIC_CONFIG.LATE_CANCELLATION_HOURS} hours notice).
               Frequent late cancellations may affect your future booking requests.
           </p>`
        : '';

    try {
        const html = getTemplate('booking-cancelled.html', {
            name,
            service,
            date,
            start_time,
            lateNotice,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject,
            html,
        });
        console.log(`📧 Cancellation email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send cancellation email:', err.message);
        // Don't throw — cancellation was successful, email failure shouldn't block it
    }
};

/**
 * Send a "Rescheduled" email after a patient reschedules their appointment.
 * Informational only — tells patient their new date/time.
 *
 * @param {string} email - Patient email
 * @param {string} name - Patient name
 * @param {object} details - { oldDate, oldTime, newDate, newTime, service, dentist }
 */
export const sendRescheduleEmail = async (email, name, details) => {
    const { oldDate, oldTime, newDate, newTime, service, dentist } = details;

    try {
        const html = getTemplate('appointment-rescheduled.html', {
            name,
            service,
            oldDate,
            oldTime,
            newDate,
            newTime,
            dentist,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: '🔄 Appointment Rescheduled — Samson Dental',
            html,
        });
        console.log(`📧 Reschedule email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send reschedule email:', err.message);
        // Don't throw — reschedule was successful, email failure shouldn't block it
    }
};

/**
 * Send a reminder email to a GUEST with Reschedule and Cancel links.
 *
 * Called by: The reminder cron job (scheduled-tasks.js), only for guest appointments.
 * Links use tokens from the guest_action_tokens table — no login required.
 *
 * @param {string} email - Guest email address
 * @param {string} name - Guest name
 * @param {object} details - { date, start_time, service, dentist, cancelToken, rescheduleToken, hoursUntil }
 */
export const sendGuestReminderEmail = async (email, name, details) => {
    const { date, start_time, service, dentist, cancelToken, rescheduleToken, hoursUntil } =
        details;

    const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email/cancel?token=${cancelToken}`;
    const rescheduleUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email/reschedule?token=${rescheduleToken}`;

    const actionButtons = `
        <a href="${rescheduleUrl}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 5px 10px;">📅 Reschedule</a>
        <a href="${cancelUrl}" style="display: inline-block; background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 5px 10px;">❌ Cancel</a>
    `;

    const footerNote = `These links expire when your appointment starts. If you cannot make it, please cancel at least 24 hours before your appointment.`;

    try {
        const html = getTemplate('appointment-reminder.html', {
            name,
            service,
            date,
            start_time,
            dentist,
            actionButtons,
            footerNote,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: `⏰ Reminder: Your Appointment in ${hoursUntil} Hours — Samson Dental`,
            html,
        });
        console.log(`📧 Guest reminder email (${hoursUntil}h) sent to ${email}`);
    } catch (err) {
        console.error('Failed to send guest reminder email:', err.message);
    }
};

/**
 * Send a plain reminder email to an authenticated patient.
 *
 * No action links — patients manage reschedule/cancel from their website dashboard.
 * This is just a "heads up" nudge via email (alongside the in-app notification).
 *
 * @param {string} email - Patient email
 * @param {string} name - Patient name
 * @param {object} details - { date, start_time, service, dentist, hoursUntil }
 */
export const sendPatientReminderEmail = async (email, name, details) => {
    const { date, start_time, service, dentist, hoursUntil } = details;

    const footerNote = `Need to cancel or reschedule? Log in to your account on our website to manage your appointments.`;

    try {
        const html = getTemplate('appointment-reminder.html', {
            name,
            service,
            date,
            start_time,
            dentist,
            actionButtons: '',
            footerNote,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: `⏰ Reminder: Your Appointment in ${hoursUntil} Hours — Samson Dental`,
            html,
        });
        console.log(`📧 Patient reminder email (${hoursUntil}h) sent to ${email}`);
    } catch (err) {
        console.error('Failed to send patient reminder email:', err.message);
    }
};

/**
 * Create a pair of action tokens (cancel + reschedule) for a guest appointment.
 * Called by the reminder cron job before sending the guest reminder email.
 *
 * @param {string} appointmentId - The appointment UUID
 * @param {string} appointmentDate - 'YYYY-MM-DD' — tokens expire at appointment time
 * @param {string} appointmentTime - 'HH:MM' — tokens expire at appointment time
 * @returns {object} { cancelToken, rescheduleToken }
 */
export const createGuestActionTokens = async (appointmentId, appointmentDate, appointmentTime) => {
    const cancelToken = crypto.randomBytes(32).toString('hex');
    const rescheduleToken = crypto.randomBytes(32).toString('hex');

    // Tokens expire at the appointment start time (no point rescheduling/cancelling after)
    const expiresAt = new Date(`${appointmentDate}T${appointmentTime}`);

    const { error } = await supabaseAdmin.from('guest_action_tokens').insert([
        {
            appointment_id: appointmentId,
            token: cancelToken,
            action: 'cancel',
            expires_at: expiresAt.toISOString(),
        },
        {
            appointment_id: appointmentId,
            token: rescheduleToken,
            action: 'reschedule',
            expires_at: expiresAt.toISOString(),
        },
    ]);

    if (error) {
        console.error('Failed to create guest action tokens:', error.message);
        throw new AppError('Failed to create action tokens.', 500);
    }

    return { cancelToken, rescheduleToken };
};

/**
 * Validate a guest action token and return the appointment info.
 * Used by the frontend pages /guest/cancel and /guest/reschedule.
 *
 * @param {string} token - The token from the email link
 * @param {string} expectedAction - 'cancel' or 'reschedule'
 * @returns {object} { valid, appointment }
 */
export const validateGuestActionToken = async (token, expectedAction) => {
    const { data: tokenRecord, error } = await supabaseAdmin
        .from('guest_action_tokens')
        .select(
            `
            *,
            appointment:appointments(
                id, appointment_date, start_time, end_time, status,
                guest_email, guest_name, guest_phone,
                guest_first_name, guest_last_name, guest_middle_name, guest_suffix,
                service:services(id, name, duration_minutes),
                dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))
            )
        `,
        )
        .eq('token', token)
        .eq('action', expectedAction)
        .single();

    if (error || !tokenRecord) {
        throw new AppError('Invalid or expired link.', 404);
    }

    // Check if already used
    if (tokenRecord.used_at) {
        throw new AppError('This link has already been used.', 410);
    }

    // Check if expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
        throw new AppError('This link has expired.', 410);
    }

    // Check appointment status
    if (tokenRecord.appointment?.status !== 'CONFIRMED') {
        throw new AppError(`Cannot ${expectedAction} — appointment is already ${tokenRecord.appointment?.status}.`, 400);
    }

    return {
        valid: true,
        token_id: tokenRecord.id,
        appointment: tokenRecord.appointment,
    };
};

/**
 * Mark a guest action token as used (one-time use).
 *
 * @param {string} tokenId - The token UUID
 */
export const markGuestTokenUsed = async (tokenId) => {
    await supabaseAdmin
        .from('guest_action_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenId);
};

/**
 * Send a waitlist offer email with a claim token.
 *
 * @param {string} email - Patient email
 * @param {string} name - Patient name
 * @param {object} details - { token, date, start_time, service, timeout_minutes }
 */
export const sendWaitlistOfferEmail = async (email, name, details) => {
    const { token, date, start_time, service, timeout_minutes } = details;

    const claimUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/email/waitlist-claim?token=${token}`;

    try {
        const html = getTemplate('waitlist-offer.html', {
            name,
            service: service || 'Dental Service',
            date,
            start_time,
            timeout_minutes,
            claimUrl,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: '⚡ Slot Available! (Priority Offer) — Samson Dental',
            html,
        });
        console.log(`📧 Waitlist offer email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send waitlist offer email:', err.message);
    }
};

/**
 * Send an account setup invitation email to a Stub patient.
 * 
 * @param {string} email - Patient email
 * @param {string} name - Patient name
 * @param {string} setupUrl - The secure link with setup token
 */
export const sendAccountSetupInviteEmail = async (email, name, setupUrl) => {
    try {
        const html = getTemplate('account-setup-invite.html', {
            name,
            setupUrl,
            expiryHours: 48
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental <noreply@samsondental.com>',
            to: email,
            subject: 'Finish setting up your Samson Dental account',
            html,
        });
        
        console.log(`📧 Account setup invite sent to ${email}`);
        return { success: true, result };
    } catch (err) {
        console.error('Failed to send account setup invite:', err.message);
        return { success: false, error: err.message };
    }
};
