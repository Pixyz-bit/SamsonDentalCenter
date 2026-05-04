# Detailed Implementation Guide: Guest Booking Polish & Abuse Prevention

This document translates the architectural plan from `APP-USER-GUESTBOOKING.md` into actionable,
file-by-file developer steps tailored to your current codebase.

## Stage 1: UI Polish (Visuals)

### 1. Hide Global Footer (`apps/user/src/pages/GuestBooking.jsx` or similar) [DONE]

- Locate the main wrapper or top-level component for the guest booking route.
- If the `<Footer />` is located in your `PublicLayout.jsx`, update the layout to accept a
  `hideFooter` prop or check `useLocation().pathname` to optionally render the Footer.
- Verified: `PublicLayout.jsx` already hides the footer for `/book`.

### 2. Add Patient Note Field & Terms Checkbox (`apps/user/src/components/guest-booking/InfoStep.jsx`) [DONE]

- Locate the bottom of the form before the navigation buttons inside `InfoStep.jsx`.
- Insert a textarea for the note and the terms checkbox.
- Update the "Next" button in this step to require the checkbox.

### 3. Cleanup Success Screen (`apps/user/src/components/guest-booking/GuestBookingSuccess.jsx`) [DONE]

- **Remove** the block of UI prompting the user to "Upgrade to User / Create Account".
- **Remove** the `Doctor`, `Request ID` fields. (Reference ID kept per user request).
- **Extract** the "Return to Home" button out of the central white card.
- **Implement** high-fidelity receipt layout and mobile-responsive sticky footer.

---

## Stage 2: Frontend State & Timer Migration

### 1. Update State Hook (`apps/user/src/hooks/useGuestBooking.js`)

- Update the default `initialFormData` object to include `patient_note: ''` and
  `agreed_to_terms: false`.
- Ensure the `guest_booking_state` is continuously persisted to `localStorage` (from your
  `USER-OTP-IMPROVEMENT.md` plan).

### 2. Relocate the Timer Visual (`DateTimeStep.jsx` -> `GuestBookingWizard.jsx`) [DONE]

- Open `DateTimeStep.jsx` and **delete** the progress bar/timer visual at the bottom.
- Open `GuestBookingWizard.jsx` (which orchestrates the steps and mounts the `StepIndicator`).
- Pass the hold timer state to the `StepIndicator`.

- Update `StepIndicator.jsx` to parse `timeRemaining` (format it as `MM:SS`) and render it in the
  top right corner. Ensure that on mobile devices, labels like "Step 3/5" are condensed to
  accommodate the timer without wrapping aggressively.

---

## Stage 3: Backend API Validation & DB Updates [DONE]

### 0. Database Schema Update (Pre-requisite)
- [PENDING MANUAL SQL] Run migration to add `accepted_terms` and `terms_accepted_at`.

### 1. New Validator Service (`apps/api/src/services/appointment-validation.service.js`) [DONE]
- Implemented Overlap Guard, Volume Cap, and Service Lock logic.

### 2. New Route (`apps/api/src/routes/appointments.routes.js`) [DONE]
- Mounted `router.post('/guest-validate', ...)` with Zod schema.

---

## Stage 4: Integration Bridge [DONE]

### 1. Intercept Confirmation (`apps/user/src/components/guest-booking/ConfirmStep.jsx`) [DONE]
- Updated `GuestBookingWizard.jsx` to call `validateBooking()` before `sendGuestOTP()`.

### 2. Final Payload Injection [DONE]
- Updated `useGuestBooking.js` to send `patient_note`, `accepted_terms`, and `terms_accepted_at` in the final booking payload.
