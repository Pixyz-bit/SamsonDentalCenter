/**
 * Maps technical error strings to user-friendly messages.
 * Handles Supabase, Postgres, JWT, and common network errors.
 */
export const humanizeError = (message) => {
    if (!message) return 'Something went wrong. Please try again.';

    // ── Authentication & Session ──
    if (message.includes('Invalid login credentials')) {
        return 'Incorrect email or password. Please check your credentials and try again.';
    }
    if (message.includes('Email not confirmed')) {
        return 'Your email address has not been verified yet. Please check your inbox for the confirmation link.';
    }
    if (message.includes('User already registered')) {
        return 'An account with this email already exists. Try logging in instead.';
    }
    if (message.includes('jwt expired')) {
        return 'Your session has expired. Please log in again.';
    }
    if (message.includes('Too many requests')) {
        return 'Too many attempts. Please wait a moment and try again.';
    }

    // ── Database & Constraints ──
    if (message.includes('idx_no_double_booking')) {
        return 'This slot is already occupied. Please choose a different time.';
    }
    if (message.includes('duplicate key value violates unique constraint')) {
        return 'This information already exists in our system. Please check for duplicates.';
    }
    if (message.includes('violates foreign key constraint')) {
        return 'Could not process this request because a related record was not found.';
    }
    if (message.includes('invalid input syntax for type uuid')) {
        return 'The provided ID is invalid.';
    }
    if (message.includes('violates check constraint')) {
        return 'The data provided does not meet the required rules or format.';
    }

    // ── Network & General ──
    if (message.toLowerCase().includes('failed to fetch')) {
        return 'Connection lost. Please check your internet or try again in a moment.';
    }
    if (message.includes('Network Error')) {
        return 'Network error detected. Please check your connection.';
    }

    // ── Role Specific ──
    if (message.includes('Administrative or Secretary role required')) {
        return 'Access denied. You need administrative or secretary permissions to view this.';
    }
    if (message.includes('Dentists and Administrators only')) {
        return 'Access denied. This area is reserved for dentists and administrators.';
    }

    // Default: Strip generic "Auth failed" or "Error:" prefixes if present
    return message.replace(/^(Auth failed|Error): /i, '');
};
