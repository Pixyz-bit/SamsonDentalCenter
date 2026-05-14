import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Label } from '../../ui';
import { useToast } from '../../../context/ToastContext';
import { ChevronDown, X } from 'lucide-react';

const commonSuffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

const AddDependentModal = ({ isOpen, onClose, onSave, dependent = null }) => {
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    // Controlled form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        suffix: '',
        date_of_birth: '',
        relationship: '',
        sex: 'Male'
    });
    
    const [errors, setErrors] = useState({});
    
    const [showCustomSuffix, setShowCustomSuffix] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setErrors({});
            if (dependent) {
                const suffix = dependent.suffix || '';
                setFormData({
                    first_name: dependent.first_name || '',
                    last_name: dependent.last_name || '',
                    middle_name: dependent.middle_name || '',
                    suffix: suffix,
                    date_of_birth: dependent.date_of_birth ? dependent.date_of_birth.split('T')[0] : '',
                    relationship: dependent.relationship || '',
                    sex: dependent.sex || 'Male'
                });
                setShowCustomSuffix(suffix !== '' && !commonSuffixes.includes(suffix));
            } else {
                setFormData({
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    suffix: '',
                    date_of_birth: '',
                    relationship: '',
                    sex: 'Male'
                });
                setShowCustomSuffix(false);
            }
        }
    }, [dependent, isOpen]);

    const validateNames = (name, allowDots = false) => {
        return allowDots ? /^[a-zA-Z\s.-]*$/.test(name) : /^[a-zA-Z\s-]*$/.test(name);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Prevent invalid characters in name fields
        if (['first_name', 'last_name', 'middle_name'].includes(name)) {
            if (!validateNames(value)) return;
        }
        if (name === 'suffix' && showCustomSuffix) {
            if (!validateNames(value, true)) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'First name is required.';
        } else if (!validateNames(formData.first_name)) {
            newErrors.first_name = 'Numbers and special characters are not allowed.';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'Last name is required.';
        } else if (!validateNames(formData.last_name)) {
            newErrors.last_name = 'Numbers and special characters are not allowed.';
        }

        if (formData.middle_name && !validateNames(formData.middle_name)) {
            newErrors.middle_name = 'Invalid characters in middle name.';
        }

        if (!formData.relationship) {
            newErrors.relationship = 'Relationship is required.';
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required.';
        }

        if (!formData.sex) {
            newErrors.sex = 'Biological sex is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSuffixSelectChange = (e) => {
        const value = e.target.value;
        if (value === 'Other') {
            setShowCustomSuffix(true);
            setFormData(prev => ({ ...prev, suffix: '' }));
        } else {
            setFormData(prev => ({ ...prev, suffix: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSaving(true);
        try {
            // Trim values before saving
            const submissionData = {
                ...formData,
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                middle_name: formData.middle_name.trim(),
                suffix: formData.suffix.trim()
            };

            await onSave(submissionData);
            showToast(dependent ? 'Family member updated successfully' : 'Family member added successfully');
            onClose();
        } catch (err) {
            console.error('Failed to save family member:', err);
            showToast(err.message || 'Failed to save family member', 'error', 'Error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            isBottomSheet={true} 
            className='sm:max-w-[500px] w-full' 
            showCloseButton={false}
        >
            <ModalHeader 
                title={dependent ? "Edit Family Member" : "Add Family Member"} 
                description={dependent ? "Update the identity details of your family member." : "Provide the patient identity details for your family member."} 
                onClose={onClose} 
            />
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <ModalBody>
                    <div className='space-y-5'>
                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">First Name *</Label>
                            <Input 
                                name="first_name"
                                className={`text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm transition-all ${errors.first_name ? 'border-rose-500 ring-rose-500/10 focus:ring-rose-500/10 focus:border-rose-500' : ''}`} 
                                value={formData.first_name}
                                onChange={handleInputChange}
                                required
                                placeholder="First Name"
                            />
                            {errors.first_name && <p className='text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1'>{errors.first_name}</p>}
                        </div>

                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Last Name *</Label>
                            <Input 
                                name="last_name"
                                className={`text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm transition-all ${errors.last_name ? 'border-rose-500 ring-rose-500/10 focus:ring-rose-500/10 focus:border-rose-500' : ''}`} 
                                value={formData.last_name}
                                onChange={handleInputChange}
                                required
                                placeholder="Last Name"
                            />
                            {errors.last_name && <p className='text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1'>{errors.last_name}</p>}
                        </div>

                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Middle Name</Label>
                            <Input 
                                name="middle_name"
                                className={`text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm transition-all ${errors.middle_name ? 'border-rose-500 ring-rose-500/10 focus:ring-rose-500/10 focus:border-rose-500' : ''}`} 
                                value={formData.middle_name}
                                onChange={handleInputChange}
                                placeholder="Middle Name"
                            />
                            {errors.middle_name && <p className='text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1'>{errors.middle_name}</p>}
                        </div>

                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Suffix</Label>
                            {!showCustomSuffix ? (
                                <div className="relative group/suffix">
                                    <select 
                                        className="w-full text-[13px] sm:text-sm font-medium h-11 px-4 pr-10 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500 transition-colors appearance-none shadow-theme-sm"
                                        value={commonSuffixes.includes(formData.suffix) ? formData.suffix : (formData.suffix ? 'Other' : '')}
                                        onChange={handleSuffixSelectChange}
                                    >
                                        <option value="">None</option>
                                        <option value="Jr.">Jr.</option>
                                        <option value="Sr.">Sr.</option>
                                        <option value="II">II</option>
                                        <option value="III">III</option>
                                        <option value="IV">IV</option>
                                        <option value="Other">Other...</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input 
                                        name="suffix"
                                        className="text-[13px] sm:text-sm font-medium h-11 pr-10 rounded-xl shadow-theme-sm" 
                                        value={formData.suffix}
                                        onChange={handleInputChange}
                                        placeholder="PhD, III, etc."
                                        autoFocus
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => { setShowCustomSuffix(false); setFormData(prev => ({ ...prev, suffix: '' })); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Relationship *</Label>
                            <div className="relative">
                                <select 
                                    name="relationship"
                                    className={`w-full text-[13px] sm:text-sm font-medium h-11 px-4 pr-10 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500 transition-colors appearance-none shadow-theme-sm ${errors.relationship ? 'border-rose-500 ring-rose-500/10 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                                    value={formData.relationship}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="" disabled>Select relationship</option>
                                    <option value="Child">Child</option>
                                    <option value="Spouse">Spouse</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Sibling">Sibling</option>
                                    <option value="Grandparent">Grandparent</option>
                                    <option value="Guardian">Guardian</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                            {errors.relationship && <p className='text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1'>{errors.relationship}</p>}
                        </div>

                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Date of Birth *</Label>
                            <Input 
                                name="date_of_birth"
                                type="date"
                                className={`text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm transition-all ${errors.date_of_birth ? 'border-rose-500 ring-rose-500/10 focus:ring-rose-500/10 focus:border-rose-500' : ''}`} 
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                onClick={(e) => {
                                    try { e.target.showPicker(); } catch (err) {}
                                }}
                                required
                            />
                            {errors.date_of_birth && <p className='text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1'>{errors.date_of_birth}</p>}
                        </div>

                        <div>
                            <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Sex *</Label>
                            <div className="relative">
                                <select 
                                    name="sex"
                                    className={`w-full text-[13px] sm:text-sm font-medium h-11 px-4 pr-10 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 outline-none focus:border-brand-500 transition-colors appearance-none shadow-theme-sm ${errors.sex ? 'border-rose-500 ring-rose-500/10 focus:ring-rose-500/10 focus:border-rose-500' : ''}`}
                                    value={formData.sex}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>
                            {errors.sex && <p className='text-rose-500 text-[10px] font-bold mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1'>{errors.sex}</p>}
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button 
                        variant='outline' 
                        type="button" 
                        onClick={onClose} 
                        className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-black text-[11px] sm:text-sm" 
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type='submit' 
                        className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-black text-[11px] sm:text-sm" 
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : dependent ? 'Update Member' : 'Save Member'}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default AddDependentModal;
