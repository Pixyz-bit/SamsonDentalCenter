1. The Onboarding Gatekeeper (Pre-Reg Block) This phase ensures that once an email is in the system,
   it is "locked" to a specific patient identity.

The Clinic Entry: When a patient provides an email at the front desk, the system creates a "Reserved
Profile." This holds all clinical data but has no login access yet.

The Signup Restriction:

The public "Sign Up" page performs a real-time check.

If the email matches a Reserved Profile, the "Create Account" button is disabled.

The Redirection Logic:

Instead of a new account, the user sees: "Your records are already in our system. Please check your
email to activate your portal."

The Verification/Recovery Loop:

If the original invitation is expired (over 24h), the user simply uses the "Forgot Password" or
"Resend Activation" link on the site.

By clicking the link in their actual inbox, they prove ownership, set a password, and "claim" the
pre-registered records.

2. The Shared-Email & Dependency Rule This handles the common situation where families share a
   single email address without creating duplicate logins.

In-Clinic Detection: If a Secretary tries to add an email (e.g., for a child) that is already used
by a Parent, the system flags it immediately.

The "No-Email" Placeholder: The Secretary is not allowed to create a second independent account with
that same email. Instead, they proceed with the registration without an email.

The Direct Link: The Secretary then opens the Primary Account's profile (the Parent) and adds the
new patient as a "Dependent."

The Online Result: When the Parent logs in, they see the dependent’s profile inside their own
portal. No separate login is ever created for the dependent.

3. The Cleanup Engine (Admin Merge Tool) This handles "Clean Slate" accounts—where a patient signed
   up online with a new email but has an old, email-less stub at the clinic.

Detection: The system flags "Potential Duplicates" based on Names, Birthdays, or Phone Numbers.

The Secretary’s Interface: The Secretary selects the Old Stub (Source) and the New Account
(Destination).

Conflict Resolution: The Secretary picks the correct data (Phone, Address) to keep.

The Migration: The system re-links all past Appointments, Treatment Notes, and Invoices to the New
Account.

The "Convert to Dependent" Option: If the Secretary realizes the "duplicate" is actually a family
member, the tool allows them to simply attach that record as a Dependent to the primary account
instead of a full merge.

4. The Security & Privacy Plan The "Identity Secret" Barrier: You can require a one-time entry of
   the Date of Birth before the clinical history is unblurred for a newly activated account.

The Audit Log: Every merge or dependency link is logged with the Secretary’s name and a timestamp
for accountability.

Final Summary of the "Samson Dental" Strategy One Email = One Account: Prevent multiple independent
accounts from sharing an email.

Claim, Don't Create: Pre-registered patients "claim" their existing record via email verification
rather than signing up from scratch.

Dependency First: If an email is already "taken," the second person must be added as a dependent
under the primary owner.

Manual Cleanup: Use the Merge Tool to connect old offline history to new online accounts during
physical clinic visits.
