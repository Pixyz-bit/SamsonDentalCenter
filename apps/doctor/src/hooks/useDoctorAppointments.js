import { useState, useCallback } from 'react';

/**
 * Hook for fetching doctor's clinical appointments.
 * SIMULATION MODE: Returns mock data and avoids API calls.
 */
export const useDoctorAppointments = () => {
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        view: 'day',
        status: '',
        search: ''
    });

    const mockData = [
        {
            id: 'mock-1',
            start_time: '09:00 AM',
            end_time: '10:00 AM',
            status: 'IN_PROGRESS',
            patient: { name: 'John Doe', phone: '09123456789' },
            service: 'Tooth Extraction',
            service_id: 'mock-service-1',
            date: new Date().toISOString(),
        },
        {
            id: 'mock-2',
            start_time: '10:30 AM',
            end_time: '11:00 AM',
            status: 'CONFIRMED',
            patient: { name: 'Jane Smith', phone: '09188877766' },
            service: 'General Consultation',
            service_id: 'mock-service-2',
            date: new Date().toISOString(),
        }
    ];

    const refreshAppointments = useCallback(() => {
        console.log('Simulation: Refreshing mock appointments...');
    }, []);

    return {
        appointments: mockData,
        loading: false,
        error: null,
        filters,
        setFilters,
        refreshAppointments
    };
};

export default useDoctorAppointments;
