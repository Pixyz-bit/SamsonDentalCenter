import React, { useState, useEffect } from 'react';
import { Shield, FileText, ExternalLink } from 'lucide-react';
import { Button, Label } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { FormSkeleton } from '../../ui/Skeletons';

const ClinicLegalSettings = () => {
    const { settings, loading, error, updating, updateSettings } = useSettings();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        privacy_policy_text: '',
        terms_of_service_text: ''
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                privacy_policy_text: settings.privacy_policy_text || '',
                terms_of_service_text: settings.terms_of_service_text || ''
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
            showToast('Legal documents updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update legal settings: ' + err.message, 'error');
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
                            Legal & Compliance
                        </h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>
                            Manage your clinic's legal agreements and privacy policies
                        </p>
                    </div>
                </div>

                <div className='space-y-10'>
                    {/* Privacy Policy */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 shadow-sm'>
                                    <Shield size={18} />
                                </div>
                                <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                    Privacy Policy Content
                                </Label>
                            </div>
                            <button className='text-[10px] font-bold text-brand-500 flex items-center gap-1 hover:underline'>
                                Preview on Website <ExternalLink size={10} />
                            </button>
                        </div>
                        <textarea 
                            name="privacy_policy_text"
                            value={formData.privacy_policy_text}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[200px] shadow-inner"
                            placeholder="Enter Privacy Policy (Markdown supported)..."
                        />
                    </div>

                    {/* Terms of Service */}
                    <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 shadow-sm'>
                                    <FileText size={18} />
                                </div>
                                <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>
                                    Terms of Service Content
                                </Label>
                            </div>
                            <button className='text-[10px] font-bold text-brand-500 flex items-center gap-1 hover:underline'>
                                Preview on Website <ExternalLink size={10} />
                            </button>
                        </div>
                        <textarea 
                            name="terms_of_service_text"
                            value={formData.terms_of_service_text}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all min-h-[200px] shadow-inner"
                            placeholder="Enter Terms of Service (Markdown supported)..."
                        />
                    </div>
                </div>

                <div className='mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end'>
                    <Button 
                        onClick={handleSubmit}
                        disabled={updating}
                        className='px-10 h-12 rounded-xl text-sm font-black bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-md shadow-brand-500/20 disabled:opacity-50'
                    >
                        {updating ? 'Updating...' : 'Save Legal Documents'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ClinicLegalSettings;
