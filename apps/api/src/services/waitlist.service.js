import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import {
    WAITLIST_STATUS,
    APPOINTMENT_STATUS,
    CLINIC_CONFIG,
    APPOINTMENT_SOURCE,
} from '../utils/constants.js';
import { AppError } from '../utils/errors.js';
import { sendWaitlistOffer, sendApprovalNotice, sendNotification } from './notification.service.js';
import { sendWaitlistOfferEmail } from './email-confirmation.service.js';

/**
 * Add a patient to the waitlist.
 *
 * @param {string} patientId - Patient UUID
 * @param {string} serviceId - Service UUID
 * @param {string} date - Preferred date 'YYYY-MM-DD'
 * @param {string} time - Preferred time 'HH:MM' (optional)
 * @param {number} priority - 0 = normal, 1 = urgent
 */
export const joinWaitlist = async (
    patientId, 
    serviceId, 
    date, 
    time = null, 
    priority = 0, 
    bookedForNameParts = null, // { first, last, middle, suffix }
    preferred_dentist_id = null, 
    backup_appointment_id = null,
    patientProfileId = null, // ✅ NEW: Link to a saved patient profile
    bookedForBirthday = null,
    bookedForRelationship = null
) => {
    let finalBookedForBirthday = null;
    let finalBookedForRelationship = null;
    let bookedForName = null;
    let firstName = null;
    let lastName = null;
    let middleName = null;
    let suffix = null;

    if (patientProfileId) {
        // ── A. Fetch from saved patient profile (Late-Binding Stub) ──
        const { data: pProfile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', patientProfileId)
            .eq('primary_profile_id', patientId) // Ownership check
            .single();

        if (pProfile) {
            firstName = pProfile.first_name;
            lastName = pProfile.last_name;
            middleName = pProfile.middle_name;
            suffix = pProfile.suffix;
            finalBookedForBirthday = pProfile.date_of_birth;
            finalBookedForRelationship = pProfile.relationship_to_primary;
            bookedForName = pProfile.full_name || `${lastName}, ${firstName} ${middleName || ''} ${suffix || ''}`.replace(/\s+/g, ' ').trim();
        }
    } else {
        finalBookedForBirthday = bookedForBirthday;
        finalBookedForRelationship = bookedForRelationship;

        if (bookedForNameParts) {
            // ── B. Fallback to manual entry ──
            if (typeof bookedForNameParts === 'object') {
                firstName = bookedForNameParts.first;
                lastName = bookedForNameParts.last;
                middleName = bookedForNameParts.middle;
                suffix = bookedForNameParts.suffix;
                bookedForName = `${lastName}, ${firstName} ${middleName || ''} ${suffix || ''}`.replace(/\s+/g, ' ').trim();
            } else {
                bookedForName = bookedForNameParts;
            }
        }
    }

    // ── 0. Check if patient is restricted (Sync with booking policy) ──
    const { data: patient } = await supabaseAdmin
        .from('profiles')
        .select(
            'is_booking_restricted, restriction_until, max_advance_booking_days',
        )
        .eq('id', patientId)
        .single();

    if (patient?.is_booking_restricted) {
        // Check if restriction has expired
        if (patient.restriction_until && new Date(patient.restriction_until) < new Date()) {
            // Auto-unlock
            await supabaseAdmin
                .from('profiles')
                .update({ is_booking_restricted: false, restriction_reason: null })
                .eq('id', patientId);
        } else {
            // Check max advance booking days
            const maxDays = Math.max(patient.max_advance_booking_days || 0, CLINIC_CONFIG.NO_SHOW_RESTRICT_ADVANCE_DAYS);
            
            if (maxDays > 0) {
                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() + maxDays);
                if (new Date(date) > maxDate) {
                    throw new AppError(`Due to missed appointments, you can only join the waitlist up to ${maxDays} days in advance.`, 403);
                }
            }
        }
    }

    // ── 0.5. Check Global Active Limit (Anti-Hoarding) ──
    const { count: globalActiveCount } = await supabaseAdmin
        .from('waitlist')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', patientId)
        .in('status', [WAITLIST_STATUS.WAITING, WAITLIST_STATUS.NOTIFIED]);

    if ((globalActiveCount || 0) >= CLINIC_CONFIG.WAITLIST_GLOBAL_LIMIT) {
        throw new AppError(`You've reached the maximum limit of ${CLINIC_CONFIG.WAITLIST_GLOBAL_LIMIT} active waitlist requests. Please manage your existing entries in 'My Appointments'.`, 403);
    }

    // ── 1. Check Daily Service Cap (One entry per Service per Day) ──
    // FIX: Simplified to check only service_id and preferred_date.
    // This prevents a patient from joining multiple times for different hours on the same day.
    const { data: existing } = await supabaseAdmin
        .from('waitlist')
        .select('id')
        .eq('patient_id', patientId)
        .eq('service_id', serviceId)
        .eq('preferred_date', date)
        .eq('status', WAITLIST_STATUS.WAITING)
        .maybeSingle();

    if (existing) {
        throw new AppError(`You're already on the waitlist for this service on ${date}. To ensure fairness, we only allow one waitlist request per service per day.`, 400);
    }

    // ── 2. Add to waitlist ──
    const { data, error } = await supabaseAdmin
        .from('waitlist')
        .insert({
            patient_id: patientId,
            service_id: serviceId,
            preferred_date: date,
            preferred_time: time,
            preferred_dentist_id,
            backup_appointment_id,
            priority,
            status: WAITLIST_STATUS.WAITING,
            booked_for_name: bookedForName || null,
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName,
            suffix: suffix,
            patient_profile_id: patientProfileId, // ✅ Store the linked profile ID
            patient_birthday: finalBookedForBirthday,
            patient_relationship: finalBookedForRelationship,
        })
        .select(
            `
      *,
      service:services(name)
    `,
        )
        .single();

    if (error) throw new AppError(error.message, 500);

    // ── 3. Calculate queue position ──
    const { count } = await supabaseAdmin
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('preferred_date', date)
        .eq('service_id', serviceId)
        .eq('status', WAITLIST_STATUS.WAITING);

    // ── 4. In-app notification ──
    const serviceName = data.service?.name;
    const timeStr = time ? ` at ${time}` : '';
    const hasBackup = !!backup_appointment_id;

    await sendNotification(
        patientId,
        'WAITLIST',
        'Waitlist Request Received',
        hasBackup
            ? `We've added you to the waitlist for ${serviceName} on ${date}${timeStr}. You also have a Primary Appointment secured for your preferred slot.`
            : `We've added you to the waitlist for ${serviceName} on ${date}${timeStr}. We'll notify you if an earlier slot becomes available!`,
        'in_app',
        { service: serviceName, date, time, action: 'waitlist_joined', has_backup: hasBackup }
    );

    return {
        success: true,
        message: 'Added to waitlist',
        waitlist_entry: {
            id: data.id,
            service_id: data.service_id,
            service_name: data.service?.name,
            preferred_date: data.preferred_date,
            preferred_time: data.preferred_time,
            position: count,
            status: data.status,
            joined_at: data.created_at,
        },
    };
};

