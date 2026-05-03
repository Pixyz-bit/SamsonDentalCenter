/**
 * Mapping of raw audit action constants to user-friendly sentences.
 */
export const ACTION_LABELS = {
    CREATE_DOCTOR: 'onboarded a new doctor',
    UPDATE_DOCTOR_PROFILE: 'updated doctor profile details',
    UPDATE_DOCTOR_SERVICES: 'modified doctor allowed services',
    UPDATE_GLOBAL_SCHEDULE: 'updated global weekly schedule',
    CREATE_SCHEDULE_BLOCK: 'added an availability block',
    DELETE_SCHEDULE_BLOCK: 'removed an availability block',
};

/**
 * Humanizes a raw action constant.
 * @param {string} action - The raw action constant from the database.
 * @returns {string} A friendly description.
 */
export const getFriendlyAction = (action) => {
    return ACTION_LABELS[action] || action.toLowerCase().replace(/_/g, ' ');
};

/**
 * Generates a list of human-readable changes between old and new values.
 * @param {object} oldValues - The previous state of the resource.
 * @param {object} newValues - The new state of the resource.
 * @returns {string[]} A list of descriptive change strings.
 */
export const generateSmartDiff = (oldValues, newValues) => {
    if (!newValues) return [];
    if (!oldValues) return ['Initial creation / Data recorded'];

    const changes = [];

    // Common field mappings to friendly names
    const FIELD_NAMES = {
        is_active: 'Account status',
        tier: 'Professional tier',
        bio: 'Biography',
        photo_url: 'Profile photo',
        license_number: 'License number',
        specialization: 'Specialization',
        first_name: 'First name',
        last_name: 'Last name',
        phone: 'Phone number',
        email: 'Email address',
    };

    Object.keys(newValues).forEach(key => {
        const oldValue = oldValues[key];
        const newValue = newValues[key];

        // Basic comparison (skip if same)
        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;

        const label = FIELD_NAMES[key] || key.replace(/_/g, ' ');

        // Boolean formatting
        if (typeof newValue === 'boolean') {
            if (key === 'is_active') {
                changes.push(newValue ? 'Activated account' : 'Deactivated account');
            } else {
                changes.push(`${newValue ? 'Enabled' : 'Disabled'} ${label}`);
            }
        } 
        // Array/Schedule formatting
        else if (Array.isArray(newValue)) {
            changes.push(`Updated ${label} list`);
        }
        // General text changes
        else if (newValue !== null && newValue !== undefined) {
             const from = (oldValue === null || oldValue === undefined) ? 'Empty' : `"${oldValue}"`;
             const to = `"${newValue}"`;
             changes.push(`Changed ${label} from ${from} to ${to}`);
        }
    });

    return changes;
};
