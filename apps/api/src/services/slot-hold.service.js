import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/errors.js';
import { getAvailableSlots } from './slot.service.js';
import { assignDentist } from './dentist-assignment.service.js';
import { addMinutesToTime } from '../utils/time.js';

const HOLD_DURATION_MINUTES = 0.5; // Temporarily 30 seconds for testing

/**
 * Hold a time slot for a user (5-minute temporary reservation).
 *
 * AUTO-SWITCH BEHAVIOR: If the user already has an active hold for a
 * different time on the same date, the old hold is automatically released.
 *
 * @param {string} serviceId - Service UUID
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} startTime - 'HH:MM'
 * @param {string} userSessionId - Unique browser session ID
 * @param {string} [dentistId] - Optional dentist UUID
 * @returns {object} { hold_id, previous_hold_id, expires_at, expires_in_minutes, already_held }
 */
export const holdSlot = async (serviceId, date, startTime, userSessionId, dentistId = null) => {
    const now = new Date();

    // ✅ NEW: Check actual availability (includes doctor schedules, appointments, and OTHER people's holds)
    const availability = await getAvailableSlots(
        date,
        serviceId,
        userSessionId, // filterSessionId ensures we see availability EXCLUDING our own holds
        true,          // skipNextSearch
        dentistId      // optional dentist filter
    );

    const slotInfo = availability.all_slots.find(s => s.time === startTime);
    
    if (!slotInfo || slotInfo.available <= 0) {
        // Slot is either not in the list (closed) or full (held/booked by others)
        console.warn(`Hold attempt failed: Slot ${startTime} on ${date} is not available (available: ${slotInfo?.available || 0})`);
        throw new AppError('This time slot is no longer available.', 409);
    }

    // ── 1. Check if THIS USER already has ANY active hold ──
    const { data: existingHolds } = await supabaseAdmin
        .from('slot_holds')
        .select('id, start_time, appointment_date, expires_at')
        .eq('user_session_id', userSessionId)
        .eq('status', 'active')
        .gt('expires_at', now.toISOString());

    let previousHoldId = null;

    // ── 2. If they have a hold, handle it ──
    if (existingHolds && existingHolds.length > 0) {
        const oldHold = existingHolds[0];

        // If it's for the SAME EXACT SLOT, return existing
        if (oldHold.appointment_date === date && oldHold.start_time === startTime) {
            return {
                hold_id: oldHold.id,
                previous_hold_id: null,
                expires_at: oldHold.expires_at,
                expires_in_minutes: HOLD_DURATION_MINUTES,
                already_held: true,
            };
        }

        // Otherwise (different slot), release the old one to allow the new one
        previousHoldId = oldHold.id;
        await supabaseAdmin
            .from('slot_holds')
            .update({ status: 'released', updated_at: new Date().toISOString() })
            .eq('id', oldHold.id);

        console.log(`Auto-released previous hold ${oldHold.id} for session ${userSessionId}`);
    }

    // ── 3. Create new hold (with retry on dentist collision) ──
    const { data: service } = await supabaseAdmin
        .from('services')
        .select('tier, duration_minutes')
        .eq('id', serviceId)
        .single();
    if (!service) throw new AppError('Service not found.', 404);

    const endTime = addMinutesToTime(startTime, service.duration_minutes);
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MINUTES * 60 * 1000);
    const MAX_RETRIES = 3;
    let hold = null;
    let finalDentistId = dentistId || null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        // Pick a dentist if none provided (or if previous attempt collided)
        if (!finalDentistId) {
            finalDentistId = await assignDentist(date, startTime, endTime, service.tier, userSessionId, serviceId);
        }

        if (!finalDentistId) {
            throw new AppError('No dentist available to hold this slot.', 409);
        }

        const { data: insertedHold, error: insertError } = await supabaseAdmin
            .from('slot_holds')
            .insert({
                id: uuidv4(),
                service_id: serviceId,
                appointment_date: date,
                start_time: startTime,
                end_time: endTime,
                user_session_id: userSessionId,
                dentist_id: finalDentistId,
                held_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                status: 'active',
            })
            .select('id, expires_at, dentist_id')
            .single();

        if (!insertError) {
            hold = insertedHold;
            break;
        }

        // Unique constraint violation → another user just grabbed this dentist
        if (insertError.code === '23505' && !dentistId) {
            console.warn(`[Hold] Dentist ${finalDentistId} collision on attempt ${attempt}. Retrying...`);
            finalDentistId = null; // Reset so assignDentist picks a different one
            continue;
        }

        // Any other error is fatal
        console.error('Hold slot error:', insertError);
        throw new AppError('Failed to hold slot.', 500);
    }

    if (!hold) {
        throw new AppError('All available dentists are currently held. Please try a different time.', 409);
    }

    return {
        hold_id: hold.id,
        previous_hold_id: previousHoldId,
        expires_at: hold.expires_at,
        expires_in_minutes: HOLD_DURATION_MINUTES,
        already_held: false,
        dentist_id: hold.dentist_id,
    };
};

