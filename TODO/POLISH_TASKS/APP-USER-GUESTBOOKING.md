# Guest Booking UI/UX Polish & Abuse Prevention Strategy

This document outlines the tasks, architecture review, and step-by-step implementation plan for
polishing the Guest Booking frontend and introducing strict backend validation rules to prevent
calendar spam, overlapping slots, and "double-dipping".

---

## 📋 1. Task Checklist

**UI/UX Polish**

- [x] **Optional Note Field:** Add an optional "Note for the clinic" textarea at the bottom of the
      Info Step (Step 3). [ALREADY IMPLEMENTED]
- [x] **Remove Redundant Timer:** Remove the old time hold visual indicator from the bottom of
      `DateTimeStep.jsx`.
- [x] **Polish Step Navbar:** Clean up `StepIndicator.jsx` so it is less crowded. Ensure it
      accurately reflects the dynamic progress sync of the time hold.
- [x] **Refine Success Step Banner:** Expand the Step Navbar to cleanly show a visually distinct
      "Success" (Complete) state.
- [x] **Guest Success Card Overhaul:** Extract the "Home" button outside the white card. Remove the
      "Upgrade to User / Create Account" section. Only show the booking summary: Service Name, Date,
      Start Time, and End Time (compute using duration).
- [x] **Terms Checkbox:** Add a mandatory Terms of Service checkbox in Info Step.
- [x] **Hide Footer:** Ensure the global Footer is hidden during the entire Guest Booking flow to
      minimize distractions.

**Friction & Abuse Prevention Rules (Backend Validations)**

- [x] **1. The Overlap Guard:** Strictly prevent the same email from booking overlapping times, even
      under different guest names.
- [x] **2. The Volume Cap:** Hard limit of max 3 active (pending/confirmed) bookings per email.
- [x] **3. The Service Lock:** Prevent the same email from booking the exact same service on the
      same day.
- [x] **Verification Injection Point:** These rules must run when "Confirm Booking" is clicked on Step
      4, _before_ sending the OTP email.
- [x] **Scroll to Error:** Automatically scroll to the first invalid field on Info Step if validation fails.
- [x] **High-Fidelity Failure Alerts:** Redesigned the "Booking Blocked" alert banner to be more prominent and descriptive.
- [x] **Global Error Toast:** Added a global toast notification for booking failures.
- [x] **Dynamic Clinic Info:** Pulse clinic phone number directly from settings for error guidance.
- [x] **Region-Specific Validation:** Enforced strict 10-digit limit and validation for PH (+63) phone numbers.
- [x] **Real-time Input Polish:** Added visual email validation icons and 2-minute hold warnings.

---

## 🔍 2. Plausibility & Architecture Review

_Does this fit the current implementation without breaking it?_ **Yes, absolutely.**

- **Database:** **No schema changes required.** The validations can be achieved strictly through
  read-only `SELECT` queries checking the `appointments` table and `profiles` table for matching
  emails and statuses.
- **Backend:** Your auth layer (`sendGuestOTP`) remains pure and untouched. We will introduce a
  dedicated lightweight "Pre-validation" endpoint specifically for these business rules.
- **Frontend:** `useGuestBooking.js` is already designed to handle pre-flight checks before
  advancing steps. Adding a new `patient_note` field to `formData` fits seamlessly into your
  `updateField` logic.

---

## 🛠 3. Safe Implementation Strategy (Execution Order)

To ensure we do not break your currently working booking flow, this plan is ordered sequentially
from **Zero-Risk (Visuals)** to **Isolated Additions (Backend)** and finally the **Integration
Bridge**. You can test after every stage.

### Stage 1: Pure UI Polish (Zero Risk)

_These changes are strictly visual and will not affect any underlying booking logic or state._ **1.
App Layout (Hide Global Footer)**

- Update the `/guest-booking` route wrapper or layout component to hide the `<Footer />` component
  to ensure focus. **2. GuestBookingSuccess.jsx Refactor**
