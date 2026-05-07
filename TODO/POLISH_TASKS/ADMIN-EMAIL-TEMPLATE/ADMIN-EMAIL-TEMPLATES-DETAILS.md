# Admin Email Template Management: Detailed Implementation Plan

This document outlines the end-to-end plan for integrating a Database-Driven Email Template Editor
with Live Preview into the existing SaaS architecture.

## 1. Sidebar Navigation Integration

To maintain the architectural cleanliness established in `ADMIN-SIDEBAR.md`, we will add the new
feature under `System & Logs`.

**Update in `AdminSidebar.jsx` (under `navigationGroups`):**

```javascript
// ...existing code...
    {
        title: 'System & Logs',
        items: [
            { icon: <MailIcon />, name: 'Message Logs', path: '/message-activity' },
            { icon: <TemplateIcon />, name: 'Email Templates', path: '/email-templates' }, // NEW ITEM
            { icon: <AuditIcon />, name: 'Audit Trail', path: '/audit-logs' },
            { icon: <SettingsIcon />, name: 'Clinic Configuration', path: '/settings' },
        ],
    },
// ...existing code...
```

## 2. Database Schema (Schema Updates)

We need a table to store the templates. We will execute the following SQL migration.

```sql
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) UNIQUE NOT NULL, -- The internal reference (e.g., 'guest-otp')
    name VARCHAR(255) NOT NULL, -- Human-readable name (e.g., 'Guest OTP Verification')
    subject_line VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'General', -- Grouping (Authentication, Booking, etc.)
    required_variables JSONB NOT NULL DEFAULT '[]', -- Array of required keys that MUST be present to save
    optional_variables JSONB NOT NULL DEFAULT '[]', -- Array of optional keys
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id) -- Track who last modified it
);

-- Note: We define 'Global Variables' implicitly in the app logic (e.g., {{clinicName}}, {{supportEmail}}),
-- while 'Unique Variables' are defined per template in 'required_variables' and 'optional_variables'.
-- 
-- STATUS: DEPLOYED in FINAL-COMPLETE-SCHEMA.sql
```

## 3. Backend Implementation (Node.js/Express)

### 3.1. API Endpoints (`apps/api/src/routes/email-templates.routes.js`) [DONE]
- `GET /api/v1/email-templates`: Fetch all templates.
- `GET /api/v1/email-templates/:key`: Fetch specific template + metadata.
- `PUT /api/v1/email-templates/:key`: Update content/subject with validation.
- `POST /api/v1/email-templates/:key/restore`: Reset to factory default.

### 3.2. Service Refactoring [DONE]
- [x] **Retrieve:** DB-first lookup.
- [x] **Fallback:** Local FS reading if DB is empty.
- [x] **Global Injection:** {{clinicName}} automatically available.
- [x] **Parsing:** Precise replacement of `{{var}}` tags.

## 4. Frontend Implementation (React/Tailwind)

### 4.1. Routing

Add the new route in the Admin's `App.jsx` or router configuration:
`<Route path="/email-templates" element={<EmailTemplatesPage />} />`

### 4.2. UI Architecture (`apps/admin/src/pages/EmailTemplates/`)

- **`EmailTemplatesPage.jsx`**: The main container.
    - **Layout:** Two-column layout if editing, or a list view that transitions into the editor. We
      will use a List on the left and Editor on the right, or a full-page editor when a template is
      selected.

- **`TemplateSelector.jsx`**: A sidebar or dropdown categorizing available templates (e.g.,
  Category: Registration -> Template: OTP Code).

- **`TemplateEditorPane.jsx`**:
    - Code editor using a lightweight library like `react-simple-code-editor` or Monaco (if already
      installed) for HTML syntax highlighting.
    - Inputs for "Subject Line".
    - A "Save" button and a "Restore Default" button.

- **`VariablePanel.jsx`**:
    - Displays Global Variables (always accessible): `{{clinicName}}`, `{{clinicPhone}}`, etc.
    - Displays Unique Variables based on selected template (e.g., `{{name}}`, `{{otpCode}}`).
    - Interactive: Clicking a variable tag copies it or injects it into the editor cursor position.

- **`LivePreviewPane.jsx`**:
    - Takes the current `html_content` from state.
    - Maps dummy data (e.g., `{ name: "John Doe", otpCode: "123456" }`) to the text.
    - Injects the parsed HTML into a sandboxed `<iframe>` via `srcDoc`. This ensures Admin dashboard
      styles don't leak into the email preview.

## 5. Security & Safety Flow

1.  **Variable Guard:** When hitting the `PUT` endpoint to save, the backend parses the
    `html_content` and ensures all instances listed in the DB's `required_variables` JSON array
    exist. If `{{otpCode}}` is deleted by mistake, the backend responds with a `400 Bad Request` and
    an error message.
2.  **Versioning/Audit:** Any update to a template logs an entry in the existing `audit_log` table
    (e.g., "Actor X modified Template Y").
3.  **Graceful Degradation:** If the SQL query fails during an actual patient operation, the system
    inherently falls back to reading the hardcoded `fs.readFileSync` file.
