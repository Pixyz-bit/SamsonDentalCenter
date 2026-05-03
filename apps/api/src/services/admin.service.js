import { AppError } from '../utils/errors.js';
import { supabaseAdmin } from '../config/supabase.js';
import { assignDentist } from './dentist-assignment.service.js';
import { APPOINTMENT_STATUS, APPROVAL_STATUS, SERVICE_TIER } from '../utils/constants.js';
import { voidWaitlistForApprovedAppointment, notifyWaitlist } from './waitlist.service.js';
import { sendOTPEmail } from './email-confirmation.service.js';


// ═══════════════════════════════════════════════
// APPROVAL WORKFLOW (Two-Tier System)
// ═══════════════════════════════════════════════

/**
 * Get all pending specialized appointment requests.
 *
 * @returns {Array} List of pending requests with patient and service info
 */
export const getPendingRequests = async () => {
    // ── 1. Get Specialized Pending Requests ──
    // ── 2. Get Guest Bookings that have been Email Verified (patient_confirmed = true) ──
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(
            `
      *,
      patient:profiles!appointments_patient_id_fkey(id, full_name, email, phone, no_show_count, cancellation_count, is_booking_restricted),
      service:services(name, duration_minutes, price, tier),
      dentist:dentists(id, profile:profiles(full_name, first_name, last_name, middle_name, suffix))
    `,
        )
        // Show everything that is PENDING approval and has been confirmed by the patient (either logged in or via email)
        .eq('approval_status', APPROVAL_STATUS.PENDING)
        .eq('patient_confirmed', true)
        .eq('status', APPOINTMENT_STATUS.PENDING)
        .order('created_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

// ═══════════════════════════════════════════════
// REVENUE & PAYMENTS
// ═══════════════════════════════════════════════

/**
 * Record a payment for an appointment.
 *
 * @param {object} paymentData - { appointment_id, amount, payment_method, reference_number?, notes? }
 * @param {string} supervisorId - Supervisor UUID (who recorded payment)
 * @returns {object} Payment record
 */
export const recordPayment = async (paymentData, supervisorId) => {
    const { appointment_id, amount, payment_method, reference_number, notes } = paymentData;

    if (!appointment_id || !amount || !payment_method) {
        throw new AppError('appointment_id, amount, and payment_method are required.', 400);
    }

    // Verify appointment exists and get patient info
    const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .select('patient_id')
        .eq('id', appointment_id)
        .single();

    if (!appointment) {
        throw new AppError('Appointment not found.', 404);
    }

    // Record payment
    const { data, error } = await supabaseAdmin
        .from('payment_records')
        .insert({
            appointment_id,
            patient_id: appointment.patient_id,
            amount,
            payment_method,
            payment_status: 'paid',
            reference_number,
            notes,
            received_by: supervisorId,
            paid_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get payment details for an appointment.
 *
 * @param {string} appointmentId - Appointment UUID
 * @returns {object} Payment record or null
 */
export const getPaymentDetails = async (appointmentId) => {
    const { data, error } = await supabaseAdmin
        .from('payment_records')
        .select('*, received_by:profiles(full_name, first_name, last_name, middle_name, suffix)')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update a payment record (e.g., change status, amount).
 *
 * @param {string} paymentId - Payment UUID
 * @param {object} updates - { payment_status?, amount?, notes? }
 * @returns {object} Updated payment
 */
export const updatePayment = async (paymentId, updates) => {
    const { data, error } = await supabaseAdmin
        .from('payment_records')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

// ═══════════════════════════════════════════════
// PROMOTIONS & HOLIDAYS
// ═══════════════════════════════════════════════

/**
 * Get all active service promotions.
 *
 * @returns {Array} Promotions with service info
 */
export const getPromotions = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
        .from('service_promotions')
        .select('*, service:services(name, price)')
        .eq('is_active', true)
        .lte('starts_at', today)
        .gte('ends_at', today)
        .order('ends_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Create a service promotion.
 *
 * @param {object} promotionData - { service_id, name, discount_type, discount_value, starts_at, ends_at, min_age?, max_age? }
 * @param {string} createdBy - Supervisor UUID
 * @returns {object} Created promotion
 */
export const createPromotion = async (promotionData, createdBy) => {
    const {
        service_id,
        name,
        discount_type,
        discount_value,
        starts_at,
        ends_at,
        min_age,
        max_age,
    } = promotionData;

    if (!service_id || !name || !discount_type || !discount_value || !starts_at || !ends_at) {
        throw new AppError('service_id, name, discount_type, discount_value, starts_at, and ends_at are required.', 400);
    }

    const { data, error } = await supabaseAdmin
        .from('service_promotions')
        .insert({
            service_id,
            name,
            discount_type,
            discount_value,
            starts_at,
            ends_at,
            min_age: min_age || null,
            max_age: max_age || null,
            is_active: true,
            created_by: createdBy,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get all clinic holidays.
 *
 * @returns {Array} Holidays
 */
export const getHolidays = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
        .from('clinic_holidays')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Create a clinic holiday.
 *
 * @param {object} holidayData - { date, name, is_closed, special_open_time?, special_close_time? }
 * @param {string} createdBy - Supervisor UUID
 * @returns {object} Created holiday
 */
export const createHoliday = async (holidayData, createdBy) => {
    const { date, name, is_closed, special_open_time, special_close_time } = holidayData;

    if (!date || !name) {
        throw new AppError('date and name are required.', 400);
    }

    const { data, error } = await supabaseAdmin
        .from('clinic_holidays')
        .insert({
            date,
            name,
            is_closed: is_closed !== false, // Default to true
            special_open_time: special_open_time || null,
            special_close_time: special_close_time || null,
            created_by: createdBy,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

// ═══════════════════════════════════════════════
// PATIENT FEEDBACK & COMMENTS
// ═══════════════════════════════════════════════

/**
 * Get all patient feedback/ratings.
 *
 * @param {string|null} dentistId - Optional: filter by dentist
 * @returns {Array} Feedback with patient and dentist info
 */
export const getFeedback = async (dentistId = null) => {
    let query = supabaseAdmin
        .from('patient_feedback')
        .select(
            '*, appointment:appointments(appointment_date, service:services(name)), patient:profiles(full_name, first_name, last_name, middle_name, suffix), dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))',
        )
        .order('created_at', { ascending: false });

    if (dentistId) {
        query = query.eq('dentist_id', dentistId);
    }

    const { data, error } = await query.limit(100);

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get internal comments for an appointment.
 *
 * @param {string} appointmentId - Appointment UUID
 * @returns {Array} Comments with author info
 */
export const getAppointmentComments = async (appointmentId) => {
    const { data, error } = await supabaseAdmin
        .from('appointment_comments')
        .select('*, author:profiles(full_name, role)')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Add an internal comment to an appointment.
 *
 * @param {string} appointmentId - Appointment UUID
 * @param {string} comment - Comment text
 * @param {string} authorId - Staff member UUID
 * @returns {object} Created comment
 */
export const addAppointmentComment = async (appointmentId, comment, authorId) => {
    if (!comment || !comment.trim()) {
        throw new AppError('Comment text is required.', 400);
    }

    const { data, error } = await supabaseAdmin
        .from('appointment_comments')
        .insert({
            appointment_id: appointmentId,
            author_id: authorId,
            comment: comment.trim(),
            created_at: new Date().toISOString(),
        })
        .select('*, author:profiles(full_name, role)')
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

// ═══════════════════════════════════════════════
// DOCTOR SCHEDULE REQUESTS
// ═══════════════════════════════════════════════

/**
 * Get all doctor schedule change requests awaiting approval.
 *
 * @returns {Array} Schedule requests with doctor info
 */
export const getScheduleRequests = async () => {
    const { data, error } = await supabaseAdmin
        .from('doctor_schedule_requests')
        .select('*, dentist:dentists(profile:profiles(full_name, email))')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Approve a doctor schedule request.
 *
 * @param {string} requestId - Request UUID
 * @param {string} supervisorId - Supervisor UUID
 * @returns {object} Updated request
 */
export const approveScheduleRequest = async (requestId, supervisorId) => {
    const { data, error } = await supabaseAdmin
        .from('doctor_schedule_requests')
        .update({
            status: 'approved',
            approved_by: supervisorId,
            approved_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Reject a doctor schedule request.
 *
 * @param {string} requestId - Request UUID
 * @param {string} supervisorId - Supervisor UUID
 * @param {string} reason - Rejection reason
 * @returns {object} Updated request
 */
export const rejectScheduleRequest = async (requestId, supervisorId, reason) => {
    const { data, error } = await supabaseAdmin
        .from('doctor_schedule_requests')
        .update({
            status: 'rejected',
            rejection_reason: reason,
            rejected_by: supervisorId,
            rejected_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

// ═══════════════════════════════════════════════
// USER MANAGEMENT (ADMIN ONLY)
// ═══════════════════════════════════════════════

/**
 * Get all system users with their roles.
 *
 * @returns {Array} Users with roles and activity
 */
export const getAllUsers = async () => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Create a new system user (Staff Onboarding).
 * Uses Supabase Invitation to create auth user and trigger profile creation.
 *
 * @param {object} userData - { email, full_name, phone, role }
 * @returns {object} Created user/invitation info
 */
export const createSystemUser = async (userData) => {
    const { email, full_name, phone, role } = userData;

    if (!email || !full_name || !role) {
        throw new AppError('email, full_name, and role are required.', 400);
    }

    if (!['admin', 'secretary', 'receptionist'].includes(role)) {
        throw new AppError('Invalid system role. Use specific onboarding for doctors/patients.', 400);
    }

    // 1. Check if profile already exists (to prevent duplicate auth invites)
    const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id, is_registered')
        .eq('email', email)
        .maybeSingle();

    if (existing) {
        if (existing.is_registered) {
            throw new AppError('A registered user with this email already exists.', 409);
        }
        // If it's a stub, we might want to promote it? 
        // For now, let's keep it strict: System accounts must have unique emails.
        throw new AppError('Email already in use by a patient record.', 409);
    }

    // 2. Metadata for the trigger (handle_new_user)
    const metadata = {
        full_name,
        phone: phone || '',
        role
    };

    // 3. Dispatch Invitation
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:5174';
    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
            data: metadata,
            redirectTo: `${adminUrl}/set-password`
        }
    );

    if (inviteErr) {
        throw new AppError(`Invitation failed: ${inviteErr.message}`, 500);
    }

    return {
        user: inviteData.user,
        message: 'Staff invitation sent successfully.'
    };
};


/**
 * Change a user's role.
 *
 * @param {string} userId - User UUID
 * @param {string} newRole - New role
 * @returns {object} Updated user
 */
export const changeUserRole = async (userId, newRole) => {
    if (!['admin', 'supervisor', 'dentist', 'patient'].includes(newRole)) {
        throw new AppError('Invalid role.', 400);
    }

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
            role: newRole,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Deactivate a user account.
 *
 * @param {string} userId - User UUID
 * @returns {object} Updated user
 */
export const deactivateUser = async (userId) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
            is_active: false,
            deactivated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get system health info (database connection, uptime).
 *
 * @returns {object} Health status
 */
export const getSystemHealth = async () => {
    const startTime = Date.now();

    try {
        // Test DB connection
        const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);

        if (error) {
            return {
                status: 'error',
                message: 'Database connection failed',
                timestamp: new Date().toISOString(),
            };
        }

        return {
            status: 'ok',
            message: 'System operational',
            database: 'connected',
            response_time_ms: Date.now() - startTime,
            timestamp: new Date().toISOString(),
        };
    } catch (err) {
        return {
            status: 'error',
            message: err.message,
            timestamp: new Date().toISOString(),
        };
    }
};

/**
 * Approve a specialized appointment request.
 *
 * @param {string} appointmentId - The appointment UUID
 * @param {string} supervisorId - The supervisor's profile UUID (for audit)
 * @param {string|null} dentistId - Optional: manually pick a dentist. NULL = auto-assign.
 * @returns {object} Updated appointment
 */
export const approveRequest = async (appointmentId, supervisorId, dentistId = null) => {
    // ── 1. Get the appointment ──
    const { data: appointment, error: fetchErr } = await supabaseAdmin
        .from('appointments')
        .select('*, service:services(duration_minutes, tier)')
        .eq('id', appointmentId)
        .single();

    if (fetchErr || !appointment) {
        throw { status: 404, message: 'Appointment not found.' };
    }

    if (appointment.approval_status !== APPROVAL_STATUS.PENDING) {
        throw {
            status: 400,
            message: `This request has already been ${appointment.approval_status}.`,
        };
    }

    // ── 2. Assign dentist (auto or manual) ──
    let assignedDentistId = dentistId || appointment.dentist_id;

    if (!assignedDentistId) {
        // Auto-assign from the same tier as the service
        assignedDentistId = await assignDentist(
            appointment.appointment_date,
            appointment.start_time,
            appointment.end_time,
            appointment.service?.tier || SERVICE_TIER.GENERAL,
            null, // filterSessionId
            appointment.service_id
        );

        if (!assignedDentistId) {
            throw new AppError('No specialized dentist available for this date/time. Please suggest a different schedule.', 409);
        }
    } else {
        // Verify the manually selected (or pre-assigned) dentist exists
        const { data: dentist } = await supabaseAdmin
            .from('dentists')
            .select('id, tier')
            .eq('id', assignedDentistId)
            .eq('is_active', true)
            .single();

        if (!dentist) {
            throw new AppError('Selected dentist not found or inactive.', 404);
        }

        const requiredTier = appointment.service?.tier || 'general';
        if (dentist.tier !== requiredTier && dentist.tier !== 'both') {
            throw new AppError(`Selected dentist is not qualified for ${requiredTier} services.`, 400);
        }
        // ── CHECK FOR TIME CONFLICT ──
        // Make sure this dentist isn't already booked for this time slot
        const { data: conflict, error: conflictErr } = await supabaseAdmin
            .from('appointments')
            .select('id, status')
            .eq('dentist_id', assignedDentistId)
            .eq('appointment_date', appointment.appointment_date)
            .lt('start_time', appointment.end_time)
            .gt('end_time', appointment.start_time)
            .neq('id', appointmentId) // EXCLUDE SELF
            .neq('status', APPOINTMENT_STATUS.CANCELLED)
            .maybeSingle();

        if (conflictErr && conflictErr.code !== 'PGRST116') {
            throw new AppError(conflictErr.message, 500);
        }

        if (conflict) {
            throw new AppError(`Selected dentist is already booked at ${appointment.start_time} on ${appointment.appointment_date}.`, 409);
        }

        // ── CHECK FOR AVAILABILITY BLOCKS ──
        const { data: blocks, error: blockErr } = await supabaseAdmin
            .from('dentist_availability_blocks')
            .select('start_time, end_time')
            .eq('dentist_id', assignedDentistId)
            .eq('block_date', appointment.appointment_date);

        if (blockErr) throw new AppError(blockErr.message, 500);

        const startTime = appointment.start_time.slice(0, 5);
        const endTime = appointment.end_time.slice(0, 5);

        const hasBlockConflict = (blocks || []).some(b => {
            const bStart = (b.start_time || '00:00').slice(0, 5);
            const bEnd = (b.end_time || '23:59').slice(0, 5);
            return startTime < bEnd && bStart < endTime;
        });

        if (hasBlockConflict) {
            throw new AppError(`Selected dentist has an availability block during this time (${appointment.start_time} - ${appointment.end_time}).`, 409);
        }
    }

    // ── 3. Update the appointment ──
    const { data: updated, error: updateErr } = await supabaseAdmin
        .from('appointments')
        .update({
            dentist_id: assignedDentistId,
            status: APPOINTMENT_STATUS.CONFIRMED,
            approval_status: APPROVAL_STATUS.APPROVED,
            approved_by: supervisorId,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select(`
            *,
            patient:profiles!appointments_patient_id_fkey(full_name, email, phone),
            service:services(name, price),
            dentist:dentists(id, profile:profiles(full_name, first_name, last_name, middle_name, suffix))
        `)
        .single();

    if (updateErr) throw { status: 500, message: updateErr.message };

    // ── 4. VOID linked waitlist entries ──
    // If this appointment was a "Primary" for a waitlist entry, void those entries now.
    try {
        await voidWaitlistForApprovedAppointment(appointmentId, {
            date: updated.appointment_date,
            start_time: updated.start_time,
            service: updated.service?.name,
            patient_id: updated.patient_id,
        });
    } catch (err) {
        // Non-critical — don't fail the approval
        console.warn(`⚠️ [ADMIN] Failed to void linked waitlist entries: ${err.message}`);
    }

    return updated;
};

/**
 * Reject a specialized appointment request.
 *
 * @param {string} appointmentId - The appointment UUID
 * @param {string} supervisorId - The supervisor's profile UUID
 * @param {string} reason - Why it was rejected
 * @param {string|null} suggestedDate - Optional alternative date suggestion
 * @returns {object} Updated appointment
 */
export const rejectRequest = async (appointmentId, supervisorId, reason, suggestedDate = null) => {
    const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .select('id, approval_status')
        .eq('id', appointmentId)
        .single();

    if (!appointment) {
        throw new AppError('Appointment not found.', 404);
    }

    if (appointment.approval_status !== APPROVAL_STATUS.PENDING) {
        throw {
            status: 400,
            message: `This request has already been ${appointment.approval_status}.`,
        };
    }

    const rejectionNote = suggestedDate
        ? `${reason} — Suggested alternative: ${suggestedDate} `
        : reason;

    const { data: updated, error } = await supabaseAdmin
        .from('appointments')
        .update({
            approval_status: APPROVAL_STATUS.REJECTED,
            rejection_reason: rejectionNote,
            approved_by: supervisorId, // Tracks who made the decision
            approved_at: new Date().toISOString(),
            status: APPOINTMENT_STATUS.CANCELLED, // Rejected = effectively cancelled
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select(
            `
        *,
        patient: profiles!appointments_patient_id_fkey(full_name, email),
            service: services(name)
                `,
        )
        .single();

    if (error) throw new AppError(error.message, 500);

    // ── Trigger waitlist notification ──
    try {
        await notifyWaitlist({
            date: updated.appointment_date,
            start_time: updated.start_time,
            end_time: updated.end_time,
            service_id: updated.service_id,
        });
    } catch (e) {
        console.warn('⚠️ [ADMIN] Failed to trigger waitlist on rejection:', e.message);
    }

    return { appointment: updated, suggested_date: suggestedDate };
};

// ═══════════════════════════════════════════════
// CONTENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * Get clinic settings (hours, contact info, about page).
 */
export const getClinicSettings = async () => {
    const { data, error } = await supabaseAdmin.from('clinic_settings').select('*').single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update clinic settings.
 *
 * @param {object} updates - { clinic_name?, address?, phone?, email?, opening_hour?,
 *                             closing_hour?, about_text?, announcement? }
 */
export const updateClinicSettings = async (updates) => {
    const { data, error } = await supabaseAdmin
        .from('clinic_settings')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', updates.id || 1) // Single-row settings table
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get all announcements (for website banner/notifications).
 */
export const getAnnouncements = async () => {
    const { data, error } = await supabaseAdmin
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Create a new announcement.
 *
 * @param {object} announcement - { title, message, type, is_active, starts_at?, ends_at? }
 */
export const createAnnouncement = async (announcement, createdBy) => {
    const { data, error } = await supabaseAdmin
        .from('announcements')
        .insert({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type || 'info', // 'info', 'warning', 'urgent'
            is_active: announcement.is_active !== false,
            starts_at: announcement.starts_at || null,
            ends_at: announcement.ends_at || null,
            created_by: createdBy,
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update an announcement.
 */
export const updateAnnouncement = async (id, updates) => {
    const { data, error } = await supabaseAdmin
        .from('announcements')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Delete an announcement.
 */
export const deleteAnnouncement = async (id) => {
    const { error } = await supabaseAdmin.from('announcements').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);
};

// ═══════════════════════════════════════════════
// SCHEDULE MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * Get a dentist's weekly schedule.
 *
 * @param {string} dentistId - Dentist UUID
 * @returns {Array} Schedule entries for each day of the week
 */
export const getDentistSchedule = async (dentistId) => {
    const { data, error } = await supabaseAdmin
        .from('dentist_schedule')
        .select('*')
        .eq('dentist_id', dentistId)
        .order('day_of_week', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get a dentist's full schedule for a specific day (Schedule + Appointments + Blocks).
 * Useful for conflict checking during appointment approval.
 */
export const getDentistDaySchedule = async (dentistId, date) => {
    // 1. Get Day of Week
    const dayOfWeek = new Date(date).getDay();

    // 2. Fetch all components in parallel
    const [scheduleRes, appointmentsRes, blocksRes] = await Promise.all([
        supabaseAdmin
            .from('dentist_schedule')
            .select('*')
            .eq('dentist_id', dentistId)
            .eq('day_of_week', dayOfWeek)
            .maybeSingle(),
        supabaseAdmin
            .from('appointments')
            .select(`
                id, 
                start_time, 
                end_time, 
                status, 
                patient:profiles!appointments_patient_id_fkey(full_name),
                service:services(name)
            `)
            .eq('dentist_id', dentistId)
            .eq('appointment_date', date)
            .neq('status', APPOINTMENT_STATUS.CANCELLED),
        supabaseAdmin
            .from('dentist_availability_blocks')
            .select('*')
            .eq('dentist_id', dentistId)
            .eq('block_date', date)
    ]);

    if (scheduleRes.error) throw new AppError(scheduleRes.error.message, 500);
    if (appointmentsRes.error) throw new AppError(appointmentsRes.error.message, 500);
    if (blocksRes.error) throw new AppError(blocksRes.error.message, 500);

    return {
        base_schedule: scheduleRes.data,
        appointments: appointmentsRes.data,
        blocks: blocksRes.data
    };
};

/**
 * Set/update a dentist's schedule for a specific day.
 *
 * @param {string} dentistId - Dentist UUID
 * @param {number} dayOfWeek - 0 (Sunday) to 6 (Saturday)
 * @param {object} schedule - { is_working, start_time, end_time }
 */
export const setDentistSchedule = async (dentistId, dayOfWeek, schedule) => {
    const { data, error } = await supabaseAdmin
        .from('dentist_schedule')
        .upsert(
            {
                dentist_id: dentistId,
                day_of_week: dayOfWeek,
                is_working: schedule.is_working,
                start_time: schedule.start_time || null,
                end_time: schedule.end_time || null,
            },
            { onConflict: 'dentist_id,day_of_week' },
        )
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Bulk set a dentist's entire weekly schedule.
 *
 * @param {string} dentistId - Dentist UUID
 * @param {Array} schedules - Array of { day_of_week, is_working, start_time, end_time, break_start_time, break_end_time }
 */
export const setBulkSchedule = async (dentistId, schedules, overwrite = false) => {
    const rows = schedules.map((s) => ({
        dentist_id: dentistId,
        day_of_week: s.day_of_week,
        is_working: s.is_working,
        start_time: s.start_time || null,
        end_time: s.end_time || null,
        break_start_time: s.break_start_time || null,
        break_end_time: s.break_end_time || null,
        is_using_global: s.is_using_global ?? true,
    }));

    const { data: scheduleData, error } = await supabaseAdmin
        .from('dentist_schedule')
        .upsert(rows, { onConflict: 'dentist_id,day_of_week' })
        .select();

    if (error) throw new AppError(error.message, 500);

    if (overwrite) {
        // Query all active future appointments for this dentist
        const today = new Date().toISOString().split('T')[0];
        const { data: appointments, error: apptError } = await supabaseAdmin
            .from('appointments')
            .select('id, appointment_date, start_time, end_time')
            .eq('dentist_id', dentistId)
            .gte('appointment_date', today)
            .not('status', 'in', `(${APPOINTMENT_STATUS.CANCELLED},${APPOINTMENT_STATUS.LATE_CANCEL},${APPOINTMENT_STATUS.NO_SHOW},${APPOINTMENT_STATUS.RESCHEDULED},${APPOINTMENT_STATUS.COMPLETED})`);

        if (!apptError && appointments && appointments.length > 0) {
            const idsToCancel = [];

            appointments.forEach(appt => {
                const [y, m, d] = (appt.appointment_date || '').split('-');
                const jsDow = new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).getDay();
                const rule = schedules.find(r => r.day_of_week === jsDow);

                if (!rule || !rule.is_working) {
                    idsToCancel.push(appt.id);
                } else {
                    const ast = appt.start_time.substring(0, 5);
                    const aet = appt.end_time.substring(0, 5);
                    const rst = rule.start_time;
                    const ret = rule.end_time;
                    
                    if (ast < rst || aet > ret) {
                        idsToCancel.push(appt.id);
                    } else if (rule.break_start_time && rule.break_end_time) {
                        if (ast < rule.break_end_time && aet > rule.break_start_time) {
                            idsToCancel.push(appt.id);
                        }
                    }
                }
            });

            if (idsToCancel.length > 0) {
                await supabaseAdmin
                    .from('appointments')
                    .update({ 
                        status: APPOINTMENT_STATUS.CANCELLED,
                        cancellation_reason: 'SYSTEM_DISPLACED'
                    })
                    .in('id', idsToCancel);
            }
        }
    }

    return scheduleData;
};

/**
 * Get all blocks for a dentist (or all dentists).
 *
 * @param {string|null} dentistId - Optional: filter by dentist
 * @param {string|null} fromDate - Optional: filter from date
 */
export const getBlocks = async (dentistId = null, fromDate = null) => {
    let query = supabaseAdmin
        .from('dentist_availability_blocks')
        .select(
            `
                *,
                dentist: dentists(profile: profiles(full_name, first_name, last_name, middle_name, suffix))
                    `,
        )
        .order('block_date', { ascending: true });

    if (dentistId) query = query.eq('dentist_id', dentistId);
    if (fromDate) query = query.gte('block_date', fromDate);

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Bulk cancel all appointments for a blocked dentist on a specific date.
 * Use when blocking a dentist's day — auto-cancels affected appointments.
 *
 * Uses proper time-range overlap detection:
 * An appointment is affected if it overlaps with the blocked time period.
 * Example: Block 8:00-9:00 affects appointments that start at 7:45-8:50, not just 8:00+
 *
 * @param {string} dentistId - Dentist UUID
 * @param {string} blockDate - 'YYYY-MM-DD'
 * @param {string|null} startTime - Optional: only cancel from this time (e.g., '08:00')
 * @param {string|null} endTime - Optional: only cancel until this time (e.g., '17:00')
 * @param {boolean} isOverwrite - Optional: flags appointments as SYSTEM_DISPLACED
 * @returns {object} { cancelled_count, appointments }
 */
export const bulkCancelForBlock = async (
    dentistId,
    blockDate,
    startTime = null,
    endTime = null,
    isOverwrite = false
) => {
    // ── Get all appointments for this dentist on this date ──
    const { data: allAppointments, error: fetchErr } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('dentist_id', dentistId)
        .eq('appointment_date', blockDate)
        .in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED]);

    if (fetchErr) throw { status: 500, message: fetchErr.message };

    if (!allAppointments || allAppointments.length === 0) {
        return { cancelled_count: 0, appointments: [] };
    }

    // ── Filter appointments that overlap with the block time ──
    // If no block times specified, block entire day
    const blockStart = startTime || '00:00';
    const blockEnd = endTime || '23:59';

    const affectedAppointments = allAppointments.filter((appt) => {
        // Check if appointment overlaps with blocked period
        // Overlap exists if: appt.start < blockEnd AND appt.end > blockStart
        return appt.start_time < blockEnd && appt.end_time > blockStart;
    });

    if (affectedAppointments.length === 0) {
        return { cancelled_count: 0, appointments: [] };
    }

    const appointmentIds = affectedAppointments.map((a) => a.id);

    // ── Cancel all affected appointments ──
    const updateReason = isOverwrite ? 'SYSTEM_DISPLACED' : 'Dentist unavailable (schedule block)';

    const { error: updateErr } = await supabaseAdmin
        .from('appointments')
        .update({
            status: APPOINTMENT_STATUS.CANCELLED,
            cancellation_reason: updateReason,
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .in('id', appointmentIds);

    if (updateErr) throw { status: 500, message: updateErr.message };

    // TODO: Notify each affected patient via email

    return { cancelled_count: appointmentIds.length, appointments: affectedAppointments };
};

// ═══════════════════════════════════════════════
// PATIENT MANAGEMENT
// ═══════════════════════════════════════════════

/**
 * Get a patient's full appointment history.
 *
 * @param {string} patientId - Patient's profile UUID
 */
export const getPatientAppointmentHistory = async (patientId) => {
    // ── 1. Find all family members (Primary + Dependents) ──
    const { data: familyProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .or(`id.eq.${patientId},primary_profile_id.eq.${patientId}`);

    if (profilesError) throw new AppError(profilesError.message, 500);
    const familyIds = familyProfiles.map(p => p.id);

    // ── 2. Get appointments for all family members ──
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(
            `
                    *,
                    patient: profiles!appointments_patient_id_fkey(full_name, email, phone),
                    service: services(name, price, tier),
                    dentist: dentists(profile: profiles(full_name, first_name, last_name, middle_name, suffix))
            `,
        )
        .in('patient_id', familyIds)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Toggle a patient's booking restriction.
 *
 * @param {string} patientId - Patient's profile UUID
 * @param {boolean} restricted - true to restrict, false to lift
 * @param {string|null} reason - Why restricted (or null to clear)
 */
export const setPatientRestriction = async (patientId, restricted, reason = null) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
            is_booking_restricted: restricted,
            restriction_reason: restricted ? reason : null,
            restriction_until: null, // Clear auto-expire on manual toggle
        })
        .eq('id', patientId)
        .select(
            'id, full_name, is_booking_restricted, restriction_reason, no_show_count, cancellation_count',
        )
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update a patient's profile information.
 *
 * @param {string} patientId - Profile UUID
 * @param {object} fields - { full_name?, email?, phone?, is_booking_restricted?, ... }
 * @returns {object} Updated profile
 */
export const updatePatientProfileData = async (patientId, fields) => {
    const allowedFields = [
        'full_name', 'first_name', 'last_name', 'middle_name', 'suffix',
        'email', 'phone', 'date_of_birth', 'avatar_url',
        'is_booking_restricted', 'restriction_reason'
    ];

    const updates = {};
    Object.keys(fields).forEach(key => {
        if (allowedFields.includes(key)) {
            updates[key] = fields[key];
        }
    });

    if (Object.keys(updates).length === 0) {
        throw new AppError('No valid fields provided for update.', 400);
    }

    // Automatically sync full_name if any name components were updated
    const nameFields = ['first_name', 'middle_name', 'last_name', 'suffix'];
    const isNameUpdated = nameFields.some(field => field in updates);
    
    if (isNameUpdated) {
        // Fetch current values to fill in the gaps for recalculation
        const { data: current } = await supabaseAdmin
            .from('profiles')
            .select('first_name, middle_name, last_name, suffix')
            .eq('id', patientId)
            .single();

        const fullFirst = updates.first_name !== undefined ? updates.first_name : current?.first_name;
        const fullMiddle = updates.middle_name !== undefined ? updates.middle_name : current?.middle_name;
        const fullLast = updates.last_name !== undefined ? updates.last_name : current?.last_name;
        const fullSuffix = updates.suffix !== undefined ? updates.suffix : current?.suffix;

        updates.full_name = [fullFirst, fullMiddle, fullLast, fullSuffix]
            .filter(part => part && part.trim() !== '')
            .join(' ')
            .trim();
    }

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', patientId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};


// ═══════════════════════════════════════════════
// APPOINTMENT STATE CHANGES
// ═══════════════════════════════════════════════

/**
 * Mark an appointment as completed.
 * Supervisor can mark CONFIRMED or IN_PROGRESS appointments as COMPLETED.
 *
 * @param {string} appointmentId - Appointment UUID
 * @returns {object} Updated appointment
 */
export const markAppointmentComplete = async (appointmentId) => {
    // Verify appointment exists and is in a valid state for completion
    const { data: appt } = await supabaseAdmin
        .from('appointments')
        .select('status')
        .eq('id', appointmentId)
        .single();

    if (!appt) {
        throw { status: 404, message: 'Appointment not found.' };
    }

    // Can complete from CONFIRMED or IN_PROGRESS status
    if (
        appt.status !== APPOINTMENT_STATUS.CONFIRMED &&
        appt.status !== APPOINTMENT_STATUS.IN_PROGRESS
    ) {
        throw {
            status: 400,
            message: `Cannot complete appointment.Current status: ${appt.status}. Must be CONFIRMED or IN_PROGRESS.`,
        };
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
 * Cancel an appointment (admin action).
 *
 * @param {string} appointmentId - Appointment UUID
 * @param {string} reason - Cancellation reason
 * @returns {object} { appointment }
 */
export const adminCancelAppointment = async (appointmentId, reason = null) => {
    // Get appointment first (needed to trigger waitlist notifications)
    const { data: appointment, error: fetchErr } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

    if (fetchErr || !appointment) {
        throw { status: 404, message: 'Appointment not found.' };
    }

    // Update appointment to cancelled
    const { data: updated, error: updateErr } = await supabaseAdmin
        .from('appointments')
        .update({
            status: APPOINTMENT_STATUS.CANCELLED,
            cancellation_reason: reason || 'Cancelled by admin',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select()
        .single();

    if (updateErr) throw { status: 500, message: updateErr.message };

    return { appointment: updated };
};

/**
 * Block a dentist's availability (leave, emergency, training, etc).
 *
 * @param {string} dentistId - Dentist UUID
 * @param {string} blockDate - Date in 'YYYY-MM-DD' format
 * @param {string|null} startTime - Start time in 'HH:MM' format (null = all day)
 * @param {string|null} endTime - End time in 'HH:MM' format (null = all day)
 * @param {string} reason - Reason for block
 * @param {string|null} notes - Optional notes
 * @param {boolean} cancelAppointments - Whether to auto-cancel conflicting appointments
 * @param {string} createdBy - Admin UUID who created the block
 * @returns {object} { block, cancelResult }
 */
export const blockDentistSchedule = async (
    dentistId,
    blockDate,
    startTime,
    endTime,
    reason,
    notes = null,
    cancelAppointments = false,
    createdBy,
    overwrite = false
) => {
    // Verify dentist exists
    const { data: dentist, error: dentistErr } = await supabaseAdmin
        .from('dentists')
        .select('id')
        .eq('id', dentistId)
        .single();

    if (dentistErr || !dentist) {
        throw { status: 404, message: 'Dentist not found.' };
    }

    // Create the availability block
    const { data: block, error: blockErr } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .insert({
            dentist_id: dentistId,
            block_date: blockDate,
            start_time: startTime || null,
            end_time: endTime || null,
            reason,
            notes,
            created_by: createdBy,
        })
        .select()
        .single();

    if (blockErr) throw { status: 500, message: blockErr.message };

    // Optionally auto-cancel appointments that conflict with this block
    let cancelResult = null;
    if (cancelAppointments || overwrite) {
        cancelResult = await bulkCancelForBlock(dentistId, blockDate, startTime, endTime, overwrite);
    }

    return { block, cancelResult };
};

/**
 * Remove a dentist availability block.
 *
 * @param {string} blockId - Block UUID
 * @returns {object} { message }
 */
export const removeAvailabilityBlock = async (blockId) => {
    const { error } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .delete()
        .eq('id', blockId);

    if (error) throw new AppError(error.message, 500);

    return { message: 'Availability block removed.' };
};

// ═══════════════════════════════════════════════
// LIST & SEARCH FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Get all appointments with optional filters and pagination.
 *
 * @param {object} filters - { date?, status?, dentist_id?, patient_id?, tier? }
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {object} { appointments, pagination }
 */
export const getAllAppointmentsFiltered = async (filters = {}, page = 1, limit = 20) => {
    let query = supabaseAdmin
        .from('appointments')
        .select(
            `
        *,
        patient: profiles!appointments_patient_id_fkey(full_name, email, phone),
            service: services(name, duration_minutes, price, tier),
                dentist: dentists(profile: profiles(full_name, first_name, last_name, middle_name, suffix))
                    `,
            { count: 'exact' },
        )
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

    // Apply filters
    if (filters.date) {
        query = query.eq('appointment_date', filters.date);
    } else if (filters.date_from) {
        query = query.gte('appointment_date', filters.date_from);
        if (filters.date_to) {
            query = query.lte('appointment_date', filters.date_to);
        }
    }
    
    // If a specific status is requested, use it; otherwise, exclude 'zombie' statuses by default
    // to prevent rescheduled/cancelled/missed appointments from cluttering active lists.
    if (filters.status) {
        query = query.eq('status', filters.status);
    } else {
        query = query.not('status', 'in', `(${APPOINTMENT_STATUS.CANCELLED},${APPOINTMENT_STATUS.LATE_CANCEL},${APPOINTMENT_STATUS.NO_SHOW},${APPOINTMENT_STATUS.RESCHEDULED})`);
    }

    if (filters.dentist_id) query = query.eq('dentist_id', filters.dentist_id);
    if (filters.patient_id) query = query.eq('patient_id', filters.patient_id);
    if (filters.tier) query = query.eq('service_tier', filters.tier);

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw new AppError(error.message, 500);

    return {
        appointments: data,
        pagination: {
            page,
            limit,
            total: count,
            total_pages: Math.ceil(count / limit),
        },
    };
};

/**
 * Get today's appointments.
 *
 * @returns {object} { date, appointments }
 */
export const getTodayAppointmentsFiltered = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select(
            `
                    *,
                    patient: profiles!appointments_patient_id_fkey(full_name, phone),
                        service: services(name, tier),
                            dentist: dentists(profile: profiles(full_name, first_name, last_name, middle_name, suffix))
    `,
        )
        .eq('appointment_date', today)
        .not('status', 'in', `(${APPOINTMENT_STATUS.CANCELLED},${APPOINTMENT_STATUS.LATE_CANCEL},${APPOINTMENT_STATUS.NO_SHOW},${APPOINTMENT_STATUS.RESCHEDULED})`)
        .order('start_time');

    if (error) throw new AppError(error.message, 500);

    return { date: today, appointments: data };
};

/**
 * Search for patients by name or email, with filters.
 *
 * @param {string|null} search - Search term for full_name or email
 * @returns {Array} List of patient profiles
 */
export const searchPatients = async (search = null) => {
    let query = supabaseAdmin
        .from('profiles')
        .select(
            'id, full_name, email, phone, is_registered, primary_profile_id, relationship_to_primary, no_show_count, cancellation_count, reschedule_count, is_booking_restricted, restriction_reason, deposit_required, created_at',
        )
        .eq('role', 'patient')
        .order('created_at', { ascending: false })
        .limit(50);

    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    return data;
};

/**
 * Get all dentists (active + inactive) with full profile and services.
 *
 * @returns {Array} List of dentists with profile data and authorized services
 */
export const getDentistsList = async () => {
    const { data, error } = await supabaseAdmin
        .from('dentists')
        .select(
            `
        id, license_number, specialization, tier, bio, photo_url, is_active, created_at,
        profile: profiles(id, full_name, first_name, last_name, middle_name, suffix, email, phone),
        dentist_services(service_id, service:services(id, name, tier))
            `,
        )
        .order('created_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    return data;
};

/**
 * Get a single dentist by ID with full profile and services.
 *
 * @param {string} dentistId - Dentist UUID
 * @returns {object} Dentist with profile and services
 */
export const getDentistById = async (dentistId) => {
    const { data, error } = await supabaseAdmin
        .from('dentists')
        .select(
            `
        id, license_number, specialization, tier, bio, photo_url, is_active, created_at,
        profile: profiles(id, full_name, first_name, last_name, middle_name, suffix, email, phone),
        dentist_services(service_id, service:services(id, name, tier))
            `,
        )
        .eq('id', dentistId)
        .single();

    if (error) throw new AppError(error.message, 404);
    return data;
};

/**
 * Onboard a new dentist (Creates auth user + sends invitation + triggers profile).
 * 
 * @param {object} dentistData - { email, first_name, last_name, middle_name?, suffix?, phone? }
 * @returns {object} Invitation result
 */
export const onboardDentistProfile = async (dentistData) => {
    const { email, first_name, last_name, middle_name, suffix, phone } = dentistData;
    
    // 1. Validation
    if (!email || !first_name || !last_name) {
        throw new AppError('Incomplete doctor identity data (First Name, Last Name, Email).', 400);
    }

    // 2. Metadata construction - Strictly following trigger expectations
    // d:\webApp\BLUEPRINT\BACKEND\MIGRATIONS\20260424213800_update_handle_new_user_trigger.sql
    const metadata = {
        full_name: `${first_name} ${last_name}`.trim(),
        first_name: first_name,
        last_name: last_name,
        middle_name: middle_name || '',
        suffix: suffix || '',
        phone: phone || '',
        role: 'dentist'
    };

    // 3. User Invitation — redirect to doctor portal password setup
    const doctorPortalUrl = process.env.DOCTOR_URL || 'http://localhost:5176';
    const { data: inviteData, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
            data: metadata,
            redirectTo: `${doctorPortalUrl}/set-password`
        }
    );

    if (inviteErr) {
        console.error(' [ONBOARD_ERROR] Details:', inviteErr);
        throw new AppError(`Supabase Invitation Error: ${inviteErr.message}`, 500);
    }

    return {
        user: inviteData.user,
        message: 'A secure registration link has been dispatched to the doctor.'
    };
};

/**
 * Update a dentist's profile fields.
 * Updates both `dentists` table (bio, photo_url, is_active, license_number)
 * and `profiles` table (name fields, email, phone).
 *
 * @param {string} dentistId - Dentist UUID
 * @param {object} fields - { bio?, photo_url?, is_active?, license_number?, first_name?, last_name?, middle_name?, suffix?, email?, phone? }
 * @returns {object} Updated dentist with profile
 */
export const updateDentistProfileData = async (dentistId, fields) => {
    const {
        bio, photo_url, is_active, license_number,
        first_name, last_name, middle_name, suffix, email, phone,
    } = fields;

    // 1. Get current dentist to know profile_id and current name parts
    const { data: current, error: fetchErr } = await supabaseAdmin
        .from('dentists')
        .select(`
            id, 
            profile_id, 
            profile:profiles(first_name, last_name, middle_name, suffix)
        `)
        .eq('id', dentistId)
        .single();

    if (fetchErr || !current) throw new AppError('Dentist not found.', 404);

    // 2. Update dentists table
    const dentistUpdates = {};
    if (bio !== undefined) dentistUpdates.bio = bio;
    if (photo_url !== undefined) dentistUpdates.photo_url = photo_url;
    if (is_active !== undefined) dentistUpdates.is_active = is_active;
    if (license_number !== undefined) dentistUpdates.license_number = license_number;

    if (Object.keys(dentistUpdates).length > 0) {
        dentistUpdates.updated_at = new Date().toISOString();
        const { error: dentistErr } = await supabaseAdmin
            .from('dentists')
            .update(dentistUpdates)
            .eq('id', dentistId);
        if (dentistErr) throw new AppError(dentistErr.message, 500);
    }

    // 3. Update profiles table (name + contact)
    const profileUpdates = {};
    if (first_name !== undefined) profileUpdates.first_name = first_name;
    if (last_name !== undefined) profileUpdates.last_name = last_name;
    if (middle_name !== undefined) profileUpdates.middle_name = middle_name;
    if (suffix !== undefined) profileUpdates.suffix = suffix;
    if (email !== undefined) profileUpdates.email = email;
    if (phone !== undefined) profileUpdates.phone = phone;
    if (photo_url !== undefined) profileUpdates.avatar_url = photo_url; // Map photo_url to profiles.avatar_url

    // Rebuild full_name if any name parts changed
    if (
        first_name !== undefined ||
        last_name !== undefined ||
        middle_name !== undefined ||
        suffix !== undefined
    ) {
        const fn = first_name !== undefined ? first_name : current.profile?.first_name || '';
        const mn = middle_name !== undefined ? middle_name : current.profile?.middle_name || '';
        const ln = last_name !== undefined ? last_name : current.profile?.last_name || '';
        const sf = suffix !== undefined ? suffix : current.profile?.suffix || '';

        profileUpdates.full_name = `Dr. ${fn}${mn ? ' ' + mn : ''} ${ln}${sf ? ' ' + sf : ''}`
            .replace(/\s+/g, ' ')
            .trim();
    }

    if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        const { error: profileErr } = await supabaseAdmin
            .from('profiles')
            .update(profileUpdates)
            .eq('id', current.profile_id);
        if (profileErr) throw new AppError(profileErr.message, 500);
    }

    // 4. Return fresh data
    return getDentistById(dentistId);
};

/**
 * Replace a dentist's authorized services.
 * Deletes existing dentist_services rows and inserts the new set.
 *
 * @param {string} dentistId - Dentist UUID
 * @param {string[]} serviceIds - Array of service UUIDs
 * @returns {object} Updated dentist with new services
 */
export const replaceDentistServices = async (dentistId, serviceIds) => {
    // 1. Fetch current services to identify what is being removed
    const { data: oldServices } = await supabaseAdmin
        .from('dentist_services')
        .select('service_id')
        .eq('dentist_id', dentistId);

    const oldServiceIds = (oldServices || []).map((s) => s.service_id);
    const removedServiceIds = oldServiceIds.filter((id) => !serviceIds.includes(id));

    // 2. Delete existing service mappings
    const { error: deleteErr } = await supabaseAdmin
        .from('dentist_services')
        .delete()
        .eq('dentist_id', dentistId);

    if (deleteErr) throw new AppError(deleteErr.message, 500);

    // 3. Insert new mappings (skip if empty array)
    if (Array.isArray(serviceIds) && serviceIds.length > 0) {
        const rows = serviceIds.map((sid) => ({ dentist_id: dentistId, service_id: sid }));
        const { error: insertErr } = await supabaseAdmin.from('dentist_services').insert(rows);
        if (insertErr) throw new AppError(insertErr.message, 500);
    }

    // 4. Handle displacement if services were removed
    let displacedAppointments = [];
    if (removedServiceIds.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const { data: affected, error: apptError } = await supabaseAdmin
            .from('appointments')
            .select(
                `
                *,
                patient: profiles!appointments_patient_id_fkey(id, full_name, email),
                service: services(id, name)
            `,
            )
            .eq('dentist_id', dentistId)
            .in('service_id', removedServiceIds)
            .gte('appointment_date', today)
            .in('status', [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED]);

        if (!apptError && affected && affected.length > 0) {
            displacedAppointments = affected;
            const affectedIds = affected.map((a) => a.id);

            await supabaseAdmin
                .from('appointments')
                .update({
                    status: APPOINTMENT_STATUS.CANCELLED,
                    cancellation_reason: 'SYSTEM_DISPLACED: Service no longer offered by doctor',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .in('id', affectedIds);
        }
    }

    // 5. Return fresh data and displaced list
    const updatedDoctor = await getDentistById(dentistId);
    return { doctor: updatedDoctor, displacedAppointments };
};

// ═══════════════════════════════════════════════
// GUEST & EMERGENCY REGISTRATION
// ═══════════════════════════════════════════════

/**
 * Quick register a patient without authentication (Stub profile).
 * Used for walk-in patients or emergency appointments.
 *
 * @param {object} patientData - { full_name, email, phone, first_name, last_name, middle_name, suffix, date_of_birth }
 * @returns {object} Created patient profile
 */
export const quickRegisterPatient = async (patientData) => {
    const { 
        full_name, email, phone, 
        first_name, last_name, middle_name, suffix, 
        date_of_birth, resolution, otp, primary_profile_id
    } = patientData;

    if (!full_name && (!first_name || !last_name)) {
        throw new AppError('Patient name is required.', 400);
    }

    let finalEmail = email;
    let finalPrimaryId = primary_profile_id || null;

    if (resolution === 'FORCE_OFFLINE') {
        finalEmail = null;
    } else if (resolution === 'LINK_DEPENDENT') {
        if (!primary_profile_id || !otp) {
            throw new AppError('Primary profile ID and OTP are required to link as dependent.', 400);
        }
        
        // Verify OTP
        const { data: tokenData } = await supabaseAdmin
            .from('dependency_consent_tokens')
            .select('id, status, expires_at')
            .eq('primary_profile_id', primary_profile_id)
            .eq('token', otp)
            .eq('status', 'active')
            .maybeSingle();
            
        if (!tokenData) {
            throw new AppError('Invalid or expired OTP for dependency consent.', 400);
        }
        
        if (new Date(tokenData.expires_at) < new Date()) {
            await supabaseAdmin.from('dependency_consent_tokens').update({ status: 'expired' }).eq('id', tokenData.id);
            throw new AppError('OTP has expired.', 400);
        }
        
        // Mark as used
        await supabaseAdmin.from('dependency_consent_tokens').update({ status: 'used', used_at: new Date().toISOString() }).eq('id', tokenData.id);
        
        finalEmail = null; // Dependents shouldn't strictly require the same email, they live under the parent
        finalPrimaryId = primary_profile_id;
    } else if (email) {
        // Standard flow: Check if email exists
        const { data: byEmail, error: emailErr } = await supabaseAdmin.from('profiles').select('id, full_name, is_registered').eq('email', email).maybeSingle();
        if (emailErr) {
            console.error('Email check error:', emailErr);
            throw new AppError('Error checking existing email.', 500);
        }
        if (byEmail) {
            throw { status: 409, message: 'CONFLICT_RESOLUTION_REQUIRED', profile: byEmail, conflictType: 'EMAIL' };
        }
    }

    if (phone && !resolution) {
        const { data: byPhone, error: phoneErr } = await supabaseAdmin.from('profiles').select('id, full_name, is_registered').eq('phone', phone).maybeSingle();
        if (phoneErr) {
            console.error('Phone check error:', phoneErr);
            throw new AppError('Error checking existing phone.', 500);
        }
        if (byPhone) {
            throw { status: 409, message: 'CONFLICT_RESOLUTION_REQUIRED', profile: byPhone, conflictType: 'PHONE' };
        }
    }

    const finalFullName = full_name || [first_name, middle_name, last_name, suffix]
        .filter(part => part && part.trim() !== '')
        .join(' ')
        .trim();
    
    console.log(' [QUICK_REGISTER] Final Full Name:', finalFullName);
    console.log(' [QUICK_REGISTER] Parts:', { first_name, middle_name, last_name, suffix });

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
            full_name: finalFullName,
            first_name: first_name || null,
            last_name: last_name || null,
            middle_name: middle_name || null,
            suffix: suffix || null,
            date_of_birth: date_of_birth || null,
            email: finalEmail || null,
            phone: phone || null,
            role: 'patient',
            primary_profile_id: finalPrimaryId,
            is_registered: false,
            created_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Quick registration insert failed:', error);
        throw new AppError(error.message, 500);
    }
    return data;
};

/**
 * Check for duplicate patients based on name+DOB, phone, or email.
 * 
 * @param {object} criteria - { first_name, last_name, date_of_birth, phone, email }
 * @returns {Array} List of potential duplicates
 */
export const checkDuplicatePatient = async (criteria) => {
    const { first_name, last_name, date_of_birth, phone, email } = criteria;
    const conditions = [];
    
    // 1. Exact matches for Email or Phone
    if (email) conditions.push(`email.ilike.${email}`);
    
    // Sanitize phone (extract digits) to catch format differences
    if (phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length >= 7) {
            conditions.push(`phone.ilike.%${cleanPhone}%`);
        } else {
            conditions.push(`phone.eq.${phone}`);
        }
    }
    
    // 2. Name Triangulation: First + Last Name (Fuzzy matching)
    if (first_name && last_name) {
        conditions.push(`and(first_name.ilike.%${first_name}%,last_name.ilike.%${last_name}%)`);
    }
    
    if (conditions.length === 0) return [];

    const { data: duplicates, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, first_name, middle_name, last_name, suffix, date_of_birth, phone, email, is_registered, role')
        .or(conditions.join(','));

    if (error) throw new AppError(error.message, 500);

    // Filter results to ensure high relevance (Rule: Email match OR Phone match OR Name+DOB match)
    const filtered = (duplicates || []).filter(d => {
        // Email is absolute
        if (email && d.email?.toLowerCase() === email.toLowerCase()) return true;
        
        // Phone digits are absolute
        if (phone && d.phone?.replace(/\D/g, '') === phone.replace(/\D/g, '')) return true;

        // Name + DOB match is absolute
        if (first_name && last_name && date_of_birth) {
            const nameMatch = d.first_name?.toLowerCase().includes(first_name.toLowerCase()) || 
                             d.last_name?.toLowerCase().includes(last_name.toLowerCase());
            const dobMatch = d.date_of_birth === date_of_birth;
            if (nameMatch && dobMatch) return true;
        }

        // Just Name match (if no other data available)
        if (!email && !phone && !date_of_birth && first_name && last_name) return true;

        return false;
    });

    return filtered;
};

/**
 * Merge two patient records (Source -> Target).
 * Migrates appointments, treatment notes, etc., and deletes source.
 * 
 * @param {string} sourceId - Profile UUID of the record to be removed
 * @param {string} targetId - Profile UUID of the record to be kept
 * @returns {object} { success: true }
 */
export const mergePatientRecords = async (sourceId, targetId, asDependent = false) => {
    if (sourceId === targetId) throw new AppError('Cannot merge a profile into itself.', 400);

    // 1. Verify both exist
    const { data: source } = await supabaseAdmin.from('profiles').select('id, is_registered').eq('id', sourceId).single();
    const { data: target } = await supabaseAdmin.from('profiles').select('id, is_registered').eq('id', targetId).single();

    if (!source || !target) throw new AppError('One or both profiles not found.', 404);

    // 2. Perform merge or link
    try {
        // Migrating all related data to the target
        const tables = [
            { name: 'appointments', column: 'patient_id' },
            { name: 'treatment_notes', column: 'patient_id' },
            { name: 'follow_ups', column: 'patient_id' },
            { name: 'waitlist', column: 'patient_id' },
            { name: 'notifications', column: 'user_id' }
        ];

        for (const table of tables) {
            const { error } = await supabaseAdmin
                .from(table.name)
                .update({ [table.column]: targetId })
                .eq(table.column, sourceId);
            if (error) console.warn(`Note: Failed to migrate ${table.name}: ${error.message}`);
        }

        if (asDependent) {
            // Link as dependent instead of deleting
            const { error: linkErr } = await supabaseAdmin
                .from('profiles')
                .update({ 
                    primary_profile_id: targetId,
                    email: null // Clear email to allow the parent's email to be the primary contact
                })
                .eq('id', sourceId);
            if (linkErr) throw linkErr;
        } else {
            // Full Merge: Delete source
            const { error: delErr } = await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('id', sourceId);
            if (delErr) throw delErr;
        }

        return { success: true, message: 'Records merged successfully' };
    } catch (err) {
        console.error('Merge error:', err);
        throw new AppError('Failed to merge patient records.', 500);
    }
};

/**
 * Generate and send an OTP for dependency consent
 * @param {string} primaryProfileId - The ID of the owner of the email
 * @param {string} dependentId - The ID of the stub being linked
 * @param {string} relationship - The relationship (Child, Spouse, etc.)
 * @returns {object} { message: 'OTP sent' }
 */
export const sendDependencyConsentOTP = async (primaryProfileId, dependentId, relationship) => {
    if (!relationship) {
        throw new AppError('Relationship is required for dependency linking.', 400);
    }
    // 1. Get the primary profile email
    const { data: profile, error } = await supabaseAdmin.from('profiles').select('email, full_name').eq('id', primaryProfileId).single();
    if (error || !profile) {
        throw new AppError('Primary profile not found.', 404);
    }
    if (!profile.email) {
        throw new AppError('Primary profile has no email to send OTP to.', 400);
    }

    // 2. Rate limit check (e.g., no active token requested in last 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentToken } = await supabaseAdmin
        .from('dependency_consent_tokens')
        .select('id')
        .eq('primary_profile_id', primaryProfileId)
        .eq('status', 'active')
        .gte('created_at', oneMinuteAgo)
        .maybeSingle();

    if (recentToken) {
        throw new AppError('Please wait a minute before requesting another OTP.', 429);
    }

    // 3. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Save to db with 15-minute expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const { error: insertErr } = await supabaseAdmin
        .from('dependency_consent_tokens')
        .insert({
            primary_profile_id: primaryProfileId,
            token: otp,
            expires_at: expiresAt,
            status: 'active',
            dependent_data: { 
                dependent_id: dependentId,
                relationship: relationship 
            } // Store the target dependent and relationship
        });

    if (insertErr) {
        throw new AppError('Failed to generate OTP.', 500);
    }

    // 5. Trigger email dispatch
    try {
        await sendOTPEmail(profile.email, profile.full_name, otp);
    } catch (err) {
        console.error('Failed to send dependency consent email:', err.message);
    }

    return { message: `Consent OTP sent to ${profile.email}.` };
};

/**
 * Verify dependency consent OTP and link the profiles.
 * 
 * @param {string} primaryId - The primary profile ID
 * @param {string} otp - The 6-digit OTP
 * @returns {object} { success: true }
 */
export const verifyDependencyConsent = async (primaryId, otp) => {
    // 1. Find active token
    const { data: tokenData, error: tokenErr } = await supabaseAdmin
        .from('dependency_consent_tokens')
        .select('*')
        .eq('primary_profile_id', primaryId)
        .eq('token', otp)
        .eq('status', 'active')
        .maybeSingle();

    if (tokenErr || !tokenData) {
        throw new AppError('Invalid or expired OTP.', 400);
    }

    // 2. Check expiry
    if (new Date(tokenData.expires_at) < new Date()) {
        await supabaseAdmin.from('dependency_consent_tokens').update({ status: 'expired' }).eq('id', tokenData.id);
        throw new AppError('OTP has expired.', 400);
    }

    const dependentId = tokenData.dependent_data?.dependent_id;
    if (!dependentId) {
        throw new AppError('Token metadata corrupted: No dependent ID found.', 500);
    }

    // 3. Perform the link via merge service (asDependent=true)
    // This migrates data AND sets primary_profile_id
    const mergeResult = await mergePatientRecords(dependentId, primaryId, true);

    // 4. Update the dependent's profile with the relationship
    const relationship = tokenData.dependent_data?.relationship;
    if (relationship) {
        await supabaseAdmin
            .from('profiles')
            .update({ relationship_to_primary: relationship })
            .eq('id', dependentId);
    }

    // 5. Mark token as used
    await supabaseAdmin
        .from('dependency_consent_tokens')
        .update({ 
            status: 'used', 
            used_at: new Date().toISOString() 
        })
        .eq('id', tokenData.id);

    return mergeResult;
};


// ═══════════════════════════════════════════════
// DENTIST SLOT & ASSIGNMENT FUNCTIONS
// ═══════════════════════════════════════════════

/**
 * Get all dentists available for a specific time slot.
 * Filters out dentists with blocks or existing appointments.
 *
 * @param {string} appointmentDate - Date in 'YYYY-MM-DD'
 * @param {string} startTime - Start time in 'HH:MM'
 * @param {string} endTime - End time in 'HH:MM'
 * @param {string|null} tier - Optional: filter by tier ('general', 'specialized', 'both')
 * @returns {Array} Available dentists with profiles
 */
export const getAvailableDentistsForSlot = async (
    appointmentDate,
    startTime,
    endTime,
    tier = null,
) => {
    // ── Get all active dentists ──
    let dentistQuery = supabaseAdmin
        .from('dentists')
        .select(
            `
        id,
        tier,
        profile: profiles(id, full_name, email, phone)
            `,
        )
        .eq('is_active', true);

    if (tier) {
        dentistQuery = dentistQuery.or(`tier.eq.${tier},tier.eq.both`);
    }

    const { data: dentists, error: dentistErr } = await dentistQuery;

    if (dentistErr) throw new AppError(dentistErr.message, 500);
    if (!dentists || dentists.length === 0) return [];

    const dentistIds = dentists.map((d) => d.id);

    // ── Check for availability blocks ──
    const { data: blocks, error: blockErr } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .select('dentist_id, start_time, end_time')
        .eq('block_date', appointmentDate)
        .in('dentist_id', dentistIds);

    if (blockErr) throw new AppError(blockErr.message, 500);

    const blockedDentistIds = new Set();
    (blocks || []).forEach(b => {
        const bStart = (b.start_time || '00:00').slice(0, 5);
        const bEnd = (b.end_time || '23:59').slice(0, 5);
        // Overlap: appt.start < block.end && block.start < appt.end
        if (startTime < bEnd && bStart < endTime) {
            blockedDentistIds.add(b.dentist_id);
        }
    });

    // ── Check for existing appointments (time conflicts) ──
    const { data: conflicts, error: conflictErr } = await supabaseAdmin
        .from('appointments')
        .select('dentist_id')
        .eq('appointment_date', appointmentDate)
        .lt('start_time', endTime)
        .gt('end_time', startTime)
        .in('dentist_id', dentistIds)
        .neq('status', APPOINTMENT_STATUS.CANCELLED);

    if (conflictErr) throw new AppError(conflictErr.message, 500);

    const busyDentistIds = new Set(conflicts?.map((c) => c.dentist_id) || []);

    // ── Filter available dentists ──
    const availableDentists = dentists.filter(
        (d) => !blockedDentistIds.has(d.id) && !busyDentistIds.has(d.id),
    );

    return availableDentists;
};

/**
 * Reassign an appointment from one dentist to another.
 * Validates that target dentist is available and qualified.
 *
 * @param {string} appointmentId - Appointment UUID
 * @param {string} newDentistId - Dentist UUID to reassign to
 * @param {string} supervisorId - Supervisor UUID (for audit)
 * @returns {object} Updated appointment
 */
export const reassignAppointmentToDentist = async (appointmentId, newDentistId, supervisorId) => {
    // ── Get the current appointment ──
    const { data: appointment, error: fetchErr } = await supabaseAdmin
        .from('appointments')
        .select('*, service:services(tier)')
        .eq('id', appointmentId)
        .single();

    if (fetchErr || !appointment) {
        throw new AppError('Appointment not found.', 404);
    }

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
        throw new AppError('Cannot reassign a cancelled appointment.', 400);
    }

    // ── Verify target dentist exists and is qualified ──
    const { data: targetDentist, error: dentistErr } = await supabaseAdmin
        .from('dentists')
        .select('id, tier')
        .eq('id', newDentistId)
        .eq('is_active', true)
        .single();

    if (dentistErr || !targetDentist) {
        throw new AppError('Target dentist not found or inactive.', 404);
    }

    // Check if target dentist is qualified for the service tier
    const serviceTier = appointment.service?.tier;
    if (
        serviceTier === SERVICE_TIER.SPECIALIZED &&
        targetDentist.tier !== 'specialized' &&
        targetDentist.tier !== 'both'
    ) {
        throw new AppError('Target dentist is not qualified for specialized services.', 400);
    }

    // ── Check for time conflicts ──
    const { data: conflict, error: conflictErr } = await supabaseAdmin
        .from('appointments')
        .select('id')
        .eq('dentist_id', newDentistId)
        .eq('appointment_date', appointment.appointment_date)
        .lt('start_time', appointment.end_time)
        .gt('end_time', appointment.start_time)
        .neq('id', appointmentId) // Exclude current appointment
        .neq('status', APPOINTMENT_STATUS.CANCELLED)
        .maybeSingle();

    if (conflictErr && conflictErr.code !== 'PGRST116') {
        throw new AppError(conflictErr.message, 500);
    }

    if (conflict) {
        throw new AppError(`Target dentist is already booked at ${appointment.start_time} on ${appointment.appointment_date}.`, 409);
    }

    // ── Check for availability blocks ──
    const { data: blocks, error: blockErr } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .select('start_time, end_time')
        .eq('dentist_id', newDentistId)
        .eq('block_date', appointment.appointment_date);

    if (blockErr) throw new AppError(blockErr.message, 500);

    const startTime = appointment.start_time.slice(0, 5);
    const endTime = appointment.end_time.slice(0, 5);

    const hasBlockConflict = (blocks || []).some(b => {
        const bStart = (b.start_time || '00:00').slice(0, 5);
        const bEnd = (b.end_time || '23:59').slice(0, 5);
        return startTime < bEnd && bStart < endTime;
    });

    if (hasBlockConflict) {
        throw new AppError(`Target dentist has an availability block during this time (${appointment.start_time} - ${appointment.end_time}).`, 409);
    }

    // ── Update the appointment ──
    const { data: updated, error: updateErr } = await supabaseAdmin
        .from('appointments')
        .update({
            dentist_id: newDentistId,
            updated_by: supervisorId,
            updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .select(
            `
        *,
        patient: profiles!appointments_patient_id_fkey(full_name, email),
        service: services(name, price),
        dentist: dentists(profile: profiles(full_name, first_name, last_name, middle_name, suffix))
            `,
        )
        .single();

    if (updateErr) throw new AppError(updateErr.message, 500);

    return updated;
};

/**
 * Get a single patient profile by ID.
 * 
 * @param {string} id - Profile UUID
 * @returns {object} Profile data
 */
export const getPatientProfile = async (id) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new AppError(error.message, 404);
    return data;
};
