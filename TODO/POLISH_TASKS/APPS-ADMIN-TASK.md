# ADMIN APP: POLISH & TO-DO LIST ORIGINAL (THIS IS THE ORIGINAL PLANS OR TO DO LIST)

## 🌐 1. Global UI/UX & System Behavior

- [ ] **Session Timeout:** Implement an idle session timeout warning popup (same as the User app).
- [ ] **Standardize Modals/Alerts:** Ensure all confirmation dialogs, error messages, success
      alerts, and pop-ups are consistent, cleanly designed, and responsive.
- [ ] **Loading & Error States:** Add skeletons for data fetching and create user-friendly error
      states (Empty, 404, Network error) for all tabs.
- [ ] **Action Protections:** All destructive or critical actions (Cancel, Reschedule, No-Show,
      Deactivate) must have an explicit confirmation warning popup.

## 🔒 2. Authentication & Security

- [ ] **Admin-Only Access:** Strictly lock down login routing. Only Admin accounts can sign in.
- [ ] **Auth Polish:** Improve error messaging, login styling, and alerts on the login page.
- [ ] **Audit Logging (Global):** Ensure robust audit logs capture critical actions (with User/Admin
      name, action, target, timestamp) across Doctors, Patients, and Services. Improve the UI of the
      general Audit Log page.

## 📊 3. Dashboard

- [ ] **Business Metrics:** Add useful, high-level business stats (Active Users, Registered Users,
      Revenue/Billing snapshots, etc.).
- [ ] **Notifications:** Add a panel for business-related alerts or warnings.
- [ ] **UI Polish:** Improve overall data visualization and layout.

---

## 🩺 4. Doctors Management

- [ ] **List View UI:** Change the Doctor cards into a horizontal list layout. The right side should
      display their schedule/availability and an "Edit/Action" button.

### Adding a Doctor (Onboarding)

- [ ] **Creation Form:** Make "Add Doctor" functional with basic details via a standardized,
      mobile-responsive popup.
- [ ] **Email Constraints:** Require a unique "work email". Prevent duplication.
- [ ] **Invite Flow:** Send an invitation/password-creation link to their work email upon creation.
- [ ] **PRC Verification Gate:** When the doctor clicks the invite link, they must enter their PRC
      license to verify identity before setting a password. Max 3 tries -> Lockout -> "Contact
      Admin".
- [ ] **Status Flow Integration:**
    - _Invited:_ Link sent, not clicked. (Hidden from booking).
    - _Pending Setup:_ Clicked link, incomplete PRC/Password. (Hidden from booking).
    - _Active:_ Setup complete. (Visible to admin/patients).

### Doctor Profiles & Tabs

- [ ] **Profile Tab (Contact Info):** Allow editing of Contact Email. Add helper text: _"Changing
      this only updates where you receive notifications, not your login email."_
- [ ] **Security/Account Tab (Identity):** Display Login Email (locked/read-only). Add a "Send
      Password Reset/Creation" button. Identify if the account is already active or just invited.
- [ ] **Services Tab:** Change from inline to a pop-up list. Add warning: "Removing a service will
      displace [X] upcoming appointments to the holding tab."
- [ ] **Schedule Tab:** Combine Calendar. Toggle between Month view (grid) and Day view (weekly).
      Polish the "Block Date/Time" popup for better UX and validation.
- [ ] **History Tab:** Improve the data table (sorting, filters). Clicking a row shows read-only
      details. No actions required.
- [ ] **Doctor Audit Log:** Dedicated tab inside the Doctor Profile tracking all administrative and
      clinical actions related to this doctor.
- [ ] **Schedule Inheritance Logic (Full Implementation Plan):**

    **State Machine (Source of Truth):**

    | State | `is_using_global` | `weekly_days` | Outcome |
    |---|---|---|---|
    | Inheriting | `true` | (Ignored) | Doctor follows Global Clinic Settings |
    | Customized | `false` | `['Mon','Wed']` | Doctor follows specific days only |
    | Strictly Closed | `false` | `[]` (Empty) | Doctor is unavailable, NOT global |

    **Scenario 1 — First-Time Customization ("Clone" Logic):**
    - When admin toggles "Inherit Clinic Schedule" to OFF, the frontend MUST first fetch Global Settings and pre-populate the Doctor's checkboxes with that data before the user edits anything.
    - This prevents a "Blackout" — the doctor's schedule stays identical to the clinic's until the admin manually unchecks a day.

    **Scenario 2 — Narrowing Conflict (Removing Days):**
    - When admin unchecks a previously-active day (e.g., Tuesday) and clicks Save:
    - System queries: `SELECT count(*) FROM appointments WHERE doctor_id = ? AND day_of_week = 'Tuesday' AND appointment_date >= NOW() AND status IN ('pending', 'confirmed')`.
    - If count > 0: **Block the save.** Show modal: *"Cannot remove Tuesday. 3 patients are booked. [View List]"*
    - Admin must reschedule those patients first.
    - ⚠️ **Note:** Only check FUTURE appointments (use `appointment_date >= NOW()`), not past ones.

    **Scenario 3 — Switch Back Conflict (Returning to Global):**
    - When admin toggles back to "Inherit Clinic Schedule" ON:
    - Compare doctor's current active custom days vs. Global active days.
    - Identify any days that exist in doctor's custom set but NOT in Global (e.g., Sunday custom, closed globally).
    - Query future appointments for those orphaned days.
    - If count > 0: **Block the switch.** Show same "patients are booked" modal for those days.
    - Only allow switch after all conflicting future appointments are resolved.

