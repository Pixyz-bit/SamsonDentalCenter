# USER APP & GUEST BOOKING: POLISH & TO-DO LIST

## 🛑 1. Critical Bugs & Core Features (Highest Priority)

- [ ] **Fix Bug:** Guest booking cannot fetch date and time.
- [ ] **Fix Bug:** Reschedule step indicator is broken. It should only show "Date and Time" and
      "Review".
- [ ] **Fix Bug:** Clicking an "Approved" appointment fails to show details. Fix the details view
      for recently approved appointments.
- [ ] **Account Creation Plan:** Finalize logic for "Create Account" during guest booking. If the
      email is verified via OTP during guest booking, skip the verification step for account
      creation later (or auto-link).
- [ ] **Auto No-Show:** Automatically move past appointments (that were never completed/checked-in)
      to "No Show" status in the history.
- [ ] **Waitlist Handeling:** Change the Waitlist page to "Coming Soon". Disable all waitlist
      logic/actions on the user side for now (until the testing phase or a better alternative is
      decided).

## 📅 2. Appointments Management (My Appointments UI/UX)

- [ ] **Pending State Actions:** If an appointment is "Pending", the ONLY available action should be
      "Cancel Request". Users CANNOT reschedule a pending appointment.
- [ ] **Approved State Actions:** If an appointment is "Approved", available actions are "Cancel"
      and "Reschedule".
- [ ] **Notes Integration:** Ensure notes from the Secretary (when approving/rejecting) are fully
      visible in the appointment details.
- [ ] **History Tab:** The History list should ONLY show "Cancelled," "Rejected," "Completed," and
      "No Show" appointments.
- [ ] **Action Warnings:** Add strict confirmation popups/warnings before a user proceeds with
      "Cancel" or "Reschedule".

## 🔐 3. Security, Compliance & Performance

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

## 📅 4. Booking Flow (User & Guest)

- [ ] **Guest Booking Polish:** Improve the UI design and make the entire flow 100%
      mobile-responsive.
- [ ] **Booking Notes (New):** Add an _optional_ text area for patients to write booking
      notes/reasons.
- [ ] **Form Validations:** Add strict input field validations and user-friendly visual error
      messages for both User and Guest booking.
- [ ] **Time Hold Display:** Polish the UI for the timer that holds a slot.
- [ ] **Booking Alerts:** Add helpful alerts/warnings at critical steps of the guest booking
      process.

## 👤 5. User Portal (Logged-in Experience)

- [ ] **Dashboard:** Improve and polish the Dashboard design.
- [ ] **Profile Page:** Improve the design and UX for editing user information.

## 🎨 6. Global UI/UX, Navigation & Branding

- [ ] **Mobile Responsiveness:** Ensure standard pages (Home, About, etc.) are fluid and polished on
      mobile screens.
- [ ] **Public Pages:** General visual design polish on the Home and About pages.
- [ ] **Theme & Branding:** Enhance and finalize the Navbar, Logo, and overall application Theme.
- [ ] **Pop-ups & Modals:** Improve the UI and animations of all app pop-ups globally.
- [ ] **Navigation & General UX:** Smooth out routing, transitions, and user flow feedback.
- [ ] **Loading States:** Improve the visibility and look of Loading Skeletons across the app.
- [ ] **Global Error Pages (404/500):** Create polished, reusable global error pages (e.g., 404 Not
      Found, 500 Server Error) that can be easily called across all routes, instead of generic blank
      screens.

## 🔔 7. Communications & Notifications

- [ ] **In-App Notifications Page:** Create a complete list of all possible notification messages,
      and correctly format them inside the User Notifications list.
- [ ] **Emails:** Polish HTML email templates for success messages, OTPs, etc.
- [ ] **SMS Content:** Finalize the dynamic SMS notification templates.
- [ ] **SMS Actions:** Implement custom SMS templates for when the secretary Approves or Rejects a
      request.

## 🛠 8. Codebase & System Polish

- [ ] **Auth Functionality:** Ensure Login and Signup pages are fully working and polished.
- [ ] **Refactoring:** Improve code reusability and optimize the folder structure.
- [ ] **Chatbot Integration:** Integrate an AI or rule-based chatbot for answering common inquiries.

---

## 💡 Recommendations & Missing Items (Consider Adding)

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


- [ ] **Legal Footer Links:** Fix "Privacy Policy" and "Terms & Conditions" links in the Patient Portal footer to correctly redirect to their respective pages.
- [ ] **Notification Toggle Test:** Verify that Admin toggles for SMS/Email notifications correctly enable/disable communications during the booking flow.

BUG ON BOOKING FLOW OF GUEST IF THE DOCTOR IS AVAILABLE BUT THE SLOT IS NOT OR VICE VERSA IT SHOULD NOT BE SHOWN IN THE DOCTOR LIST SINCE TECHINACLLY IT IS NOT AVAILABLE AT ALL

OTP MAKE IT CAN ONLY TRY 5 times if it failed then it will send the OTP again but it should be delay for 2mins to send again to prevent spam and abuse
