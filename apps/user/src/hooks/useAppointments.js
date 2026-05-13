import { useMemo, useState, useCallback, useEffect } from 'react';
import { useAppointmentState } from '../context/AppointmentContext';
import { format, parseISO, isValid, isPast, isFuture, startOfDay } from 'date-fns';

export const STATUS_LABEL = {
    CONFIRMED: 'Approved',
    PENDING: 'Pending',
    IN_PROGRESS: 'Seated',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    LATE_CANCEL: 'Late Cancel',
    NO_SHOW: 'Missed',
    WAITLISTED: 'Waitlisted',
    RESCHEDULED: 'Rescheduled',
};

// Semantic keys for Badge component and general consistency
export const STATUS_COLOR = {
    Approved: 'success',
    Pending: 'warning',
    Seated: 'info',
    Completed: 'light',
    Cancelled: 'error',
    'Late Cancel': 'error',
    Missed: 'error',
    Waitlisted: 'primary',
    Rejected: 'error',
    Rescheduled: 'light',  // neutral — it's a clean handoff, not a problem
};

export const getDisplayStatus = (status, approvalStatus, cancellationReason) => {
    // 1. Rejection is a specific case of "Terminal" in the requests context
    const appStatus = (approvalStatus || '').toLowerCase();
    if (appStatus === 'rejected') {
        return { label: 'Rejected', color: STATUS_COLOR.Rejected };
    }

    // NEW: System Displaced Override
    if (status === 'CANCELLED' && cancellationReason?.includes('SYSTEM_DISPLACED')) {
        return { label: 'Clinic Updating', color: 'warning' };
    }

    // 2. Terminal statuses always win
    const TERMINAL = ['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'COMPLETED', 'IN_PROGRESS', 'RESCHEDULED'];
    if (TERMINAL.includes((status || '').toUpperCase())) {
        const label = STATUS_LABEL[status] || status;
        return { label, color: STATUS_COLOR[label] || 'light' };
    }

    // 3. For non-terminal appointments, approval_status drives the badge
    if (appStatus === 'approved') {
        return { label: 'Approved', color: STATUS_COLOR.Approved };
    }

    // Fallback to primary status
    const label = STATUS_LABEL[status] || status;
    return {
        label,
        color: STATUS_COLOR[label] || 'light'
    };
};


export const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        let date;
        // Plain date string YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
            const [y, m, d] = dateStr.trim().split('-').map(Number);
            date = new Date(y, m - 1, d);
        } else {
            // ISO timestamp or other format
            date = new Date(dateStr.replace(' ', 'T'));
        }
        if (!isValid(date)) return dateStr;
        return format(date, 'eee, MMM d, yyyy');
    } catch (e) {
        return dateStr;
    }
};

export const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
        let date;
        if (timeStr.includes('T') || timeStr.includes(' ')) {
            date = new Date(timeStr.replace(' ', 'T'));
        } else {
            // Handle "HH:mm:ss" or "HH:mm"
            const [h, m] = timeStr.split(':');
            date = new Date();
            date.setHours(parseInt(h, 10), parseInt(m, 10), 0);
        }
        
        if (!isValid(date)) return timeStr;
        return format(date, 'h:mm aa');
    } catch (e) {
        return timeStr;
    }
};

export const formatFullDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr.replace(' ', 'T'));
        if (!isValid(date)) return dateStr;
        return format(date, 'MMM d, yyyy, h:mm aa');
    } catch (e) {
        return dateStr;
    }
};

// Alias for convenience
export const formatDateTime = formatFullDateTime;

/**
 * Hook to manage and filter appointments with strict upcoming vs history logic.
 */
