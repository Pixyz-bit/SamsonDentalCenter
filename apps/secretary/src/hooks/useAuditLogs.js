import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const useAuditLogs = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [metadata, setMetadata] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        actor_id: '',
        resource_type: '',
        action: '',
        date_from: '',
        date_to: ''
    });

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Construct query string
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/admin/audit-logs?${params.toString()}`, token);
            setLogs(response.data || []);
            setMetadata(response.metadata);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            setError(err.message || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [token, filters]);

    useEffect(() => {
        if (token) {
            fetchLogs();
        }
    }, [fetchLogs, token]);

    const updateFilter = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 on filter change
    };

    const setPage = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const getDetails = async (id) => {
        try {
            const response = await api.get(`/admin/audit-logs/${id}`, token);
            return response.data;
        } catch (err) {
            console.error('Failed to fetch log details:', err);
            throw err;
        }
    };

    return {
        logs,
        metadata,
        loading,
        error,
        filters,
        updateFilter,
        setPage,
        getDetails,
        refresh: fetchLogs
    };
};
