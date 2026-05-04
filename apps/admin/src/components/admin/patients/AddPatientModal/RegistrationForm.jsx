import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import Input from '../../../ui/Input';
import Label from '../../../ui/Label';

const RegistrationForm = ({ formData, handleInputChange, fieldErrors }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Personal Details Section */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center">
                        <User size={16} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Personal Details</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input 
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Jonathan"
                            error={!!fieldErrors.first_name}
                            hint={fieldErrors.first_name}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input 
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Smith"
                            error={!!fieldErrors.last_name}
                            hint={fieldErrors.last_name}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="middle_name" optional>Middle Name</Label>
                        <Input 
                            id="middle_name"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleInputChange}
                            placeholder="Optional"
                            error={!!fieldErrors.middle_name}
                            hint={fieldErrors.middle_name}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="suffix" optional>Suffix</Label>
                        <Input 
                            id="suffix"
                            name="suffix"
                            value={formData.suffix}
                            onChange={handleInputChange}
                            placeholder="e.g. Jr., III"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input 
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        error={!!fieldErrors.date_of_birth}
                        hint={fieldErrors.date_of_birth}
                        required
                    />
                </div>
            </div>

            {/* Contact Details Section */}
            <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Phone size={16} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Contact Details</h4>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+63 9XX XXX XXXX"
                        error={!!fieldErrors.phone}
                        hint={fieldErrors.phone || "Primary contact for SMS appointment reminders."}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" optional>Email Address</Label>
                    <Input 
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="patient@email.com"
                        error={!!fieldErrors.email}
                        hint={fieldErrors.email || "Used for portal access and secure notifications."}
                    />
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;
