import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export const useSettings = () => {
    const { token } = useAuth();
    const [settings, setSettings] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all settings data in parallel
            const [settingsRes, scheduleRes, holidaysRes] = await Promise.all([
                api.get('/settings', token),
                api.get('/settings/schedule', token),
                api.get('/settings/holidays', token)
            ]);
            setSettings(settingsRes);
            setSchedule(scheduleRes);
            setHolidays(holidaysRes);
        } catch (err) {
            setError(err.message || 'Failed to fetch settings');
            console.error('Settings fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, fetchData]);

    /**
     * Update clinic-wide system settings (name, contact, rules)
     */
    const updateSettingsData = async (updates) => {
        try {
            setUpdating(true);
            const res = await api.patch('/settings', updates, token);
            setSettings(res.settings);
            return res;
        } catch (err) {
            console.error('Update settings error:', err);
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Update weekly clinic schedule (operating hours, lunch breaks)
     */
    const updateScheduleData = async (newSchedule, force = false) => {
        try {
            setUpdating(true);
            const res = await api.patch(`/settings/schedule${force ? '?force=true' : ''}`, newSchedule, token);
            setSchedule(res.schedule);
            return res;
        } catch (err) {
            console.error('Update schedule error:', err);
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Add a one-off holiday or clinic block-out date
     */
    const addHoliday = async (holidayData, force = false) => {
        try {
            setUpdating(true);
            const res = await api.post(`/settings/holidays${force ? '?force=true' : ''}`, holidayData, token);
            setHolidays(prev => [...prev, res.holiday].sort((a, b) => a.date.localeCompare(b.date)));
            return res;
        } catch (err) {
            console.error('Add holiday error:', err);
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Delete a holiday entry
     */
    const deleteHoliday = async (id) => {
        try {
            setUpdating(true);
            await api.delete(`/settings/holidays/${id}`, token);
            setHolidays(prev => prev.filter(h => h.id !== id));
        } catch (err) {
            console.error('Delete holiday error:', err);
            throw err;
        } finally {
            setUpdating(false);
        }
    };

    /**
     * Fetch real-time system health status
     */
    const getHealth = async () => {
        try {
            return await api.get('/admin/system/health', token);
        } catch (err) {
            console.error('Health check failed:', err);
            return { status: 'error', message: err.message };
        }
    };

    return {
        settings,
        schedule,
        holidays,
        loading,
        error,
        updating,
        updateSettings: updateSettingsData,
        updateSchedule: updateScheduleData,
        addHoliday,
        deleteHoliday,
        getHealth,
        refresh: fetchData
    };
};
