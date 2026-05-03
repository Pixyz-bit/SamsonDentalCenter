import React, { useState, useEffect } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import Badge from '../../components/ui/Badge';
import { Calendar as CalendarIcon, ChevronDown, Plus, Search, ChevronLeft, ChevronRight, Users, Tag, ShieldCheck, Eye, MousePointer2 } from 'lucide-react';

const DOCTORS = [
    'All',
    'Dr. James Thompson',
    'Dr. Emily Chen',
    'Dr. Sarah Smith',
    'Dr. John Doe',
];

const SERVICE_TYPES = ['All', 'General', 'Specialized'];

const STATUSES = ['All', 'Displaced', 'Upcoming', 'In Progress', 'Completed', 'Pending', 'Cancelled'];
const SOURCES = ['All', 'Walk-in', 'Guest Booking', 'Account Booking'];

const ITEMS_PER_PAGE = 5;

const APPOINTMENTS_DATA = [
    {
        id: 1,
        time: '9:00 AM',
        date: 'May 14',
        patient: { name: 'Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        doctor: { name: 'Dr. James Thompson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'Routine Cleaning', type: 'General' },
        status: 'Completed'
    },
    {
        id: 2,
        time: '11:00 AM',
        date: 'May 14',
        patient: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=jamesw' },
        doctor: { name: 'Dr. Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
        service: { name: 'Orthodontic Checkup', type: 'Specialized' },
        status: 'Completed'
    },
    {
        id: 3,
        time: '2:30 PM',
        date: 'May 14',
        patient: { name: 'Elena Rodriguez', avatar: 'https://i.pravatar.cc/150?u=elena' },
        doctor: { name: 'Dr. Sarah Smith', avatar: 'https://i.pravatar.cc/150?u=sarah2' },
        service: { name: 'Root Canal', type: 'Specialized' },
        status: 'In Progress'
    },
    {
        id: 4,
        time: '4:00 PM',
        date: 'May 14',
        patient: { name: 'Michael Chang', avatar: 'https://i.pravatar.cc/150?u=michael' },
        doctor: { name: 'Dr. John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        service: { name: 'Consultation', type: 'General' },
        status: 'Upcoming'
    },
    {
        id: 5,
        time: '9:00 AM',
        date: 'May 15',
        patient: { name: 'Sophia Martinez', avatar: 'https://i.pravatar.cc/150?u=sophia' },
        doctor: { name: 'Dr. James Thompson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'Tooth Extraction', type: 'Specialized' },
        status: 'Upcoming'
    },
    {
        id: 6,
        time: '10:30 AM',
        date: 'May 15',
        patient: { name: 'David Miller', avatar: 'https://i.pravatar.cc/150?u=david' },
        doctor: { name: 'Dr. Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
        service: { name: 'Cavity Filling', type: 'General' },
        status: 'Pending'
    },
    {
        id: 7,
        time: '1:00 PM',
        date: 'May 15',
        patient: { name: 'Isabella Garcia', avatar: 'https://i.pravatar.cc/150?u=isabella' },
        doctor: { name: 'Dr. John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        service: { name: 'Teeth Whitening', type: 'General' },
        status: 'Cancelled'
    },
    {
        id: 8,
        time: '3:30 PM',
        date: 'May 15',
        patient: { name: 'Robert Taylor', avatar: 'https://i.pravatar.cc/150?u=robert' },
        doctor: { name: 'Dr. Sarah Smith', avatar: 'https://i.pravatar.cc/150?u=sarah2' },
        service: { name: 'Dental Implants', type: 'Specialized' },
        status: 'Displaced'
    },
    {
        id: 9,
        time: '8:30 AM',
        date: 'May 16',
        patient: { name: 'Olivia Brown', avatar: 'https://i.pravatar.cc/150?u=olivia' },
        doctor: { name: 'Dr. Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
        service: { name: 'Checkup', type: 'General' },
        status: 'Upcoming'
    },
    {
        id: 10,
        time: '10:00 AM',
        date: 'May 16',
        patient: { name: 'William Jones', avatar: 'https://i.pravatar.cc/150?u=william' },
        doctor: { name: 'Dr. James Thompson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'Bridge Work', type: 'Specialized' },
        status: 'Upcoming'
    },
    {
        id: 11,
        time: '11:30 AM',
        date: 'May 16',
        patient: { name: 'Emily Davis', avatar: 'https://i.pravatar.cc/150?u=emilyd' },
        doctor: { name: 'Dr. John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        service: { name: 'Routine Cleaning', type: 'General' },
        status: 'Pending'
    },
    {
        id: 12,
        time: '2:00 PM',
        date: 'May 16',
        patient: { name: 'Liam Wilson', avatar: 'https://i.pravatar.cc/150?u=liam' },
        doctor: { name: 'Dr. Sarah Smith', avatar: 'https://i.pravatar.cc/150?u=sarah2' },
        service: { name: 'Wisdom Tooth Removal', type: 'Specialized' },
        status: 'In Progress'
    },
    {
        id: 13,
        time: '4:30 PM',
        date: 'May 16',
        patient: { name: 'Ava Johnson', avatar: 'https://i.pravatar.cc/150?u=ava' },
        doctor: { name: 'Dr. Emily Chen', avatar: 'https://i.pravatar.cc/150?u=emily' },
        service: { name: 'Consultation', type: 'General' },
        status: 'Completed'
    },
    {
        id: 14,
        time: '9:30 AM',
        date: 'May 17',
        patient: { name: 'Noah Martinez', avatar: 'https://i.pravatar.cc/150?u=noah' },
        doctor: { name: 'Dr. James Thompson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'X-Ray Scan', type: 'General' },
        status: 'Upcoming'
    },
    {
        id: 15,
        time: '1:30 PM',
        date: 'May 17',
        patient: { name: 'Charlotte Clark', avatar: 'https://i.pravatar.cc/150?u=charlotte' },
        doctor: { name: 'Dr. John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
        service: { name: 'Periodontal Therapy', type: 'Specialized' },
        status: 'Upcoming',
        source: 'Guest Booking'
    }
];

// Helper to assign random sources to initial data for demo
APPOINTMENTS_DATA.forEach((apt, i) => {
    if (!apt.source) {
        const sources = ['Walk-in', 'Guest Booking', 'Account Booking'];
        apt.source = sources[i % sources.length];
    }
});

const AppointmentsPage = () => {
    const [selectedDate, setSelectedDate] = useState('2026-05-14');
    const [selectedDoctor, setSelectedDoctor] = useState('All');
    const [selectedServiceType, setSelectedServiceType] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedSource, setSelectedSource] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, selectedDoctor, selectedServiceType, selectedStatus, selectedSource]);

    const getStatusBadge = (status) => {
        const colorMap = {
            'In Progress': 'warning',
            'Upcoming': 'info',
            'Completed': 'success',
            'Displaced': 'secondary',
            'Pending': 'warning',
            'Cancelled': 'error',
        };
        const color = colorMap[status] || 'light';
        
        return (
            <Badge variant="light" color={color} size="sm" className="sm:size-auto">
                <span className="px-1 py-0.5 font-bold tracking-wide text-[9px] sm:text-[10px] uppercase">{status}</span>
            </Badge>
        );
    };

    const filteredAppointments = APPOINTMENTS_DATA.filter((apt) => {
        const matchDoctor = selectedDoctor === 'All' ? true : apt.doctor.name === selectedDoctor;
        const matchService = selectedServiceType === 'All' ? true : apt.service.type === selectedServiceType;
        const matchStatus = selectedStatus === 'All' ? true : apt.status === selectedStatus;
        const matchSource = selectedSource === 'All' ? true : apt.source === selectedSource;
        
        return matchDoctor && matchService && matchStatus && matchSource;
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}, 2026 ${a.time}`);
        const dateB = new Date(`${b.date}, 2026 ${b.time}`);
        return dateA - dateB;
    });

    const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE) || 1;
    const currentAppointments = filteredAppointments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            {/* Page Header Outside Container */}
            <PageBreadcrumb 
                pageTitle="Appointments" 
                subtitle="Manage clinic schedule and bookings."
            />

            <div className="grow flex flex-col bg-white dark:bg-white/[0.03] sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Header Section (Filters Only) */}
                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 space-y-4">

                    {/* Quick Filters */}
                    {/* Quick Filters */}
                    <div className="flex flex-row flex-wrap items-center gap-3">
                        <div className="relative group w-full xs:w-[calc(50%-6px)] md:w-[200px] lg:flex-1 min-w-[140px]">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors z-10">
                                <CalendarIcon size={16} />
                            </div>
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0B1120]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                            />
                        </div>

                        <div className="relative group w-full xs:w-[calc(50%-6px)] md:w-[220px] lg:flex-1 min-w-[160px]">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors z-10">
                                <Users size={16} />
                            </div>
                            <select 
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0B1120]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                            >
                                {DOCTORS.map(doc => (
                                    <option key={doc} value={doc}>{doc === 'All' ? 'All Doctors' : doc}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors" />
                        </div>

                        <div className="relative group w-full xs:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 min-w-[150px]">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors z-10">
                                <Tag size={16} />
                            </div>
                            <select 
                                value={selectedServiceType}
                                onChange={(e) => setSelectedServiceType(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0B1120]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                            >
                                {SERVICE_TYPES.map(type => (
                                    <option key={type} value={type}>{type === 'All' ? 'All Services' : type}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors" />
                        </div>

                        <div className="relative group w-full xs:w-[calc(50%-6px)] md:w-[170px] lg:flex-1 min-w-[140px]">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors z-10">
                                <ShieldCheck size={16} />
                            </div>
                            <select 
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0B1120]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                            >
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>{status === 'All' ? 'All Status' : status}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors" />
                        </div>

                        <div className="relative group w-full xs:w-[calc(50%-6px)] md:w-[180px] lg:flex-1 min-w-[150px]">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors z-10">
                                <MousePointer2 size={16} />
                            </div>
                            <select 
                                value={selectedSource}
                                onChange={(e) => setSelectedSource(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#0B1120]/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                            >
                                {SOURCES.map(source => (
                                    <option key={source} value={source}>{source === 'All' ? 'All Sources' : source}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors" />
                        </div>

                        <div className="w-full lg:w-auto lg:ml-auto">
                            <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm hover:shadow-md w-full lg:w-auto">
                                <Plus size={18} />
                                <span>New Appointment</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grow flex flex-col overflow-y-auto no-scrollbar">
                    <div className="flex flex-col gap-4 p-4 sm:p-6 lg:p-8 pb-24">
                        {currentAppointments.length > 0 ? (
                            currentAppointments.map((apt) => (
                                <div 
                                    key={apt.id} 
                                    className="flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
                                >
                                    {/* Left Time/Date Column */}
                                    <div className="flex flex-row sm:flex-col w-full sm:w-[130px] bg-gray-50/50 dark:bg-gray-800/20 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0">
                                        <div className="flex-1 flex flex-col justify-center px-4 py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Time</span>
                                            <span className="text-sm sm:text-base font-semibold text-[#0B1120] dark:text-white font-outfit truncate">{apt.time}</span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-4 py-3">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Date</span>
                                            <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 font-outfit truncate">{apt.date}</span>
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-5 lg:px-6 gap-4 md:gap-6 min-w-0 w-full">
                                        
                                        {/* Patient Info */}
                                        <div className="flex items-center gap-4 w-full lg:w-[260px] shrink-0">
                                            <div className="relative shrink-0">
                                                <img 
                                                    src={apt.patient.avatar} 
                                                    alt={apt.patient.name} 
                                                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover" 
                                                />
                                                <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-[#111827] rounded-full shadow-sm ${
                                                    apt.status === 'In Progress' ? 'bg-amber-500 animate-pulse' : 
                                                    apt.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'
                                                }`}></div>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit group-hover:text-brand-500 transition-colors truncate">
                                                    {apt.patient.name}
                                                </span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="soft" color={apt.source === 'Walk-in' ? 'secondary' : apt.source === 'Guest Booking' ? 'info' : 'primary'} size="xs">
                                                        <span className="text-[9px] leading-none uppercase font-bold tracking-tight">{apt.source}</span>
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-y-4 gap-x-6 xl:gap-x-12 w-full lg:flex-1 min-w-0">
                                            {/* Service & Doctor */}
                                            <div className="flex-[1.5] flex flex-row gap-6 min-w-0">
                                                <div className="flex-[1.3] flex flex-col min-w-0">
                                                    <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                                                        apt.service.type === 'Specialized' ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'
                                                    }`}>
                                                        {apt.service.type} Service
                                                    </span>
                                                    <span className="text-xs sm:text-sm font-bold text-[#0B1120] dark:text-white truncate" title={apt.service.name}>{apt.service.name}</span>
                                                </div>
                                                <div className="flex-1 flex flex-col min-w-0">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Doctor</span>
                                                    <div className="flex items-center gap-2 truncate">
                                                        <img src={apt.doctor.avatar} alt="" className="w-5 h-5 rounded-full shrink-0" />
                                                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={apt.doctor.name}>{apt.doctor.name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status */}
                                            <div className="flex-1 flex flex-row gap-6 min-w-0">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Status</span>
                                                    <div className="flex items-center">
                                                        {getStatusBadge(apt.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end w-full lg:w-[100px] mt-2 lg:mt-0 shrink-0">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle View Details logic if needed
                                                }}
                                                className="flex items-center justify-center p-3 bg-gray-50/80 dark:bg-white/[0.03] backdrop-blur-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-500/20 transition-all duration-300 active:scale-95 group/eye shadow-sm hover:shadow-md" 
                                                title="View Details"
                                            >
                                                <Eye size={19} className="group-hover/eye:scale-110 transition-transform duration-300" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-4">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No appointments found</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                                    Try adjusting your filters or search query to find what you're looking for.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination Footer */}
                {filteredAppointments.length > 0 && (
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 dark:border-gray-800 mt-auto">
                        <div className="flex items-center justify-center gap-2">
                            <button 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-all"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-sm ${
                                            currentPage === page 
                                                ? 'bg-brand-500 text-white' 
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-all"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsPage;