### Doctor Availability & Access Controls

- [ ] **Availability Toggle ("Visibility Mode" / Soft Off):** Disables public booking, hides from
      website. Keeps account active, login works, existing schedule remains. (For vacation/maternity
      leave).
- [ ] **Temporary Suspension ("Security Lock"):** Freezes account. Kicks out active sessions. Hides
      from booking. Existing appointments remain. (For emergencies/hacked emails).
- [ ] **Account Deactivation ("Termination" / Hard Off):** Permanent lockout. Moves doctor to
      inactive. **Action triggers Displacement Logic** (pushes all future approved appointments to
      the "Displaced Holding Area" for the secretary to handle).

### Assigned Appointments / Clinical Workflow (Today's Clinic)

- [ ] **Today's Clinic Tab:** Shows "Approved" appointments for the current day.
- [ ] **Upcoming Tab:** Shows the Look-Ahead calendar for the week/month.
- [ ] **Add Treatment Flow:** When viewing a patient details card, allow the doctor to add
      treatments.
    - _Primary List:_ Authorized/Common services for that specific doctor.
    - _Secondary List:_ Searchable dropdown of all clinic services.
- [ ] **Treatment to Billing Handoff:** "Complete & Send to Billing" button. Changes appointment
      status to "Treatment Completed" and automatically forwards the ticket to the Secretary's
      "Pending Payment" queue.

---

## 👥 5. Patients & Users Management

- [ ] **Patient Tabs Polish:** Improve Demographic/Profile views. Enhance generic UI design and
      error/loading states.
- [ ] **Account Registration & Pre-Registered Linkage:**
    - **Walk-in Profile:** Front desk adding an email creates a "Reserved Profile" stub.
    - **Online Blocking:** If a user tries to Sign Up with a reserved email, disable creation and
      prompt: _"Records found. Please check your email to activate."_
    - **Verification Loop:** If the 24h invite expires, "Forgot Password" or "Resend Activation"
      triggers a new link to claim the account.
    - **Identity Secret:** Newly activated accounts must submit their Date of Birth to unblur/unlock
      their clinical history.
- [ ] **Shared Family Emails (Dependents):**
    - Prevent creation of a separate login for an email already in use.
    - Direct the admin/secretary to add the new patient as a **Dependent** under the Primary
      Account.
- [ ] **Admin Merge Tool (Data Cleanup):**
    - Merge functional configurations: "Stub to Stub", "Active to Stub", "Inactive to Stub".
    - Detect potential duplicates (Name, DOB, Phone).
    - Provide a conflict resolution UI to choose which data to keep (Phone, Address).
    - Re-link past Appointments/Notes/Invoices safely.
    - Add a quick "Convert to Dependent" button during merge if they're actually a family member.
    - **Merge Audit Log:** Strictly log who performed the merge and when.

### Patient Inner Tabs Management

- [ ] **Upcoming Tab:** Fix bugs with Cancel and Reschedule actions.
- [ ] **Attendance Tab:** Implement manual "Check-in" and "No-show" buttons with explicit
      confirmation popups.
- [ ] **Pending Tab:** Ensure Approve/Reject flows work perfectly. Add a UI for selecting
      predefined/common rejection reasons (easier UX).
- [ ] **Dependent Tab:** Polish UI for adding, removing, and viewing dependents.

---

## 🏷️ 6. Services Catalog

- [ ] **Catalog Design:** Improve grid/table layout for viewing services.
- [ ] **Create Service:** Implement functional form. Support Image uploading with a standardized
      fallback image.
