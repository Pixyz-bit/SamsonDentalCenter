import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { APPOINTMENT_STATUS, CLINIC_CONFIG } from '../utils/constants.js';
import { AppError } from '../utils/errors.js';
import { Resend } from 'resend';
import { logCommunication } from './message-log.service.js';
import { compileTemplate } from './email-template.service.js';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an OTP code to a guest for pre-booking verification.
 *
 * @param {string} email - Guest email
 * @param {string} name - Guest name
 * @param {string} otpCode - 6-digit code
 */
export const sendOTPEmail = async (email, name, otpCode) => {
    try {
        const { html, subject } = await compileTemplate('guest-otp', {
            name,
            otpCode,
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || `${otpCode} is your Samson Dental Center verification code`,
            html,
        });

        // Log to database
        await logCommunication({
            recipient: email,
            channel: 'email',
            purpose: 'OTP',
            status: 'sent',
            provider_id: result.data?.id
        });

        console.log(`📧 OTP email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send OTP email:', err.message);
        throw err;
    }
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
        const { html, subject } = await compileTemplate('booking-confirmed', {
            name,
            service,
            date,
            start_time,
            end_time,
            dentist,
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || '✅ Appointment Confirmed — Samson Dental Center',
            html,
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
        const { html, subject } = await compileTemplate('booking-request-received', {
            name,
            serviceName: service,
            appointmentDate: date,
            startTime: start_time,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || '📧 Booking Request Received — Samson Dental Center',
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

    const lateNotice = isLastMinute
        ? `<p style="color: #f59e0b; font-weight: bold;">
               ⚠️ This was a late cancellation (less than ${CLINIC_CONFIG.LATE_CANCELLATION_HOURS} hours notice).
               Frequent late cancellations may affect your future booking requests.
           </p>`
        : '';

    try {
        const { html, subject } = await compileTemplate('booking-cancelled', {
            name,
            service,
            date,
            start_time,
            lateNotice,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || (isLastMinute ? '⚠️ Late Cancellation — Samson Dental Center' : '❌ Appointment Cancelled — Samson Dental Center'),
            html,
        });
        console.log(`📧 Cancellation email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send cancellation email:', err.message);
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
        const { html, subject } = await compileTemplate('appointment-rescheduled', {
            name,
            service,
            oldDate,
            oldTime,
            newDate,
            newTime,
            dentist,
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || '🔄 Appointment Rescheduled — Samson Dental Center',
            html,
        });
        console.log(`📧 Reschedule email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send reschedule email:', err.message);
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
        const { html, subject } = await compileTemplate('account-setup-invite', {
            name,
            setupUrl,
            expiryHours: 48
        });

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || 'Finish setting up your Samson Dental Center account',
            html,
        });
        
        console.log(`📧 Account setup invite sent to ${email}`);
        return { success: true, result };
    } catch (err) {
        console.error('Failed to send account setup invite:', err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Send a "Booking Rejected" email.
 * 
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {object} details - { service, reason, suggestedDate }
 */
export const sendBookingRejectedEmail = async (email, name, details) => {
    const { service, reason, suggestedDate } = details;

    try {
        const { html, subject } = await compileTemplate('booking-rejected', {
            name,
            serviceName: service,
            reason,
            suggestedDate: suggestedDate || 'None suggested'
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || 'Update regarding your appointment request',
            html,
        });
        console.log(`📧 Rejection email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send rejection email:', err.message);
    }
};

/**
 * Send an "Appointment Displaced" email.
 * 
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {object} details - { service, date, start_time, reason }
 */
export const sendAppointmentDisplacedEmail = async (email, name, details) => {
    const { service, date, start_time, reason } = details;

    try {
        const { html, subject } = await compileTemplate('appointment-displaced', {
            name,
            serviceName: service,
            appointmentDate: date,
            startTime: start_time,
            reason: reason || 'Schedule change'
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || '⚠️ Important: Your appointment has been updated',
            html,
        });
        console.log(`📧 Displacement email sent to ${email}`);
    } catch (err) {
        console.error('Failed to send displacement email:', err.message);
    }
};

/**
 * Send a time-specific reminder (24h or 48h).
 * 
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {object} details - { service, date, start_time, interval } // interval: '24h' or '48h'
 */
export const sendReminderIntervalEmail = async (email, name, details) => {
    const { service, date, start_time, interval } = details;
    const key = `appointment-reminder-${interval}`;

    try {
        const { html, subject } = await compileTemplate(key, {
            name,
            serviceName: service,
            appointmentDate: date,
            startTime: start_time
        });

        await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Samson Dental Center <noreply@mail.chrbuilds.dev>',
            to: email,
            subject: subject || `⏰ Reminder: Your appointment is in ${interval}`,
            html,
        });
        console.log(`📧 ${interval} reminder email sent to ${email}`);
    } catch (err) {
        console.error(`Failed to send ${interval} reminder email:`, err.message);
    }
};
