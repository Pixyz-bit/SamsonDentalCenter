import React, { useState } from 'react';
import { Calendar as CalendarIcon, Trash2, Plus, Info } from 'lucide-react';
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
    const [holidayToDelete, setHolidayToDelete] = useState(null);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });

    const handleAddHoliday = async () => {
        if (!newHoliday.name || !newHoliday.date) return;
        try {
            await addHoliday(newHoliday);
            setIsAddModalOpen(false);
            setNewHoliday({ name: '', date: '' });
            showToast('Holiday added successfully!', 'success');
        } catch (err) {
            showToast('Failed to add holiday: ' + err.message, 'error');
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
                                onClick={handleAddHoliday}
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
        </div>
    );
};

export default ClinicHolidaysSettings;
