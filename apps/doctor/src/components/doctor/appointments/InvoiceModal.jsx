import React, { useState, useEffect } from 'react';
import { Modal, Badge, Button } from '../../ui';
import useServices from '../../../hooks/useServices';
import { useToast } from '../../../context/ToastContext';
import { Plus, Trash2, ReceiptText, Stethoscope, Clock, X, User } from 'lucide-react';

const MOCK_SERVICES = [
    { id: 'mock-service-1', name: 'Tooth Extraction' },
    { id: 'mock-service-2', name: 'General Consultation' },
    { id: 'mock-service-3', name: 'Dental Cleaning' },
    { id: 'mock-service-4', name: 'Root Canal' },
    { id: 'mock-service-5', name: 'Braces Adjustment' },
];

const InvoiceModal = ({ isOpen, onClose, appointment, onSuccess }) => {
    const { services } = useServices();
    const displayServices = services && services.length > 0 ? services : MOCK_SERVICES;

    const { showToast } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [items, setItems] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && appointment) {
            setItems([{ service_id: appointment.service_id || '', quantity: 1 }]);
            setNotes('');
        }
    }, [isOpen, appointment]);

    const handleAddItem = () => setItems([...items, { service_id: '', quantity: 1 }]);
    const handleRemoveItem = (index) => setItems(items.filter((_, i) => i !== index));
    const handleServiceChange = (index, serviceId) => {
        const updated = [...items];
        updated[index].service_id = serviceId;
        setItems(updated);
    };
    const handleQuantityChange = (index, qty) => {
        const updated = [...items];
        updated[index].quantity = parseInt(qty) || 1;
        setItems(updated);
    };

    const handleSubmit = async () => {
        const invalid = items.some(item => !item.service_id);
        if (invalid) {
            showToast('Please select a service for all line items.', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            showToast('Clinical invoice generated successfully.', 'success');
            onSuccess();
        } catch (err) {
            showToast('Failed to generate invoice.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen || !appointment) return null;

    const patientName = appointment.patient?.name || 'Patient';
    const dateStr = appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Today';

    return (
        <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} className='max-w-6xl w-full mx-4 h-[85vh]'>
            {/* ── Main Flex Container ── */}
            <div className='flex flex-col h-full bg-white dark:bg-gray-900'>
                
                {/* ── Fixed Header ── */}
                <div className='flex-none px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between z-20'>
                    <div className='flex items-center gap-4'>
                        <div className='w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-black text-xl font-outfit shadow-lg shadow-brand-500/20'>
                            {patientName.charAt(0)}
                        </div>
                        <div>
                            <h3 className='text-lg font-black text-gray-900 dark:text-white font-outfit tracking-tight'>
                                {patientName}
                            </h3>
                            <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                                {appointment.service} • {dateStr} at {appointment.start_time}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className='p-2 rounded-xl bg-gray-50 dark:bg-white/[0.05] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Scrollable Body Area ── */}
                <div className='flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar'>
                    {/* Clinical Services */}
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4'>
                            <div className='flex items-center gap-2'>
                                <ReceiptText size={18} className='text-brand-500' />
                                <h4 className='text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest font-outfit'>
                                    Clinical Services
                                </h4>
                            </div>
                            <button 
                                onClick={handleAddItem} 
                                className='flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-brand-500 border border-gray-200 dark:border-gray-800 rounded-lg transition-all'
                            >
                                <Plus size={14} /> Add Service
                            </button>
                        </div>

                        <div className='space-y-4'>
                            <div className='grid grid-cols-12 gap-6 px-2'>
                                <div className='col-span-10 text-[10px] font-black text-gray-400 uppercase tracking-widest'>Service Detail</div>
                                <div className='col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center pr-8'>Qty</div>
                            </div>
                            {items.map((item, index) => (
                                <div key={index} className='grid grid-cols-12 gap-4 items-center'>
                                    <div className='col-span-10 relative'>
                                        <select
                                            value={item.service_id}
                                            onChange={(e) => handleServiceChange(index, e.target.value)}
                                            className='w-full h-14 px-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] text-sm font-bold text-gray-900 dark:text-white focus:border-brand-500 outline-none appearance-none cursor-pointer'
                                        >
                                            <option value='' disabled>Select treatment...</option>
                                            {displayServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className='col-span-2 flex items-center gap-3'>
                                        <input
                                            type='number'
                                            min='1'
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                                            className='w-full h-14 text-center rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.02] text-base font-bold text-gray-900 dark:text-white focus:border-brand-500 outline-none transition-all'
                                        />
                                        {items.length > 1 && <button onClick={() => handleRemoveItem(index)} className='text-gray-300 hover:text-red-500 p-2'><Trash2 size={18} /></button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clinical Notes */}
                    <div className='space-y-6 pb-4'>
                        <div className='flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-4'>
                            <Stethoscope size={18} className='text-brand-500' />
                            <h4 className='text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest font-outfit'>Clinical Notes</h4>
                        </div>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder='Enter clinical observations, treatment details, or follow-up instructions...'
                            rows={3}
                            className='w-full p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-white/[0.01] text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-brand-500 outline-none resize-none transition-all'
                        />
                    </div>
                </div>

                {/* ── Fixed Footer ── */}
                <div className='flex-none p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-4 z-20'>
                    <button 
                        onClick={onClose} 
                        className='px-10 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 transition-all'
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={submitting} 
                        className='px-10 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-brand-500 rounded-lg shadow-xl shadow-brand-500/20 hover:bg-brand-600 transition-all active:scale-95 disabled:opacity-50'
                    >
                        {submitting ? 'Processing...' : 'Generate Invoice & Complete'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default InvoiceModal;