/**
 * Get a patient's waitlist entries.
 */
export const getMyWaitlist = async (patientId) => {
    const { data, error } = await supabaseAdmin
        .from('waitlist')
        .select(
            `
      *,
      service:services(name),
      backup_appointment:appointments!waitlist_backup_appointment_id_fkey(appointment_date, start_time, end_time)
    `,
        )
        .eq('patient_id', patientId)
        .in('status', [
            WAITLIST_STATUS.WAITING, 
            WAITLIST_STATUS.NOTIFIED,
            WAITLIST_STATUS.CANCELLED,
            WAITLIST_STATUS.EXPIRED,
            WAITLIST_STATUS.CONFIRMED
        ])
        .order('preferred_date')
        .order('created_at');

    if (error) throw new AppError(error.message, 500);

    // Calculate real-time position for each entry relative to EVERYONE in the queue
    const entriesWithPosition = await Promise.all(data.map(async (entry) => {
        let displayStatus = entry.status;
        if (entry.status === WAITLIST_STATUS.NOTIFIED) displayStatus = 'OFFER_PENDING';

        let position = null;
        
        // Only calculate position for WAITING entries
        if (entry.status === WAITLIST_STATUS.WAITING) {
            // Count entries ahead of this one:
            // 1. Higher priority
            // 2. Same priority but earlier created_at
            
            let query = supabaseAdmin
                .from('waitlist')
                .select('id', { count: 'exact', head: true })
                .eq('preferred_date', entry.preferred_date)
                .eq('service_id', entry.service_id)
                .eq('status', WAITLIST_STATUS.WAITING);

            if (entry.preferred_time) {
                query = query.eq('preferred_time', entry.preferred_time);
            } else {
                query = query.is('preferred_time', null);
            }

            const { count: aheadCount } = await query
                .or(`priority.gt.${entry.priority},and(priority.eq.${entry.priority},created_at.lt.${entry.created_at})`);

            position = (aheadCount || 0) + 1;
        } else if (entry.status === WAITLIST_STATUS.NOTIFIED) {
            position = 1; // If you have an offer, you are effectively #1
        }

        return {
            id: entry.id,
            service_id: entry.service_id,
            service_name: entry.service?.name,
            preferred_date: entry.preferred_date,
            preferred_time: entry.preferred_time,
            position,
            status: displayStatus,
            offer_expires_at: entry.expires_at,
            joined_at: entry.created_at,
            backup_appointment_id: entry.backup_appointment_id,
            backup_appointment: entry.backup_appointment,
        };
    }));

    return entriesWithPosition;
};

