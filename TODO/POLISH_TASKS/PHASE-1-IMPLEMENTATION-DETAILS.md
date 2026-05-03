# PHASE 1: CORE FOUNDATION & CLINIC SETTINGS — IMPLEMENTATION PLAN

## 🎯 Objectives

- Secure the Admin App entry point.
- Standardize the UI/UX shell (Skeletons, Error States, Modals).
- Implement the "Clinic Settings" engine to drive the User App logic (hours, booking rules,
  block-outs).

---

## 🏗️ 1. Database Layer (Supabase)

### 1.1 `clinic_settings` Table Enhancements

We need to ensure the `clinic_settings` table matches the planned features.

- **Verification:** Check `FINAL-COMPLETE-SCHEMA.sql` (already exists).
- **Modification needed:** Add columns for booking horizon, lead times, contact info, and legal
  texts.
- **SQL Action (Migration):**
    ```sql
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS booking_lead_time_days INTEGER DEFAULT 1;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS booking_max_horizon_days INTEGER DEFAULT 60;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT TRUE;
    
    -- Automated Notification Additions
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS reminder_24h_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS reminder_48h_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS reminder_send_time TIME DEFAULT '08:00';
    
    -- Message Logs (Webhook Tracker)
    CREATE TABLE IF NOT EXISTS message_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      provider_id TEXT,
      recipient TEXT NOT NULL,
      channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
      purpose TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued' CHECK (
        status IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')
      ),
      error_details TEXT,
      appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
      patient_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS phone_primary TEXT;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS email_official TEXT;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS physical_address TEXT;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS hero_banner_text TEXT;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS hero_banner_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS privacy_policy_text TEXT;
    ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS terms_of_service_text TEXT;
    ```

### 1.2 `clinic_holidays` & `clinic_schedule` Tables

- **clinic_holidays:** Ensure it has `record_date` (or `start_date`/`end_date`), `reason`, and a
  boolean for `is_closed`. (Migration will add these if missing).
- **clinic_schedule (LUNCH BREAKS):** Adding lunch breaks here prevents the system from accidentally
  booking patients while the clinic is on break.
- **SQL Action (Migration):**
    ```sql
    ALTER TABLE clinic_schedule ADD COLUMN IF NOT EXISTS lunch_start_time TIME;
    ALTER TABLE clinic_schedule ADD COLUMN IF NOT EXISTS lunch_end_time TIME;
    ```

---

## ⚡ 2. Backend Layer (apps/api)

### 2.1 Route & Controller Setup

- **New Domain:** `settings.routes.js`, `settings.controller.js`, `settings.service.js`.
- **Endpoints:**
    - `GET /api/v1/settings` (Public - for User App).
    - `PATCH /api/v1/settings` (Admin Only - for Admin App).
    - `GET /api/v1/settings/holidays` (Public).
    - `POST /api/v1/settings/holidays` (Admin).
    - `DELETE /api/v1/settings/holidays/:id` (Admin).

### 2.2 Security Middleware

- Implement `requireAdmin` check on all `PATCH/POST/DELETE` settings routes.
- **Zod Schemas:** Create `settings.schema.js` to validate all configuration inputs (e.g., ensuring
  `open_time` < `close_time`).

---

## 🎨 3. Frontend Layer (apps/admin)

### 3.1 Auth Gate Polish

- **Location:** `src/pages/LoginPage.jsx` & `src/routes/ProtectedRoute.jsx`.
- **Task:** Redirect any non-admin (e.g., patient role) trying to access `/admin/*` back to their
  respective portal or an "Unauthorized" page.
- **UI:** Enhance the Login error alerts using the standardized `Alert` component.

### 3.2 Global UI Components (The Shell)

- **Skeletons:** Create `DoctorListSkeleton`, `AppointmentTableSkeleton`, and `DashboardSkeleton` in
  `src/components/ui/Skeletons.jsx`.
- **Error States:** Create a global `ErrorBoundary` and a `PageError` component (handling 404, 500,
  and Network errors).
- **Modal Logic:** Standardize `ConfirmationModal` in `src/components/common/`. It must accept
  `title`, `message`, `onConfirm`, and `variant` (danger/warning/info).

### 3.3 Clinic Settings Module (Headless Data Pivot)

