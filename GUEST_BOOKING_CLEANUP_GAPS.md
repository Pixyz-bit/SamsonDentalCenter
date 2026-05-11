# Guest Booking Cleanup Gaps Analysis

This document outlines the identified issues where the "Slot Hold" cache/session is not properly cleaned up during the guest booking process, leading to persistent active holds in the database even after successful or failed bookings.

## 1. Identified Causes

### A. Backend: Appointment Creation ignores Hold Status
In `appointment.service.js`, the `bookAppointmentGuest` and `bookAppointment` methods correctly identify a dentist from an existing hold (to ensure the user gets the dentist they were "promised"). However, these methods **never update the `slot_holds` table** to mark the hold as `released` or `converted`.
- **Status:** The hold remains `status: 'active'` until the background cleanup or natural expiry (10 minutes).
- **Location:** `apps/api/src/services/appointment.service.js` (lines 100-117 and 480-498).

### B. Frontend: Local Clear vs. Server Release
In `useGuestBooking.js`, the `submit` function calls `slotHold.clearHold()` upon success.
- **Issue:** `clearHold()` only wipes the local React state and `localStorage`. It **does not** trigger a network request to release the hold on the server.
- **Location:** `apps/user/src/hooks/useGuestBooking.js` (line 319).

### C. Frontend: Success Reset Race Condition
When a user completes a booking and then clicks "Book Another" (which calls `handleReset` -> `reset()`):
- **Issue:** Since `submit()` already called `clearHold()`, the `activeHold` state is null. The `reset()` function's safety check `if (slotHold.activeHold)` fails, so it never tells the server to release the hold.
- **Location:** `apps/user/src/hooks/useGuestBooking.js` (line 374).

### D. Frontend: Unhandled Failure Path
If the booking `submit()` fails (e.g., server error, network timeout), no cleanup is performed. The user remains on the verification/review step with an active hold that they cannot easily release without a manual refresh or clicking "Start Over".

### E. Browser/Tab Closure
The `beforeunload` listener in `GuestBookingWizard.jsx` is currently empty. While recovery is supported, there is no "hard exit" logic that ensures the session is wiped if the user explicitly navigates away from the booking sub-domain.

---

## 2. Critical Bug: Double Deduction of Availability

The most severe consequence of these gaps is the **Double Deduction Bug** in `slot.service.js`:

1. **User A** holds a slot (Availability decreases by 1).
2. **User A** completes the booking. An appointment is created (Availability decreases by 1).
3. The hold remains `active` for 10 minutes.
4. **User B** checks availability. The system subtracts BOTH the appointment AND the hold.
5. Result: The system reports 1 fewer slot than actually available, potentially showing "Fully Booked" when it's not.

---

## 3. Missed Cleanup Scenarios

| Scenario | Expected Behavior | Current Reality |
| :--- | :--- | :--- |
| **Successful Booking** | Hold should be marked as `released` (or a new status like `consumed`) immediately. | Hold stays `active` in DB for the remaining duration (~10 mins). |
| **Failed Validation** | If the user hits a fatal error (e.g., security lock), hold should be released. | Hold stays `active` until expiry. |
| **"Start Over" from Success** | Should ensure the previous session's hold is released. | Fails to release because local state was already cleared. |
| **Tab/Browser Close** | (Optional but recommended) Release hold if it's a "clean" close. | Relies solely on 10-minute server-side expiry. |

---

## 3. Recommended Fixes

### 1. Backend Integration (High Priority)
Modify `bookAppointmentGuest` and `bookAppointment` in `appointment.service.js` to explicitly release the hold once the appointment is successfully inserted.
```javascript
// Suggested logic inside bookAppointmentGuest:
if (userSessionId) {
    await releaseHoldBySession(userSessionId); 
}
```

### 2. Frontend Hook Alignment
Update `useGuestBooking.js` to call `slotHold.releaseHold()` instead of (or before) `slotHold.clearHold()` in the success path.

### 3. Session Hard-Reset
Ensure `reset()` in `useGuestBooking.js` unconditionally attempts to clear the session on the server if a `sessionId` exists, rather than just checking the local `activeHold` state.

---

**Status:** Research Complete. Implementation pending approval.