/**
 * Cancel a waitlist entry.
 *
 * @param {string} waitlistId
 * @param {string} patientId
 * @param {boolean} removeBackup - If true, also cancel the linked backup appointment
 */
export const cancelWaitlistEntry = async (waitlistId, patientId, removeBackup = false) => {
    // Fetch the entry first (to get backup_appointment_id)
    const { data: entry, error: fetchErr } = await supabaseAdmin
        .from('waitlist')
        .select('id, backup_appointment_id, status')
        .eq('id', waitlistId)
        .eq('patient_id', patientId)
        .single();

    if (fetchErr || !entry) {
        throw new AppError('Waitlist entry not found.', 404);
    }

    if (![WAITLIST_STATUS.WAITING, WAITLIST_STATUS.NOTIFIED].includes(entry.status)) {
        throw new AppError('Waitlist entry cannot be cancelled in its current state.', 400);
    }

    const { data, error } = await supabaseAdmin
        .from('waitlist')
        .update({
            status: WAITLIST_STATUS.CANCELLED,
            updated_at: new Date().toISOString(),
        })
        .eq('id', waitlistId)
        .select()
        .single();

    if (error || !data) {
        throw new AppError('Failed to cancel waitlist entry.', 500);
    }

    // ── In-app notification for manual cancellation ──
    const hasPrimary = !!entry.backup_appointment_id;
    await sendNotification(
        patientId,
        'WAITLIST',
        'Waitlist Request Cancelled',
        removeBackup && hasPrimary
            ? `You've been removed from the waitlist and your associated Primary Appointment has also been cancelled.`
            : `You've been removed from the waitlist as requested.`,
        'in_app',
        { waitlist_id: waitlistId, action: 'waitlist_cancelled', primary_cancelled: removeBackup && hasPrimary }
    );


    // If patient chose to also cancel the backup appointment
    if (removeBackup && entry.backup_appointment_id) {
        const { cancelAppointment } = await import('./appointment.service.js');
        try {
            await cancelAppointment(
                entry.backup_appointment_id,
                patientId,
                'Auto-cancelled: patient removed themself from the waitlist.',
                true, // sendEmail
                false, // removeWaitlist — already handling here
            );
            console.log(`🔗 [WAITLIST] Cascade-cancelled Primary Appointment ${entry.backup_appointment_id}`);
        } catch (err) {
            // Non-critical: if appointment is already cancelled or not found, don't fail
            console.warn(`⚠️ [WAITLIST] Could not cascade-cancel Primary Appointment: ${err.message}`);
        }
    }

    return {
        message: 'Removed from waitlist.',
        entry: data,
        backup_cancelled: removeBackup && !!entry.backup_appointment_id,
    };
};