- Strip out the "Upgrade to User / Create Account" UI section entirely.
- Filter the summary list to show only: Service Name, Date, Start Time, and End Time. (Remove Doctor
  name, Request ID, and Ref ID).
- Move the "Return Home" button outside of the white summary card. **3. InfoStep.jsx (Add Note UI)**
- Add a visually appealing `textarea` field for "Note for the clinic (Optional)" at the bottom of
  the form.

### Stage 2: Frontend State & Timer Migration (Low Risk)

_Here we update the React hooks to track the note and move the timer visually._ **1. Form State
Updates (`useGuestBooking.js`)**

- Add `patient_note: ''` to the default `formData`.
- Wire the new text area in `InfoStep.jsx` to update this field via the existing `updateField`
  logic. **2. Timer UI Relocation (`DateTimeStep.jsx` & `GuestBookingWizard.jsx`)**
- Rip out the `Hold Status Indicator` (progress bar) from the bottom of `DateTimeStep.jsx`.
- Pass the `slotHold.timeRemaining` and `slotHold.activeHold` props into your top-level `<header>`
  or `StepIndicator` inside `GuestBookingWizard.jsx`.
- Polish `StepIndicator.jsx` to handle smaller screens gracefully (e.g., hiding descriptive labels
  and showing simple icons or "Step 3/5").

### Stage 3: Backend API Addition (Isolated & Safe)

_We build the new validation engine on the backend. Because this is a brand new endpoint, it has a
0% chance of breaking your existing live endpoints._ **1. The Service
(`appointment-validation.service.js`)**

- Create isolated Supabase queries for the 3 rules (Volume Cap, Service Lock, Overlap Guard). **2.
  The Controller & Route**
- Add a new `guestValidateController` accepting `{ email, date, time, service_id, duration }`.
- Mount it to `router.post('/guest-validate', ...)` in `appointments.routes.js`.

### Stage 4: The Integration Bridge (Final Wiring)

_This is the only part where we modify existing core booking logic. We connect the new validations
to the "Confirm" button and pass the note._ **1. Intercepting the Confirmation (`useGuestBooking.js`
& `ConfirmStep.jsx`)**

- Currently, hitting "Confirm Booking" directly triggers `sendGuestOTP()`. Change this flow to:
    1. Call the new `/guest-validate` endpoint.
    2. **If it fails:** Catch the specific error string, display it dynamically as a red alert
       banner at the top of Step 4, and **stop execution**. (No OTP email is sent).
    3. **If it passes:** Proceed to call `sendGuestOTP()` and move to Step 5 as it does currently.
       **2. Saving the Patient Note**
- Add `patient_note: formData.patient_note` to the final `/appointments/book-guest` payload inside
  the `submit()` function so the backend receives and records it to the database.

---

## 🚀 4. What to Expect When Finished (Scenarios)

| Trigger Event                                          | Expected Behavior                                                                                                                                                                                       |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User tries to book 4th appointment with same email** | Clicks "Confirm" on Step 4. UI freezes briefly, then a red banner appears at the top of Step 4: _"You have reached the limit of 3 active bookings..."_ No OTP email is sent.                            |
| **Mom tries to book 2 "Teeth Whitening" on May 10**    | Clicks "Confirm" on Step 4 for the 2nd booking. Red banner appears: _"A Teeth Whitening is already scheduled for this email on this date..."_ No OTP email is sent.                                     |
| **User types a note**                                  | Completes the booking. The clinic admin sees the patient's custom note inside the `treatment_notes` or `appointment_comments` associated with the new appointment.                                      |
| **User finishes booking (Success Screen)**             | They see a clean, distraction-free success card confirming just their Date/Time and Service. The button to go Home sits completely outside the summary box. The top Navbar cleanly says ✅ **Success**. |
| **Screen Size Changes**                                | The Step Navbar dynamically scales without overlapping, replacing long text with clean indicators while a centralized Hold Timer counts down globally at the top.                                       |