- **Location:** `src/pages/settings/SettingsPage.jsx`.
- **Inner Tabs:**
    - **Website Details (Default Tab):** A single, unified form focusing on "Pure Data" for the frontend to consume. Contains categorized inputs for:
        - *Core Identity*: Clinic Name, Short Description (for SEO/Footer).
        - *Contact Info*: Physical Address, Primary Phone, Official Email.
        - *Location & Hours*: Business Hours Text, Google Maps Link.
        - *Brand Assets*: Primary Logo URL, Light Logo URL, Favicon URL.
        - *Social Links*: Facebook, Instagram, Twitter, YouTube URLs.
    - **Operations:** Form for Hours, Lead Time, and Slot duration.
    - **Notifications:** Toggles for SMS/Email gateways.
    - **Legal:** Simple markdown/text editor for Privacy/Terms.
- **Hook:** Create `useSettings.js` to handle fetching and optimistic updates.

---

## ⚠️ Safety & Best Practices

1.  **Optimistic Updates:** In the Settings UI, show a success toast immediately but revert if the
    API fails.
2.  **Audit Logs:** Every change to `clinic_settings` must trigger a row in `audit_log` (e.g.,
    "Admin updated clinic hours").
3.  **User App Impact:** Once Phase 1 is done, the User App's `Calendar` must fetch the
    `booking_lead_time_hours` and `clinic_holidays` from the API instead of using constants.
4.  **No Hardcoded Secrets:** Verify that the `resend` API key and SMS gateway credentials are moved
    to the backend `.env` during this phase.

---

---

## 📅 STATUS: PHASE 1 PENDING TASKS

**1. ACTION ALERTS (ADMIN APP)**

- [x] Implement High-Fidelity Action Alerts (Toasts/Modals) to give admins visual feedback
      (Success/Error) when saving settings across all tabs.

**2. CROSS-APP SYNC (USER APP & BACKEND) - CRITICAL FOR PHASE 1 COMPLETION**

- [x] **Global Rules & Holidays Sync:** Update the User App Calendar to fetch and respect
      `booking_lead_time_hours`, `booking_max_horizon_days`, `slot_duration_minutes`, and
      `clinic_holidays` from the Settings API instead of hardcoded constants.
- [x] **General Details Sync:** Update the User App footer and contact pages to use the dynamic
      `phone_primary`, `email_official`, and `physical_address`.
- [] **Website (Banner) Sync:** Fetch and display the `hero_banner_text` on the User App homepage
      if `hero_banner_enabled` is true.
- [x] **Notifications Sync:** Update the backend booking controllers to check if
      `sms_notifications_enabled` or `email_notifications_enabled` are true before firing Resend/SMS
      APIs.
- [x] **Legal & Policy Sync:** Wire the dynamic `privacy_policy_text` and `terms_of_service_text` to
      the respective public Legal pages on the User App.

---

## 🏁 Phase 1 Completed Items (Updated: 2026-05-02)

**Backend Implementation:**

- [x] Create `clinic_settings` and `clinic_holidays` schema enhancements.
- [x] Implement settings API routes, controllers, and services.
- [x] Protect settings API endpoints with `requireAdmin` middleware.

**Frontend Implementation (Admin App):**

- [x] Setup basic Admin Settings Pages (`SettingsPage.jsx`).
- [x] Build Base `Skeletons.jsx` (Dashboard, Table, List, Form).
- [x] Implement `ConfirmationModal` component.
- [x] Build Settings Forms (Rules, Holidays, General, System Health).
- [x] Implement a global `ErrorBoundary` to catch React rendering failures gracefully.
- [x] Implement a standardized `PageError` component for failed API loads (404/500).
- [x] Add "Session Timeout" warning mechanism in Admin Layout.

---

## 🚀 Phase 2 & Upcoming: Conflict & Displacement Management

Changing global clinic rules can have a "ripple effect" on existing bookings. We will implement the
following safety mechanisms:

1. **Rule Conflict Detection (Alerts)**:
    - **Holiday Displacement**: Adding a clinic holiday on a date with existing appointments must
      trigger a blocking alert for the Admin, listing all patients who need to be moved.
    - **Hours Restriction**: If opening hours are shifted (e.g., 8:00 AM → 9:00 AM), any
      appointments in the 8:00-9:00 slot must be flagged as "Displaced".
    - **Lunch Break Conflict**: If a lunch break is newly introduced over existing slots, affected
      appointments must be highlighted.