/**
 * Void a waitlist entry because its backup appointment was approved.
 * Sends a specific in-app notification: "Your appointment is approved! We've removed you from the waitlist."
 *
 * @param {string} backupAppointmentId - The appointment UUID that was approved
 * @param {object} appointmentDetails - { date, start_time, end_time, service, patient_id }
 */
export const voidWaitlistForApprovedAppointment = async (backupAppointmentId, appointmentDetails) => {
    const { date, start_time, service, patient_id } = appointmentDetails;

    // Find all active waitlist entries linked to this appointment
    const { data: entries } = await supabaseAdmin
        .from('waitlist')
        .select('id, patient_id')
        .eq('backup_appointment_id', backupAppointmentId)
        .in('status', [WAITLIST_STATUS.WAITING, WAITLIST_STATUS.NOTIFIED]);

    if (!entries || entries.length === 0) return;

    // Mark them all as cancelled
    await supabaseAdmin
        .from('waitlist')
        .update({ status: WAITLIST_STATUS.CANCELLED, updated_at: new Date().toISOString() })
        .eq('backup_appointment_id', backupAppointmentId)
        .in('status', [WAITLIST_STATUS.WAITING, WAITLIST_STATUS.NOTIFIED]);

    // Send specific notification to each affected patient
    for (const entry of entries) {
        const notifyPatientId = entry.patient_id || patient_id;
        if (!notifyPatientId) continue;

        await sendNotification(
            notifyPatientId,
            'CONFIRMATION',
            'Primary Appointment Approved — Waitlist Removed',
            `Your Primary Appointment for ${service} on ${date} at ${start_time} is approved! We've automatically removed you from the waitlist for this slot.`,
            'in_app',
            { service, date, start_time, action: 'waitlist_voided_on_approval' }
        );

        console.log(`✅ [WAITLIST] Voided entry for patient ${notifyPatientId} — Primary Appointment approved.`);
    }
};

/**
 * When a slot opens up (e.g., cancellation), notify the first person in line.
 *
 * Called by: Module 08 cancel controller, or recursively when an offer expires.
 *
 * @param {object} freedSlot - { date, start_time, end_time, service_id }
 */