- [ ] **Edit Service:** Polish the detail editing modal.
- [ ] **Searching & Filtering:** Add comprehensive filters to easily sort the catalog.
- [ ] **Service Visibility Toggle:** Add a "Soft Off" visibility toggle (similar to doctors) to hide
      a service from public view without deleting the historical data.

## 🌍 7. Global Appointments Management (System-Wide)

- [ ] **Global Navigation Item:** Add a dedicated "All Appointments" or "Schedule" link to the main
      admin sidebar.
- [ ] **Global Pending (The Inbox):** A master inbox of all unapproved requests across the entire
      clinic. Admins/Secretaries clear this out daily.
- [ ] **Global Attendance (Today's Clinic):** A list of every patient coming in _today_. Used by the
      front desk to quickly "Check-In" or mark "No-Show" without entering individual profiles.
- [ ] **Global Master Calendar (Upcoming):** Show a centralized future schedule of **ALL** clinic
      appointments.
- [ ] **Global Filters:** Add robust filtering so admins can sort the master list by Date, Doctor,
      Status (Approved, Pending, Displaced), and Service.
- [ ] **Unified Action Modal:** When an admin clicks on an appointment in these global lists, it
      should open the exact same detail view/modal with the same actions (Approve, Reject, Cancel,
      Reschedule) as they would see inside the individual Patient's profile.

---

## ⚙️ 8. Clinic Settings (Global System Configuration)

Create a centralized "Settings" module in the Admin app with inner tabs so operational rules and
website content aren't hardcoded.

### General & Operations

- [ ] **Clinic Operating Hours:** Configurable open/close times and lunch breaks per day.
- [ ] **Global Block-out Dates:** Add dates (holidays, emergencies) that are completely
      closed/disabled on the User booking calendar.
- [ ] **Booking Rules:**
    - Configuration for Slot Duration, Lead Time (e.g., must book 24h ahead), and Max Horizon (e.g.,
      book up to 2 months out).
    - Waitlist Toggle: Global ON/OFF switch.
- [ ] **Conflict Impact Review (The Ripple Effect):**
    - Build a "Review Changes" modal when an Admin saves a new Holiday or blocks a date.
    - This modal should list all **Active Appointments** that fall on those days and ask the user how to handle them (e.g., "Move to Displaced Area").

### Website Details (Headless Data Pivot)

- **Core Identity:** Editable fields for Clinic Name and Short Description (for SEO/Footer).
- **Contact Info:** Editable fields for Physical Address, Primary Phone, and Official Email.
- **Location & Hours:** Editable fields for Business Hours Text and Google Maps Link.
- **Brand Assets:** Input fields for Primary Logo URL, Light Logo URL, and Favicon URL.
- **Social Media:** Standard input fields for Facebook, Instagram, Twitter, and YouTube URLs.

### Automated Notifications & Legal

- [ ] **Legal Pages Management:** Simple text editor for updating Privacy Policy and Terms of
      Service dynamically.
- [x] **Automated Notifications Tab:**
    - Master ON/OFF switches for SMS and Email systems with explicit warnings about broken flows (e.g., OTP) when disabled.
    - Toggles for sending 24-hour and 48-hour reminders.
    - Configuration for Reminder Send Time (e.g., cron schedule time).
- [x] **Message Activity Tracker:**
    - Create a new read-only data table view in Admin (Promoted to Sidebar).
    - Display records from `message_logs` (Provider ID, Recipient, Channel, Purpose, Status like 'delivered'/'bounced').
- [ ] **Message Templates:** UI to safely modify the basic text of SMS/Email reminders without
      touching code.

---

## 💡 9. Recommendations & Missing Items (Consider Adding)

- [ ] **Bulk Actions:** For the Doctor and Patient lists, consider adding bulk actions (e.g.,
      sending mass emails, exporting data lists for external reports).
- [ ] **Export to CSV:** Essential for Admin/Business dashboards to export user counts or revenue
      reports.
- [ ] **Displaced Appointments UI:** As you built the "Deactivate Doctor / Remove Service" logic,
      you need a dedicated Admin or Secretary view to distinctly manage "Displaced/Orphaned"
      appointments.
- [ ] **System Status/Health Tab:** Useful for Admins to view if background jobs, SMS gateways, or
      Email services are experiencing downtime.


**10 . Email Template Editor ADIITIONAL FEATURE:**
      -   **Token Reference:** Next to each token in the editor (e.g., {{client_name}}),
          display a small clickable "i" (info) icon that shows a tooltip with the exact
          sample data that will be rendered (e.g., "Sample: John Doe").
      -   **Contextual Help:** When the Admin clicks the "i" icon, a small helper box should
          appear explaining what the variable is and what it controls in the system.
