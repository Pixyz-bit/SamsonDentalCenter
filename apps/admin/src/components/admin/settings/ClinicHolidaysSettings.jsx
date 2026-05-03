import React, { useState } from 'react';
import { Calendar as CalendarIcon, Trash2, Plus, Info, Clock as ClockIcon, Phone } from 'lucide-react';
import { Button, Input, Modal } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { ListSkeleton } from '../../ui/Skeletons';
import ConfirmationModal from '../../common/ConfirmationModal';

const ClinicHolidaysSettings = () => {
    const { holidays, loading, error, updating, addHoliday, deleteHoliday } = useSettings();
    const { showToast } = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
    const [conflictData, setConflictData] = useState(null);
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

    const handleAddHoliday = async () => {
        if (!newHoliday.name || !newHoliday.date) return;
        try {
            await addHoliday(newHoliday, false);
            setIsAddModalOpen(false);
            setNewHoliday({ name: '', date: '' });
            showToast('Holiday added successfully!', 'success');
        } catch (err) {
            if (err.status === 409 && err.data?.details?.conflictingAppointments) {
                setConflictData(err.data.details.conflictingAppointments);
                setIsConflictModalOpen(true);
            } else {
                showToast('Failed to add holiday: ' + err.message, 'error');
            }
        }
    };

    const handleForceSave = async () => {
        try {
            await addHoliday(newHoliday, true);
            setIsConflictModalOpen(false);
            setIsAddModalOpen(false);
            setNewHoliday({ name: '', date: '' });
            setConflictData(null);
            showToast('Holiday added and appointments displaced successfully!', 'success');
        } catch (err) {
            showToast('Failed to force save: ' + err.message, 'error');
        }
    };

    const handleDeleteClick = (holiday) => {
        setHolidayToDelete(holiday);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!holidayToDelete) return;
        try {
            await deleteHoliday(holidayToDelete.id);
            setIsDeleteModalOpen(false);
            setHolidayToDelete(null);
            showToast('Holiday removed successfully!', 'success');
        } catch (err) {
            showToast('Failed to delete holiday: ' + err.message, 'error');
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const getInitials = (name) => {
        if (!name) return 'GP';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.slice(0, 2).toUpperCase();
    };

    if (loading) return <ListSkeleton />;
    if (error) return <div className="p-4 text-red-500 font-bold">Error: {error}</div>;

    return (
        <div className='space-y-6'>
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                            Clinic Closure Dates
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            Public holidays and clinic-wide breaks
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className='flex items-center gap-2 h-11 px-6 rounded-xl bg-brand-500 text-white text-xs font-black uppercase tracking-tight shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all'
                    >
                        <Plus size={18} /> Add Holiday
                    </Button>
                </div>

                <div className='grid grid-cols-1 gap-4'>
                    {holidays.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No closure dates scheduled.</p>
                        </div>
                    ) : (
                        holidays.map(holiday => (
                            <div key={holiday.id} className='flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 hover:shadow-md transition-all bg-white dark:bg-white/[0.01] group'>
                                <div className='flex items-center gap-5'>
                                    <div className='w-12 h-12 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 group-hover:text-brand-500 transition-colors'>
                                        <CalendarIcon size={24} />
                                    </div>
                                    <div>
                                        <h5 className='text-base font-bold text-gray-900 dark:text-white'>{holiday.name}</h5>
                                        <p className='text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5'>
                                            {new Date(holiday.date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(holiday)}
                                    className='p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all'
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className='mt-10 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex items-start gap-4'>
                    <div className='mt-1 text-blue-600'>
                        <Info size={20} />
                    </div>
                    <p className='text-xs text-blue-800/80 dark:text-blue-400/80 font-medium leading-relaxed'>
                        On these dates, no appointment slots will be generated and the patient booking calendar will show the clinic as completely closed. Existing appointments on these dates will remain but should be rescheduled manually.
                    </p>
                </div>
            </div>

            {/* Add Holiday Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Add Clinic Holiday</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Holiday Name</label>
                                <Input
                                    placeholder="e.g. Christmas Day"
                                    value={newHoliday.name}
                                    onChange={e => setNewHoliday(p => ({ ...p, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                                <Input
                                    type="date"
                                    value={newHoliday.date}
                                    onChange={e => setNewHoliday(p => ({ ...p, date: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-10">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 rounded-xl h-12 font-bold"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleAddHoliday(false)}
                                disabled={updating || !newHoliday.name || !newHoliday.date}
                                className="flex-1 rounded-xl h-12 font-bold bg-brand-500 text-white"
                            >
                                {updating ? 'Saving...' : 'Add Holiday'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isLoading={updating}
                title="Remove Holiday"
                message={`Are you sure you want to remove "${holidayToDelete?.name}"? This will reopen the clinic for bookings on this date.`}
                confirmText="Remove Date"
                variant="danger"
            />

            {/* Conflict Resolution Modal */}
            <Modal
                isOpen={isConflictModalOpen}
                onClose={() => setIsConflictModalOpen(false)}
                title="Conflicts Detected"
                subtitle="Future appointments found on this date."
                className="max-w-5xl"
                footer={(
                    <>
                        <Button
                            variant="secondary"
                            onClick={() => setIsConflictModalOpen(false)}
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
                            Saving this holiday will affect the following <strong>{conflictData?.length}</strong> future appointments. If you proceed, these appointments will be flagged as <span className="font-black text-amber-600 dark:text-amber-400">DISPLACED</span>.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-brand-500" />
                            Affected Appointments
                        </h4>
                        <div className="space-y-4">
                            {conflictData?.map(appt => {
                                const patientName = appt.profiles?.full_name ||
                                    (appt.guest_first_name ? `${appt.guest_first_name} ${appt.guest_last_name}` : appt.guest_name) ||
                                    'Guest Patient';

                                const contactInfo = appt.profiles?.phone || appt.guest_phone || 'No contact';
                                const serviceName = appt.services?.name || 'Dental Service';
                                const serviceTier = appt.services?.tier?.toUpperCase() || 'GENERAL';
                                const doctorName = appt.dentists?.profiles?.full_name ? `Dr. ${appt.dentists.profiles.full_name}` : 'No Doctor Assigned';
                                const initials = getInitials(patientName);

                                return (
                                    <div key={appt.id} className="flex flex-col sm:flex-row bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        {/* Left Side: Time */}
                                        <div className="flex sm:flex-col justify-between sm:justify-center sm:w-32 bg-gray-50/50 dark:bg-gray-800/30 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800 shrink-0">
                                            <div className="px-4 py-3">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Start Time</p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white leading-none">{formatTime(appt.start_time)}</p>
                                            </div>
                                            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800" />
                                            <div className="px-4 py-3">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">End Time</p>
                                                <p className="text-sm font-black text-gray-600 dark:text-gray-400 leading-none">{formatTime(appt.end_time)}</p>
                                            </div>
                                        </div>

                                        {/* Main Content Area (Email Style Stacking) */}
                                        <div className="flex-grow p-4 sm:p-5 flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-brand-500/20 border-2 border-white dark:border-gray-900">
                                                    {initials}
                                                </div>
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                                            </div>

                                            <div className="flex-grow">
                                                <p className="text-base font-black text-gray-900 dark:text-white leading-tight mb-1">{patientName}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                            {serviceName}
                                                        </p>
                                                        <span className="text-gray-300 dark:text-gray-600">•</span>
                                                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                                                            {doctorName}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-gray-500 flex items-center gap-2">
                                                        <Phone size={10} className="text-green-500" />
                                                        <span className="text-gray-800 dark:text-gray-200">{contactInfo}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Status & Source Badges (Stacked with Full Labels) */}
                                        <div className="flex flex-row sm:flex-col items-stretch justify-center border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 bg-gray-50/20 dark:bg-white/[0.01] shrink-0 min-w-[160px]">
                                            {/* Source */}
                                            <div className="px-5 py-4 flex flex-col sm:items-start items-center gap-2">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Appointment Source</p>
                                                {(() => {
                                                    const source = appt.source || 'USER_BOOKING';
                                                    const sourceColors = {
                                                        'GUEST_BOOKING': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
                                                        'USER_BOOKING': 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
                                                        'WALK_IN': 'bg-teal-50 text-teal-600 border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20',
                                                        'WAITLIST': 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                    };
                                                    const sourceClass = sourceColors[source] || sourceColors['USER_BOOKING'];
                                                    const sourceLabel = source.replace('_', ' ');
                                                    return (
                                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border shadow-sm ${sourceClass}`}>
                                                            {sourceLabel}
                                                        </span>
                                                    );
                                                })()}
                                            </div>

                                            <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800" />

                                            {/* Status */}
                                            <div className="px-5 py-4 flex flex-col sm:items-start items-center gap-2">
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Appointment Status</p>
                                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm border ${appt.status === 'CONFIRMED'
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

export default ClinicHolidaysSettings;
