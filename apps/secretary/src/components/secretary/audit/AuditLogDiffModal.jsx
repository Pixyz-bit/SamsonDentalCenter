import React, { useEffect, useState } from 'react';
import { Modal, Button } from '../../ui';
import { X, ArrowRight } from 'lucide-react';
import { generateSmartDiff } from '../../../utils/auditUtils';

const AuditLogDiffModal = ({ isOpen, onClose, log, fetchDetails }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && log) {
            setLoading(true);
            fetchDetails(log.id)
                .then(data => setDetails(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setDetails(null);
        }
    }, [isOpen, log, fetchDetails]);

    if (!log) return null;

    const renderJsonValue = (val) => {
        if (val === null) return <span className="text-gray-400">null</span>;
        if (typeof val === 'object') return <pre className="text-[11px] leading-relaxed whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>;
        return <span>{String(val)}</span>;
    };

    const smartChanges = details ? generateSmartDiff(details.old_values, details.new_values) : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-4xl w-[95%]'>
            <div className='bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800'>
                {/* Header */}
                <div className='px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
                    <div>
                        <h4 className='text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight font-outfit'>
                            Change Details
                        </h4>
                        <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1'>
                            Log ID: {log.id}
                        </p>
                    </div>
                    <Button variant='ghost' size='icon' onClick={onClose} className='text-gray-400 hover:text-gray-600 dark:hover:text-white'>
                        <X size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className='p-8 space-y-10'>
                    {loading ? (
                        <div className='flex flex-col items-center justify-center py-12 gap-3'>
                            <div className='w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin' />
                            <p className='text-xs text-gray-500 font-medium'>Fetching differences...</p>
                        </div>
                    ) : details ? (
                        <>
                            {/* Phase 3: Smart Diffing Summary */}
                            {smartChanges.length > 0 && (
                                <div className='space-y-4'>
                                    <div className='flex items-center gap-2'>
                                        <div className='h-3 w-1 bg-green-500 rounded-full' />
                                        <h5 className='text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-500'>
                                            Human-Readable Changes
                                        </h5>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                        {smartChanges.map((change, idx) => (
                                            <div key={idx} className='flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-gray-800/50'>
                                                <div className='mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0' />
                                                <span className='text-sm text-gray-700 dark:text-gray-300 font-medium'>{change}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className='flex items-center gap-2 mb-4'>
                                    <div className='h-3 w-1 bg-gray-400 rounded-full' />
                                    <h5 className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                        Raw Comparison
                                    </h5>
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                    {/* Old Values */}
                                    <div className='space-y-4'>
                                        <h5 className='text-[10px] font-bold uppercase tracking-widest text-gray-400 opacity-60'>
                                            From (Old state)
                                        </h5>
                                        <div className='p-5 bg-gray-50 dark:bg-white/[0.02] rounded-xl border border-gray-100 dark:border-gray-800/50 min-h-[150px] overflow-auto'>
                                            {renderJsonValue(details.old_values)}
                                        </div>
                                    </div>

                                    {/* New Values */}
                                    <div className='space-y-4 relative'>
                                        <h5 className='text-[10px] font-bold uppercase tracking-widest text-gray-400 opacity-60'>
                                            To (New state)
                                        </h5>
                                        <div className='p-5 bg-brand-50/10 dark:bg-brand-500/5 rounded-xl border border-brand-100/50 dark:border-brand-500/20 min-h-[150px] overflow-auto'>
                                            {renderJsonValue(details.new_values)}
                                        </div>
                                        
                                        {/* Arrow indicator between columns on desktop */}
                                        <div className='hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-700'>
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className='text-center text-gray-500 py-12'>Failed to load data details.</p>
                    )}
                </div>

                {/* Footer */}
                <div className='px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/[0.01] flex justify-end'>
                    <Button onClick={onClose} className='px-8 rounded-xl font-black text-xs uppercase tracking-widest h-10'>
                        Close View
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AuditLogDiffModal;
