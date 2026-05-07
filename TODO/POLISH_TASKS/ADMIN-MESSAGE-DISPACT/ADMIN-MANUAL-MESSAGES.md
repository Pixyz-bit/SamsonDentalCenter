# Admin Message Dispatcher: Implementation Plan

This document details the blueprint for the "Message Dispatcher" module, allowing admins and
secretaries to manually send ad-hoc and templated emails or SMS messages directly to patients from
the Admin Portal.

## 1. Feature Overview (What to Expect)

The Message Dispatcher acts as the central communication hub. Instead of relying purely on automated
triggers (like booking confirmations), staff can proactively reach out to single or multiple
patients.

### Key Capabilities:

- **Multi-Channel Delivery:** Send either Emails or SMS text messages.
- **Recipient Selection:** Search and select one or multiple patients from the database to receive
  the broadcast.
- **Quick Actions from Patient Tables:** Directly trigger the Dispatcher from the Patient Database
  by clicking an "Email User" or "Message User" action button next to their name.
- **Template Utilization:** Access pre-configured Email and SMS templates defined in the
  `Content Templates` module.
- **Live Previews:** See exactly what the patient will receive before hitting send (HTML preview for
  emails, iOS/Android mockup for SMS).

---

## 2. Updated Sidebar Architecture

To house these features consistently, we are introducing a new **Communications** section in the
Admin Sidebar (`AdminSidebar.jsx`).

```javascript
{
    title: 'Communications',
    items: [
        { icon: <SendIcon />, name: 'Message Dispatcher', path: '/communications/dispatch' },
        { icon: <TemplateIcon />, name: 'Content Templates', path: '/communications/templates' }, // Manages both Email & SMS definitions
        { icon: <MailIcon />, name: 'Message Logs', path: '/message-activity' },
    ]
}
```

_Note: This architecture is scalable. If WhatsApp/Viber integrations are added later, they fold
seamlessly into this section._

---

## 3. UI Layout & Design (What it Will Look Like)

The Message Dispatcher screen (`/communications/dispatch`) will feature a split-pane interface or a
wizard-like flow.

### A. The Control Panel (Left Side)

1. **The Channel Toggle:** A clear, segmented control switch at the top.
    - `[ ✉️ Email ]` / `[ 📱 SMS ]`
2. **Recipient Selector:**
    - An autocomplete tagging input where admins can search for patient names.
    - A "Select All" or "Filter by Group" (e.g., all scheduled patients for Wednesday) for bulk
      announcements.
3. **Template Dropdown:**
    - **Dynamic Loading:** If "Email" is toggled, it displays `email_templates`. If "SMS" is
      toggled, it displays `sms_templates`.
4. **Message Editor:**
    - If a template is picked, it loads the content here.
    - Admins can tweak the text for this specific dispatch or write a completely custom message from
      scratch if no template is selected.

### B. The Preview Area (Right Side)

- **Email View Output:** A sandboxed `<Iframe>` rendering the full branded HTML (Clinic Logo,
  standardized blue buttons, clinic footer).
- **SMS View Output:** A visual mock-up of a smartphone screen. The text appears inside a gray SMS
  text bubble (typical iOS/Android look) to give staff context on message length. _Includes a
  character counter targeting max 160 chars per SMS segment._

---

## 4. Backend & Database Functionality

### 4.1 Schema Additions

We will need to modify the templates table or create a secondary table for SMS.

- `sms_templates` table (or expand `email_templates` to a generic `content_templates` table with a
  `type` column: ENUM('EMAIL', 'SMS')).
- **Message Logs Update:** Ensure the `message_logs` table clearly differentiates the channel. When
  rendering logs, the UI will display a small envelope icon ✉️ for emails and a phone icon 📱 for
  text messages.

### 4.2 Dispatch API Endpoint

- Create a dedicated `POST /api/v1/dispatch/send` route.
- Payload expected:
  `{ channel: "EMAIL" | "SMS", recipients: [uuid1, uuid2], templateId: (optional), content: "...", subject: "..." }`
- The endpoint will loop through the UUIDs, fetch the respective patient contact points (email or
  phone number), compile dynamic variables if a template was used, and dispatch via existing
  SMTP/Twilio services.

---

## 5. User Journey Example

1. A doctor is suddenly sick.
2. The secretary opens **Communications > Message Dispatcher**.
3. Selects `[ 📱 SMS ]` to ensure immediate visibility.
4. Uses the Recipient Selector to grab the 5 patients booked for this afternoon.
5. Selects the "Emergency Reschedule" SMS Template.
6. Glances at the Phone Mockup on the right to ensure it looks good.
7. Clicks **Send**.
8. Navigates to **Message Logs** to verify the delivery statuses via the green checkmarks next to
   the 📱 icons.