export const notifyWaitlist = async (freedSlot) => {
    const { date, start_time, service_id, dentist_id } = freedSlot;

    // ── 0. Normalize time format (HH:MM) to avoid database mismatch (HH:MM:SS) ──
    const normalizedTime = start_time?.substring(0, 5);

    // ── 1. Find waitlisted patients for this date, service, and (optionally) doctor ──
    console.log(`🔍 [WAITLIST] Searching for waitlisted patients for date: ${date}, time: ${normalizedTime}, service: ${service_id}, dentist: ${dentist_id || 'any'}`);

    let query = supabaseAdmin
        .from('waitlist')
        .select('*')
        .eq('preferred_date', date)
        .eq('service_id', service_id)
        .eq('status', WAITLIST_STATUS.WAITING)
        .or(`preferred_time.eq.${normalizedTime},preferred_time.is.null`);

    if (dentist_id) {
        query = query.or(`preferred_dentist_id.eq.${dentist_id},preferred_dentist_id.is.null`);
    } else {
        query = query.is('preferred_dentist_id', null);
    }

    const { data: waitlistEntries, error } = await query
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('❌ [WAITLIST] Search query error:', error);
    }

    console.log(`📋 [WAITLIST] Found ${waitlistEntries?.length || 0} matching entries.`);

    if (error || !waitlistEntries || waitlistEntries.length === 0) {
        return { notified: false, message: 'No one on waitlist for this slot.' };
    }

    // ── 1.5. 🔴 CHECK 3-HOUR NOTICE BUFFER ──
    // Don't notify waitlist if cancellation occurs less than 3 hours before appointment
    // This protects both patients (time to prepare) and clinic (prep time)
    const appointmentDateTime = new Date(`${date}T${start_time}`);
    const currentTime = new Date();
    const minutesUntilAppointment = Math.floor((appointmentDateTime - currentTime) / (1000 * 60));

    if (minutesUntilAppointment < CLINIC_CONFIG.WAITLIST_MIN_NOTICE_MINUTES) {
        console.log(
            `⏰ [WAITLIST] Insufficient notice for ${date} @ ${start_time}: ${minutesUntilAppointment}min < ${CLINIC_CONFIG.WAITLIST_MIN_NOTICE_MINUTES}min. NOT notifying waitlist.`,
        );
        return {
            notified: false,
            message: 'Cancellation too close to appointment time. Waitlist not notified.',
            minutesUntilAppointment,
            minimumRequired: CLINIC_CONFIG.WAITLIST_MIN_NOTICE_MINUTES,
            reason: 'insufficient_notice',
        };
    }

    // ── 2. Notify the first patient ──
    const firstInLine = waitlistEntries[0];

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + CLINIC_CONFIG.WAITLIST_TIMEOUT_MINUTES);

    const token = crypto.randomBytes(32).toString('hex');

    const { data: updated, error: updateError } = await supabaseAdmin
        .from('waitlist')
        .update({
            status: WAITLIST_STATUS.NOTIFIED,
            notified_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            preferred_time: start_time,
            claim_token: token,
            updated_at: new Date().toISOString(),
        })
        .eq('id', firstInLine.id)
        .select()
        .single();

    if (updateError) {
        console.error('❌ [WAITLIST] Failed to update waitlist entry:', updateError);
        return { notified: false, message: 'Database error during notification.' };
    }

    console.log(`✅ [WAITLIST] Notified patient ${firstInLine.patient_id} for ${date} @ ${start_time}`);

    // ── 3. Create a notification record ──
    const { data: service } = await supabaseAdmin
        .from('services')
        .select('name')
        .eq('id', service_id)
        .single();

    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, first_name, last_name, middle_name, suffix, email')
        .eq('id', firstInLine.patient_id)
        .single();

    // ── 3. Send Notifications (In-App + Email) ──
    await sendWaitlistOffer(firstInLine.patient_id, {
        date,
        start_time,
        service: service?.name,
        timeout_minutes: CLINIC_CONFIG.WAITLIST_TIMEOUT_MINUTES
    });

    if (profile?.email) {
        const displayName = profile.first_name 
            ? `${profile.first_name} ${profile.last_name}`.trim()
            : profile.full_name;

        await sendWaitlistOfferEmail(profile.email, displayName, {
            token: token,
            date,
            start_time,
            service: service?.name,
            timeout_minutes: CLINIC_CONFIG.WAITLIST_TIMEOUT_MINUTES
        });
    }

    return {
        notified: true,
        patient_id: firstInLine.patient_id,
        waitlist_id: firstInLine.id,
        expires_at: expiresAt.toISOString(),
        message: `Notified patient. They have ${CLINIC_CONFIG.WAITLIST_TIMEOUT_MINUTES} min to confirm.`,
    };
};

/**
 * Patient confirms a waitlist offer (books the freed slot).
 *
 * Handles:
 * - Expired offers → cascade to next person
 * - Swap logic → if patient already has CONFIRMED OR PENDING for same date+service, auto-cancel old
 *   * CONFIRMED: Auto-cancel + cascade (frees a slot for waitlist)
 *   * PENDING: Auto-cancel + NO cascade (specialized service awaiting approval)
 * - Cleanup → remove remaining WAITING entries for same patient+date+service
 *
 * 🔴 FIX FOR SPECIALIZED SERVICES:
 * User can accept waitlist BEFORE receptionist approves their PENDING appointment.
 * This logic ensures no duplicate appointments are created.
 */
