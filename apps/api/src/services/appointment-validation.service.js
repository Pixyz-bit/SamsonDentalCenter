import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';

/**
 * Validates a guest booking request against business rules.
 * 
 * Rules:
 * 1. Volume Cap: Max 3 active (pending/confirmed) bookings per email.
 * 2. Service Lock: Cannot book the same service twice on the same day.
 * 3. Overlap Guard: Cannot have overlapping appointments on the same day.
 * 
 * @param {string} email - Guest email
 * @param {string} date - Appointment date 'YYYY-MM-DD'
 * @param {string} time - Start time 'HH:MM'
 * @param {string} serviceId - Service UUID
 * @param {number} duration - Service duration in minutes
 */
export const validateGuestBooking = async (email, date, time, serviceId, duration) => {
    const normalizedEmail = email.trim().toLowerCase();

    // ── 1. Volume Cap ──
    // Count active appointments (Pending or Confirmed) for this email
    const { count: activeCount, error: countError } = await supabaseAdmin
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('guest_email', normalizedEmail)
        .in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED]);

    if (countError) throw new AppError('Failed to validate booking limits.', 500);
    
    if (activeCount >= 3) {
        throw new AppError('For security, guest accounts are limited to 3 active bookings. Please contact the clinic if you need further assistance.', 403);
    }

    // ── 2. Service Lock ──
    // Check if the same service is already booked for this email on the same day
    const { data: sameService, error: serviceError } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('guest_email', normalizedEmail)
        .eq('appointment_date', date)
        .eq('service_id', serviceId)
        .in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED])
        .limit(1);

    if (serviceError) throw new AppError('Failed to validate service selection.', 500);

    if (sameService && sameService.length > 0) {
        throw new AppError('A booking for this treatment is already scheduled for this email on the selected date.', 409);
    }

    // ── 3. Overlap Guard ──
    // Calculate requested end time
    const [h, m] = time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + duration;
    
    const formatTimeFromMinutes = (mins) => {
        const hh = Math.floor(mins / 60).toString().padStart(2, '0');
        const mm = (mins % 60).toString().padStart(2, '0');
        return `${hh}:${mm}:00`;
    };

    const endTime = formatTimeFromMinutes(endMinutes);
    const startTimeStr = `${time}:00`;

    // Check for any overlapping appointments for this email on the same day
    // Overlap condition: (start1 < end2) AND (end1 > start2)
    const { data: overlaps, error: overlapError } = await supabaseAdmin
        .from('appointments')
        .select('id, start_time, end_time, service:services(name)')
        .eq('guest_email', normalizedEmail)
        .eq('appointment_date', date)
        .in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED])
        .lt('start_time', endTime)
        .gt('end_time', startTimeStr)
        .limit(1);

    if (overlapError) throw new AppError('Failed to validate schedule availability.', 500);

    if (overlaps && overlaps.length > 0) {
        const conflict = overlaps[0];
        throw new AppError(`This time overlaps with another booking (${conflict.service?.name}) scheduled for this email.`, 409);
    }

    return { valid: true };
};
