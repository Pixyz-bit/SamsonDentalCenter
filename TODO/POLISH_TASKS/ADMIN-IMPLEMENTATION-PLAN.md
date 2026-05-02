# ADMIN APP IMPLEMENTATION PLAN (Ordered by Dependency & Safety)

This plan is structured to build the foundation first, avoiding circular dependencies or breaking
existing data.

## PHASE 1: The Core Foundation (Safe to do first)

_These tasks do not affect major UI logic or existing bookings. They lay the groundwork._

1. **Authentication & Security**
    - Lock down Admin-only routing.
    - Refine the Auth styling and error messages.
2. **Global UI/UX Standards**
    - Build the reusable skeletons for loading states.
    - Standardize the error pages (404, 500, empty states).
    - Implement the Session Timeout warning securely.
3. **Clinic Settings (Database/Config First)**
    - Build the backend models/API for the new "Clinic Settings".
    - [x] Implement the Settings UI (Operating Hours, Lead Time (Days), Block-out Dates).
    - [x] Pivot "Website Configuration" into "Website Details" (Headless Data model), removing layout-specific texts and adding Core Data (Logos, Short Description, Business Hours, Maps).
    - [x] **NEW**: Implement "Automated Notifications" Tab (Email/SMS toggles, 24h/48h reminders, warnings).
    - [x] **NEW**: Implement "Message Activity" View (Tracking webhook delivery logs - Promoted to Sidebar).
    - _Why first? Your booking front-end and doctor schedules will need to read these settings
      later._
4. **Action Alerts & Cross-App Sync (Critical Finish)**
    - [x] Implement High-Fidelity Action Alerts (Toasts/Modals) for all Admin Settings saves.
    - [x] Sync Global Rules (Lead Time Days, Horizon, Holidays) to the User App Booking Calendar.
    - [x] Sync General Details, Website Banner, and Legal Docs to the User App UI.
    - [x] Sync Notification rule toggles (ON/OFF) logic to backend controllers. (VERIFIED)

## PHASE 2: The Services Catalog

_Must be done before Doctors because Doctors must be assigned to Services._

1. **Service Catalog List UI** (Grid/Table).
2. **Create / Edit Service View** (Including Image upload).
3. **Service Visibility Toggle** (Soft off functionality).
4. **Data Connections:** Ensure all edits trigger the standard Global Action Alerts/Toasts.

## PHASE 3: Doctors Management (Heavy Logic)

_Relies on Auth, Skeletons, and Services._

1. **Doctor List UI & Basic Profile** (Horizontal layout).
2. **Onboarding & Auth Flow**
    - The "Add Doctor" form.
    - The email invite -> PRC verification -> Password creation logic.
3. **Doctor Profile Tabs Structure** (Contact vs. Identity).
4. **Doctor Toggles (Crucial logic)**
    - Implement "Soft Off" vs "Hard Off".
    - **Important:** Build the logic here that tags appointments as "Displaced" _before_ moving to
      Phase 4.
5. **Doctor Schedule Integrations** (Combining calendar views).

## PHASE 4: Global Appointments & Core Workflows

_Relies on Doctors and Services existing correctly to be viewed._

1. **Global Sidebar Setup** (Creating the routes).
2. **Unified Action Modal**
    - Build ONE component for Approve/Reject/Cancel/Reschedule.
3. **Global Pending (Inbox) View** - Hook up the Unified Modal here.
4. **Global Attendance (Today's Clinic) View** - Hook up Check-In/No-Show logic.
5. **Global Calendar View** - Add robust filtering by the Doctors/Services created in previous
   phases.

## PHASE 5: The Patients & Data Cleanup

_This defines how you handle complex identity merges. Saving this for last prevents you from
accidentally wiping out appointment histories while building Phase 4._

1. **Dependent Logic:** Enforcing shared emails and "Dependent" structures over new accounts.
2. **Account Claiming:** The "Reserved Profile" to "Active User" DOB check flow.
3. **The Merge Tool** (The most dangerous task - do this very carefully).
    - UI for detecting duplicates.
    - Logic for migrating history safely.
4. **Inner Patient Tabs:** Polish the UI for Patient -> Upcoming/Attendance/History.

## PHASE 6: Polish & Wrap-up

1. **Global Audit Logs:** Now that all systems are built, ensure they are actively pushing logs.
2. **Dashboard Metrics:** Your business stats will now accurately reflect the updated DB.
3. **Legal / Templates:** Connect the editable Clinic Settings (emails/SMS/legal) to the Live User
   App.
4. **Final QA Check:** Ensure ALL destructive actions have the proper warning pop-ups.

---

## ðŸš© Open Questions & Next-Phase Verification

### SMS Verification Status
- [ ] **PhilSMS Gateway:** Integration exists but is not yet tested in a live environment. Focus remains on Resend (Email) stability first.

### Ripple Effect & Conflict Management (Phase 2/3)
- [ ] **Holiday Displacements:** Does blocking a date in Admin Settings correctly flag or prevent bookings on that day in the User App?
- [ ] **Hour Shifting:** If clinic hours are changed, are existing appointments in the removed slots correctly identified as "Displaced"?

### Doctor Schedule Inheritance
- [ ] **State Machine (Source of Truth):** Implement `is_using_global` flag on the doctor's schedule record.
    - `true` ? Ignore `weekly_days`, inherit Global.
    - `false` + days set ? Use specific days only.
    - `false` + empty array ? Doctor is Strictly Closed (NOT global fallback).
- [ ] **Clone Logic:** On first toggle from Global ? Custom, pre-populate the doctor's checkboxes from the current Global Settings to prevent a `Blackout` on all days.
- [ ] **Narrowing Guard:** When removing a day, query future appointments for that day before saving. Block the save and show a patient list if conflicts exist.
- [ ] **Switch-Back Guard:** When switching Custom ? Global, compute the difference (days in Custom not in Global). Query future appointments on orphan days. Block until resolved.
- [ ] **?? Critical:** All conflict queries MUST use `appointment_date >= NOW()` — only check future appointments.

### OTP Hardening (Immediate Next)
- [ ] **Attempt Limits:** Implement a 5-try limit for guest OTP verification.
- [ ] **Cool-down Period:** Implement a 2-minute delay before allowing a fresh OTP request.