export const confirmWaitlistOffer = async (waitlistId, patientId) => {
    // ── 1. Get the waitlist entry ──
    const { data: entry, error: fetchErr } = await supabaseAdmin
        .from('waitlist')
        .select('*, service:services(name)')
        .eq('id', waitlistId)
        .eq('patient_id', patientId)
        .eq('status', WAITLIST_STATUS.NOTIFIED)
        .single();

    if (fetchErr || !entry) {
        throw new AppError('Waitlist offer not found or already expired.', 404);
    }

    // ── 2. Check if the offer has expired ──
    if (new Date() > new Date(entry.expires_at)) {
        // Mark as expired
        await supabaseAdmin
            .from('waitlist')
            .update({ status: WAITLIST_STATUS.EXPIRED, updated_at: new Date().toISOString() })
            .eq('id', waitlistId);

        // ── CASCADE: Notify the next person in line ──
        // This is the key fix — expired offers don't just die, they pass to the next person.
        await notifyWaitlist({
            date: entry.preferred_date,
            start_time: entry.preferred_time,
            service_id: entry.service_id,
        });

        throw new AppError('This offer has expired. The slot has been offered to the next person in line.', 410);
    }

    // ── 3. SWAP LOGIC: Check if this waitlist was bundled with a backup appointment ──
    let existingAppointment = null;
    
    if (entry.backup_appointment_id) {
        const { data } = await supabaseAdmin
            .from('appointments')
            .select('id, start_time, appointment_date, status')
            .eq('id', entry.backup_appointment_id)
            .in('status', [APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.PENDING])
            .maybeSingle();
            
        existingAppointment = data;
    }

    // ── 4. ATTEMPT BOOKING FIRST (Atomicity check) ──
    const { bookAppointment, cancelAppointment } = await import('./appointment.service.js');

    // Normalize time to HH:MM (avoid database HH:MM:SS mismatch)
    const normalizedTime = entry.preferred_time?.substring(0, 5);

    console.log(`🎟️ [WAITLIST] Attempting to book slot for waitlist claim: ${entry.preferred_date} @ ${normalizedTime}`);

    const bookingResult = await bookAppointment(
        patientId,
        entry.service_id,
        entry.preferred_date,
        normalizedTime,
        true, // sendEmail
        entry.booked_for_name || null, // Pass the recorded name
        APPOINTMENT_SOURCE.WAITLIST, // ✅ NEW: Set source as WAITLIST
        null, // Preferred Dentist (not used in confirm)
        0,    // Reschedule Count
        null, // isPreferred
        entry.patient_profile_id,
        entry.patient_birthday,
        entry.patient_relationship
    );

    if (!bookingResult.booked) {
        console.warn(`❌ [WAITLIST] Booking failed during claim: ${bookingResult.message}`);
        throw new AppError(`Could not secure slot: ${bookingResult.message}. It may have been taken by someone else just now.`, 409);
    }

    // ── 5. SUCCESS: Handle Swap (Cancel old appointment) ──
    if (existingAppointment) {
        await cancelAppointment(
            existingAppointment.id,
            patientId,
            'Auto-cancelled: patient confirmed a waitlist offer for a different time',
        );

        console.log(`🔄 [WAITLIST] Swap complete: ${existingAppointment.start_time} → ${entry.preferred_time}`);
    }

    // ── In-app notification for successful claim ──
    await sendNotification(
        patientId,
        'WAITLIST',
        'Waitlist Slot Secured',
        `Success! You've claimed the earlier slot for ${entry.service?.name} on ${entry.preferred_date} at ${entry.preferred_time}. ${existingAppointment ? 'Your previous Primary Appointment has been cancelled.' : ''}`,
        'in_app',
        { waitlist_id: waitlistId, action: 'waitlist_claimed', date: entry.preferred_date, time: entry.preferred_time }
    );


    // ── 6. Mark waitlist entry as confirmed and CLAIMED ──
    await supabaseAdmin
        .from('waitlist')
        .update({
            status: WAITLIST_STATUS.CONFIRMED,
            is_claimed: true, // ✅ NEW: Track claim status
            claimed_appointment_id: bookingResult.appointment?.id, // ✅ NEW: Link the appointment
            updated_at: new Date().toISOString(),
        })
        .eq('id', waitlistId);

    // ── 7. CLEANUP: Remove other WAITING entries for same patient + date + service ──
    await supabaseAdmin
        .from('waitlist')
        .update({ status: WAITLIST_STATUS.CANCELLED, updated_at: new Date().toISOString() })
        .eq('patient_id', patientId)
        .eq('service_id', entry.service_id)
        .eq('preferred_date', entry.preferred_date)
        .eq('status', WAITLIST_STATUS.WAITING)
        .neq('id', waitlistId);

    return {
        confirmed: true,
        booked: true,
        appointment: bookingResult.appointment,
        message: existingAppointment
            ? 'Waitlist confirmed! Old appointment was auto-cancelled (swapped).'
            : 'Waitlist offer confirmed and appointment booked! ✨',
        swapped: !!existingAppointment,
        swapped_from: existingAppointment?.start_time || null,
    };
};

