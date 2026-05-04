import { AppError } from '../utils/errors.js';
import { supabaseAdmin } from '../config/supabase.js';
import { APPOINTMENT_STATUS } from '../utils/constants.js';
import { sendDelayNotification, sendFollowUpReminder } from './notification.service.js';

// ═══════════════════════════════════════════════
// SCHEDULE MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * Get today's schedule for a dentist.
 * Includes service tier info for two-tier awareness AND medical alerts.
 * 🚨 CRITICAL: Medical alerts (allergies, conditions) are shown for safety.
 */
export const getTodaySchedule = async (dentistId) => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(
            `
      *,
      patient:profiles!appointments_patient_id_fkey(id, full_name, first_name, last_name, middle_name, suffix, phone, no_show_count, is_booking_restricted, medical_alerts, allergies),
      service:services(name, duration_minutes, price, tier)
    `,
        )
        .eq('dentist_id', dentistId)
        .eq('appointment_date', today)
        .not('status', 'in', '("CANCELLED","LATE_CANCEL","RESCHEDULED","DISPLACED")')
        .order('start_time', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    return data.map((appt) => ({
        id: appt.id,
        start_time: appt.start_time,
        end_time: appt.end_time,
        status: appt.status,
        service_tier: appt.service_tier || appt.service?.tier || 'general',
        patient: {
            id: appt.patient?.id || null,
            name: (appt.patient?.first_name || appt.patient?.last_name)
                ? `${appt.patient.last_name || ''}, ${appt.patient.first_name || ''} ${appt.patient.middle_name || ''} ${appt.patient.suffix || ''}`.replace(/\s+/g, ' ').trim()
                : (appt.guest_name || 'Guest'),
            phone: appt.patient?.phone || appt.guest_phone,
            no_show_count: appt.patient?.no_show_count || 0,
            is_restricted: appt.patient?.is_booking_restricted || false,
            // 🚨 MEDICAL ALERTS - CRITICAL FOR SAFETY
            medical_alerts: appt.patient?.medical_alerts || null,
            allergies: appt.patient?.allergies || null,
        },
        service: appt.service?.name,
        duration: appt.service?.duration_minutes,
        is_walk_in: appt.is_walk_in,
        notes: appt.notes,
        booked_for_name: appt.booked_for_name,
    }));
};

/**
 * Get schedule for a date range (weekly view).
 */
export const getScheduleRange = async (dentistId, startDate, endDate) => {
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(
            `
      *,
      patient:profiles!appointments_patient_id_fkey(full_name, first_name, last_name, middle_name, suffix, no_show_count),
      service:services(name, duration_minutes, tier)
    `,
        )
        .eq('dentist_id', dentistId)
        .gte('appointment_date', startDate)
        .lte('appointment_date', endDate)
        .not('status', 'in', '("CANCELLED","LATE_CANCEL","RESCHEDULED","DISPLACED")')
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    return data.map((appt) => ({
        id: appt.id,
        date: appt.appointment_date,
        start_time: appt.start_time,
        end_time: appt.end_time,
        status: appt.status,
        service_tier: appt.service_tier || appt.service?.tier || 'general',
        patient: (appt.patient?.first_name || appt.patient?.last_name)
            ? `${appt.patient.last_name || ''}, ${appt.patient.first_name || ''} ${appt.patient.middle_name || ''} ${appt.patient.suffix || ''}`.replace(/\s+/g, ' ').trim()
            : (appt.guest_name || 'Guest'),
        service: appt.service?.name,
        duration: appt.service?.duration_minutes,
    }));
};

/**
 * Get the doctor's own working schedule (weekly template).
 */
