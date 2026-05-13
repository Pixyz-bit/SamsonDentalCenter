import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../ui/Modal';
import Button from '../../ui/Button';
import { Phone, Mail, MapPin } from 'lucide-react';

const ContactClinicModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} isBottomSheet={true} className="max-w-[500px]" showCloseButton={false}>
            <ModalHeader 
                title="Contact Clinic" 
                description="Reach out to us for any questions or concerns." 
                onClose={onClose}
            />
            <ModalBody>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone</p>
                            <a href="tel:+1234567890" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                +1 (234) 567-890
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <Mail size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Email</p>
                            <a href="mailto:contact@samsondental.com" className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                contact@samsondental.com
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                                123 Dental Street, City, Country
                            </p>
                        </div>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter>
                <Button onClick={onClose} className="w-full sm:w-auto font-bold h-11 px-8 rounded-lg">
                    Close
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default ContactClinicModal;
