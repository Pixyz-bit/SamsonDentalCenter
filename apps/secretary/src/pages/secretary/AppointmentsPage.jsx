import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import Badge from '../../components/ui/Badge';
import AppointmentDetailView from '../../components/secretary/appointment_details';
import { 
    Search, 
    Calendar, 
    Users, 
    Filter, 
    Clock, 
    ArrowUpDown, 
    ChevronLeft, 
    ChevronRight, 
    Eye, 
    Plus,
    Tag,
    ShieldCheck,
    SearchX
} from 'lucide-react';

const APPOINTMENTS_DATA = [
    {
        id: 1,
        time: '9:00 AM',
        date: '2026-05-14',
        patient: { name: 'Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        doctor: { name: 'Dr. James Thompson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'Routine Cleaning', type: 'General' },
        status: 'Upcoming',
        source: 'Account Booking'
    },
    {
        id: 2,
        time: '11:30 AM',
        date: '2026-05-14',
        patient: { name: 'Jason Burn', avatar: 'https://i.pravatar.cc/150?u=jason' },
        doctor: { name: 'Dr. Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
        service: { name: 'Orthodontic Checkup', type: 'Specialized' },
        status: 'Completed',
        source: 'Guest Booking'
    },
    {
        id: 3,
        time: '2:30 PM',
        date: '2026-05-14',
        patient: { name: 'Elena Rodriguez', avatar: 'https://i.pravatar.cc/150?u=elena' },
        doctor: { name: 'Dr. Sarah Smith', avatar: 'https://i.pravatar.cc/150?u=sarah2' },
        service: { name: 'Root Canal', type: 'Specialized' },
        status: 'In Progress',
        source: 'Walk-in'
    },
    {
        id: 4,
        time: '4:00 PM',
        date: '2026-05-14',
        patient: { name: 'Michael Chang', avatar: 'https://i.pravatar.cc/150?u=michael' },
        doctor: { name: 'Dr. John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        service: { name: 'Consultation', type: 'General' },
        status: 'Upcoming',
        source: 'Account Booking'
    },
    {
        id: 5,
        time: '9:00 AM',
        date: '2026-05-15',
        patient: { name: 'Sophia Martinez', avatar: 'https://i.pravatar.cc/150?u=sophia' },
        doctor: { name: 'Dr. James Thompson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'Tooth Extraction', type: 'Specialized' },
        status: 'Upcoming',
        source: 'Guest Booking'
    },
    {
        id: 6,
        time: '10:30 AM',
        date: '2026-05-15',
        patient: { name: 'David Miller', avatar: 'https://i.pravatar.cc/150?u=david' },
        doctor: { name: 'Dr. Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
        service: { name: 'Cavity Filling', type: 'General' },
        status: 'Pending',
        source: 'Walk-in'
    },
    {
        id: 7,
        time: '1:00 PM',
        date: '2026-05-15',
        patient: { name: 'Isabella Garcia', avatar: 'https://i.pravatar.cc/150?u=isabella' },
        doctor: { name: 'Dr. John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        service: { name: 'Teeth Whitening', type: 'General' },
        status: 'Cancelled',
        source: 'Account Booking'
    },
    {
        id: 8,
        time: '3:30 PM',
        date: '2026-05-15',
        patient: { name: 'Robert Taylor', avatar: 'https://i.pravatar.cc/150?u=robert' },
        doctor: { name: 'Dr. Sarah Smith', avatar: 'https://i.pravatar.cc/150?u=sarah2' },
        service: { name: 'Dental Implants', type: 'Specialized' },
        status: 'Displaced',
        source: 'Guest Booking'
    }
];

const ITEMS_PER_PAGE = 8;

const AppointmentsPage = () => {
    const availableDoctors = useMemo(() => {
        return ['All Doctors', ...new Set(APPOINTMENTS_DATA.map(apt => apt.doctor.name))].sort();
    }, []);

    const availableServices = useMemo(() => {
        return ['All Services', ...new Set(APPOINTMENTS_DATA.map(apt => apt.service.name))].sort();
    }, []);

    const availableStatuses = ['All Statuses', 'Upcoming', 'In Progress', 'Completed', 'Pending', 'Cancelled', 'Displaced'];

    const [search, setSearch] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
    const [selectedService, setSelectedService] = useState('All Services');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [specificDate, setSpecificDate] = useState('2026-05-14');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedId = searchParams.get('id') ? parseInt(searchParams.get('id')) : null;

    const handleRowClick = (id) => setSearchParams({ id: id.toString() });
    const handleBack = () => setSearchParams({});

    const filtered = useMemo(() => {
        return APPOINTMENTS_DATA.filter(apt => {
            const matchesSearch = apt.patient.name.toLowerCase().includes(search.toLowerCase()) || 
                                apt.service.name.toLowerCase().includes(search.toLowerCase());
            const matchesDoctor = selectedDoctor === 'All Doctors' || apt.doctor.name === selectedDoctor;
            const matchesService = selectedService === 'All Services' || apt.service.name === selectedService;
            const matchesStatus = selectedStatus === 'All Statuses' || apt.status === selectedStatus;
            const matchesDate = !specificDate || apt.date === specificDate;

            return matchesSearch && matchesDoctor && matchesService && matchesStatus && matchesDate;
        });
    }, [search, selectedDoctor, selectedService, selectedStatus, specificDate]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return { color: 'success', label: 'Completed' };
            case 'In Progress': return { color: 'warning', label: 'In Progress' };
            case 'Upcoming': return { color: 'info', label: 'Upcoming' };
            case 'Pending': return { color: 'warning', label: 'Pending' };
            case 'Cancelled': return { color: 'error', label: 'Cancelled' };
            case 'Displaced': return { color: 'secondary', label: 'Displaced' };
            default: return { color: 'info', label: status };
        }
    };

    const getInitial = (name = '') => name.charAt(0).toUpperCase();

    const formatDateStr = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const selectedAppointment = useMemo(() => {
        if (!selectedId) return null;
        return APPOINTMENTS_DATA.find(a => Number(a.id) === Number(selectedId));
    }, [selectedId]);

    const breadcrumbTitle = selectedAppointment ? "Appointment Details" : "Appointments";

    return (
        <div className="flex flex-col min-h-[calc(100vh-140px)] w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle} 
                parentName={selectedAppointment ? "Appointments" : null}
                parentPath={selectedAppointment ? "/appointments" : null}
            />
            <div className="flex-1 min-h-[600px] flex flex-col sm:mb-6">
                {selectedAppointment ? (
                    <AppointmentDetailView 
                        appointment={selectedAppointment}
                        onBack={handleBack}
                        onCancel={() => alert('Cancel Appointment')}
                        onReschedule={() => alert('Reschedule Appointment')}
                        onComplete={() => alert('Mark as Completed')}
                    />
                ) : (
                <div className='flex-grow flex flex-col h-full bg-white dark:bg-white/[0.03] sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm'>
                        
                        {/* Aligned Toolbar - One to One with User Portal MyAppointments */}
                        <div className='border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-transparent'>
                            
                            {/* Row 1: Search & Action */}
                            <div className='px-4 sm:px-6 pt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                                <div className='relative flex-grow w-full'>
                                    <span className='absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400'>
                                        <Search size={18} />
                                    </span>
                                    <input
                                        type='text'
                                        placeholder='Search by patient or service...'
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className='w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium dark:text-white'
                                    />
                                </div>

                                <button
                                    className='hidden sm:flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-brand-500/20 shrink-0 whitespace-nowrap active:scale-95'
                                >
                                    <Plus size={18} />
                                    <span>New Appointment</span>
                                </button>
                            </div>

                            {/* Row 2: Filters */}
                            <div className='px-4 sm:px-6 pb-5 pt-2'>
                                <div className='flex flex-nowrap items-center gap-3 overflow-x-auto no-scrollbar py-2'>
                                    
                                    {/* 1. Doctor Filter */}
                                    <div className='relative w-[170px] sm:w-[210px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <Users size={16} />
                                        </div>
                                        <select
                                            value={selectedDoctor}
                                            onChange={(e) => setSelectedDoctor(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            {availableDoctors.map(doc => <option key={doc} value={doc} className='dark:bg-gray-900'>{doc}</option>)}
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    {/* 2. Service Filter */}
                                    <div className='relative w-[150px] sm:w-[190px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <Tag size={16} />
                                        </div>
                                        <select
                                            value={selectedService}
                                            onChange={(e) => setSelectedService(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            {availableServices.map(s => <option key={s} value={s} className='dark:bg-gray-900'>{s}</option>)}
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    {/* 3. Status Filter */}
                                    <div className='relative w-[150px] sm:w-[170px] shrink-0'>
                                        <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
                                            <ShieldCheck size={16} />
                                        </div>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className='w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 appearance-none outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer truncate'
                                        >
                                            {availableStatuses.map(st => <option key={st} value={st} className='dark:bg-gray-900'>{st}</option>)}
                                        </select>
                                        <div className='absolute right-4 top-4.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-gray-400 pointer-events-none' />
                                    </div>

                                    <div className='hidden lg:block ml-auto text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60'>
                                        Total Found: {filtered.length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List Body */}
                        <div className='overflow-y-auto grow pb-24 sm:pb-8 flex flex-col gap-0 sm:gap-4 p-0 sm:p-6 no-scrollbar'>
                            {paginated.length > 0 ? (
                                paginated.map((apt) => {
                                    const { color: badgeColor, label: displayStatus } = getStatusStyle(apt.status);
                                    
                                    return (
                                        <div 
                                            key={apt.id}
                                            onClick={() => handleRowClick(apt.id)}
                                            className='group relative bg-white dark:bg-white/[0.03] sm:rounded-xl border-b sm:border border-gray-100 dark:border-gray-800 sm:shadow-sm hover:shadow-md sm:hover:z-10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-row items-center'
                                        >
                                            {/* 1. Left Side: Schedule Block (Desktop Only) */}
                                            <div className='hidden sm:flex w-48 bg-gray-50/50 dark:bg-gray-800/20 border-r border-gray-200 dark:border-white/10 shrink-0 flex-col text-left py-1'>
                                                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                                                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Date</p>
                                                    <p className='text-[16px] font-medium text-gray-900 dark:text-white leading-tight'>
                                                        {formatDateStr(apt.date)}
                                                    </p>
                                                </div>
                                                <div className='h-px w-full bg-gray-200 dark:bg-white/5' />
                                                <div className='px-6 py-3 flex-1 flex flex-col justify-center'>
                                                    <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-0.5 tracking-wide'>Time</p>
                                                    <p className='text-[15px] font-medium text-brand-500 leading-tight'>
                                                        {apt.time.split('-')[0].trim()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* 2. Content Area */}
                                            <div className='flex-grow flex items-center min-w-0'>
                                                {/* Mobile View */}
                                                <div className='flex sm:hidden gap-4 w-full pl-6 pr-4 py-4 items-center'>
                                                    <div className='shrink-0'>
                                                        <div className='w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20'>
                                                            {getInitial(apt.patient.name)}
                                                        </div>
                                                    </div>
                                                    <div className='flex-grow min-w-0 flex flex-col gap-0.5'>
                                                        <div className='flex justify-between items-center min-w-0'>
                                                            <span className='text-[17px] font-medium text-gray-900 dark:text-white tracking-tight truncate flex-grow min-w-0'>
                                                                {apt.patient.name}
                                                            </span>
                                                            <div className='shrink-0 ml-2'>
                                                                <Badge size='sm' color={badgeColor} className='font-medium text-[10px] px-2.5 py-0.5 rounded-md'>
                                                                    {displayStatus}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className='text-[13px] truncate text-gray-500 dark:text-gray-400 font-medium leading-tight'>
                                                            {apt.service.name}
                                                        </div>
                                                        <div className='flex justify-between items-end mt-0.5'>
                                                            <div className='text-[11px] text-gray-700 dark:text-gray-400 font-medium truncate pr-4 flex items-center gap-1.5'>
                                                                <span>{apt.date}</span>
                                                                <span className='text-gray-400'>•</span>
                                                                <span className='text-gray-500/80'>{apt.time.split('-')[0].trim()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='shrink-0 text-brand-500 ml-2'>
                                                        <ChevronRight size={20} strokeWidth={3} />
                                                    </div>
                                                </div>

                                                {/* Desktop View */}
                                                <div className='hidden sm:flex flex-grow px-8 py-5 items-center gap-8 min-w-0'>
                                                    <div className='shrink-0'>
                                                        <img src={apt.patient.avatar} className='w-14 h-14 rounded-full border border-gray-100 shadow-sm object-cover' alt="" />
                                                    </div>
                                                    
                                                    <div className='flex flex-grow items-center min-w-0'>
                                                        <div className='flex flex-col min-w-0 w-[220px] shrink-0'>
                                                            <h3 className='text-[20px] font-medium text-gray-900 dark:text-white truncate leading-tight group-hover:text-brand-500 transition-colors'>
                                                                {apt.patient.name}
                                                            </h3>
                                                            <p className='text-[13px] font-medium text-gray-700 dark:text-gray-400'>Source: {apt.source}</p>
                                                        </div>

                                                        <div className='flex flex-col min-w-0 w-[240px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                                                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>Service & Doctor</p>
                                                            <div className='flex flex-col min-w-0'>
                                                                <span className='text-[16px] font-medium truncate text-gray-900 dark:text-white'>
                                                                    {apt.service.name}
                                                                </span>
                                                                <span className='text-[13px] font-medium text-gray-500 truncate italic'>
                                                                    with {apt.doctor.name}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className='flex flex-col min-w-0 w-[140px] shrink-0 px-8 border-l border-gray-100 dark:border-white/5'>
                                                            <p className='text-[12px] font-medium text-gray-700 dark:text-gray-400 mb-1'>Status</p>
                                                            <div>
                                                                <Badge size='sm' color={badgeColor} className='font-medium text-[11px] px-3.5 py-1 rounded-md'>
                                                                    {displayStatus}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className='flex-grow' />

                                                        <div className='shrink-0 ml-4 flex items-center justify-center p-3 bg-gray-50/80 dark:bg-white/[0.03] text-gray-400 hover:text-brand-500 rounded-xl border border-gray-100 dark:border-gray-800 transition-all active:scale-95'>
                                                            <Eye size={20} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className='flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-300'>
                                    <div className='w-20 h-20 bg-gray-50 dark:bg-white/[0.03] rounded-[32px] flex items-center justify-center mb-6'>
                                        <SearchX className='text-gray-300 dark:text-gray-700' size={32} />
                                    </div>
                                    <h3 className='text-lg font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight'>No matching appointments</h3>
                                    <p className='text-sm text-gray-400 max-w-[280px] font-medium leading-relaxed'>
                                        Refine your search or filters to locate specific entries.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className='relative z-30 bg-white dark:bg-gray-900 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0'>
                                <div className='flex flex-row items-center justify-between w-full'>
                                    <div className='hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest'>
                                        Page {currentPage} of {totalPages}
                                    </div>

                                    <div className='flex items-center gap-2 mx-auto sm:mx-0'>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-all'
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button 
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                className={`w-10 h-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                                                    currentPage === i + 1 
                                                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}

                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className='w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 transition-all'
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className='hidden sm:block w-[100px]' />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
    );
};

export default AppointmentsPage;
