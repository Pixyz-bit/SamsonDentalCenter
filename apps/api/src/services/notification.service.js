import { AppError } from '../utils/errors.js';
import { supabaseAdmin } from '../config/supabase.js';
import { formatDateLong, formatTimePretty, formatDateTimeRange } from '../utils/time.js';
import { sendSMS } from './sms.service.js';

/**
 * Send a notification to a user.
 *
 * Saves to the notifications table (in-app). Ready to extend with email/SMS.
 *
 * @param {string} userId - User's profile UUID
 * @param {string} type - 'CONFIRMATION' | 'REMINDER' | 'CANCELLATION' | 'WAITLIST' | 'RESCHEDULE' | 'NO_SHOW' | 'RESTRICTION' | 'DELAY' | 'FOLLOW_UP' | 'GENERAL'
 * @param {string} title - Short title shown in notification bell
 * @param {string} message - Full message body
 * @param {string} channel - 'in_app' | 'email' | 'sms' (default: 'in_app')
 * @param {object} metadata - Optional structured data for frontend rendering
 */
export const sendNotification = async (
    userId,
    type,
    title,
    message,
    channel = 'in_app',
    metadata = null,
) => {
    // ── 0. Safety Check for In-App ──
    // Guests don't have user IDs and thus can't receive in-app notifications.
    if (channel === 'in_app' && !userId) {
        return null; // Skip silently
    }

    // ── 1. Save to Database (if userId exists) ──
    let data = null;
    if (userId) {
        const messageContent = metadata
            ? JSON.stringify({ ...metadata, _isJSON: true, _title: title, _fallback: message })
            : message;

        const { data: insertData, error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                channel,
                title,
                message: messageContent,
                sent_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to send notification record:', error.message);
            // We continue so SMS can still be attempted if applicable
        } else {
            data = insertData;
        }
    }

    // ── 2. External Channels (SMS/Email) ──
    let smsResult = null;
    if (channel === 'sms' && metadata?.phone) {
        const identifier = userId || 'Guest';
        console.log(`[Notification] Triggering SMS for ${identifier} to ${metadata.phone}`);
        smsResult = await sendSMS(metadata.phone, message);
    }

    return { ...data, smsResult };
};

// ─────────────────────────────────────────────
// Typed helpers — call these from other modules
// ─────────────────────────────────────────────

/**
 * Appointment confirmed notification.
 */
export const sendConfirmation = async (userId, appointmentDetails) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'CONFIRMATION',
        'Appointment Confirmed!',
        `The ${service} appointment for ${pName} has been confirmed for ${formattedRange}.`,
        'in_app',
        { service, date, start_time, end_time, patient_name: pName },
    );
};

/**
 * Appointment request received.
 */
export const sendRequestReceived = async (userId, appointmentDetails) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'GENERAL',
        'Request Received & Under Review',
        `We have received your request for a ${service} appointment for ${pName} on ${formattedRange}. Our team is currently reviewing the schedule to ensure a dentist is available. We will notify you as soon as your appointment is officially confirmed.`,
        'in_app',
        { service, date, start_time, end_time, status: 'review', patient_name: pName },
    );
};

/**
 * Appointment approved.
 */
export const sendApprovalNotice = async (userId, appointmentDetails, phone = null) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    const message = `Good news! Your ${service} appointment for ${pName} on ${formattedRange} has been approved. We look forward to seeing you at the clinic!`;

    // 1. In-App Notification
    const inAppResult = await sendNotification(
        userId,
        'CONFIRMATION',
        'Appointment Approved!',
        message,
        'in_app',
        { service, date, start_time, end_time, action: 'approved', patient_name: pName },
    );

    return { inAppResult, smsResult: null };
};

/**
 * Appointment rejected.
 */
export const sendRejectionNotice = async (userId, appointmentDetails, reason) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'CANCELLATION',
        'Appointment Declined',
        `Your request for a ${service} appointment for ${pName} on ${formattedRange} was declined. Reason: ${reason}. If you have questions, please contact our clinic.`,
        'in_app',
        { service, date, start_time, end_time, reason, action: 'rejected', patient_name: pName },
    );
};

/**
 * Appointment reminder (24h or 48h before).
 */
