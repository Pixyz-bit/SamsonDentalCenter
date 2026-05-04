# Dynamic Constants & Business Rules Roadmap

This document outlines the strategy for moving hardcoded business logic from the codebase into the `clinic_settings` database table, allowing for real-time administrative control.

---

## 🔍 Hardcoded Constants Identification

| Constant | Current Value | Location | Recommendation |
| :--- | :--- | :--- | :--- |
| `HOLD_DURATION_MINUTES` | 5 | `slot-hold.service.js` | Move to `clinic_settings` |
| `SLOT_DURATION_MINUTES` | 30 | `constants.js` | Move to `clinic_settings` |
| `CANCEL_NOTICE_HOURS` | 24 | `constants.js` | Move to `clinic_settings` |
| `WAITLIST_TIMEOUT_MIN` | 25 | `constants.js` | Move to `clinic_settings` |
| `NO_SHOW_GRACE_MIN` | 15 | `constants.js` | Move to `clinic_settings` |
| `MAX_ADVANCE_BOOKING` | 3 mo | `constants.js` | Already in DB as `max_horizon_days` |
| `NO_SAME_DAY_ONLINE` | true | `constants.js` | Move to `clinic_settings` |

---

## 🛠 Implementation Plan

### 1. Database Migration (SQL)
Add the missing columns to the `clinic_settings` table to accommodate these rules.

```sql
ALTER TABLE clinic_settings 
ADD COLUMN IF NOT EXISTS slot_hold_duration_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS cancel_notice_hours INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS waitlist_timeout_minutes INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS no_show_grace_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS allow_same_day_online BOOLEAN DEFAULT FALSE;
```

### 2. Backend Architecture (API)
- **Settings Service:** Create a centralized `src/services/settings.service.js` to fetch and cache these values.
- **Refactoring:** Update services to consume these dynamic values instead of importing from `constants.js`.
- **Validation:** Ensure new settings passed via Admin UI are validated (e.g., hold duration must be > 0).

### 3. Admin Frontend (Clinic Settings)
- **UI Sections:** Group new settings under "Booking Rules" and "System Policy".
- **Real-time Updates:** Ensure that changing a setting in the Admin app immediately affects new booking sessions.

### 4. User Frontend (Booking Wizard)
- **Consumption:** The booking wizard should fetch rules (like `cancel_notice_hours`) from the API or a shared context to ensure consistency with the backend enforcement.

---

## 🚦 Phase 1 Focus: Booking Stability
Priority will be given to `slot_hold_duration_minutes` and `allow_same_day_online` as they directly impact the Guest Booking flow currently under development.