2. **Administrative Resolution Flow**:
    - Provide a "Conflict Resolution" dashboard where staff can see all displaced appointments and
      quickly reschedule or notify patients via the integrated Reschedule Wizard.

---

## ✅ Overall Phase 1 Checklist

1. [x] Approve Phase 1 Plan.
2. [x] Execute SQL Migrations for `clinic_settings`.
3. [x] Scaffold Backend Settings API.
4. [x] Build the Admin Settings UI (Forms load and save successfully).
5. [x] Implement Audit Logging for all configuration changes.
6. [x] Implement Global Error Handling & Session Management.
7. [x] Implement Success/Error Feedback Alerts for the Admin Panel.
8. [x] **IN PROGRESS:** Cross-App Sync (Wire all saved Setting fields directly into the User App UI and
       Backend logic).

---

## 🧪 MANUAL TESTING CHECKLIST (Verification)

Run through this checklist manually in the browser to ensure Phase 1 is fully operational and safe.

### 1. Database & Backend Validation

- [x] **Data Persistence:** Update a setting (e.g., `booking_lead_time_hours`) in the Admin UI.
      Verify the change is reflected in the Supabase `clinic_settings` table.
- [x] **Audit Trigger Logs:** Change a setting. Verify that exactly one new record appears in the
      Supabase `audit_log` table showing who did it and what changed.
- [x] **RBAC Protection:** Use a non-admin token (e.g., Patient JWT) and attempt to send a
      `PATCH /api/v1/settings` request via Postman/cURL. Expect a `403 Forbidden`.

### 2. Frontend Settings UI (Admin)

- [x] **General / Website Settings:** Change `clinic_name` and `hero_banner_text`. Save, refresh the
      page, and ensure the state persists.
- [x] **Rules Settings:** Toggle `waitlist_enabled` off. Change `slot_duration_minutes`. Save and
      refresh to verify persistence.
- [x] **Automated Notifications Settings:** Toggle the SMS and Email gateways off and on. Verify the strict warning messages appear. Update the 24h/48h reminders and send time. Save and verify persistence.
- [x] **Message Activity Navigation:** Verified "Message Activity" has been promoted to the main sidebar as a dedicated module.
- [x] **Real-Time Communication Logging:** Successfully implemented backend hooks to log OTP and confirmation emails to the database. Verified live logs appear at the top of the Message Activity list.
- [x] **Legal Settings:** Paste markdown into the Privacy Policy editor. Save and verify formatting is retained.
- [x] **History Tab:** Improve the data table (sorting, filters). Clicking a row shows read-only
      details. No actions required.
- [x] **Weekly Schedule UX Polish:**
    - [x] **Inheritance UI:** Implemented a segmented control for "Clinic Sync" vs "Custom Mode".
    - [x] **Safety Logic:** Hardened the Break Toggle to disable automatically if no working days are selected.
    - [x] **Efficiency Tools:** Added "Clear All" and "Sync with Clinic" buttons for faster configuration.
- [ ] **Doctor Audit Log:** Dedicated tab inside the Doctor Profile tracking all administrative and
      clinical actions related to this doctor.
- [x] **Holidays Table:** Add a new Holiday. Verify it appears in the list. Delete the Holiday,
      confirm via the `ConfirmationModal`, and verify it disappears.

### 3. Shell / Global Components (Admin)

- [x] **ErrorBoundary:** Temporarily throw a manual error inside a standard component (e.g.,
      `throw new Error('Test')` inside `SettingsPage`). Verify the global ErrorBoundary UI catches
      it instead of showing a blank white screen. (Fixed: Styled to match PageError and fixed light
      mode font).
- [x] **PageError:** Navigate to a fake Admin route (e.g., `/admin/does-not-exist`). Verify the
      custom 404 PageError component renders (Fixed: replaced redirect with PageError).
- [x] **Session Timeout:** Remain idle on the Admin dashboard for the timeout duration.
      Verify the warning popup appears and logs you out, showing the "Session Expired" message on
      the Login screen.

### 4. Integration Verification (User App Sync)

