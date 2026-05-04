import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/**
 * useApprovals Hook
 * Handlers specialized appointment requests and guest bookings needing approval.
 * 
 * Target endpoints:
 * - GET    /admin/appointments/pending
 * - PATCH  /admin/appointments/:id/approve
 * - PATCH  /admin/appointments/:id/reject
 */
const useApprovals = () => {
    const { token } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApprovals = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.get('/admin/appointments/pending', token);
            // Backend returns { pending_requests: [...] }
            setRequests(data.pending_requests || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch pending requests');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    const approveRequest = async (id, dentistId = null) => {
        setActionLoading(true);
        try {
            const response = await api.patch(`/admin/appointments/${id}/approve`, { dentist_id: dentistId }, token);
            await fetchApprovals(); // Refresh list
            return { success: true, ...response };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setActionLoading(false);
        }
    };

    const rejectRequest = async (id, reason, suggestedDate = null) => {
        setActionLoading(true);
        try {
            await api.patch(`/admin/appointments/${id}/reject`, { 
                reason, 
                suggested_date: suggestedDate 
            }, token);
            await fetchApprovals(); // Refresh list
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setActionLoading(false);
        }
    };

    const fetchDentistSchedule = useCallback(async (dentistId, date) => {
        if (!token || !dentistId || !date) return [];
        try {
            // Include both CONFIRMED and PENDING to show all "held" slots
            const data = await api.get(`/admin/appointments?dentist_id=${dentistId}&date=${date}`, token);
            return data.appointments || [];
        } catch (err) {
            console.error('Failed to fetch dentist schedule:', err);
            return [];
        }
    }, [token]);

    const fetchPatientStats = useCallback(async (patientId) => {
        if (!token || !patientId) return { completed: 0 };
        try {
            const data = await api.get(`/admin/patients/${patientId}/stats`, token);
            return data.stats || { completed: 0 };
        } catch (err) {
            console.error('Failed to fetch patient stats:', err);
            return { completed: 0 };
        }
    }, [token]);

    const fetchPatientHistory = useCallback(async (patientId) => {
        if (!token || !patientId) return [];
        try {
            const data = await api.get(`/admin/patients/${patientId}/appointments`, token);
            return data.appointments || [];
        } catch (err) {
            console.error('Failed to fetch patient history:', err);
            return [];
        }
    }, [token]);

    return {
        requests,
        loading,
        error,
        actionLoading,
        refresh: fetchApprovals,
        approveRequest,
        rejectRequest,
        fetchDentistSchedule,
        fetchPatientStats,
        fetchPatientHistory
    };
};

export default useApprovals;