export const sendReminder = async (userId, appointmentDetails, hoursUntil) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'REMINDER',
        'Reminder: Upcoming Appointment',
        `Don't forget! ${pName} has a ${service} appointment scheduled for ${formattedRange}. Please arrive 15 minutes early.`,
        'in_app',
        { service, date, start_time, end_time, hoursUntil, action: 'reminder', patient_name: pName },
    );
};

/**
 * 48h confirmation reminder.
 */
export const send48hConfirmReminder = async (userId, appointmentDetails) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'REMINDER_48H',
        'Please Confirm Your Attendance',
        `This is a reminder for ${pName}'s ${service} appointment on ${formattedRange}. Please confirm your attendance through the portal or contact us if you need to reschedule.`,
        'in_app',
        { service, date, start_time, end_time, action: 'reminder_48h', patient_name: pName },
    );
};

/**
 * Waitlist offer notification.
 */
export const sendWaitlistOffer = async (userId, waitlistDetails) => {
    const { date, start_time, end_time, service, timeout_minutes, patient_name } = waitlistDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'WAITLIST',
        'Priority Slot Available!',
        `A slot has opened up on ${formattedRange} for ${service}. As you are on our waitlist, we are offering this to you first! You have ${timeout_minutes} minutes to claim this slot for ${pName} before it is offered to the next person.`,
        'in_app',
        { date, start_time, end_time, service, timeout_minutes, action: 'waitlist_offer', patient_name: pName },
    );
};

/**
 * Waitlist request received.
 */
export const sendWaitlistJoined = async (userId, waitlistDetails) => {
    const { date, start_time, service, patient_name, hasBackup } = waitlistDetails;
    const pName = patient_name || 'you';
    const timeStr = start_time ? ` at ${formatTimePretty(start_time)}` : '';
    const dateStr = formatDateLong(date);

    const message = hasBackup
        ? `We've added ${pName} to the waitlist for ${service} on ${dateStr}${timeStr}. You also have a Primary Appointment secured for your preferred slot.`
        : `We've added ${pName} to the waitlist for ${service} on ${dateStr}${timeStr}. We'll notify you if an earlier slot becomes available!`;

    return sendNotification(
        userId,
        'WAITLIST',
        'Waitlist Request Received',
        message,
        'in_app',
        { service, date, start_time, action: 'waitlist_joined', has_backup: hasBackup, patient_name: pName }
    );
};

/**
 * Waitlist entry cancelled.
 */
export const sendWaitlistCancelled = async (userId, waitlistDetails) => {
    const { patient_name, primary_cancelled } = waitlistDetails;
    const pName = patient_name || 'you';

    const message = primary_cancelled
        ? `You've been removed from the waitlist for ${pName} and the associated Primary Appointment has also been cancelled.`
        : `You've been removed from the waitlist for ${pName} as requested.`;

    return sendNotification(
        userId,
        'WAITLIST',
        'Waitlist Request Cancelled',
        message,
        'in_app',
        { action: 'waitlist_cancelled', primary_cancelled, patient_name: pName }
    );
};

/**
 * Waitlist offer claimed successfully.
 */
export const sendWaitlistClaimed = async (userId, waitlistDetails) => {
    const { date, start_time, service, patient_name, swapped } = waitlistDetails;
    const pName = patient_name || 'you';
    const timePretty = formatTimePretty(start_time);
    const dateStr = formatDateLong(date);

    const message = `Success! You've claimed the earlier slot for ${service} for ${pName} on ${dateStr} at ${timePretty}. ${swapped ? 'Your previous Primary Appointment has been cancelled.' : ''}`;

    return sendNotification(
        userId,
        'WAITLIST',
        'Waitlist Slot Secured',
        message,
        'in_app',
        { action: 'waitlist_claimed', date, time: start_time, patient_name: pName }
    );
};

/**
 * Waitlist voided on approval.
 */
export const sendWaitlistVoided = async (userId, waitlistDetails) => {
    const { date, start_time, service, patient_name } = waitlistDetails;
    const pName = patient_name || 'you';
    const timePretty = formatTimePretty(start_time);
    const dateStr = formatDateLong(date);

    return sendNotification(
        userId,
        'CONFIRMATION',
        'Primary Appointment Approved — Waitlist Removed',
        `The Primary Appointment for ${pName} for ${service} on ${dateStr} at ${timePretty} is approved! We've automatically removed you from the waitlist for this slot.`,
        'in_app',
        { service, date, start_time, action: 'waitlist_voided_on_approval', patient_name: pName }
    );
};

