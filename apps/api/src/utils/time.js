/**
 * Centralized time utility functions
 */

/**
 * Convert "HH:MM" or "HH:MM:SS" string to total minutes since midnight.
 * Example: timeToMinutes('09:30') → 570
 */
export function timeToMinutes(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Convert minutes since midnight to "HH:MM" string.
 * Example: minutesToTime(570) → '09:30'
 */
export function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, '0');
    const mins = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${mins}`;
}

/**
 * Add minutes to a time string.
 * Example: addMinutesToTime('09:00', 30) → '09:30'
 */
export function addMinutesToTime(timeStr, minutes) {
    return minutesToTime(timeToMinutes(timeStr) + minutes);
}

/**
 * Generate time slots between start and end with given interval.
 * Example: generateTimeSlots('08:00', '12:00', 30)
 *   → ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30']
 */
export function generateTimeSlots(startTime, endTime, intervalMinutes) {
    const slots = [];
    let currentMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime) - intervalMinutes; // Last slot must END before closing

    while (currentMinutes <= endMinutes) {
        slots.push(minutesToTime(currentMinutes));
        currentMinutes += intervalMinutes;
    }

    return slots;
}

/**
 * Check if two time ranges overlap.
 * Example: timesOverlap('09:00', '09:30', '09:00', '09:30') → true (exact same time)
 * Example: timesOverlap('09:00', '09:30', '09:30', '10:00') → false (back to back is OK)
 */
export function timesOverlap(start1, end1, start2, end2) {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    return s1 < e2 && s2 < e1;
}

/**
 * Format date from 'YYYY-MM-DD' to 'Month Day, Year'
 */
export function formatDateLong(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Format time from 'HH:MM:SS' or 'HH:MM' to 'h:mm AM/PM'
 */
export function formatTimePretty(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${minutes} ${ampm}`;
}

/**
 * Format a date and time range nicely.
 * Result: "May 20, 2026 from 10:00 AM to 11:00 AM"
 */
export function formatDateTimeRange(date, startTime, endTime) {
    const d = formatDateLong(date);
    const s = formatTimePretty(startTime);
    if (!endTime) return `${d} at ${s}`;
    const e = formatTimePretty(endTime);
    return `${d} from ${s} to ${e}`;
}
