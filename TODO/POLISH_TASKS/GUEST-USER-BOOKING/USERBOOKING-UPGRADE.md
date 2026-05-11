# User Booking Upgrade Plan based on Guest Booking Baseline

## Component Structure Comparison

**Guest Booking Components (DO NOT MODIFY - BASELINE):**

- `GuestBookingWizard.jsx`
- `ServiceStep.jsx`
- `DateTimeStep.jsx`
- `InfoStep.jsx`
- `OTPStep.jsx` (Unique to guest)
- `ConfirmStep.jsx`
- `GuestBookingSuccess.jsx`
- Auxiliary components: `StepIndicator.jsx`, `SpecializedServiceModal.jsx`

**User Booking Components (TO BE UPGRADED):**

- `UserBookingWizard.jsx`
- `DateTimeStep.jsx`
- `UserOtherInfoStep.jsx` (Needs to handle 'Dependency' booking)
- `UserReviewStep.jsx` / `UserConfirmStep.jsx`
- `UserBookingSuccess.jsx`
- Auxiliary components: `BookingExitModal.jsx`, `DentistSelectionPanel.jsx`
- _To Be Removed:_ `JoinWaitlistModal.jsx`, `WaitlistCard.jsx`, `WaitlistOnlyWarningModal.jsx`
  (Waitlist feature is being deprecated for user booking).

## Upgrade Plan (Crucial: Do NOT break current Guest Booking flow)

1. **[DOING] Unify Service Selection**: Implement a `UserServiceStep` in User Booking matching the
   layout and logic from Guest Booking (using cards, layout, etc.). The current user flow seems to
   skip or handle this differently.
2. **[TODO] Standardize Date & Time Step**: Ensure `DateTimeStep.jsx` in the User Booking flow looks
   and feels exactly like `DateTimeStep.jsx` in the Guest Booking flow.
3. **[TODO] Consolidate Information Step & Add Dependents**: Transform `UserOtherInfoStep.jsx` to
   visually match `InfoStep.jsx` from the guest side. Securely pre-fill known user details (name,
   email, phone) without OTP. **Crucially, integrate the internal "Dependency" feature here**,
   allowing users to book for themselves or their dependents, which is unique to user booking.
4. **[TODO] Summary & Confirmation**: Align the UI in User’s final steps
   (`UserReviewStep`/`UserConfirmStep`) to match `ConfirmStep.jsx` from the guest side. Incorporate
   uniform payment options or summary cards if present in the guest flow.
5. **[TODO] Success Page Alignment**: Update `UserBookingSuccess.jsx` to share similar layout and
   styling patterns found in `GuestBookingSuccess.jsx`.
6. **[TODO] Step Indicator Styling**: Adapt and integrate `StepIndicator.jsx` across both flows so
   the progress visual experience is consistent.
7. **[DONE] Cleanup Deprecated Features**: Safely remove all waitlist-related logic and components
   from the user booking process.

## Essential Core Functionalities to Migrate from Guest Booking

To achieve structural parity with the Guest Booking experience, the User Booking must adopt these
fundamental system behaviors found in the baseline (`GuestBookingWizard.jsx`):

- **[DONE] Session Recovery Handling**: Re-implement `useEffect` hooks for robust auto-scrolling,
  session recovery intercepts (`slotHold.checkActiveHold()`), state maintenance upon accidental
  browser reload, and the "Continue Booking?" modal loop if a session matches an existing temporary
  hold.
- **[DONE] Slot Hold Expiry Enforcement**: Integrate warning popups (e.g., "Your slot hold expires
  in 2 minutes") and auto-reset mechanisms kicking users back to the scheduling selection
  (`DateTimeStep`) if the backend confirms the slot hold has structurally expired. Ensure deep
  clearing out (`slotHold.clearHold()`) when expiration kicks in.
- **[DONE] Exit Intent Interception**: Match the `window.addEventListener('beforeunload', ...)` and
  `BookingExitModal` features accurately. Closing the tab must properly manage backend hold
  releases.
- **[DONE] Responsive UI Consistency (Mobile & Web)**: Guarantee that all popup alerts, modals,
  timers, and warnings precisely reuse the responsive Tailwind (`sm:`, etc.) classes, font styles,
  sizes, and layout placements as the baseline. For example, mobile bottom-sheet modals vs centered
  desktop modals must behave identically with exact typography matching the guest flow.

## Known Gaps & Differences to Address

- **Dependency Booking (Unique to User Booking)**: Users can book appointments for themselves or
  their dependents. UI for selecting the patient (user vs. dependent) needs to fit organically into
  the new stylized steps (likely in the Info Step) without breaking the baseline guest design.
- **Waitlist Decommission**: Waitlist functionality is no longer needed in the user booking flow.
  All waitlist components and logical checks should be entirely stripped out.
- **No OTP Step for User Booking**: Expected since users are authenticated. The transition between
  steps needs to reflect this smoothly without breaking the flow.
- **Dentist Selection Styling**: User booking has a `DentistSelectionPanel`. If Guest has a specific
  way of handling specialized services/dentists (e.g., `SpecializedServiceModal`), those design
  patterns should be applied consistently.
- **STRICT RULE - SEPARATE FILES**: The guest booking code and functionality strictly serve as the
  read-only template and baseline. Absolutely no breaking changes should be made to
  `GuestBookingWizard` or its related unique components. If a component is shared but needs to
  change for the user flow in a way that risks breaking the guest flow, **duplicate the component
  into the `user-booking` folder (e.g. `UserServiceStep.jsx`, `UserStepIndicator.jsx`) instead of
  altering the guest version**. This ensures zero regression in the guest booking implementation
  while safely upgrading the user booking.
