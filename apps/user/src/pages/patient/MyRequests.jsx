import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Search, Clock, CheckCircle2, XCircle, ListFilter, Users, User, Plus, ArrowUpDown } from 'lucide-react';

const REQUEST_FILTERS = [
    { id: 'requests', label: 'All', icon: ListFilter },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle2 },
    { id: 'decline', label: 'Rejected', icon: XCircle },
];

const MyRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isMobileOpen } = useSidebar();
    const { dependents } = useDependents();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('requests');
    const [selectedPersonId, setSelectedPersonId] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    // Parse sortOrder into useAppointments parameters
    const getSortParams = (order) => {
        switch (order) {
            case 'newest': return { sortBy: 'created_at', sort: 'desc' };
            case 'oldest': return { sortBy: 'created_at', sort: 'asc' };
            case 'appointment': return { sortBy: 'appointment', sort: 'desc' };
            default: return { sortBy: 'created_at', sort: 'desc' };
        }
    };

    const { sortBy, sort } = getSortParams(sortOrder);

    // Dynamically use the selected status and person filter
    const { appointments, total, counts, page, totalPages, loading, error, goToPage } =
        useAppointments({ 
            status: statusFilter, 
            sort, 
            sortBy,
            limit: 10,
            patientId: selectedPersonId
        });

    // Client-side search against service / dentist / date
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
            <PageBreadcrumb pageTitle='My Requests' className='mb-4' />
            
            <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
                {error ? (
                    <ErrorState 
                        error={error} 
                        onRetry={() => goToPage(1)} 
                        title="Failed to load requests"
                        parentPath="/patient"
                        parentName="Dashboard"
                    />
                ) : (
                    <>
                        {/* Aligned Toolbar for Requests */}
                        <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                            {/* Search Row */}
                            <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                                <div className='relative flex-grow w-full'>
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search requests...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                                    />
                                </div>

                                <Link
                                    to='/patient/book?returnTo=/patient/requests'
                                    className='hidden sm:flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-brand-500/20 shrink-0 whitespace-nowrap'
                                >
                                    <Plus size={18} />
                                    <span>New Appointment</span>
                                </Link>
                            </div>

                            {/* Dropdown Filters Row */}
                            <div className='px-4 sm:px-6 pb-5 pt-2'>
                                <div className='flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-2'>
                                    {/* 1. Person Filter */}
                                    <div className='relative w-[170px] sm:w-[190px] shrink-0'>
                                    <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                        <Users size={16} />
                                    </div>
                                        <select
                                            value={selectedPersonId}
                                            onChange={(e) => setSelectedPersonId(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            <option value='all' className='dark:bg-gray-900'>All Relationships</option>
                                            <option value={user?.id} className='dark:bg-gray-900'>Me ({user?.full_name})</option>
                                            {dependents.map(dep => (
                                                <option key={dep.id} value={dep.id} className='dark:bg-gray-900'>
                                                    {dep.full_name} ({dep.relationship_to_primary})
                                                </option>
                                            ))}
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    {/* 2. Status Filter */}
                                    <div className='relative w-[150px] sm:w-[170px] shrink-0'>
                                    <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                        <ListFilter size={16} />
                                    </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            <option value='requests' className='dark:bg-gray-900'>All Statuses</option>
                                            <option value='pending' className='dark:bg-gray-900'>Pending Requests</option>
                                            <option value='approved' className='dark:bg-gray-900'>Approved Requests</option>
                                            <option value='decline' className='dark:bg-gray-900'>Rejected Requests</option>
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    {/* 3. Sort Filter */}
                                    <div className='relative w-[150px] sm:w-[170px] shrink-0'>
                                    <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                        <ArrowUpDown size={16} />
                                    </div>
                                        <select
                                            value={sortOrder}
                                            onChange={(e) => setSortOrder(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            <option value='newest' className='dark:bg-gray-900'>Newest Added</option>
                                            <option value='oldest' className='dark:bg-gray-900'>Oldest Added</option>
                                            <option value='appointment' className='dark:bg-gray-900'>Appointment Date</option>
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>
                                    
                                    <div className='hidden sm:block ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                        Total Requests: {counts[statusFilter] || 0}
                                    </div>
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

            {/* Floating Action Button - Mobile Only */}
            {!isMobileOpen && (
                <Link
                    to='/patient/book?returnTo=/patient/requests'
                    className={`fixed ${totalPages > 1 ? 'bottom-20' : 'bottom-8'} right-5 sm:hidden z-50 flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg shadow-2xl shadow-brand-500/40 active:scale-95 transition-all outline-none`}
                >
                    <Plus size={18} />
                    <span className='text-xs font-bold'>New Appointment</span>
                </Link>
            )}
        </>
    );
};

export default MyRequests;