- [x] **User App Sync (Holidays):** Go to the User Booking calendar. Ensure the slots blocked out
      match the newly added `clinic_holidays` from the Admin settings and that they are visually disabled.
- [x] **User App Sync (Lead Time):** Set Admin Lead Time to `1` day. Go to User Booking. Ensure
      today is un-clickable and visually disabled.
- [x] **User App Sync (Max Horizon):** Set Admin Max Horizon to 30 days. Go to User Booking. Ensure
      the user cannot scroll or select dates past 30 days into the future.
- [x] **User App Sync (Contact Info):** Go to the Patient Portal footer and 'Contact Us' section.
      Verify the `phone_primary` and `email_official` match the ones set in the Admin settings.
- [x] **User App Sync (Brand Assets):** Verify that Brand Assets (Logos/Favicon) from the Headless
      Data configuration are being consumed correctly (Note: Reverted to hardcoded for pivot but
      data fields exist).
- [x] **User App Sync (Legal):** Navigate to the Terms of Service and Privacy Policy pages on the
      User App and confirm the content pulls the text saved via the Admin settings editor.
- [x] **User App Sync (Booking Logic):** Perform a test booking. Verify the backend respects the
      newly saved global rules (waitlist, lead time days, etc.).
- [ ] **User App Sync (Notifications):** Trigger a booking and verify that the notification gateway
      status (ON/OFF) is respected in the backend logic/logs. (PENDING TEST)
- [x] **Guest Booking Fallback (Test 1):** Go to Admin Settings -> Automated Notifications. Turn Email Notifications **OFF**. Go to the Guest Booking page. Verify the "Booking Unavailable" fallback message is shown and the wizard is hidden.
- [x] **Guest Booking Fallback (Test 2):** Go back to Admin Settings. Turn Email Notifications **ON**. Go to the Guest Booking page. Verify the booking wizard is functional again.

### 5. Message Activity & Webhooks
- [x] **Provider ID Visibility:** Verified that the `provider_id` is now visible in the Admin Message Activity table for easier debugging and testing.
- [x] **Real-Time Status Update (Simulation):** 
    - **How it works:** This test simulates a "Ping" from Resend to your server. It mimics the behavior where a patient opens an email, triggering a webhook that updates the database status.
    - **Test Action:** Copy an ID from the Message Activity table (starts with `re_`) and run this command in your terminal:
    ```bash
    curl -X POST http://localhost:5000/api/v1/webhooks/resend `
    -H "Content-Type: application/json" `
    -d '{
      "type": "email.opened",
      "data": {
        "email_id": "2d277b2a-7bc7-4f64-a2a7-a6270d515555"
      }
    }'
    ```
    - **Expected Result:** After refreshing the Admin page, the status for that specific email should change from `Sent` to `Opened` (with a blue badge).

---



---

## ?? Phase 2/3 Pending Implementation & Tests

---

### 6. Ripple Effect & Conflict Management

#### Implementation Plan

**6a. Holiday/Block-out Displacement:**
- When an Admin saves a new holiday or blocked date, the backend must query for existing future appointments on that date before committing the change.
- If conflicts exist, return a list of affected appointments to the frontend.
- The Admin must either manually reschedule or force-accept before the date is blocked.

**6b. Clinic Hour Shifting:**
- When the Admin changes opening/closing times (e.g., closes at 4pm instead of 5pm), the backend must identify all future appointments booked in the removed time window.
- Those appointments must be flagged as "displaced" status and surfaced in the Admin's Displaced Holding Area.

#### Test Checklist (Run When Implemented)

- [x ] **Holiday Block Test:** In Admin Settings, add a holiday on a date that has at least 1 active future appointment. Expected: System shows a modal listing the affected patients and blocks the save until resolved.

the when i block holiday date with active appoinemnt it just says alert and dont show the modal affected patients. ✅ **SOLVED** (Standardized Modal implemented)

alert modays says success on title even if the action is failed, to do later

- [x] **Clean Holiday Test:** Add a holiday on a date with zero appointments. Expected: Holiday saves successfully with no warning.

 the bugg i see is like this for examplei have a date jan 1 now i add a date and block it for example 1am now i block it now i remove the block i can see that it got displace and now its avaialbe again on the timeslots, the only problem is i think the holding of slot i cant hold it maybe it still think that its on someone. ✅ **SOLVED** (Updated `dentist-assignment.service.js` and others to ignore `DISPLACED` status).

