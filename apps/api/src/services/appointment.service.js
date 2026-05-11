import { supabaseAdmin } from '../config/supabase.js';
import { assignDentist } from './dentist-assignment.service.js';
import { getAvailableSlots, getSuggestedSlots } from './slot.service.js';
import {
    sendBookingSuccessEmail,
    sendBookingRequestReceivedEmail,
    sendCancellationEmail,
    sendRescheduleEmail,
} from './email-confirmation.service.js';
import {
    APPOINTMENT_STATUS,
    SERVICE_TIER,
    APPROVAL_STATUS,
    APPOINTMENT_SOURCE,
    CLINIC_CONFIG,
} from '../utils/constants.js';
import {
    sendRequestReceived,
    sendCancellationNotice,
} from './notification.service.js';
import { getTodayPH } from '../utils/timezone.js';
import { addMinutesToTime } from '../utils/time.js';
import { AppError } from '../utils/errors.js';
import { markHoldAsConvertedBySession } from './slot-hold.service.js';

/**
 * Book an appointment for a guest (no user account).
 * Status starts as PENDING — guest must confirm via email link.
 *
 * @param {string} serviceId - The service UUID
 * @param {string} date - Appointment date 'YYYY-MM-DD'
 * @param {string} time - Appointment time 'HH:MM'
 * @param {string} guestEmail - Guest email address
 * @param {string} guestPhone - Guest phone number
 * @param {string} guestName - Guest full name
 * @returns {object} Appointment details or alternatives
 */
export const bookAppointmentGuest = async (
    serviceId,
    date,
    time,
    guestEmail,
    guestPhone,
    guestNameParts, // { first, last, middle, suffix }
    userSessionId = null,
    rescheduleCount = 0,
    notes = null,
    birthday = null, // ✅ Added birthday parameter
    acceptedTerms = false,
    termsAcceptedAt = null
) => {
    const { first, last, middle, suffix } = guestNameParts;
    const guestName = `${last}, ${first} ${middle || ''} ${suffix || ''}`.replace(/\s+/g, ' ').trim();

    // Normalize guest email
    const normalizedEmail = guestEmail?.trim().toLowerCase();

    // ── 0. Validate date is in the future (using Philippine Time) ──
    const todayPH = getTodayPH();
    if (date < todayPH) {
        throw new AppError('Cannot book appointments in the past.', 400);
    }

    // ── 1. Get service duration (and check if it exists before proceeding!) ──
    const { data: service, error: serviceError } = await supabaseAdmin
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

    if (serviceError || !service) {
        throw new AppError('Service not found.', 404);
    }

    // ── 1b. GUEST BOOKING RESTRICTION: Only General services allowed ──
    if (service.tier === SERVICE_TIER.SPECIALIZED) {
        const error = new AppError('Specialized services require an account to book. Please sign up or log in.', 403);
        error.requires_account = true;
        throw error;
    }

    // Calculate endTime ONCE here to avoid calling the function multiple times
    const endTime = addMinutesToTime(time, service.duration_minutes);

    // ── 2. Check availability ──
    const availability = await getAvailableSlots(date, serviceId, userSessionId);
    const slotData = availability.all_slots.find((s) => s.time === time);
    const isAvailable = slotData && slotData.available > 0;

    if (!isAvailable) {
        const suggestions = await getSuggestedSlots(date, serviceId, time);
        return {
            booked: false,
            message: `Slot not available.`,
            can_join_waitlist: true,
            ...suggestions,
        };
    }

    // ── 3. Assign dentist ──
    // ✅ NEW: Try to use the dentist from the hold first
    let finalDentistId = null;
    if (userSessionId) {
        const { data: hold } = await supabaseAdmin
            .from('slot_holds')
            .select('dentist_id')
            .eq('user_session_id', userSessionId)
            .eq('appointment_date', date)
            .eq('start_time', time)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .single();

        if (hold?.dentist_id) {
            finalDentistId = hold.dentist_id;
            console.log(`Using held dentist ${finalDentistId} for session ${userSessionId}`);
        }
    }

    if (!finalDentistId) {
        finalDentistId = await assignDentist(date, time, endTime);
    }

    if (!finalDentistId) {
        throw new AppError('No dentist available for this slot.', 409);
    }

    // ── 4. Create appointment as PENDING (not confirmed yet!) ──
    const { data: appointment, error: insertError } = await supabaseAdmin
        .from('appointments')
        .insert({
            patient_id: null, // Guests have no account
            guest_email: normalizedEmail,
            guest_phone: guestPhone,
            guest_name: guestName,
            guest_first_name: first,
            guest_last_name: last,
            guest_middle_name: middle,
            guest_suffix: suffix,
            guest_birthday: birthday, // ✅ Save guest birthday
            dentist_id: finalDentistId,
            service_id: serviceId,
            appointment_date: date,
            start_time: time,
            end_time: endTime,
            status: APPOINTMENT_STATUS.PENDING,
            approval_status: APPROVAL_STATUS.PENDING,
            patient_confirmed: true, // Already verified via OTP
            confirmed_at: new Date().toISOString(),
            source: APPOINTMENT_SOURCE.GUEST_BOOKING,
            reschedule_count: rescheduleCount,
            notes: notes, // ✅ Save patient note
            accepted_terms: acceptedTerms,
            terms_accepted_at: termsAcceptedAt
        })
        .select(`
            *,
            service:services(name, price),
            dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))
        `)
        .single();

    if (insertError) {
        console.error('Insert Error:', insertError);
        // This catches the unique index violation (double booking)
        if (insertError.code === '23505') {
            throw new AppError('This slot was just taken. Please try another time.', 409);
        }
        throw new AppError(insertError.message, 500);
    }

    // ── 5. Email verified via OTP already, so we can send the SUCCESS email immediately
    // Note: We still stay PENDING for admin approval.
    await sendBookingRequestReceivedEmail(guestEmail, guestName, {
        date: appointment.appointment_date,
        start_time: appointment.start_time,
        service: service.name,
    });

    // ── 6. Cleanup: Mark the slot hold as converted if a session exists ──
    if (userSessionId) {
        await markHoldAsConvertedBySession(userSessionId).catch(err =>
            console.error(`[Hold Cleanup] Failed to convert hold for session ${userSessionId}:`, err.message)
        );
    }

    return {
        booked: true,
        status: 'PENDING',
        message: 'Appointment reserved! Since your email is verified, we have sent your request to our team for approval.',
        appointment: {
            id: appointment.id,
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            service: appointment.service?.name,
            dentist: appointment.dentist?.profile?.first_name ? `${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name}` : (appointment.dentist?.profile?.full_name || 'Assigned'),
            source: appointment.source, // ✅ NEW: Include source in response
        },
    };
};

/**
 * Book an appointment for a patient (authenticated user).
 *
 * TWO-TIER LOGIC:
 * - General services  → Auto-assign dentist → Status: CONFIRMED (instant)
 * - Specialized services → No dentist yet → Status: PENDING + approval_status: 'pending'
 *
 * @param {string} patientId - The patient's profile UUID
 * @param {string} serviceId - The service UUID
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} time - 'HH:MM'
 * @param {boolean} sendEmail - Whether to send confirmation email (default true)
 * @param {string|null} bookedForName - Name of the person being booked for. NULL = self.
 * @returns {object} Appointment details or alternatives
 */