/**
 * Release a slot hold (mark as released).
 *
 * Called when:
 * - User completes booking successfully → convert hold to appointment
 * - User navigates away without booking → mark hold as released
 *
 * @param {string} holdId - The hold record UUID
 * @returns {object} { released: true/false, error? }
 */
export const releaseHold = async (holdId) => {
    const { error } = await supabaseAdmin
        .from('slot_holds')
        .update({ status: 'released', updated_at: new Date().toISOString() })
        .eq('id', holdId);

    if (error) {
        console.error('Release hold error:', error);
        // Don't throw — releasing a hold shouldn't fail
        return { released: false, error: error.message };
    }

    return { released: true };
};

/**
 * Release all active holds for a specific user session.
 *
 * @param {string} userSessionId - The browser session ID
 * @returns {object} { released: true, count: number }
 */
export const releaseHoldBySession = async (userSessionId) => {
    const { data, error } = await supabaseAdmin
        .from('slot_holds')
        .update({ status: 'released', updated_at: new Date().toISOString() })
        .eq('user_session_id', userSessionId)
        .eq('status', 'active');

    if (error) {
        console.error('Release holds by session error:', error);
        return { released: false, error: error.message };
    }

    return { released: true, count: data?.length || 0 };
};

/**
 * Cleanup expired holds (optional cron job).
 *
 * Run periodically (every 1-5 minutes) to mark expired holds as 'expired'.
 * This is for data cleanup; the actual availability check uses expires_at timestamp.
 *
 * @returns {object} { cleaned_up: number_of_records, error? }
 */
export const cleanupExpiredHolds = async () => {
    const now = new Date();

    const { data, error } = await supabaseAdmin
        .from('slot_holds')
        .update({ status: 'expired', updated_at: now.toISOString() })
        .eq('status', 'active')
        .lt('expires_at', now.toISOString())
        .select('id');

    if (error) {
        console.error('Cleanup expired holds error:', error);
        return { cleaned_up: 0, error: error.message };
    }

    return { cleaned_up: data?.length || 0 };
};

/**
 * Check if a session has an active hold.
 * 
 * @param {string} userSessionId 
 * @returns {object|null} The active hold or null
 */
export const getActiveHoldBySession = async (userSessionId) => {
    const now = new Date();
    const { data: existingHolds } = await supabaseAdmin
        .from('slot_holds')
        .select('id, start_time, appointment_date, expires_at, service_id, dentist_id')
        .eq('user_session_id', userSessionId)
        .eq('status', 'active')
        .gt('expires_at', now.toISOString())
        .order('created_at', { ascending: false });

    if (existingHolds && existingHolds.length > 0) {
        const hold = existingHolds[0];
        const expiresAt = new Date(hold.expires_at);
        const diffMs = expiresAt - now;
        const diffMins = Math.max(0, Math.ceil(diffMs / 60000));

        return {
            hold_id: hold.id,
            service_id: hold.service_id,
            date: hold.appointment_date,
            time: hold.start_time,
            expires_at: hold.expires_at,
            expires_in_minutes: diffMins,
            dentist_id: hold.dentist_id
        };
    }

    return null;
};
