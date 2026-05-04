import React, { useState, useMemo } from 'react';
import { Search, Calendar, ChevronDown, Plus, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import ApprovalDetailView from '../../components/secretary/approval_details';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';

const BOOKINGS_DATA = [
    {
        id: 1,
        date: '2026-04-27',
        startTime: '9:00 AM',
        endTime: '10:00 AM',
        patient: { name: 'Christopher Picarding', avatar: 'https://ui-avatars.com/api/?name=Christopher+Picarding&background=random' },
        service: { name: 'Routine Cleaning', type: 'General' },
        doctor: 'Dr. James Thompson',
        contact: '+63 917 123 4567',
        source: 'Walk-in'
    },
    {
        id: 2,
        date: '2026-04-27',
        startTime: '11:00 AM',
        endTime: '12:00 PM',
        patient: { name: 'Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?u=sarah' },
        service: { name: 'Tooth Extraction', type: 'General' },
        doctor: 'Dr. Emily Chen',
        contact: '+63 918 765 4321',
        source: 'Account User'
    },
    {
        id: 3,
        date: '2026-04-27',
        startTime: '2:30 PM',
        endTime: '3:30 PM',
        patient: { name: 'James Wilson', avatar: 'https://i.pravatar.cc/150?u=james' },
        service: { name: 'Root Canal', type: 'Specialized' },
        doctor: 'Dr. Sarah Smith',
        contact: '+63 919 444 2211',
        source: 'Guest Booking'
    },
    {
        id: 4,
        date: '2026-04-27',
        startTime: '4:00 PM',
        endTime: '5:00 PM',
        patient: { name: 'Michael Chang', avatar: 'https://i.pravatar.cc/150?u=michael' },
        service: { name: 'Consultation', type: 'General' },
        doctor: 'Dr. John Doe',
        contact: '+63 920 111 3333',
        source: 'Walk-in'
    },
    {
        id: 5,
        date: '2026-04-28',
        startTime: '9:30 AM',
        endTime: '10:30 AM',
        patient: { name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?u=emma' },
        service: { name: 'Implant Consultation', type: 'Specialized' },
        doctor: 'Dr. Alan Smith',
        contact: '+63 921 555 6666',
        source: 'Account User'
    },
    {
        id: 6,
        date: '2026-04-27',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        patient: { name: 'David Miller', avatar: 'https://i.pravatar.cc/150?u=david' },
        service: { name: 'Deep Cleaning', type: 'General' },
        doctor: 'Dr. Emily Chen',
        contact: '+63 922 888 9999',
        source: 'Walk-in'
    },
    {
        id: 7,
        date: '2026-04-27',
        startTime: '1:30 PM',
        endTime: '2:30 PM',
        patient: { name: 'Sophia Garcia', avatar: 'https://i.pravatar.cc/150?u=sophia' },
        service: { name: 'Braces Adjustment', type: 'Specialized' },
        doctor: 'Dr. Sarah Smith',
        contact: '+63 923 000 1111',
        source: 'Guest Booking'
    }
];

const ITEMS_PER_PAGE = 5;

const BookingPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSource, setSelectedSource] = useState('All');
    const [selectedDate, setSelectedDate] = useState('2026-04-27');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const filteredBookings = useMemo(() => {
        return BOOKINGS_DATA.filter(booking => {
            const matchesSearch = booking.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 booking.service.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSource = selectedSource === 'All' || booking.source === selectedSource;
            const matchesDate = !selectedDate || booking.date === selectedDate;
            return matchesSearch && matchesSource && matchesDate;
        });
    }, [searchQuery, selectedSource, selectedDate]);

    const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Transform selected booking to match ApprovalContextView expectations
    const requestForContext = selectedBooking ? {
        id: selectedBooking.id,
        patient: {
            name: selectedBooking.patient.name,
            phone: selectedBooking.contact || 'N/A',
            email: 'N/A', // Mocked
            noShowCount: 0,
            cancellationCount: 0,
            isBookingRestricted: false
        },
        service: selectedBooking.service.name,
        requestedDate: selectedBooking.date,
        requestedTime: selectedBooking.startTime,
        dentist: selectedBooking.doctor
    } : null;

    if (selectedBooking) {
        return (
            <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
                <PageBreadcrumb 
                    pageTitle="Booking Details" 
                    parentName="Booking Desk" 
                    parentPath="/booking" 
                />
                
                <div className="grow flex flex-col bg-white dark:bg-white/[0.03] sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        <ApprovalDetailView 
                            request={requestForContext}
                            onBack={() => setSelectedBooking(null)}
                            onApprove={() => {
                                console.log('Booking confirmed/approved:', selectedBooking.id);
                                setSelectedBooking(null);
                            }}
                            onReject={(reason) => {
                                console.log('Booking rejected:', selectedBooking.id, reason);
                                setSelectedBooking(null);
                            }}
                            busySlots={[15, 30, 55]} 
                            slotPosition={10} 
                            timeStr={selectedBooking.startTime}
                            completedCount={0}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle="Booking Desk" 
                subtitle="Manage patient arrivals and session check-ins."
            />

            <div className="grow flex flex-col bg-white dark:bg-white/[0.03] sm:rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Header Section (Filters & Action) */}
                <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                            <div className="md:col-span-2 lg:col-span-7 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Search size={20} />
                                </div>
                                <input 
                                    type="text"
                                    placeholder="Search by patient or service..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500 transition-all shadow-sm"
                                />
                            </div>
                            
                            <div className="md:col-span-1 lg:col-span-2 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                    <Calendar size={18} />
                                </div>
                                <input 
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                                />
                            </div>

                            <div className="md:col-span-1 lg:col-span-3 relative">
                                <select 
                                    value={selectedSource}
                                    onChange={(e) => { setSelectedSource(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer appearance-none"
                                >
                                    <option value="All">All Booking Sources</option>
                                    <option value="Walk-in">Walk-in</option>
                                    <option value="Account User">Account User</option>
                                    <option value="Guest Booking">Guest Booking</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 w-full lg:w-auto shrink-0">
                            <Plus size={20} />
                            <span>New Booking</span>
                        </button>
                    </div>
                </div>

                {/* List Area */}
                <div className="grow flex flex-col overflow-y-auto no-scrollbar">
                    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
                        {paginatedBookings.length > 0 ? (
                        paginatedBookings.map((booking) => (
                            <div 
                                key={booking.id} 
                                onClick={() => setSelectedBooking(booking)}
                                className="flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
                            >
                                {/* Time Sidebar */}
                                <div className="flex flex-row sm:flex-col w-full sm:w-[130px] bg-gray-50/50 dark:bg-gray-800/20 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0">
                                    <div className="flex-1 flex flex-col justify-center px-4 py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Start Time</span>
                                        <span className="text-sm sm:text-base font-semibold text-[#0B1120] dark:text-white font-outfit truncate">{booking.startTime}</span>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center px-4 py-3">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">End Time</span>
                                        <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 font-outfit truncate">{booking.endTime}</span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 flex flex-col sm:flex-row xl:items-center p-4 sm:p-5 lg:px-6 gap-4 lg:gap-6 min-w-0 w-full overflow-hidden">
                                    {/* Patient Info */}
                                    <div className="flex items-center gap-3 w-full sm:w-48 xl:w-64 shrink-0">
                                        <div className="relative shrink-0">
                                            <img alt={booking.patient.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover" src={booking.patient.avatar} />
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#111827] rounded-full"></div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit group-hover:text-brand-500 transition-colors truncate">{booking.patient.name}</span>
                                            <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Patient Record</span>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 xl:flex xl:flex-1 gap-y-4 gap-x-4 xl:gap-6 min-w-0">
                                        <div className="flex flex-col min-w-0 xl:w-[30%]">
                                            <span className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${booking.service.type === 'Specialized' ? 'text-brand-500' : 'text-gray-400'}`}>
                                                {booking.service.type} Service
                                            </span>
                                            <span className="text-xs sm:text-sm font-semibold text-[#0B1120] dark:text-white truncate" title={booking.service.name}>{booking.service.name}</span>
                                        </div>
                                        
                                        <div className="flex flex-col min-w-0 xl:w-[25%]">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Doctor</span>
                                            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={booking.doctor}>{booking.doctor}</span>
                                        </div>

                                        <div className="flex flex-col min-w-0 xl:w-[25%]">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Contact</span>
                                            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                                                <Phone size={14} className="text-emerald-500 shrink-0" />
                                                <span className="truncate" title={booking.contact}>{booking.contact}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col min-w-0 xl:w-[20%]">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Source</span>
                                            <div className="truncate">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter inline-block truncate max-w-full ${
                                                    booking.source === 'Walk-in' ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' : 
                                                    booking.source === 'Account User' ? 'text-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'text-purple-500 bg-purple-50 dark:bg-purple-500/10'
                                                }`} title={booking.source}>
                                                    {booking.source}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Area */}
                                    <div className="flex items-center justify-end w-full xl:w-auto mt-2 xl:mt-0 shrink-0 gap-3">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Cancel clicked');
                                            }}
                                            className="flex-1 sm:flex-none px-4 py-2 text-red-500 dark:text-red-400 text-xs sm:text-sm font-bold rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Reschedule clicked');
                                            }}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all active:scale-95 whitespace-nowrap"
                                        >
                                            Reschedule
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-gray-50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                            <p className="text-gray-500 font-medium font-outfit">No bookings found for the selected criteria</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col items-center justify-center mt-10 pb-8 gap-4 border-t border-gray-100 dark:border-gray-800 pt-10 shrink-0">
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"><ChevronLeft size={18} /></button>
                                <div className="flex items-center gap-1.5">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all shadow-sm ${currentPage === i + 1 ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500'}`}>{i + 1}</button>
                                    ))}
                                </div>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm"><ChevronRight size={18} /></button>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Showing <span className="font-semibold text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-semibold text-gray-900 dark:text-white">{Math.min(startIndex + ITEMS_PER_PAGE, filteredBookings.length)}</span> of <span className="font-semibold text-gray-900 dark:text-white">{filteredBookings.length}</span> results
                            </p>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
