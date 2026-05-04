import { supabaseAdmin } from '../config/supabase.js';

/**
 * Auto-assign the best available dentist for a given date and time slot.
 *
 * Strategy: "Tier Filter + Least Busy"
 *   1. Filter dentists by service tier (general → general/both, specialized → specialized/both)
 *   2. Among matching dentists, find who works on that day
 *   3. Remove dentists already booked at that time
 *   4. Pick the least busy one
 *
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} startTime - 'HH:MM'
 * @param {string} endTime - 'HH:MM'
 * @param {string} serviceTier - 'general' or 'specialized' (default: 'general')
 * @returns {string|null} dentist ID or null if nobody is free
 */
export const assignDentist = async (date, startTime, endTime, serviceTier = 'general', filterSessionId = null, serviceId = null) => {
    // ── 1. Get all active dentists ──
    const { data: allDentists, error: dError } = await supabaseAdmin
        .from('dentists')
        .select('id, tier')
        .eq('is_active', true);

    if (dError || !allDentists || allDentists.length === 0) return null;
    
    // Create a map for quick tier lookups
    const dentistTierMap = allDentists.reduce((acc, d) => {
        acc[d.id] = d.tier;
        return acc;
    }, {});

    const dayOfWeek = new Date(date).getDay();

    // ── 2. Get Skillset Data ──
    // Get dentists who have ANY explicit skills listed
    const { data: dentistsWithSkills } = await supabaseAdmin
        .from('dentist_services')
        .select('dentist_id');
    const skilledDentistIds = new Set((dentistsWithSkills || []).map(ds => ds.dentist_id));

    // Get dentists who explicitly have THIS service skill (if serviceId is provided)
    let serviceMatchIds = new Set();
    if (serviceId) {
        const { data: dentistsWithThisService } = await supabaseAdmin
            .from('dentist_services')
            .select('dentist_id')
            .eq('service_id', serviceId);
        serviceMatchIds = new Set((dentistsWithThisService || []).map(ds => ds.dentist_id));
    }

    // ── 3. Filter dentists qualified for this service ──
    const qualifiedDentistIds = allDentists
        .filter(d => {
            if (serviceId && skilledDentistIds.has(d.id)) {
                // ENROLLED in granular system: must have explicit match
                return serviceMatchIds.has(d.id);
            } else {
                // LEGACY/FALLBACK: Match by tier
                const tierMatches = serviceTier === 'specialized' 
                    ? ['specialized', 'both'].includes(d.tier)
                    : ['general', 'both'].includes(d.tier);
                return tierMatches;
            }
        })
        .map(d => d.id);

    if (qualifiedDentistIds.length === 0) return null;

    // ── 4. Get which of those dentists work on this day ──
    const { data: workingDentists } = await supabaseAdmin
        .from('dentist_schedule')
        .select('dentist_id, start_time, end_time, break_start_time, break_end_time')
        .in('dentist_id', qualifiedDentistIds)
        .eq('day_of_week', dayOfWeek)
        .eq('is_working', true);

    if (!workingDentists || workingDentists.length === 0) {
        return null; // No matching dentists working
    }

    // ── 5. Filter: dentist's shift must cover the requested time, AND not be on break ──
    const eligibleDentists = workingDentists.filter((ds) => {
        // Normalize DB 'HH:MM:SS' to 'HH:MM' for reliable string comparison
        const dsStart = ds.start_time.slice(0, 5);
        const dsEnd = ds.end_time.slice(0, 5);
        
        const isWithinShift = dsStart <= startTime && dsEnd >= endTime;
        if (!isWithinShift) return false;

        // Check if requested time overlaps with their break
        if (ds.break_start_time && ds.break_end_time) {
            const bStart = ds.break_start_time.slice(0, 5);
            const bEnd = ds.break_end_time.slice(0, 5);
            // Overlap: requestedStart < breakEnd && breakStart < requestedEnd
            if (startTime < bEnd && bStart < endTime) {
                return false;
            }
        }
        
        return true;
    });

    if (eligibleDentists.length === 0) {
        return null; // No dentist covers this time
    }

    // ── 4. Check which of these dentists are NOT booked at this time ──
    const eligibleDentistIds = eligibleDentists.map((d) => d.dentist_id);

    // Check dentist availability blocks (leave, sick, etc.)
    const { data: blocks } = await supabaseAdmin
        .from('dentist_availability_blocks')
        .select('dentist_id, start_time, end_time')
        .eq('block_date', date)
        .in('dentist_id', eligibleDentistIds);

    const dentistBlockMap = (blocks || []).reduce((acc, b) => {
        if (!acc[b.dentist_id]) acc[b.dentist_id] = [];
        acc[b.dentist_id].push(b);
        return acc;
    }, {});

    const unblockedDentistIds = eligibleDentistIds.filter((id) => {
        const dBlocks = dentistBlockMap[id] || [];
        // A dentist is blocked if they have a block spanning THIS specific requested time
        const hasConflict = dBlocks.some(b => {
            const bStart = (b.start_time || '00:00').slice(0, 5);
            const bEnd = (b.end_time || '23:59').slice(0, 5);
            // Start1 < End2 && Start2 < End1
            return startTime < bEnd && bStart < endTime;
        });
        return !hasConflict;
    });

    if (unblockedDentistIds.length === 0) {
        return null; // All matching dentists working this day are blocked at this specific time
    }

    const { data: conflictingAppointments } = await supabaseAdmin
        .from('appointments')
        .select('dentist_id')
        .eq('appointment_date', date)
        .not('status', 'in', '("CANCELLED","LATE_CANCEL","RESCHEDULED","DISPLACED")')
        .in('dentist_id', unblockedDentistIds)
        .lt('start_time', endTime)
        .gt('end_time', startTime);

    const busyByAppointmentIds = (conflictingAppointments || []).map((a) => a.dentist_id);
    
    // ✅ NEW: Check which of these dentists are HELD at this time
    let holdQuery = supabaseAdmin
        .from('slot_holds')
        .select('dentist_id')
        .eq('appointment_date', date)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .in('dentist_id', unblockedDentistIds)
        .lt('start_time', endTime)
        .gt('end_time', startTime);
    
    if (filterSessionId) {
        holdQuery = holdQuery.neq('user_session_id', filterSessionId);
    }
    
    const { data: conflictingHolds } = await holdQuery;
    
    const busyByHoldIds = (conflictingHolds || [])
        .filter(h => h.dentist_id !== null)
        .map((h) => h.dentist_id);

    const freeDentists = unblockedDentistIds.filter(
        (id) => !busyByAppointmentIds.includes(id) && !busyByHoldIds.includes(id)
    );

    if (freeDentists.length === 0) {
        return null; // All dentists booked at this time
    }

    // ── 5. Among free dentists, pick based on PRIORITY then LEAST BUSY ──
    // Priority Rank: 0 (Match), 1 (Both)
    const getPriorityRank = (dentistId) => {
        const tier = dentistTierMap[dentistId];
        if (tier === serviceTier) return 0; // Perfect match (general->general or specialized->specialized)
        if (tier === 'both') return 1; // "Both" is secondary
        return 2; // Fallback
    };

    const { data: dayCounts } = await supabaseAdmin
        .from('appointments')
        .select('dentist_id')
        .eq('appointment_date', date)
        .not('status', 'in', '("CANCELLED","LATE_CANCEL","RESCHEDULED","DISPLACED")')
        .in('dentist_id', freeDentists);

    // Count appointments per dentist
    const countMap = {};
    freeDentists.forEach((id) => {
        countMap[id] = 0;
    });
    (dayCounts || []).forEach((a) => {
        if (countMap[a.dentist_id] !== undefined) {
            countMap[a.dentist_id]++;
        }
    });

    // Sort by: 1. Priority Rank (Match > Both), 2. Appointment count (Least busy)
    const candidates = freeDentists.map((id) => ({
        id,
        rank: getPriorityRank(id),
        count: countMap[id],
    }));

    candidates.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.count !== b.count) return a.count - b.count;
        return Math.random() - 0.5; // ✅ Randomize among equal candidates to avoid concurrent collisions
    });

    return candidates[0].id;
};
