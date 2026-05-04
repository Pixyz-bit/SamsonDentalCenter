import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import ApprovalHeader from '../../components/secretary/approvals/ApprovalHeader';
import ApprovalInbox from '../../components/secretary/approvals/ApprovalInbox';
import ApprovalDetailView from '../../components/secretary/approval_details';
import useApprovals from '../../hooks/useApprovals';
import { formatTime } from '../../hooks/useAppointments';

const ApprovalsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { 
        requests: rawRequests, 
        loading, 
        error, 
        approveRequest, 
        rejectRequest, 
        fetchDentistSchedule,
        fetchPatientStats,
        fetchPatientHistory,
        refresh 
    } = useApprovals();

    const [busySlots, setBusySlots] = useState([]);
    const [completedCount, setCompletedCount] = useState(0);
    const [patientHistory, setPatientHistory] = useState([]);

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState('All Services');
    const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
    const [selectedDate, setSelectedDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    function calculatePosition(timeStr) {
        if (!timeStr) return -1;
        const [h, m] = timeStr.split(':').map(Number);
        const totalMinutes = h * 60 + m;
        const startMinutes = 8 * 60;
        const endMinutes = 17 * 60;
        return Math.max(0, Math.min(100, ((totalMinutes - startMinutes) / (endMinutes - startMinutes)) * 100));
    }

    const requests = useMemo(() => {
        return rawRequests.map(req => ({
            id: req.id,
            patient: { 
                id: req.patient_id,
                name: (req.last_name || req.first_name) 
                    ? `${req.last_name || ''}, ${req.first_name || ''} ${req.middle_name || ''} ${req.suffix || ''}`.replace(/\s+/g, ' ').trim()
                    : (req.patient?.first_name 
                        ? `${req.patient.last_name}, ${req.patient.first_name} ${req.patient.middle_name || ''} ${req.patient.suffix || ''}`.replace(/\s+/g, ' ').trim()
                        : (req.guest_name || "Unknown Patient")), 
                phone: req.patient?.phone || req.guest_phone || "N/A", 
                email: req.patient?.email || req.guest_email || "N/A", 
                noShowCount: req.patient?.no_show_count || 0, 
                cancellationCount: req.patient?.cancellation_count || 0,
                isBookingRestricted: req.patient?.is_booking_restricted || false,
                source: req.source
            },
            service: req.service?.name || "Unknown Service",
            serviceTier: req.service_tier,
            requestedDate: req.appointment_date,
            requestedTime: formatTime(req.start_time),
            dentist: req.dentist?.profile?.first_name 
                ? `${req.dentist.profile.last_name}, ${req.dentist.profile.first_name} ${req.dentist.profile.middle_name || ''} ${req.dentist.profile.suffix || ''}`.replace(/\s+/g, ' ').trim() 
                : 'Unassigned',
            dentistId: req.dentist?.id || req.dentist_id,
            dentistPhone: req.dentist?.profile?.phone || req.dentist?.phone || "N/A",
            dentistEmail: req.dentist?.profile?.email || req.dentist?.email || "N/A",
            createdAt: req.created_at,
            source: req.source,
            slotPosition: calculatePosition(req.start_time)
        }));
    }, [rawRequests]);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setSelectedId(id);
        } else {
            setSelectedId(null);
        }
    }, [searchParams]);

    const handleApprove = async (id) => {
        const res = await approveRequest(id);
        if (res.success) {
            if (selectedId === id) setSearchParams({});
        } else {
            alert(`Approval failed: ${res.error}`);
        }
    };

    const handleReject = async (id, reason = 'No reason provided') => {
        const res = await rejectRequest(id, reason);
        if (res.success) {
            if (selectedId === id) setSearchParams({});
        } else {
            alert(`Rejection failed: ${res.error}`);
        }
    };

    const handleRowClick = (id) => setSearchParams({ id: id.toString() });
    const handleBack = () => setSearchParams({});

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesService = selectedService === 'All Services' || r.service === selectedService;
        const matchesDoctor = selectedDoctor === 'All Doctors' || r.dentist === selectedDoctor;
        const matchesDate = !selectedDate || r.requestedDate === selectedDate;
        
        if (!matchesSearch || !matchesService || !matchesDoctor || !matchesDate) return false;
        if (activeFilter === 'all') return true;
        
        const hours = (new Date() - new Date(r.createdAt)) / (1000 * 60 * 60);
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const isUrgent = r.requestedDate === tomorrowStr || r.requestedDate === todayStr;
        const isNeedsAttention = hours > 5 && !isUrgent;
        const isRecent = hours <= 5 && !isUrgent;

        if (activeFilter === 'urgent') return isUrgent;
        if (activeFilter === 'stale') return isNeedsAttention;
        if (activeFilter === 'recent') return isRecent;
        return true;
    });

    const counts = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        return requests.reduce((acc, r) => {
            const isUrgent = r.requestedDate === tomorrowStr || r.requestedDate === todayStr;
            const hours = (new Date() - new Date(r.createdAt)) / (1000 * 60 * 60);
            
            if (isUrgent) acc.urgent++;
            else if (hours > 5) acc.stale++;
            else acc.new++;
            return acc;
        }, { urgent: 0, stale: 0, new: 0 });
    }, [requests]);

    const selectedRequest = requests.find(r => r.id === selectedId);

    useEffect(() => {
        if (selectedRequest) {
            const loadData = async () => {
                if (selectedRequest.dentistId && selectedRequest.requestedDate) {
                    const appointments = await fetchDentistSchedule(selectedRequest.dentistId, selectedRequest.requestedDate);
                    const positions = appointments
                        .filter(a => a.id !== selectedRequest.id && !['CANCELLED', 'LATE_CANCEL', 'RESCHEDULED', 'NOSHOW'].includes(a.status))
                        .map(a => calculatePosition(a.start_time));
                    setBusySlots(positions);
                }
                if (selectedRequest.patient.id) {
                    const stats = await fetchPatientStats(selectedRequest.patient.id);
                    setCompletedCount(stats.completed);
                    const history = await fetchPatientHistory(selectedRequest.patient.id);
                    setPatientHistory(history);
                } else {
                    setCompletedCount(0);
                    setPatientHistory([]);
                }
            };
            loadData();
        } else {
            setBusySlots([]);
            setCompletedCount(0);
            setPatientHistory([]);
        }
    }, [selectedRequest, fetchDentistSchedule, fetchPatientStats, fetchPatientHistory]);

    const breadcrumbTitle = selectedId ? 'Request Details' : 'Approvals';
    const parentName = selectedId ? 'Approvals' : null;
    const parentPath = selectedId ? '/approvals' : null;

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="text-error-500 font-bold mb-4">Error loading approvals</div>
                <div className="text-gray-500 mb-6">{error}</div>
                <button onClick={refresh} className="px-6 py-2 bg-brand-500 text-white rounded-xl font-bold">Try Again</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle} 
                subtitle={selectedId ? 'Review detailed request information and history.' : 'Review and manage appointment booking requests.'}
                parentName={parentName} 
                parentPath={parentPath} 
            />

            {!selectedId && (
                <ApprovalHeader 
                    totalPending={requests.length}
                    urgentCount={counts.urgent}
                    newCount={counts.new}
                    staleCount={counts.stale}
                />
            )}

            <div className="flex-1 min-h-0 flex flex-col sm:mb-6">
                {selectedId ? (
                    <ApprovalDetailView 
                        request={selectedRequest}
                        onApprove={() => handleApprove(selectedId)}
                        onReject={(reason) => handleReject(selectedId, reason)}
                        onBack={handleBack}
                        busySlots={busySlots}
                        slotPosition={selectedRequest?.slotPosition}
                        timeStr={selectedRequest?.requestedTime}
                        completedCount={completedCount}
                        history={patientHistory}
                    />
                ) : (
                    <ApprovalInbox 
                        requests={filteredRequests}
                        allRequests={requests}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedService={selectedService}
                        onServiceChange={setSelectedService}
                        selectedDoctor={selectedDoctor}
                        onDoctorChange={setSelectedDoctor}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onRowClick={handleRowClick}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
        </div>
    );
};

export default ApprovalsPage;
