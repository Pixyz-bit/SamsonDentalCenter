import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import AppointmentTable from '../../components/patient/appointments/AppointmentTable';
import AppointmentFilters from '../../components/patient/appointments/AppointmentFilters';
import useDoctorAppointments from '../../hooks/useDoctorAppointments';
import InvoiceModal from '../../components/doctor/appointments/InvoiceModal';
import AppointmentDetailView from '../../components/doctor/appointments/AppointmentDetailView';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const MOCK_APPOINTMENTS = [
    {
        id: 'mock-1',
        start_time: '9:00 AM',
        end_time: '10:00 AM',
        status: 'IN_PROGRESS',
        patient: { name: 'Christopher Picarding', phone: '+63 917 123 4567' },
        service: 'Tooth Extraction',
        service_id: 'mock-service-1',
        dentist: 'Dr. James Thompson',
        date: new Date().toISOString(),
    },
    {
        id: 'mock-2',
        start_time: '10:30 AM',
        end_time: '11:00 AM',
        status: 'CONFIRMED',
        patient: { name: 'Maria Santos', phone: '+63 918 987 6543' },
        service: 'Routine Cleaning',
        service_id: 'mock-service-3',
        dentist: 'Dr. James Thompson',
        date: new Date().toISOString(),
    },
    {
        id: 'mock-3',
        start_time: '11:30 AM',
        end_time: '12:30 PM',
        status: 'CONFIRMED',
        patient: { name: 'Angelo Reyes', phone: '+63 920 555 1234' },
        service: 'Root Canal',
        service_id: 'mock-service-4',
        dentist: 'Dr. James Thompson',
        date: new Date().toISOString(),
    },
    {
        id: 'mock-4',
        start_time: '2:00 PM',
        end_time: '2:30 PM',
        status: 'IN_PROGRESS',
        patient: { name: 'Jane Smith', phone: '+63 919 888 7766' },
        service: 'General Consultation',
        service_id: 'mock-service-2',
        dentist: 'Dr. James Thompson',
        date: new Date().toISOString(),
    }
];

const AppointmentsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedId = searchParams.get('id');

    const { 
        filters, 
        setFilters, 
    } = useDoctorAppointments();
    
    const { user } = useAuth();
    const { showToast } = useToast();

    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    // Sync selectedAppointment with URL id
    useEffect(() => {
        if (selectedId) {
            const app = MOCK_APPOINTMENTS.find(a => a.id === selectedId);
            setSelectedAppointment(app);
        } else {
            setSelectedAppointment(null);
        }
    }, [selectedId]);

    const handleToggleDropdown = (id) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleViewDetails = (id) => {
        setSearchParams({ id });
    };

    const handleBack = () => {
        setSearchParams({});
    };

    const handleStartAppointment = async (id) => {
        console.log('Simulation: Starting appointment:', id);
        showToast('Appointment started (Simulated)!', 'success');
    };

    const handleOpenInvoiceModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsInvoiceModalOpen(true);
        setOpenDropdown(null);
    };

    const breadcrumbTitle = selectedId ? 'Appointment Detail' : 'Patient Appointments';
    const parentName = selectedId ? 'Appointments' : null;
    const parentPath = selectedId ? '/appointments' : null;

    return (
        <>
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle}
                parentName={parentName}
                parentPath={parentPath}
            />
            
            {selectedId && selectedAppointment ? (
                <div className='grow min-h-0 relative sm:mx-0'>
                    <AppointmentDetailView 
                        appointment={selectedAppointment}
                        onBack={handleBack}
                        onStart={() => handleStartAppointment(selectedId)}
                        onCreateInvoice={() => setIsInvoiceModalOpen(true)}
                    />
                </div>
            ) : (
                <div className='space-y-6'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <h2 className='text-xl font-bold text-gray-800 dark:text-white/90 font-outfit uppercase tracking-wider'>
                                Today's Appointments
                            </h2>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                                Manage your daily patient flow and clinical invoicing.
                            </p>
                        </div>
                    </div>

                    <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm overflow-hidden'>
                        <AppointmentFilters 
                            filters={filters} 
                            setFilters={setFilters} 
                        />
                        
                        <div className='mt-6'>
                            <AppointmentTable 
                                appointments={MOCK_APPOINTMENTS}
                                loading={false}
                                error={null}
                                user={user}
                                openDropdown={openDropdown}
                                onToggleDropdown={handleToggleDropdown}
                                onViewDetails={handleViewDetails}
                                onStartAppointment={handleStartAppointment}
                                onCreateInvoice={handleOpenInvoiceModal}
                            />
                        </div>
                    </div>
                </div>
            )}

            {selectedAppointment && (
                <InvoiceModal 
                    isOpen={isInvoiceModalOpen}
                    onClose={() => setIsInvoiceModalOpen(false)}
                    appointment={selectedAppointment}
                    onSuccess={() => {
                        setIsInvoiceModalOpen(false);
                        showToast('Simulation: Invoice Generated Successfully!', 'success');
                    }}
                />
            )}
        </>
    );
};

export default AppointmentsPage;
