# Admin Workflow: User Creation Strategy

This document outlines the improved strategies and plans for how Admins will handle the creation of
different user types (Doctors, Staff, and Patients). It separates the logic between mandatory staff
accounts and flexible patient accounts, mitigating risks like duplicate walk-in records.

## 1. Doctors & Staff (Mandatory Accounts)

Doctors and administrative staff _must_ have associated login accounts for security, role
management, and audit trailing.

### Workflow:

1. **Creation:** Admin creates the profile inputting basic details (Name, Email, Role, etc.). By
   default, the account is created in an "Invited" or "Pending Setup" state.
2. **Notification:** The system automatically sends an email to the newly created employee with a
   "Create Password" link.
3. **Activation:** The employee clicks the link, sets their password, and their account becomes
   active and ready for login.
4. **Resend Invite:** If the link expires, the Admin can go to the employee's "Security" tab and
   click "Resend Setup Link".

---

## 2. Patients (Flexible "Late-Binding" Accounts)

Patients should not be forced to provide an email or create an account, specifically to accommodate
walk-in scenarios.

**Terminology Guide:**

- **Offline Patient**: No email on file. No portal access.
- **Inactive Account**: Email on file, but portal is not yet set up.
- **Active Account**: Fully registered online portal user.

### The Walk-In Profile Workflow:

1.  **Creation:** Staff creates a record for a walk-in patient. They can choose to leave the email
    blank (Offline Patient) or provide one (Inactive Account).
2.  **Similarity Intercept (The Guard Dog):**
    - **Triangulation Check:** As fields are filled, the system checks for exact matches on
      Phone/Email AND fuzzy matches on Name/DOB to catch typos.
    - **The Intercept:** If a match is found, a "Potential Existing Record" modal displays the
      masked phone and DOB for staff verification.
3.  **Strict Email Policy (Duplicate Prevention):**
    - If an entered email exists (whether attached to an Inactive or Active Account), the system
      blocks simple creation.
    - The Admin UI will strictly restrict options. "Create Anyway" is disabled. The only options
      are:
        - **[Go Back / Edit Email]**: Fix a typo or use a different email.
        - **[Save as Offline Patient]**: Create the record but strip the email, keeping them
          offline.
        - _(Note: Linking dependents is completely decoupled from this creation flow to prevent
          front-desk bottlenecks)._
4.  **Booking:** This profile acts as the clinical record. The Admin/Secretary can now book
    appointments on behalf of this patient.
    - **Audit Trail:** Appointments booked on behalf of a patient by admin must be flagged with
      `booked_by: staff`. When the patient later logs in, these appointments appear tagged as
      _"Booked by clinic"_.

---

## 3. The "Late Email Addition" & Admin Invite Workflow

If a patient is an **Offline Patient** (No Email), their "Security" tab will display:

> _"No email on file — Please add an email address to enable account creation for this patient."_

1. **Pre-Save Check:** When an Admin adds an email, the backend instantly checks if that email
   already exists. If it belongs to another patient, the save is blocked.
2. **The "Send Invite" Trigger:** Saving the email turns them into an **Inactive Account** and
   unlocks the "Send Account Setup Link" button in the Admin UI.
3. **The Secure Setup Token:** When the Admin clicks the button, the backend generates a secure
   token and emails the patient.
4. **The "DOB Gate" (Typo Protection):** To prevent medical data leaks if the Admin typos the email
   address (sending the link to a stranger), Admin-generated setup links include a security gate.
    - The portal asks: _"To access your health records, please verify your identity by entering your
      Date of Birth."_
    - **Lockout Mechanism:** The user has a maximum of 3 attempts to enter the correct DOB. Upon 3
      failures, the token is permanently locked/invalidated. The Admin must generate a new invite.
    - If successful, they create a password and become an **Active Account**.

---

## 4. Self-Registration (Auto-Linking & Merging)

If a patient decides to set up their account online directly via the portal:

### Path A: The Inactive Account Upgrades

1. A patient with an **Inactive Account** (email already on file) signs up online.
2. **OTP is King:** The user verifies their email via OTP. Because they successfully verified the
   OTP, the system trusts their identity.
3. **Bypass DOB Gate:** The system skips the DOB gate (unlike the Admin invite flow) and instantly
   converts the Inactive Account to an Active Account, granting access to their medical history.

### Path B: The Offline Patient Self-Registers

1. An **Offline Patient** (no email on file) registers online.
2. The database checks the email and finds zero matches.
3. **Brand New Account:** The system creates a brand new Active Account.
4. **Manual Merge Required:** The patient now has two disconnected records. During their next clinic
   visit, the Admin must use the "Merge Records" utility to combine their old Offline Patient record
   into their new Active Account.

---

## 5. Duplicate Patient Record Prevention

Implement a pre-creation validation check in the "Add Patient" form.

**Check Criteria:**

- `First Name + Last Name` AND `Birthdate`
- OR matching `Phone Number`

**UX Flow (Duplicate Warning Modal for Names/Phones):** If a match is found:

1. Pause creation. Show warning: _"Potential Existing Record Found."_
2. Provide actions:
    - **[View Existing Record]**: Navigate to the existing profile.
    - **[Continue as New Patient]**: Allows staff to override the warning if it's genuinely two
      different people (e.g., father and son with same name but no email conflict).

### The Fallback: "Merge Records" Utility

- **Function:** Allows Admin to select a "Source" (to remove) and a "Target" (to keep).
- **Data Transfer:** Safely migrates all appointment history, medical logs, and dependents from
  Source to Target.
- **Cleanup:** Archiving the Source profile.

---

## 7. Dependency Management (The De-coupled Flow)

To keep the front-desk operations fast, linking a patient to a family member's email happens _after_
the patient is created, or initiated by the patient themselves.

### The Profile Hierarchy Flow:

1. **The Fallback Creation:** The dependent is first quickly created as an **Offline Patient**
   during their visit.
2. **The Appointment/Profile Tab:** On a fully registered patient's profile (the "Primary" account),
   there is a dropdown selector (defaulting to "Self").
3. **Linking Process:**
    - The user (or Admin on their behalf) clicks the dropdown and selects **"Add Dependency"**.
    - This triggers the OTP consent flow sent to the Primary Account's email to verify they agree to
      link the target Offline Patient.
    - Once the OTP is verified, the Offline Patient is linked.
4. **Result:** Whenever the Primary user logs into the portal, they can toggle the dropdown between
   "Self" and their dependencies to manage appointments and view records for the whole family under
   one login.

---

## 8. Link Expiry & Resend Rules

- **Duration:** Setup links expire exactly **48 hours** after being generated.
- **Single-Use:** Tokens are invalidated immediately after first use.
- **Expiry UX:** _"Your account setup link has expired..."_
- **Resend Cooldown:** Rate-limited to **once every 15 minutes** per recipient.
