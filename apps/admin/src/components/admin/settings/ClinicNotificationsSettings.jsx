import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, Mail, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';
import { Button, Label, Switch } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { FormSkeleton } from '../../ui/Skeletons';

const ClinicNotificationsSettings = () => {
    const { settings, loading, error, updating, updateSettings } = useSettings();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        sms_notifications_enabled: true,
        email_notifications_enabled: true,
        reminder_24h_enabled: true,
        reminder_48h_enabled: true,
        reminder_send_time: '08:00'
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                sms_notifications_enabled: settings.sms_notifications_enabled ?? true,
                email_notifications_enabled: settings.email_notifications_enabled ?? true,
                reminder_24h_enabled: settings.reminder_24h_enabled ?? true,
                reminder_48h_enabled: settings.reminder_48h_enabled ?? true,
                reminder_send_time: settings.reminder_send_time || '08:00'
            });
        }
    }, [settings]);

    const handleSubmit = async () => {
        try {
            await updateSettings(formData);
            showToast('Notification channels updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update notification settings: ' + err.message, 'error');
        }
    };

    if (loading) return <FormSkeleton />;
    if (error) return <div className="p-4 text-red-500 font-bold">Error: {error}</div>;

    return (
        <div className='space-y-6'>
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                            Communication Channels
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            Global toggles for automated patient notifications
                        </p>
                    </div>
                    <div className='p-2 rounded-lg bg-amber-50 dark:bg-amber-500/5 text-amber-600 border border-amber-100 dark:border-amber-500/10 flex items-center gap-2'>
                        <ShieldAlert size={14} />
                        <span className='text-[10px] font-black uppercase tracking-tighter'>System Critical</span>
                    </div>
                </div>

                <div className='space-y-6'>
                    {/* SMS Toggle */}
                    <div className='flex flex-col p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-start gap-4'>
                            <div className='p-2.5 rounded-xl bg-green-100 dark:bg-green-500/10 text-green-600 shadow-sm'>
                                <MessageSquare size={20} />
                            </div>
                            <div>
                                <h5 className='text-sm font-bold text-gray-900 dark:text-white'>SMS Gateway</h5>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Enable automated SMS for appointment reminders and OTPs.</p>
                            </div>
                        </div>
                        <Switch 
                            checked={formData.sms_notifications_enabled}
                            onChange={(checked) => setFormData(p => ({ ...p, sms_notifications_enabled: checked }))}
                        />
                        </div>
                        {!formData.sms_notifications_enabled && (
                            <div className='mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex gap-3 items-start'>
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <p className='text-xs text-red-600 dark:text-red-400 font-medium'>
                                    Warning: Turning off SMS will prevent patients from receiving 24/48-hour text reminders and real-time approval alerts.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Email Toggle */}
                    <div className='flex flex-col p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-start gap-4'>
                            <div className='p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 shadow-sm'>
                                <Mail size={20} />
                            </div>
                            <div>
                                <h5 className='text-sm font-bold text-gray-900 dark:text-white'>Email Gateway</h5>
                                <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Enable automated email confirmations and newsletters.</p>
                            </div>
                        </div>
                        <Switch 
                            checked={formData.email_notifications_enabled}
                            onChange={(checked) => setFormData(p => ({ ...p, email_notifications_enabled: checked }))}
                        />
                        </div>
                        {!formData.email_notifications_enabled && (
                            <div className='mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex gap-3 items-start'>
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <div className='text-xs text-red-600 dark:text-red-400 font-medium space-y-1'>
                                    <p>Warning: Turning off Email Notifications will explicitly disable:</p>
                                    <ul className='list-disc pl-4'>
                                        <li>OTP Verification (Guest Booking will be fully disabled)</li>
                                        <li>Booking Confirmations & Waitlist Alerts</li>
                                        <li>Email Reminders</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Automated Reminders Config */}
                    <div className='mt-8 pt-6 border-t border-gray-100 dark:border-gray-800'>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                                    Reminder Schedule
                                </h4>
                                <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                                    Configure when automated reminders are sent
                                </p>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            {/* 48h Reminder Toggle */}
                            <div className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                                <div className='flex items-center gap-4'>
                                    <div className='p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600'>
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-bold text-gray-900 dark:text-white uppercase'>48-Hour Reminder</h5>
                                        <p className='text-[10px] text-gray-500 dark:text-gray-400'>Send a reminder 2 days before the appointment</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={formData.reminder_48h_enabled}
                                    onChange={(checked) => setFormData(p => ({ ...p, reminder_48h_enabled: checked }))}
                                />
                            </div>

                            {/* 24h Reminder Toggle */}
                            <div className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                                <div className='flex items-center gap-4'>
                                    <div className='p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600'>
                                        <Bell size={18} />
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-bold text-gray-900 dark:text-white uppercase'>24-Hour Reminder</h5>
                                        <p className='text-[10px] text-gray-500 dark:text-gray-400'>Send a reminder 1 day before the appointment</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={formData.reminder_24h_enabled}
                                    onChange={(checked) => setFormData(p => ({ ...p, reminder_24h_enabled: checked }))}
                                />
                            </div>

                            {/* Send Time */}
                            <div className='flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]'>
                                <div className='flex items-center gap-4'>
                                    <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-500/10 text-slate-600'>
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <h5 className='text-xs font-bold text-gray-900 dark:text-white uppercase'>Daily Send Time</h5>
                                        <p className='text-[10px] text-gray-500 dark:text-gray-400'>Time of day to execute reminder batch</p>
                                    </div>
                                </div>
                                <input 
                                    type="time" 
                                    value={formData.reminder_send_time}
                                    onChange={(e) => setFormData(p => ({ ...p, reminder_send_time: e.target.value }))}
                                    className="px-3 py-1.5 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className='mt-6 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-gray-800'>
                        <div className='flex items-center gap-3 text-gray-400'>
                            <Bell size={16} />
                            <p className='text-[10px] font-bold uppercase tracking-widest'>Note: Reminders will only be sent via channels (Email/SMS) that are enabled above.</p>
                        </div>
                    </div>
                </div>

                <div className='mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
                    <Button 
                        onClick={handleSubmit}
                        disabled={updating}
                        className='px-10 h-12 rounded-xl text-sm font-black bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50'
                    >
                        {updating ? 'Updating...' : 'Save Notification Config'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClinicNotificationsSettings;
