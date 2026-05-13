import { useState, useEffect, useRef } from 'react';
import { 
    ArrowRight, 
    UserCircle, 
    Contact, 
    Info, 
    ChevronDown, 
    X, 
    Mail, 
    Check, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    StickyNote,
    Plus,
    Users,
    Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

const UserOtherInfoStep = ({ formData, onUpdate, onNext, onBack }) => {
    const { user, token } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const dropdownRef = useRef(null);

    // Internal state synced with parent fields for the breakdown (1:1 with Guest InfoStep)
    const [nameParts, setNameParts] = useState({
        first: formData.booked_for_first_name || '',
        last: formData.booked_for_last_name || '',
        middle: formData.booked_for_middle_name || '',
        suffix: formData.booked_for_suffix_name || ''
    });

    const [showCustomSuffix, setShowCustomSuffix] = useState(
        formData.booked_for_suffix_name && !['Jr.', 'Sr.', 'II', 'III', 'IV'].includes(formData.booked_for_suffix_name)
    );

    const commonSuffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV'];

    // Fetch profiles on mount
    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                setLoading(true);
                const response = await api.get('/profiles', token);
                setProfiles(response.profiles || []);
            } catch (err) {
                console.error('Failed to fetch profiles:', err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchProfiles();
    }, [token]);

    // ✅ Auto-fill "Myself" as default if no selection exists
    useEffect(() => {
        if (user && !formData.patient_profile_id && !formData.booked_for_relationship) {
            handleSelect('myself');
        }
    }, [user, formData.patient_profile_id, formData.booked_for_relationship]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validateNames = (name, allowDots = false) => {
        return allowDots ? /^[a-zA-Z\s.-]*$/.test(name) : /^[a-zA-Z\s-]*$/.test(name);
    };

    const handleSelect = (profileId) => {
        setIsOpen(false);
        setErrors({});

        let newData = {};
        if (profileId === 'myself') {
            newData = {
                patient_profile_id: '',
                booked_for_first_name: user?.first_name || '',
                booked_for_last_name: user?.last_name || '',
                booked_for_middle_name: user?.middle_name || '',
                booked_for_suffix_name: user?.suffix || '',
                booked_for_birthday: user?.date_of_birth || '',
                booked_for_relationship: 'Self',
                booked_for_sex: user?.sex || '',
                booked_for_phone: user?.phone || ''
            };
        } else if (profileId === 'new') {
            newData = {
                patient_profile_id: 'new',
                booked_for_first_name: '',
                booked_for_last_name: '',
                booked_for_middle_name: '',
                booked_for_suffix_name: '',
                booked_for_birthday: '',
                booked_for_relationship: '',
                booked_for_sex: '',
                booked_for_phone: user?.phone || ''
            };
        } else {
            const profile = profiles.find(p => p.id === profileId);
            if (profile) {
                newData = {
                    patient_profile_id: profile.id,
                    booked_for_first_name: profile.first_name,
                    booked_for_last_name: profile.last_name,
                    booked_for_middle_name: profile.middle_name,
                    booked_for_suffix_name: profile.suffix,
                    booked_for_birthday: profile.date_of_birth,
                    booked_for_relationship: profile.relationship_to_primary || 'Dependent',
                    booked_for_sex: profile.sex || '',
                    booked_for_phone: user?.phone || ''
                };
            }
        }

        if (Object.keys(newData).length > 0) {
            onUpdate(newData);
            setNameParts({
                first: newData.booked_for_first_name,
                last: newData.booked_for_last_name,
                middle: newData.booked_for_middle_name,
                suffix: newData.booked_for_suffix_name
            });
            setShowCustomSuffix(newData.booked_for_suffix_name && !['Jr.', 'Sr.', 'II', 'III', 'IV'].includes(newData.booked_for_suffix_name));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!nameParts.first.trim()) {
            newErrors.first = 'First name is required.';
        } else if (!validateNames(nameParts.first)) {
            newErrors.first = 'Numbers and special characters are not allowed.';
        }

        if (!nameParts.last.trim()) {
            newErrors.last = 'Last name is required.';
        } else if (!validateNames(nameParts.last)) {
            newErrors.last = 'Numbers and special characters are not allowed.';
        }

        if (nameParts.middle && !validateNames(nameParts.middle)) {
            newErrors.middle = 'Invalid characters in middle name.';
        }

        // Strict enforcement for birthday and sex
        if (!formData.booked_for_birthday) {
            newErrors.birthday = 'Date of birth is required for medical records.';
        }
        
        if (!formData.booked_for_sex) {
            newErrors.sex = 'Biological sex is required for clinical history.';
        }

        if (formData.patient_profile_id === 'new' && !formData.booked_for_relationship) {
            newErrors.relationship = 'Relationship is required for family accounts.';
        }

        setErrors(newErrors);
        
        const firstError = Object.keys(newErrors)[0];
        if (firstError) {
            setTimeout(() => {
                const element = document.getElementById(`field-${firstError}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.focus({ preventScroll: true });
                }
            }, 100);
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    const handleFieldChange = (field, value) => {
        // Phone specific logic: Strictly enforce 09XX XXXX XXXX format (1:1 with Guest)
        if (field === 'booked_for_phone') {
            let digits = value.replace(/\D/g, '');
            
            if (digits.length === 0) {
                onUpdate({ booked_for_phone: '' });
                return;
            }

            if (digits.length === 1) {
                digits = (digits === '0' || digits === '9') ? '09' : '09' + digits;
            } else if (digits.length >= 2 && !digits.startsWith('09')) {
                digits = digits.startsWith('9') ? '0' + digits : '09' + digits;
            }

            digits = digits.substring(0, 11);

            let formatted = digits;
            if (digits.length > 7) {
                formatted = `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
            } else if (digits.length > 3) {
                formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
            }

            onUpdate({ booked_for_phone: formatted });
        } else if (field === 'patient_note') {
             if (value.length <= 100) onUpdate({ [field]: value });
        } else {
            onUpdate({ [field]: value });
        }

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleNamePartChange = (part, value) => {
        if (!validateNames(value, part === 'suffix')) return;

        const updated = { ...nameParts, [part]: value };
        setNameParts(updated);
        onUpdate({ [`booked_for_${part}_name`]: value });

        if (errors[part]) {
            setErrors(prev => ({ ...prev, [part]: undefined }));
        }
    };

    const isReadOnly = formData.patient_profile_id !== 'new';
    const currentSelection = formData.patient_profile_id === 'new' ? 'new' : (formData.patient_profile_id || 'myself');
    const isSelf = currentSelection === 'myself' || formData.booked_for_relationship === 'Self';

    const getSelectedLabel = () => {
        if (currentSelection === 'myself') return 'Myself (Primary Account)';
        if (currentSelection === 'new') return '+ Add New Family Member';
        const p = profiles.find(p => p.id === currentSelection);
        return p ? `${p.first_name} ${p.last_name} (${p.relationship_to_primary || 'Dependent'})` : 'Select Patient';
    };

    const baseInput = "h-11 w-full rounded-xl border appearance-none px-4 py-2.5 text-[13px] sm:text-sm shadow-theme-sm placeholder:text-gray-400 focus:outline-hidden focus:ring-4 transition-all bg-white dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 font-medium";
    
    const getInputClasses = (fieldError) => {
        if (fieldError) {
            return `${baseInput} border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
        }
        return `${baseInput} text-gray-800 border-gray-300 dark:border-gray-700 focus:border-brand-300 focus:ring-brand-500/15 hover:border-gray-400 dark:hover:border-gray-600 dark:text-white/90 dark:focus:border-brand-800 shadow-theme-xs hover:shadow-theme-sm`;
    };

    const labelClasses = "mb-2 block text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 leading-none";

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 pb-[60px] sm:pb-8">
            {/* Header Section (1:1 with Guest) */}
            <div className='mb-6 sm:mb-8'>
                <h2 className='text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight'>
                    Patient Details
                </h2>
                <p className='text-[13px] sm:text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium'>
                    Enter the details below to confirm who this appointment is for and their contact information.
                </p>
            </div>

            {/* Profile Selection Dropdown (Synchronized with Dentist Selection style) */}
            <div className='mb-10 relative' ref={dropdownRef}>
                <h3 className='text-[13px] font-black text-gray-400 mb-4 flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-brand-500' />
                    Who are we booking for?
                </h3>
                <button
                    type="button"
                    onClick={() => !loading && setIsOpen(!isOpen)}
                    disabled={loading}
                    className={`w-full flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-white/[0.02] border-2 rounded-2xl transition-all shadow-theme-sm group ${
                        isOpen 
                            ? 'border-brand-500 ring-4 ring-brand-500/10 bg-brand-50/10' 
                            : 'border-gray-100 dark:border-gray-800 hover:border-brand-400'
                    } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <div className='flex items-center gap-3.5'>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 overflow-hidden border transition-all ${
                            currentSelection === 'new' ? 'bg-brand-50 border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20 text-brand-500' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-gray-800 text-gray-500'
                        }`}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                currentSelection === 'myself' ? <UserCircle size={24} /> : 
                                currentSelection === 'new' ? <Plus size={24} /> : 
                                <Users size={24} />
                            )}
                        </div>
                        <div className="flex flex-col text-left justify-center">
                            <span className="text-[12px] sm:text-[14px] font-black text-gray-900 dark:text-white leading-tight">
                                {loading ? 'Loading profiles...' : getSelectedLabel()}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
                                {currentSelection === 'myself' ? 'Primary Account Holder' : 
                                 currentSelection === 'new' ? 'Add a family member to your account' : 
                                 'Selected family member'}
                            </span>
                        </div>
                    </div>
                    <div className={`p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 transition-colors ${isOpen ? 'bg-brand-50 dark:bg-brand-500/10' : ''}`}>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-500 ${isOpen ? 'rotate-180 text-brand-500' : 'group-hover:text-brand-500'}`} />
                    </div>
                </button>

                {isOpen && (
                    <>
                        <div className='fixed inset-0 z-40' onClick={() => setIsOpen(false)} />
                        <div className='absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-[#0f172a] border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200'>
                            <div className='max-h-[320px] overflow-y-auto p-2 scrollbar-hide'>
                                <button
                                    onClick={() => handleSelect('myself')}
                                    className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left mb-1 group ${
                                        currentSelection === 'myself' 
                                            ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30' 
                                            : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-lg overflow-hidden border transition-colors ${
                                        currentSelection === 'myself' ? 'bg-brand-500 border-brand-500 text-white' : 'bg-brand-50 border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20 text-brand-500'
                                    }`}>
                                        <UserCircle size={20} />
                                    </div>
                                    <div className='flex flex-col flex-grow justify-center'>
                                        <span className={`text-[12px] sm:text-[14px] font-black ${currentSelection === 'myself' ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>Myself (Primary)</span>
                                        <span className={`text-[9px] sm:text-[10px] font-bold leading-tight mt-0.5 ${currentSelection === 'myself' ? 'text-brand-600/70 dark:text-brand-400/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                            Book an appointment for your own account.
                                        </span>
                                    </div>
                                    {currentSelection === 'myself' && (
                                        <div className='w-5 h-5 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white'>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>

                                {profiles.length > 0 && (
                                    <div className='px-3 py-1 mb-1'>
                                        <div className='h-px bg-gray-100 dark:bg-gray-800 w-full' />
                                    </div>
                                )}

                                {profiles.map(p => {
                                    const isSelected = currentSelection === p.id;
                                    const profileInitials = ((p.first_name?.[0] || '') + (p.last_name?.[0] || '')).toUpperCase() || 'P';
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSelect(p.id)}
                                            className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left mb-1 group ${
                                                isSelected 
                                                    ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30' 
                                                    : 'border border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            <div className='w-10 h-10 shrink-0 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-800 group-hover:border-brand-200 transition-colors'>
                                                <span className={`text-xs font-black ${isSelected ? 'text-brand-600' : 'text-gray-400'}`}>{profileInitials}</span>
                                            </div>
                                            <div className='flex flex-col flex-grow justify-center'>
                                                <span className={`text-[12px] sm:text-[14px] font-black ${isSelected ? 'text-brand-700 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {p.first_name} {p.last_name}
                                                </span>
                                                <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${isSelected ? 'text-brand-600/70 dark:text-brand-400/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {p.relationship_to_primary || 'Dependent'}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <div className='w-5 h-5 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white'>
                                                    <Check size={12} strokeWidth={4} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}

                                <div className='px-3 py-1 mb-1'>
                                    <div className='h-px bg-gray-100 dark:bg-gray-800 w-full' />
                                </div>

                                <button
                                    onClick={() => handleSelect('new')}
                                    className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left group ${
                                        currentSelection === 'new' 
                                            ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30' 
                                            : 'border border-transparent text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/5'
                                    }`}
                                >
                                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center text-lg overflow-hidden border transition-colors ${
                                        currentSelection === 'new' ? 'bg-brand-500 border-brand-500 text-white' : 'bg-brand-50 border-brand-100 dark:bg-brand-500/10 dark:border-brand-500/20 text-brand-500'
                                    }`}>
                                        <Plus size={20} />
                                    </div>
                                    <div className='flex flex-col flex-grow justify-center'>
                                        <span className={`text-[12px] sm:text-[14px] font-black ${currentSelection === 'new' ? 'text-brand-700 dark:text-brand-400' : ''}`}>Add New Family Member</span>
                                        <span className={`text-[9px] sm:text-[10px] font-bold leading-tight mt-0.5 ${currentSelection === 'new' ? 'text-brand-600/70 dark:text-brand-400/60' : 'text-gray-400'}`}>
                                            Create a new profile for a dependent.
                                        </span>
                                    </div>
                                    {currentSelection === 'new' && (
                                        <div className='w-5 h-5 shrink-0 rounded-full bg-brand-500 flex items-center justify-center text-white'>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className='space-y-6 sm:space-y-8'>
                {/* Section 1: Personal Details (1:1 with Guest Style) */}
                <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden'>
                    <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                        <UserCircle size={18} className="text-brand-500" />
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">Personal Details</h3>
                    </div>

                    <div className="px-5 py-6 sm:px-10 sm:py-8 space-y-4 sm:space-y-8">
                        {/* Row 1: Primary Names */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6">
                            <div>
                                <label className={labelClasses}>Last Name <span className='text-brand-500'>*</span></label>
                                <input
                                    id="field-last"
                                    type='text'
                                    readOnly={isReadOnly}
                                    value={nameParts.last}
                                    onChange={(e) => handleNamePartChange('last', e.target.value)}
                                    placeholder='Dela Cruz'
                                    className={getInputClasses(errors.last)}
                                />
                                {errors.last && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.last}</p>}
                            </div>

                            <div>
                                <label className={labelClasses}>First Name <span className='text-brand-500'>*</span></label>
                                <input
                                    id="field-first"
                                    type='text'
                                    readOnly={isReadOnly}
                                    value={nameParts.first}
                                    onChange={(e) => handleNamePartChange('first', e.target.value)}
                                    placeholder='Juan'
                                    className={getInputClasses(errors.first)}
                                />
                                {errors.first && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.first}</p>}
                            </div>
                        </div>

                        {/* Row 2: Secondary Names */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6">
                            <div>
                                <label className={labelClasses}>Middle Name <span className="opacity-40 font-normal italic">(optional)</span></label>
                                <input
                                    id="field-middle"
                                    type='text'
                                    readOnly={isReadOnly}
                                    value={nameParts.middle}
                                    onChange={(e) => handleNamePartChange('middle', e.target.value)}
                                    placeholder='Santos'
                                    className={getInputClasses(errors.middle)}
                                />
                                {errors.middle && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.middle}</p>}
                            </div>

                            <div>
                                <label className={labelClasses}>Suffix <span className="opacity-40 font-normal italic">(optional)</span></label>
                                {!showCustomSuffix || isReadOnly ? (
                                    <div className="relative group/suffix">
                                        <select
                                            disabled={isReadOnly}
                                            value={commonSuffixes.includes(nameParts.suffix) ? nameParts.suffix : (nameParts.suffix ? 'Other' : '')}
                                            onChange={(e) => {
                                                if (e.target.value === 'Other') {
                                                    setShowCustomSuffix(true);
                                                    handleNamePartChange('suffix', '');
                                                } else {
                                                    handleNamePartChange('suffix', e.target.value);
                                                }
                                            }}
                                            className={`${getInputClasses()} cursor-pointer pr-10 ${isReadOnly ? 'cursor-default opacity-100' : ''}`}
                                        >
                                            <option value="">None</option>
                                            <option value="Jr.">Jr.</option>
                                            <option value="Sr.">Sr.</option>
                                            <option value="II">II</option>
                                            <option value="III">III</option>
                                            <option value="IV">IV</option>
                                            <option value="Other">Other...</option>
                                            {isReadOnly && nameParts.suffix && !commonSuffixes.includes(nameParts.suffix) && (
                                                <option value={nameParts.suffix}>{nameParts.suffix}</option>
                                            )}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type='text'
                                            value={nameParts.suffix}
                                            onChange={(e) => handleNamePartChange('suffix', e.target.value)}
                                            placeholder='PhD'
                                            className={getInputClasses()}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => { setShowCustomSuffix(false); handleNamePartChange('suffix', ''); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Row 3: DOB & Sex */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 sm:gap-y-6 pt-4 sm:pt-0 sm:border-t-0 border-t border-gray-50 dark:border-gray-800/50 mt-2 sm:mt-0">
                            <div>
                                <label className={labelClasses}>Date of Birth <span className='text-red-500'>*</span></label>
                                <div className="relative group">
                                    <input
                                        id="field-birthday"
                                        type='date'
                                        readOnly={isReadOnly}
                                        value={formData.booked_for_birthday || ''}
                                        onChange={(e) => handleFieldChange('booked_for_birthday', e.target.value)}
                                        onClick={(e) => {
                                            if (!isReadOnly) try { e.target.showPicker(); } catch (err) {}
                                        }}
                                        className={`${getInputClasses(errors.birthday)} w-full ${!formData.booked_for_birthday ? 'text-transparent dark:text-transparent' : ''}`}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    {!formData.booked_for_birthday && (
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 text-[13px] sm:text-sm font-medium">
                                            YYYY-MM-DD
                                        </div>
                                    )}
                                </div>
                                {errors.birthday && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.birthday}</p>}
                            </div>

                            <div>
                                <label className={labelClasses}>Biological Sex <span className='text-red-500'>*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['M', 'F'].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            id={`field-sex-${s.toLowerCase()}`}
                                            disabled={isReadOnly}
                                            onClick={() => handleFieldChange('booked_for_sex', s)}
                                            className={`py-3 px-4 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                                                formData.booked_for_sex === s
                                                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 shadow-sm'
                                                    : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 dark:border-gray-800 dark:bg-transparent dark:text-gray-400'
                                            } ${isReadOnly ? 'cursor-default opacity-100' : ''}`}
                                        >
                                            {s === 'M' ? 'Male' : 'Female'}
                                        </button>
                                    ))}
                                </div>
                                {errors.sex && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.sex}</p>}
                            </div>
                        </div>

                        {/* Relationship (Conditional to User Flow) */}
                        {!isSelf && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className={labelClasses}>Relationship <span className='text-brand-500'>*</span></label>
                                {isReadOnly ? (
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={formData.booked_for_relationship}
                                        className={getInputClasses()}
                                    />
                                ) : (
                                    <div className="relative group">
                                        <select 
                                            id="field-relationship"
                                            value={formData.booked_for_relationship}
                                            onChange={(e) => handleFieldChange('booked_for_relationship', e.target.value)}
                                            className={`${getInputClasses(errors.relationship)} pr-10 cursor-pointer`}
                                        >
                                            <option value="" disabled>Select Relationship</option>
                                            <option value="Child">Child</option>
                                            <option value="Spouse">Spouse</option>
                                            <option value="Parent">Parent</option>
                                            <option value="Sibling">Sibling</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <ChevronDown size={18} className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none' />
                                    </div>
                                )}
                                {errors.relationship && <p className='text-error-500 text-[10px] font-bold mt-1.5 ml-1'>{errors.relationship}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Contact Details (1:1 with Guest Style) */}
                <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden'>
                    <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                        <Contact size={18} className="text-brand-500" />
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">Contact Details</h3>
                    </div>

                    <div className="px-5 py-6 sm:px-10 sm:py-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Email Address */}
                            <div>
                                <label className={labelClasses}>Email address</label>
                                <div className="relative">
                                    <input
                                        id="field-email"
                                        type='email'
                                        readOnly
                                        value={user?.email || ''}
                                        className={`${baseInput} bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-white/40 cursor-not-allowed pr-10`}
                                    />
                                    <Mail size={16} className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none' />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <div className="relative">
                                    <input
                                        id="field-phone"
                                        type='tel'
                                        readOnly
                                        value={user?.phone || ''}
                                        className={`${baseInput} bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-gray-800 text-gray-500 dark:text-white/40 cursor-not-allowed pr-20`}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <span className="text-[10px] font-black text-gray-400">PH (+63)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Additional Notes (1:1 with Guest Style) */}
                <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md overflow-hidden'>
                    <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                        <StickyNote size={18} className="text-brand-500" />
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">Additional Notes</h3>
                    </div>

                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className="flex flex-row items-baseline justify-between gap-2 mb-3">
                            <label className={`${labelClasses} mb-0 flex-1 min-w-0`}>
                                Special Requests <span className="opacity-40 font-normal italic">(Optional)</span>
                            </label>
                            <span className={`text-[10px] font-bold shrink-0 tabular-nums ${formData.patient_note?.length >= 100 ? 'text-error-500' : 'text-gray-400'}`}>
                                {formData.patient_note?.length || 0} / 100
                            </span>
                        </div>
                        <textarea
                            value={formData.patient_note || ''}
                            onChange={(e) => handleFieldChange('patient_note', e.target.value)}
                            placeholder="e.g. Allergies, preferred room, etc."
                            maxLength={100}
                            className={`${getInputClasses()} min-h-[80px] py-3 resize-none`}
                        />
                    </div>
                </div>

                {/* Section 4: Agreement (Parity with Guest) */}
                <div className='w-full bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-theme-md mb-10 overflow-hidden animate-in slide-in-from-bottom-4 duration-700'>
                    <div className="px-5 pt-7 pb-5 sm:px-10 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
                        <CheckCircle2 size={18} className="text-brand-500" />
                        <h3 className="text-[14px] sm:text-lg font-bold text-gray-900 dark:text-white">Agreement & Privacy</h3>
                    </div>

                    <div className="px-5 py-6 sm:px-10 sm:py-8">
                        <div className='flex items-start gap-4'>
                            <div className="pt-0.5">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={formData.agreed_to_terms || false}
                                    onChange={(e) => onUpdate({ agreed_to_terms: e.target.checked })}
                                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-gray-300 text-brand-500 focus:ring-brand-500/20 cursor-pointer transition-all"
                                />
                            </div>
                            <label htmlFor="terms" className="text-[12px] sm:text-[14px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed cursor-pointer select-none">
                                I agree to the <a href="/terms-of-service" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Terms of Service</a> and <a href="/privacy-policy" target="_blank" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">Privacy Policy</a>.
                                <span className="block mt-1.5 text-[10px] sm:text-[12px] text-gray-500 dark:text-gray-500 font-normal italic leading-snug">
                                    I understand my data will be handled securely per clinic policy.
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Navigation */}
            <div className='fixed bottom-0 left-0 right-0 sm:relative z-40 px-6 py-4 sm:px-0 sm:py-0 sm:mt-8 sm:pt-4 bg-white/95 dark:bg-gray-900/95 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none border-t border-gray-100 dark:border-gray-800 sm:border-t-0 shadow-[0_-8px_20px_rgba(0,0,0,0.05)] sm:shadow-none transition-all'>
                <div className='flex items-center gap-3 w-full sm:justify-between'>
                    <button
                        type="button"
                        onClick={onBack}
                        className='flex-1 sm:flex-none sm:min-w-[120px] text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-black text-[11px] sm:text-sm px-2 py-3.5 sm:px-8 transition-colors bg-gray-50 dark:bg-gray-800 sm:bg-transparent rounded-2xl border border-transparent shadow-theme-xs'
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!formData.agreed_to_terms}
                        className={`flex-[2] sm:flex-none sm:min-w-[280px] font-black px-6 py-3.5 sm:px-10 sm:py-4 rounded-2xl transition-all shadow-theme-md flex items-center justify-center gap-1 sm:gap-2.5 text-[12px] sm:text-base ${formData.agreed_to_terms
                            ? 'bg-brand-500 hover:bg-brand-600 active:scale-95 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed grayscale opacity-50'
                            }`}
                    >
                        Continue to Review
                        <ArrowRight size={16} className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOtherInfoStep;
