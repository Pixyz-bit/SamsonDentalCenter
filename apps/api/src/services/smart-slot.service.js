import { AppError } from '../utils/errors.js';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get the emergency buffer slot for a given date.
 * The buffer is the LAST slot of the day (e.g., 16:30-17:00).
 * Reserved for urgent/emergency cases only.
 *
 * @param {string} date - 'YYYY-MM-DD'
 * @returns {object} { slot_time, is_reserved, emergency_contact }
 */
export const getEmergencyBuffer = async (date) => {
    const dayOfWeek = new Date(date).getDay();

    // Get clinic closing time
    const { data: clinicDay } = await supabaseAdmin
        .from('clinic_schedule')
        .select('end_time')
        .eq('day_of_week', dayOfWeek)
        .single();

    if (!clinicDay) {
        return { available: false, reason: 'Clinic closed on this day.' };
    }

    // Buffer slot = 30 minutes before closing
    const endMinutes = timeToMinutes(clinicDay.end_time);
    const bufferStart = minutesToTime(endMinutes - 30);
    const bufferEnd = clinicDay.end_time;

    // Check if emergency slot has already been booked
    const { data: emergencyAppt } = await supabaseAdmin
        .from('appointments')
        .select('id, patient_id, status, patient:profiles(full_name, first_name, last_name, middle_name, suffix, phone)')
        .eq('appointment_date', date)
        .eq('start_time', bufferStart)
        .notIn('status', ['CANCELLED', 'RESCHEDULED', 'DISPLACED']);

    const isReserved = !emergencyAppt || emergencyAppt.length === 0;

    return {
        date,
        buffer_slot: { start: bufferStart, end: bufferEnd, duration_minutes: 30 },
        is_reserved: isReserved,
        status: isReserved ? 'Available for emergencies' : 'Booked',
        current_booking: emergencyAppt?.[0] || null,
        message: isReserved
            ? 'Emergency slot available. Contact supervisor to book.'
            : `Booked by: ${emergencyAppt[0].patient?.first_name ? `${emergencyAppt[0].patient.last_name}, ${emergencyAppt[0].patient.first_name}` : (emergencyAppt[0].patient?.full_name || 'Guest')}`,
    };
};

/**
 * Analyze no-show risk for a potential booking.
 * Returns a risk score (0-100) based on historical patterns.
 *
 * @param {string} patientId - Patient UUID
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} time - 'HH:MM'
 * @returns {object} { risk_score, risk_level, factors }
 */
export const analyzeNoShowRisk = async (patientId, date, time) => {
    let riskScore = 0;
    const factors = [];

    // ── Factor 1: Patient's historical no-show rate ──
    const { data: patientHistory } = await supabaseAdmin
        .from('appointments')
        .select('status')
        .eq('patient_id', patientId)
        .notIn('status', ['CANCELLED', 'RESCHEDULED', 'DISPLACED']);

    if (patientHistory && patientHistory.length > 0) {
        const noShows = patientHistory.filter((a) => a.status === 'NO_SHOW').length;
        const noShowRate = noShows / patientHistory.length;

        if (noShowRate > 0.3) {
            riskScore += 40;
            factors.push('Patient has high no-show history (>30%)');
        } else if (noShowRate > 0.15) {
            riskScore += 20;
            factors.push('Patient has moderate no-show history');
        }
    } else {
        riskScore += 5;
        factors.push('New patient (no history)');
    }

    // ── Factor 2: Day of week ──
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (['Friday', 'Saturday', 'Sunday'].includes(dayOfWeek)) {
        riskScore += 15;
        factors.push(`Booking on ${dayOfWeek} (higher no-show risk)`);
    }

    // ── Factor 3: Time of day ──
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 15 || hour < 9) {
        riskScore += 10;
        factors.push('Late afternoon/early morning appointment (higher no-show risk)');
    }

    // ── Factor 4: Booking advance ──
    const daysUntilAppt = Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilAppt > 30) {
        riskScore += 5;
        factors.push('Booking far in advance (>30 days)');
    } else if (daysUntilAppt < 1) {
        riskScore += 20;
        factors.push('Same-day or next-day booking (high-risk)');
    }

    const riskLevel = riskScore <= 25 ? 'LOW' : riskScore <= 50 ? 'MEDIUM' : 'HIGH';

    return {
        patient_id: patientId,
        appointment: { date, time },
        risk_score: Math.min(100, riskScore),
        risk_level: riskLevel,
        factors,
        recommendation:
            riskLevel === 'HIGH'
                ? 'Consider SMS reminder 24h before, or suggest earlier time slot'
                : 'Standard reminder recommended',
    };
};

