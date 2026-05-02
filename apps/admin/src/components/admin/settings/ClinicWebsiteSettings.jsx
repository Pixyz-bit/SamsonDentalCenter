import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Image as ImageIcon, Share2, AlignLeft, Clock } from 'lucide-react';
import { Button, Input, Label } from '../../ui';
import { useSettings } from '../../../hooks/useSettings';
import { useToast } from '../../../context/ToastContext';
import { FormSkeleton } from '../../ui/Skeletons';

const ClinicWebsiteSettings = () => {
    const { settings, loading, error, updating, updateSettings } = useSettings();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        // Core Identity
        clinic_name: '',
        short_description: '',
        
        // Contact Info
        physical_address: '',
        phone_primary: '',
        email_official: '',
        
        // Location & Hours
        business_hours_text: '',
        closed_time_text: '',
        google_maps_link: '',
        
        // Brand Assets
        logo_primary_url: '',
        logo_light_url: '',
        favicon_url: '',
        
        // Social Media
        facebook_url: '',
        instagram_url: '',
        twitter_url: '',
        youtube_url: ''
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                clinic_name: settings.clinic_name || '',
                short_description: settings.short_description || '',
                
                physical_address: settings.physical_address || settings.address || '',
                phone_primary: settings.phone_primary || settings.phone || '',
                email_official: settings.email_official || settings.email || '',
                
                business_hours_text: settings.business_hours_text || '',
                closed_time_text: settings.closed_time_text || '',
                google_maps_link: settings.google_maps_link || '',
                
                logo_primary_url: settings.logo_primary_url || '',
                logo_light_url: settings.logo_light_url || '',
                favicon_url: settings.favicon_url || '',
                
                facebook_url: settings.facebook_url || '',
                instagram_url: settings.instagram_url || '',
                twitter_url: settings.twitter_url || '',
                youtube_url: settings.youtube_url || ''
            });
        }
    }, [settings]);

    const handleSubmit = async () => {
        try {
            await updateSettings(formData);
            showToast('Website details updated successfully!', 'success');
        } catch (err) {
            showToast('Failed to update website details: ' + err.message, 'error');
        }
    };

    if (loading) return <FormSkeleton />;
    if (error) return <div className="p-4 text-red-500 font-bold">Error: {error}</div>;

    return (
        <div className='space-y-6 pb-24'>
            {/* Header */}
            <div className='mb-8'>
                <h3 className='text-2xl font-black text-gray-900 dark:text-white tracking-tight'>
                    Website Details
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium'>
                    Manage the core data used across the patient portal.
                </p>
            </div>

            {/* Core Identity */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-lg'>
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>Core Identity</h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>The primary name and SEO description</p>
                    </div>
                </div>
                
                <div className='space-y-6'>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Clinic Name</Label>
                        <Input 
                            value={formData.clinic_name}
                            onChange={(e) => setFormData(p => ({ ...p, clinic_name: e.target.value }))}
                            placeholder="e.g. Primera Dental"
                            className="font-bold"
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Short Description (Meta / Footer)</Label>
                        <textarea 
                            value={formData.short_description}
                            onChange={(e) => setFormData(p => ({ ...p, short_description: e.target.value }))}
                            className="w-full min-h-[80px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                            placeholder="A 1-to-2 sentence summary of your clinic..."
                        />
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 rounded-lg'>
                        <Phone size={20} />
                    </div>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>Contact Info</h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>Primary ways patients reach you</p>
                    </div>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Official Email</Label>
                        <Input 
                            value={formData.email_official}
                            onChange={(e) => setFormData(p => ({ ...p, email_official: e.target.value }))}
                            placeholder="e.g. hello@primeradental.com"
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Primary Phone</Label>
                        <Input 
                            value={formData.phone_primary}
                            onChange={(e) => setFormData(p => ({ ...p, phone_primary: e.target.value }))}
                            placeholder="e.g. (123) 456-7890"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Physical Address</Label>
                        <Input 
                            value={formData.physical_address}
                            onChange={(e) => setFormData(p => ({ ...p, physical_address: e.target.value }))}
                            placeholder="e.g. 123 Health Ave, Manila"
                        />
                    </div>
                </div>
            </div>

            {/* Location & Hours */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 rounded-lg'>
                        <Clock size={20} />
                    </div>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>Location & Hours</h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>Maps integration and readable hours</p>
                    </div>
                </div>
                
                <div className='space-y-6'>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Business Hours Text</Label>
                        <Input 
                            value={formData.business_hours_text}
                            onChange={(e) => setFormData(p => ({ ...p, business_hours_text: e.target.value }))}
                            placeholder="e.g. Mon-Fri: 9AM - 6PM, Sat: 9AM - 2PM"
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Closed Time Text</Label>
                        <Input 
                            value={formData.closed_time_text}
                            onChange={(e) => setFormData(p => ({ ...p, closed_time_text: e.target.value }))}
                            placeholder="e.g. Closed on Sundays & Holidays"
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Google Maps Share Link</Label>
                        <Input 
                            value={formData.google_maps_link}
                            onChange={(e) => setFormData(p => ({ ...p, google_maps_link: e.target.value }))}
                            placeholder="https://maps.app.goo.gl/..."
                        />
                    </div>
                </div>
            </div>

            {/* Brand Assets */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-lg'>
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>Brand Assets</h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>URLs to your hosted logos and icons</p>
                    </div>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Primary Logo URL</Label>
                        <Input 
                            value={formData.logo_primary_url}
                            onChange={(e) => setFormData(p => ({ ...p, logo_primary_url: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Light Logo URL (For dark backgrounds)</Label>
                        <Input 
                            value={formData.logo_light_url}
                            onChange={(e) => setFormData(p => ({ ...p, logo_light_url: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Favicon URL</Label>
                        <Input 
                            value={formData.favicon_url}
                            onChange={(e) => setFormData(p => ({ ...p, favicon_url: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>

            {/* Social Media */}
            <div className='p-6 border border-gray-200 rounded-xl dark:border-gray-800 lg:p-7 bg-white dark:bg-white/[0.03] shadow-sm'>
                <div className='flex items-center gap-3 mb-6'>
                    <div className='p-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-lg'>
                        <Share2 size={20} />
                    </div>
                    <div>
                        <h4 className='text-lg font-bold text-gray-900 dark:text-white'>Social Media</h4>
                        <p className='text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 font-bold'>Links to official social pages</p>
                    </div>
                </div>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Facebook URL</Label>
                        <Input 
                            value={formData.facebook_url}
                            onChange={(e) => setFormData(p => ({ ...p, facebook_url: e.target.value }))}
                            placeholder="https://facebook.com/..."
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Instagram URL</Label>
                        <Input 
                            value={formData.instagram_url}
                            onChange={(e) => setFormData(p => ({ ...p, instagram_url: e.target.value }))}
                            placeholder="https://instagram.com/..."
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Twitter / X URL</Label>
                        <Input 
                            value={formData.twitter_url}
                            onChange={(e) => setFormData(p => ({ ...p, twitter_url: e.target.value }))}
                            placeholder="https://twitter.com/..."
                        />
                    </div>
                    <div>
                        <Label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>YouTube URL</Label>
                        <Input 
                            value={formData.youtube_url}
                            onChange={(e) => setFormData(p => ({ ...p, youtube_url: e.target.value }))}
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                </div>
            </div>

            {/* Save Button Floating Container */}
            <div className='fixed bottom-8 right-8 z-30'>
                <Button 
                    onClick={handleSubmit}
                    disabled={updating}
                    className='px-10 h-14 rounded-2xl text-base font-black bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-2xl shadow-brand-500/40 disabled:opacity-50 flex items-center gap-3 scale-110'
                >
                    {updating ? 'Saving...' : 'Save Website Details'}
                </Button>
            </div>
        </div>
    );
};

export default ClinicWebsiteSettings;
