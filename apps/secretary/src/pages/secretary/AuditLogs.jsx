import React, { useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import AuditLogFilterBar from '../../components/secretary/audit/AuditLogFilterBar';
import AuditLogTable from '../../components/secretary/audit/AuditLogTable';
import AuditLogPagination from '../../components/secretary/audit/AuditLogPagination';
import AuditLogDiffModal from '../../components/secretary/audit/AuditLogDiffModal';

const AuditLogs = () => {
    const { 
        logs, 
        metadata, 
        loading, 
        error, 
        filters, 
        updateFilter, 
        setPage, 
        getDetails 
    } = useAuditLogs();

    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedLog(null), 300);
    };

    return (
        <div className="flex flex-col h-full w-full max-w-full overflow-x-hidden pb-8">
            <PageBreadcrumb 
                pageTitle="System Audit Logs" 
                subtitle="Track system changes and administrative activities."
            />
            
            {/* Unified Page Container - Responsive padding and rounding */}
            <div className='grow flex flex-col bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 sm:rounded-3xl shadow-sm overflow-hidden'>
                
                {/* Top Filter Section - Fluid padding */}
                <div className='p-4 sm:p-6 lg:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]'>
                    <AuditLogFilterBar 
                        filters={filters} 
                        onFilterChange={updateFilter} 
                    />
                </div>

                {/* Main Content Area (Scrollable) - Fluid padding */}
                <div className='grow overflow-y-auto p-4 sm:p-6 custom-scrollbar'>
                    {/* Error State */}
                    {error && (
                        <div className='mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl'>
                            <p className='text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest'>Access Issue</p>
                            <p className='text-sm text-red-500 mt-1'>{error}</p>
                        </div>
                    )}

                    <AuditLogTable 
                        logs={logs} 
                        onViewDetails={handleViewDetails} 
                        loading={loading}
                    />
                </div>

                {/* Bottom Pagination Area - Fluid padding */}
                {!loading && logs.length > 0 && (
                    <div className='p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01]'>
                        <AuditLogPagination 
                            metadata={metadata} 
                            onPageChange={setPage} 
                        />
                    </div>
                )}
            </div>

            {/* Diff Modal */}
            <AuditLogDiffModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                log={selectedLog}
                fetchDetails={getDetails}
            />
        </div>
    );
};

export default AuditLogs;
