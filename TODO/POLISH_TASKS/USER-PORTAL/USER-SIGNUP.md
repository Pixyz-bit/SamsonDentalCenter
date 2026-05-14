# User Sign-UP & Registration Polish

We are refactoring the registration flow into a 3-step process with custom OTP verification and enhanced personal details (Sex, Date of Birth).

## Implementation Plan

### 1. Database Updates
- [x] Update `profiles` trigger to capture `sex` and `date_of_birth`.
- [x] Create `registration_requests` table for pending accounts.

### 2. Backend Enhancements
- [x] New `registration.service.js` to handle OTP generation and verification.
- [x] Manually create Supabase Auth users after OTP success to bypass default email confirmation.

### 3. Frontend Reconstruction
- [x] **Step 1: Personal Details** (Name, Sex, DOB)
- [x] **Step 2: Contact & Password** (Email, Phone, Password)
- [x] **Step 3: OTP Verification** (6-digit code)

---

## OTP Verification Parity (Sync with Guest Booking)

To ensure a secure and consistent experience, we are aligning the Registration OTP with the Guest Booking OTP logic.

### 1. Core Security Features
- [x] **Failed Attempt Tracking**: Track `failedOtpAttempts` in state.
- [x] **Hard Lockout**: Implement a "Security Lock" modal after 5 failed attempts.
- [x] **Session Restart**: Force "Start Over" when locked or when user chooses to clear progress.
- [x] **Auto-Verification**: Trigger verification automatically once all 6 digits are entered.

### 2. UI & Feedback Enhancements
- [x] **Dynamic Cooldown**: Implement the sequence `[30, 60, 60, 120, 180, 300]` for resend timers.
- [x] **Remaining Attempts Alert**: Show "X attempts remaining" within the error banner.
- [x] **Interactive Inputs**: Add shake animation on error and auto-focus improvements.
- [x] **Start Over Action**: Add a "Start Over" button to clear registration data and release state.

### 3. State Management
- [x] **Counter Persistence**:Persist attempt counters to survive accidental refreshes.
- [x] **Error Handling**: Standardize error toasts and in-page alerts to match Guest Wizard styling.

---

> [!NOTE]
> See the detailed [implementation_plan.md](file:///C:/Users/Administrator/.gemini/antigravity/brain/660024a8-0dd3-437f-8771-3d286ebe549e/implementation_plan.md) for technical specifics.