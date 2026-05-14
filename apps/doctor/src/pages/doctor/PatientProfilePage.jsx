import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import PatientDetailView from '../../components/patient/PatientDetailView';

const PatientProfilePage = () => {
    const { tab, id } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || 'profile';

    const tabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const breadcrumbTitle = `Patient ${tabLabel}`;

    return (
        <div className='flex flex-col h-full'>
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle} 
                parentName="My Patients"
                parentPath="/patients"
                className='mb-4'
            />
            
            <div className='grow flex flex-col'>
                <PatientDetailView 
                    patientId={id}
                    activeTab={activeTab}
                    onBack={() => navigate('/patients')}
                />
            </div>
        </div>
    );
};

export default PatientProfilePage;