export const getOwnSchedule = async (dentistId) => {
    const { data, error } = await supabaseAdmin
        .from('dentist_schedule')
        .select('*')
        .eq('dentist_id', dentistId)
        .order('day_of_week', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get the doctor's upcoming blocks (leave, sick days).
 */
export const getOwnBlocks = async (dentistId) => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .select('*')
        .eq('dentist_id', dentistId)
        .gte('block_date', today)
        .order('block_date', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Request a schedule block (doctor requests time off).
 * Note: Unlike admin blocks, this is a *request* — admin can see it.
 */
export const requestBlock = async (dentistId, blockDate, reason, notes = '') => {
    const { data: block, error } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .insert({
            dentist_id: dentistId,
            block_date: blockDate,
            reason,
            notes: notes || `Requested by doctor`,
            created_by: null, // Self-requested (no admin approval yet)
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return block;
};

// ═══════════════════════════════════════════════
// PATIENT CARE
// ═══════════════════════════════════════════════

/**
 * Add a treatment note for an appointment.
 */
export const addTreatmentNote = async (dentistId, appointmentId, noteData) => {
    // Verify this appointment belongs to this dentist
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('id, dentist_id, patient_id')
        .eq('id', appointmentId)
        .eq('dentist_id', dentistId)
        .single();

    if (!appt) {
        throw new AppError('Appointment not found or not assigned to you.', 404);
    }

    const { data: note, error } = await supabaseAdmin
        .from('treatment_notes')
        .insert({
            appointment_id: appointmentId,
            dentist_id: dentistId,
            patient_id: appt.patient_id,
            diagnosis: noteData.diagnosis,
            treatment_performed: noteData.treatment_performed,
            notes: noteData.notes || '',
            follow_up_recommended: noteData.follow_up_recommended || false,
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return note;
};

/**
 * Get treatment notes for a specific appointment.
 */
export const getTreatmentNotes = async (dentistId, appointmentId) => {
    const { data, error } = await supabaseAdmin
        .from('treatment_notes')
        .select('*')
        .eq('appointment_id', appointmentId)
        .eq('dentist_id', dentistId);

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get all treatment notes for a patient (patient history).
 * Doctors can see any patient's history (for continuity of care).
 * 🚨 INCLUDES MEDICAL ALERTS for comprehensive patient view.
 */
export const getPatientHistory = async (patientId) => {
    // First, get patient's medical info
    const { data: patientProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name, first_name, last_name, middle_name, suffix, medical_alerts, allergies')
        .eq('id', patientId)
        .single();

    // Then get all treatment notes
    const { data, error } = await supabaseAdmin
        .from('treatment_notes')
        .select(
            `
      *,
      appointment:appointments(appointment_date, start_time),
      dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))
    `,
        )
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    return {
        patient: {
            id: patientId,
            name: patientProfile?.first_name 
                ? `${patientProfile.last_name}, ${patientProfile.first_name} ${patientProfile.middle_name || ''} ${patientProfile.suffix || ''}`.replace(/\s+/g, ' ').trim()
                : (patientProfile?.full_name || 'Unknown'),
            // 🚨 MEDICAL INFO - DISPLAYED AT TOP OF HISTORY
            medical_alerts: patientProfile?.medical_alerts,
            allergies: patientProfile?.allergies,
        },
        treatment_history: data,
    };
};

// ═══════════════════════════════════════════════
// APPOINTMENT ACTIONS
// ═══════════════════════════════════════════════

/**
 * Mark appointment as IN_PROGRESS (seated/treatment started).
 * 🪑 OPERATIONAL: Allows real-time visibility on supervisor dashboard.
 * Doctor clicks this when patient sits in the chair.
 */
export const startAppointment = async (dentistId, appointmentId) => {
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({
            status: 'IN_PROGRESS',
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('dentist_id', dentistId)
        .eq('status', APPOINTMENT_STATUS.CONFIRMED)
        .select()
        .single();

    if (error || !data) {
        throw new AppError('Cannot start this appointment. It may not be CONFIRMED or not assigned to you.', 400);
    }

    return data;
};

/**
 * Mark appointment as COMPLETED (treatment finished).
 * Can transition from CONFIRMED or IN_PROGRESS to COMPLETED.
 */
export const completeAppointment = async (dentistId, appointmentId) => {
    // Verify appointment belongs to this dentist and is in valid state
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('id, dentist_id, status')
        .eq('id', appointmentId)
        .eq('dentist_id', dentistId)
        .single();

    if (!appt) {
        throw new AppError('Appointment not found or not assigned to you.', 404);
    }

    // Can complete from CONFIRMED or IN_PROGRESS
    if (
        appt.status !== APPOINTMENT_STATUS.CONFIRMED &&
        appt.status !== APPOINTMENT_STATUS.IN_PROGRESS
    ) {
        throw new AppError(`Cannot complete appointment. Current status: ${appt.status}. Must be CONFIRMED or IN_PROGRESS.`, 400);
    }

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .update({
            status: APPOINTMENT_STATUS.COMPLETED,
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Mark appointment as NO_SHOW (patient didn't arrive).
 * 👻 OPERATIONAL: Doctor can mark no-show instead of waiting for supervisor.
 * Reuses the unified logic from noshow.service.js to ensure notifications and logging.
 */
export const markAppointmentNoShow = async (dentistId, appointmentId, notes = '') => {
    // 1. Verify appointment belongs to this dentist
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('id, dentist_id')
        .eq('id', appointmentId)
        .eq('dentist_id', dentistId)
        .single();

    if (!appt) {
        throw new AppError('Appointment not found or not assigned to you.', 404);
    }

    // 2. Delegate to the unified service (includes notifications, log, and profile updates)
    const { markNoShow } = await import('./noshow.service.js');
    const result = await markNoShow(appointmentId);

    // 3. Append doctor's specific notes if provided
    if (notes) {
        await supabaseAdmin
            .from('appointments')
            .update({ notes: `NO_SHOW reported by doctor. ${notes}` })
            .eq('id', appointmentId);
    }

    return result;
};

/**
 * Update or add patient's medical alerts/allergies.
 * 🚨 SAFETY: Doctor can add/update critical medical info when patient arrives.
 * Example: Patient mentions latex allergy on the day of appointment.
 */
export const updatePatientMedicalInfo = async (dentistId, appointmentId, medicalUpdates) => {
    // Verify appointment belongs to this dentist
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('patient_id')
        .eq('id', appointmentId)
        .eq('dentist_id', dentistId)
        .single();

    if (!appt) {
        throw new AppError('Appointment not found or not assigned to you.', 404);
    }

    const patientId = appt.patient_id;

    // Get current medical info
    const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('medical_alerts, allergies')
        .eq('id', patientId)
        .single();

    // Merge new info with existing
    let updatedAlerts = currentProfile?.medical_alerts || '';
    let updatedAllergies = currentProfile?.allergies || '';

    if (medicalUpdates.medical_alerts) {
        // Append to existing alerts (don't overwrite)
        updatedAlerts = updatedAlerts
            ? `${updatedAlerts}\n${medicalUpdates.medical_alerts}`
            : medicalUpdates.medical_alerts;
    }

    if (medicalUpdates.allergies) {
        // Append to existing allergies
        updatedAllergies = updatedAllergies
            ? `${updatedAllergies}\n${medicalUpdates.allergies}`
            : medicalUpdates.allergies;
    }

    // Update patient profile
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
            medical_alerts: updatedAlerts,
            allergies: updatedAllergies,
            updated_at: new Date().toISOString(),
        })
        .eq('id', patientId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);

    return {
        message: 'Patient medical info updated.',
        patient_id: patientId,
        medical_alerts: data.medical_alerts,
        allergies: data.allergies,
    };
};

/**
 * Create a follow-up recommendation.
 */
export const createFollowUp = async (dentistId, followUpData) => {
    // Verify the appointment belongs to this dentist
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('id, dentist_id, patient_id')
        .eq('id', followUpData.appointment_id)
        .eq('dentist_id', dentistId)
        .single();

    if (!appt) {
        throw new AppError('Appointment not found or not assigned to you.', 404);
    }

    const { data: followUp, error } = await supabaseAdmin
        .from('follow_ups')
        .insert({
            appointment_id: followUpData.appointment_id,
            patient_id: appt.patient_id,
            dentist_id: dentistId,
            recommended_service_id: followUpData.recommended_service_id || null,
            recommended_date: followUpData.recommended_date || null,
            reason: followUpData.reason,
            urgency: followUpData.urgency || 'normal', // 'normal', 'soon', 'urgent'
        })
        .select(`
            *,
            service:services!recommended_service_id(name),
            dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))
        `)
        .single();

    if (error) throw new AppError(error.message, 500);

    // Notify patient about follow-up
    try {
        const dentistName = followUp.dentist?.profile?.first_name ? `${followUp.dentist.profile.last_name}, ${followUp.dentist.profile.first_name}` : followUp.dentist?.profile?.full_name;
        await sendFollowUpReminder(appt.patient_id, {
            ...followUp,
            dentist_name: dentistName,
            service_name: followUp.service?.name
        });
    } catch (e) {
        // Non-critical
    }

    return followUp;
};

/**
 * Report a delay to the patient.
 */
export const reportDelay = async (dentistId, appointmentId, delayMinutes, reason) => {
    // Verify appointment
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select(`
            id, dentist_id, patient_id, start_time, appointment_date,
            dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))
        `)
        .eq('id', appointmentId)
        .eq('dentist_id', dentistId)
        .eq('status', APPOINTMENT_STATUS.CONFIRMED)
        .single();

    if (!appt) {
        throw new AppError('Appointment not found or not in CONFIRMED status.', 404);
    }

    // Update appointment notes with delay info
    await supabaseAdmin
        .from('appointments')
        .update({
            notes: `DELAY: ${delayMinutes} min — ${reason || 'Running behind schedule'}`,
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

    // Notify the patient
    try {
        const dentistName = appt.dentist?.profile?.first_name ? `${appt.dentist.profile.last_name}, ${appt.dentist.profile.first_name}` : appt.dentist?.profile?.full_name;
        await sendDelayNotification(appt.patient_id, {
            appointment_id: appointmentId,
            estimated_delay_minutes: delayMinutes,
            reason: reason || 'Your dentist is running behind schedule.',
            original_time: appt.start_time,
            date: appt.appointment_date,
            dentist_name: dentistName
        });
    } catch (e) {
        // Non-critical
    }

    return {
        message: `Patient notified of ${delayMinutes}-minute delay.`,
        appointment_id: appointmentId,
    };
};

// ═══════════════════════════════════════════════
// CONTENT MANAGEMENT (Doctor Profile)
// ═══════════════════════════════════════════════

/**
 * Get the doctor's own profile info (for display on website).
 */
export const getDoctorProfile = async (dentistId) => {
    const { data, error } = await supabaseAdmin
        .from('dentists')
        .select(
            `
      *,
      profile:profiles(full_name, first_name, last_name, middle_name, suffix, email, phone)
    `,
        )
        .eq('id', dentistId)
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update the doctor's profile info (bio, specialization, photo).
 * This content appears on the website's "Our Doctors" section.
 *
 * @param {string} dentistId - Dentist UUID
 * @param {object} updates - { bio?, specialization?, photo_url?, license_number? }
 */
export const updateDoctorProfile = async (dentistId, updates) => {
    const allowedFields = ['bio', 'specialization', 'photo_url', 'license_number'];
    const safeUpdates = {};
    for (const key of allowedFields) {
        if (updates[key] !== undefined) {
            safeUpdates[key] = updates[key];
        }
    }

    const { data, error } = await supabaseAdmin
        .from('dentists')
        .update({ ...safeUpdates, updated_at: new Date().toISOString() })
        .eq('id', dentistId)
        .select(
            `
      *,
      profile:profiles(full_name, first_name, last_name, middle_name, suffix, email)
    `,
        )
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Request a schedule change (supervisor approves).
 */
export const requestScheduleChange = async (dentistId, requestData) => {
    const { data, error } = await supabaseAdmin
        .from('doctor_schedule_requests')
        .insert({
            dentist_id: dentistId,
            ...requestData,
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get doctor's schedule change requests.
 */
export const getScheduleRequests = async (dentistId) => {
    const { data, error } = await supabaseAdmin
        .from('doctor_schedule_requests')
        .select('*')
        .eq('dentist_id', dentistId)
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get doctor's feedback and ratings.
 */
export const getDoctorFeedback = async (dentistId) => {
    const { data, error } = await supabaseAdmin
        .from('patient_feedback')
        .select(
            `
      id, rating, comment, is_anonymous, created_at,
      patient:profiles(full_name, first_name, last_name, middle_name, suffix, id)
    `,
        )
        .eq('dentist_id', dentistId)
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    // Anonymize if needed
    return data.map((f) => ({
        ...f,
        patient: f.is_anonymous
            ? { name: 'Anonymous' }
            : { 
                name: f.patient?.first_name 
                    ? `${f.patient.last_name}, ${f.patient.first_name} ${f.patient.middle_name || ''} ${f.patient.suffix || ''}`.replace(/\s+/g, ' ').trim()
                    : (f.patient?.full_name || 'Patient'),
                id: f.patient?.id 
            },
    }));
};
