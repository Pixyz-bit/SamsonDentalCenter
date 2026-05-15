import {
    getTodaySchedule,
    getScheduleRange,
    getOwnSchedule,
    getOwnBlocks,
    requestBlock,
    addTreatmentNote,
    getTreatmentNotes,
    getPatientHistory,
    completeAppointment,
    startAppointment,
    markAppointmentNoShow,
    updatePatientMedicalInfo,
    createFollowUp,
    reportDelay,
    getDoctorProfile,
    updateDoctorProfile,
    requestScheduleChange,
    getScheduleRequests,
    getDoctorFeedback,
} from '../services/doctor.service.js';
import { getPatientProfile } from '../services/admin.service.js';
import { getPatientAppointments } from '../services/appointment.service.js';

// ── Schedule ──

/**
 * GET /api/doctor/schedule/today
 */
export const todaySchedule = async (req, res, next) => {
    try {
        const schedule = await getTodaySchedule(req.dentist.id);
        res.json({
            date: new Date().toISOString().split('T')[0],
            dentist: req.dentist.profile?.full_name,
            tier: req.dentist.tier,
            appointments: schedule,
            total: schedule.length,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/schedule?start=2026-03-01&end=2026-03-07
 */
export const weeklySchedule = async (req, res, next) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({ error: 'start and end dates required.' });
        }
        const schedule = await getScheduleRange(req.dentist.id, start, end);
        res.json({ appointments: schedule, total: schedule.length });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/my-schedule
 *
 * View own weekly working schedule template.
 */
export const myWorkingSchedule = async (req, res, next) => {
    try {
        const schedule = await getOwnSchedule(req.dentist.id);
        res.json({ dentist_id: req.dentist.id, schedule });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/my-blocks
 *
 * View own upcoming blocks (leave, sick days).
 */
export const myBlocks = async (req, res, next) => {
    try {
        const blocks = await getOwnBlocks(req.dentist.id);
        res.json({ dentist_id: req.dentist.id, blocks });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/doctor/request-block
 *
 * Request a day off / schedule block.
 * Body: { block_date, reason, notes? }
 */
export const requestDayOff = async (req, res, next) => {
    try {
        const { block_date, reason, notes } = req.body;
        if (!block_date || !reason) {
            return res.status(400).json({ error: 'block_date and reason are required.' });
        }
        const block = await requestBlock(req.dentist.id, block_date, reason, notes);
        res.status(201).json({ message: 'Day off requested.', block });
    } catch (err) {
        next(err);
    }
};

// ── Patient Care ──

/**
 * POST /api/doctor/treatment-notes
 * Body: { appointment_id, diagnosis, treatment_performed, notes?, follow_up_recommended? }
 */
export const addNote = async (req, res, next) => {
    try {
        const { appointment_id, diagnosis, treatment_performed, notes, follow_up_recommended } =
            req.body;

        if (!appointment_id || !diagnosis || !treatment_performed) {
            return res.status(400).json({
                error: 'appointment_id, diagnosis, and treatment_performed are required.',
            });
        }

        const note = await addTreatmentNote(req.dentist.id, appointment_id, {
            diagnosis,
            treatment_performed,
            notes,
            follow_up_recommended,
        });

        res.status(201).json({ message: 'Treatment note added.', note });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/treatment-notes/:appointmentId
 */
export const getNotes = async (req, res, next) => {
    try {
        const notes = await getTreatmentNotes(req.dentist.id, req.params.appointmentId);
        res.json({ notes });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/patients/:patientId/history
 */
/**
 * GET /api/v1/doctor/patients/:id
 * 👤 Get full patient profile details.
 */
export const getPatientDetail = async (req, res, next) => {
    try {
        const patient = await getPatientProfile(req.params.patientId);
        res.json(patient);
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/doctor/patients/:id/history
 */
export const patientHistory = async (req, res, next) => {
    try {
        const history = await getPatientHistory(req.params.patientId);
        res.json({ treatment_history: history });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/doctor/patients/:id/appointments
 * 📅 Get all appointments for a patient.
 */
export const getPatientAppointmentsHandler = async (req, res, next) => {
    try {
        const { status, sort, page, limit } = req.query;
        const appointments = await getPatientAppointments(
            req.params.patientId,
            status,
            sort,
            page,
            limit
        );
        res.json(appointments);
    } catch (err) {
        next(err);
    }
};

// ── Appointment Actions ──

/**
 * PATCH /api/doctor/appointments/:id/start
 * 🪑 Mark appointment as IN_PROGRESS when patient sits in the chair.
 * Allows supervisor to see real-time status on their dashboard.
 */
export const startAppointmentHandler = async (req, res, next) => {
    try {
        const appointment = await startAppointment(req.dentist.id, req.params.id);
        res.json({ message: 'Appointment started. Patient seated.', appointment });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/doctor/appointments/:id/complete
 */
export const markComplete = async (req, res, next) => {
    try {
        const appointment = await completeAppointment(req.dentist.id, req.params.id);
        res.json({ message: 'Appointment marked as completed.', appointment });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/doctor/appointments/:id/no-show
 * 👻 Mark appointment as NO_SHOW (patient didn't arrive).
 * Doctor can do this instead of calling front desk.
 */
export const markNoShowHandler = async (req, res, next) => {
    try {
        const { notes } = req.body || {};
        const appointment = await markAppointmentNoShow(req.dentist.id, req.params.id, notes);
        res.json({
            message: 'Appointment marked as no-show.',
            appointment,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/doctor/appointments/:id/medical-info
 * 🚨 Update or add patient's medical alerts/allergies.
 * Doctor can add critical info discovered during visit.
 * Body: { appointment_id, medical_alerts?, allergies? }
 */
export const updateMedicalInfoHandler = async (req, res, next) => {
    try {
        const { appointment_id, medical_alerts, allergies } = req.body;
        if (!appointment_id || (!medical_alerts && !allergies)) {
            return res.status(400).json({
                error: 'appointment_id and at least one of medical_alerts or allergies are required.',
            });
        }

        const result = await updatePatientMedicalInfo(req.dentist.id, appointment_id, {
            medical_alerts,
            allergies,
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/doctor/follow-ups
 * Body: { appointment_id, recommended_service_id?, recommended_date?, reason, urgency? }
 */
export const addFollowUp = async (req, res, next) => {
    try {
        const { appointment_id, recommended_service_id, recommended_date, reason, urgency } =
            req.body;

        if (!appointment_id || !reason) {
            return res.status(400).json({ error: 'appointment_id and reason are required.' });
        }

        const followUp = await createFollowUp(req.dentist.id, {
            appointment_id,
            recommended_service_id,
            recommended_date,
            reason,
            urgency,
        });

        res.status(201).json({
            message: 'Follow-up created. Patient notified.',
            follow_up: followUp,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/doctor/appointments/:id/delay
 * Body: { delay_minutes, reason? }
 */
export const reportAppointmentDelay = async (req, res, next) => {
    try {
        const { delay_minutes, reason } = req.body;

        if (!delay_minutes || delay_minutes < 1) {
            return res
                .status(400)
                .json({ error: 'delay_minutes is required and must be positive.' });
        }

        const result = await reportDelay(req.dentist.id, req.params.id, delay_minutes, reason);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

// ── Content Management (Doctor Profile) ──

/**
 * GET /api/doctor/profile
 *
 * Get own profile info (bio, specialization, photo).
 */
export const getProfile = async (req, res, next) => {
    try {
        const profile = await getDoctorProfile(req.dentist.id);
        res.json({ profile });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/doctor/profile
 *
 * Update own profile (bio, specialization, photo_url).
 * Body: { bio?, specialization?, photo_url?, license_number? }
 */
export const updateProfile = async (req, res, next) => {
    try {
        const profile = await updateDoctorProfile(req.dentist.id, req.body);
        res.json({ message: 'Profile updated.', profile });
    } catch (err) {
        next(err);
    }
};

// ═══════════════════════════════════════════════
// SCHEDULE CHANGE REQUESTS & FEEDBACK
// ═══════════════════════════════════════════════

/**
 * POST /api/doctor/schedule-request
 *
 * Request a schedule change (supervisor approves).
 * Body: { request_type, effective_date, end_date?, requested_start_time?, requested_end_time?, day_of_week?, reason }
 */
export const requestScheduleChangeHandler = async (req, res, next) => {
    try {
        const { request_type, effective_date, reason } = req.body;
        if (!request_type || !effective_date || !reason) {
            return res
                .status(400)
                .json({ error: 'request_type, effective_date, and reason are required' });
        }

        const data = await requestScheduleChange(req.dentist.id, req.body);

        // TODO: Trigger notification to supervisor
        res.status(201).json({
            message: 'Schedule change request submitted to supervisor.',
            request: data,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/schedule-requests
 *
 * View own pending/approved/rejected schedule requests.
 */
export const getMyScheduleRequests = async (req, res, next) => {
    try {
        const requests = await getScheduleRequests(req.dentist.id);
        res.json({ requests });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/doctor/my-feedback
 *
 * View own ratings and feedback.
 */
export const getMyFeedback = async (req, res, next) => {
    try {
        const feedback = await getDoctorFeedback(req.dentist.id);
        res.json({ feedback });
    } catch (err) {
        next(err);
    }
};
