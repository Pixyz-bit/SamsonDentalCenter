import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing doctor details and list in the admin portal.
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

    // Update Profile (bio, photo, active status, name parts)
    const updateDoctorProfile = useCallback(async (id, profileData) => {
        try {
            const response = await api.patch(`/admin/dentists/${id}/profile`, profileData, token);
            // Re-fetch to guarantee sync with DB
            await fetchDoctors();
            return response.doctor;
        } catch (err) {
            console.error('Failed to update doctor profile:', err);
            throw err;
        }
    }, [token, fetchDoctors]);

    // Update Contact is just a subset of profile updating
    const updateDoctorContact = useCallback(async (id, contactData) => {
        return updateDoctorProfile(id, contactData);
    }, [updateDoctorProfile]);

    // Update Services (replace all assigned services)
    const updateDoctorServices = useCallback(async (id, serviceIds) => {
        try {
            const response = await api.patch(`/admin/dentists/${id}/services`, {
                service_ids: serviceIds,
            }, token);
            await fetchDoctors();
            return response.doctor;
        } catch (err) {
            console.error('Error updating doctor services:', err);
            throw err;
        }
    }, [token, fetchDoctors]);

    const onboardDoctor = useCallback(async (doctorData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.post('/admin/dentists', doctorData, token);
            await fetchDoctors();
            return response.user;
        } catch (err) {
            console.error('Error onboarding doctor:', err);
            throw err;
        }
    }, [fetchDoctors]);

    // Refresh exactly one doctor (useful if we don't want to reload the whole list)
    const fetchSingleDoctor = useCallback(async (id) => {
        try {
            const response = await api.get(`/admin/dentists/${id}`, token);
            const updatedDoctor = response.doctor;
            
            setDoctors(current => current.map(d => d.id === id ? updatedDoctor : d));
            return updatedDoctor;
        } catch (err) {
            console.error(`Failed to fetch doctor ${id}:`, err);
            throw err;
        }
    }, [token]);

    // --- Schedule & Blocks ---

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
            // Send as an object { schedules, force }
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

    const fetchDoctorAppointments = useCallback(async (dentistId = null, params = {}) => {
        try {
            const { limit = 100, date_from = new Date().toLocaleDateString('en-CA'), date_to = null } = params;
            
            let url = `/admin/appointments?limit=${limit}&date_from=${date_from}`;
            if (dentistId) url += `&dentist_id=${dentistId}`;
            if (date_to) url += `&date_to=${date_to}`;
            
            const response = await api.get(url, token);
            return response.appointments;
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            throw err;
        }
    }, [token]);

    const fetchDoctorHistory = useCallback(async (dentistId, params = {}) => {
        try {
            const { page = 1, limit = 10, status = null, search = null, tier = null } = params;
            let url = `/admin/appointments?page=${page}&limit=${limit}`;
            
            if (dentistId) url += `&dentist_id=${dentistId}`;
            if (status && status !== 'all') {
                url += `&status=${status}`;
            }
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            if (tier) {
                url += `&tier=${tier}`;
            }
            if (params.date) url += `&date=${params.date}`;
            if (params.date_from) url += `&date_from=${params.date_from}`;
            if (params.date_to) url += `&date_to=${params.date_to}`;

            const response = await api.get(url, token);
            return {
                appointments: response.appointments || [],
                pagination: response.pagination || { total: 0, pages: 1, current_page: 1 }
            };
        } catch (err) {
            console.error('Failed to fetch doctor history:', err);
            throw err;
        }
    }, [token]);

    return {
        doctors,
        loading,
        error,
        refresh: fetchDoctors,
        updateDoctorProfile,
        updateDoctorContact,
        updateDoctorServices,
        onboardDoctor,
        fetchSingleDoctor,
        fetchDoctorSchedule,
        updateDoctorScheduleBulk,
        fetchDoctorBlocks,
        addDoctorBlock,
        bulkAddDoctorBlocks,
        deleteDoctorBlock,
        fetchDoctorAppointments,
        fetchDoctorHistory
    };
};
