import { supabaseAdmin } from '../config/supabase.js';
import { CLINIC_CONFIG } from '../utils/constants.js';
import { AppError } from '../utils/errors.js';
import { generateTimeSlots, timesOverlap, timeToMinutes, minutesToTime, addMinutesToTime } from '../utils/time.js';

/**
 * Get all time slots for a given date and service (including full ones).
 * Frontend can filter based on availability:
 * - For booking: show only slots where available > 0
 * - For waitlist: show all slots (including where available === 0)
 *
 * @param {string} date - Format: 'YYYY-MM-DD' (e.g., '2026-03-01')
 * @param {string} serviceId - The service UUID
 * @returns {object} { all_slots: [{time, available}, ...], date, service, total_available, total_full }
 */

/*
SAMPLE DATA THAT WILL BE RETURNED
{
  "all_slots": [
    { "time": "08:00", "available": 2 },
    { "time": "08:30", "available": 1 },
    { "time": "09:00", "available": 0 },
    { "time": "09:30", "available": 2 }
  ],
  "date": "2026-03-01",
  "service": "Teeth Cleaning",
  "duration_minutes": 30,
  "total_available": 3,
  "total_full": 1
}
*/

export const getAvailableSlots = async (
    date,
    serviceId,
    filterSessionId = null,
    skipNextSearch = false,
    dentistId = null,
    excludeAppointmentId = null,
) => {
    // ── 0. Get Clinic Global Settings ──
    const { data: settings } = await supabaseAdmin
        .from('clinic_settings')
        .select('booking_lead_time_days, booking_max_horizon_days, waitlist_enabled')
        .single();

    const leadTimeDays = settings?.booking_lead_time_days || 1;
    const horizonDays = settings?.booking_max_horizon_days || 60;

    // ── 0b. Check lead time and horizon ──
    const now = new Date();
    const requestedDate = new Date(date);
    const horizonDate = new Date();
    horizonDate.setDate(horizonDate.getDate() + horizonDays);

    if (requestedDate > horizonDate) {
        return handleNoSlots(
            date,
            'N/A',
            0,
            `Bookings are only available up to ${horizonDays} days in advance.`,
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    // ── 0c. Check for Holidays ──
    const { data: holiday } = await supabaseAdmin
        .from('clinic_holidays')
        .select('name')
        .eq('date', date)
        .maybeSingle();

    if (holiday) {
        return handleNoSlots(
            date,
            'N/A',
            0,
            `Clinic is closed: ${holiday.name}`,
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    // ── 1. Get the service to know its duration ──
    const { data: service, error: serviceError } = await supabaseAdmin
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

    if (serviceError || !service) {
        throw new AppError('Service not found.', 404);
    }

    const durationMinutes = service.duration_minutes;

    // ── 2. Check if the clinic is open on that day ──
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 1=Mon, ...

    const { data: clinicDay } = await supabaseAdmin
        .from('clinic_schedule')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .single();

    if (!clinicDay || !clinicDay.is_open) {
        return handleNoSlots(
            date,
            service.name,
            durationMinutes,
            'Clinic is closed on this day.',
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    // ── 3. Get all active dentists who can perform this service ──
    // Strategy: 
    // - If dentist has entry in dentist_services, they MUST match the serviceId.
    // - If dentist has NO entry in dentist_services, fall back to tier-based check.

    // First, get all active dentists
    const { data: allDentists } = await supabaseAdmin
        .from('dentists')
        .select('id, tier')
        .eq('is_active', true);

    if (!allDentists || allDentists.length === 0) {
        return handleNoSlots(
            date,
            service.name,
            durationMinutes,
            'No active dentists.',
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    // Get dentists who have ANY explicit skills listed
    const { data: dentistsWithSkills } = await supabaseAdmin
        .from('dentist_services')
        .select('dentist_id');
    const skilledDentistIds = new Set((dentistsWithSkills || []).map(ds => ds.dentist_id));

    // Get dentists who explicitly have THIS service skill
    const { data: dentistsWithThisService } = await supabaseAdmin
        .from('dentist_services')
        .select('dentist_id')
        .eq('service_id', serviceId);
    const serviceMatchIds = new Set((dentistsWithThisService || []).map(ds => ds.dentist_id));

    // Filter dentists based on Skillset Hierarchy
    const eligibleDentists = allDentists.filter((d) => {
        // Tie to a specific dentist if dentistId is provided
        if (dentistId && d.id !== dentistId) return false;

        // ✅ STRICT Skillset Check (As per user request)
        // Only show doctors who are explicitly mapped to this service in dentist_services
        return serviceMatchIds.has(d.id);
    });

    if (!eligibleDentists || eligibleDentists.length === 0) {
        return handleNoSlots(
            date,
            service.name,
            durationMinutes,
            'No dentists available.',
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    const dentistIds = eligibleDentists.map((d) => d.id);

    // Fetch ALL schedule rows for these dentists
    const { data: allDentistSchedules } = await supabaseAdmin
        .from('dentist_schedule')
        .select('*')
        .in('dentist_id', dentistIds);

    // Build effective schedules
    const dentistSchedules = [];
    dentistIds.forEach((dId) => {
        const dRows = (allDentistSchedules || []).filter((s) => s.dentist_id === dId);
        const todayRow = dRows.find(r => r.day_of_week === dayOfWeek);
        
        // Mode Detection: If any row is explicitly custom, the whole doctor is in Custom Mode.
        const isCustomMode = dRows.length > 0 && dRows.some(r => r.is_using_global === false);
        
        let effectiveSchedule = null;

        // Determination Logic:
        // 1. If today's row exists and says "Inherit", or if doctor has 0 rows -> Inherit Global.
        // 2. If today's row exists and is Custom, use it.
        // 3. If no row exists for today but doctor is in Custom Mode -> Closed.
        
        const shouldInherit = todayRow ? (todayRow.is_using_global === true) : !isCustomMode;

        if (shouldInherit) {
            // Inherit from Clinic
            if (clinicDay.is_open) {
                effectiveSchedule = {
                    dentist_id: dId,
                    day_of_week: dayOfWeek,
                    is_working: true,
                    start_time: clinicDay.open_time,
                    end_time: clinicDay.close_time,
                    break_start_time: clinicDay.lunch_start_time || null,
                    break_end_time: clinicDay.lunch_end_time || null,
                    is_using_global: true
                };
            }
        } else {
            // Custom Mode: Use the specific row for today if it marks them as working
            if (todayRow && todayRow.is_working) {
                effectiveSchedule = todayRow;
            }
        }

        if (effectiveSchedule) {
            dentistSchedules.push(effectiveSchedule);
        }
    });

    if (dentistSchedules.length === 0) {
        return handleNoSlots(
            date,
            service.name,
            durationMinutes,
            'No dentists working on this day.',
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    // ── 4. Check dentist availability blocks (leave, sick, etc.) ──
    const { data: blocks } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .select('dentist_id, start_time, end_time')
        .eq('block_date', date);

    // Filter out dentists who are blocked for the ENTIRE day (no start/end time)
    const fullDayBlockedIds = (blocks || [])
        .filter((b) => !b.start_time && !b.end_time)
        .map((b) => b.dentist_id);

    const activeSchedules = dentistSchedules.filter(
        (s) => !fullDayBlockedIds.includes(s.dentist_id),
    );

    if (activeSchedules.length === 0) {
        return handleNoSlots(
            date,
            service.name,
            durationMinutes,
            'No dentists available on this day (blocked/on leave).',
            serviceId,
            filterSessionId,
            skipNextSearch,
            dentistId,
            excludeAppointmentId
        );
    }

    // ── 5. Get existing appointments on that date (not cancelled) ──
    // ✅ NOTE: Waitlist entries are in a separate table (waitlist), not appointments.
    // So we don't need to filter for WAITLISTED status — appointments only include
    // PENDING (awaiting approval) or CONFIRMED (secured slots).
    let apptQuery = supabaseAdmin
        .from('appointments')
        .select('id, dentist_id, start_time, end_time')
        .in('dentist_id', dentistIds)
        .eq('appointment_date', date)
        .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED']);

    if (excludeAppointmentId) {
        apptQuery = apptQuery.neq('id', excludeAppointmentId);
    }
    const { data: existingAppointments } = await apptQuery;

    // ── 5b. Get active slot holds on that date (GLOBAL capacity check) ──
    let holdQuery = supabaseAdmin
        .from('slot_holds')
        .select('start_time, service:services(duration_minutes), user_session_id')
        .eq('appointment_date', date)
        .eq('status', 'active')
        .gt('expires_at', now.toISOString());

    if (filterSessionId) {
        holdQuery = holdQuery.neq('user_session_id', filterSessionId);
    }
    const { data: activeHolds } = await holdQuery;

    // Combine appointments for dentist-specific occupied list
    const existingAppts = (existingAppointments || []).map((a) => ({
        start_time: a.start_time,
        end_time: a.end_time,
        dentist_id: a.dentist_id,
    }));

    // ── 6. Generate ALL possible time slots from union of schedules ──
    const clinicStartTime = activeSchedules.reduce(
        (min, s) => (s.start_time < min ? s.start_time : min),
        activeSchedules[0].start_time,
    );
    const clinicEndTime = activeSchedules.reduce(
        (max, s) => (s.end_time > max ? s.end_time : max),
        activeSchedules[0].end_time,
    );

    const allPossibleSlots = generateTimeSlots(clinicStartTime, clinicEndTime, durationMinutes);

    // ── 7. For each possible slot, count how many dentists have it available ──
    const allSlots = new Map(); // Map to store {time: {time, available}}

    // Initialize all slots with 0 available
    allPossibleSlots.forEach((slot) => {
        allSlots.set(slot, { time: slot, available: 0 });
    });

    // For each dentist, increment the available count for their free slots
    for (const schedule of activeSchedules) {
        const dentistId = schedule.dentist_id;
        const dentistStartTime = schedule.start_time;
        const dentistEndTime = schedule.end_time;

        // Get this dentist's partial blocks
        const dentistBlocks = (blocks || []).filter(
            (b) => b.dentist_id === dentistId && (b.start_time || b.end_time),
        );

        // Get this dentist's existing appointments
        const dentistAppts = existingAppts.filter((a) => a.dentist_id === dentistId);

        // Generate all possible slots for this dentist
        const possibleSlots = generateTimeSlots(dentistStartTime, dentistEndTime, durationMinutes);

        const freeSlots = possibleSlots.filter((slot) => {
            const slotEnd = addMinutesToTime(slot, durationMinutes);

            // Check if this slot overlaps with any existing appointment
            const hasAppointmentConflict = dentistAppts.some((appt) =>
                timesOverlap(slot, slotEnd, appt.start_time, appt.end_time),
            );
            if (hasAppointmentConflict) return false;

            // Check if this slot violates the booking lead time
            const requestedD = new Date(date);
            const todayD = new Date();
            todayD.setHours(0, 0, 0, 0);
            
            const minAllowedD = new Date(todayD);
            minAllowedD.setDate(minAllowedD.getDate() + leadTimeDays);
            
            if (requestedD < minAllowedD) return false;

            // Check if this slot overlaps with the clinic-wide lunch break
            if (clinicDay.lunch_start_time && clinicDay.lunch_end_time) {
                if (timesOverlap(slot, slotEnd, clinicDay.lunch_start_time, clinicDay.lunch_end_time)) {
                    return false;
                }
            }

            // Check if this slot overlaps with any partial day block (leave/training)
            const hasBlockConflict = dentistBlocks.some((block) => {
                const bStart = block.start_time || '00:00';
                const bEnd = block.end_time || '23:59';
                return timesOverlap(slot, slotEnd, bStart, bEnd);
            });
            if (hasBlockConflict) return false;

            // Check if this slot overlaps with the dentist's recurring break
            if (schedule.break_start_time && schedule.break_end_time) {
                if (timesOverlap(slot, slotEnd, schedule.break_start_time, schedule.break_end_time)) {
                    return false;
                }
            }

            return true;
        });

        // Increment availability count for this dentist's free slots
        freeSlots.forEach((slot) => {
            if (allSlots.has(slot)) {
                allSlots.get(slot).available += 1;
            }
        });
    }

    // ── 7b. Subtract holds from available count (GLOBAL clinic capacity) ──
    const holdUnits = (activeHolds || []).map((h) => ({
        start_time: h.start_time,
        end_time: addMinutesToTime(h.start_time, h.service.duration_minutes),
    }));

    sortedHoldSlots: for (const slot of allSlots.keys()) {
        const slotEnd = addMinutesToTime(slot, durationMinutes);
        const holdCount = holdUnits.filter((hold) =>
            timesOverlap(slot, slotEnd, hold.start_time, hold.end_time),
        ).length;

        if (holdCount > 0) {
            const slotData = allSlots.get(slot);
            slotData.available = Math.max(0, slotData.available - holdCount);
        }
    }

    // ── 8. Sort and build response with all slots ──
    const sortedSlots = Array.from(allSlots.values()).sort((a, b) => a.time.localeCompare(b.time));

    const totalAvailable = sortedSlots.filter((s) => s.available > 0).length;
    const totalFull = sortedSlots.filter((s) => s.available === 0).length;

    const response = {
        all_slots: sortedSlots,
        date,
        service: service.name,
        duration_minutes: durationMinutes,
        total_available: totalAvailable,
        total_full: totalFull,
    };

    // ✅ If no slots available, find the next available date (unless we are already searching)
    if (totalAvailable === 0 && !skipNextSearch) {
        response.next_available_date = await findNextAvailableDate(
            date,
            serviceId,
            filterSessionId,
            dentistId,
            excludeAppointmentId
        );
    }

    return response;
};

/**
 * Handle returns when no slots are available (unifies the suggestion logic)
 */
async function handleNoSlots(
    date,
    serviceName,
    durationMinutes,
    message,
    serviceId,
    filterSessionId,
    skipNextSearch,
    dentistId = null,
    excludeAppointmentId = null,
) {
    const response = {
        all_slots: [],
        date,
        service: serviceName,
        duration_minutes: durationMinutes,
        total_available: 0,
        total_full: 0,
        message,
    };

    if (!skipNextSearch) {
        response.next_available_date = await findNextAvailableDate(
            date,
            serviceId,
            filterSessionId,
            dentistId,
            excludeAppointmentId
        );
    }

    return response;
}

/**
 * Find the next available date with at least one free slot.
 * Searches up to 14 days into the future.
 */
export const findNextAvailableDate = async (
    startDate,
    serviceId,
    filterSessionId = null,
    dentistId = null,
    excludeAppointmentId = null,
) => {
    try {
        // 1. Get service details
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('tier, name, duration_minutes')
            .eq('id', serviceId)
            .single();
        if (!service) return null;
        const durationMinutes = service.duration_minutes;

        // 2. Get clinic open days and settings
        const [scheduleRes, settingsRes, holidaysRes] = await Promise.all([
            supabaseAdmin.from('clinic_schedule').select('*').eq('is_open', true),
            supabaseAdmin.from('clinic_settings').select('booking_max_horizon_days, booking_lead_time_hours').single(),
            supabaseAdmin.from('clinic_holidays').select('date')
        ]);

        const clinicSchedule = scheduleRes.data || [];
        const openClinicDays = new Map(clinicSchedule.map((d) => [d.day_of_week, d]));
        if (openClinicDays.size === 0) return null;

        const settings = settingsRes.data;
        const horizonDays = settings?.booking_max_horizon_days || 60;
        const leadTimeHours = settings?.booking_lead_time_hours || 24;
        const holidays = new Set((holidaysRes.data || []).map(h => h.date));

        // 3. Get QUALIFIED active dentists
        const { data: allDentists } = await supabaseAdmin
            .from('dentists')
            .select('id, tier')
            .eq('is_active', true);

        if (!allDentists || allDentists.length === 0) return null;

        const { data: dentistsWithThisService } = await supabaseAdmin
            .from('dentist_services')
            .select('dentist_id')
            .eq('service_id', serviceId);
        const serviceMatchIds = new Set((dentistsWithThisService || []).map((ds) => ds.dentist_id));

        const qualifiedDentists = allDentists.filter((d) => {
            if (dentistId && d.id !== dentistId) return false;
            
            // ✅ STRICT Skillset Check
            return serviceMatchIds.has(d.id);
        });

        if (qualifiedDentists.length === 0) return null;
        const qIds = qualifiedDentists.map((d) => d.id);

        if (qIds.length === 0) return null;

        // 4. Get ALL dentist schedule rows to detect Global vs Custom mode
        const { data: allWorkSchedules } = await supabaseAdmin
            .from('dentist_schedule')
            .select('*')
            .in('dentist_id', qIds);

        // 5. BATCH FETCH for next horizon
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + horizonDays);
        const endDateStr = end.toISOString().split('T')[0];

        const [blocksRes, apptsRes, holdsRes] = await Promise.all([
            supabaseAdmin
                .from('dentist_availability_blocks')
                .select('*')
                .in('dentist_id', qIds)
                .gte('block_date', startDate)
                .lte('block_date', endDateStr),
            supabaseAdmin
                .from('appointments')
                .select('id, dentist_id, appointment_date, start_time, end_time')
                .in('dentist_id', qIds)
                .gte('appointment_date', startDate)
                .lte('appointment_date', endDateStr)
                .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED']),
            supabaseAdmin
                .from('slot_holds')
                .select('start_time, appointment_date, service:services(duration_minutes)')
                .gte('appointment_date', startDate)
                .lte('appointment_date', endDateStr)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString()),
        ]);

        const blocks = blocksRes.data || [];
        const appts = apptsRes.data || [];
        const holds = holdsRes.data || [];

        // 6. Search forward (including start date)
        for (let i = 0; i <= horizonDays; i++) {
            const nextDate = new Date(start);
            nextDate.setDate(nextDate.getDate() + i);
            const dateStr = nextDate.toISOString().split('T')[0];
            const dayOfWeek = nextDate.getDay();

            if (!openClinicDays.has(dayOfWeek)) continue;
            if (holidays.has(dateStr)) continue;

            const clinicDay = openClinicDays.get(dayOfWeek);

            // Check each qualified dentist for this date
            for (const dId of qIds) {
                const dRows = (allWorkSchedules || []).filter(s => s.dentist_id === dId);
                const todayRow = dRows.find(s => s.day_of_week === dayOfWeek);
                const hasAnyCustomRow = dRows.some(s => s.is_using_global === false);
                
                // Respect row flag if exists, otherwise fallback to Mode
                const shouldInherit = todayRow ? (todayRow.is_using_global === true) : !hasAnyCustomRow;

                let schedule = null;
                
                if (shouldInherit) {
                    // Inherit from Clinic
                    schedule = {
                        dentist_id: dId,
                        start_time: clinicDay.open_time,
                        end_time: clinicDay.close_time,
                        break_start_time: clinicDay.lunch_start_time,
                        break_end_time: clinicDay.lunch_end_time
                    };
                } else {
                    // Custom Mode: Use the specific row for today if it marks them as working
                    if (todayRow && todayRow.is_working) {
                        schedule = todayRow;
                    }
                }

                if (!schedule) continue;

                // Check blocks
                const isFullBlocked = blocks.some(
                    (b) => b.dentist_id === dId && b.block_date === dateStr && !b.start_time,
                );
                if (isFullBlocked) continue;

                const dailyBlocks = blocks.filter(
                    (b) => b.dentist_id === dId && b.block_date === dateStr && b.start_time,
                );
                const dailyAppts = appts.filter(
                    (a) => a.dentist_id === dId && a.appointment_date === dateStr,
                );
                const dailyHolds = holds.filter((h) => h.appointment_date === dateStr);

                // Quick slot check for this doctor
                const possible = generateTimeSlots(
                    schedule.start_time,
                    schedule.end_time,
                    durationMinutes,
                );

                const hasFree = possible.some((slot) => {
                    const slotEnd = addMinutesToTime(slot, durationMinutes);

                    // Appointment conflict
                    if (
                        dailyAppts.some((a) => timesOverlap(slot, slotEnd, a.start_time, a.end_time))
                    )
                        return false;

                    // Lead time conflict
                    const slotDateTime = new Date(`${dateStr}T${slot}:00`);
                    const leadTimeLimit = new Date(Date.now() + leadTimeHours * 60 * 60 * 1000);
                    if (slotDateTime < leadTimeLimit) return false;

                    // Clinic Lunch break conflict
                    if (clinicDay.lunch_start_time && clinicDay.lunch_end_time) {
                        if (timesOverlap(slot, slotEnd, clinicDay.lunch_start_time, clinicDay.lunch_end_time)) {
                            return false;
                        }
                    }

                    // Block conflict
                    if (
                        dailyBlocks.some((b) =>
                            timesOverlap(slot, slotEnd, b.start_time || '00:00', b.end_time || '23:59'),
                        )
                    )
                        return false;

                    // Break conflict
                    if (
                        schedule.break_start_time &&
                        schedule.break_end_time &&
                        timesOverlap(
                            slot,
                            slotEnd,
                            schedule.break_start_time,
                            schedule.break_end_time,
                        )
                    )
                        return false;

                    // Capacity/Hold check (Global)
                    const holdCount = dailyHolds.filter((h) =>
                        timesOverlap(
                            slot,
                            slotEnd,
                            h.start_time,
                            addMinutesToTime(h.start_time, h.service.duration_minutes),
                        ),
                    ).length;

                    // We need to know current possible availability for this slot across ALL doctors to accurately subtract HOLDS.
                    // But for findNextAvailableDate, we just need to know if ONE slot is free.
                    // So we check if (available_doctors_for_this_slot - total_holds_for_this_slot) > 0.
                    // This is slightly complex in-memory without rebuilding the whole map.

                    // Simple heuristic: if there's no hold, it's free. If there's a hold, skip for now.
                    if (holdCount > 0) return false;

                    return true;
                });

                if (hasFree) return dateStr;
            }
        }
    } catch (err) {
        console.error('Error in findNextAvailableDate:', err);
    }
    return null;
};

/**
 * Get suggested alternative slots when the requested time is not available.
 * Looks at the same day and nearby days.
 */

/*
SAMPLE DATA THAT WILL BE RETURNED
{
  same_day_alternatives: [
    { time: "13:30", date: "2026-02-20", diff: 30 },
    { time: "15:00", date: "2026-02-20", diff: 60 },
    { time: "16:00", date: "2026-02-20", diff: 120 },
    { time: "11:00", date: "2026-02-20", diff: 180 },
    { time: "10:00", date: "2026-02-20", diff: 240 }
  ],
  next_days_alternatives: [
    { time: "14:30", date: "2026-02-21", diff: 30 },
    { time: "15:30", date: "2026-02-21", diff: 90 },
    { time: "09:00", date: "2026-02-21", diff: 300 },
    { time: "14:15", date: "2026-02-22", diff: 15 },
    { time: "13:00", date: "2026-02-22", diff: 60 },
    { time: "12:00", date: "2026-02-22", diff: 120 },
    { time: "14:45", date: "2026-02-23", diff: 45 },
    { time: "11:30", date: "2026-02-23", diff: 150 },
    { time: "10:30", date: "2026-02-23", diff: 210 }
  ],
  message: "The requested slot is not available. Here are alternatives:"
}
*/

export const getSuggestedSlots = async (date, serviceId, requestedTime) => {
    // Get slots for the same day
    const sameDayResult = await getAvailableSlots(date, serviceId);

    // Find nearby times (closest to what they wanted) - only from available slots
    const nearbySlots = sameDayResult.all_slots
        .filter((s) => s.available > 0) // Only available slots for suggestions
        .map((slot) => ({
            time: slot.time,
            date: date,
            diff: Math.abs(timeToMinutes(slot.time) - timeToMinutes(requestedTime)),
        }))
        .sort((a, b) => a.diff - b.diff)
        .slice(0, 5); // Top 5 closest times

    // Also check next 3 days
    const nextDaySlots = [];
    for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + i);
        const dateStr = nextDate.toISOString().split('T')[0];

        try {
            const result = await getAvailableSlots(dateStr, serviceId);
            if (result.all_slots.length > 0) {
                // Find slots near the requested time on that day (only available ones)
                const nearSlots = result.all_slots
                    .filter((s) => s.available > 0) // Only available slots
                    .map((slot) => ({
                        time: slot.time,
                        date: dateStr,
                        diff: Math.abs(timeToMinutes(slot.time) - timeToMinutes(requestedTime)),
                    }))
                    .sort((a, b) => a.diff - b.diff)
                    .slice(0, 3);

                nextDaySlots.push(...nearSlots);
            }
        } catch (e) {
            // Skip days that error
        }
    }

    return {
        same_day_alternatives: nearbySlots,
        next_days_alternatives: nextDaySlots,
        message: 'The requested slot is not available. Here are alternatives:',
    };
};
/**
 * Quick status check for a service to see if it's bookable.
 * Used for early validation in the booking wizard.
 */
export const getServiceAvailabilityStatus = async (serviceId, dentistId = null) => {
    // 1. Identify ACTIVE doctors who HAVE this service explicitly
    const { data: dentistsWithThisService } = await supabaseAdmin
        .from('dentist_services')
        .select(`
            dentist_id,
            dentists!inner(is_active)
        `)
        .eq('service_id', serviceId)
        .eq('dentists.is_active', true);

    const serviceMatchIds = (dentistsWithThisService || []).map((ds) => ds.dentist_id).filter(id => !!id);

    let matchIds = [];
    if (dentistId) {
        // Specific doctor requested
        if (serviceMatchIds.includes(dentistId)) {
            matchIds = [dentistId];
        }
    } else {
        // Any available doctor
        matchIds = serviceMatchIds;
    }

    if (matchIds.length === 0) {
        return {
            is_bookable: false,
            reason: 'NO_DOCTORS',
            message: 'No doctors currently offer this service.',
        };
    }

    // 2. Determine Working Days for matched doctors
    const { data: clinicDays } = await supabaseAdmin
        .from('clinic_schedule')
        .select('day_of_week')
        .eq('is_open', true);
    const globalWorkingDays = clinicDays ? clinicDays.map(c => c.day_of_week) : [];

    const { data: allSchedules } = await supabaseAdmin
        .from('dentist_schedule')
        .select('dentist_id, day_of_week, is_working, is_using_global')
        .in('dentist_id', matchIds);

    const workingDaysSet = new Set();

    matchIds.forEach(dId => {
        const dSchedules = (allSchedules || []).filter(s => s.dentist_id === dId);
        const hasAnyCustomRow = dSchedules.some(s => s.is_using_global === false);

        // Check each of the 7 days
        for (let dow = 0; dow <= 6; dow++) {
            const todayRow = dSchedules.find(s => s.day_of_week === dow);
            
            // Respect row flag if exists, otherwise fallback to Mode
            const shouldInherit = todayRow ? (todayRow.is_using_global === true) : !hasAnyCustomRow;

            if (shouldInherit) {
                // Inherit if clinic is open
                if (globalWorkingDays.includes(dow)) workingDaysSet.add(dow);
            } else {
                // Custom Mode: Only include if explicitly marked as is_working
                if (todayRow && todayRow.is_working) {
                    workingDaysSet.add(dow);
                }
            }
        }
    });

    const workingDays = Array.from(workingDaysSet);
    
    // 2b. Map how many doctors work each day of the week
    const scheduledDoctorsPerDay = {}; // { dow: count }
    (allSchedules || []).forEach(s => {
        if (s.is_working) {
            scheduledDoctorsPerDay[s.day_of_week] = (scheduledDoctorsPerDay[s.day_of_week] || 0) + 1;
        }
    });

    // 3. Find fully blocked dates
    const horizon = 90;
    const start = new Date();
    start.setHours(0,0,0,0);
    
    const { data: allBlocks } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .select('dentist_id, block_date')
        .in('dentist_id', matchIds)
        .is('start_time', null)
        .is('end_time', null)
        .gte('block_date', start.toISOString().split('T')[0])
        .lte('block_date', new Date(start.getTime() + horizon * 86400000).toISOString().split('T')[0]);

    const blockedDates = [];
    const dateBlockMap = {}; // { '2026-05-04': Set([dentistId1, dentistId2]) }

    (allBlocks || []).forEach(b => {
        if (!dateBlockMap[b.block_date]) dateBlockMap[b.block_date] = new Set();
        dateBlockMap[b.block_date].add(b.dentist_id);
    });

    Object.keys(dateBlockMap).forEach(date => {
        const dateObj = new Date(date);
        const dow = dateObj.getDay();
        const requiredBlocks = scheduledDoctorsPerDay[dow] || 0;
        
        // If the number of blocks >= the number of people who normally work this day
        if (requiredBlocks > 0 && dateBlockMap[date].size >= requiredBlocks) {
            blockedDates.push(date);
        }
    });

    // 4. Find next available date (search up to 90 days)
    const todayStr = new Date().toISOString().split('T')[0];
    const nextDate = await findNextAvailableDate(todayStr, serviceId, null, dentistId);

    if (!nextDate) {
        return {
            is_bookable: false,
            reason: 'NO_SLOTS',
            message: 'This service is fully booked for the next 90 days.',
            dentist_count: matchIds.length,
            working_days: [],
            blocked_dates: blockedDates
        };
    }

    return {
        is_bookable: true,
        next_available_date: nextDate,
        dentist_count: matchIds.length,
        working_days: workingDays,
        blocked_dates: blockedDates
    };
};

// ──────────────────────────────────────────────────
// END OF FILE
// ──────────────────────────────────────────────────
