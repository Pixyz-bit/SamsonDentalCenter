import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { useSidebar } from '../../context/SidebarContext';
import useAppointments, {
    formatDate,
} from '../../hooks/useAppointments';
import { useDependents } from '../../hooks/useDependents';
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isWithinInterval,
    parseISO
} from 'date-fns';

// Extracted Components
import { PlusIcon } from '../../components/patient/appointments/AppointmentIcons';
import AppointmentTable from '../../components/patient/appointments/AppointmentTable';
import AppointmentPagination from '../../components/patient/appointments/AppointmentPagination';
import ErrorState from '../../components/common/ErrorState';
import { Search, Calendar, Users, Filter, Clock, ArrowUpDown } from 'lucide-react';

const MyAppointments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isMobileOpen } = useSidebar();
    const { dependents } = useDependents();
    const [openDropdown, setOpenDropdown] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedPersonId, setSelectedPersonId] = useState('all');
    const [timeframe, setTimeframe] = useState('all');
    const [specificDate, setSpecificDate] = useState('');
    const [sortOrder, setSortOrder] = useState('appointment');

    // Parse sortOrder into useAppointments parameters
    const getSortParams = (order) => {
        switch (order) {
            case 'newest': return { sortBy: 'created_at', sort: 'desc' };
            case 'oldest': return { sortBy: 'created_at', sort: 'asc' };
            case 'appointment': return { sortBy: 'appointment', sort: 'asc' };
            default: return { sortBy: 'appointment', sort: 'asc' };
        }
    };

    const { sortBy, sort } = getSortParams(sortOrder);

    // Strictly fetch upcoming appointments
    const { appointments, total, counts, page, totalPages, loading, error, goToPage } =
        useAppointments({
            status: 'upcoming',
            sort,
            sortBy,
            limit: 50, // Fetch more to allow effective client-side filtering
            patientId: selectedPersonId
        });

    // Client-side filtering for Search, Timeframe, and Specific Date
    const filtered = useMemo(() => {
        let result = [...appointments];

        // 1. Search Filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(a =>
                (a.service || '').toLowerCase().includes(q) ||
                (a.dentist || '').toLowerCase().includes(q) ||
                (formatDate(a.date) || '').toLowerCase().includes(q)
            );
        }

        // 2. Specific Date Filter (Overrides timeframe)
        if (specificDate) {
            result = result.filter(a => a.date === specificDate);
        }
        // 3. Timeframe Filter
        else if (timeframe !== 'all') {
            const now = new Date();
            let start, end;

            if (timeframe === 'today') {
                start = startOfDay(now);
                end = endOfDay(now);
            } else if (timeframe === 'week') {
                start = startOfWeek(now);
                end = endOfWeek(now);
            } else if (timeframe === 'month') {
                start = startOfMonth(now);
                end = endOfMonth(now);
            }

            result = result.filter(a => {
                const apptDate = parseISO(a.date);
                return isWithinInterval(apptDate, { start, end });
            });
        }

        return result;
    }, [appointments, search, timeframe, specificDate]);

    // Handle pagination of the filtered results
    const itemsPerPage = 10;
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    const filteredTotalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

    const toggleDropdown = (id) => setOpenDropdown(openDropdown === id ? null : id);

    const handleViewDetails = (id) => {
        setOpenDropdown(null);
        navigate(`/patient/appointments/${id}`);
    };

    return (
        <>
            <PageBreadcrumb pageTitle='My Appointments' className='mb-4' />

            <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden'>
                {error ? (
                    <ErrorState
                        error={error}
                        onRetry={() => goToPage(1)}
                        title="Failed to load appointments"
                        parentPath="/patient"
                        parentName="Dashboard"
                    />
                ) : (
                    <>
                        <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                            {/* Row 1: Search & Action Button */}
                            <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                                <div className='relative flex-grow w-full'>
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search by service or dentist...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                                    />
                                </div>

                                <Link
                                    to='/patient/book?returnTo=/patient/appointments'
                                    className='hidden sm:flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-brand-500/20 shrink-0 whitespace-nowrap'
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span>New Appointment</span>
                                </Link>
                            </div>

                            {/* Row 2: All Filters */}
                            <div className='px-4 sm:px-6 pb-5 pt-2'>
                                <div className='flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-2'>
                                    {/* 1. Family Member Dropdown */}
                                    <div className='relative w-[170px] sm:w-[230px] shrink-0'>
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

                                    {/* 2. Timeframe Dropdown */}
                                    <div className='relative w-[150px] sm:w-[170px] shrink-0'>
                                    <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                        <Clock size={16} />
                                    </div>
                                        <select
                                            value={timeframe}
                                            onChange={(e) => setTimeframe(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            <option value='all' className='dark:bg-gray-900'>Any Upcoming</option>
                                            <option value='today' className='dark:bg-gray-900'>Today</option>
                                            <option value='week' className='dark:bg-gray-900'>This Week</option>
                                            <option value='month' className='dark:bg-gray-900'>This Month</option>
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    {/* 3. Sort Dropdown */}
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

                                    {/* 3. Date Picker Filter */}
                                    <div className='relative w-[150px] sm:w-[190px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <Calendar size={16} />
                                        </div>
                                        <input
                                            type='date'
                                            value={specificDate}
                                            onChange={(e) => setSpecificDate(e.target.value)}
                                            onClick={(e) => e.target.showPicker?.()}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer color-scheme-dark'
                                        />
                                        {specificDate && (
                                            <button
                                                onClick={() => setSpecificDate('')}
                                                className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-brand-500 transition-colors'
                                                title="Clear date"
                                            >
                                                <span className='text-[10px] font-black bg-gray-100 dark:bg-white/10 w-5 h-5 flex items-center justify-center rounded-full'>✕</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className='hidden sm:block ml-auto text-[10px] font-bold text-gray-400 uppercase tracking-wider'>
                                        Upcoming: {filtered.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AppointmentTable
                            appointments={paginated}
                            loading={loading}
                            error={error}
                            user={user}
                            openDropdown={openDropdown}
                            onToggleDropdown={toggleDropdown}
                            onViewDetails={handleViewDetails}
                        />

                        <AppointmentPagination
                            page={page}
                            totalPages={filteredTotalPages}
                            goToPage={goToPage}
                        />
                    </>
                )}
            </div>

            {/* Floating Action Button - Mobile Only */}
            {!isMobileOpen && (
                <Link
                    to='/patient/book?returnTo=/patient/appointments'
                    className={`fixed ${totalPages > 1 ? 'bottom-20' : 'bottom-8'} right-5 sm:hidden z-50 flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-lg shadow-2xl shadow-brand-500/40 active:scale-95 transition-all outline-none`}
                >
                    <PlusIcon className="w-4 h-4" />
                    <span className='text-xs font-bold'>New Appointment</span>
                </Link>
            )}
        </>
    );
};

export default MyAppointments;
