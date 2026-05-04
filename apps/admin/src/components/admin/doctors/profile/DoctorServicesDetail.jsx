import React, { useState, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Save, Info } from 'lucide-react';
import Button from '../../../ui/Button';
import { useToast } from '../../../../context/ToastContext.jsx';
import useServices from '../../../../hooks/useServices';

const DoctorServicesDetail = ({ doctor, updateDoctorServices }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { services: allServices = [] } = useServices();
    
    const currentServices = doctor.services || [];
    const [selectedServices, setSelectedServices] = useState(
        currentServices.map(s => s.name)
    );

    React.useEffect(() => {
        setSelectedServices((doctor.services || []).map(s => s.name));
    }, [doctor.services]);

    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const categorizedServices = useMemo(() => {
        const fallbackId = (index) => `temp-${index}`;
        
        const mappedServices = allServices.map((s, index) => ({
            id: s.id,
            name: s.name,
            category: s.category || (s.tier === 'general' ? 'General' : s.tier === 'specialized' ? 'Specialized' : 'Clinical')
        }));
        
        return {
            authorized: mappedServices.filter(s => selectedServices.includes(s.name)),
            general: mappedServices.filter(s => !selectedServices.includes(s.name) && s.category?.toLowerCase() === 'general'),
            specialized: mappedServices.filter(s => !selectedServices.includes(s.name) && s.category?.toLowerCase() === 'specialized')
        };
    }, [selectedServices, allServices]);

    const renderServiceCheckbox = (service) => {
        const isChecked = selectedServices.includes(service.name);
        return (
            <label 
                key={service.name}
                className={`h-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer group overflow-hidden ${
                    isChecked 
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' 
                        : 'border-gray-200 dark:border-gray-800/80 hover:border-brand-500/50 hover:bg-white dark:hover:bg-white/[0.03] bg-gray-50/30 dark:bg-white/[0.01]'
                }`}
            >
                <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                    <input 
                        type="checkbox"
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 shrink-0"
                        checked={isChecked}
                        onChange={() => toggleService(service.name)}
                    />
                    <div className="min-w-0 max-w-full">
                        <p className={`text-[clamp(11px,1.2vw,13px)] font-bold text-gray-800 dark:text-white/90 truncate transition-all duration-300`}>{service.name}</p>
                        <span className={`text-[clamp(9px,1vw,10px)] font-bold uppercase tracking-widest transition-colors block truncate ${isChecked ? 'text-brand-500/70' : 'text-gray-400 group-hover:text-brand-500/70'}`}>
                            {service.category || 'Clinical'}
                        </span>
                    </div>
                </div>
            </label>
        );
    };

    const toggleService = (serviceName) => {
        setSelectedServices(prev => 
            prev.includes(serviceName) 
                ? prev.filter(s => s !== serviceName) 
                : [...prev, serviceName]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (updateDoctorServices) {
                const serviceIdsToSave = allServices
                    .filter(s => selectedServices.includes(s.name))
                    .map(s => s.id)
                    .filter(Boolean);
                
                await updateDoctorServices(doctor.id, serviceIdsToSave);
                showToast('Authorized services updated successfully!');
            } else {
                showToast('Mock: Services updated!');
            }
        } catch (err) {
            showToast('Failed to update services.', 'error');
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        showToast("Changes discarded.", 'notice');
        setSelectedServices(currentServices.map(s => s.name));
        setIsEditing(false);
    };

    return (
        <div className='w-full p-4 sm:p-6 lg:p-10 border border-gray-300 rounded-2xl dark:border-gray-800 bg-white dark:bg-white/[0.03] shadow-sm'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 sm:mb-10'>
                <div>
                    <h4 className='text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase font-outfit'>
                        Authorized Services & Skills
                    </h4>
                    <p className='text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em] mt-0.5 font-bold'>
                        {selectedServices.length} Clinical Tasks currently authorized
                    </p>
                </div>

                {!isEditing ? (
                    <Button 
                        variant='outline'
                        onClick={() => setIsEditing(true)}
                        className='h-11 sm:h-12 px-6 text-[10px] font-black uppercase tracking-widest shadow-sm border-gray-200 dark:border-white/5 rounded-xl'
                    >
                        Edit Registry
                    </Button>
                ) : (
                    <div className='flex items-center gap-2 text-brand-500 bg-brand-500/10 px-3 py-1.5 rounded-lg'>
                        <Info size={14} strokeWidth={3} />
                        <span className='text-[10px] font-black uppercase tracking-widest'>Edit Mode Active</span>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className='space-y-10 animate-in fade-in duration-300'>
                    {categorizedServices.authorized.length > 0 && (
                        <div className='space-y-4'>
                            <h5 className='text-[10px] font-black uppercase tracking-widest text-brand-500 flex items-center gap-2'>
                                <CheckCircle2 size={12} strokeWidth={3} />
                                Currently Authorized
                            </h5>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                {categorizedServices.authorized.map(renderServiceCheckbox)}
                            </div>
                        </div>
                    )}
                    
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                        {categorizedServices.general.map(renderServiceCheckbox)}
                        {categorizedServices.specialized.map(renderServiceCheckbox)}
                    </div>
                    
                    <div className='flex items-center justify-end gap-3 pt-8 border-t border-gray-200 dark:border-gray-800'>
                        <Button 
                            variant='outline' 
                            onClick={handleCancel}
                            className='h-11 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl'
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className='h-11 px-8 text-[10px] font-black uppercase tracking-widest bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20'
                        >
                            {isSaving ? 'Saving...' : 'Save Registry'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {selectedServices.length > 0 ? selectedServices.map((service, i) => (
                        <div key={i} className='p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/20 dark:bg-white/[0.01] flex items-center gap-4'>
                            <div className='w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shrink-0'>
                                <CheckCircle2 size={14} strokeWidth={3} />
                            </div>
                            <div className="min-w-0">
                                <p className='text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight truncate'>{service}</p>
                                <span className='text-[8px] font-black uppercase tracking-widest text-brand-500/70'>Authorized Task</span>
                            </div>
                        </div>
                    )) : (
                        <div className='col-span-full py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl'>
                            <AlertCircle size={32} className='text-gray-300 mb-4' />
                            <p className='text-xs font-black text-gray-400 uppercase tracking-widest'>No services configured</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorServicesDetail;
