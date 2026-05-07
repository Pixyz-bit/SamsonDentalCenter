import cron from 'node-cron';
import { autoDetectNoShows } from '../services/noshow.service.js';
import { sendReminder, send48hConfirmReminder } from '../services/notification.service.js';
import { sendSMS } from '../services/sms.service.js';
import {
    sendReminderIntervalEmail as sendPatientReminderEmail,
} from '../services/email-confirmation.service.js';
import { notifyWaitlist } from '../services/waitlist.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { WAITLIST_STATUS } from '../utils/constants.js';
import { SMS_TEMPLATES, validateSmsLength } from './sms-templates.js';

// 🧪 DEBUG MODE: Set to true to log emails instead of sending them
const DEBUG_MODE = process.env.DEBUG_SCHEDULED_TASKS === 'true';
if (DEBUG_MODE) {
    console.log('🧪 DEBUG MODE ENABLED - Emails will be logged instead of sent');
}

/**
 * Start all scheduled/cron tasks.
 *
 * Called from server.js after the server starts.
 */
export const startScheduledTasks = () => {
    // ── 1. No-show detection: every 15 min during clinic hours (8am-5pm, Mon-Sat) ──
    cron.schedule('*/15 8-17 * * 1-6', async () => {
        console.log('Running auto no-show detection (15-min grace period)...');
        try {
            const result = await autoDetectNoShows();
            console.log(`   OK ${result.message}`);
        } catch (err) {
            console.error('   Error in no-show detection:', err.message);
        }
    });


    // ── 2. 48h reminders: every day at 8:00 AM ──
    // Patients  -> in-app notification + plain reminder email (no links) + 48h SMS
    // Guests    -> reminder email with [Reschedule] [Cancel] action links + 48h SMS
    cron.schedule('0 8 * * *', async () => {
        console.log('Sending 48h reminders...');
        try {
            const now = new Date();
            const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
            
            const dayAfterTomorrow = new Date();
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            const dateStr = dayAfterTomorrow.toISOString().split('T')[0];

            const { data: appointments } = await supabaseAdmin
                .from('appointments')
                .select(
                    '*, service:services(id, name), dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))',
                )
                .eq('appointment_date', dateStr)
                .eq('status', 'CONFIRMED')
                .eq('reminder_48h_sent', false)
                .lt('confirmed_at', twelveHoursAgo.toISOString());

            const truncate = (str, len) => (str && str.length > len) ? str.substring(0, len - 3) + '...' : (str || '');
            const formatTime = (t) => t ? t.substring(0, 5) : '';

            for (const appt of appointments || []) {
                const dentistName = appt.dentist?.profile?.first_name ? `Dr. ${appt.dentist.profile.last_name}, ${appt.dentist.profile.first_name}` : (appt.dentist?.profile?.full_name || 'Assigned');
                const serviceNameTruncated = truncate(appt.service?.name, 25);
                const timePretty = formatTime(appt.start_time);

                if (appt.patient_id) {
                    // ── AUTHENTICATED PATIENT: in-app notification + plain email + SMS ──
                    await send48hConfirmReminder(appt.patient_id, {
                        id: appt.id,
                        date: appt.appointment_date,
                        start_time: appt.start_time,
                        service: appt.service?.name,
                    });

                    const { data: patient } = await supabaseAdmin
                        .from('profiles')
                        .select('email, phone, full_name, first_name, last_name, middle_name, suffix')
                        .eq('id', appt.patient_id)
                        .single();

                    if (patient?.email) {
                        const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
                        await sendPatientReminderEmail(patient.email, patientDisplayName, {
                            date: appt.appointment_date,
                            start_time: appt.start_time,
                            service: appt.service?.name,
                            dentist: dentistName,
                            hoursUntil: 48,
                        });
                    }

                    
                    if (patient?.phone) {
                        const smsMsg = SMS_TEMPLATES.REMINDER_48H(appt.appointment_date, timePretty, serviceNameTruncated);
                        await sendSMS(patient.phone, validateSmsLength(smsMsg));
                    }

                } else if (appt.guest_email || appt.guest_phone) {
                }

                // Mark reminder as sent
                await supabaseAdmin
                    .from('appointments')
                    .update({ reminder_48h_sent: true })
                    .eq('id', appt.id);
            }
            console.log(`   OK Sent ${appointments?.length || 0} 48h reminders.`);
        } catch (err) {
            console.error('   Error in 48h reminder:', err.message);
        }
    });

    // ── 3. 24h reminders: every day at 8:00 AM ──
    // Patients  -> in-app notification + plain reminder email + 24h SMS
    // Guests    -> reminder email + 24h SMS
    cron.schedule('0 8 * * *', async () => {
        console.log('Sending 24h reminders...');
        try {
            const now = new Date();
            const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const { data: appointments } = await supabaseAdmin
                .from('appointments')
                .select(
                    '*, service:services(id, name), dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))',
                )
                .eq('appointment_date', tomorrowStr)
                .eq('status', 'CONFIRMED')
                .lt('confirmed_at', twelveHoursAgo.toISOString());

            const truncate = (str, len) => (str && str.length > len) ? str.substring(0, len - 3) + '...' : (str || '');
            const formatTime = (t) => t ? t.substring(0, 5) : '';

            for (const appt of appointments || []) {
                const dentistName = appt.dentist?.profile?.first_name ? `Dr. ${appt.dentist.profile.last_name}, ${appt.dentist.profile.first_name}` : (appt.dentist?.profile?.full_name || 'Assigned');
                const serviceNameTruncated = truncate(appt.service?.name, 25);
                const timePretty = formatTime(appt.start_time);

                if (appt.patient_id) {
                    // ── AUTHENTICATED PATIENT: in-app notification + plain email + SMS ──
                    await sendReminder(
                        appt.patient_id,
                        {
                            date: appt.appointment_date,
                            start_time: appt.start_time,
                            service: appt.service?.name,
                        },
                        24,
                    );

                    const { data: patient } = await supabaseAdmin
                        .from('profiles')
                        .select('email, phone_number, full_name, first_name, last_name, middle_name, suffix')
                        .eq('id', appt.patient_id)
                        .single();

                    if (patient?.email) {
                        const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
                        await sendPatientReminderEmail(patient.email, patientDisplayName, {
                            date: appt.appointment_date,
                            start_time: appt.start_time,
                            service: appt.service?.name,
                            dentist: dentistName,
                            hoursUntil: 24,
                        });
                    }

                    /*
                    if (patient?.phone_number) {
                        const smsMsg = `Samson Dental Center: Friendly reminder of your ${serviceNameTruncated} appt tomorrow, ${appt.appointment_date} at ${timePretty}. See you soon!`;
                        await sendSMS(patient.phone_number, smsMsg);
                    }
                    */

                }
            }
            console.log(`   OK Sent ${appointments?.length || 0} 24h reminders.`);
        } catch (err) {
            console.error('   Error in 24h reminder:', err.message);
        }
    });



    // ── 4. Guest cleanup: every minute — cancel PENDING guests who did not confirm email ──
    cron.schedule('* * * * *', async () => {
        console.log('Cleaning up expired PENDING guest appointments...');
        try {
            const now = new Date().toISOString();

            const { data: expiredTokens } = await supabaseAdmin
                .from('appointment_confirmation_tokens')
                .select('appointment_id')
                .lt('expires_at', now);

            if (!expiredTokens || expiredTokens.length === 0) {
                console.log('   No expired pending appointments found.');
                return;
            }

            const expiredIds = expiredTokens.map((t) => t.appointment_id);

            const { data: cancelled } = await supabaseAdmin
                .from('appointments')
                .update({
                    status: 'CANCELLED',
                    cancellation_reason: 'Guest did not confirm via email within 15 minutes.',
                    cancelled_at: now,
                })
                .in('id', expiredIds)
                .eq('status', 'PENDING')
                .select('id');

            await supabaseAdmin
                .from('appointment_confirmation_tokens')
                .delete()
                .lt('expires_at', now);

            console.log(`   OK Cancelled ${cancelled?.length || 0} expired PENDING appointments.`);
        } catch (err) {
            console.error('   Error in guest cleanup:', err.message);
        }
    });

    // ── 5. 🔴 CRITICAL: Ghost Offer Sweep — every minute ──
    // FATAL FLAW FIX: If a patient ignores a waitlist offer, it gets stuck FOREVER unless we sweep.
    // This job finds all NOTIFIED entries that have passed their expires_at and cascades them.
    //
    // Scenario: Patient A gets notified, puts phone down, forgets to respond.
    // Without this sweep: Offer stays NOTIFIED forever, Patient B never gets notified (STUCK).
    // With this sweep: Every minute, we check for expired NOTIFIED entries and pass to next person.
    //
    // The fix is automatic and silent — no email to Patient A, just cascade to Patient B.
    cron.schedule('* * * * *', async () => {
        // Every minute
        try {
            const now = new Date().toISOString();

            // Find all NOTIFIED waitlist entries that have passed their expires_at
            const { data: ghostOffers, error } = await supabaseAdmin
                .from('waitlist')
                .select('*')
                .eq('status', WAITLIST_STATUS.NOTIFIED)
                .lt('expires_at', now);

            if (error) {
                console.error('   Error fetching ghost offers:', error.message);
                return;
            }

            if (!ghostOffers || ghostOffers.length === 0) {
                // Silently return — no offers to clean up
                return;
            }

            console.log(
                `👻 [GHOST OFFER SWEEP] Found ${ghostOffers.length} expired NOTIFIED offers. Cascading...`,
            );

            let cascaded = 0;
            let failed = 0;

            for (const ghostOffer of ghostOffers) {
                try {
                    // Mark this entry as EXPIRED
                    await supabaseAdmin
                        .from('waitlist')
                        .update({
                            status: WAITLIST_STATUS.EXPIRED,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', ghostOffer.id);

                    // Cascade to the next person in line
                    const cascadeResult = await notifyWaitlist({
                        date: ghostOffer.preferred_date,
                        start_time: ghostOffer.preferred_time,
                        service_id: ghostOffer.service_id,
                    });

                    if (cascadeResult.notified) {
                        cascaded++;
                        console.log(
                            `   ✅ Cascaded to next: ${ghostOffer.service_id} on ${ghostOffer.preferred_date} @ ${ghostOffer.preferred_time}`,
                        );
                    } else {
                        // Cascade succeeded but no one to notify (no more in waitlist)
                        console.log(
                            `   ℹ️ No one else in waitlist for ${ghostOffer.service_id} on ${ghostOffer.preferred_date}`,
                        );
                        cascaded++;
                    }
                } catch (err) {
                    failed++;
                    console.error(`   ❌ Failed to cascade ${ghostOffer.id}: ${err.message}`);
                }
            }

            console.log(`👻 [GHOST OFFER SWEEP] Complete: ${cascaded} cascaded, ${failed} failed.`);
        } catch (err) {
            console.error('   Error in ghost offer sweep:', err.message);
        }
    });

    console.log('Scheduled tasks started:');
    console.log('   No-show detection: every 15 min (clinic hours)');
    console.log(
        '   48h reminders: daily at 8am (patients: in-app + email | guests: email with links)',
    );
    console.log(
        '   24h reminders: daily at 8am (patients: in-app + email | guests: email with links)',
    );
    console.log('   Guest PENDING cleanup: every hour');
    console.log('   👻 Ghost Offer Sweep (CRITICAL): every minute');
};

/**
 * 🧪 TEST FUNCTION: Send 24h reminder email for an appointment immediately
 *
 * @param {string} appointmentId - The appointment UUID
 * @param {number} hours - Hours until appointment (default 24)
 * @returns {object} Result with success status and details
 */
export const testSend24hReminder = async (appointmentId, hours = 24) => {
    try {
        const { data: appointment, error } = await supabaseAdmin
            .from('appointments')
            .select('*, service:services(name), dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))')
            .eq('id', appointmentId)
            .single();

        if (error || !appointment) {
            throw new Error('Appointment not found');
        }

        if (appointment.status !== 'CONFIRMED') {
            throw new Error(`Appointment status is ${appointment.status}, must be CONFIRMED`);
        }

        if (!appointment.patient_id) {
            throw new Error('This is a guest appointment. Use testSendGuestReminder instead.');
        }

        // Fetch patient email
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('profiles')
            .select('email, phone, full_name, first_name, last_name, middle_name, suffix')
            .eq('id', appointment.patient_id)
            .single();

        if (patientError || !patient?.email) {
            throw new Error('Patient email not found');
        }

        const dentistName = appointment.dentist?.profile?.first_name ? `Dr. ${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name}` : (appointment.dentist?.profile?.full_name || 'Assigned');

        // Send the reminder
        const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
        await sendPatientReminderEmail(patient.email, patientDisplayName, {
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            service: appointment.service?.name || 'Dental appointment',
            dentist: dentistName,
            hoursUntil: hours,
        });

        // Send SMS if phone exists
        let smsResult = null;
        if (patient.phone) {
            const formatTime = (t) => t ? t.substring(0, 5) : '';
            const timePretty = formatTime(appointment.start_time);

            const smsMsg = hours === 48 
                ? SMS_TEMPLATES.REMINDER_48H(appointment.appointment_date, timePretty, appointment.service?.name || 'Dental appointment')
                : SMS_TEMPLATES.REMINDER_24H(appointment.appointment_date, timePretty, appointment.service?.name || 'Dental appointment');
            
            smsResult = await sendSMS(patient.phone, validateSmsLength(smsMsg));
        }

        return {
            success: true,
            message: `${hours}h reminder sent to ${patient.email}${smsResult?.success ? ' and SMS sent' : ''}`,
            details: {
                appointmentId,
                patientName: patientDisplayName,
                patientEmail: patient.email,
                patientPhone: patient.phone,
                smsResult,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.start_time,
                service: appointment.service?.name,
            },
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            appointmentId,
        };
    }
};

/**
 * 🧪 TEST FUNCTION: Send 48h reminder email for an appointment immediately
 *
 * @param {string} appointmentId - The appointment UUID
 * @returns {object} Result with success status and details
 */
export const testSend48hReminder = async (appointmentId) => {
    try {
        const { data: appointment, error } = await supabaseAdmin
            .from('appointments')
            .select('*, service:services(name), dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))')
            .eq('id', appointmentId)
            .single();

        if (error || !appointment) {
            throw new Error('Appointment not found');
        }

        if (appointment.status !== 'CONFIRMED') {
            throw new Error(`Appointment status is ${appointment.status}, must be CONFIRMED`);
        }

        if (!appointment.patient_id) {
            throw new Error('This is a guest appointment. Use testSendGuestReminder instead.');
        }

        // Fetch patient email
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name, first_name, last_name, middle_name, suffix')
            .eq('id', appointment.patient_id)
            .single();

        if (patientError || !patient?.email) {
            throw new Error('Patient email not found');
        }

        const dentistName = appointment.dentist?.profile?.first_name ? `Dr. ${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name}` : (appointment.dentist?.profile?.full_name || 'Assigned');

        // Send the reminder
        const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
        await sendPatientReminderEmail(patient.email, patientDisplayName, {
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            service: appointment.service?.name || 'Dental appointment',
            dentist: dentistName,
            hoursUntil: 48,
        });

        return {
            success: true,
            message: `48h reminder sent to ${patient.email}`,
            details: {
                appointmentId,
                patientName: patientDisplayName,
                patientEmail: patient.email,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.start_time,
                service: appointment.service?.name,
            },
        };
    } catch (err) {
        return {
            success: false,
            error: err.message,
            appointmentId,
        };
    }
};

