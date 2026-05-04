import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { useDoctors } from '../../hooks/useDoctors';

// Components
import DoctorCard from '../../components/secretary/calendar/DoctorCard';
import DoctorProfileHeader from '../../components/secretary/calendar/DoctorProfileHeader';
import WeeklyRoutine from '../../components/secretary/calendar/WeeklyRoutine';
import UpcomingSchedule from '../../components/secretary/calendar/UpcomingSchedule';
import BlockDateModal from '../../components/secretary/calendar/BlockDateModal';
import BlockTimeModal from '../../components/secretary/calendar/BlockTimeModal';
import WeeklyScheduleModal from '../../components/secretary/calendar/WeeklyScheduleModal';

const CalendarPage = () => {
    const { tab, id } = useParams();
    const navigate = useNavigate();
    const activeView = tab || 'day';
    const selectedDoctorId = id;

    const { doctors, loading, error, fetchDoctorAppointments, fetchDoctorBlocks, fetchDoctorSchedule } = useDoctors();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [specialtyFilter, setSpecialtyFilter] = useState('all');
    const [appointments, setAppointments] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Modal states
    const [isBlockDateOpen, setIsBlockDateOpen] = useState(false);
    const [isBlockTimeOpen, setIsBlockTimeOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

    const loadDetails = async () => {
        if (selectedDoctorId) {
            try {
                setIsLoadingDetails(true);
                const [appData, blockData, scheduleData] = await Promise.all([
                    fetchDoctorAppointments(selectedDoctorId),
                    fetchDoctorBlocks(selectedDoctorId),
                    fetchDoctorSchedule(selectedDoctorId)
                ]);
                setAppointments(appData || []);
                setBlocks(blockData || []);
                setSchedule(scheduleData || []);
            } catch (err) {
                console.error('Failed to load clinician details:', err);
            } finally {
                setIsLoadingDetails(false);
            }
        }
    };

    React.useEffect(() => {
        loadDetails();
    }, [selectedDoctorId]);

    const filteredDoctors = doctors.filter(d => {
        const name = d.full_name || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // Specialty filter
        if (specialtyFilter !== 'all' && d.tier !== specialtyFilter) return false;

        if (activeFilter === 'all') return true;
        return d.is_active === (activeFilter === 'active');
    });

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle={selectedDoctorId ? 'Clinician Schedule' : 'Schedules'} 
                subtitle={selectedDoctorId ? 'View individual clinician availability and bookings.' : 'View and manage all clinician schedules.'}
            />

            <div className="grow flex flex-col min-h-0">
                {loading && !doctors.length ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                ) : selectedDoctorId ? (
                    <div className="flex flex-col grow min-h-0 bg-white dark:bg-white/[0.03] sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="grow overflow-y-auto no-scrollbar">
                            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                                <DoctorProfileHeader 
                                    doctor={selectedDoctor} 
                                    onBack={() => navigate('/calendar')} 
                                />
                                
                                {(() => {
                                    const viewSwitcher = (
                                        <div className="flex bg-gray-50 dark:bg-white/5 rounded-xl p-1 border border-gray-100 dark:border-gray-800">
                                            {['day', 'week'].map(v => (
                                                <button 
                                                    key={v}
                                                    onClick={() => navigate(`/calendar/${v}/${selectedDoctorId}`)}
                                                    className={`px-4 py-2 text-xs font-bold rounded-lg uppercase transition-all ${activeView === v ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm' : 'text-gray-400'}`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    );

                                    return activeView === 'week' ? (
                                        <WeeklyRoutine 
                                            schedule={schedule} 
                                            blocks={blocks} 
                                            onBlockDate={() => setIsBlockDateOpen(true)}
                                            onEditSchedule={() => setIsScheduleModalOpen(true)}
                                            viewSwitcher={viewSwitcher}
                                        />
                                    ) : (
                                        <UpcomingSchedule 
                                            appointments={appointments} 
                                            onBlockTime={() => setIsBlockTimeOpen(true)}
                                            viewSwitcher={viewSwitcher}
                                        />
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grow flex flex-col bg-white dark:bg-white/[0.03] sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        {/* Filters Section */}
                        <div className="px-4 sm:px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl w-full sm:w-auto border border-gray-100 dark:border-gray-800">
                                    {['all', 'general', 'specialized'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setSpecialtyFilter(filter)}
                                            className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 capitalize ${
                                                specialtyFilter === filter
                                                    ? 'bg-white dark:bg-white/10 text-brand-500 shadow-sm'
                                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative group flex-1 sm:flex-none sm:w-64">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors z-10">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                        </div>
                                        <input 
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search clinician..."
                                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0B1120]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm hover:shadow-md transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Clinicians Grid Area */}
                        <div className="grow overflow-y-auto no-scrollbar p-4 sm:p-6 lg:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {filteredDoctors.length > 0 ? (
                                    filteredDoctors.map(doc => (
                                        <DoctorCard 
                                            key={doc.id}
                                            doc={doc}
                                            onSchedule={() => navigate(`/calendar/day/${doc.id}`)}
                                            onEdit={() => navigate(`/calendar/day/${doc.id}`)}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No clinicians found</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                                            Try adjusting your search or filters to find a doctor.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <BlockDateModal isOpen={isBlockDateOpen} onClose={() => setIsBlockDateOpen(false)} doctor={selectedDoctor} blocks={blocks} onSave={loadDetails} />
            <BlockTimeModal isOpen={isBlockTimeOpen} onClose={() => setIsBlockTimeOpen(false)} doctor={selectedDoctor} blocks={blocks} onSave={loadDetails} />
            <WeeklyScheduleModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} doctor={selectedDoctor} schedule={schedule} onSave={loadDetails} />
        </div>
    );
};

export default CalendarPage;
