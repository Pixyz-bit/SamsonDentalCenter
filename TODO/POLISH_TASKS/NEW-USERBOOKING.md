# 💎 PRIMERA DENTAL: POLISH & REFINEMENT TRACKER
*Last Updated: 2026-05-13*

---

## 🎨 1. Global UI/UX & Brand Identity
- [ ] **Logo Design:** Finalize and implement high-fidelity branding assets.
- [ ] **Landing Page Visuals:** Replace placeholders with premium, industry-specific images.
- [ ] **Dynamic Components:** Add micro-interactions and polish transitions for a "premium" feel.
- [x] **Skeletal Loaders:** Increased visibility and ensured they match the page layout.
- [ ] **Global Design Polish:** General audit and refinement of all page aesthetics.

## 🏠 2. Homepage & Navigation
- [x] **Navbar Typography:** Increased font size and optimized for maximum readability.
- [x] **Navbar Profile Pop-up:** Polished the design, animations, and spacing with mixed-case labels.
- [x] **Mobile Sidebar:** Fixed logo path and adjusted width for better mobile responsiveness.
- [x] **Homepage Responsiveness:** Fixed mobile layout for the **Booking Steps** (Second Section).

## 📅 3. Guest Booking Wizard (High Polish)
- [x] **Booking Cards:** Enhance border visibility and shadow depth for better focus.
- [x] **"Your Info" Step:** 
    - [x] Enforce strict **Philippine Phone Number** format (`09XX XXXX XXXX`) with auto-prefixing.
    - [x] Fix the **Suffix Dropdown** layout/functionality issues.
    - [x] Removed uppercase from section titles and labels.
    - [x] Added section separators and improved form spacing.
- [x] **Review & Verify Steps:**
    - [x] Removed all forced uppercase styling.
    - [x] Standardized labels and button typography.
- [x] **Navbar Labels:** Renamed and removed forced uppercase (Service, Schedule, Details, Review, Verify).
- [x] **Step 2 Instructions:** Updated title to 'Choose Schedule' and refined sub-description.
- [x] **Dentist Selection Toast:** Added informative loading message when switching dentists.
- [ ] **Account Verification:** Implement a "Hard Block" preventing existing users from using the Guest Booking flow (force login).

## 📄 4. Legal & Compliance
- [ ] **Terms & Policies:** Polish the layout and typography of the Terms of Service and Privacy Policy pages within the booking flow.

## 🤖 5. Advanced Integrations
- [ ] **AI Chatbot:** 
    - [ ] Restore full functionality.
    - [ ] Set dynamic height based on Viewport Height (`vh`) for better responsiveness.

## 👤 6. User Booking Wizard (Consistency & Polish)
- [x] **UI Parity:** Synchronized `UserOtherInfoStep` and `UserReviewStep` with Guest Wizard design (shadows, spacing, header).
- [x] **Typography:** Removed forced uppercase in labels and section titles.
- [x] **Phone Formatting:** Integrated the strict `09XX XXXX XXXX` auto-prefixing into the user flow.
- [x] **Hold Cleanup:** Fixed by adding an explicit fail-safe cleanup in `UserBookingSuccess` and ensuring backend conversion is triggered via `user_session_id`.
- [x] **Waitlist UI Polish:** Disabled waitlist logic in `useUserBooking` to prioritize direct booking as requested. Unused components retained as dead code for potential future use.
- [x] **Dependent Validation:** Implemented strict frontend validation for `birthday` and `sex` in `UserOtherInfoStep` with premium red-asterisk indicators and clinical context in error messages.
- [x] **Atomic Error Handling:** Refined "Retry" logic in `UserReviewStep` with a high-fidelity error state and context-aware "Change Schedule" recovery path.
- [x] **Contact Data Integrity:** Locked Email and Phone Number fields in `UserOtherInfoStep` to the primary account holder's data, preventing editing for dependents to ensure reliable communication.

---
## 🔄 Phase 2: Persistence & Resiliency (Alignment with Guest Flow)
- [x] **State Hydration:** Implement `localStorage` persistence in `useUserBooking` so data survives reloads (parity with Guest flow).
- [x] **Session Stability:** Ensure `user_session_id` persists in `localStorage` to enable reliable slot hold recovery.
- [x] **Navigation Guards:** Refine back/breadcrumb logic to auto-release holds and clear schedules when returning to the Service step.
    - *Update:* Fixed bug where holds were released just by going back or clicking a new service; now fully aligned with Guest flow—holds only release if you actually **proceed** to the next step with a different service selected.
- [x] **Hold Expiry Handling:** Implement the "Need More Time?" modal and auto-redirect logic for expired holds.
- [x] **Global Timer Parity:** Sync the sticky header timer and progress bar with the Guest flow's premium aesthetics.
- [x] **Recovery UX:** Ensure the "Resume Booking?" modal appears correctly even if the page is reloaded at the Service step.

---
## 🧪 Manual Verification Checklist
- [x] **Test 1: Reload Persistence**
    - Go to Step 2 (Details) and fill in some info.
    - Refresh the page (F5).
    - **Expectation:** You should remain on Step 2 with all fields still filled.
- [x] **Test 2: Slot Hold Recovery**
    - Pick a service and a time slot (Hold should start).
    - Close the tab and reopen the booking wizard.
    - **Expectation:** The "Resume Booking?" modal should appear, allowing you to continue with your reserved slot.
- [ ] **Test 3: Hold Expiry Flow**
    - Pick a time slot and wait for the 10-minute hold to expire (or use a test slot with short duration).
    - **Expectation:** A "Need More Time?" modal appears, redirects you to Step 1 (Schedule), and clears the old time selection while keeping your other info.
- [ ] **Test 4: Breadcrumb Locking**
    - Reach Step 4 (Review).
    - Try to click the "Service" or "Schedule" breadcrumbs in the header.
    - **Expectation:** Breadcrumbs should be non-clickable (Locked) to prevent accidental data loss.
- [ ] **Test 5: Reset Integrity**
    - Click "Start Over" or "Exit -> Discard".
    - **Expectation:** All wizard data is wiped from `localStorage`, and the next booking starts fresh.

---
*Note: Mark items as [x] when completed.*