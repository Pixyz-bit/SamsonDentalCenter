import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { useSidebar } from '../../context/SidebarContext';
import useAppointments, {
    formatDate,
} from '../../hooks/useAppointments';
import { useDependents } from '../../hooks/useDependents';

// Extracted Components
import AppointmentTable from '../../components/patient/appointments/AppointmentTable';
import AppointmentPagination from '../../components/patient/appointments/AppointmentPagination';
import ErrorState from '../../components/common/ErrorState';
import { Search, History, CheckCircle2, XCircle, AlertCircle, Users, ListFilter } from 'lucide-react';

const AppointmentHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { dependents } = useDependents();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('history');
    const [selectedPersonId, setSelectedPersonId] = useState('all');

    // Use the history status and person filter
    const { appointments, total, counts, page, totalPages, loading, error, goToPage } =
        useAppointments({ 
            status: statusFilter, 
            sort: 'desc', 
            limit: 10,
            patientId: selectedPersonId
        });

    // Client-side search
    const filtered = search.trim()
        ? appointments.filter((a) => {
            const q = search.toLowerCase();
            return (
                (a.service || '').toLowerCase().includes(q) ||
                (a.dentist || '').toLowerCase().includes(q) ||
                (formatDate(a.date) || '').toLowerCase().includes(q)
            );
        })
        : appointments;

    const toggleDropdown = (id) => setOpenDropdown(openDropdown === id ? null : id);

    const handleViewDetails = (id) => {
        setOpenDropdown(null);
        navigate(`/patient/appointments/${id}`);
    };

    return (
        <>
            <PageBreadcrumb pageTitle='Appointment History' className='mb-4' />
            
            <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
                {error ? (
                    <ErrorState 
                        error={error} 
                        onRetry={() => goToPage(1)} 
                        title="Failed to load history"
                        parentPath="/patient"
                        parentName="Dashboard"
                    />
                ) : (
                    <>
                        <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                            {/* Search Row */}
                            <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                                <div className='relative flex-grow w-full'>
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search history...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                                    />
                                </div>
                            </div>

                            {/* Dropdown Filters Row */}
                            <div className='px-4 sm:px-6 py-4 flex flex-nowrap items-center gap-3 overflow-x-auto hide-scrollbar'>
                                {/* 1. Person Filter */}
                                <div className='relative w-auto min-w-[180px] shrink-0'>
                                    <div className='absolute left-3.5 top-3.5 text-brand-500'>
                                        <Users size={16} />
                                    </div>
                                    <select
                                         value={selectedPersonId}
                                         onChange={(e) => setSelectedPersonId(e.target.value)}
                                         className='w-full pl-10 pr-10 py-3 bg-brand-50/50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-900/50 rounded-lg text-xs font-bold text-brand-700 dark:text-brand-300 appearance-none outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer'
                                     >
                                         <option value='all' className='dark:bg-gray-900'>All Family Members</option>
                                         <option value={user?.id} className='dark:bg-gray-900'>Me ({user?.full_name})</option>
                                         {dependents.map(dep => (
                                             <option key={dep.id} value={dep.id} className='dark:bg-gray-900'>
                                                 {dep.full_name} ({dep.relationship_to_primary})
                                             </option>
                                         ))}
                                     </select>
                                     <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-brand-500 pointer-events-none' />
                                 </div>

                                 {/* 2. Status Filter */}
                                 <div className='relative w-auto min-w-[160px] shrink-0'>
                                     <div className='absolute left-3.5 top-3.5 text-brand-500'>
                                         <ListFilter size={16} />
                                     </div>
                                     <select
                                         value={statusFilter}
                                         onChange={(e) => setStatusFilter(e.target.value)}
                                         className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer'
                                     >
                                         <option value='history' className='dark:bg-gray-900'>All History</option>
                                         <option value='completed' className='dark:bg-gray-900'>Completed</option>
                                         <option value='cancel' className='dark:bg-gray-900'>Cancelled / No Show</option>
                                     </select>
                                     <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                 </div>
                                
                                <div className='hidden sm:block ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                    Records Found: {counts[statusFilter] || 0}
                                </div>
                            </div>
                        </div>

                        <AppointmentTable 
                            appointments={filtered}
                            loading={loading}
                            error={error}
                            user={user}
                            openDropdown={openDropdown}
                            onToggleDropdown={toggleDropdown}
                            onViewDetails={handleViewDetails}
                        />

                        <AppointmentPagination 
                            page={page}
                            totalPages={totalPages}
                            goToPage={goToPage}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default AppointmentHistory;
