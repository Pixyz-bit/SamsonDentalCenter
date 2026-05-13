// Appointment status values — use these everywhere instead of typing strings
// ✅ NOTE: Waitlist entries are stored in the WAITLIST table, not as appointments.
// Appointments only exist when a slot is secured (PENDING or CONFIRMED).
export const APPOINTMENT_STATUS = {
    PENDING: 'PENDING', // Awaiting to be approve by secretary (e.g., specialized service) [Patient, Secretary and Admin]
    CONFIRMED: 'CONFIRMED', // Approved and upcoming for the patient [Patient, Secretary and Admin]
    //Rejected - when booking is rejected by secretary [Patient, Secretary and Admin]
    IN_PROGRESS: 'IN_PROGRESS', // 🪑 Patient seated, treatment in progress [Secretary and Admin]
    //Present - once the patient showed up in the clinic
    LATE_CANCEL: 'LATE_CANCEL', // Cancelled less than 24h before appointment [Patient, Secretary and Admin]
    CANCELLED: 'CANCELLED', // Cancelled with ≥24h notice [Patient, Secretary and Admin]
    COMPLETED: 'COMPLETED', // Treatment done (dentist marks this) [Patient, Secretary and Admin]
    NO_SHOW: 'NO_SHOW', // Patient didn't show up, automatically triggers once the time has passed [Patient, Secretary and Admin]
    DISPLACED: 'DISPLACED', // Displaced appointment (e.g., due to doctor unavailability)
};

// Waitlist status values
export const WAITLIST_STATUS = {
    WAITING: 'WAITING', //Waiting for the slot to open up
    NOTIFIED: 'NOTIFIED', //The slot opened and ready to be claimed under 25 minutes
    CONFIRMED: 'CONFIRMED', //You claimed the open slot within 25 minuutes
    EXPIRED: 'EXPIRED', //You didnt claim the open slot within 25 minutes
    CANCELLED: 'CANCELLED', //You cancelled your spot on the waitlist
};

// Appointment source tracking
export const APPOINTMENT_SOURCE = {
    WALK_IN: 'WALK_IN',
    GUEST_BOOKING: 'GUEST_BOOKING',
    USER_BOOKING: 'USER_BOOKING',
    WAITLIST: 'WAITLIST',
};

// User roles
export const USER_ROLES = {
    PATIENT: 'patient',
    DENTIST: 'dentist',
    SUPERVISOR: 'supervisor', // Renamed from 'admin' for clarity
    ADMIN: 'admin', // Keep for backward compat (treated same as supervisor)
};

// ── NEW: Service tier classification ──
export const SERVICE_TIER = {
    GENERAL: 'general',
    SPECIALIZED: 'specialized',
};

// ── NEW: Dentist tier (which services they handle) ──
export const DENTIST_TIER = {
    GENERAL: 'general',
    SPECIALIZED: 'specialized',
    BOTH: 'both',
};

// ── NEW: Approval status for specialized services ──
export const APPROVAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};

// Clinic configuration
export const CLINIC_CONFIG = {
    OPENING_HOUR: 8, // 8:00 AM
    CLOSING_HOUR: 17, // 5:00 PM
    SLOT_DURATION_MINUTES: 30, // Each appointment slot is 30 minutes
    WAITLIST_TIMEOUT_MINUTES: 25, // 25 min to confirm waitlist offer
    WAITLIST_MIN_NOTICE_MINUTES: 180, // 3-hour minimum notice before slot
    WAITLIST_GLOBAL_LIMIT: 3, // Max 3 active waitlist entries at a time
    CANCEL_NOTICE_HOURS: 24, // <24h = LATE_CANCEL
    NO_SHOW_GRACE_MINUTES: 15, // Wait 15 min past appointment time before marking no-show
    NO_SHOW_RESTRICT_THRESHOLD: 3, // 3+ no-shows → restrict patient booking
    NO_SHOW_RESTRICT_ADVANCE_DAYS: 5, // Restricted patients can only book 3 days ahead
    CANCEL_RESTRICT_THRESHOLD: 3, // 3+ cancellations → restrict patient booking
    REMINDER_HOURS: [48, 24], // Send reminders 48h and 24h before
    CONFIRM_REMINDER_HOURS: 48, // 48h reminder asks patient to confirm
    EMERGENCY_BUFFER_SLOTS: 1, // Reserve 1 slot per day for emergencies
    OVERBOOK_LOW_RISK_PERCENT: 10, // Allow 10% overbooking on low no-show risk hours
    GUEST_CONFIRM_EXPIRY_MINUTES: 15, // Guest must confirm via email within 15 minutes
    MAX_ADVANCE_BOOKING_MONTHS: 3, // Online booking up to 3 months ahead
    NO_SAME_DAY_ONLINE: true,
    MAX_OTP_FAILED_ATTEMPTS: 5,
    MAX_DEPENDENTS_PER_USER: 10,
    MAX_ACTIVE_APPOINTMENTS_PER_ACCOUNT: 3,
    MAX_ACTIVE_APPOINTMENTS_PER_INDIVIDUAL: 3,
};
