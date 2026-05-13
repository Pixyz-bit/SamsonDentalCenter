import { useState } from 'react';
import { 
    Lock, 
    Trash2, 
    ChevronRight, 
    Smartphone,
    AlertTriangle,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadcrumb';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import { useToast } from '../../context/ToastContext';

const SettingsPage = () => {
    const { showToast } = useToast();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [showPushModal, setShowPushModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Password state
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showToast("Passwords don't match", 'error');
            return;
        }
        setIsSaving(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 800));
            showToast("Password updated successfully!");
            setShowPasswordModal(false);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            showToast("Failed to update password", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setIsSaving(true);
        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            showToast("Account deletion requested.", 'error');
            setShowDeleteModal(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePushToggle = () => {
        setShowPushModal(true);
    };

    const confirmPushToggle = () => {
        setPushEnabled(!pushEnabled);
        setShowPushModal(false);
        showToast(pushEnabled ? "Notifications disabled" : "Notifications enabled");
    };

    const Toggle = ({ enabled, onToggle, label, description, icon: Icon }) => (
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl transition-all">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${enabled ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                    <Icon size={16} className="sm:size-5" />
                </div>
                <div>
                    <h4 className="text-[11px] sm:text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{label}</h4>
                    <p className="text-[9px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">{description}</p>
                </div>
            </div>
            <button 
                onClick={onToggle}
                className={`relative inline-flex h-4.5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
                <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    const SettingsCard = ({ title, description, children, danger = false }) => (
        <div className="mb-5 sm:mb-8">
            <div className="px-4 sm:px-0 mb-3 sm:mb-4">
                <h3 className={`text-[10px] sm:text-xs font-black uppercase tracking-wider leading-none mb-1 ${danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {title}
                </h3>
                <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    {description}
                </p>
            </div>
            <div className="space-y-2 sm:space-y-3">
                {children}
            </div>
        </div>
    );

    const ActionItem = ({ icon: Icon, label, description, onClick, danger = false }) => (
        <button 
            onClick={onClick}
            className="w-full flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all group"
        >
            <div className="flex items-center gap-3 sm:gap-4 text-left">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-brand-500 group-hover:bg-brand-50'}`}>
                    <Icon size={16} className="sm:size-5" />
                </div>
                <div>
                    <h4 className={`text-[11px] sm:text-sm font-bold leading-none mb-1 ${danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>{label}</h4>
                    <p className="text-[9px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium">{description}</p>
                </div>
            </div>
            <ChevronRight className="text-gray-300 dark:text-gray-700 group-hover:text-gray-400 transition-colors" size={14} className="sm:size-[18px]" />
        </button>
    );

    return (
        <div className="flex flex-col h-full pb-24">
            <PageBreadcrumb pageTitle='Settings' />
            
            <div className="flex flex-col grow">
                <div className="sm:hidden px-4 mt-2">
                    <h1 className="text-sm font-black text-gray-700 dark:text-white uppercase tracking-tight mb-4">
                        Settings
                    </h1>
                </div>

                <div className="flex-grow flex flex-col h-full sm:bg-white dark:sm:bg-white/[0.03] sm:rounded-xl sm:border border-gray-200 dark:border-gray-700/60 overflow-hidden">
                    <div className="p-4 sm:p-10 space-y-8 sm:space-y-12 w-full">
                        {/* 1. Notifications Section */}
                        <SettingsCard 
                            title="Notifications" 
                            description="Control how you receive updates and alerts."
                        >
                            <Toggle 
                                enabled={pushEnabled}
                                onToggle={handlePushToggle}
                                label="Push Notifications"
                                description="Receive alerts about appointment approvals and changes."
                                icon={Smartphone}
                            />
                        </SettingsCard>

                        {/* 2. Account Security Section */}
                        <SettingsCard 
                            title="Account Security" 
                            description="Manage your credentials and account access."
                        >
                            <ActionItem 
                                icon={Lock}
                                label="Change Password"
                                description="Update your password to keep your account secure."
                                onClick={() => setShowPasswordModal(true)}
                            />
                        </SettingsCard>

                        {/* 3. Danger Zone Section */}
                        <SettingsCard 
                            title="Danger Zone" 
                            description="Permanent actions regarding your account."
                            danger
                        >
                            <ActionItem 
                                icon={Trash2}
                                label="Delete Account"
                                description="Permanently remove your account and all associated data."
                                onClick={() => setShowDeleteModal(true)}
                                danger
                            />
                        </SettingsCard>
                    </div>
                </div>
            </div>

            {/* Push Notification Toggle Confirmation Modal */}
            <Modal
                isOpen={showPushModal}
                onClose={() => setShowPushModal(false)}
                isBottomSheet={true}
                className='sm:max-w-[450px] w-full'
                showCloseButton={false}
            >
                <ModalHeader 
                    title={pushEnabled ? "Disable Notifications?" : "Enable Notifications?"} 
                    description={pushEnabled 
                        ? "You will stop receiving instant updates about your appointments." 
                        : "Stay updated with instant alerts for approvals, reminders, and status changes."
                    }
                    onClose={() => setShowPushModal(false)}
                />
                <ModalBody>
                    <div className="flex flex-col items-center text-center py-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${pushEnabled ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'bg-brand-50 dark:bg-brand-900/20 text-brand-500'}`}>
                            <Smartphone size={32} />
                        </div>
                        <ul className="text-left space-y-3 w-full max-w-xs mx-auto">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-brand-500 shrink-0 mt-0.5" size={14} />
                                <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">Real-time appointment status updates</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-brand-500 shrink-0 mt-0.5" size={14} />
                                <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">48-hour reminder alerts</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="text-brand-500 shrink-0 mt-0.5" size={14} />
                                <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">Direct messages from our team</span>
                            </li>
                        </ul>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={() => setShowPushModal(false)} className="flex-1 h-11 rounded-xl font-black text-[11px] sm:text-sm">
                        Cancel
                    </Button>
                    <Button onClick={confirmPushToggle} className="flex-1 h-11 rounded-xl font-black text-[11px] sm:text-sm">
                        {pushEnabled ? "Yes, Disable" : "Yes, Enable"}
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Password Reset Modal */}
            <Modal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                isBottomSheet={true}
                className='sm:max-w-[480px] w-full'
                showCloseButton={false}
            >
                <ModalHeader 
                    title="Change Password" 
                    description="Update your credentials to maintain account security."
                    onClose={() => setShowPasswordModal(false)}
                />
                <form onSubmit={handlePasswordReset}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="relative">
                                <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Current Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPass.current ? "text" : "password"}
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                                        className="text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm"
                                        required
                                        placeholder="Enter current password"
                                    />
                                    <button type="button" onClick={() => setShowPass({...showPass, current: !showPass.current})} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">New Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPass.new ? "text" : "password"}
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                                        className="text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm"
                                        required
                                        placeholder="Minimum 8 characters"
                                    />
                                    <button type="button" onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Label className="text-[13px] sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Confirm New Password</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPass.confirm ? "text" : "password"}
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                                        className="text-[13px] sm:text-sm font-medium h-11 rounded-xl shadow-theme-sm"
                                        required
                                        placeholder="Repeat new password"
                                    />
                                    <button type="button" onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant='outline' type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 h-11 rounded-xl font-black text-[11px] sm:text-sm" disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button type='submit' className="flex-1 h-11 rounded-xl font-black text-[11px] sm:text-sm" disabled={isSaving}>
                            {isSaving ? 'Updating...' : 'Update Password'}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>

            {/* Delete Account Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                isBottomSheet={true}
                className='sm:max-w-[450px] w-full'
                showCloseButton={false}
            >
                <ModalHeader 
                    title="Delete Account?" 
                    description="This action is permanent and cannot be undone."
                    onClose={() => setShowDeleteModal(false)}
                />
                <ModalBody>
                    <div className="text-center py-2">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mx-auto mb-6 shadow-theme-md">
                            <AlertTriangle size={32} />
                        </div>
                        <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium mb-6 px-4">
                            All your appointment history, profile data, and family member information will be erased forever.
                        </p>
                        
                        <div className="mb-4">
                            <Label className="text-[10px] font-black uppercase text-red-400 block mb-2 tracking-widest">Type "DELETE" to confirm</Label>
                            <Input 
                                type="text"
                                placeholder="DELETE"
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                className="w-full h-12 text-center text-sm font-black text-red-600 dark:text-red-400 rounded-xl border-red-100 dark:border-red-900/30 focus:ring-red-500 uppercase"
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant='outline' onClick={() => setShowDeleteModal(false)} className="flex-1 h-11 rounded-xl font-black text-[11px] sm:text-sm" disabled={isSaving}>
                        Go Back
                    </Button>
                    <Button 
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirm !== 'DELETE' || isSaving}
                        className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-[11px] sm:text-sm shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {isSaving ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default SettingsPage;