export const useAppointments = ({ status = 'all', sort = 'desc', limit = 10, patientId = 'all' } = {}) => {
    const { 
        appointments: allAppointments = [], 
        loading, 
        error, 
        stats, 
        refresh 
    } = useAppointmentState();

    const [page, setPage] = useState(1);

    // Reset page when status or patient changes
    useEffect(() => {
        setPage(1);
    }, [status, patientId]);

    // Helpers for consistent filtering
    const now = new Date();
    const today = startOfDay(now);

    const isApproved = useCallback((a) => {
        const s = (a.status || '').toUpperCase();
        const as = (a.approval_status || '').toLowerCase();
        return (as === 'approved' || s === 'CONFIRMED') && !['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'RESCHEDULED', 'COMPLETED', 'IN_PROGRESS'].includes(s);
    }, []);

    const isPending = useCallback((a) => {
        const s = (a.status || '').toUpperCase();
        const as = (a.approval_status || '').toLowerCase();
        return s === 'PENDING' && as !== 'approved' && as !== 'rejected';
    }, []);

    const isRejected = useCallback((a) => (a.approval_status || '').toLowerCase() === 'rejected', []);

    const isOutdated = useCallback((a) => {
        // We use the start_time to be precise. 
        // If it's 10:00 AM and it's 10:01 AM, it's outdated if not seated.
        if (!a.date || !a.start_time) return false;
        const appointmentDate = new Date(`${a.date}T${a.start_time}`);
        return appointmentDate < now;
    }, [now]);

    const isHistoryStatus = useCallback((a) => {
        const s = (a.status || '').toUpperCase();
        const as = (a.approval_status || '').toLowerCase();
        // Terminal statuses are always history
        if (['COMPLETED', 'CANCELLED', 'LATE_CANCEL', 'NO_SHOW'].includes(s) && as !== 'rejected') return true;
        // Outdated approved appointments are also history (missed/expired)
        if (isApproved(a) && isOutdated(a)) return true;
        return false;
    }, [isApproved, isOutdated]);

    const filtered = useMemo(() => {
        let result = allAppointments;

        // 1. Patient ID Filter
        if (patientId && patientId !== 'all') {
            result = result.filter(a => a.patient_id === patientId);
        }

        // 2. Status Filter
        if (status && status !== 'all') {
            if (status === 'upcoming') {
                // Upcoming MUST be approved AND in the future
                result = result.filter(a => isApproved(a) && !isOutdated(a));
            }
            else if (status === 'requests') {
                // Requests are pending, rejected, or active approved
                result = result.filter(a => isPending(a) || isRejected(a) || (isApproved(a) && !isOutdated(a)));
            }
            else if (status === 'history') {
                result = result.filter(isHistoryStatus);
            }
            else if (status === 'pending') result = result.filter(isPending);
            else if (status === 'approved') result = result.filter(a => isApproved(a) && !isOutdated(a));
            else if (status === 'decline') result = result.filter(isRejected);
            else if (status === 'completed') result = result.filter(a => (a.status || '').toUpperCase() === 'COMPLETED');
            else if (status === 'cancel') result = result.filter(a => ['CANCELLED', 'LATE_CANCEL', 'NO_SHOW'].includes((a.status || '').toUpperCase()) && (a.approval_status || '').toLowerCase() !== 'rejected');
        }
        return [...result].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.start_time}`);
            const dateB = new Date(`${b.date}T${b.start_time}`);
            return sort === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [allAppointments, status, sort, isApproved, isPending, isRejected, isHistoryStatus, isOutdated, patientId]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
    const paginated = useMemo(() => {
        const start = (page - 1) * limit;
        return filtered.slice(start, start + limit);
    }, [filtered, page, limit]);

    const counts = useMemo(() => {
        const base = (patientId && patientId !== 'all') 
            ? allAppointments.filter(a => a.patient_id === patientId)
            : allAppointments;

        return {
            all: base.filter(a => !['CANCELLED', 'LATE_CANCEL', 'NO_SHOW', 'RESCHEDULED'].includes((a.status || '').toUpperCase())).length,
            upcoming: base.filter(a => isApproved(a) && !isOutdated(a)).length,
            requests: base.filter(a => isPending(a) || isRejected(a) || (isApproved(a) && !isOutdated(a))).length,
            approved: base.filter(isApproved).length,
            pending: base.filter(isPending).length,
            decline: base.filter(isRejected).length,
            history: base.filter(isHistoryStatus).length,
            completed: base.filter(a => (a.status || '').toUpperCase() === 'COMPLETED').length,
            cancel: base.filter(a => ['CANCELLED', 'LATE_CANCEL', 'NO_SHOW'].includes((a.status || '').toUpperCase()) && (a.approval_status || '').toLowerCase() !== 'rejected').length,
        };
    }, [allAppointments, isApproved, isPending, isRejected, isHistoryStatus, isOutdated, patientId]);

    const goToPage = useCallback((p) => setPage(p), []);
    const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
    const nextPage = useCallback((p) => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

    return {
        appointments: paginated,
        total: filtered.length,
        stats,
        counts,
        loading,
        error,
        page,
        totalPages,
        goToPage,
        prevPage,
        nextPage,
        refresh
    };
};

export default useAppointments;
