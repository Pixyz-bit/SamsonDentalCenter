import { AppError } from '../utils/errors.js';
import { supabaseAdmin } from '../config/supabase.js';
import { APPOINTMENT_STATUS, CLINIC_CONFIG } from '../utils/constants.js';
import { sendNoShowNotice, sendRestrictionNotice } from './notification.service.js';
import { sendMissedAppointmentEmail } from './email-confirmation.service.js';

/**
 * Mark an appointment as NO_SHOW and log it.
 *
 * @param {string} appointmentId - The appointment UUID
 * @returns {object} Updated appointment + restriction info
 */
export const markNoShow = async (appointmentId) => {
    // ── 1. Get the appointment ──
    const { data: appointment, error } = await supabaseAdmin
        .from('appointments')
        .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, first_name, last_name, email),
            service:services(name)
        `)
        .eq('id', appointmentId)
        .single();

    if (error || !appointment) {
        throw new AppError('Appointment not found.', 404);
    }

    if (
        appointment.status !== APPOINTMENT_STATUS.CONFIRMED &&
        appointment.status !== APPOINTMENT_STATUS.IN_PROGRESS
    ) {
        throw new AppError(`Cannot mark as no-show. Current status: ${appointment.status}. Must be CONFIRMED or IN_PROGRESS.`, 400);
    }

    // ── 2. Update status to NO_SHOW ──
    const { data: updated, error: updateError } = await supabaseAdmin
        .from('appointments')
        .update({
            status: APPOINTMENT_STATUS.NO_SHOW,
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (updateError) throw new AppError(updateError.message, 500);

    // ── 3. Log to no_show_log (for AI model later) ──
    const bookedDate = new Date(appointment.created_at);
    const apptDate = new Date(appointment.appointment_date);
    const daysInAdvance = Math.floor((apptDate - bookedDate) / (1000 * 60 * 60 * 24));

    await supabaseAdmin.from('no_show_log').insert({
        patient_id: appointment.patient_id,
        appointment_id: appointmentId,
        appointment_date: appointment.appointment_date,
        service_type: appointment.service_id,
        day_of_week: apptDate.getDay(),
        time_of_day: appointment.start_time,
        days_booked_in_advance: daysInAdvance,
    });

    // ── 4. Create in-app notification & Email for the patient ──
    const patientName = appointment.booked_for_name || (appointment.patient?.first_name ? `${appointment.patient.first_name} ${appointment.patient.last_name}` : appointment.patient?.full_name);
    
    await sendNoShowNotice(appointment.patient_id, {
        date: appointment.appointment_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        service: appointment.service?.name,
        patient_name: patientName
    });

    // Fetch patient profile for email and name
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', appointment.patient_id)
        .single();

    if (profile && profile.email) {
        await sendMissedAppointmentEmail(profile.email, profile.full_name, {
            appointmentId: appointment.id,
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            service: appointment.service_id, // Could fetch name if needed, but ID works for now
        });
    }

    // ── 5. Get patient's total no-show count ──
    const { count: noShowCount } = await supabaseAdmin
        .from('no_show_log')
        .select('*', { count: 'exact', head: true })
        .eq('patient_id', appointment.patient_id);

    // ── 6. Update patient's no_show_count in profiles ──
    await supabaseAdmin
        .from('profiles')
        .update({
            no_show_count: noShowCount,
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointment.patient_id);

    // ── 7. Apply restrictions if threshold reached (default: 3+ no-shows) ──
    const isRepeatOffender = noShowCount >= CLINIC_CONFIG.NO_SHOW_RESTRICT_THRESHOLD;

    if (isRepeatOffender) {
        await supabaseAdmin
            .from('profiles')
            .update({
                is_booking_restricted: true,
                max_advance_booking_days: CLINIC_CONFIG.NO_SHOW_RESTRICT_ADVANCE_DAYS,
                deposit_required: true,
                updated_at: new Date().toISOString(),
            })
            .eq('id', appointment.patient_id);

        // Notify patient about the restriction
        await sendRestrictionNotice(appointment.patient_id, {
            noShowCount,
            maxAdvanceDays: CLINIC_CONFIG.NO_SHOW_RESTRICT_ADVANCE_DAYS,
            patient_name: patientName
        });
    }

    return {
        message: 'Appointment marked as no-show.',
        appointment: {
            id: updated.id,
            date: updated.appointment_date,
            time: updated.start_time,
            status: updated.status,
        },
        patient_no_show_count: noShowCount,
        is_repeat_offender: isRepeatOffender,
        restrictions_applied: isRepeatOffender,
        suggestion: isRepeatOffender
            ? `Patient has ${noShowCount} no-shows. Booking restrictions have been applied.`
            : 'Patient has been notified to reschedule.',
    };
};

/**
 * Auto-detect no-shows: find CONFIRMED appointments past their end_time + grace period.
 *
 * Called by the cron job every 15 minutes during clinic hours.
 * Grace period comes from CLINIC_CONFIG.NO_SHOW_GRACE_MINUTES (default: 15 min).
 *
 * @returns {object} How many no-shows were detected and marked
 */
export const autoDetectNoShows = async () => {
    const graceMinutes = CLINIC_CONFIG.NO_SHOW_GRACE_MINUTES;
    const checkTime = new Date(Date.now() - graceMinutes * 60 * 1000);
    const today = checkTime.toISOString().split('T')[0];
    const currentTime = checkTime.toTimeString().split(' ')[0].slice(0, 5); // 'HH:MM'

    // Find CONFIRMED appointments whose end_time + grace period has passed
    const { data: overdueAppointments, error } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('status', APPOINTMENT_STATUS.CONFIRMED)
        .or(
            `appointment_date.lt.${today},and(appointment_date.eq.${today},end_time.lt.${currentTime})`,
        );

    if (error || !overdueAppointments || overdueAppointments.length === 0) {
        return { detected: 0, message: 'No overdue appointments found.' };
    }

    let marked = 0;
    for (const appt of overdueAppointments) {
        try {
            await markNoShow(appt.id);
            marked++;
        } catch (e) {
            console.error(`Failed to mark no-show for ${appt.id}:`, e.message);
        }
    }

    return {
        detected: overdueAppointments.length,
        marked,
        message: `Detected ${marked} no-show(s).`,
    };
};

/**
 * Get no-show history for a specific patient.
 * Used by admin dashboard and the AI predictor (Module AI).
 *
 * @param {string} patientId - The patient UUID
 */
export const getPatientNoShowHistory = async (patientId) => {
    const { data, error } = await supabaseAdmin
        .from('no_show_log')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    return {
        patient_id: patientId,
        total_no_shows: data.length,
        is_high_risk: data.length >= CLINIC_CONFIG.NO_SHOW_RESTRICT_THRESHOLD,
        history: data,
    };
};