/**
 * Cancellation notification.
 */
export const sendCancellationNotice = async (userId, appointmentDetails, isRequest = false) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    const title = isRequest ? 'Appointment Request Cancelled' : 'Appointment Cancelled';
    const message = isRequest 
        ? `The request for a ${service} appointment for ${pName} on ${formattedRange} has been cancelled.`
        : `The ${service} appointment for ${pName} on ${formattedRange} has been cancelled. If this was not intentional, please contact the clinic immediately.`;

    return sendNotification(
        userId,
        'CANCELLATION',
        title,
        message,
        'in_app',
        { service, date, start_time, end_time, action: 'cancelled', patient_name: pName, is_request: isRequest },
    );
};

/**
 * No-show notification.
 */
export const sendNoShowNotice = async (userId, appointmentDetails) => {
    const { date, start_time, end_time, service, patient_name } = appointmentDetails;
    const formattedRange = formatDateTimeRange(date, start_time, end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'NO_SHOW',
        'Missed Appointment Notice',
        `${pName} was unable to attend the ${service} appointment on ${formattedRange}. We missed you! You can reschedule your visit through the dashboard or by calling us.`,
        'in_app',
        { date, start_time, end_time, service, action: 'no_show', patient_name: pName },
    );
};

/**
 * Restriction notification.
 */
export const sendRestrictionNotice = async (userId, restrictionDetails) => {
    const { noShowCount, maxAdvanceDays, patient_name } = restrictionDetails;
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'RESTRICTION',
        'Account Booking Restricted',
        `Due to ${noShowCount} missed appointments for ${pName}, your booking privileges have been restricted. For future visits, you can only book up to ${maxAdvanceDays} days in advance, and a security deposit may be required. Please contact our front desk to resolve this.`,
        'in_app',
        { noShowCount, maxAdvanceDays, action: 'restricted', patient_name: pName },
    );
};

/**
 * Delay notification.
 */
export const sendDelayNotification = async (userId, delayDetails) => {
    const { dentist_name, estimated_delay_minutes, original_time, service, date, patient_name } = delayDetails;
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'DELAY',
        'Appointment Delay Alert',
        `Dr. ${dentist_name} is currently running approximately ${estimated_delay_minutes} minutes behind schedule. The ${service || 'dental'} appointment for ${pName}, originally scheduled for ${original_time}${date ? ' on ' + formatDateLong(date) : ''}, may start late. We apologize for the inconvenience.`,
        'in_app',
        { dentist_name, estimated_delay_minutes, original_time, action: 'delay', patient_name: pName },
    );
};

/**
 * Follow-up visit reminder.
 */
export const sendFollowUpReminder = async (userId, followUpDetails) => {
    const { dentist_name, reason, recommended_date, service_name, patient_name } = followUpDetails;
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'FOLLOW_UP',
        'Recommended Follow-Up',
        `Following your recent visit, Dr. ${dentist_name} has recommended a follow-up ${service_name ? service_name + ' ' : ''}appointment for ${pName}${recommended_date ? ' around ' + formatDateLong(recommended_date) : ''}. Reason: ${reason}. You can book this through your portal at your convenience.`,
        'in_app',
        { dentist_name, reason, recommended_date, service_name, action: 'follow_up', patient_name: pName },
    );
};

/**
 * Appointment rescheduled notification.
 */
export const sendRescheduleNotice = async (userId, oldDetails, newDetails) => {
    const { service, patient_name } = oldDetails;
    const oldRange = formatDateTimeRange(oldDetails.date, oldDetails.start_time, oldDetails.end_time);
    const newRange = formatDateTimeRange(newDetails.date, newDetails.start_time, newDetails.end_time);
    const pName = patient_name || 'you';

    return sendNotification(
        userId,
        'RESCHEDULE',
        'Appointment Rescheduled',
        `The ${service} appointment for ${pName} has been rescheduled. It was moved from ${oldRange} to ${newRange}.`,
        'in_app',
        { service, oldDetails, newDetails, action: 'rescheduled', patient_name: pName },
    );
};

// ─────────────────────────────────────────────
// Read / manage notifications
// ─────────────────────────────────────────────

/**
 * Get all notifications for a user (paged).
 *
 * @param {string} userId
 * @param {boolean} unreadOnly - If true, return only unread notifications
 * @param {boolean} includeArchived - If true, include archived notifications
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Items per page
 */
