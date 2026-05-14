# User Portal In-App Notifications

This document tracks all in-app notifications sent to patients. These notifications appear in the notification bell/drawer within the User Portal.

## Formatting Standards
*   **Dates**: `Month Day, Year` (e.g., `May 20, 2026`)
*   **Times**: `Start Time – End Time` (e.g., `10:00 AM – 11:00 AM`)
*   **Patient Name**: Always include the patient name (User or Dependent) to ensure clarity for families managing multiple profiles.

---

## 1. Booking & Approval Flow

### Request Received
*   **Trigger**: Patient submits a new appointment request.
*   **Title**: `Request Received & Under Review`
*   **Message**: `We have received your request for a {service} appointment for {patient_name} on {date} at {time_range}. Our team is currently reviewing the schedule to ensure a dentist is available. We will notify you as soon as your appointment is officially confirmed.`

### Appointment Approved
*   **Trigger**: Staff approves a pending appointment request.
*   **Title**: `Appointment Approved!`
*   **Message**: `Good news! Your {service} appointment for {patient_name} on {date} at {time_range} has been approved. We look forward to seeing you at the clinic!`

### Appointment Declined
*   **Trigger**: Staff rejects a pending appointment request.
*   **Title**: `Appointment Declined`
*   **Message**: `Your request for a {service} appointment for {patient_name} on {date} at {time_range} was declined. Reason: {reason}. If you have questions, please contact our clinic.`

### Appointment Confirmed
*   **Trigger**: Appointment is officially confirmed.
*   **Title**: `Appointment Confirmed!`
*   **Message**: `The {service} appointment for {patient_name} has been confirmed for {date} from {time_range}.`

---

## 2. Schedule Changes & Reminders

### Appointment Rescheduled
*   **Trigger**: Appointment timing or date is changed.
*   **Title**: `Appointment Rescheduled`
*   **Message**: `The {service} appointment for {patient_name} has been rescheduled. It was moved from {old_date} ({old_time_range}) to {new_date} ({new_time_range}).`

### Appointment Reminder
*   **Trigger**: Sent 24h or 48h before the visit.
*   **Title**: `Reminder: Upcoming Appointment`
*   **Message**: `Don't forget! {patient_name} has a {service} appointment scheduled for {date} at {time_range}. Please arrive 15 minutes early.`

### 48h Confirmation Request
*   **Trigger**: Sent 48 hours before the appointment.
*   **Title**: `Please Confirm Your Attendance`
*   **Message**: `This is a reminder for {patient_name}'s {service} appointment on {date} from {time_range}. Please confirm your attendance through the portal or contact us if you need to reschedule.`

### Appointment Delayed
*   **Trigger**: Staff notifies patients of a delay.
*   **Title**: `Appointment Delay Alert`
*   **Message**: `Dr. {dentist_name} is currently running approximately {minutes} minutes behind schedule. The {service} appointment for {patient_name}, originally scheduled for {original_time}, may start late. We apologize for the inconvenience.`

---

## 3. Waitlist & Availability

### Waitlist Offer
*   **Trigger**: A slot matching waitlist criteria opens up.
*   **Title**: `Priority Slot Available!`
*   **Message**: `A slot has opened up on {date} from {time_range} for {service}. As you are on our waitlist, we are offering this to you first! You have {timeout} minutes to claim this slot for {patient_name} before it is offered to the next person.`

---

## 4. Lifecycle & Post-Visit

### Appointment Cancelled
*   **Trigger**: Appointment is cancelled.
*   **Title**: `Appointment Cancelled`
*   **Message**: `The {service} appointment for {patient_name} on {date} at {time_range} has been cancelled. If this was not intentional, please contact the clinic immediately.`

### Missed Appointment (No-Show)
*   **Trigger**: Patient is marked as No-Show.
*   **Title**: `Missed Appointment Notice`
*   **Message**: `{patient_name} was unable to attend the {service} appointment on {date} at {time_range}. We missed you! You can reschedule your visit through the dashboard or by calling us.`

### Follow-Up Visit Recommended
*   **Trigger**: Dentist recommends a follow-up.
*   **Title**: `Recommended Follow-Up`
*   **Message**: `Following your recent visit, Dr. {dentist_name} has recommended a follow-up {service} appointment for {patient_name} around {recommended_date}. Reason: {reason}. You can book this through your portal at your convenience.`

---

## 5. Account & Restrictions

### Booking Restrictions Applied
*   **Trigger**: Patient exceeds no-show limits.
*   **Title**: `Account Booking Restricted`
*   **Message**: `Due to {count} missed appointments for {patient_name}, your booking privileges have been restricted. For future visits, you can only book up to {max_days} days in advance, and a security deposit may be required. Please contact our front desk to resolve this.`
