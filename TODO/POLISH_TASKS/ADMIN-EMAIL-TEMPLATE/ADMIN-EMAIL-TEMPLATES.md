# Admin Email Template Management: Implementation Plan

This document outlines the detailed implementation of an in-app "Email Template Editor" inside the
Admin Portal. This will allow the admin to select an existing email type (e.g., OTP string, Booking
Confirmed), view the raw HTML/Markdown, inject dynamic variables (like `{{name}}`), and preview/save
the template directly to the database instead of relying on hardcoded `.html` files in the server
directory.

---

## 📋 1. The Goal & Scope

To transition away from static `fs.readFileSync` templates (like `guest-otp.html`,
`booking-confirmed.html`) into dynamically loaded database-driven templates. Admins will use a UI
with a dropdown to select the template type, an IDE-like editor for HTML, a live preview pane, and
an explicit list of available dynamic variables `{{...}}` for each type of email.

## 🗄️ 2. Database Schema Changes (Non-Destructive)

We need a dedicated table to store these templates, supporting versioning or at least overriding the
defaults.

### 2.1 SQL Migration (`20260505_create_email_templates.sql`)

```sql
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'guest-otp', 'booking-confirmed'
    subject_line VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    available_variables JSONB NOT NULL DEFAULT '[]', -- Array of keys: ['name', 'date', 'time']
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Stubs based on current hardcoded files
INSERT INTO email_templates (template_key, subject_line, html_content, available_variables, description) VALUES
('guest-otp', 'Primera Dental - Your Verification Code', '<html>...</html>', '["name", "otpCode", "expiresIn"]', 'Sent to guests to verify their email before booking.'),
('booking-confirmed', 'Your Appointment is Confirmed', '<html>...</html>', '["name", "service", "date", "time", "location"]', 'Sent when the secretary approves a booking.'),
('booking-request-received', 'Booking Request Received', '<html>...</html>', '["name", "service", "date", "time"]', 'Sent instantly upon booking request.'),
('booking-cancelled', 'Appointment Cancelled', '<html>...</html>', '["name", "service", "date", "time", "reason"]', 'Sent when an appointment is cancelled.'),
('appointment-rescheduled', 'Appointment Rescheduled', '<html>...</html>', '["name", "service", "oldDate", "newDate", "newTime"]', 'Sent when an appointment time is moved.'),
('appointment-reminder', 'Reminder: Upcoming Appointment', '<html>...</html>', '["name", "service", "date", "time"]', 'Sent 24/48 hours before the appointment.'),
('waitlist-offer', 'A Slot Opened Up!', '<html>...</html>', '["name", "service", "date", "time", "claimLink", "expiresIn"]', 'Sent to waitlist users when a slot matches.'),
('account-setup-invite', 'Set up your Primera Dental Account', '<html>...</html>', '["name", "setupLink"]', 'Sent to guests converted into patients by the Admin.')
ON CONFLICT (template_key) DO NOTHING;
```

---

## ⚙️ 3. Backend Refactoring (`api/src/services/email-confirmation.service.js`)

The backend currently reads from the filesystem (`fs.readFileSync`). It needs to query the database,
fallback to the file system if DB fails, and process the variables.

- [ ] **Create Template API**: `GET /api/v1/email-templates` and `PUT /api/v1/email-templates/:key`
      to fetch and update the layout and subject lines.
- [ ] **Refactor `getTemplate` Function**:
    - Change `getTemplate` to be strictly asynchronous.
    - Query `SELECT html_content, subject_line FROM email_templates WHERE template_key = ?`.
    - Compile the `{{variable}}` tags exactly as it currently does.
- [ ] **Fallback Mechanism**: Maintain the strict fallback where if the DB is empty (or the query
      fails), it pulls from
      `fs.readFileSync(path.join(process.cwd(), '..', '..', 'EmailTemplates', templateName))`.

---

## 🖥️ 4. Admin UI: The Template Editor

We will build a dedicated "Email Templates" tab in the Settings UI or a standalone page under
Communications.

### 4.1 Layout & Interface

- **Categorized List View**: A sidebar or dropdown to select from categories (e.g., Auth, Bookings,
  Waitlist).
- **The Editor (Left Pane)**: A raw text/code area for HTML editing.
- **The Variable Reference (Side Panel)**: A dynamic list of "clickable" tags (e.g., `{{name}}`)
  that the admin can see for each specific template to prevent typos. Clicking a tag injects it into
  the editor.
- **The Live Preview (Right Pane)**:
    - **Sandboxed Iframe:** Used to isolate email styles from the Admin Portal UI and prevent style
      bleeding.
    - **Live-Mapping Function:** Replaces template tags with realistic dummy data (e.g., "John Doe",
      "May 15th", "10:00 AM") in real-time as the admin types.
- **Subject Line Interface**: A dedicated text field above the editor to change the subject line,
  which also supports live variable replacement.

---

## 🛡️ 5. Safety & Recovery Protocols

To prevent admins from breaking critical booking and verification systems, these guards must be
implemented:

- **Syntax Validation**: A pre-save check to ensure all `{{` and `}}` tags are properly closed and
  that vital structural HTML tags (like `<table>`, `<body>`, or `<html>`) aren't missing or severely
  malformed.
- **The "Factory Reset"**: A "Restore to Default" button that pulls the original hardcoded file
  content from the local server directories and overwrites the active database record.
- **Variable Protection**: A warning system that alerts the admin if they try to save a template
  while accidentally removing a "Critical Variable" (e.g., omitting the `{{otpCode}}` tag in a guest
  verification email).

---

## 🚀 6. Deployment Phase

- **Dual-Read Period**: Initially, have the system check the DB; if a template is missing or the DB
  query fails, it silently falls back to the local `fs.readFileSync` files to ensure zero downtime.
- **Audit Logging**: Record which admin edited which template and when in the `audit_log` table,
  ensuring strict traceability in case a change breaks a template and needs to be reverted.
