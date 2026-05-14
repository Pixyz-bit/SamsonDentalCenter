import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const AppointmentsTab = ({ patient, filterMode }) => {
    // Mock data for demo
    const appointments = [
        { id: 1, date: '2026-05-25', time: '09:00 AM', service: 'Tooth Extraction', status: 'Upcoming', doctor: 'Dr. James Thompson' },
        { id: 2, date: '2026-04-10', time: '11:30 AM', service: 'Routine Cleaning', status: 'Completed', doctor: 'Dr. James Thompson' },
        { id: 3, date: '2026-03-15', time: '02:00 PM', service: 'Consultation', status: 'Completed', doctor: 'Dr. James Thompson' },
    ];

    const filtered = appointments.filter(apt => {
        if (filterMode === 'upcoming') return apt.status === 'Upcoming';
        if (filterMode === 'history') return apt.status === 'Completed' || apt.status === 'No Show';
        return true;
    });

    return (
        <div className='space-y-4 animate-in fade-in duration-300'>
            <div className='flex items-center justify-between mb-2'>
                <h4 className='text-sm font-bold text-[#0B1120] dark:text-white uppercase tracking-wider font-outfit'>
                    {filterMode === 'upcoming' ? 'Future Sessions' : 'Clinical History'}
                </h4>
                <span className='text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                    {filtered.length} total entries
                </span>
            </div>

            {filtered.length > 0 ? (
                <div className='grid gap-3'>
                    {filtered.map(apt => (
                        <div key={apt.id} className='p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:shadow-md transition-all'>
                            <div className='flex items-center gap-4'>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    apt.status === 'Upcoming' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10'
                                }`}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <h5 className='text-sm font-bold text-gray-900 dark:text-white font-outfit'>{apt.service}</h5>
                                    <div className='flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400 font-medium'>
                                        <Clock size={12} />
                                        <span>{apt.date} at {apt.time}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-center justify-between sm:justify-end gap-6'>
                                <div className='hidden lg:block text-right'>
                                    <p className='text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1'>Attending Doctor</p>
                                    <p className='text-[10px] font-bold text-gray-700 dark:text-gray-300'>{apt.doctor}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    apt.status === 'Upcoming' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                }`}>
                                    {apt.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl'>
                    <AlertCircle className='mx-auto text-gray-300 mb-3' size={32} />
                    <p className='text-sm text-gray-500 dark:text-gray-400 font-medium'>No appointment records found for this category.</p>
                </div>
            )}
        </div>
    );
};

export default AppointmentsTab;
