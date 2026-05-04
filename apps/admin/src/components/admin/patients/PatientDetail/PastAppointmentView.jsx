import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { api } from '../../../../utils/api';

// Sub-components
import ReviewTimeline from './RequestReview/ReviewTimeline';
import PatientProfileCard from './RequestReview/PatientProfileCard';
import RecentHistoryList from './RequestReview/RecentHistoryList';
import RequestDetailsCard from './RequestReview/RequestDetailsCard';

const PastAppointmentView = ({ appointment, token, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [patientHistory, setPatientHistory] = useState([]);

    useEffect(() => {
        if (appointment) {
            fetchReviewData();
        }
    }, [appointment]);

    const fetchReviewData = async () => {
        try {
            setLoading(true);
            const historyRes = await api.get(`/admin/patients/${appointment.patient_id}/history`, token);
            setPatientHistory(historyRes.appointments || []);
        } catch (err) {
            console.error('Failed to fetch patient history:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!appointment) return null;

    const patientStats = {
        completed: patientHistory.filter(a => a.status === 'COMPLETED').length,
        noShow: patientHistory.filter(a => a.status === 'NO_SHOW').length,
        cancelled: patientHistory.filter(a => a.status === 'CANCELLED' || a.status === 'LATE_CANCEL').length,
    };

    return (
        <div className='flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300'>
            
            {/* Standard Tab Header */}
            <div className='flex items-center justify-between'>
                <div className='flex flex-col'>
                    <h4 className='text-xs font-black uppercase tracking-[0.2em] text-gray-400'>
                        Appointment History
                    </h4>
                    <p className='text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest'>
                        Archived record of patient visit and outcome
                    </p>
                </div>
            </div>

            {/* Row 1: Timeline */}
            <ReviewTimeline 
                createdAt={appointment.created_at} 
                status={appointment.status}
                updatedAt={appointment.updated_at}
            />

            {/* Row 2: Grid Layout */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Left Side: Profile & Details */}
                <div className='space-y-8'>
                    <PatientProfileCard 
                        patient={appointment.patient}
                        stats={patientStats}
                    />
                    
                    <RequestDetailsCard 
                        appointment={appointment}
                    />
                </div>

                {/* Right Side: History List */}
                <RecentHistoryList 
                    history={patientHistory}
                    loading={loading}
                />
            </div>

            {/* Row 4: Return Action Only */}
            <div className='sm:pt-8 sm:border-t border-gray-100 dark:border-gray-800 flex items-center sm:relative fixed bottom-0 left-0 right-0 sm:bg-transparent bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sm:p-0 p-4 z-40 sm:border-t-0 border-t'>
                <button 
                    onClick={onBack}
                    className='h-10 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 active:scale-95 flex items-center gap-2'
                >
                    <ArrowLeft size={14} /> Return
                </button>
            </div>
        </div>
    );
};

export default PastAppointmentView;
