# User Reschedule Modernization & UI Polish

## Overview
Standardize the Appointment Reschedule workflow and Appointment Details UI to achieve mobile-responsive parity with the high-fidelity booking portal. This plan focuses on downsizing oversized elements, improving layout alignment, and ensuring functional robustness for the reschedule process.

## 🛠 UI Refinements (Appointment Details)

### 1. Doctor Overview Downsizing
- **Objective**: Reduce the scale of the doctor icon and name to match the timeline's aesthetic.
- **Changes**:
    - Reduce doctor icon size from `w-14` to `w-11` (sm:w-11).
    - Update "Assigned Doctor" header to use the subtle uppercase tracking pattern.
    - Standardize name font size to `text-[14px]` (mobile) and `text-base` (desktop).
    - Adjust specialization and bio fonts to match timeline descriptive text (`text-[12px]`).

### 2. Logistics & Headers
- **Objective**: Ensure all headers and box values feel balanced on small screens.
- **Changes**:
    - Update "Appointment Overview" header to match the doctor overview style.
    - Reduce logistics box value font size from `text-[17px]` to `text-[15px]`.

### 3. Action Buttons & Alignment
- **Objective**: Align Cancel/Reschedule buttons to the right side of the container on web.
- **Changes**:
    - Update `AppointmentDetailFooter` to use `justify-end` on desktop.
    - Ensure buttons use responsive font sizes (`text-[10px]` on mobile, `text-sm` on desktop) to prevent layout breaking.

### 4. Timeline Responsiveness
- **Objective**: Eliminate the "fixed size" feel of the timeline.
- **Changes**:
    - Refine the connector line logic to be more dynamic.
    - Ensure step labels and descriptions follow the `14px`/`12px` scale consistently.

---

## ⚙️ Functional Polish (Reschedule Wizard)

### 1. Slot Hold Integration
- **Objective**: Prevent double-booking during rescheduling.
- **Changes**:
    - Integrate the **Slot Hold Indicator** (Timer + Progress Bar) into the `UserRescheduleWizard` header.
    - Replicate the expiry logic and modal from the `UserBookingWizard`.

### 2. Step Labeling
- **Objective**: Provide clear context for the reschedule-specific flow.
- **Changes**:
    - Pass `nextLabel="Continue to Review"` to the `DateTimeStep` to replace the default booking label.

### 3. Backend Status Consistency
- **Objective**: Ensure proper state transitions as per the latest requirements.
- **Status Rules**:
    - All services remain `PENDING` after reschedule (requires admin approval).
    - Original appointment is marked as `RESCHEDULED`.
    - Rescheduling is enabled for both `CONFIRMED` and `PENDING` appointments.

---

## 🚫 Safe-Guard Directive
- **Zero Impact on Booking Wizards**: All changes to shared components (like `DateTimeStep`) must be via props (`nextLabel`) or non-breaking CSS to ensure `UserBookingWizard` and `GuestBookingWizard` remain fully functional.
