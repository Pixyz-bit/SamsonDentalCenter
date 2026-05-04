import { Router } from 'express';
import {
    bookGuest,
    confirmEmail,
    resendConfirmation,
    bookUser,
    submitWizard,
    getMyAppointments,
    getOne,
    cancel,
    reschedule,
    guestCancelInfo,
    guestCancelConfirm,
    guestRescheduleInfo,
    guestRescheduleConfirm,
    holdSlotHandler,
    releaseSlotHold,
    getActiveHoldHandler,
    guestValidate,
} from '../controllers/appointments.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validate.js';
import {
    bookGuestSchema,
    confirmEmailSchema,
    resendConfirmationSchema,
    bookUserSchema,
    submitWizardSchema,
    getMyAppointmentsSchema,
    getOneSchema,
    cancelSchema,
    rescheduleSchema,
    guestActionSchema,
    guestRescheduleConfirmSchema,
    holdSlotSchema,
    releaseHoldSchema,
    guestValidateSchema,
} from '../schemas/appointment.schema.js';

const router = Router();

// --- 1. Public/Optional Routes ---
// Allows guests to book
// allows guests to book
router.post('/guest-validate', validate(guestValidateSchema), guestValidate); // Pre-flight checks
router.post('/book-guest', validate(bookGuestSchema), optionalAuth, bookGuest); // Guest books → PENDING

router.get('/confirm-email', validate(confirmEmailSchema), confirmEmail); // Guest clicks email link → CONFIRMED
router.get('/confirm', validate(confirmEmailSchema), confirmEmail); // Alias for frontend compatibility
router.post('/resend-confirmation', validate(resendConfirmationSchema), resendConfirmation); // Guest requests new email

// Add these public routes (no auth — token-based):
router.get('/guest/cancel', validate(guestActionSchema), guestCancelInfo); // Show cancel confirmation page
router.post('/guest/cancel', validate(guestActionSchema), guestCancelConfirm); // Guest confirms cancel
router.get('/guest/reschedule', validate(guestActionSchema), guestRescheduleInfo); // Show slot picker page
router.post('/guest/reschedule', validate(guestRescheduleConfirmSchema), guestRescheduleConfirm); // Guest confirms reschedule

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

export default router;