- [x] **Ghost Slot Recovery Test:** Displace an appointment via Holiday, then delete the holiday. Expected: The timeslot should be immediately available for a NEW booking (System now ignores `DISPLACED` appointments in the availability engine).
 
- [x] **Hour Shift Test:** Narrow the clinic's closing time from 5:00 PM to 3:00 PM while a future appointment exists at 4:00 PM. Expected: That appointment is flagged as Displaced.

- [x] **User App Block Test:** After a holiday is saved, open the User Booking Calendar. Expected: That date is visually disabled and cannot be selected.

---

### Phase 1.5: Doctor Onboarding & Visibility Verification (User Testing Required)

- [x] **New Doctor "Global" Test:** 
    - Create a new doctor in the Admin portal.
    - Map them to a General Service (e.g., Oral Prophylaxis).
    - **Expected:** They should immediately appear in the Guest Booking dropdown and inherit the Clinic's global hours without needing a manual schedule save.

- [x] **Part-Time Visibility Test:**
    - Set a doctor to "Custom Mode".
    - Mark them as working **Only on Friday**.
    - **Expected:** They should still be visible in the Guest Booking dropdown (because they have at least one working day).

- [x] **Total Off-Duty Hiding Test:**
    - Set a doctor to "Custom Mode".
    - Mark **All 7 Days** as "Closed/Not Working".
    - **Expected:** The doctor should automatically disappear from the Guest Booking dropdown entirely.

- [x] **Strict Skillset Check:**
    - Unassign a specific service from a doctor in the Admin panel.
    - **Expected:** The doctor should disappear from the dropdown for that specific service, even if they have available slots.

- [x] **Schedule Break Hardening Test:**
    - Open the "Edit Weekly Sched" modal for a doctor.
    - Turn OFF all working days (or use "Clear All").
    - **Expected:** The "Daily Break" toggle should be disabled/grayed out and show a warning message.
    - Turn ON one working day.
    - **Expected:** The "Daily Break" toggle should become interactive again.

- [x] **Inheritance Sync Test:**
    - Set a doctor to "Custom Mode".
    - Change their hours.
    - Click "Global" in the segmented control.
    - **Expected:** The schedule should immediately revert to matching the Clinic's global hours and lock the inputs.
    - Click "Custom" again.
    - **Expected:** Inputs should unlock, allowing for manual overrides.

this is already done 
i test example i im on date and time on guest booking now i see the dates on calendar right now i add a holiday and the day will only be gone if i refressh the page, i want it to be gone right away or add a refresh button for that so it will reload the calendar like how its done in the timeslot. but the blocking works well. ALREADY DONE

---

## 📅 STATUS: PHASE 1 PENDING TASKS

...

- [x] **Clone-on-Switch Test:** Switch a doctor from Global to Custom. Expected: The custom day checkboxes are pre-populated with the current Global days (no days are unchecked by default).
- [x] **Narrowing Guard Test:** On a doctor with a custom schedule, uncheck a day that has a future patient booked. Click Save. Expected: Save is blocked. A modal shows the list of affected patients for that day.
- [x] **Clean Narrowing Test:** Uncheck a day with no future appointments. Expected: Saves successfully.
- [x] **Switch-Back Conflict Test:** A doctor has a custom schedule including Sunday. The Global schedule is closed on Sunday. Toggle the doctor back to "Inherit Global". Expected: Switch is blocked. Modal lists the Sunday patients that need to be rescheduled.
- [x] **Clean Switch-Back Test:** Resolve all orphan-day appointments, then toggle back to Global. Expected: Switches successfully. Doctor now follows Global schedule.
- [x] **Doctor Schedule Integrations:**
    - [x] **Inheritance UI:** Replaced basic switch with a premium Segmented Control.
    - [x] **Break Hardening:** Implemented strict dependency (Break requires at least 1 working day).
    - [x] **Reset Logic:** Added "Clear All" to quickly wipe a custom routine.
- [x] **Strictly Closed Test:** Set a doctor's schedule to Custom with all days unchecked (empty). Expected: That doctor does not appear as available in the booking flow — they are NOT inheriting Global as a fallback.

---

### 7.5 Doctor Schedule Inheritance: Manual Verification Checklist

