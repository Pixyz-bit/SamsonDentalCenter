# Guest Booking System: Full Summary & QA Handover

This document provides a comprehensive overview of the newly implemented Guest Booking infrastructure, including business logic, abuse prevention rules, and a detailed checklist for QA verification.

---

## 🏗️ 1. System Overview
The Guest Booking system is designed to be a "Zero-Friction, High-Security" gateway for new patients. It allows users to book appointments without an account while protecting the clinic's calendar from spam and overlaps.

### Key Logic Flow:
1. **Service Selection**: Dynamic list filtered by availability.
2. **Date & Time Selection**: 10-minute "Slot Hold" triggered upon selection.
3. **Info Collection**: Real-time validation for Email (icons) and Phone (PH 10-digit limit).
4. **Pre-Validation**: Before OTP, the system runs 3 backend "Guards".
5. **OTP Verification**: Secure 6-digit code with exponential resend cooldowns.
6. **Confirmation**: Final submission and success receipt.

---

## 🛡️ 2. Abuse Prevention Rules (Backend Guards)
Three strict validation rules run when the user clicks **"Confirm Booking"** (Step 4), *before* any email is sent.

| Rule Name | Logic | User Feedback |
| :--- | :--- | :--- |
| **Volume Cap** | Max 3 Active (Pending/Confirmed) bookings per email. | "Booking Limit Reached" banner. |
| **Service Lock** | Prevents booking the *same service* on the *same day* for one email. | "Duplicate Booking Detected" banner. |
| **Overlap Guard** | Prevents booking a slot that overlaps with an existing appointment for that email. | "Scheduling Conflict" banner. |

---

## 💾 3. Resilience & Persistence
The wizard is "Refresh-Proof" and handles session interruptions gracefully.
- **Local Storage Sync**: All form data and the current step are mirrored to `localStorage`.
- **Session Recovery**: On page load, a **Recovery Modal** offers to "Continue" or "Start Fresh" if an active hold is found.
- **Timer Sync**: The 10-minute hold is synchronized with the server. If it expires, the user is redirected to the DateTime step with an **Expiry Modal**.

---

## 🔒 4. OTP Security Hardening
- **Hard Block**: After **5 failed attempts**, the session is locked. A "Security Lock" modal appears.
- **Shared Computer Safety**: Clicking "Restart" on a Hard Block fully wipes all personal data (Name, Phone, Email) from memory.
- **Resend Cooldown**: Exponential wait times between resends (30s → 60s → 120s → etc.) to prevent email spamming.

---

## ✨ 5. UI/UX Polish Highlights
- **Scroll-to-Error**: Automatically centers the first invalid field if the user misses a required input.
- **Real-time Email Feedback**: Green checkmark or Amber alert icons appear as the user types.
- **2-Minute Warning**: A global toast warning appears when the slot hold is about to expire.
- **Dynamic Clinic Support**: All error banners display the official **Clinic Phone Number** pulled directly from database settings.
- **High-Fidelity Modals**: Custom-designed modals for Exit, Reset, Expiry, and Security Lock (responsive bottom-sheets on mobile).

---

## ✅ 6. QA Handover Checklist

### **A. Functional Validation**
- [ ] **Data Persistence**: Fill in Step 2 (Info), refresh the page. Verify the "Recovery Modal" appears and restores your data.
- [ ] **Validation Guard (Volume)**: Try to book 4 appointments using the same email. Verify the 4th attempt is blocked with the "Booking Limit Reached" alert.
- [ ] **Validation Guard (Duplicate)**: Try to book "Teeth Whitening" twice on the same day for the same email. Verify the "Duplicate Booking Detected" alert.
- [ ] **Validation Guard (Overlap)**: Try to book 10:00 AM and 10:30 AM (if service duration is 60m). Verify the "Scheduling Conflict" alert.
- [ ] **Phone Hardening**: On Info Step, try to type 11 digits for a PH (+63) number. Verify it stops at 10.

### **B. Security & Edge Cases**
- [ ] **OTP Hard Block**: Enter the wrong OTP 5 times. Verify the "Security Lock" modal appears and blocks further action.
- [ ] **Timer Expiry**: Select a time, wait 10 minutes for the hold to expire. Verify you are redirected back to Step 1 with the "Session Expired" modal.
- [ ] **Exit Confirmation**: Click the "X" or "Exit" button. Verify the high-fidelity "Exit Booking?" modal appears instead of a browser alert.
- [ ] **Resend Throttling**: Click "Resend Code" multiple times. Verify the wait timer increases exponentially.

### **C. Visual & UI Review**
- [ ] **Real-time Email**: Type a partial email (e.g., `test@`). Verify the amber icon shows. Complete it (e.g., `test@gmail.com`). Verify the green checkmark shows.
- [ ] **Scroll-to-Error**: Leave "Last Name" empty, scroll to the bottom, and click "Continue". Verify the page smoothly scrolls back up to the empty field.
- [ ] **Mobile Responsiveness**: Verify all modals (Exit, Reset, Expiry) appear as bottom-sheets on mobile devices.
- [ ] **Dynamic Phone**: Change the clinic phone number in the Admin Settings. Verify the error banners in the Guest Booking flow update immediately.
