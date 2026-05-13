# 🚀 User Portal: Final Polish Roadmap

This document serves as the authoritative tracking for the User Portal's high-fidelity refinements. It ensures parity with the Administrative Registry and booking wizard design languages.

---

## ✅ Phase 1: Appointment Lifecycle & Safety (COMPLETED)

### 1.1 Status-Aware Action Governance
- [x] **Contextual Visibility**: Actions are now strictly governed by the appointment status.
    - **Pending (Requests)**: Only `Cancel Request` is available. `Reschedule` is disabled to prevent pre-approval conflicts.
    - **Approved (Appointments)**: Full suite of management actions (`Cancel Appointment`, `Reschedule`) is active.
    - **Historical/Terminal**: All actions are removed; state is locked to read-only for data integrity.
- [x] **Smart Navigation**: Detail page breadcrumbs now intelligently route users back to either `My Requests` or `My Appointments` based on the item's current state.

### 1.2 High-Fidelity Cancellation Workflow
- [x] **Mobile-Native Ergonomics**: Refactored the cancellation modal to use the `isBottomSheet` pattern, ensuring a seamless experience on handheld devices.
- [x] **Structured Feedback**:
    - [x] Mandatory **Reason Dropdown** for common cancellation scenarios.
    - [x] Dynamic **"Other" Context**: Selection of "Other" reveals a custom text input for granular feedback.
- [x] **UX Safety Layer**: Integrated warning typography and specialized iconography (`AlertCircle`) to prevent accidental cancellations.

---

## 🕒 Phase 2: Visual Density & Registry Alignment (IN PROGRESS)

### 2.1 Registry Card Refinement
- [x] **Symmetrical Triple-Column Layout**: Implemented the `Schedule` | `Content` | `Status & Action` desktop layout.
- [x] **Mobile Optimization**: Removed the left sidebar on small screens, integrating time/date metadata directly into the content block.
- [ ] **Density Audit**: Review font-size scaling and vertical padding across different viewport sizes to ensure a "thin" yet readable registry aesthetic.

### 2.2 Appointment Detail Page Aesthetics
- [ ] **Section Symmetery**: Align the "Overview", "Status", and "Notes" sections with the new Registry design language.
- [ ] **Dark Mode Audit**: Ensure high-contrast parity for all new components (badges, modals, and input fields) in dark mode.

---

## 🛠️ Global Component Standards

| Feature | Standard Pattern |
| :--- | :--- |
| **Modals** | Always use `Modal` component with `isBottomSheet={true}` for mobile. |
| **Typography** | Strict Title Case (No forced All-Caps). |
| **Actions** | Primary actions in the right-most container of the Registry/Footer. |
| **Spacing** | High-density padding (`py-2.5` to `py-3`) for registry rows. |