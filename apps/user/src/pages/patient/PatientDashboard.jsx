import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import DashboardWelcomeBanner from '../../components/patient/dashboard/DashboardWelcomeBanner';
import ContactClinicModal from '../../components/patient/dashboard/ContactClinicModal';
import DashboardStats from '../../components/patient/dashboard/DashboardStats';
import DashboardCalendar from '../../components/patient/dashboard/DashboardCalendar';
import { useAppointmentState } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';
import ErrorState from '../../components/common/ErrorState';

const PatientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { appointments, total: totalAppointments, loading: apptsLoading, error: apptsError } = useAppointmentState();
    const error = apptsError;
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);

    const fullName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Guest';

    return (
        <>
            <PageBreadcrumb pageTitle='Dashboard' />
            
            <div className="sm:hidden px-4 mt-2">
                <h1 className="text-[12px] sm:text-[13px] font-black text-gray-700 dark:text-white uppercase tracking-widest mb-4 opacity-80">
                    Dashboard
                </h1>
            </div>

            <div className='space-y-6 mx-4 sm:mx-0'>
                {error ? (
                    <ErrorState 
                        error={error} 
                        onRetry={() => window.location.reload()} 
                        title="Unable to load Dashboard"
                    />
                ) : (
                    <>
                        {/* Row 0: Welcome Banner */}
                        <DashboardWelcomeBanner 
                            firstName={user?.first_name || 'Guest'}
                            onBookAppointment={() => navigate('/patient/book?returnTo=/patient/dashboard')}
                            onContactClinic={() => setIsContactModalOpen(true)}
                        />

                        {/* Row 1: Metrics & Latest Appt (4 Cards, 5 Cols) */}
                        <DashboardStats 
                            appointments={appointments}
                            totalAppointments={totalAppointments}
                            loading={apptsLoading}
                        />

                        {/* Row 2: Calendar (Full Width) */}
                        <div className='w-full min-w-0 pb-8 sm:pb-0'>
                            <DashboardCalendar 
                                appointments={appointments}
                                loading={apptsLoading}
                            />
                        </div>
                    </>
                )}
            </div>

            <ContactClinicModal 
                isOpen={isContactModalOpen} 
                onClose={() => setIsContactModalOpen(false)} 
            />
        </>
    );
};

export default PatientDashboard;