/**
 * Suggest optimal slots based on dentist load balancing.
 * Returns slots ordered by how well they balance the schedule.
 *
 * @param {string} date - 'YYYY-MM-DD'
 * @param {string} serviceId - Service UUID
 * @returns {Array} Sorted slots with load scores
 */
export const suggestOptimalSlots = async (date, serviceId) => {
    // Get service duration
    const { data: service } = await supabaseAdmin
        .from('services')
        .select('duration_minutes')
        .eq('id', serviceId)
        .single();

    if (!service) throw new AppError('Service not found.', 404);

    const dayOfWeek = new Date(date).getDay();

    // Get working dentists
    const { data: schedules } = await supabaseAdmin
        .from('dentist_schedule')
        .select('dentist_id, start_time, end_time, dentist:dentists(profile:profiles(full_name, first_name, last_name, middle_name, suffix))')
        .eq('day_of_week', dayOfWeek)
        .eq('is_working', true);

    if (!schedules || schedules.length === 0) return [];

    // Get existing bookings per dentist
    const { data: bookings } = await supabaseAdmin
        .from('appointments')
        .select('dentist_id, start_time')
        .eq('appointment_date', date)
        .notIn('status', ['CANCELLED', 'LATE_CANCEL', 'RESCHEDULED', 'DISPLACED']);

    // Count bookings per dentist per hour
    const loadMap = {}; // { dentist_id: { '09': 2, '10': 1, ... } }
    (bookings || []).forEach((b) => {
        const hour = b.start_time.split(':')[0];
        if (!loadMap[b.dentist_id]) loadMap[b.dentist_id] = {};
        loadMap[b.dentist_id][hour] = (loadMap[b.dentist_id][hour] || 0) + 1;
    });

    // Score each available slot (lower load = better score)
    const slotScores = [];
    const allHours = new Set();

    schedules.forEach((s) => {
        const startHour = parseInt(s.start_time.split(':')[0]);
        const endHour = parseInt(s.end_time.split(':')[0]);
        for (let h = startHour; h < endHour; h++) {
            allHours.add(h);
        }
    });

    for (const hour of allHours) {
        const hourStr = hour.toString().padStart(2, '0');
        let totalLoad = 0;
        let dentistsAvailable = 0;
        let availableDentists = [];

        schedules.forEach((s) => {
            const startH = parseInt(s.start_time.split(':')[0]);
            const endH = parseInt(s.end_time.split(':')[0]);
            if (hour >= startH && hour < endH) {
                dentistsAvailable++;
                const load = loadMap[s.dentist_id]?.[hourStr] || 0;
                totalLoad += load;
                availableDentists.push({
                    name: s.dentist?.profile?.first_name 
                        ? `${s.dentist.profile.last_name}, ${s.dentist.profile.first_name}` 
                        : (s.dentist?.profile?.full_name || 'Dr. Unknown'),
                    current_load: load,
                });
            }
        });

        const avgLoad = dentistsAvailable > 0 ? totalLoad / dentistsAvailable : 999;

        slotScores.push({
            time: `${hourStr}:00`,
            dentists_available: dentistsAvailable,
            current_total_load: totalLoad,
            avg_load_per_dentist: avgLoad.toFixed(1),
            dentist_details: availableDentists,
            recommendation: avgLoad < 0.5 ? '🟢 Optimal' : avgLoad < 1 ? '🟡 Good' : '🟠 Busy',
        });
    }

    // Sort by average load (least busy first)
    return slotScores.sort(
        (a, b) => parseFloat(a.avg_load_per_dentist) - parseFloat(b.avg_load_per_dentist),
    );
};

// ── Helpers ──

function timeToMinutes(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, '0');
    const mins = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
}
