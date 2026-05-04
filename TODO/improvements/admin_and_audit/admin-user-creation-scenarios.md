# Admin User Creation Scenarios & Manual Testing Guide

Terminology Guide:

- **Offline Patient**: A walk-in patient record with no email address on file. They do not have
  portal access.
- **Inactive Account**: A patient record with an email address, but the user has not yet verified
  their email or set up a password for the online portal.
- **Active Account**: A patient who has fully registered and uses the online portal.

---

## Scenario 1: The "Offline Patient" (No Email)

**The Situation:** A patient walks in and doesn't provide an email address.

**Admin Action:** Enter Name, Phone, and DOB. Leave the email field blank. Click Save.

**Manual Test Steps:**

1. Log in to the Admin/Secretary portal.
2. Open the "Add Patient" form.
3. Fill in: `Name: Arthur Pendelton`, `Phone: 09123456789`, `DOB: 1955-01-01`.
4. Leave `Email` empty.
5. Click **[Save]**.

**Expected Result:**

- The patient is saved successfully.
- Check the database/profile view: `is_registered` should be `false`, and `email` should be `null`.
- The UI should label this patient as an "Offline Patient".

---

## Scenario 2: The "Inactive Account" (First-Time Email)

**The Situation:** A new patient provides an email address for the first time.

**Admin Action:** Enter details including a new email address. Click Save.

**Manual Test Steps:**

1. Open the "Add Patient" form.
2. Fill in: `Name: Sarah Miller`, `Email: sarah@example.com`, `Phone: 09123456788`.
3. Click **[Save]**.

**Expected Result:**

- Saved successfully.
- Database: `is_registered: false`, `email: sarah@example.com`.
- In the patient's "Security" or "Profile" tab, the **[Send Setup Link]** button should now be
  enabled.

---

## Scenario 3: The "Duplicate Email" (Blocked Creation)

**The Situation:** You try to use Sarah's email (`sarah@example.com`) for her husband, John.

**Manual Test Steps:**

1. Open "Add Patient".
2. Enter `John Miller` but use `sarah@example.com`.
3. Click **[Save]**.

**Expected Result:**

- **The Intercept:** A modal appears stating: "This email belongs to the unregistered patient 'Sarah
  Miller'. Patients cannot share login emails unless linked as dependents later."
- **Test Resolution A (Edit):** Click **[Go Back]**. You can fix the email input.
- **Test Resolution B (Offline):** Click **[Save as Offline Patient]**.
    - _Expected:_ John is created rapidly, but his email field is cleared (null). You are not
      blocked by OTPs.

---

## Scenario 4: The "Active Account Clash"

**The Situation:** You try to create a new profile using an email that already has a fully
registered portal.

**Manual Test Steps:**

1. Identify an **Active Account** (e.g., `mark@example.com`).
2. Try to create a new patient with that same email.

**Expected Result:**

- **The Intercept:** Modal appears: "This email belongs to the active portal user 'Mark'".
- **Expected:** The "Create Anyway" option is strictly disabled. You can only go **[Back]** to fix
  the typo or **[Save as Offline]**.

---

## Scenario 5: Self-Registration (The "OTP is King" Flow)

**The Situation:** Sarah (Inactive Account) goes to the website to sign up herself.

**Manual Test Steps:**

1. Open the Patient Portal (user app) signup page.
2. Enter `sarah@example.com`.
3. Receive and enter the Email OTP.

**Expected Result:**

- **Identity Verified:** Because Sarah passed the OTP check, the system should NOT ask for her Date
  of Birth.
- **Seamless Upgrade:** She is prompted to set a password. After setting it, she is logged in.
- **Check Database:** Sarah's `is_registered` is now `true`.

---

## Scenario 6: Admin-Initiated Invite (The "DOB Gate" & Lockout)

**The Situation:** An Admin sends a link to a patient, but the link is opened by someone else or the
admin made a typo.

**Manual Test Steps:**

1. In Admin, find an Inactive Account and click **[Send Setup Link]**.
2. Open the link from the email.
3. **Identity Check:** The page should ask: "Please verify your Date of Birth to continue."
4. **Test Lockout:** Enter the _wrong_ DOB 3 times.

**Expected Result:**

- On the 3rd fail, the screen should show: "Account Setup Locked. Please contact the clinic."
- Try to use the link again; it should be invalid.
- In Admin, the secretary must "Resend" to generate a new active token.

---

## Scenario 7: Fuzzy Name/DOB Match

**The Situation:** Catching a duplicate before it's created based on name and birthday.

**Manual Test Steps:**

1. Ensure `Jonathan Smith (1990-10-12)` is already in the system.
2. Try to create `Jon Smith (1990-10-12)`.

**Expected Result:**

- As you type or click save, a modal appears: "Potential Existing Record Found: Jonathan Smith".
- You can click **[View Existing]** to stop the duplicate creation.

---

## Scenario 8: The "Manual Merge"

**The Situation:** An Offline Patient (Arthur) creates a portal account later with an email.

**Manual Test Steps:**

1. Create Arthur as an **Offline Patient** (no email).
2. Register Arthur as a **New User** on the portal using `arthur@example.com`.
3. Open the Admin **Merge Records Utility**.
4. Select the "New Active Arthur" as Target and "Old Offline Arthur" as Source.
5. Click **[Merge]**.

**Expected Result:**

- All appointments from the Offline record are moved to the Active record.
- The Offline record is archived/deleted.

---

## Scenario 9: Adding a Dependent via Profile Tab (De-coupled Linking)

**The Situation:** Sarah (Active) wants to link John (Offline) to her email account so she can book
for him.

**Manual Test Steps:**

1. Navigate to Sarah's existing Profile/Appointments tab.
2. Click the viewing dropdown (currently showing "Self: Sarah") and click **[Add Dependency]**.
3. Select/Search for John's offline record.
4. The system requests OTP verification for Sarah's email to authorize the linkage.
5. Enter the OTP.

**Expected Result:**

- John is now linked to Sarah's profile (`primary_profile_id = Sarah's ID`).
- The dropdown now allows toggling between "Self: Sarah" and "Dependent: John".
- The Add Patient creation bottleneck is completely avoided.