export const bookAppointment = async (
    patientId,
    serviceId,
    date,
    time,
    sendEmail = true,
    bookedForNameParts = null, // { first, last, middle, suffix } OR legacy string
    source = APPOINTMENT_SOURCE.USER_BOOKING,
    userSessionId = null,
    preferredDentistId = null,
    rescheduleCount = 0,
    isPreferred = null,
    patientProfileId = null, // ✅ NEW: Link to a saved patient profile
    bookedForBirthday = null,
    bookedForRelationship = null,
    notes = null, // ✅ Added notes parameter
    patientSex = null, // ✅ NEW: Snapshot patient sex
    acceptedTerms = false, // ✅ NEW: Compliance tracking
    termsAcceptedAt = null, // ✅ NEW: Compliance tracking
) => {
    console.log('📦 [SERVICE-DUMP] Arguments received:', {
        patientId, serviceId, date, time, sendEmail,
        bookedForNameParts, source, userSessionId,
        preferredDentistId, rescheduleCount, isPreferred,
        patientProfileId, bookedForBirthday, bookedForRelationship,
        notes, patientSex, acceptedTerms, termsAcceptedAt
    });
    const finalIsPreferred = isPreferred !== null ? isPreferred : !!preferredDentistId;
    let bookedForName = null;
    let firstName = null;
    let lastName = null;
    let middleName = null;
    let suffix = null;
    let finalBookedForBirthday = null;
    let finalBookedForRelationship = null;

    let finalPatientSex = null;
    const normalizeSex = (s) => {
        if (!s || typeof s !== 'string') return null;
        const normalized = s.trim().toUpperCase();
        if (normalized === 'M' || normalized === 'MALE') return 'Male';
        if (normalized === 'F' || normalized === 'FEMALE') return 'Female';
        return null;
    };

    if (patientProfileId) {
        // ── A. Fetch from saved patient profile (Late-Binding Stub) ──
        const { data: pProfile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', patientProfileId)
            .eq('primary_profile_id', patientId) // Ownership check
            .single();

        if (pProfile) {
            firstName = pProfile.first_name;
            lastName = pProfile.last_name;
            middleName = pProfile.middle_name;
            suffix = pProfile.suffix;
            finalBookedForBirthday = pProfile.date_of_birth;
            finalBookedForRelationship = pProfile.relationship_to_primary;
            finalPatientSex = pProfile.sex || finalPatientSex; // Use profile sex if available
            bookedForName = pProfile.full_name || `${lastName}, ${firstName} ${middleName || ''} ${suffix || ''}`.replace(/\s+/g, ' ').trim();
        }
    } else {
        finalBookedForBirthday = bookedForBirthday;
        finalBookedForRelationship = bookedForRelationship;
        finalPatientSex = normalizeSex(patientSex);

        if (bookedForNameParts && typeof bookedForNameParts === 'object') {
            firstName = bookedForNameParts.first;
            lastName = bookedForNameParts.last;
            middleName = bookedForNameParts.middle;
            suffix = bookedForNameParts.suffix;
            bookedForName = `${lastName}, ${firstName} ${middleName || ''} ${suffix || ''}`.replace(/\s+/g, ' ').trim();

            // Capture these if they weren't passed as separate args
            if (!finalBookedForBirthday) finalBookedForBirthday = bookedForNameParts.birthday || null;
            if (!finalBookedForRelationship) finalBookedForRelationship = bookedForNameParts.relationship || null;
            if (!finalPatientSex) finalPatientSex = normalizeSex(bookedForNameParts.sex) || null;
        } else if (typeof bookedForNameParts === 'string') {
            bookedForName = bookedForNameParts;
        }
    }

    // ✅ NEW: Handle dynamic profile creation for new dependents
    // If we have name parts but NO profile ID, it's a "New Family Member" flow
    if (!patientProfileId && firstName && lastName && source === APPOINTMENT_SOURCE.USER_BOOKING) {
        try {
            const trimmedFirst = firstName.trim();
            const trimmedLast = lastName.trim();

            const { data: existing } = await supabaseAdmin
                .from('profiles')
                .select('id, first_name, last_name, middle_name, suffix, date_of_birth, sex')
                .eq('primary_profile_id', patientId)
                .ilike('first_name', trimmedFirst)
                .ilike('last_name', trimmedLast)
                .maybeSingle();

            if (existing) {
                patientProfileId = existing.id;
                // Sync identity parts with the found profile to ensure appointment record is accurate
                firstName = existing.first_name;
                lastName = existing.last_name;
                middleName = existing.middle_name;
                suffix = existing.suffix;
                finalBookedForBirthday = existing.date_of_birth;
                finalPatientSex = existing.sex;
                console.log(`[Auto-Profile] Linked to existing profile ${patientProfileId} for ${bookedForName}`);
            } else {
                // Mandatory fields check for NEW profiles
                const missing = [];
                if (!firstName) missing.push('First Name');
                if (!lastName) missing.push('Last Name');
                if (!finalBookedForBirthday) missing.push('Birthday');
                if (!finalBookedForRelationship) missing.push('Relationship');
                if (!finalPatientSex) missing.push('Sex');

                if (missing.length === 0) {
                    // All required fields present, proceed with creation
                    const { data: newProfile, error: profileErr } = await supabaseAdmin
                        .from('profiles')
                        .insert({
                            primary_profile_id: patientId, // Linked to the account holder
                            first_name: firstName.trim(),
                            last_name: lastName.trim(),
                            middle_name: middleName ? middleName.trim() : null,
                            suffix: suffix ? suffix.trim() : null,
                            full_name: bookedForName,
                            date_of_birth: finalBookedForBirthday,
                            relationship_to_primary: finalBookedForRelationship,
                            sex: finalPatientSex,
                            role: 'patient',
                            is_registered: false // Stub profile for dependents
                        })
                        .select('id')
                        .single();

                    if (newProfile) {
                        patientProfileId = newProfile.id;
                        console.log('************************************************');
                        console.log('🚀 [PROFILE-FLOW] CREATED NEW PROFILE:', patientProfileId);
                        console.log('************************************************');
                    } else if (profileErr) {
                        console.error('[Auto-Profile] Insert failed:', profileErr.message);
                        throw new AppError(`Failed to create dependent profile: ${profileErr.message}`, 400);
                    }
                } else {
                    console.warn('[Auto-Profile] Skipping creation - missing mandatory fields:', missing);
                    throw new AppError(`To add a new family member, please provide: ${missing.join(', ')}.`, 400);
                }
            }
        } catch (profileErr) {
            // If it's already an AppError, just re-throw it so the user sees the clean message
            if (profileErr.statusCode) throw profileErr;

            console.error('[Auto-Profile] Sync failed:', profileErr.message);
            throw new AppError(`Profile synchronization failed: ${profileErr.message}`, 400);
        }
    }

    // ── 0. Check if patient is restricted (3+ no-shows or 3+ cancellations) ──
    const { data: patient } = await supabaseAdmin
            .from('profiles')
            .select(
                'email, full_name, first_name, last_name, middle_name, suffix, is_booking_restricted, max_advance_booking_days, deposit_required, no_show_count, cancellation_count',
            )
            .eq('id', patientId)
            .single();

        if (patient?.is_booking_restricted) {
            // Check if restriction has expired
            if (patient.restriction_until && new Date(patient.restriction_until) < new Date()) {
                // Auto-unlock: restriction period is over
                await supabaseAdmin
                    .from('profiles')
                    .update({ is_booking_restricted: false, restriction_reason: null })
                    .eq('id', patientId);
            } else {
                // Check max advance booking days (Sync with global clinic config)
                const maxDays = Math.max(patient.max_advance_booking_days || 0, CLINIC_CONFIG.NO_SHOW_RESTRICT_ADVANCE_DAYS);

                if (maxDays > 0) {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + maxDays);
                    if (new Date(date) > maxDate) {
                        throw new AppError(`Due to missed appointments, you can only book up to ${maxDays} days in advance.`, 403);
                    }
                }
            }
        }

        // ✅ NEW: Fallback for self-booking identity if parts weren't provided or are partial
        if (!bookedForNameParts && patient) {
            firstName = firstName || patient.first_name;
            lastName = lastName || patient.last_name;
            middleName = middleName || patient.middle_name;
            suffix = suffix || patient.suffix;
            finalBookedForBirthday = finalBookedForBirthday || patient.date_of_birth;
            finalBookedForRelationship = finalBookedForRelationship || 'Self';
            finalPatientSex = finalPatientSex || patient.sex; // Use patient sex for self
            bookedForName = bookedForName || patient.full_name;
        }

        // ── 1. Get service info (including TIER) ──
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (!service) {
            throw new AppError('Service not found.', 404);
        }

        const endTime = addMinutesToTime(time, service.duration_minutes);

        // ── 1.5. Check for Patient's Own Schedule Conflicts (LATER: Currently disabled for dev testing) ──
        // Prevent the same patient from booking overlapping slots with different doctors.
        /*
        const { data: conflicts } = await supabaseAdmin
            .from('appointments')
            .select('id, start_time, end_time, service:services(name)')
            .eq('patient_id', patientId)
            .eq('appointment_date', date)
            .not('status', 'in', '("CANCELLED","LATE_CANCEL","RESCHEDULED")')
            .lt('start_time', endTime)
            .gt('end_time', time)
            .limit(1);
    
        if (conflicts && conflicts.length > 0) {
            throw new AppError(`You already have a "${conflicts[0].service?.name}" appointment during this time range (${conflicts[0].start_time.slice(0,5)} - ${conflicts[0].end_time.slice(0,5)}). Please choose a different time.`, 409);
        }
        */

        const isSpecialized = service.tier === SERVICE_TIER.SPECIALIZED;

        // ═══════════════════════════════════════════════
        // 🔴 SPECIALIZED BRANCH — Requires admin approval
        // ═══════════════════════════════════════════════
        if (isSpecialized) {
            // Auto-assign a specialized dentist if no preference was given
            let finalDentistId = preferredDentistId;

            // ✅ NEW: Try to use the dentist from the hold first
            if (!finalDentistId && userSessionId) {
                const { data: hold } = await supabaseAdmin
                    .from('slot_holds')
                    .select('dentist_id')
                    .eq('user_session_id', userSessionId)
                    .eq('appointment_date', date)
                    .eq('start_time', time)
                    .eq('status', 'active')
                    .gt('expires_at', new Date().toISOString())
                    .single();

                if (hold?.dentist_id) {
                    finalDentistId = hold.dentist_id;
                    console.log(`[Specialized] Using held dentist ${finalDentistId} for session ${userSessionId}`);
                }
            }

            if (!finalDentistId) {
                finalDentistId = await assignDentist(date, time, endTime, SERVICE_TIER.SPECIALIZED, userSessionId);
            }

            if (!finalDentistId) {
                throw new AppError('No specialized dentist is available for this slot. Please select another time.', 409);
            }

            console.log('📝 [APPOINTMENT-FLOW] Specialized Branch Insert. patient_id:', patientProfileId || patientId);
            const { data: appointment, error } = await supabaseAdmin
                .from('appointments')
                .insert({
                    patient_id: patientProfileId || patientId, // ✅ Use dependent ID if provided
                    dentist_id: finalDentistId, // ✅ Auto-assigned or preferred
                    service_id: serviceId,
                    appointment_date: date,
                    start_time: time,
                    end_time: endTime,
                    status: APPOINTMENT_STATUS.PENDING,
                    service_tier: SERVICE_TIER.SPECIALIZED,
                    approval_status: APPROVAL_STATUS.PENDING,
                    source: source, // ✅ NEW: Track source
                    booked_for_name: bookedForName || null,
                    reschedule_count: rescheduleCount,
                    is_dentist_preferred: finalIsPreferred,
                    first_name: firstName,
                    last_name: lastName,
                    middle_name: middleName,
                    suffix: suffix,
                    // ✅ User is booking from their own account, auto-confirm their intent
                    patient_confirmed: true,
                    confirmed_at: new Date().toISOString(),
                    notes: notes, // ✅ Save patient note

                    // ✅ NEW: Identity Snapshot fields
                    patient_birthday: finalBookedForBirthday,
                    patient_sex: finalPatientSex,
                    patient_relationship: finalBookedForRelationship,
                    booked_by_user_id: patientId, // The primary user who is booking

                    // ✅ NEW: Compliance tracking
                    accepted_terms: acceptedTerms,
                    terms_accepted_at: termsAcceptedAt,
                })
                .select(
                    `
        *,
        service:services(name, duration_minutes, price)
      `,
                )
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new AppError('This slot was just taken. Please try another time.', 409);
                }
                throw new AppError(error.message, 500);
            }

            // ── 5. Send booking request receipt email to authenticated patient ──
            if (patient?.email && sendEmail) {
                const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
                await sendBookingRequestReceivedEmail(patient.email, patientDisplayName, {
                    date: appointment.appointment_date,
                    start_time: appointment.start_time,
                    service: appointment.service?.name,
                });
            }

            // ── 5.5 Cleanup: Mark the slot hold as converted if a session exists ──
            if (userSessionId) {
                await markHoldAsConvertedBySession(userSessionId).catch(err =>
                    console.error(`[Hold Cleanup] Failed to convert hold for session ${userSessionId}:`, err.message)
                );
            }

            // ── 6. In-app notification ──
            await sendRequestReceived(patientId, {
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                service: appointment.service?.name,
            });

            // TODO: Notify supervisor about new specialized request
            // await createNotification(supervisorUserId, 'NEW_REQUEST', ...)

            return {
                booked: true,
                status: 'PENDING',
                requires_approval: true,
                message:
                    'Your appointment request has been submitted! The clinic will review and confirm your schedule within 24 hours.',
                appointment: {
                    id: appointment.id,
                    date: appointment.appointment_date,
                    start_time: appointment.start_time,
                    end_time: appointment.end_time,
                    service: appointment.service?.name,
                    service_tier: 'specialized',
                    status: 'PENDING',
                    approval_status: 'pending',
                },
            };
        }

        // ═══════════════════════════════════════════════
        // 🟢 GENERAL BRANCH — Auto-accept (existing flow)
        // ═══════════════════════════════════════════════

        // ── 2. Check if the requested slot is available ──
        const availability = await getAvailableSlots(date, serviceId, userSessionId);
        const slotData = availability.all_slots.find((s) => s.time === time);
        const isAvailable = slotData && slotData.available > 0;

        if (!isAvailable) {
            // Slot NOT available → return alternatives
            const suggestions = await getSuggestedSlots(date, serviceId, time);
            return {
                booked: false,
                message: `The slot at ${time} on ${date} is not available.`,
                can_join_waitlist: true,
                ...suggestions,
            };
        }

        // ── 3. Auto-assign a dentist (tier-aware) ──
        // ✅ NEW: Try to use the dentist from the hold first
        let finalDentistId = preferredDentistId;

        if (!finalDentistId && userSessionId) {
            const { data: hold } = await supabaseAdmin
                .from('slot_holds')
                .select('dentist_id')
                .eq('user_session_id', userSessionId)
                .eq('appointment_date', date)
                .eq('start_time', time)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .single();

            if (hold?.dentist_id) {
                finalDentistId = hold.dentist_id;
                console.log(`Using held dentist ${finalDentistId} for session ${userSessionId}`);
            }
        }

        // If still no dentist, auto-assign
        if (!finalDentistId) {
            finalDentistId = await assignDentist(date, time, endTime, SERVICE_TIER.GENERAL, userSessionId);
        }

        if (!finalDentistId) {
            throw new AppError('No dentist available for this slot. This should not happen — please contact support.', 409);
        }

        console.log('📝 [APPOINTMENT-FLOW] General Branch Insert. patient_id:', patientProfileId || patientId);
        // ── 4. Create the appointment ──
        const { data: appointment, error } = await supabaseAdmin
            .from('appointments')
            .insert({
                patient_id: patientProfileId || patientId, // ✅ Use dependent ID if provided
                dentist_id: finalDentistId,
                service_id: serviceId,
                appointment_date: date,
                start_time: time,
                end_time: endTime,
                status: APPOINTMENT_STATUS.PENDING,
                service_tier: SERVICE_TIER.GENERAL,
                approval_status: APPROVAL_STATUS.PENDING,
                source: source, // ✅ NEW: Track source
                // NULL = booked for self, a name = booked for someone else
                booked_for_name: bookedForName || null,
                reschedule_count: rescheduleCount,
                is_dentist_preferred: finalIsPreferred,
                first_name: firstName,
                last_name: lastName,
                middle_name: middleName,
                suffix: suffix,
                // ✅ User is booking from their own account, auto-confirm their intent
                patient_confirmed: true,
                confirmed_at: new Date().toISOString(),
                notes: notes, // ✅ Save patient note

                // ✅ NEW: Identity Snapshot fields
                patient_birthday: finalBookedForBirthday,
                patient_sex: finalPatientSex,
                patient_relationship: finalBookedForRelationship,
                booked_by_user_id: patientId, // The primary user who is booking

                // ✅ NEW: Compliance tracking
                accepted_terms: acceptedTerms,
                terms_accepted_at: termsAcceptedAt,
            })
            .select(
                `
      *,
      service:services(name, duration_minutes, price),
      dentist:dentists(
        id,
        profile:profiles(full_name, first_name, last_name, middle_name, suffix)
      )
    `,
            )
            .single();

        if (error) {
            // This catches the unique index violation (double booking)
            if (error.code === '23505') {
                throw new AppError('This slot was just taken. Please try another time.', 409);
            }
            throw new AppError(error.message, 500);
        }

        if (patient?.email && sendEmail) {
            const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
            // 🚀 Non-critical: Don't block the response for email sending
            sendBookingRequestReceivedEmail(patient.email, patientDisplayName, {
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                service: appointment.service?.name,
            }).catch(err => console.error('[Email] Failed to send booking receipt:', err.message));
        }

        // ── 5.5 Cleanup: Mark the slot hold as converted if a session exists ──
        if (userSessionId) {
            await markHoldAsConvertedBySession(userSessionId).catch(err =>
                console.error(`[Hold Cleanup] Failed to convert hold for session ${userSessionId}:`, err.message)
            );
        }

        // ── 6. In-app notification ──
        // 🚀 Non-critical: Don't block the response
        await sendRequestReceived(patientId, {
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            service: appointment.service?.name,
        }).catch(err => console.error('[Notification] Failed to send request receipt:', err.message));

        return {
            booked: true,
            status: 'PENDING',
            requires_approval: true,
            message:
                'Your appointment request has been submitted! The clinic will review and confirm your schedule within 24 hours.',
            appointment: {
                id: appointment.id,
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                status: appointment.status,
                approval_status: appointment.approval_status,
                service: appointment.service?.name,
                service_tier: 'general',
                duration: appointment.service?.duration_minutes,
                price: appointment.service?.price,
                dentist: appointment.dentist?.profile?.first_name ? `Dr. ${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name}` : (appointment.dentist?.profile?.full_name || 'Assigned'),
                booked_for_name: appointment.booked_for_name || null,
                source: appointment.source,
            },
        };
    };

    /**
     * Get all appointments for a patient with advanced filtering.
     *
     * Supported status filters:
     * - 'upcoming'    → CONFIRMED or PENDING appointments with date >= today (actionable visits)
     * - 'confirmed'   → CONFIRMED appointments only (approved & ready)
     * - 'pending'     → PENDING appointments only (awaiting approval, future dates only)
     * - 'missed'      → NO_SHOW appointments (missed/no shows)
     * - 'cancel'      → CANCELLED and LATE_CANCEL appointments
     * - 'decline'     → Appointments with approval_status = REJECTED
     * - 'completed'   → COMPLETED appointments (past history)
     * - 'all' or ''   → Every appointment (no filter)
     *
     * Sort:
     * - 'asc' (default) → Oldest first
     * - 'desc' → Newest first
     *
     * @param {string} patientId - Patient UUID
     * @param {string|null} status - Filter status
     * @param {string} sort - Sort direction ('asc' or 'desc')
     * @returns {Array} Filtered appointments
     */
    export const getPatientAppointments = async (
        patientId,
        status = null,
        sort = 'asc',
        page = 1,
        limit = 10,
    ) => {
        // 1. Get all profile IDs in this family (Self + Dependents)
        const { data: familyProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .or(`id.eq.${patientId},primary_profile_id.eq.${patientId}`);

        const familyIds = (familyProfiles || []).map(p => p.id);
        if (familyIds.length === 0) familyIds.push(patientId); // Fallback

        let query = supabaseAdmin
            .from('appointments')
            .select(
                `
      *,
      patient:profiles!patient_id(full_name, first_name, last_name, relationship_to_primary, primary_profile_id),
      service:services(name, duration_minutes, price),
      dentist:dentists(
        profile:profiles(full_name, first_name, last_name, middle_name, suffix)
      )
    `,
                { count: 'exact' },
            )
            .in('patient_id', familyIds);

        // 🌏 Philippine Time (UTC+8) — Use PH timezone for all date comparisons
        const today = getTodayPH();

        // 🎯 FILTER LOGIC
        if (status === 'upcoming') {
            // Upcoming = confirmed/approved future appointments, explicitly excluding any cancelled or rescheduled status
            query = query
                .or(`status.eq.${APPOINTMENT_STATUS.CONFIRMED},approval_status.eq.approved`)
                .not('status', 'in', `(${APPOINTMENT_STATUS.CANCELLED},${APPOINTMENT_STATUS.LATE_CANCEL},${APPOINTMENT_STATUS.RESCHEDULED},${APPOINTMENT_STATUS.DISPLACED})`)
                .gte('appointment_date', today);
        } else if (status === 'confirmed') {
            query = query
                .or(`status.eq.${APPOINTMENT_STATUS.CONFIRMED},approval_status.eq.approved`)
                .not('status', 'in', `(${APPOINTMENT_STATUS.CANCELLED},${APPOINTMENT_STATUS.LATE_CANCEL},${APPOINTMENT_STATUS.RESCHEDULED},${APPOINTMENT_STATUS.DISPLACED})`)
                .gte('appointment_date', today);
        } else if (status === 'pending') {
            // Pending = status is PENDING AND it hasn't been approved yet
            query = query.eq('status', APPOINTMENT_STATUS.PENDING).not('approval_status', 'eq', 'approved').gte('appointment_date', today);
        } else if (status === 'missed') {
            query = query.eq('status', APPOINTMENT_STATUS.NO_SHOW);
        } else if (status === 'cancel') {
            query = query.in('status', [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.LATE_CANCEL]);
        } else if (status === 'decline') {
            query = query.eq('approval_status', APPROVAL_STATUS.REJECTED);
        } else if (status === 'completed') {
            query = query.eq('status', APPOINTMENT_STATUS.COMPLETED);
        } else if (status && status !== 'all' && status !== '') {
            query = query.eq('status', status);
        }

        // 🔄 SORTING
        const isAsc = sort === 'asc';
        query = query
            .order('appointment_date', { ascending: isAsc })
            .order('start_time', { ascending: isAsc });

        // 🔢 PAGINATION
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw new AppError(error.message, 500);
        }

        const appointments = data.map((appt) => ({
            id: appt.id,
            date: appt.appointment_date,
            start_time: appt.start_time,
            end_time: appt.end_time,
            status: appt.status,
            approval_status: appt.approval_status,
            service: appt.service?.name,
            price: appt.service?.price,
            dentist: appt.dentist?.profile?.first_name ? `Dr. ${appt.dentist.profile.last_name}, ${appt.dentist.profile.first_name}` : (appt.dentist?.profile?.full_name || 'TBD'),
            booked_for_name: appt.booked_for_name || appt.patient?.full_name,
            patient_name: appt.patient?.full_name,
            relationship: appt.patient?.relationship_to_primary || (appt.patient?.primary_profile_id ? 'Dependent' : 'Self'),
            is_walk_in: appt.is_walk_in,
            notes: appt.notes,
            created_at: appt.created_at,
        }));

        return {
            appointments,
            total: count || 0,
        };
    };

    /**
     * Get summary counts of appointments for a patient.
     */
    export const getPatientAppointmentStats = async (patientId) => {
        const today = getTodayPH();

        // 1. Get all profile IDs in this family
        const { data: familyProfiles } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .or(`id.eq.${patientId},primary_profile_id.eq.${patientId}`);

        const familyIds = (familyProfiles || []).map(p => p.id);
        if (familyIds.length === 0) familyIds.push(patientId);

        // Run summary counts in parallel for performance
        const [upcoming, pending, rejected, completed] = await Promise.all([
            // Upcoming: Confirmed or explicitly approved and future
            supabaseAdmin
                .from('appointments')
                .select('id', { count: 'exact', head: true })
                .in('patient_id', familyIds)
                .or(`status.eq.${APPOINTMENT_STATUS.CONFIRMED},approval_status.eq.approved`)
                .not('status', 'in', `(${APPOINTMENT_STATUS.CANCELLED},${APPOINTMENT_STATUS.LATE_CANCEL},${APPOINTMENT_STATUS.NO_SHOW},${APPOINTMENT_STATUS.RESCHEDULED},${APPOINTMENT_STATUS.DISPLACED})`)
                .gte('appointment_date', today),

            // Pending: Pending and future
            supabaseAdmin
                .from('appointments')
                .select('id', { count: 'exact', head: true })
                .in('patient_id', familyIds)
                .eq('status', APPOINTMENT_STATUS.PENDING)
                .gte('appointment_date', today),

            // Rejected: approval_status is rejected
            supabaseAdmin
                .from('appointments')
                .select('id', { count: 'exact', head: true })
                .in('patient_id', familyIds)
                .eq('approval_status', APPROVAL_STATUS.REJECTED),

            // Completed: status is completed
            supabaseAdmin
                .from('appointments')
                .select('id', { count: 'exact', head: true })
                .in('patient_id', familyIds)
                .eq('status', APPOINTMENT_STATUS.COMPLETED)
        ]);

        return {
            upcoming: upcoming.count || 0,
            pending: pending.count || 0,
            rejected: rejected.count || 0,
            completed: completed.count || 0
        };
    };

    /**
     * Get a single appointment by ID (with ownership check).
     */
    export const getAppointmentById = async (appointmentId, patientId) => {
        const { data, error } = await supabaseAdmin
            .from('appointments')
            .select(
                `
      *,
      service:services(name, duration_minutes, price),
      dentist:dentists(
        profile:profiles(full_name, first_name, last_name, middle_name, suffix)
      )
    `,
            )
            .eq('id', appointmentId)
            .eq('patient_id', patientId)
            .single();

        if (error || !data) {
            throw new AppError('Appointment not found.', 404);
        }

        return data;
    };

    /**
     * Cancel an appointment.
     *
     * @param {string} appointmentId - The appointment UUID
     * @param {string} patientId - The patient's UUID (for ownership check)
     * @param {string} reason - Optional cancellation reason
     * @returns {object} Cancelled appointment
     */
    export const cancelAppointment = async (
        appointmentId,
        patientId,
        reason = '',
        sendEmail = true,
        removeWaitlist = false,
    ) => {
        // ── 1. Get the appointment ──
        const { data: appointment, error: fetchError } = await supabaseAdmin
            .from('appointments')
            .select('*')
            .eq('id', appointmentId)
            .eq('patient_id', patientId)
            .single();

        if (fetchError || !appointment) {
            throw new AppError('Appointment not found or you do not own it.', 404);
        }

        // ── 2. Check if it can be cancelled ──
        if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
            throw new AppError('This appointment is already cancelled.', 400);
        }

        if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
            throw new AppError('Cannot cancel a completed appointment.', 400);
        }

        // ── 3. Check if it's a last-minute cancellation ──
        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.start_time}`,
        );
        const now = new Date();
        const hoursUntil = (appointmentDateTime - now) / (1000 * 60 * 60);
        const isLastMinute = hoursUntil < 24; // Less than 24 hours notice

        // ── 4. Determine status: LATE_CANCEL (<24h) vs CANCELLED (≥24h) ──
        const cancelStatus = isLastMinute
            ? APPOINTMENT_STATUS.LATE_CANCEL
            : APPOINTMENT_STATUS.CANCELLED;

        // ── 5a. Update status ──
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({
                status: cancelStatus,
                cancellation_reason: reason,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId)
            .select()
            .single();

        if (updateError) {
            throw new AppError(updateError.message, 500);
        }

        // ── 5b. Send cancellation email ──
        // For authenticated patients: fetch their email from profiles
        const { data: patient } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', patientId)
            .single();

        // Get service name for the email
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('name')
            .eq('id', appointment.service_id)
            .single();

        if (patient?.email && sendEmail) {
            const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
            await sendCancellationEmail(patient.email, patientDisplayName, {
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                service: service?.name || 'Dental appointment',
                isLastMinute,
            });
        }

        // ── 5c. In-app notification ──
        await sendCancellationNotice(patientId, {
            date: appointment.appointment_date,
            start_time: appointment.start_time,
            end_time: appointment.end_time,
            service: service?.name || 'Dental appointment',
        });

        // ── 6. If late cancel, increment patient's late cancel tracking ──
        if (isLastMinute) {
            // Note: This is tracked for analytics.
            // No-show restrictions are handled separately in Module 10.
            console.log(
                `⚠️ Late cancellation by patient ${patientId} — ${hoursUntil.toFixed(1)}h before appointment`,
            );
        }

        // ── 7. CASCADE: Cancel linked waitlist entry if requested ──
        if (removeWaitlist) {
            try {
                const { cancelWaitlistEntry } = await import('./waitlist.service.js');
                // Find waitlist entry where this appointment is the Primary Appointment
                const { data: linkedWaitlist } = await supabaseAdmin
                    .from('waitlist')
                    .select('id')
                    .eq('backup_appointment_id', appointmentId)
                    .eq('patient_id', patientId)
                    .in('status', ['WAITING', 'NOTIFIED'])
                    .maybeSingle();

                if (linkedWaitlist) {
                    await cancelWaitlistEntry(linkedWaitlist.id, patientId, false);
                    console.log(`🔗 [APPOINTMENT] Cascade-cancelled linked waitlist entry ${linkedWaitlist.id}`);
                }
            } catch (err) {
                console.warn(`⚠️ [APPOINTMENT] Could not cascade-cancel waitlist: ${err.message}`);
            }
        }

        return {
            message: isLastMinute
                ? 'Appointment cancelled (late cancellation — less than 24h notice).'
                : 'Appointment cancelled successfully.',
            was_last_minute: isLastMinute,
            cancel_status: cancelStatus,
            cancelled_appointment: {
                id: updated.id,
                date: updated.appointment_date,
                time: updated.start_time,
                status: updated.status,
            },
            // Module 09 (Waitlist) will use this info to notify waitlisted patients
            freed_slot: {
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                service_id: appointment.service_id,
                dentist_id: appointment.dentist_id,
            },
        };
    };

    /**
     * Reschedule an appointment to a new date/time.
     *
     * Internally: cancel old → book new.
     *
     * @param {string} appointmentId - The appointment to reschedule
     * @param {string} patientId - The patient's UUID
     * @param {string} newDate - New date 'YYYY-MM-DD'
     * @param {string} newTime - New time 'HH:MM'
     */
    export const rescheduleAppointment = async (appointmentId, patientId, newDate, newTime, userSessionId = null, preferredDentistId = null) => {
        // ── 1. Get the original appointment ──
        const { data: original, error } = await supabaseAdmin
            .from('appointments')
            .select('*, service:services(name)')
            .eq('id', appointmentId)
            .eq('patient_id', patientId)
            .single();

        if (error || !original) {
            throw new AppError('Appointment not found.', 404);
        }

        if (original.status !== APPOINTMENT_STATUS.CONFIRMED) {
            throw new AppError(`Cannot reschedule appointment with status: ${original.status}`, 400);
        }

        // ── 1b. Prevent "Zombie" Reschedule (Past appointments) ──
        const today = getTodayPH();
        if (original.appointment_date < today) {
            throw new AppError('Cannot reschedule an appointment that has already passed.', 400);
        }

        // ── 1c. Enforcement: Limit to 1 reschedule per booking ──
        if (original.reschedule_count >= 1) {
            throw new AppError('This appointment has already been rescheduled once. For further changes, please contact the clinic directly.', 403);
        }

        // ── 2. Try to book the new slot first (sendEmail = false — reschedule email sent instead) ──
        const newBooking = await bookAppointment(
            patientId,
            original.service_id,
            newDate,
            newTime,
            false,
            null,
            undefined,
            userSessionId,
            preferredDentistId,
            original.reschedule_count + 1,
            !!preferredDentistId // ✅ If they chose a doctor during reschedule, it's preferred
        );

        if (!newBooking.booked) {
            // New slot not available — return alternatives, don't cancel the original
            return {
                rescheduled: false,
                message: 'New slot is not available. Your original appointment is unchanged.',
                original_appointment: {
                    id: original.id,
                    date: original.appointment_date,
                    time: original.start_time,
                },
                ...newBooking, // includes alternatives
            };
        }

        // ── 3. New slot booked! Mark the original as RESCHEDULED (distinct from CANCELLED) ──
        try {
            const { error: updateError } = await supabaseAdmin
                .from('appointments')
                .update({
                    status: APPOINTMENT_STATUS.RESCHEDULED,
                    cancellation_reason: 'Rescheduled to new time',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', appointmentId);

            if (updateError) throw updateError;

            // ── 4. Trigger Real-time Notification ──
            // This record in the 'notifications' table triggers the frontend realtime listener
            try {
                const { sendRescheduleNotice } = await import('./notification.service.js');
                const oldDetails = {
                    date: original.appointment_date,
                    start_time: original.start_time,
                    end_time: original.end_time,
                    service: original.service?.name || 'Dental'
                };
                const newDetails = {
                    date: newBooking.appointment.appointment_date,
                    start_time: newBooking.appointment.start_time,
                    end_time: newBooking.appointment.end_time
                };
                await sendRescheduleNotice(patientId, oldDetails, newDetails);
            } catch (notifError) {
                console.warn('[Realtime] Warning: Failed to send reschedule notification:', notifError.message);
            }
        } catch (err) {
            // ROLLBACK: If marking the old one as rescheduled fails, we must cancel the new booking!
            console.error('❌ Reschedule failed at update stage, rolling back new booking:', err);
            if (newBooking.appointment?.id) {
                await cancelAppointment(newBooking.appointment.id, patientId, 'Rollback: Reschedule internal update failure.', false);
            }
            throw new AppError('Failed to complete rescheduling. Please try again.', 500);
        }

        const freedSlot = {
            date: original.appointment_date,
            start_time: original.start_time,
            end_time: original.end_time,
            service_id: original.service_id,
            dentist_id: original.dentist_id,
        };

        // ── 4. Send reschedule email ──
        const { data: patient } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name')
            .eq('id', patientId)
            .single();

        // Get service name for the email
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('name')
            .eq('id', original.service_id)
            .single();

        if (patient?.email) {
            const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
            await sendRescheduleEmail(patient.email, patientDisplayName, {
                oldDate: original.appointment_date,
                oldTime: original.start_time,
                newDate: newBooking.appointment.date,
                newTime: newBooking.appointment.start_time,
                service: service?.name || 'Dental appointment',
                dentist: newBooking.appointment.dentist || 'Assigned',
            });
        }

        return {
            rescheduled: true,
            message: 'Appointment rescheduled successfully!',
            old_appointment: {
                date: original.appointment_date,
                time: original.start_time,
                status: 'RESCHEDULED',
            },
            new_appointment: newBooking.appointment,
            freed_slot: freedSlot,
        };
    };

    /**
     * Book a walk-in appointment (admin only).
     * Walk-ins are always GENERAL tier, assigned immediately, status = CONFIRMED.
     *
     * @param {string} patientId - The patient's profile UUID
     * @param {string} serviceId - The service UUID
     * @param {string|null} time - Preferred time (defaults to next available slot)
     * @param {string|null} notes - Optional admin notes
     * @returns {object} Walk-in appointment details
     */
    export const bookWalkIn = async (patientId, serviceId, time = null, notes = null) => {
        // 🌏 Philippine Time (UTC+8) — Today's date in PH timezone
        const today = getTodayPH();

        // Get service info
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (!service) {
            throw new AppError('Service not found.', 404);
        }

        // Use provided time or current time rounded to next 30-min slot
        const now = new Date();
        const walkInTime =
            time || `${String(now.getHours()).padStart(2, '0')}:${now.getMinutes() < 30 ? '30' : '00'}`;
        const endTime = addMinutesToTime(walkInTime, service.duration_minutes);

        // Auto-assign dentist (general tier for walk-ins)
        const dentistId = await assignDentist(today, walkInTime, endTime, 'general');

        if (!dentistId) {
            throw new AppError('No dentist available right now for a walk-in.', 409);
        }

        const { data: appointment, error } = await supabaseAdmin
            .from('appointments')
            .insert({
                patient_id: patientId,
                dentist_id: dentistId,
                service_id: serviceId,
                appointment_date: today,
                start_time: walkInTime,
                end_time: endTime,
                status: APPOINTMENT_STATUS.CONFIRMED,
                service_tier: 'general',
                is_walk_in: true,
                source: APPOINTMENT_SOURCE.WALK_IN, // ✅ NEW: Track source
                notes: notes || 'Walk-in appointment',
                // ✅ Walk-ins are confirmed by default
                patient_confirmed: true,
                confirmed_at: new Date().toISOString(),
            })
            .select(
                `
      *,
      service:services(name, price),
      dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))
    `,
            )
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new AppError('Time slot conflict. Try a different time.', 409);
            }
            throw new AppError(error.message, 500);
        }

        return {
            message: 'Walk-in booked!',
            appointment: {
                id: appointment.id,
                date: today,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                status: 'CONFIRMED',
                service: appointment.service?.name,
                dentist: appointment.dentist?.profile?.first_name ? `Dr. ${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name}` : (appointment.dentist?.profile?.full_name || 'Assigned'),
                is_walk_in: true,
                source: appointment.source, // ✅ NEW: Include source in response
            },
        };
    };

    // ── Guest direct mutations (moved from controller) ──

    export const cancelGuestAppointmentAction = async (appointmentId, reason) => {
        const { data: updated, error } = await supabaseAdmin
            .from('appointments')
            .update({
                status: APPOINTMENT_STATUS.CANCELLED,
                cancellation_reason: reason,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId)
            .select()
            .single();

        if (error) throw new AppError(error.message, 500);
        return updated;
    };

    export const insertConfirmedGuestAppointment = async (oldAppt, dentistId, date, time, endTime, userSessionId = null, rescheduleCount = 0) => {
        const { data: newAppointment, error: insertError } = await supabaseAdmin
            .from('appointments')
            .insert({
                patient_id: null,
                guest_email: oldAppt.guest_email,
                guest_phone: oldAppt.guest_phone,
                guest_name: oldAppt.guest_name,
                guest_first_name: oldAppt.guest_first_name,
                guest_last_name: oldAppt.guest_last_name,
                guest_middle_name: oldAppt.guest_middle_name,
                guest_suffix: oldAppt.guest_suffix,
                dentist_id: dentistId,
                service_id: oldAppt.service?.id,
                appointment_date: date,
                start_time: time,
                end_time: endTime,
                status: APPOINTMENT_STATUS.PENDING,
                approval_status: APPROVAL_STATUS.PENDING,
                source: APPOINTMENT_SOURCE.GUEST_BOOKING,
                reschedule_count: rescheduleCount,
                // ✅ Now confirmed via email link
                patient_confirmed: true,
                confirmed_at: new Date().toISOString(),
            })
            .select(`*, service:services(name, duration_minutes, price), dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))`)
            .single();

        if (insertError) {
            if (insertError.code === '23505') {
                throw new AppError('This slot was just taken. Please try another time.', 409);
            }
            throw new AppError(insertError.message, 500);
        }

        // ✅ NEW: Release hold if it exists
        if (userSessionId) {
            try {
                const { releaseHoldBySession } = await import('./slot-hold.service.js');
                await releaseHoldBySession(userSessionId);
            } catch (err) {
                console.warn(`[RE-HOLD] Warning: Failed to release hold for session ${userSessionId}: ${err.message}`);
            }
        }

        return newAppointment;
    };

    /**
     * Reschedule a guest appointment.
     * Atomically: Book new -> Cancel old.
     */
    export const rescheduleGuestAppointment = async (oldAppt, date, time, userSessionId = null) => {
        // 0. Prevent "Zombie" Reschedule (Past appointments)
        const today = getTodayPH();
        if (oldAppt.appointment_date < today) {
            throw new AppError('Cannot reschedule an appointment that has already passed.', 400);
        }

        if (oldAppt.status !== APPOINTMENT_STATUS.CONFIRMED && oldAppt.status !== APPOINTMENT_STATUS.PENDING) {
            throw new AppError('Only active or pending appointments can be rescheduled.', 400);
        }

        // 0b. Enforcement: Limit to 1 reschedule
        if (oldAppt.reschedule_count >= 1) {
            throw new AppError('This appointment has already been rescheduled once. Further changes must be handled by clinic staff.', 403);
        }

        // 1. Check availability for new slot (recognizing the guest's hold)
        const availability = await getAvailableSlots(date, oldAppt.service?.id, userSessionId);
        const slotData = availability.all_slots.find((s) => s.time === time);

        if (!slotData || slotData.available === 0) {
            const suggestions = await getSuggestedSlots(date, oldAppt.service?.id, time);
            return {
                rescheduled: false,
                message: 'Selected slot is no longer available.',
                ...suggestions
            };
        }

        // 2. Assign dentist for new slot
        const endTime = addMinutesToTime(time, oldAppt.service?.duration_minutes || 30);

        // Check for held dentist first
        let finalDentistId = null;
        if (userSessionId) {
            const { data: hold } = await supabaseAdmin
                .from('slot_holds')
                .select('dentist_id')
                .eq('user_session_id', userSessionId)
                .eq('appointment_date', date)
                .eq('start_time', time)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .single();

            if (hold?.dentist_id) {
                finalDentistId = hold.dentist_id;
            }
        }

        if (!finalDentistId) {
            finalDentistId = await assignDentist(date, time, endTime, SERVICE_TIER.GENERAL, userSessionId, oldAppt.service?.id);
        }

        if (!finalDentistId) {
            throw new AppError('No dentist available for the new slot.', 409);
        }

        // 3. Create NEW appointment
        const newAppointment = await insertConfirmedGuestAppointment(
            oldAppt,
            finalDentistId,
            date,
            time,
            endTime,
            userSessionId,
            (oldAppt.reschedule_count || 0) + 1
        );

        // 4. Mark OLD appointment as RESCHEDULED
        try {
            const { error: updateError } = await supabaseAdmin
                .from('appointments')
                .update({
                    status: APPOINTMENT_STATUS.RESCHEDULED,
                    cancellation_reason: 'Rescheduled by guest via link.',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', oldAppt.id);

            if (updateError) throw updateError;
        } catch (err) {
            // ROLLBACK: If marking old one as rescheduled fails, cancel the new one
            console.error('❌ Guest Reschedule update failed, rolling back:', err);
            if (newAppointment?.id) {
                await cancelGuestAppointmentAction(newAppointment.id, 'Rollback: Parent update failure.');
            }
            throw new AppError('Failed to complete rescheduling.', 500);
        }

        return {
            rescheduled: true,
            newAppointment
        };
    };

    /**
     * Admin/Staff initiated booking for a patient.
     * Status is automatically set to CONFIRMED.
     * 
     * @param {string} staffId - The ID of the staff member booking the appointment
     * @param {string} patientId - The ID of the patient (Primary or Dependent)
     * @param {string} serviceId - The service UUID
     * @param {string} date - 'YYYY-MM-DD'
     * @param {string} time - 'HH:MM'
     * @param {string} userSessionId - For slot hold resolution
     * @param {string} preferredDentistId - Optional preferred doctor
     * @returns {object} Appointment details
     */
    export const bookAppointmentAdmin = async (
        staffId,
        patientId,
        serviceId,
        date,
        time,
        userSessionId = null,
        preferredDentistId = null
    ) => {
        // ── 0. Validate date ──
        const todayPH = getTodayPH();
        if (date < todayPH) {
            throw new AppError('Cannot book appointments in the past.', 400);
        }

        // ── 1. Get service info ──
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', serviceId)
            .single();

        if (!service) {
            throw new AppError('Service not found.', 404);
        }

        const endTime = addMinutesToTime(time, service.duration_minutes);

        // ── 2. Get Patient Info (for email/logging) ──
        const { data: patient } = await supabaseAdmin
            .from('profiles')
            .select('full_name, email, first_name, last_name, middle_name, suffix')
            .eq('id', patientId)
            .single();

        if (!patient) {
            throw new AppError('Patient not found.', 404);
        }

        // ── 3. Check Availability ──
        const availability = await getAvailableSlots(date, serviceId, userSessionId);
        const slotData = availability.all_slots.find((s) => s.time === time);
        const isAvailable = slotData && slotData.available > 0;

        if (!isAvailable) {
            throw new AppError('The selected slot is no longer available.', 409);
        }

        // ── 4. Assign Dentist ──
        let finalDentistId = preferredDentistId;

        if (!finalDentistId && userSessionId) {
            const { data: hold } = await supabaseAdmin
                .from('slot_holds')
                .select('dentist_id')
                .eq('user_session_id', userSessionId)
                .eq('appointment_date', date)
                .eq('start_time', time)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .single();

            if (hold?.dentist_id) {
                finalDentistId = hold.dentist_id;
            }
        }

        if (!finalDentistId) {
            finalDentistId = await assignDentist(date, time, endTime, service.tier, userSessionId);
        }

        if (!finalDentistId) {
            throw new AppError('No dentist available for this slot.', 409);
        }

        // ── 5. Create Confirmed Appointment ──
        const { data: appointment, error } = await supabaseAdmin
            .from('appointments')
            .insert({
                patient_id: patientId,
                dentist_id: finalDentistId,
                service_id: serviceId,
                appointment_date: date,
                start_time: time,
                end_time: endTime,
                status: APPOINTMENT_STATUS.CONFIRMED,
                service_tier: service.tier,
                approval_status: APPROVAL_STATUS.APPROVED,
                source: APPOINTMENT_SOURCE.WALK_IN,
                booked_by: staffId,
                is_walk_in: true,
                patient_confirmed: true,
                confirmed_at: new Date().toISOString(),
                approved_by: staffId,
                approved_at: new Date().toISOString(),
                first_name: patient.first_name,
                last_name: patient.last_name,
                middle_name: patient.middle_name,
                suffix: patient.suffix,
            })
            .select(`
            *,
            service:services(name, duration_minutes, price),
            dentist:dentists(
                id,
                profile:profiles(full_name, last_name, first_name)
            )
        `)
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new AppError('This slot was just taken. Please try another time.', 409);
            }
            throw new AppError(error.message, 500);
        }

        // ── 6. Send Email Notification ──
        if (patient.email) {
            const patientDisplayName = patient.first_name ? `${patient.first_name} ${patient.last_name}`.trim() : patient.full_name;
            sendBookingSuccessEmail(patient.email, patientDisplayName, {
                date: appointment.appointment_date,
                start_time: appointment.start_time,
                service: appointment.service?.name,
                dentist: appointment.dentist?.profile?.first_name ? `Dr. ${appointment.dentist.profile.last_name}, ${appointment.dentist.profile.first_name}` : (appointment.dentist?.profile?.full_name || 'Assigned'),
            }).catch(err => console.error('[Email] Failed to send admin booking success email:', err.message));
        }

        return appointment;
    };

    /**
     * Admin-only reschedule: bypasses patient ownership & reschedule-count limits.
     *
     * @param {string} appointmentId  - ID of the appointment to reschedule
     * @param {string} staffId        - Admin/secretary performing the action
     * @param {string} newDate        - New date 'YYYY-MM-DD'
     * @param {string} newTime        - New time 'HH:MM'
     * @param {string|null} preferredDentistId
     * @param {string|null} userSessionId
     */
    export const rescheduleAppointmentAdmin = async (
        appointmentId,
        staffId,
        newDate,
        newTime,
        preferredDentistId = null,
        userSessionId = null,
    ) => {
        // ── 1. Fetch the original appointment (no patient_id constraint) ──
        const { data: original, error } = await supabaseAdmin
            .from('appointments')
            .select(`
            *,
            service:services(id, name, duration_minutes),
            patient:profiles!appointments_patient_id_fkey(id, full_name, first_name, last_name, email)
        `)
            .eq('id', appointmentId)
            .single();

        if (error || !original) {
            throw new AppError('Appointment not found.', 404);
        }

        if (original.status !== APPOINTMENT_STATUS.CONFIRMED) {
            throw new AppError(`Cannot reschedule an appointment with status: ${original.status}`, 400);
        }

        // ── 2. Check new slot availability ──
        const serviceId = original.service_id;
        const availability = await getAvailableSlots(newDate, serviceId, userSessionId);
        const slotData = availability.all_slots.find((s) => s.time === newTime);
        const isAvailable = slotData && slotData.available > 0;

        if (!isAvailable) {
            throw new AppError('The selected slot is no longer available.', 409);
        }

        // ── 3. Assign dentist ──
        const durationMinutes = original.service?.duration_minutes || 30;
        const endTime = addMinutesToTime(newTime, durationMinutes);

        let finalDentistId = preferredDentistId;
        if (!finalDentistId && userSessionId) {
            const { data: hold } = await supabaseAdmin
                .from('slot_holds')
                .select('dentist_id')
                .eq('user_session_id', userSessionId)
                .eq('appointment_date', newDate)
                .eq('start_time', newTime)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .single();
            if (hold?.dentist_id) finalDentistId = hold.dentist_id;
        }

        if (!finalDentistId) {
            finalDentistId = await assignDentist(newDate, newTime, endTime, original.service_tier, userSessionId);
        }

        if (!finalDentistId) {
            throw new AppError('No dentist available for this slot.', 409);
        }

        // ── 4. Insert the new appointment ──
        const { data: newAppointment, error: insertError } = await supabaseAdmin
            .from('appointments')
            .insert({
                patient_id: original.patient_id,
                dentist_id: finalDentistId,
                service_id: serviceId,
                appointment_date: newDate,
                start_time: newTime,
                end_time: endTime,
                status: APPOINTMENT_STATUS.CONFIRMED,
                service_tier: original.service_tier,
                approval_status: APPROVAL_STATUS.APPROVED,
                source: APPOINTMENT_SOURCE.WALK_IN,
                booked_by: staffId,
                is_walk_in: true,
                patient_confirmed: true,
                confirmed_at: new Date().toISOString(),
                approved_by: staffId,
                approved_at: new Date().toISOString(),
                reschedule_count: (original.reschedule_count || 0) + 1,
                first_name: original.first_name,
                last_name: original.last_name,
                middle_name: original.middle_name,
                suffix: original.suffix,
            })
            .select(`
            *,
            service:services(name, duration_minutes, price),
            dentist:dentists(id, profile:profiles(full_name, last_name, first_name))
        `)
            .single();

        if (insertError) {
            if (insertError.code === '23505') {
                throw new AppError('This slot was just taken. Please try another time.', 409);
            }
            throw new AppError(insertError.message, 500);
        }

        // ── 5. Mark the old appointment as RESCHEDULED ──
        const { error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({
                status: APPOINTMENT_STATUS.RESCHEDULED,
                cancellation_reason: `Admin rescheduled to ${newDate} ${newTime}`,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', appointmentId);

        if (updateError) {
            // Rollback new appointment
            await supabaseAdmin.from('appointments').delete().eq('id', newAppointment.id);
            throw new AppError('Failed to complete rescheduling. Please try again.', 500);
        }

        // ── 6. Send notification email to patient ──
        const patient = original.patient;
        if (patient?.email) {
            try {
                const { sendRescheduleEmail } = await import('./email-confirmation.service.js');
                const displayName = patient.first_name
                    ? `${patient.first_name} ${patient.last_name}`.trim()
                    : patient.full_name;
                await sendRescheduleEmail(patient.email, displayName, {
                    oldDate: original.appointment_date,
                    oldTime: original.start_time,
                    newDate,
                    newTime,
                    service: original.service?.name || 'Dental appointment',
                });
            } catch (emailErr) {
                console.warn('[Email] Reschedule email failed (non-critical):', emailErr.message);
            }
        }

        return {
            rescheduled: true,
            new_appointment: newAppointment,
            old_appointment: {
                id: original.id,
                date: original.appointment_date,
                time: original.start_time,
            },
            freed_slot: {
                date: original.appointment_date,
                start_time: original.start_time,
                end_time: original.end_time,
                service_id: original.service_id,
                dentist_id: original.dentist_id,
            },
        };
    };

// ── End of Service ──
