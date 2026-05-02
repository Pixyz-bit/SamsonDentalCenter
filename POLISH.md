# USER APP & GUEST BOOKING: POLISH & TO-DO LIST

## 🛑 1. Critical Bugs & Core Features (Highest Priority)

- [ ] **Fix Bug:** Guest booking cannot fetch date and time.
- [ ] **Remove Waitlist:** Remove the waitlist feature entirely from Guest booking, User booking,
      and delete the standalone waitlist page.
- [ ] **Auth Functionality:** Ensure Login and Signup pages are fully working and polished.
- [ ] **Account Creation Plan:** Finalize logic for "Create Account" during guest booking. If the
      email is verified via OTP during guest booking, skip the verification step for account
      creation later (or auto-link).

## 🔐 2. Security, Compliance & Performance

- [ ] **Environment Variables:** Scan for ALL hardcoded API tokens, passwords, and keys. Move them
      to `.env`.
- [ ] **Rate Limiting:** Add rate limiters on Authentication (Login, Signup) and OTP requests to
      prevent brute force attacks.
- [ ] **OTP Security:** Implement strict validation rules for OTPs (expiry times, max attempts,
      secure generation).
- [ ] **Data Sanitization & Security Audit:** Sanitize all user inputs to prevent SQL Injection/XSS.
      Improve overall API response speed.
- [ ] **IP & Compliance:** Check for IP infringement (images, assets). Ensure overall data and
      compliance standards are met.
- [ ] **Legal Pages:** Add **Privacy Policy**, **Terms of Use**, and **Terms of Service** pages.

## 📅 3. Booking Flow (User & Guest)

- [ ] **Guest Booking Polish:** Improve the UI design and make the entire flow 100%
      mobile-responsive.
- [ ] **Booking Notes (New):** Add an _optional_ text area for patients to write booking
      notes/reasons.
- [ ] **Form Validations:** Add strict input field validations and user-friendly visual error
      messages for both User and Guest booking.
- [ ] **Time Hold Display:** Polish the UI for the timer that holds a slot.
- [ ] **Booking Alerts:** Add helpful alerts/warnings at critical steps of the guest booking
      process.

## 👤 4. User Portal (Logged-in Experience)

- [ ] **Dashboard:** Improve and polish the Dashboard design.
- [ ] **My Appointments:** Polish the layout and interactions of the user's booking history/upcoming
      timeline.
- [ ] **Profile Page:** Improve the design and UX for editing user information.

## 🎨 5. Global UI/UX, Navigation & Branding

- [ ] **Mobile Responsiveness:** Ensure standard pages (Home, About, etc.) are fluid and polished on
      mobile screens.
- [ ] **Public Pages:** General visual design polish on the Home and About pages.
- [ ] **Theme & Branding:** Enhance and finalize the Navbar, Logo, and overall application Theme.
- [ ] **Pop-ups & Modals:** Improve the UI and animations of all app pop-ups.
- [ ] **Navigation & General UX:** Smooth out routing, transitions, and user flow feedback.
- [ ] **Loading States:** Improve the visibility and look of Loading Skeletons across the app.
- [ ] **Error States:** Design user-friendly error states (Empty states, 404 pages, network errors)
      instead of blank screens.

## 🔔 6. Communications & Notifications

- [ ] **In-App Notifications:** Review and improve the wording of notifications for all scenarios
      (bookings, updates, reminders).
- [ ] **Emails:** Polish HTML email templates for success messages, OTPs, etc.
- [ ] **SMS Content:** Finalize the dynamic SMS notification templates.
- [ ] **SMS Actions:** Implement custom SMS templates for when the secretary Approves or Rejects a
      request.

## 🛠 7. Codebase & System Polish

- [ ] **Refactoring:** Improve code reusability and optimize the folder structure.
- [ ] **Chatbot Integration:** Integrate an AI or rule-based chatbot for answering common inquiries.

---

## 💡 Recommendations & Missing Items (Consider Adding)

- [ ] **Cancellation/Reschedule Check:** Validate the flow for how users or guests cancel/reschedule
      an appointment. Is it easy and transparent?
- [ ] **Session Expiry Alerts:** If a user is inactive for too long, automatically log them out or
      show a warning popup (for security, given the medical nature of the app).
- [ ] **Cookie Consent Banner:** Essential since you are adding Legal Pages (Privacy Policy/Terms)
      to stay compliant.
- [ ] **State Persistence:** Ensure that if a user accidentally reloads the page mid-booking, they
      don't lose all the data they already typed in.
- [ ] **Timezone Management:** Double-check that date/time fetches during booking are strictly
      syncing with the Clinic's timezone regardless of the user's local device time.
- [ ] **SEO & Meta Tags:** Remember to add `<title>`, description, and OpenGraph tags to public
      pages for better search engine ranking.
