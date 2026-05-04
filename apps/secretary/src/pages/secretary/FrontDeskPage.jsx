import React, { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { CheckCircle2, CalendarClock, CalendarDays, UserX, Undo2, Eye } from 'lucide-react';
import ApprovalDetailView from '../../components/secretary/approval_details';
import RealTimeClock from '../../components/common/RealTimeClock';
import CheckoutView from '../../components/secretary/patients/appointments/CheckoutView';
import HistoryDetailView from '../../components/secretary/patients/history/HistoryDetailView';

const mockFrontDeskAppointments = [
    {
        id: 1,
        status: 'Upcoming',
        startTime: '9:00 AM',
        endTime: '10:00 AM',
        service: 'Routine Cleaning',
        patient: 'Christopher Picarding',
        patientAvatar: 'https://ui-avatars.com/api/?name=Christopher+Picarding&background=random',
        doctor: 'Dr. James Thompson',
        doctorAvatar: 'https://ui-avatars.com/api/?name=James+Thompson&background=random',
        specialty: 'General Dentistry',
        phone: '+63 917 123 4567',
    },
    {
        id: 2,
        status: 'In Progress',
        startTime: '10:30 AM',
        endTime: '11:30 AM',
        service: 'Orthodontic Checkup',
        patient: 'Sarah Mitchell',
        patientAvatar: 'https://ui-avatars.com/api/?name=Sarah+Mitchell&background=random',
        doctor: 'Dr. Emily Chen',
        doctorAvatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=random',
        specialty: 'Specialized Dentistry',
        phone: '+63 920 987 6543',
    },
    {
        id: 3,
        status: 'Upcoming',
        startTime: '1:00 PM',
        endTime: '2:00 PM',
        service: 'Tooth Extraction',
        patient: 'James Wilson',
        patientAvatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=random',
        doctor: 'Dr. Alan Smith',
        doctorAvatar: 'https://ui-avatars.com/api/?name=Alan+Smith&background=random',
        specialty: 'Oral Surgery',
        phone: '+63 932 555 7890',
    },
    {
        id: 4,
        status: 'Completed',
        startTime: '8:00 AM',
        endTime: '9:00 AM',
        service: 'Initial Consultation',
        patient: 'Michael Scott',
        patientAvatar: 'https://ui-avatars.com/api/?name=Michael+Scott&background=random',
        doctor: 'Dr. Emily Chen',
        doctorAvatar: 'https://ui-avatars.com/api/?name=Emily+Chen&background=random',
        specialty: 'Specialized Dentistry',
        phone: '+63 999 111 2222',
    },
    {
        id: 5,
        status: 'No Show',
        startTime: '2:30 PM',
        endTime: '3:30 PM',
        service: 'Tooth Extraction',
        patient: 'Emma Thompson',
        patientAvatar: 'https://ui-avatars.com/api/?name=Emma+Thompson&background=random',
        doctor: 'Dr. James Thompson',
        doctorAvatar: 'https://ui-avatars.com/api/?name=James+Thompson&background=random',
        specialty: 'Oral Surgery',
        phone: '+63 932 555 1111',
    }
];

const FrontDeskPage = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [appointments, setAppointments] = useState(mockFrontDeskAppointments);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);

    const handleStatusChange = (id, newStatus) => {
        if (newStatus === 'Completed') {
            const apt = appointments.find(a => a.id === id);
            setSelectedApt(apt);
            setIsCheckingOut(true);
            return;
        }

        setAppointments(prev => prev.map(apt => 
            apt.id === id ? { ...apt, status: newStatus } : apt
        ));
    };

    const handleViewDetails = (apt) => {
        setSelectedApt(apt);
        setIsCheckingOut(apt.status === 'In Progress');
    };

    const handleCheckOutConfirm = (id, treatmentNotes, doctorNotes) => {
        console.log('Completing appointment:', id, { treatmentNotes, doctorNotes });
        setAppointments(prev => prev.map(apt => 
            apt.id === id ? { ...apt, status: 'Completed', treatmentNotes, doctorNotes } : apt
        ));
        setIsCheckingOut(false);
        setSelectedApt(null);
    };

    const filteredAppointments = appointments.filter(apt => apt.status === activeTab);
   
    // Calculate counts
    const upcomingCount = appointments.filter(apt => apt.status === 'Upcoming').length;
    const inProgressCount = appointments.filter(apt => apt.status === 'In Progress').length;
    const completedCount = appointments.filter(apt => apt.status === 'Completed').length;
    const noShowCount = appointments.filter(apt => apt.status === 'No Show').length;

    // Transform selected appointment to match ApprovalContextView expectations
    const requestForContext = selectedApt ? {
        id: selectedApt.id,
        patient: {
            name: selectedApt.patient,
            phone: selectedApt.phone || 'N/A',
            email: selectedApt.email || 'N/A',
            noShowCount: 0, // Mocked or fetched from elsewhere
            cancellationCount: 0,
            isBookingRestricted: false
        },
        service: selectedApt.service,
        requestedDate: new Date().toISOString().split('T')[0], // Assuming today for front desk
        requestedTime: selectedApt.startTime,
        dentist: selectedApt.doctor
    } : null;

    if (selectedApt && isCheckingOut) {
        return (
            <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <CheckoutView 
                    appointment={selectedApt}
                    patient={{
                        full_name: selectedApt.patient,
                        phone: selectedApt.phone
                    }}
                    onBack={() => {
                        setIsCheckingOut(false);
                        setSelectedApt(null);
                    }}
                    onConfirm={() => handleCheckOutConfirm(selectedApt.id)}
                />
            </div>
        );
    }

    if (selectedApt && !isCheckingOut) {
        const isHistory = selectedApt.status === 'Completed' || selectedApt.status === 'No Show';

        return (
            <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
                <PageBreadcrumb 
                    pageTitle={isHistory ? "Clinical Record" : "Appointment Details"} 
                    parentName="Front Desk" 
                    parentPath="/secretary/front-desk" 
                />
                <div className="mt-6 flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-theme-sm overflow-hidden">
                    {isHistory ? (
                        <HistoryDetailView 
                            historyItem={{
                                ...selectedApt,
                                date: 'Apr 20, 2026', // Mock date for detail consistency
                                doctor: selectedApt.doctor
                            }}
                            patient={{
                                full_name: selectedApt.patient,
                                phone: selectedApt.phone
                            }}
                            onBack={() => setSelectedApt(null)}
                        />
                    ) : (
                        <ApprovalDetailView 
                            request={requestForContext}
                            onBack={() => setSelectedApt(null)}
                            onApprove={() => {
                                handleStatusChange(selectedApt.id, selectedApt.status === 'Upcoming' ? 'In Progress' : 'Completed');
                                setSelectedApt(null);
                            }}
                            onReject={(_reason) => {
                                handleStatusChange(selectedApt.id, 'No Show');
                                setSelectedApt(null);
                            }}
                            isBookingMode={true}
                            busySlots={[15, 30, 55]} // Match snippet
                            slotPosition={10} // Match snippet
                            timeStr={selectedApt.startTime}
                            completedCount={completedCount}
                            breadcrumbItems={[
                                { label: 'Home', href: '/secretary' },
                                { label: 'Front Desk', href: '/secretary/front-desk' },
                                { label: 'Appointment Details' }
                            ]}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle="Front Desk" 
                subtitle="Manage patient arrivals, departures, and checkouts." 
            />
           
            <div className="grow flex flex-col min-h-0">
                <div className="grow flex flex-col bg-white dark:bg-white/[0.03] sm:rounded-3xl border-t sm:border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
                        {/* Tabs & Date Selection Row */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 dark:border-gray-800 gap-4 sm:gap-0">
                            <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center w-full sm:w-auto shrink-0 pb-px overflow-hidden">
                                <button 
                                    onClick={() => setActiveTab('Upcoming')}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 pb-2.5 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === 'Upcoming' ? 'border-brand-500 text-[#0B1120] dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                >
                                    <CalendarClock size={16} className={`shrink-0 hidden sm:block ${activeTab === 'Upcoming' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400'}`} />
                                    <span className={`font-semibold text-[10px] xs:text-xs sm:text-base ${activeTab === 'Upcoming' ? '' : 'font-medium'}`}>Upcoming</span>
                                    <span className={`sm:ml-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${activeTab === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {upcomingCount}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => setActiveTab('In Progress')}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 pb-2.5 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === 'In Progress' ? 'border-brand-500 text-[#0B1120] dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                >
                                    <div className="hidden sm:block">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${activeTab === 'In Progress' ? 'text-amber-500' : 'text-gray-400'}`}><path d="M12 3a9 9 0 0 1 0 18"/><path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9" strokeDasharray="4 5"/><path d="M8 12l3 3 5-5"/></svg>
                                    </div>
                                    <span className={`font-semibold text-[10px] xs:text-xs sm:text-base ${activeTab === 'In Progress' ? '' : 'font-medium'}`}>In Progress</span>
                                    <span className={`sm:ml-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${activeTab === 'In Progress' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {inProgressCount}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => setActiveTab('Completed')}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 pb-2.5 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === 'Completed' ? 'border-brand-500 text-[#0B1120] dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                >
                                    <CheckCircle2 size={16} className={`shrink-0 hidden sm:block ${activeTab === 'Completed' ? 'text-emerald-500' : 'text-gray-400'}`} />
                                    <span className={`font-semibold text-[10px] xs:text-xs sm:text-base ${activeTab === 'Completed' ? '' : 'font-medium'}`}>Completed</span>
                                    <span className={`sm:ml-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${activeTab === 'Completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {completedCount}
                                    </span>
                                </button>

                                <button 
                                    onClick={() => setActiveTab('No Show')}
                                    className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 pb-2.5 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === 'No Show' ? 'border-brand-500 text-[#0B1120] dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                >
                                    <UserX size={16} className={`shrink-0 hidden sm:block ${activeTab === 'No Show' ? 'text-red-500' : 'text-gray-400'}`} />
                                    <span className={`font-semibold text-[10px] xs:text-xs sm:text-base ${activeTab === 'No Show' ? '' : 'font-medium'}`}>No Show</span>
                                    <span className={`sm:ml-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold ${activeTab === 'No Show' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {noShowCount}
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <RealTimeClock />
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800/80 rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-3 sm:mb-2 shadow-sm w-fit">
                                    <CalendarDays size={14} className="text-gray-400 dark:text-gray-500 shrink-0" />
                                    <span className="truncate">Today, 25 Apr 2026</span>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Cards */}
                        <div className="flex flex-col gap-3 mt-4 sm:mt-6 w-full">
                            {filteredAppointments.length > 0 ? (
                                filteredAppointments.map(apt => (
                                    <div 
                                        key={apt.id} 
                                        onClick={() => {
                                            if (apt.status === 'In Progress') {
                                                setSelectedApt(apt);
                                                setIsCheckingOut(true);
                                            } else {
                                                setSelectedApt(apt);
                                            }
                                        }}
                                        className="flex flex-col sm:flex-row bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer"
                                    >
                                    
                                        {/* Left Time Column */}
                                        <div className="flex flex-row sm:flex-col w-full sm:w-[120px] bg-gray-50/50 dark:bg-gray-800/20 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-800 shrink-0">
                                            <div className="flex-1 flex flex-col justify-center px-4 py-2 sm:py-3 border-r sm:border-r-0 sm:border-b border-gray-200 dark:border-gray-800">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Start Time</span>
                                                <span className="text-sm sm:text-base font-semibold text-[#0B1120] dark:text-white font-outfit truncate">{apt.startTime}</span>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center px-4 py-2 sm:py-3">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">End Time</span>
                                                <span className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 font-outfit truncate">{apt.endTime}</span>
                                            </div>
                                        </div>

                                        {/* Main Content Area */}
                                        <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-5 gap-4 md:gap-6 min-w-0 w-full">
                                        
                                            {/* Patient Info */}
                                            <div className="flex items-center gap-3 w-full lg:w-[240px] shrink-0">
                                                <div className="relative shrink-0">
                                                    <img src={apt.patientAvatar} alt={apt.patient} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover" />
                                                    <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-[#111827] rounded-full ${apt.status === 'In Progress' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-[#0B1120] dark:text-white text-base sm:text-lg font-outfit group-hover:text-brand-500 transition-colors truncate">
                                                        {apt.patient}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                                        Patient
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Appointment Details */}
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-y-4 gap-x-4 xl:gap-x-12 w-full lg:flex-1 min-w-0">
                                                {/* Group 1: Service & Doctor */}
                                                <div className="flex-[1.5] flex flex-row gap-4 sm:gap-6 min-w-0">
                                                    <div className="flex-[1.2] flex flex-col min-w-0">
                                                        <span className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${
                                                            apt.specialty.includes('Specialized') || apt.specialty === 'Oral Surgery' ? 'text-brand-500' : 'text-gray-400 dark:text-gray-500'
                                                        }`}>
                                                            {apt.specialty.includes('Specialized') || apt.specialty === 'Oral Surgery' ? 'Specialized' : 'General'} Service
                                                        </span>
                                                        <span className="text-xs sm:text-sm font-semibold text-[#0B1120] dark:text-white truncate" title={apt.service}>{apt.service}</span>
                                                    </div>
                                                    <div className="flex-1 flex flex-col min-w-0">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Doctor</span>
                                                        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={apt.doctor}>{apt.doctor}</span>
                                                    </div>
                                                </div>

                                                {/* Group 2: Contact */}
                                                <div className="flex-1 flex flex-row gap-4 sm:gap-6 min-w-0">
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">Contact</span>
                                                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1.5 truncate" title={apt.phone}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone text-emerald-500 shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                                            <span className="truncate">{apt.phone}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-end w-full lg:w-[120px] mt-1 lg:mt-0 shrink-0 gap-2">
                                                {apt.status === 'In Progress' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(apt.id, 'Upcoming');
                                                        }}
                                                        className="p-2 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors active:scale-95 shadow-sm" 
                                                        title="Return to Upcoming"
                                                    >
                                                        <Undo2 size={16} />
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetails(apt);
                                                    }}
                                                    className="flex items-center justify-center p-2.5 bg-gray-50/80 dark:bg-white/[0.03] backdrop-blur-sm text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-500/20 transition-all duration-300 active:scale-95 group/eye shadow-sm hover:shadow-md" 
                                                    title="View Details"
                                                >
                                                    <Eye size={18} className="group-hover/eye:scale-110 transition-transform duration-300" />
                                                </button>

                                                {apt.status === 'Completed' || apt.status === 'No Show' ? (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(apt);
                                                        }}
                                                        className="w-full lg:w-auto px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium rounded-md shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95 whitespace-nowrap"
                                                    >
                                                        View Details
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(apt.id, apt.status === 'Upcoming' ? 'In Progress' : 'Completed');
                                                        }}
                                                        className={`w-full lg:w-auto px-4 py-2 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all active:scale-95 whitespace-nowrap ${
                                                            apt.status === 'Upcoming'
                                                                ? 'bg-blue-600 hover:bg-blue-700'
                                                                : 'bg-emerald-600 hover:bg-emerald-700'
                                                        }`}
                                                    >
                                                        {apt.status === 'Upcoming' ? 'Check In' : 'Check Out'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 sm:p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No appointments in this category.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FrontDeskPage;
