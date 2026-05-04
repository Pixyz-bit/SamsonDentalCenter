import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import WeeklyRoutine from './WeeklyRoutine';
import WeeklyTimeline from './WeeklyTimeline';
import BlockTimeModal from './BlockTimeModal';
import { useToast } from '../../../../context/ToastContext.jsx';
import { useDoctors } from '../../../../hooks/useDoctors';

const DoctorScheduleDetail = ({ doctor }) => {
    const { showToast } = useToast();
    const { fetchDoctorAppointments, fetchDoctorBlocks, fetchDoctorSchedule } = useDoctors(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [isTimeBlockModalOpen, setIsTimeBlockModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [events, setEvents] = useState([]);
    const [timeBounds, setTimeBounds] = useState({ minStart: 8, maxEnd: 18 });

    const loadCalendarData = useCallback(async () => {
        if (!doctor?.id) return;
        try {
            setIsLoading(true);
            const [fetchedAppointments, fetchedBlocks, fetchedSchedule] = await Promise.all([
                fetchDoctorAppointments(doctor.id),
                fetchDoctorBlocks(doctor.id),
                fetchDoctorSchedule(doctor.id)
            ]);

            // Calculate Grid Bounds
            let minStart = 8;
            let maxEnd = 18;

            if (fetchedSchedule && fetchedSchedule.length > 0) {
                const workingDays = fetchedSchedule.filter(s => s.is_working);
                if (workingDays.length > 0) {
                    const starts = workingDays.map(s => parseInt((s.start_time || s.start || '08:00').split(':')[0]));
                    const ends = workingDays.map(s => parseInt((s.end_time || s.end || '18:00').split(':')[0]));
                    minStart = Math.min(...starts);
                    maxEnd = Math.max(...ends) + 1; // Round up to next hour
                }
            }
            setTimeBounds({ minStart, maxEnd });

            const newEvents = [];

            // 1. Map Appointments — exclude cancelled/displaced, only show active statuses
            const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED'];
            fetchedAppointments
                .filter(appt => ACTIVE_STATUSES.includes(appt.status))
                .forEach(appt => {
                    // Calculate duration in minutes
                    const start = new Date(`1970-01-01T${appt.start_time}`);
                    const end = new Date(`1970-01-01T${appt.end_time}`);
                    const duration = Math.round((end - start) / (1000 * 60));

                    newEvents.push({
                        id: appt.id,
                        date: appt.date,
                        start: appt.start_time.substring(0, 5),
                        duration: duration,
                        service: appt.service || 'Dental Service',
                        patient: appt.patient?.name || 'Guest Patient',
                        type: 'appointment',
                        status: appt.status
                    });
                });


            // 2. Mapping Blocks
            fetchedBlocks.forEach(block => {
                const dateKey = block.block_date.substring(0, 10);
                
                // If it's a full-day block (no times), we map it to fit the doctor's specific bounds
                const isFullDay = !block.start_time;
                const startTime = isFullDay ? `${minStart.toString().padStart(2, '0')}:00` : block.start_time.substring(0, 5);
                const endTime = isFullDay ? `${maxEnd.toString().padStart(2, '0')}:00` : (block.end_time ? block.end_time.substring(0, 5) : `${maxEnd.toString().padStart(2, '0')}:00`);
                
                const startObj = new Date(`1970-01-01T${startTime}`);
                const endObj = new Date(`1970-01-01T${endTime}`);
                const duration = Math.round((endObj - startObj) / (1000 * 60));

                newEvents.push({
                    id: block.id,
                    date: dateKey,
                    start: startTime,
                    duration: duration,
                    service: block.reason || 'Blocked',
                    patient: 'Clinical Staff',
                    type: 'blocked'
                });
            });

            // 3. Mapping Daily Break Times visually for the next 14 days
            if (fetchedSchedule && fetchedSchedule.length > 0) {
                const today = new Date();
                for (let i = 0; i < 14; i++) {
                    const targetDate = addDays(today, i);
                    const jsDay = targetDate.getDay();
                    const scheduleIndex = jsDay === 0 ? 6 : jsDay - 1; // map 0=Sun to 6, 1=Mon to 0

                    const dailyConfig = fetchedSchedule.find(s => s.day_of_week === scheduleIndex);
                    
                    if (dailyConfig && dailyConfig.is_working && dailyConfig.break_start_time && dailyConfig.break_end_time) {
                        const dateKey = format(targetDate, 'yyyy-MM-dd');
                        const startObj = new Date(`1970-01-01T${dailyConfig.break_start_time}`);
                        const endObj = new Date(`1970-01-01T${dailyConfig.break_end_time}`);
                        const duration = Math.round((endObj - startObj) / (1000 * 60));

                        newEvents.push({
                            id: `break-${dateKey}`,
                            date: dateKey,
                            start: dailyConfig.break_start_time.substring(0, 5),
                            duration: duration,
                            service: 'Lunch / Break',
                            patient: 'Recurring Daily Break',
                            type: 'blocked'
                        });
                    }
                }
            }

            setEvents(newEvents);
        } catch (err) {
            console.error('Failed to load calendar events:', err);
            showToast('Could not load calendar events.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [doctor?.id, fetchDoctorAppointments, fetchDoctorBlocks, fetchDoctorSchedule]);

    useEffect(() => {
        loadCalendarData();
    }, [loadCalendarData]);

    const handleApplyTimeBlocks = (date, blockedSlots, unblockedSlots, reason) => {
        // Since we are now dynamic, we refresh the calendar after save
        // The saving itself is handled in WeeklyRoutine for date blocks, 
        // or a separate modal for time blocks.
        loadCalendarData();
    };

    return (
        <div className={`flex flex-col gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 dark:bg-gray-900/20 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Syncing Schedule...</span>
                    </div>
                </div>
            )}
            {/* Top row: The main weekly form */}
            <div className='w-full'>
                <WeeklyRoutine 
                    doctor={doctor} 
                    externalBlockModalOpen={isBlockModalOpen}
                    setExternalBlockModalOpen={setIsBlockModalOpen}
                    onScheduleUpdate={loadCalendarData}
                />
            </div>

            {/* Bottom row: Weekly Timeline view */}
            <div className='w-full'>
                <WeeklyTimeline 
                    doctor={doctor} 
                    events={events}
                    timeBounds={timeBounds}
                    onBlockClick={() => setIsTimeBlockModalOpen(true)}
                />
            </div>

            <BlockTimeModal 
                isOpen={isTimeBlockModalOpen}
                onClose={() => setIsTimeBlockModalOpen(false)}
                events={events}
                doctor={doctor}
                timeBounds={timeBounds}
                onSave={handleApplyTimeBlocks}
            />
        </div>
    );
};

export default DoctorScheduleDetail;

