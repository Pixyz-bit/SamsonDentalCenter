import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import ApprovalHeader from '../../components/secretary/approvals/ApprovalHeader';
import ApprovalInbox from '../../components/secretary/approvals/ApprovalInbox';
import ApprovalDetailView from '../../components/secretary/approval_details/index.jsx';
import useApprovals from '../../hooks/useApprovals';
import { formatTime } from '../../hooks/useAppointments';

const ApprovalsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedId = searchParams.get('id') ? parseInt(searchParams.get('id')) : null;

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

    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState('All Services');
    const [selectedDoctor, setSelectedDoctor] = useState('All Doctors');
    const [currentPage, setCurrentPage] = useState(1);

    const requests = useMemo(() => {
        if (!rawRequests) return [];
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
                source: req.source,
                patientNote: req.patient?.notes || null
            },
            service: req.service?.name || "Unknown Service",
            serviceTier: req.service_tier,
            requestedDate: req.appointment_date,
            requestedTime: formatTime(req.start_time),
            requestedEndTime: formatTime(req.end_time),
            dentist: req.dentist?.profile?.first_name 
                ? `${req.dentist.profile.last_name}, ${req.dentist.profile.first_name} ${req.dentist.profile.middle_name || ''} ${req.dentist.profile.suffix || ''}`.replace(/\s+/g, ' ').trim() 
                : 'Unassigned',
            dentistId: req.dentist?.id || req.dentist_id,
            dentistSpecialization: req.dentist?.specialization || 'General Dentist',
            createdAt: req.created_at,
            updatedAt: req.updated_at,
            source: req.source,
            notes: req.notes,
            status: req.status,
            approvalStatus: req.approval_status
        }));
    }, [rawRequests]);

    // Dynamically calculate unique services and doctors from ALL requests
    const availableServices = React.useMemo(() => {
        const unique = new Set(requests.map(r => r.service).filter(Boolean));
        return ['All Services', ...Array.from(unique)].sort();
    }, [requests]);

    const availableDoctors = React.useMemo(() => {
        const unique = new Set(requests.map(r => r.dentist).filter(d => d && d !== 'Unassigned'));
        const sorted = Array.from(unique).sort();
        return ['All Doctors', ...sorted];
    }, [requests]);

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.patient.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesService = selectedService === 'All Services' || r.service === selectedService;
        const matchesDoctor = selectedDoctor === 'All Doctors' || r.dentist === selectedDoctor;
        
        if (!matchesSearch || !matchesService || !matchesDoctor) return false;
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

    const handleApprove = async (id) => {
        const res = await approveRequest(id);
        if (res.success) {
            setSearchParams({});
        } else {
            alert(`Approval failed: ${res.error}`);
        }
    };

    const handleReject = async (id, reason = 'No reason provided') => {
        const res = await rejectRequest(id, reason);
        if (res.success) {
            setSearchParams({});
        } else {
            alert(`Rejection failed: ${res.error}`);
        }
    };

    const handleRowClick = (id) => setSearchParams({ id: id.toString() });
    const handleBack = () => setSearchParams({});

    const selectedRequest = useMemo(() => {
        const idFromUrl = searchParams.get('id');
        if (!idFromUrl) return null;
        
        // Try finding by numeric comparison first, then string
        return requests.find(r => 
            r.id?.toString() === idFromUrl || 
            Number(r.id) === Number(idFromUrl)
        );
    }, [requests, searchParams]);

    if (loading && requests.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    const breadcrumbTitle = selectedId ? 'Request Details' : 'Appointment Requests';
    const parentName = selectedId ? 'Appointment Requests' : null;
    const parentPath = selectedId ? '/approvals' : null;

    return (
        <div className="flex flex-col min-h-[calc(100vh-140px)] w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle} 
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

            <div className="flex-1 min-h-[600px] flex flex-col sm:mb-6">
                {selectedId ? (
                    selectedRequest ? (
                        <ApprovalDetailView 
                            request={selectedRequest}
                            onApprove={() => handleApprove(selectedId)}
                            onReject={(reason) => handleReject(selectedId, reason)}
                            onBack={handleBack}
                            fetchDentistSchedule={fetchDentistSchedule}
                            fetchPatientStats={fetchPatientStats}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <p className="text-gray-500">Request not found.</p>
                            <button onClick={handleBack} className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg">Go Back</button>
                        </div>
                    )
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
                        availableServices={availableServices}
                        selectedDoctor={selectedDoctor}
                        onDoctorChange={setSelectedDoctor}
                        availableDoctors={availableDoctors}
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
