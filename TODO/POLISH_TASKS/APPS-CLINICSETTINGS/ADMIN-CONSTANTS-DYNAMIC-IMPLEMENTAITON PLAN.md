# Comprehensive Admin Constants Implementation Plan

This document outlines the exact, safe execution steps to inject the new dynamic constraints into
the Backend API, the Database schema, and the Admin Settings UI.

**CRITICAL SCOPE NOTE:** As requested, we are _only_ preparing these fields in the database and the
Admin UI. They will **not** be wired into the live user/guest booking logic yet. This allows the
admin to set and configure them safely before we activate them in the actual apps.

## 📋 Target Checklist

- [ ] **1. Run SQL Migration:** Append the 9 new DB fields to `clinic_settings`.
- [ ] **2. Update Zod Schema (`settings.schema.js`):** Add strict bounds for the new fields to
      protect the backend.
- [ ] **3. Update Admin UI Hook (`useSettings.js` / Hydration):** Ensure the admin frontend captures
      and hydrates the new API payloads.
- [ ] **4. Update Admin UI Settings Tab (`ClinicRulesSettings.jsx`):** Insert the precise UI
      sections ("Patient Accountability", "Scheduling Guardrails", "Security & Access") with correct
      labels.

---

## 🛠 Stage 1: Database Migration (SQL)

Create a file inside `BLUEPRINT/BACKEND/MIGRATIONS/` called
`20260505_add_dynamic_business_constants.sql` (match the exact timestamp of today):

```sql
-- Migration: Add dynamic constraints for Global Rules (Admin Preparation)
-- Date: 2026-05-05

ALTER TABLE clinic_settings
-- 1. Patient Accountability
ADD COLUMN IF NOT EXISTS cancel_penalty_window_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS cancel_restrict_threshold INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS no_show_restrict_threshold INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS no_show_restrict_advance_days INTEGER DEFAULT 5,

-- 2. Scheduling Guardrails
ADD COLUMN IF NOT EXISTS max_appointments_per_day_per_user INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_reschedules_per_appointment INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS max_guest_bookings_per_email INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS slot_hold_duration_minutes INTEGER DEFAULT 10,

-- 3. Security & Access
ADD COLUMN IF NOT EXISTS max_otp_failed_attempts INTEGER DEFAULT 5;
```

**Note:** Ensure you run this directly in the Supabase SQL editor.

---

## 🛡️ Stage 2: Express Backend Validation

We must update the REST API to accept these fields when the Admin hits "Save".

**File: `apps/api/src/schemas/settings.schema.js`** _(Or wherever `updateClinicSettingsSchema` is
located)_ Append these exact lines to the Zod object:

```javascript
/* 1. Patient Accountability */
cancel_penalty_window_hours: z.number().min(1).max(72).optional(),
cancel_restrict_threshold: z.number().min(1).max(10).optional(),
no_show_restrict_threshold: z.number().min(1).max(10).optional(),
no_show_restrict_advance_days: z.number().min(1).max(30).optional(),

/* 2. Scheduling Guardrails */
max_appointments_per_day_per_user: z.number().min(1).max(10).optional(),
max_reschedules_per_appointment: z.number().min(1).max(5).optional(),
max_guest_bookings_per_email: z.number().min(1).max(10).optional(),
slot_hold_duration_minutes: z.number().min(1).max(30).optional(),

/* 3. Security & Access */
max_otp_failed_attempts: z.number().min(1).max(10).optional(),
```

---

## 🖥️ Stage 3: Admin UI Implementation

We must hydrate these fields safely inside `ClinicRulesSettings.jsx`.

### 1. Update State Hydration

**File: `apps/admin/src/components/admin/settings/ClinicRulesSettings.jsx`**

```javascript
// Expand the initial state and hydration
const [rulesData, setRulesData] = useState({
    booking_lead_time_days: 1,
    booking_max_horizon_days: 60,
    waitlist_enabled: true,
    // --- NEW FIELDS ---
    cancel_penalty_window_hours: 24,
    cancel_restrict_threshold: 3,
    no_show_restrict_threshold: 3,
    no_show_restrict_advance_days: 5,
    max_appointments_per_day_per_user: 1,
    max_reschedules_per_appointment: 2,
    max_guest_bookings_per_email: 3,
    slot_hold_duration_minutes: 10,
    max_otp_failed_attempts: 5,
});

useEffect(() => {
    if (settings) {
        setRulesData({
            booking_lead_time_days: settings.booking_lead_time_days ?? 1,
            booking_max_horizon_days: settings.booking_max_horizon_days ?? 60,
            waitlist_enabled: settings.waitlist_enabled ?? true,
            // --- NEW FIELDS ---
            cancel_penalty_window_hours: settings.cancel_penalty_window_hours ?? 24,
            cancel_restrict_threshold: settings.cancel_restrict_threshold ?? 3,
            no_show_restrict_threshold: settings.no_show_restrict_threshold ?? 3,
            no_show_restrict_advance_days: settings.no_show_restrict_advance_days ?? 5,
            max_appointments_per_day_per_user: settings.max_appointments_per_day_per_user ?? 1,
            max_reschedules_per_appointment: settings.max_reschedules_per_appointment ?? 2,
            max_guest_bookings_per_email: settings.max_guest_bookings_per_email ?? 3,
            slot_hold_duration_minutes: settings.slot_hold_duration_minutes ?? 10,
            max_otp_failed_attempts: settings.max_otp_failed_attempts ?? 5,
        });
    }
}, [settings]);
```

### 2. UI Injection (The 3 Sections)

Build out the UI strictly using the following layout and labels:

#### section 1: Patient Accountability

_Focus on penalties and behavior._

- **Cancellation Penalty Window** (`cancel_penalty_window_hours`) - _Hours before an appointment
  where canceling counts as a "Late Cancel."_
- **Cancellation Limit** (`cancel_restrict_threshold`) - _Number of late cancellations allowed
  before account restriction._
- **No-Show Limit** (`no_show_restrict_threshold`) - _Number of missed appointments allowed before
  account restriction._
- **Restriction Duration** (`no_show_restrict_advance_days`) - _How many days a restricted user is
  blocked from booking._

#### section 2: Scheduling Guardrails

_Focus on calendar protection._

- **Daily Booking Limit** (`max_appointments_per_day_per_user`) - _Max appointments a single user
  can hold on the same day._
- **Reschedule Limit** (`max_reschedules_per_appointment`) - _How many times a single booking can be
  moved before it's locked._
- **Guest Booking Limit** (`max_guest_bookings_per_email`) - _Max active appointments allowed for
  non-registered users._
- **Checkout Timer** (`slot_hold_duration_minutes`) - _How many minutes a slot is held while a user
  is filling the form._

#### section 3: Security & Access

_Focus on system integrity._

- **Login Attempt Limit** (`max_otp_failed_attempts`) - _Failed OTP attempts allowed before the
  email is temporarily locked._

---

### What to Expect Post-Execution

- **Admin App:** You will have three beautifully organized sections under "Global Rules". You can
  tweak these values, save them, and they will persist in the database.
- **Backend:** Zod cleanly enforces validation on the backend so you can't accidentally save an
  invalid setup.
- **Frontend (Live Booking):** Unchanged. Since we skipped "Stage 4" (wiring it up to the API
  validations), your user and guest apps will continue using the hardcoded values for now. The
  dynamic configurations sit securely in the background, ready for you to flip the switch whenever
  you are ready.
