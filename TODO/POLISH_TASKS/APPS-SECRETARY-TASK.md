# 🏥 Secretary App: Premium Polish & Implementation Roadmap

> [!IMPORTANT]
> **Core Objective**: Standardize the Secretary application to match the high-density, glassmorphic design language of the Admin Portal while enhancing administrative auditability.

---

## 📋 General & Global Improvements
- [ ] **Internal Log System**: Implement a persistent audit trail for appointment modifications.
  - *Context*: Allows logging specific reasons like "Patient agreed to move to Dr. Reyes because Dr. Smith resigned."
- [ ] **Patient Registry Parity**: Synchronize the Patients Page design and functionality with the Admin Portal standards.

## 🗄️ Front Desk & Booking
- [ ] **Quick Action Suite**: Add a high-visibility "Quick View" (Eye icon) to all appointment action bars.
- [ ] **Booking Desk Overhaul**: Polish the layout for rapid patient intake and one-handed mobile usability.

## 📅 Appointments & Workflow
- [ ] **Row Standardization**: Implement a unified container design for appointment rows across all pages.
- [ ] **Filter Engine**: Standardize the filtering logic (Service, Doctor, Status) for consistent behavior.
- [ ] **Navigation Refinement**: Rename "Calendar Sidebar" to "Doctor's Schedule" for clinical clarity.

## 👨‍⚕️ Doctor Management (Registry)
- [ ] **Specialization Engine**: Add a "General" vs "Specialized" toggle/filter to the Doctor Page.
- [ ] **Card High-Fidelity Design**: Redesign Doctor Cards and Detail Views with premium glassmorphism and subtle micro-animations.
- [ ] **UI Polish**: Refine the "Close" button container and page entry/exit transitions for the Detail view.

## ⚖️ Approval Workflow
- [ ] **Inbox Card UX**: Improve the visual hierarchy of pending request cards to highlight urgency.
- [ ] **Detail Insight**: Enhance the Approval Detail view with richer scheduling conflict visualizations.

---

## 🛠️ Technical Debt & Standardization
- [ ] Ensure all components use the unified design tokens in `index.css`.
- [ ] Implement optimistic UI updates for internal notes to ensure zero-latency feedback.
