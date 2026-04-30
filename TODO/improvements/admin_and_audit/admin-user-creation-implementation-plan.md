# Implementation Plan: Admin User Creation Strategy

This document maps the planned "Admin User Creation Strategy" to the codebase implementation and outlines the required changes.

## Terminology Guide
- **Offline Patient**: A profile with no email (`is_registered: false, email: null`).
- **Inactive Account**: A profile with an email but no portal access yet (`is_registered: false, email: user@email.com`).
- **Active Account**: A fully registered portal user (`is_registered: true, email: user@email.com`).

---

## 1. Database Schema Changes (`d:\webApp\BLUEPRINT\BACKEND\FINAL-COMPLETE-SCHEMA.sql`)

### Required Changes
1. **[MODIFY] `profiles` Table:**
   - Add `is_registered BOOLEAN DEFAULT false`.
   - Make `email` nullable to support purely Offline Patients.
2. **[MODIFY] `appointments` Table:**
   - Add `booked_by UUID REFERENCES profiles(id)` to audit which staff member created the appointment for an Offline/Inactive patient.
3. **[NEW] `account_setup_tokens` Table:**
   - Create a table to store secure setup tokens: `id`, `profile_id`, `token`, `expires_at`, `used_at`, `status` (active/locked), `failed_attempts` (INT DEFAULT 0), `created_at`.

---

## 2. API & Backend Services

### Required Changes

#### [MODIFY] `apps\api\src\services\admin.service.js`
- **Update `quickRegisterPatient`**:
  - Support creating Offline/Inactive profiles (`is_registered: false`).
  - **Email Conflict Handling**: If an email exists, return `CONFLICT_RESOLUTION_REQUIRED`. Do not throw generic errors.
  - **Conditional Processing**:
    - If `resolution: 'LINK_DEPENDENT'`: Require and verify an OTP sent to the primary email. Then create the record in `patient_profiles`.
    - If `resolution: 'FORCE_OFFLINE'`: Create a new standalone record in `profiles` but **nullify the email field** to allow the registration to proceed without uniqueness violations.
- **Add `checkDuplicatePatient(firstName, lastName, dob, phone, email)`**:
  - Implement loose matching to flag potential duplicates (Name/DOB or Phone).
- **Add `mergePatientRecords(sourceId, targetId)`**:
  - Utility to migrate appointments, notes, and delete the source profile.

#### [MODIFY] `apps\api\src\controllers\admin.controller.js`
- **Expose `checkDuplicatePatient` and `mergePatientRecords`**.
- **Add `sendAccountSetupLink`**: Generate token, save to `account_setup_tokens`, trigger email. Implement 15-min cooldown rate limit.

#### [MODIFY] `apps\api\src\services\auth.service.js`
- **Implement Interception & Auto-Linking**:
  - During standard portal registration, after OTP verify, check if the email belongs to an Inactive Account (`is_registered: false`).
  - If yes, **automatically convert** them to an Active Account (`is_registered: true`). The OTP verification is sufficient identity proof; **no DOB gate is required**.
- **Implement `verifyAdminInviteToken` Endpoint**:
  - Accept `token` and `dob`.
  - If DOB is wrong, increment `failed_attempts` in `account_setup_tokens`. If `failed_attempts >= 3`, set `status = 'locked'` and return a specific lockout error.

---

## 3. Frontend Implementation (Admin/Secretary & Patient Portal)

### Required Changes

#### [MODIFY] `apps/admin` & `apps/secretary`
1. **Patient Creation Form (`AddPatientModal`)**:
   - **Similarity Intercept**: Trigger `checkDuplicatePatient` API on blur.
   - **Email Conflict Modal**: If the backend flags an existing email, strictly limit options:
     - **Option A: "Go Back / Edit Email"**: Focuses the input to fix typos.
     - **Option B: "Save as Offline Patient (No Email)"**: Re-submits without the email.
     - **Option C: "Request Consent to Link as Dependent"**: Triggers an OTP to the email owner, requiring the Admin to input the OTP before linking.
     - *Note: "Create Anyway" with the duplicated email is completely disabled.*
   - **Potential Match Modal (Name/Phone)**: Display DOB and masked Phone for staff verification.
2. **Merge Records Utility**:
   - Build UI to select "Source" (duplicate) and "Target" (master).

#### [MODIFY] `apps/user` (Patient Portal)
1. **The "DOB Gate" Security (Admin Invites Only)**:
   - In `/setup-account/:token`, demand the Date of Birth.
   - Display attempts remaining (max 3). If locked, show a clear message instructing them to contact the clinic.
2. **Self-Registration (No DOB Gate)**:
   - Ensure the standard signup flow automatically upgrades an Inactive Account to Active without prompting for DOB, as the OTP handles verification.

---

## Technical Action Items

- [x] Update `profiles` schema with `is_registered`, `primary_profile_id`, and `is_active`.
- [ ] Implement fuzzy search for `checkDuplicatePatient` (Name/DOB/Phone).
- [ ] Update `AddPatientModal` UI with the strict Email Conflict options.
- [ ] Implement OTP consent flow for Admin-initiated dependent linking.
- [ ] Implement the `account_setup_tokens` table with the 3-attempt lockout logic.
- [ ] Implement 15-minute cooldown rate limit on "Resend Setup Link".
- [ ] Build the "Merge Records" backend logic and frontend utility.
- [ ] Implement the "DOB Gate" verification step (with lockout UI) for the invite link flow.
- [ ] Implement the seamless OTP upgrade for self-registering Inactive Accounts.