/**
 * Public: Get waitlist offer details using a claim token.
 */
export const getWaitlistByToken = async (token) => {
    const { data, error } = await supabaseAdmin
        .from('waitlist')
        .select(
            `
            *,
            service:services(name),
            backup_appointment:appointments!waitlist_backup_appointment_id_fkey(appointment_date, start_time, end_time)
        `,
        )
        .eq('claim_token', token)
        .eq('status', WAITLIST_STATUS.NOTIFIED)
        .single();

    if (error || !data) {
        throw new AppError('Waitlist offer not found or expired.', 404);
    }

    // Check if expired
    if (new Date() > new Date(data.expires_at)) {
        throw new AppError('This claim window has expired.', 410);
    }

    return {
        offer: {
            id: data.id,
            service: data.service?.name,
            date: data.preferred_date,
            displayTime: data.preferred_time,
            backup_appointment: data.backup_appointment,
        },
    };
};

/**
 * Public: Confirm waitlist offer using a claim token.
 */
export const confirmWaitlistByToken = async (token) => {
    // 1. Find the entry by token
    const { data: entry, error } = await supabaseAdmin
        .from('waitlist')
        .select('id, patient_id')
        .eq('claim_token', token)
        .eq('status', WAITLIST_STATUS.NOTIFIED)
        .single();

    if (error || !entry) {
        throw new AppError('Invalid or expired claim token.', 404);
    }

    // 2. Delegate to the main confirm service (reusing all swap/cleanup logic)
    return await confirmWaitlistOffer(entry.id, entry.patient_id);
};

/**
 * Get summary stats for a patient's waitlist.
 */
export const getWaitlistStats = async (patientId) => {
    const [waiting, offered, claimed] = await Promise.all([
        supabaseAdmin
            .from('waitlist')
            .select('id', { count: 'exact', head: true })
            .eq('patient_id', patientId)
            .eq('status', WAITLIST_STATUS.WAITING),
        supabaseAdmin
            .from('waitlist')
            .select('id', { count: 'exact', head: true })
            .eq('patient_id', patientId)
            .eq('status', WAITLIST_STATUS.NOTIFIED),
        supabaseAdmin
            .from('waitlist')
            .select('id', { count: 'exact', head: true })
            .eq('patient_id', patientId)
            .eq('is_claimed', true)
    ]);

    return {
        waiting: waiting.count || 0,
        offered: offered.count || 0,
        claimed: claimed.count || 0
    };
};
