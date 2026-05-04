# Dynamic Constants & Business Rules Roadmap

This document outlines the strategy for moving hardcoded business logic from the codebase into the
`clinic_settings` database table, allowing for real-time administrative control.

---

## 🔍 Hardcoded Constants Identification

| Constant                | Current Value | Location                            | Recommendation            |
| :---------------------- | :------------ | :---------------------------------- | :------------------------ |
| `HOLD_DURATION_MINUTES` | 5             | `slot-hold.service.js`              | Move to `clinic_settings` |
| `SLOT_DURATION_MINUTES` | 30            | `constants.js`                      | Move to `clinic_settings` |
| `MAX_GUEST_BOOKINGS`    | 3             | `appointment-validation.service.js` | Move to `clinic_settings` |

---

## 🚀 Priority Configuration Additions (Guest & Calendar Constraints)

After investigating your recent database migrations (specifically
`20260502_update_clinic_settings_foundation.sql` and
`20260502_update_clinic_settings_extension.sql`), you already implemented several key configurations
including `booking_lead_time_hours`, `booking_max_horizon_days`, `slot_duration_minutes`, and
`waitlist_enabled`.

Here are the _remaining_ constants we need to move to make Guest Booking fully dynamic without
touching the codebase again:

### 1. Booking Validation & Restrictions

- `max_guest_bookings_per_email` (e.g. 3) - Allows a family of 5 to book if the clinic raises the
  limit temporarily. _(Note: `booking_lead_time_hours` and `booking_max_horizon_days` already handle
  the advance rules)._

### 2. Patient Restrictions (Friction Rules)

- `no_show_restrict_threshold` (e.g. 3) - Currently `NO_SHOW_RESTRICT_THRESHOLD`. Hits 3 no-shows,
  gets restricted.
- `no_show_restrict_advance_days` (e.g. 5) - Currently `NO_SHOW_RESTRICT_ADVANCE_DAYS`.
- `cancel_restrict_threshold` (e.g. 3) - Currently `CANCEL_RESTRICT_THRESHOLD`. Hits 3
  cancellations, gets restricted.

### 3. Waitlist & Overbooking Mechanics

- `waitlist_timeout_minutes` (e.g. 25) - Currently `WAITLIST_TIMEOUT_MINUTES`. Time an applicant has
  to claim a newly open slot.
- `waitlist_global_limit` (e.g. 3) - Currently `WAITLIST_GLOBAL_LIMIT`. Max waitlists a single
  patient can be on.
- `overbook_low_risk_percent` (e.g. 10) - Currently `OVERBOOK_LOW_RISK_PERCENT`.

### 4. Security (Guest Focus)

- `max_otp_failed_attempts` (e.g. 5) - The current lockout setting. _(Note: `terms_of_service_text`,
  `privacy_policy_text` and `phone_primary` already exist in the schema)._

---

## 🛠 Implementation Plan

### 1. Database Migration (SQL)

We update the table strictly appending fields that don't already exist.

```sql
ALTER TABLE clinic_settings
ADD COLUMN IF NOT EXISTS slot_hold_duration_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_guest_bookings_per_email INTEGER DEFAULT 3,

-- Patient Restriction Limits
ADD COLUMN IF NOT EXISTS no_show_restrict_threshold INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS no_show_restrict_advance_days INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS cancel_restrict_threshold INTEGER DEFAULT 3,

-- Waitlist configuration
ADD COLUMN IF NOT EXISTS waitlist_timeout_minutes INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS waitlist_global_limit INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS overbook_low_risk_percent INTEGER DEFAULT 10,

-- Security and Legal
ADD COLUMN IF NOT EXISTS max_otp_failed_attempts INTEGER DEFAULT 5;
```

### 2. Backend Architecture (API)

- **Settings Service:** Create a centralized `src/services/settings.service.js` to fetch and cache
  these values.
- **Refactoring:** Update services to consume these dynamic values instead of importing from
  `constants.js`.
- **Validation:** Ensure new settings passed via Admin UI are validated (e.g., hold duration must
  be > 0).

### 3. Admin Frontend (Clinic Settings)

- **UI Sections:** Group new settings under "Booking Rules" and "System Policy".
- **Real-time Updates:** Ensure that changing a setting in the Admin app immediately affects new
  booking sessions.

### 4. User Frontend (Booking Wizard)

- **Consumption:** The booking wizard should fetch rules (like `cancel_notice_hours`) from the API
  or a shared context to ensure consistency with the backend enforcement.

---

## 🚦 Phase 1 Focus: Booking Stability

Priority will be given to `slot_hold_duration_minutes` and `allow_same_day_online` as they directly
impact the Guest Booking flow currently under development.
