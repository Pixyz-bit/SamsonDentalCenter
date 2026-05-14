import React, { useState } from 'react';
import { User, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';

const MOCK_PATIENTS = [
    {
        id: 'c128f443',
        firstName: 'Christopher',
        lastName: 'Picardo',
        middleName: 'John',
        suffix: 'jr',
        status: 'offline',
        email: null,
        phone: null,
    },
    {
        id: '5154859a',
        firstName: 'bato',
        lastName: 'bato',
        middleName: 'pik',
        status: 'active',
        email: 'poleng123445@gmail.com',
        phone: '099 9999 9999',
    },
    {
        id: 'ca1cb828',
        firstName: 'Angelo',
        lastName: 'Revilla',
        status: 'inactive',
        email: 'jacobgelo9@gmail.com',
        phone: null,
    },
    {
        id: '9861e7ca',
        firstName: 'FamFour',
        lastName: 'FamFour',
        status: 'offline',
        email: null,
        phone: null,
    },
    {
        id: 'cb6bf408',
        firstName: 'FamOne',
        lastName: 'FamOne',
        status: 'offline',
        email: null,
        phone: '95453456723',
        isEmergency: true
    },
    {
        id: '1ccc3203',
        firstName: 'kkkk',
        lastName: 'kkkk',
        status: 'offline',
        email: null,
        phone: '88888888888',
    }
];

const PatientsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPatients = MOCK_PATIENTS.filter(p => {
        const fullName = `${p.lastName}, ${p.firstName}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery.toLowerCase());
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'active':
                return {
                    dot: 'bg-success-500',
                    text: 'Active Account',
                    tag: 'bg-success-50 text-success-600',
                    color: 'text-success-600'
                };
            case 'inactive':
                return {
                    dot: 'bg-brand-400',
                    text: 'Inactive Account',
                    tag: 'bg-brand-50 text-brand-600',
                    color: 'text-brand-600'
                };
            default:
                return {
                    dot: 'bg-gray-300',
                    text: 'Offline Profile',
                    tag: 'bg-gray-100 text-gray-400',
                    color: 'text-gray-400'
                };
        }
    };

    return (
        <div className="flex flex-col h-full">
            <PageBreadcrumb pageTitle="My Patients" />

            <div className="flex flex-col grow bg-white dark:bg-white/[0.03] sm:rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                
                {/* ── Search Header ── */}
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                            <Search size={18} />
                        </span>
                        <input 
                            placeholder="Search patients by name or reference..." 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/3 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-white/10 transition-all outline-none font-medium" 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Patients List ── */}
                <div className="grow flex flex-col min-h-[480px] md:min-h-[560px] overflow-y-auto no-scrollbar">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                            const styles = getStatusStyles(patient.status);
                            const displayName = `${patient.lastName}, ${patient.firstName}${patient.middleName ? ' ' + patient.middleName : ''}${patient.suffix ? ' ' + patient.suffix : ''}`;
                            
                            return (
                                <div 
                                    key={patient.id}
                                    onClick={() => navigate(`/patients/profile/${patient.id}`)}
                                    className="group relative border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-all hover:bg-gray-50/50 dark:hover:bg-white/[0.02] bg-white dark:bg-white/[0.01]"
                                >
                                    {/* Desktop View */}
                                    <div className="hidden sm:flex items-center px-6 py-4 gap-8">
                                        <div className="w-56 lg:w-64 shrink-0 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800 shrink-0 relative">
                                                <User size={18} />
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${styles.dot}`}></span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-[11px] font-black uppercase tracking-tight truncate ${patient.isEmergency ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {displayName}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-48 lg:w-56 shrink-0 flex flex-col">
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 ${styles.color}`}>
                                                {styles.text}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 truncate">
                                                {patient.email ? patient.email.toUpperCase() : 'NO EMAIL REGISTERED'}
                                            </span>
                                        </div>
                                        <div className="grow flex justify-end items-center gap-4">
                                            <div className="flex items-center gap-6 shrink-0 min-w-[120px] justify-end sm:justify-start flex-grow sm:flex-grow-0">
                                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">
                                                    Ref: {patient.id}
                                                </span>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="sm:hidden p-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-800 shrink-0 relative">
                                                    <User size={18} />
                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${styles.dot}`}></span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Patient Name</span>
                                                    <span className={`text-[11px] font-black uppercase tracking-tight ${patient.isEmergency ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                                        {displayName}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex px-2 py-0.5 text-[8px] font-black rounded-md uppercase tracking-widest shadow-sm ${styles.tag}`}>
                                                {patient.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 dark:border-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Phone</span>
                                                <span className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase">
                                                    {patient.phone || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Email Address</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase truncate">
                                                    {patient.email ? patient.email.toUpperCase() : 'NONE'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Patient Reference</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase">REF: {patient.id}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-6 shrink-0 min-w-[120px] justify-end sm:justify-start flex-grow sm:flex-grow-0">
                                                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium flex items-center gap-1">Ref: {patient.id}</span>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center grow p-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-300 dark:text-gray-700 mb-4">
                                <User size={32} />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No patients found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Try searching for a different name or reference ID</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientsPage;