Since the automated slot engine is complex, perform these manual checks to verify the fix:

#### Test 1: New Doctor "Plug & Play"
1. Create a brand new doctor in the Admin app. Do **not** touch their schedule settings.
2. Go to the User/Guest Booking page.
3. Select a service that the new doctor provides.
4. **Expected Result:** The calendar should show available slots based on the **Clinic Global Schedule**. The doctor should appear in the specialist list.

#### Test 2: The "Strict Custom" Guard
1. Select a doctor and toggle "Inherit Global" to **OFF**.
2. Uncheck **all** days of the week (empty schedule). Save.
3. Go to the Booking page.
4. **Expected Result:** That doctor should **not** have any available slots on any day. They should NOT "fallback" to global hours.

#### Test 3: Global Override (Clinic Closed)
1. Set a doctor to **Inherit Global**.
2. In Clinic Settings -> Rules, set **Tuesday** to "Closed". Save.
3. Go to the Booking page for that doctor.
4. **Expected Result:** Tuesday should be greyed out/unavailable for that doctor.

#### Test 4: Custom Override (Clinic Open)
1. Clinic is **Open** on Sunday.
2. Set a doctor to **Custom** and ensure Sunday is **Unchecked** (Closed). Save.
3. Go to the Booking page for that doctor.
4. **Expected Result:** Sunday should be greyed out/unavailable for that doctor, even though the clinic itself is open.


---

### 8. OTP Hardening (Immediate Next Task)

#### Implementation Plan

**Migration needed:**
`sql
ALTER TABLE guest_otp_codes ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;
`

**Attempt Limit (5 tries):**
- On each failed OTP verify call, increment ttempt_count on the matching guest_otp_codes record.
- If ttempt_count >= 5, mark the code as is_verified = true (invalidated) and return a "Too many attempts" error.
- Frontend: Show a clear message � "Code has been invalidated. Please request a new one."

**Cooldown Period (2-minute resend delay):**
- On sendOTP, query the latest OTP record for this email.
- If created_at is within the last 120 seconds, reject the request.
- Return error: "Please wait [X] seconds before requesting a new code."
- Frontend: Display a countdown timer on the "Resend Code" button.

#### Test Checklist (Run When Implemented)

- [ ] **5-Attempt Limit Test:** Request an OTP. Enter an incorrect code 5 times. Expected: On the 5th failure, the code is invalidated and a new OTP must be requested.
- [ ] **Valid Code After Failure Test:** Enter a wrong code 4 times, then enter the correct code. Expected: Verification succeeds (limit is 5, not 4).
- [ ] **Cooldown Block Test:** Request an OTP. Immediately request another OTP (within 2 minutes). Expected: Request is rejected with a "Please wait [X] seconds" message.
- [ ] **Cooldown Expiry Test:** Wait 2 minutes after the first OTP, then request a new one. Expected: A new OTP is sent successfully.
- [ ] **Frontend Timer Test:** After requesting an OTP, verify the "Resend Code" button shows a countdown timer and is disabled until the 2-minute cooldown expires.

---

### 9. SMS Integration (?? Skipped � Tests Listed for Future Verification)

> **Status:** PhilSMS is integrated in the backend but is NOT currently tested. Email (Resend) is the active and stable channel. SMS testing requires a paid PhilSMS balance.

#### Test Checklist (Run When Budget Is Available)

- [ ] **SMS Gateway Smoke Test:** With SMS toggle ON in Admin Settings, trigger a guest OTP request and check that an SMS is received (in addition to email).
- [ ] **SMS Toggle Test:** Turn SMS toggle OFF in Admin Settings. Trigger any notification flow (booking, OTP). Expected: No SMS is sent; the backend logs should show the SMS was skipped due to the toggle being OFF.
- [ ] **SMS Notification Test (24h Reminder):** Book an appointment for the next day. Check that a 24-hour reminder SMS is sent at the configured reminder time.
- [ ] **SMS Notification Test (48h Reminder):** Book an appointment 2 days out. Check that a 48-hour reminder SMS is sent at the configured reminder time.
- [ ] **SMS Failure Graceful Handling:** Simulate an SMS API failure (e.g., bad token). Expected: Email is still sent; the failure is logged but does not crash the booking flow.
