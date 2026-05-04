import React, { useState } from 'react';
import { Camera, Save, X, Check } from 'lucide-react';
import { Modal } from '../../../ui/Modal';
import { Button } from '../../../ui';

const AVATARS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&h=120&fit=crop',
];

const EditAvatarModal = ({ isOpen, onClose, currentAvatar, onSave }) => {
    const [selected, setSelected] = useState(currentAvatar);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(selected);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const footer = (
        <>
            <Button variant='outline' onClick={onClose} className="h-9 sm:h-10 px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl" disabled={loading}>
                Cancel
            </Button>
            <Button 
                onClick={handleSave} 
                loading={loading}
                className="h-9 sm:h-10 px-6 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-500/20"
                disabled={selected === currentAvatar}
            >
                <Save size={14} className="mr-2" />
                Update Photo
            </Button>
        </>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Profile Photo"
            subtitle="Choose a visual identity."
            footer={footer}
            className="max-w-xl"
        >
            <div className='space-y-6'>
                <div className='flex flex-col items-center justify-center p-6 bg-gray-50/50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800'>
                    <div className='w-24 h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-xl relative'>
                        {selected ? (
                            <img src={selected} alt="Selected" className="w-full h-full object-cover" />
                        ) : (
                            <div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400'>
                                <Camera size={30} />
                            </div>
                        )}
                    </div>
                    <p className='mt-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest'>Current Preview</p>
                </div>

                <div>
                    <h5 className='text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 ml-1'>Available Selection</h5>
                    <div className='grid grid-cols-4 sm:grid-cols-8 gap-3'>
                        {AVATARS.map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelected(url)}
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                                    selected === url 
                                        ? 'border-brand-500 scale-95 ring-2 ring-brand-500/10' 
                                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                            >
                                <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                {selected === url && (
                                    <div className='absolute inset-0 bg-brand-500/10 flex items-center justify-center'>
                                        <div className='bg-brand-500 text-white p-0.5 rounded-full shadow-lg'>
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default EditAvatarModal;
