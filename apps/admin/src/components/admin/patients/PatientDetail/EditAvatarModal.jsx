import React, { useState } from 'react';
import { Modal, Button } from '../../../ui';

const AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mittens',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver'
];

const EditAvatarModal = ({ isOpen, onClose, currentAvatar, onSave }) => {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(selectedAvatar);
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[450px] w-full m-auto'>
            <div className='p-8 bg-white dark:bg-gray-900 rounded-xl'>
                <h4 className='text-xl font-black uppercase tracking-tight mb-6 text-center'>Select Patient Avatar</h4>
                
                <div className='grid grid-cols-3 gap-4 mb-8'>
                    {AVATARS.map((url, i) => (
                        <div 
                            key={i}
                            onClick={() => setSelectedAvatar(url)}
                            className={`relative cursor-pointer group rounded-2xl border-4 transition-all aspect-square overflow-hidden flex items-center justify-center p-1
                                ${selectedAvatar === url ? 'border-brand-500 bg-brand-50' : 'border-gray-100 dark:border-white/5 hover:border-brand-500/30'}`}
                        >
                            <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover rounded-xl" />
                            {selectedAvatar === url && (
                                <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center">
                                    <div className="bg-brand-500 text-white rounded-full p-1 shadow-lg">
                                        <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className='flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800'>
                    <Button variant='outline' onClick={onClose} className="grow h-12 font-bold">Cancel</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className='grow h-12 bg-brand-500 text-white font-black uppercase shadow-xl shadow-brand-500/20'
                    >
                        {isSaving ? 'Updating...' : 'Set Avatar'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditAvatarModal;
