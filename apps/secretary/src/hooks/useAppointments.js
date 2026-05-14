import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/**
 * Fetches the current patient's appointments from the backend.
 *
 * Backend endpoint: GET /api/v1/appointments/my
 * Query params: status, page, limit, sort
 *
 * Status map (backend → display):
 *   CONFIRMED     → Approved
 *   PENDING       → Pending
 *   CANCELLED     → Cancelled
 *   LATE_CANCEL   → Cancelled
 *   COMPLETED     → Completed
 *   NO_SHOW       → Missed
 */

// --- Utility helpers ---

export const STATUS_LABEL = {
    CONFIRMED: 'Approved',
    PENDING: 'Pending',
    CANCELLED: 'Cancelled',
    LATE_CANCEL: 'Cancelled',
    COMPLETED: 'Completed',
    NO_SHOW: 'Missed',
    IN_PROGRESS: 'In Progress',
    WAITLISTED: 'Waitlisted',
    DISPLACED: 'Displaced',
};

export const STATUS_COLOR = {
    Upcoming: 'info',
    Pending: 'warning',
    Cancelled: 'error',
    Completed: 'success',
    Missed: 'error',
    'In Progress': 'warning',
    Waitlisted: 'warning',
    Displaced: 'secondary',
};

/**
 * Format a date string 'YYYY-MM-DD' → 'Oct 24, 2024'
 */
export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Parse as local date to avoid UTC offset shifting the day
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Format a time string 'HH:MM:SS' or 'HH:MM' → '10:00 AM'
 */
export const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const period = hour >= 12 ? 'PM' : 'AM';
    const display = hour % 12 || 12;
    return `${display}:${minute} ${period}`;
};

/**
 * Format an ISO timestamp string → 'Oct 24, 2024, 10:00 AM'
 */
export const formatFullDateTime = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
};

// --- Hook ---

const DEFAULT_LIMIT = 5;

const useAppointments = ({ 
    status = '', 
    dentistId = '', 
    serviceTier = '',
    search = '',
    date = '',
    sort = 'desc', 
    limit = 20 
} = {}) => {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const fetch = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page, limit, sort });
            if (status && status !== 'All Statuses') {
                // Map frontend labels to backend constants if needed
                // But typically we pass the internal key
                params.set('status', status);
            }
            if (dentistId && dentistId !== 'All Doctors') params.set('dentist_id', dentistId);
            if (serviceTier && serviceTier !== 'All Services') params.set('tier', serviceTier);
            if (search) params.set('search', search);
            if (date) params.set('date', date);

            const data = await api.get(`/admin/appointments?${params}`, token);

            setAppointments(data.appointments || []);
            // Backend returns pagination.total
            setTotal(data.pagination?.total || data.total || 0);
        } catch (err) {
            setError(err.message || 'Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    }, [token, status, dentistId, serviceTier, search, date, sort, page, limit]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const [actionLoading, setActionLoading] = useState(false);

    const updateAppointment = useCallback(async (id, updates) => {
        if (!token) return { success: false, error: 'Not authenticated' };
        setActionLoading(true);
        try {
            const data = await api.patch(`/admin/appointments/${id}`, updates, token);
            await fetch(); // Refresh the list
            return { success: true, data };
        } catch (err) {
            return { success: false, error: err.message || 'Failed to update appointment' };
        } finally {
            setActionLoading(false);
        }
    }, [token, fetch]);

    const goToPage = useCallback((p) => setPage(p), []);
    const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
    const nextPage = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
    const refresh = useCallback(() => fetch(), [fetch]);

    return {
        appointments,
        total,
        page,
        totalPages,
        loading,
        actionLoading,
        error,
        goToPage,
        prevPage,
        nextPage,
        updateAppointment,
        refresh,
    };
};

export default useAppointments;
