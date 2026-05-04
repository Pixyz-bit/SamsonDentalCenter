import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Button, Input, Label } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { FormSkeleton } from '../../ui/Skeletons';

const ClinicGeneralSettings = () => {
    const { settings, loading, error, updating, updateSettings } = useSettings();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        clinic_name: '',
        email_official: '',
        phone_primary: '',
        physical_address: '',
        announcement: ''
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                clinic_name: settings.clinic_name || '',
                email_official: settings.email_official || settings.email || '',
                phone_primary: settings.phone_primary || settings.phone || '',
                physical_address: settings.physical_address || settings.address || '',
                announcement: settings.announcement || ''
            });
        }
    }, [settings]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            await updateSettings(formData);
            showToast('Clinic identity updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update settings: ' + err.message, 'error');
        }
    };

    if (loading) return <FormSkeleton />;
    if (error) return <div className="p-4 text-red-500 font-bold">Error: {error}</div>;

    return (
        <div className='space-y-6'>
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>
                            General Clinic Identity
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            Powers the patient-facing website and communications
                        </p>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='space-y-5'>
                        <div>
                            <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block'>
                                Clinic Name
                            </Label>
                            <Input 
                                name="clinic_name"
                                value={formData.clinic_name}
                                onChange={handleChange}
                                className="font-bold h-12"
                                placeholder="e.g. Primera Dental"
                            />
                        </div>
                        <div>
                            <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block'>
                                Website Announcement Banner
                            </Label>
                            <Input 
                                name="announcement"
                                value={formData.announcement}
                                onChange={handleChange}
                                className="h-12"
                                placeholder="e.g. 20% off on Teeth Whitening this May!"
                            />
                        </div>
                    </div>
                    <div className='space-y-5'>
                        <div>
                            <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block'>
                                Contact Email
                            </Label>
                            <Input 
                                name="email_official"
                                type="email"
                                value={formData.email_official}
                                onChange={handleChange}
                                className="h-12"
                                placeholder="hello@clinic.com"
                            />
                        </div>
                        <div>
                            <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block'>
                                Hotline / Phone
                            </Label>
                            <Input 
                                name="phone_primary"
                                value={formData.phone_primary}
                                onChange={handleChange}
                                className="h-12 font-medium"
                                placeholder="+63 9XX XXX XXXX"
                            />
                        </div>
                    </div>
                </div>

                <div className='mt-8'>
                    <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block'>
                        Physical Address
                    </Label>
                    <textarea 
                        name="physical_address"
                        value={formData.physical_address}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none shadow-inner"
                        rows={3}
                        placeholder="Full clinic address..."
                    />
                </div>

                <div className='mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
                    <Button 
                        onClick={handleSubmit}
                        disabled={updating}
                        className='px-10 h-12 rounded-xl text-sm font-black bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50'
                    >
                        {updating ? 'Updating...' : 'Save Identity Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClinicGeneralSettings;