export const getUserNotifications = async (
    userId,
    unreadOnly = false,
    includeArchived = false,
    page = 1,
    limit = 10,
) => {
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (unreadOnly) {
        query = query.eq('is_read', false);
    }

    if (!includeArchived) {
        query = query.eq('is_archived', false);
    }

    const { data, count, error } = await query;
    if (error) throw new AppError(error.message, 500);

    return { notifications: data, total: count };
};

/**
 * Toggle read status of a single notification.
 */
export const toggleNotificationRead = async (userId, notificationId) => {
    // 1. Fetch the notification to check current status
    const { data: notification, error: fetchError } = await supabaseAdmin
        .from('notifications')
        .select('is_read')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();

    if (fetchError || !notification) {
        throw new AppError('Notification not found', 404);
    }

    // 2. Toggle the read status
    const newReadStatus = !notification.is_read;
    const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({ is_read: newReadStatus })
        .eq('id', notificationId)
        .eq('user_id', userId);

    if (updateError) {
        throw new AppError('Failed to update notification status', 500);
    }

    return { id: notificationId, is_read: newReadStatus };
};

/**
 * Archive or unarchive a notification.
 */
export const toggleNotificationArchive = async (userId, notificationId) => {
    // 1. Fetch the notification to check current status
    const { data: notification, error: fetchError } = await supabaseAdmin
        .from('notifications')
        .select('is_archived')
        .eq('id', notificationId)
        .eq('user_id', userId)
        .single();

    if (fetchError || !notification) {
        throw new AppError('Notification not found', 404);
    }

    // 2. Toggle the archive status
    const newArchiveStatus = !notification.is_archived;
    const { error: updateError } = await supabaseAdmin
        .from('notifications')
        .update({ is_archived: newArchiveStatus })
        .eq('id', notificationId)
        .eq('user_id', userId);

    if (updateError) {
        throw new AppError('Failed to update notification status', 500);
    }

    return { id: notificationId, is_archived: newArchiveStatus };
};

/**
 * Get unread notification count — used for the bell badge in the UI.
 */
export const getUnreadCount = async (userId) => {
    const { count, error } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw new AppError(error.message, 500);

    return { unread_count: count };
};

/**
 * Toggle read status of a single notification (manual version).
 */
export const toggleRead = async (notificationId, userId, isRead) => {
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({
            is_read: isRead,
            read_at: isRead ? new Date().toISOString() : null,
        })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error || !data) {
        throw new AppError('Notification not found.', 404);
    }

    return data;
};

/**
 * Mark ALL unread notifications as read for a user.
 */
export const markAllAsRead = async (userId) => {
    const { error } = await supabaseAdmin
        .from('notifications')
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw new AppError(error.message, 500);

    return { message: 'All notifications marked as read.' };
};

/**
 * Toggle starred status.
 */
export const toggleStar = async (notificationId, userId, isStarred) => {
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({ is_starred: isStarred })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Toggle archived status (manual version).
 */
export const toggleArchive = async (notificationId, userId, isArchived) => {
    const updateData = { is_archived: isArchived };

    // If archiving, automatically unstar
    if (isArchived) {
        updateData.is_starred = false;
    }

    const { data, error } = await supabaseAdmin
        .from('notifications')
        .update(updateData)
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get notification stats for a user.
 */
export const getNotificationStats = async (userId) => {
    const [starred, unread, general, waitlist, cancellation] = await Promise.all([
        supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_starred', true)
            .eq('is_archived', false),
        supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)
            .eq('is_archived', false),
        supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_archived', false)
            .in('type', [
                'GENERAL',
                'CONFIRMATION',
                'REMINDER',
                'REMINDER_48H',
                'APPROVAL',
                'DELAY',
                'FOLLOW_UP',
                'RESCHEDULE',
                'RESTRICTION',
            ]),
        supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'WAITLIST')
            .eq('is_archived', false),
        supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_archived', false)
            .in('type', ['CANCELLATION', 'REJECTION', 'NO_SHOW']),
    ]);

    return {
        starred: starred.count || 0,
        unread: unread.count || 0,
        general: general.count || 0,
        waitlist: waitlist.count || 0,
        cancellation: cancellation.count || 0,
    };
};
