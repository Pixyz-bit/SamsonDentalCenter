import { Router } from 'express';
import {
    bookGuest,
    bookUser,
    submitWizard,
    getMyAppointments,
    getOne,
    cancel,
    reschedule,
    holdSlotHandler,
    releaseSlotHold,
    releaseSlotHoldBySession,
    getActiveHoldHandler,
    guestValidate,
} from '../controllers/appointments.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validate.js';
import {
    bookGuestSchema,
    bookUserSchema,
    submitWizardSchema,
    getMyAppointmentsSchema,
    getOneSchema,
    cancelSchema,
    rescheduleSchema,
    holdSlotSchema,
    releaseHoldSchema,
    releaseHoldBySessionSchema,
    guestValidateSchema,
} from '../schemas/appointment.schema.js';

const router = Router();

// --- 1. Public/Optional Routes ---
// Allows guests to book
// allows guests to book
router.post('/guest-validate', validate(guestValidateSchema), guestValidate); // Pre-flight checks
router.post('/book-guest', validate(bookGuestSchema), optionalAuth, bookGuest); // Guest books → PENDING



// --- 2. Protected Routes ---
// These strictly require a login to see personal data
router.post('/book-user', validate(bookUserSchema), requireAuth, bookUser); // Patient books → CONFIRMED immediately
router.post('/submit-wizard', validate(submitWizardSchema), requireAuth, submitWizard); // Atomic Unified submission

router.get('/my', validate(getMyAppointmentsSchema), requireAuth, getMyAppointments);
router.get('/:id', validate(getOneSchema), requireAuth, getOne);

router.patch('/:id/cancel', validate(cancelSchema), requireAuth, cancel);
router.patch('/:id/reschedule', validate(rescheduleSchema), requireAuth, reschedule);

// ── Slot holding (RACE CONDITION FIX) ──
router.post('/slots/hold', validate(holdSlotSchema), optionalAuth, holdSlotHandler); // Hold a slot for 5 min
router.get('/slots/active-hold', optionalAuth, getActiveHoldHandler); // Check for existing hold
router.post('/slots/release-hold', validate(releaseHoldSchema), optionalAuth, releaseSlotHold); // Release a held slot
router.post('/slots/release-session-hold', validate(releaseHoldBySessionSchema), optionalAuth, releaseSlotHoldBySession); // Release all held slots for a session

export default router;
