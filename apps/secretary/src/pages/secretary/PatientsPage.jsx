import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import PatientInbox from '../../components/secretary/patients/PatientInbox';
import PatientDetailView from '../../components/secretary/patients/PatientDetailView';
import AddPatientModal from '../../components/secretary/patients/AddPatientModal';
import MergePatientsModal from '../../components/secretary/patients/MergePatientsModal';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const PatientsPage = () => {
    const { tab, id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const activeTab = tab || 'profile';

    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

    const fetchPatients = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await api.get(`/admin/patients?search=${searchQuery}`, token);
            setPatients(data.patients || []);
        } catch (err) {
            console.error('Failed to fetch patients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients();
        }, searchQuery ? 500 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [token, searchQuery]);

    const tabLabel = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const breadcrumbTitle = id ? `Patient ${tabLabel}` : "Patient Registry";

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle={breadcrumbTitle} 
                subtitle={id ? `View and manage ${tabLabel.toLowerCase()} details for this patient.` : 'Manage clinic patient records and registration.'}
                parentName={id ? "Patient Registry" : null}
                parentPath={id ? "/patients" : null}
            />
            
            <div className='grow flex flex-col'>
                {id ? (
                    <PatientDetailView 
                        patientId={id}
                        activeTab={activeTab}
                        onBack={() => navigate('/patients')}
                    />
                ) : (
                    <PatientInbox
                        patients={patients}
                        loading={loading}
                        error={error}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                        activeTab={activeTab}
                        onAddClick={() => setIsAddModalOpen(true)}
                        onMergeClick={() => setIsMergeModalOpen(true)}
                        onPatientClick={(patientId) => navigate(`/patients/${activeTab}/${patientId}`)}
                    />
                )}
            </div>

            <AddPatientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onPatientAdded={fetchPatients}
                token={token}
            />

            <MergePatientsModal 
                isOpen={isMergeModalOpen}
                onClose={() => setIsMergeModalOpen(false)}
                token={token}
                onMerged={() => {
                    console.log('Patients merged');
                    fetchPatients();
                }}
            />
        </div>
    );
};

export default PatientsPage;


