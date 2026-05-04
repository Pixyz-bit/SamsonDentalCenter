import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Calendar, Hourglass, Coffee, Moon, Sun, AlertTriangle, X, Phone, Info, ShieldAlert, Users, Lock, Repeat, Key } from 'lucide-react';
import { Button, Label, Switch, Input, Modal } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { FormSkeleton } from '../../ui/Skeletons';

const ClinicRulesSettings = () => {
    const { settings, schedule, loading, updating, updateSettings, updateSchedule } = useSettings();
    const { showToast } = useToast();

    // Independent edit modes for safety
    const [isEditingRules, setIsEditingRules] = useState(false);
    const [isEditingSchedule, setIsEditingSchedule] = useState(false);

    const [rulesData, setRulesData] = useState({
        booking_lead_time_days: 1,
        booking_max_horizon_days: 60,
        waitlist_enabled: true,
        cancel_penalty_window_hours: 24,
        cancel_restrict_threshold: 3,
        no_show_restrict_threshold: 3,
        no_show_restrict_advance_days: 5,
        max_appointments_per_day_per_user: 1,
        max_reschedules_per_appointment: 2,
        max_guest_bookings_per_email: 3,
        slot_hold_duration_minutes: 10,
        max_otp_failed_attempts: 5,
    });

    const [scheduleData, setScheduleData] = useState([]);

    // ── Conflict Modal State ──
    const [conflictModalOpen, setConflictModalOpen] = useState(false);
    const [conflictingAppointments, setConflictingAppointments] = useState([]);
    const [pendingSchedule, setPendingSchedule] = useState(null);

    useEffect(() => {
        if (settings) {
            setRulesData({
                booking_lead_time_days: settings.booking_lead_time_days ?? 1,
                booking_max_horizon_days: settings.booking_max_horizon_days ?? 60,
                waitlist_enabled: settings.waitlist_enabled ?? true,
                cancel_penalty_window_hours: settings.cancel_penalty_window_hours ?? 24,
                cancel_restrict_threshold: settings.cancel_restrict_threshold ?? 3,
                no_show_restrict_threshold: settings.no_show_restrict_threshold ?? 3,
                no_show_restrict_advance_days: settings.no_show_restrict_advance_days ?? 5,
                max_appointments_per_day_per_user: settings.max_appointments_per_day_per_user ?? 1,
                max_reschedules_per_appointment: settings.max_reschedules_per_appointment ?? 2,
                max_guest_bookings_per_email: settings.max_guest_bookings_per_email ?? 3,
                slot_hold_duration_minutes: settings.slot_hold_duration_minutes ?? 10,
                max_otp_failed_attempts: settings.max_otp_failed_attempts ?? 5,
            });
        }
        if (schedule) {
            // Sort a copy to avoid mutating the original schedule from the hook
            const sorted = [...schedule].sort((a, b) => Number(a.day_of_week) - Number(b.day_of_week));
            setScheduleData(sorted);
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
            setIsEditingRules(false);
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
            setIsEditingSchedule(false);
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
        <div className='space-y-6 sm:space-y-8 pb-20 w-full'>
            {/* 1. GLOBAL RULES SECTION */}
            <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Global Booking Rules
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                            System-wide operational constraints & guardrails
                        </p>
                    </div>
                    {!isEditingRules ? (
                        <Button 
                            onClick={() => setIsEditingRules(true)}
                            className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                            Edit Constraints
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setIsEditingRules(false);
                                    if (settings) {
                                        setRulesData({
                                            booking_lead_time_days: settings.booking_lead_time_days ?? 1,
                                            booking_max_horizon_days: settings.booking_max_horizon_days ?? 60,
                                            waitlist_enabled: settings.waitlist_enabled ?? true,
                                            cancel_penalty_window_hours: settings.cancel_penalty_window_hours ?? 24,
                                            cancel_restrict_threshold: settings.cancel_restrict_threshold ?? 3,
                                            no_show_restrict_threshold: settings.no_show_restrict_threshold ?? 3,
                                            no_show_restrict_advance_days: settings.no_show_restrict_advance_days ?? 5,
                                            max_appointments_per_day_per_user: settings.max_appointments_per_day_per_user ?? 1,
                                            max_reschedules_per_appointment: settings.max_reschedules_per_appointment ?? 2,
                                            max_guest_bookings_per_email: settings.max_guest_bookings_per_email ?? 3,
                                            slot_hold_duration_minutes: settings.slot_hold_duration_minutes ?? 10,
                                            max_otp_failed_attempts: settings.max_otp_failed_attempts ?? 5,
                                        });
                                    }
                                }}
                                className="rounded-xl px-3 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs font-bold uppercase tracking-widest"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSaveRules}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg shadow-green-500/20"
                            >
                                {updating ? 'Saving...' : 'Save Global'}
                            </Button>
                        </div>
                    )}
                </div>

                {isEditingRules && (
                    <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 flex items-center gap-3 text-amber-700 dark:text-amber-400 animate-in fade-in slide-in-from-top-1">
                        <ShieldAlert size={18} />
                        <p className="text-xs font-bold uppercase tracking-tight">You are in edit mode. Changes will be saved globally for all patients.</p>
                    </div>
                )}

                <div className='space-y-12'>
                    {/* SECTION 0: Core Scheduling */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={16} className="text-brand-500" />
                            <h6 className="text-xs font-black uppercase text-gray-400 tracking-widest">Core Scheduling</h6>
                        </div>
                        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6'>
                            {/* Lead Time */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600'>
                                        <Hourglass size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Booking Lead Time</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Min. days required before booking
                                </p>
                                <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                    <Input
                                        type="number"
                                        name="booking_lead_time_days"
                                        disabled={!isEditingRules}
                                        min="0"
                                        max="7"
                                        value={rulesData.booking_lead_time_days}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Days</span>
                                </div>
                            </div>
 
                            {/* Horizon */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-purple-100 dark:bg-purple-500/10 text-purple-600'>
                                        <Calendar size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Booking Horizon</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Max days ahead a patient can book
                                </p>
                                <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                    <Input
                                        type="number"
                                        name="booking_max_horizon_days"
                                        disabled={!isEditingRules}
                                        min="7"
                                        max="365"
                                        value={rulesData.booking_max_horizon_days}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Days</span>
                                </div>
                            </div>
 
                            {/* Waitlist */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600'>
                                        <ShieldCheck size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Waitlist System</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Enable system for fully booked days
                                </p>
                                <div className="mt-auto flex justify-end">
                                    <Switch
                                        disabled={!isEditingRules}
                                        checked={rulesData.waitlist_enabled}
                                        onChange={(checked) => setRulesData(p => ({ ...p, waitlist_enabled: checked }))}
                                        className={`scale-75 sm:scale-100 ${!isEditingRules && 'opacity-50'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: Patient Accountability */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert size={16} className="text-red-500" />
                            <h6 className="text-xs font-black uppercase text-gray-400 tracking-widest">Patient Accountability</h6>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {/* Penalty Window */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600'>
                                        <ShieldAlert size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Penalty Window</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Hours before late cancel
                                </p>
                                <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                    <Input
                                        type="number"
                                        name="cancel_penalty_window_hours"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="72"
                                        value={rulesData.cancel_penalty_window_hours}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Hrs</span>
                                </div>
                            </div>
 
                            {/* Cancellation Limit */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600'>
                                        <X size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Cancel Limit</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Max late cancels
                                </p>
                                <div className="mt-auto">
                                    <Input
                                        type="number"
                                        name="cancel_restrict_threshold"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="10"
                                        value={rulesData.cancel_restrict_threshold}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                </div>
                            </div>
 
                            {/* No-Show Limit */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600'>
                                        <AlertTriangle size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>No-Show Limit</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Max missed appts
                                </p>
                                <div className="mt-auto">
                                    <Input
                                        type="number"
                                        name="no_show_restrict_threshold"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="10"
                                        value={rulesData.no_show_restrict_threshold}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                </div>
                            </div>
 
                            {/* Restriction Duration */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600'>
                                        <Lock size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Restrict Days</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Days blocked
                                </p>
                                <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                    <Input
                                        type="number"
                                        name="no_show_restrict_advance_days"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="30"
                                        value={rulesData.no_show_restrict_advance_days}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Days</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Scheduling Guardrails */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={16} className="text-blue-500" />
                            <h6 className="text-xs font-black uppercase text-gray-400 tracking-widest">Scheduling Guardrails</h6>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {/* Daily Limit */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600'>
                                        <Calendar size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Daily Limit</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Max per day
                                </p>
                                <div className="mt-auto">
                                    <Input
                                        type="number"
                                        name="max_appointments_per_day_per_user"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="10"
                                        value={rulesData.max_appointments_per_day_per_user}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                </div>
                            </div>
 
                            {/* Reschedule Limit */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600'>
                                        <Repeat size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Moves Limit</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Max moves
                                </p>
                                <div className="mt-auto">
                                    <Input
                                        type="number"
                                        name="max_reschedules_per_appointment"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="5"
                                        value={rulesData.max_reschedules_per_appointment}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                </div>
                            </div>
 
                            {/* Guest Limit */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600'>
                                        <Users size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Guest Limit</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Max active
                                </p>
                                <div className="mt-auto">
                                    <Input
                                        type="number"
                                        name="max_guest_bookings_per_email"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="10"
                                        value={rulesData.max_guest_bookings_per_email}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                </div>
                            </div>
 
                            {/* Hold Timer */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600'>
                                        <Clock size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>Hold Timer</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Hold duration
                                </p>
                                <div className="mt-auto flex items-center gap-2 sm:gap-3">
                                    <Input
                                        type="number"
                                        name="slot_hold_duration_minutes"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="30"
                                        value={rulesData.slot_hold_duration_minutes}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400">Min</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Security & Access */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock size={16} className="text-amber-500" />
                            <h6 className="text-xs font-black uppercase text-gray-400 tracking-widest">Security & Access</h6>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                            {/* OTP Attempt Limit */}
                            <div className={`flex flex-col p-3 sm:p-6 rounded-2xl border transition-all min-h-[140px] sm:min-h-[180px] ${!isEditingRules ? 'border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01]' : 'border-brand-200 dark:border-brand-500/20 bg-white dark:bg-white/[0.03] shadow-sm'}`}>
                                <div className='flex items-center gap-2 sm:gap-4 mb-2 sm:mb-4'>
                                    <div className='p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-600'>
                                        <Key size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                    <h5 className='text-[9px] sm:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight'>OTP Limit</h5>
                                </div>
                                <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 font-bold leading-tight uppercase opacity-80 line-clamp-2'>
                                    Failed attempts
                                </p>
                                <div className="mt-auto">
                                    <Input
                                        type="number"
                                        name="max_otp_failed_attempts"
                                        disabled={!isEditingRules}
                                        min="1"
                                        max="10"
                                        value={rulesData.max_otp_failed_attempts}
                                        onChange={handleRuleChange}
                                        className="w-full h-8 sm:h-11 text-center font-black text-sm sm:text-lg border-gray-200 dark:border-white/10 bg-transparent dark:text-white px-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
 
            {/* 2. OPERATING HOURS SECTION */}
            <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-200 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10'>
                    <div>
                        <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                            Weekly Operating Hours
                        </h4>
                        <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                            Define when the clinic is open and lunch breaks
                        </p>
                    </div>
                    {!isEditingSchedule ? (
                        <Button 
                            onClick={() => setIsEditingSchedule(true)}
                            className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                        >
                            <Lock size={12} className="sm:w-3.5 sm:h-3.5" />
                            Edit Schedule
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setIsEditingSchedule(false);
                                    if (schedule) {
                                        const sorted = [...schedule].sort((a, b) => Number(a.day_of_week) - Number(b.day_of_week));
                                        setScheduleData(sorted);
                                    }
                                }}
                                className="rounded-xl px-3 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs font-black uppercase tracking-widest border-gray-200 dark:border-white/10 dark:text-gray-400"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => handleSaveSchedule(false)}
                                disabled={updating}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-3 sm:px-6 h-9 sm:h-11 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-lg shadow-green-500/20 disabled:opacity-50"
                            >
                                {updating ? 'Saving...' : 'Save Schedule'}
                            </Button>
                        </div>
                    )}
                </div>

                {isEditingSchedule && (
                    <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 flex items-center gap-3 text-amber-700 dark:text-amber-400 animate-in fade-in slide-in-from-top-1">
                        <ShieldAlert size={18} />
                        <p className="text-xs font-bold uppercase tracking-tight">Schedule Edit Mode: Changes apply to all future weeks.</p>
                    </div>
                )}

                <div className='space-y-3 sm:space-y-4'>
                    {scheduleData.map((day, idx) => (
                        <div 
                            key={day.day_of_week} 
                            className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                                day.is_open 
                                    ? 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 shadow-sm' 
                                    : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/[0.02] opacity-40'
                            }`}
                        >
                            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-6'>
                                {/* Day Name & Toggle */}
                                <div className='flex items-center justify-between lg:justify-start lg:gap-8 lg:w-56'>
                                    <div className='flex flex-col'>
                                        <h5 className={`text-[clamp(13px,1.2vw,15px)] font-black uppercase tracking-tight font-outfit ${day.is_open ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                            {days[day.day_of_week]}
                                        </h5>
                                        <p className={`text-[8px] font-bold uppercase tracking-[0.1em] ${day.is_open ? 'text-brand-500' : 'text-gray-400'}`}>
                                            {day.is_open ? 'Available for booking' : 'Clinic Closed'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${day.is_open ? 'text-green-500' : 'text-gray-400'}`}>
                                            {day.is_open ? 'ON' : 'OFF'}
                                        </span>
                                        <Switch
                                            disabled={!isEditingSchedule}
                                            checked={day.is_open}
                                            onChange={(checked) => handleScheduleChange(idx, 'is_open', checked)}
                                            className={`${!isEditingSchedule && 'opacity-50'}`}
                                        />
                                    </div>
                                </div>
 
                                {day.is_open ? (
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 flex-grow'>
                                        {/* Shift Hours */}
                                        <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${!isEditingSchedule ? 'bg-gray-50/20 dark:bg-white/[0.01] border-gray-100 dark:border-white/5 opacity-80' : 'bg-white dark:bg-white/[0.03] border-brand-100 dark:border-brand-500/20 shadow-sm'}`}>
                                            <div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 shrink-0'>
                                                <Sun size={14} />
                                            </div>
                                            <div className='flex items-center gap-2 flex-grow'>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Open</span>
                                                    <input
                                                        type="time"
                                                        disabled={!isEditingSchedule}
                                                        value={day.open_time?.substring(0, 5) || '08:00'}
                                                        onChange={(e) => handleScheduleChange(idx, 'open_time', e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 text-xs font-black text-gray-900 dark:text-white focus:ring-0 disabled:text-gray-400"
                                                    />
                                                </div>
                                                <span className='text-gray-300 dark:text-gray-700 mx-1'>—</span>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Close</span>
                                                    <input
                                                        type="time"
                                                        disabled={!isEditingSchedule}
                                                        value={day.close_time?.substring(0, 5) || '17:00'}
                                                        onChange={(e) => handleScheduleChange(idx, 'close_time', e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 text-xs font-black text-gray-900 dark:text-white focus:ring-0 disabled:text-gray-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
 
                                        {/* Lunch Break */}
                                        <div className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${!isEditingSchedule ? 'bg-gray-50/20 dark:bg-white/[0.01] border-gray-100 dark:border-white/5 opacity-80' : 'bg-white dark:bg-white/[0.03] border-indigo-100 dark:border-indigo-500/20 shadow-sm'}`}>
                                            <div className='p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 shrink-0'>
                                                <Coffee size={14} />
                                            </div>
                                            <div className='flex items-center gap-2 flex-grow'>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lunch Start</span>
                                                    <input
                                                        type="time"
                                                        disabled={!isEditingSchedule}
                                                        value={day.lunch_start_time?.substring(0, 5) || ''}
                                                        onChange={(e) => handleScheduleChange(idx, 'lunch_start_time', e.target.value || null)}
                                                        placeholder="12:00"
                                                        className="w-full bg-transparent border-none p-0 text-xs font-black text-gray-900 dark:text-white focus:ring-0 disabled:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                                    />
                                                </div>
                                                <span className='text-gray-300 dark:text-gray-700 mx-1'>—</span>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Lunch End</span>
                                                    <input
                                                        type="time"
                                                        disabled={!isEditingSchedule}
                                                        value={day.lunch_end_time?.substring(0, 5) || ''}
                                                        onChange={(e) => handleScheduleChange(idx, 'lunch_end_time', e.target.value || null)}
                                                        placeholder="13:00"
                                                        className="w-full bg-transparent border-none p-0 text-xs font-black text-gray-900 dark:text-white focus:ring-0 disabled:text-gray-400 placeholder:text-gray-300 dark:placeholder:text-gray-700"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-3 py-2 px-4 rounded-xl bg-gray-100/50 dark:bg-white/[0.02] border border-transparent dark:border-white/5'>
                                        <Moon size={14} className='text-gray-400 dark:text-gray-600' />
                                        <span className='text-[9px] font-black uppercase text-gray-400 dark:text-gray-600 tracking-widest'>Clinic Operation Suspended</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Conflict Resolution Modal (1:1 matching Holiday Style) ── */}
            <Modal 
                isOpen={conflictModalOpen} 
                onClose={() => setConflictModalOpen(false)}
                title="Conflicts Detected"
                subtitle="Future appointments found outside the new clinic hours."
                className="max-w-5xl"
                footer={(
                    <>
                        <Button 
                            variant="secondary" 
                            onClick={() => setConflictModalOpen(false)}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel & Adjust
                        </Button>
                        <Button 
                            onClick={handleForceSave}
                            disabled={updating}
                            className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-white border-0"
                        >
                            {updating ? 'Saving...' : 'Force Save & Displace'}
                        </Button>
                    </>
                )}
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl">
                        <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                            <Info size={24} />
                        </div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                            Saving these hours will affect the following <strong>{conflictingAppointments.length}</strong> future appointments. If you proceed, these appointments will be flagged as <span className="font-black text-amber-600 dark:text-amber-400">DISPLACED</span>.
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-brand-500" />
                            Affected Appointments
                        </h4>
                        <div className="space-y-4">
                            {conflictingAppointments.map(appt => {
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
                                    <div key={appt.id} className="flex flex-col sm:flex-row bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {/* Left Side: Date & Time */}
                                        <div className="flex sm:flex-col justify-between sm:justify-center sm:w-40 bg-gray-50/50 dark:bg-gray-800/30 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 shrink-0 text-center sm:text-left">
                                            <div className="px-4 py-3">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                                <p className="text-[11px] font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">
                                                    {(() => {
                                                        const dateStr = appt.date || appt.appointment_date;
                                                        if (!dateStr) return 'N/A';
                                                        const d = new Date(dateStr + 'T00:00:00');
                                                        return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
                                                    })()}
                                                </p>
                                            </div>
                                            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800" />
                                            <div className="px-4 py-3">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Slot</p>
                                                <p className="text-[11px] font-black text-brand-500 leading-none">
                                                    {fmt(appt.start_time)} - {fmt(appt.end_time)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Main Content Area */}
                                        <div className="flex-grow p-4 sm:p-5 flex items-center gap-4">
                                            <div className="flex-grow">
                                                <p className="text-base font-black text-gray-900 dark:text-white leading-tight mb-1">{patientName}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                            {appt.service?.name || 'Dental Service'}
                                                        </p>
                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                            {appt.dentist?.profile?.full_name ? `Dr. ${appt.dentist.profile.full_name}` : (appt.dentist?.profile?.first_name ? `Dr. ${appt.dentist.profile.first_name} ${appt.dentist.profile.last_name}` : 'No Doctor Assigned')}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-500 flex items-center gap-2">
                                                        <Phone size={10} className="text-green-500" />
                                                        <span className="text-gray-800 dark:text-gray-200">{phone || 'No contact'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Status Badges */}
                                        <div className="flex flex-row sm:flex-col items-stretch justify-center border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-white/[0.01] shrink-0 min-w-[200px]">
                                            <div className="px-5 py-4 flex flex-col sm:items-start items-center gap-2">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Appointment Status</p>
                                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border ${
                                                    appt.status === 'CONFIRMED' 
                                                        ? 'bg-green-50 text-green-600 border-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                                                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                }`}>
                                                    {appt.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ClinicRulesSettings;
