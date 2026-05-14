import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing doctor details and list in the secretary portal.
 */
export const useDoctors = (fetchOnMount = true) => {
    const { token } = useAuth();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Secretaries use the same endpoint as admin for clinician list usually,
            // or a specifically scoped one. Assuming same for now as requested.
            const response = await api.get('/admin/dentists', token);
            setDoctors(response.dentists || []);
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
            setError(err.message || 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (fetchOnMount && token) {
            fetchDoctors();
        }
    }, [fetchDoctors, fetchOnMount, token]);

    const fetchDoctorSchedule = useCallback(async (dentistId) => {
        try {
            const response = await api.get(`/admin/dentists/${dentistId}/schedule`, token);
            return response.schedule;
        } catch (err) {
            console.error('Failed to fetch doctor schedule:', err);
            throw err;
        }
    }, [token]);

    const updateDoctorScheduleBulk = useCallback(async (dentistId, schedules, force = false) => {
        try {
            const body = { schedules, force };
            const response = await api.post(`/admin/dentists/${dentistId}/schedule/bulk`, body, token);
            return response;
        } catch (err) {
            console.error('Failed to update doctor schedule:', err);
            throw err;
        }
    }, [token]);

    const fetchDoctorBlocks = useCallback(async (dentistId) => {
        try {
            const response = await api.get(`/admin/dentists/${dentistId}/blocks`, token);
            return response.blocks;
        } catch (err) {
            console.error('Failed to fetch doctor blocks:', err);
            throw err;
        }
    }, [token]);

    const addDoctorBlock = useCallback(async (dentistId, blockData) => {
        try {
            const response = await api.post(`/admin/dentists/${dentistId}/block`, blockData, token);
            return response;
        } catch (err) {
            console.error('Failed to add doctor block:', err);
            throw err;
        }
    }, [token]);

    const bulkAddDoctorBlocks = useCallback(async (dentistId, blocks, force = false) => {
        try {
            const body = { blocks, overwrite: force };
            const response = await api.post(`/admin/dentists/${dentistId}/block/bulk`, body, token);
            return response;
        } catch (err) {
            console.error('Failed to bulk add doctor blocks:', err);
            throw err;
        }
    }, [token]);

    const deleteDoctorBlock = useCallback(async (dentistId, blockId) => {
        try {
            const response = await api.delete(`/admin/dentists/${dentistId}/block/${blockId}`, token);
            return response;
        } catch (err) {
            console.error('Failed to remove doctor block:', err);
            throw err;
        }
    }, [token]);

    const fetchDoctorAppointments = useCallback(async (dentistId) => {
        try {
            const today = new Date().toLocaleDateString('en-CA');
            const response = await api.get(`/admin/appointments?dentist_id=${dentistId}&limit=100&date_from=${today}`, token);
            return response.appointments;
        } catch (err) {
            console.error('Failed to fetch doctor appointments:', err);
            throw err;
        }
    }, [token]);

    return {
        doctors,
        loading,
        error,
        refresh: fetchDoctors,
        fetchDoctorSchedule,
        updateDoctorScheduleBulk,
        fetchDoctorBlocks,
        addDoctorBlock,
        bulkAddDoctorBlocks,
        deleteDoctorBlock,
        fetchDoctorAppointments
    };
};
