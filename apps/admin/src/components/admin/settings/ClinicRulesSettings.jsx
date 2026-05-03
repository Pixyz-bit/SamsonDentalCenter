import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Calendar, Hourglass, Coffee, Moon, Sun, AlertTriangle, X, Phone } from 'lucide-react';
import { Button, Label, Switch, Input } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { FormSkeleton } from '../../ui/Skeletons';

const ClinicRulesSettings = () => {
    const { settings, schedule, loading, updating, updateSettings, updateSchedule } = useSettings();
    const { showToast } = useToast();
    const [rulesData, setRulesData] = useState({
        booking_lead_time_days: 1,
        booking_max_horizon_days: 60,
        waitlist_enabled: true
    });

    const [scheduleData, setScheduleData] = useState([]);

    // ── Conflict Modal State ──
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictingAppointments, setConflictingAppointments] = useState([]);
    const [pendingSchedule, setPendingSchedule] = useState(null);

    useEffect(() => {
        if (settings) {
            setRulesData({
                booking_lead_time_days: settings.booking_lead_time_days || 1,
                booking_max_horizon_days: settings.booking_max_horizon_days || 60,
                waitlist_enabled: settings.waitlist_enabled ?? true
            });
        }
        if (schedule) {
            setScheduleData(schedule.sort((a, b) => a.day_of_week - b.day_of_week));
        }
    }, [settings, schedule]);

    const handleRuleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRulesData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseInt(value) || 0
        }));
    };

    const handleScheduleChange = (index, field, value) => {
        const newSchedule = [...scheduleData];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setScheduleData(newSchedule);
    };

    const handleSaveRules = async () => {
        try {
            await updateSettings(rulesData);
            showToast('Booking rules updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update rules: ' + err.message, 'error');
        }
    };

    const handleSaveSchedule = async (force = false) => {
        try {
            await updateSchedule(scheduleData, force);
            showToast('Weekly schedule updated successfully!', 'success');
            setConflictModalOpen(false);
            setPendingSchedule(null);
        } catch (err) {
            if (err.status === 409 && err.data?.details?.conflictingAppointments) {
                setConflictingAppointments(err.data.details.conflictingAppointments);
                setPendingSchedule(scheduleData);
                setConflictModalOpen(true);
            } else {
                showToast('Failed to update schedule: ' + err.message, 'error');
            }
        }
    };

    const handleForceSave = async () => {
        await handleSaveSchedule(true);
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    if (loading) return <FormSkeleton />;

    return (
        <div className='space-y-10 pb-20'>
            {/* 1. GLOBAL RULES SECTION */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                            Global Booking Rules
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            System-wide operational constraints
                        </p>
                    </div>
                </div>

                <div className='space-y-6'>
                    {/* Lead Time */}
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                        <div className='flex items-center gap-4'>
                            <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600'>
                                <Hourglass size={18} />
                            </div>
                            <div>
                                <h5 className='text-xs font-bold text-gray-900 dark:text-white uppercase'>Booking Lead Time</h5>
                                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Min. days required before booking</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input 
                                type="number" 
                                name="booking_lead_time_days"
                                value={rulesData.booking_lead_time_days}
                                onChange={handleRuleChange}
                                className="w-20 h-9 text-center font-black"
                            />
                            <span className="text-[10px] font-black uppercase text-gray-400">Days</span>
                        </div>
                    </div>

                    {/* Horizon */}
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                        <div className='flex items-center gap-4'>
                            <div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600'>
                                <Calendar size={18} />
                            </div>
                            <div>
                                <h5 className='text-xs font-bold text-gray-900 dark:text-white uppercase'>Booking Horizon</h5>
                                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Max days ahead a patient can book</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Input 
                                type="number" 
                                name="booking_max_horizon_days"
                                value={rulesData.booking_max_horizon_days}
                                onChange={handleRuleChange}
                                className="w-20 h-9 text-center font-black"
                            />
                            <span className="text-[10px] font-black uppercase text-gray-400">Days</span>
                        </div>
                    </div>



                    {/* Waitlist Toggle */}
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                        <div className='flex items-center gap-4'>
                            <div className='p-2 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600'>
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <h5 className='text-xs font-bold text-gray-900 dark:text-white uppercase'>Waitlist System</h5>
                                <p className='text-[10px] text-gray-500 dark:text-gray-400'>Enable waitlist for fully booked days</p>
                            </div>
                        </div>
                        <Switch 
                            checked={rulesData.waitlist_enabled} 
                            onChange={(checked) => setRulesData(p => ({ ...p, waitlist_enabled: checked }))}
                        />
                    </div>
                </div>

                <div className='mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
                    <Button 
                        onClick={handleSaveRules}
                        disabled={updating}
                        className='px-8 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20'
                    >
                        Save Booking Rules
                    </Button>
                </div>
            </div>

            {/* 2. OPERATING HOURS SECTION */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                            Weekly Operating Hours
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            Define when the clinic is open and lunch breaks
                        </p>
                    </div>
                    <div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10'>
                        <Clock size={12} className='text-blue-500' />
                        <span className='text-[10px] font-black text-blue-600 uppercase tracking-tighter'>24h Format</span>
                    </div>
                </div>

                <div className='space-y-4'>
                    {scheduleData.map((day, idx) => (
                        <div key={day.day_of_week} className={`p-4 rounded-xl border ${day.is_open ? 'border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.01]' : 'border-gray-100 bg-gray-50/50 dark:bg-white/[0.01] opacity-60'}`}>
                            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                                {/* Day Name & Toggle */}
                                <div className='flex items-center justify-between lg:justify-start lg:gap-6 lg:w-48'>
                                    <h5 className={`text-sm font-black uppercase tracking-tight ${day.is_open ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                        {days[day.day_of_week]}
                                    </h5>
                                    <Switch 
                                        checked={day.is_open}
                                        onChange={(checked) => handleScheduleChange(idx, 'is_open', checked)}
                                    />
                                </div>

                                {day.is_open ? (
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow'>
                                        {/* Shift Hours */}
                                        <div className='flex items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-gray-800'>
                                            <div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600'>
                                                <Sun size={14} />
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Input 
                                                    type="text"
                                                    value={day.open_time?.substring(0, 5) || '08:00'}
                                                    onChange={(e) => handleScheduleChange(idx, 'open_time', e.target.value)}
                                                    className="w-16 h-8 text-xs font-bold p-0 text-center border-none bg-transparent"
                                                />
                                                <span className='text-gray-300'>—</span>
                                                <Input 
                                                    type="text"
                                                    value={day.close_time?.substring(0, 5) || '17:00'}
                                                    onChange={(e) => handleScheduleChange(idx, 'close_time', e.target.value)}
                                                    className="w-16 h-8 text-xs font-bold p-0 text-center border-none bg-transparent"
                                                />
                                            </div>
                                        </div>

                                        {/* Lunch Break */}
                                        <div className='flex items-center gap-4 bg-gray-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-gray-800'>
                                            <div className='p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600'>
                                                <Coffee size={14} />
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Input 
                                                    type="text"
                                                    value={day.lunch_start_time?.substring(0, 5) || ''}
                                                    onChange={(e) => handleScheduleChange(idx, 'lunch_start_time', e.target.value || null)}
                                                    placeholder="12:00"
                                                    className="w-16 h-8 text-xs font-bold p-0 text-center border-none bg-transparent"
                                                />
                                                <span className='text-gray-300'>—</span>
                                                <Input 
                                                    type="text"
                                                    value={day.lunch_end_time?.substring(0, 5) || ''}
                                                    onChange={(e) => handleScheduleChange(idx, 'lunch_end_time', e.target.value || null)}
                                                    placeholder="13:00"
                                                    className="w-16 h-8 text-xs font-bold p-0 text-center border-none bg-transparent"
                                                />
                                            </div>
                                            <p className='text-[9px] font-black uppercase text-gray-400 tracking-tighter leading-none'>Lunch Break</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-3 py-3'>
                                        <Moon size={14} className='text-gray-300' />
                                        <span className='text-[10px] font-black uppercase text-gray-300 tracking-widest'>Clinic Closed</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
                    <Button 
                        onClick={() => handleSaveSchedule(false)}
                        disabled={updating}
                        className='px-10 h-12 rounded-xl text-sm font-black bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 transition-all shadow-xl shadow-black/10'
                    >
                        {updating ? 'Updating...' : 'Save Weekly Schedule'}
                    </Button>
                </div>
            </div>

            {/* ── Hour Shift Conflict Modal ── */}
            {conflictModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-500/10">
                                    <AlertTriangle size={22} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Hour Shift Conflict</h3>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                                        {conflictingAppointments.length} appointment{conflictingAppointments.length !== 1 ? 's' : ''} fall outside the new hours
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setConflictModalOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-3">
                            {conflictingAppointments.map((appt) => {
                                const patientName = appt.patient?.first_name
                                    ? `${appt.patient.last_name}, ${appt.patient.first_name}`
                                    : (appt.patient?.full_name || appt.guest_first_name
                                        ? `${appt.guest_last_name || ''}, ${appt.guest_first_name || ''}`.trim()
                                        : (appt.guest_name || 'Guest'));
                                const phone = appt.patient?.phone || appt.guest_phone;
                                const fmt = (t) => {
                                    if (!t) return '';
                                    const [h, m] = t.substring(0, 5).split(':');
                                    const hr = parseInt(h);
                                    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                                };

                                return (
                                    <div key={appt.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.02]">
                                        {/* Time */}
                                        <div className="shrink-0 w-20 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-100 dark:border-gray-700 gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Start</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{fmt(appt.start_time)}</span>
                                            <div className="w-full border-t border-gray-100 dark:border-gray-700" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">End</span>
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{fmt(appt.end_time)}</span>
                                        </div>
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 dark:text-white text-sm truncate">{patientName}</p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                                                {appt.service?.name}
                                                {appt.dentist?.profile?.first_name && (
                                                    <> &bull; Dr. {appt.dentist.profile.last_name}, {appt.dentist.profile.first_name}</>
                                                )}
                                            </p>
                                            {phone && (
                                                <span className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-bold">
                                                    <Phone size={9} /> {phone}
                                                </span>
                                            )}
                                            <p className="text-[10px] font-bold text-gray-400 mt-1">{appt.appointment_date}</p>
                                        </div>
                                        {/* Status */}
                                        <div className="shrink-0 flex items-center">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                                                appt.status === 'CONFIRMED'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <Button
                                onClick={() => setConflictModalOpen(false)}
                                className="h-11 px-6 rounded-xl text-sm font-black border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleForceSave}
                                disabled={updating}
                                className="h-11 px-6 rounded-xl text-sm font-black bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 disabled:opacity-50"
                            >
                                {updating ? 'Displacing...' : `Force Save & Displace ${conflictingAppointments.length} Appointment${conflictingAppointments.length !== 1 ? 's' : ''}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClinicRulesSettings;
