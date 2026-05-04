import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const useClinicSettings = () => {
    const [settings, setSettings] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [settingsRes, holidaysRes, scheduleRes] = await Promise.all([
                api.get('/settings'),
                api.get('/settings/holidays'),
                api.get('/settings/schedule')
            ]);
            setSettings(settingsRes);
            setHolidays(holidaysRes);
            setSchedule(scheduleRes);
        } catch (err) {
            console.error('Failed to fetch clinic settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { settings, holidays, schedule, loading, error, refetch: fetchData };
};
