# Doctor Schedule Tab: Polish & Hardening Task List

## 1. UI/UX & Loading States
- [ ] **Skeleton Loaders**: Replace full-screen loading backdrops in `DoctorScheduleDetail` with inline skeletons for the Weekly Routine grid and the Timeline view.
- [ ] **Optimistic UI Updates**: Implement optimistic state updates for blocking/unblocking to make the interface feel instant.
- [ ] **Empty States**: Create a premium empty state illustration/message for the `WeeklyTimeline` when no events are present.
- [ ] **Smooth Transitions**: Add `framer-motion` or CSS transitions for modal appearance and list filtering.
- [ ] **Selection Highlighting**: Add a "dirty" state indicator (e.g., a subtle border glow) to the Weekly Routine days that have unsaved changes.

## 2. Resilience & Validation
- [ ] **State Reset Hardening**: Ensure all draft states (`draftBlockedDates`, `draftBlockedSlots`) are explicitly cleared on modal `onClose`.
- [ ] **Form Validation**:
    - [ ] Disable "Apply Changes" if "Other" reason is selected but the textarea is empty.
    - [ ] Add character limits to "Notes" and "Other Reason" fields.
- [ ] **Error Boundary**: Wrap the Timeline in an Error Boundary to prevent a single mapping error from crashing the entire Schedule tab.

## 3. Data Integrity & Logging
- [ ] **Comprehensive Audit Logs**:
    - [ ] Log `ROUTINE_SCHEDULE_UPDATE` with old/new values.
    - [ ] Log `SINGLE_BLOCK_CREATED` vs `BULK_BLOCK_CREATED`.
    - [ ] Log `BLOCK_REMOVED`.
- [ ] **Conflict Aggregation Logic**: Double-check that `SYSTEM_DISPLACED` status updates include an entry in the appointment's `history` or `comments` for tracking.

## 4. Notifications & Alerts
- [ ] **Global Action Feedback**: Ensure all actions (Save, Delete, Force Displace) have distinct, clear toast messages.
- [ ] **Admin Warnings**: Show a persistent warning banner if the doctor currently has *no* routine schedule set up (preventing accidental full-closure).

## 5. Mobile Optimization
- [ ] **Touch Targets**: Ensure the slot-gap selection and pill toggles are easily tappable on mobile devices.
- [ ] **Horizontal Scroll**: Optimize the `WeeklyTimeline` for horizontal swiping on small screens.
