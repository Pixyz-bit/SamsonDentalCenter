# Patient Management & Data Standardization Guide

This document standardizes the terminology, architecture, and workflows for patient management. The
core philosophy is **"Profile First, Appointments Second."** We are shifting away from scattered,
isolated appointment records towards a **Centralized Patient Management System**.

---

## 1. Standardized Terminology

To avoid confusion among developers, admins, and the system, we must use precise terminology for
every entity.

### System Entities

- **Patient Profile (The Clinical Record):** The single source of truth for a person's medical and
  demographic data. Every patient has exactly _one_ Patient Profile. All appointments, charts, and
  notes are attached to this Profile.
- **User Account (The Login):** The authentication credentials (Email/Password) used to access the
  online portal. Not every Patient Profile has a User Account.
- **Appointment Record:** A booking instance. This is **strictly a child** of a Patient Profile. You
  can never create an appointment without linking it to a Profile.

### Profile States

- **Offline Profile:** A Patient Profile with NO email and NO User Account. Usually created rapidly
  at the front desk for walk-ins.
- **Inactive Account:** A Patient Profile _with_ an email address on file, but the patient has not
  verified it or set a password yet. They cannot log in yet.
- **Active Account:** A Patient Profile linked to a fully functional User Account. The patient can
  log into the portal.

### Dependency Terminology

- **Primary Profile:** The main Patient Profile that owns the login email address.
- **Dependent Profile:** An Offline Profile that has been linked to a Primary Profile. The Primary
  Profile handles bookings on behalf of the Dependent.

---

## 2. Staff & Doctor Management Standards

Unlike Patients, internal team members (Doctors, Admins, Receptionists) have strict requirements
regarding system access and auditing.

### Rule: Distinct Entities, Shared Rules

It is perfectly fine—and often better for user experience—to keep Doctors and Staff on completely
separate pages with their own "Add" workflows. A Doctor has clinical data (schedules, specialties,
licenses), while a Staff member has administrative data (access levels, shifts). However, both must
adhere to the following backend security rules:

1. **Mandatory Work Email:** Every staff member and doctor **must** have a unique email address upon
   creation. There are no "Offline Staff" accounts. This ensures accountability and auditability for
   every action taken in the system.
2. **The "Pending Setup" Invite Flow:**
    - **Doctors:** Admin clicks **[Add Doctor]** on the Doctors page, inputs clinical details and
      email.
    - **Staff:** Admin clicks **[Add Staff]** on the Staff page, inputs administrative details and
      email.
    - The record is created in a "Pending" state. The system automatically sends an "Account Setup"
      email to their work email.
    - They click the link, set their password, and become **Active**.
3. **Auditing:** From that point forward, any action they take (Booking an appointment, updating a
   medical record) is stamped with their unique ID.

---

## 3. Core Architectural Rules

### Rule #1: Profile First, Appointments Second

We no longer "Add an Appointment" by filling out scattered patient details for every new booking.

- **The Old Way (Bad):** Patient walks in -> Fill out form with Name, Phone, Time -> Saves an
  isolated Appointment. No tracking of history.
- **The New Way (Standard):** Patient walks in -> Ensure they have a **Patient Profile** (Create an
  Offline Profile if new) -> Go to their Profile -> Click **"Add Appointment"**. The appointment is
  permanently attached to their Profile.

### Rule #2: Single Source of Truth

If a patient visits 10 times, they have **1 Patient Profile** and **10 Appointment Records**
attached to it, NOT 10 isolated records.

### Rule #3: Strict Decoupled Creation (The Email Collision Rule)

To prevent front-desk bottlenecks, profile creation must be lightning fast. If an Admin tries to
create a new Patient Profile and enters an email that is _already in the system_, the system
strictly blocks it.

**Action Options on Collision:**

1.  **[Go Back / Edit Email]:** Admin fixes a typo.
2.  **[Save as Offline Profile]:** Admin strips the email field temporarily and forcefully creates
    the record so the patient can be seated immediately. _Note: We DO NOT handle dependency linking
    or OTP flows during the creation popup to save time._

### Rule #4: The Fuzzy Match Intercept (Duplicate Prevention)

Even if emails don't collide (or no email is provided), we must prevent creating a duplicate record
if the patient forgot they've been to the clinic before.

- **The Check:** As the Admin types the details (Name, DOB, Phone), the system runs a fast, "fuzzy
  match" comparison against existing records.
- **The Warning Modal:** If a very close match is found (e.g., similar name + exact DOB, or exact
  same Phone Number), the system pauses creation.
- **Action Options:**
    1.  **[View Existing Profile]:** "Ah, this is them! Let's book on their existing profile."
        (Stops creation).
    2.  **[Continue as New Profile]:** "No, this is genuinely a different person with a similar
        name." (Allows creation).

---

## 4. The Standardized Workflows

### Workflow A: The Standard Walk-In

1. Patient arrives. Admin searches their Name/Phone.
2. No match found. Admin clicks **"Create Patient Profile"**.
3. Admin inputs Name, Phone, DOB. (Email left blank).
4. System creates an **Offline Profile**.
5. Admin clicks **"Book Appointment"** directly from their newly generated Profile view.

### Workflow B: The Email Collision & Later Linking (Decoupled Flow)

1. Mother (already an Active Account) brings in her son.
2. Admin clicks **"Create Patient Profile"** for the son and enters the Mother's email.
3. System triggers **Email Collision Warning**.
4. Admin clicks **[Save as Offline Profile]** (which clears the email field). The son's profile is
   created instantly.
5. Admin books the son's appointment.
6. **Later (The Linking Phase):** The Admin goes to the Mother's patient record, clicks the
   **"Manage Dependents"** tab, searches for the son's Offline Profile, and links them. (Or the
   mother does this herself in her online portal).

### Workflow C: The Upgrading Process (Converting Offline to Active)

If an Offline Profile decides they want portal access:

1. Admin edits their Patient Profile and adds their email address.
2. The Profile becomes an **Inactive Account**.
3. Admin clicks **"Send Account Setup Link"**.
4. Patient verifies identity and creates a password.
5. The Profile becomes an **Active Account**.

---

## 5. UI/UX Calling Conventions

When designing the application, use these exact phrases in buttons and headers to maintain
consistency:

- **[Create Patient Profile]** (Instead of Add Patient or New Record)
- **[Book Appointment]** (Instead of Add Appointment or New Booking)
- **[Merge Profiles]** (Utility to combine two profiles into one)
- **[Manage Dependents]** (Instead of Add Family Member)
- **[Send Setup Link]** (Instead of Invite Patient)
- **[Save as Offline Profile]** (Fallback button during creation)

By adhering to this centralized architecture, the system moves from scattered booking data to robust
Health Information Management.
