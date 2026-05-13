# User Booking Wizard: Anti-Abuse & Guardrail Rules

To ensure system stability and prevent booking abuse, the following rules will be implemented and intercepted during the **Review** step (Frontend) and enforced during **Submission** (Backend).

## 1. Dependent Management Limits
- **Max Dependents**: A primary account holder is limited to **10** linked dependent profiles.
- **Enforcement**: 
    - Frontend: The "Add New Member" option in `UserOtherInfoStep` will be disabled once the limit is reached.
    - Backend: Registration of new dependents will fail if the count exceeds 10.

## 2. Appointment Overlap Prevention (Individual)
- **Rule**: An individual (either the primary user or a specific dependent) cannot have two appointments with overlapping time blocks.
- **Example**: If "John Doe" has a cleaning at 08:00 - 09:00, he cannot book a consultation at 08:30.
- **Scope**: Checked against the specific `patient_profile_id` (or primary ID if booking for self).

## 3. Same-Day / Same-Service Guard
- **Rule**: An individual cannot book the same service more than once on the same calendar date.
- **Example**: If "Jane Doe" has a "Cleaning" at 10:00 AM, she cannot book another "Cleaning" at 2:00 PM on the same day.

## 4. Active Appointment Quotas
- **Individual Quota**: Max **3** active (PENDING or CONFIRMED) appointments per individual profile. This means the Primary account can have 3, and each Dependent can independently have 3.
- **Enforcement**: Intercepted in the `UserReviewStep`. If the limit is exceeded, the "Confirm Booking" button will be replaced with a warning message.

## 5. Implementation Roadmap
- [x] **Backend Schema Update**: Add `max_dependents_per_user` and `max_active_appointments` to `clinic_settings`.
- [x] **Validation Logic**: Implement a `validateBookingAbuse` service method to check all rules in a single pass.
- [x] **Frontend Interceptor**: Update `useUserBooking` to perform a pre-flight check when reaching the Review step.
- [x] **UI Feedback**: Replicated the premium Guest Flow error banner in `UserReviewStep` for consistent UX.

## ✅ Accomplishments
- **Pre-flight Validation**: Intercepting rules (Overlap, Quotas, Limits) in the Review step before submission.
- **Premium Error Banner**: User flow now has 1:1 parity with the Guest flow's error handling visuals.
- **Atomic Rollbacks**: Integrated waitlist logic with automatic booking cancellation on failure.

## 🧪 Testing & Verification Checklist

To verify the implementation, perform the following tests in the **User Booking Wizard**:

### 1. Individual Quota Test
- [ ] Book **3** separate appointments for **yourself**.
- [ ] Try to book a **4th** appointment for **yourself**.
- [ ] **Expected**: Upon reaching the **Review Step**, a red banner should appear stating: *"This individual already has 3 active appointments."*
- [ ] **Cross-Check**: Now try to book an appointment for a **dependent** (who has < 3 appointments).
- [ ] **Expected**: This should be allowed, confirming that quotas are independent per person.

### 2. Time Overlap Test
- [ ] Ensure you have an existing appointment (e.g., May 20 at 10:00 AM).
- [ ] Try to book another appointment for the **same person** on May 20 at 10:30 AM.
- [ ] **Expected**: In the **Review Step**, a banner should appear: *"Conflict: This individual already has a [Service] during this time range."*

### 3. Duplicate Service Test
- [ ] Book "Teeth Cleaning" for yourself on May 21.
- [ ] Try to book "Teeth Cleaning" **again** for yourself on the same day (May 21) at a different time.
- [ ] **Expected**: Banner: *"This individual is already booked for this service on this date."*

### 4. Dependent Limit Test
- [ ] Ensure the primary account has **10** dependents.
- [ ] Try to add an **11th** dependent during the booking flow.
- [ ] **Expected**: Validation error: *"You have reached the limit of 10 family members."*

### 5. UI Parity Check
- [ ] Trigger any of the above errors.
- [ ] **Expected**: The error banner should include a red background, an **AlertCircle** icon, a **Notice** badge, and a bulleted list of details, matching the Guest flow's aesthetics.
