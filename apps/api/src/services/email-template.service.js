import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';
import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.service.js';

const TEMPLATES_DIR = path.join(process.cwd(), '..', '..', '..', 'EmailTemplates');

/**
 * Maps template keys to their corresponding file names in EmailTemplates/
 */
const FILE_MAP = {
    'guest-otp': 'guest-otp.html',
    'booking-confirmed': 'booking-confirmed.html',
    'booking-request-received': 'booking-request-received.html',
    'booking-cancelled': 'booking-cancelled.html',
    'appointment-rescheduled': 'booking-rescheduled.html',
    'appointment-reminder': 'appointment-reminder.html',
    'booking-rejected': 'booking-rejected.html',
    'appointment-reminder-24h': 'appointment-reminder-24h.html',
    'appointment-reminder-48h': 'appointment-reminder-48h.html',
    'appointment-displaced': 'appointment-displaced.html'
};

/**
 * Get all email templates from the database.
 */
export const getAllTemplates = async () => {
    const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('id, template_key, name, subject_line, category, updated_at, description')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Get a specific template by its key.
 */
export const getTemplateByKey = async (key) => {
    const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .eq('template_key', key)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // Not found in DB, try to load from FS as a fallback for the editor
            const fallbackContent = loadFromFile(key);
            if (fallbackContent) {
                return {
                    template_key: key,
                    html_content: fallbackContent,
                    is_fallback: true
                };
            }
            throw new AppError('Template not found', 404);
        }
        throw new AppError(error.message, 500);
    }

    return data;
};

/**
 * Update a template's HTML content and subject line.
 */
export const updateTemplate = async (key, updates, actorId) => {
    const { html_content, subject_line } = updates;

    // 1. Fetch template definition to check required variables
    const { data: template, error: fetchError } = await supabaseAdmin
        .from('email_templates')
        .select('required_variables, name')
        .eq('template_key', key)
        .single();

    if (fetchError) throw new AppError('Template definition not found', 404);

    // 2. Validate required variables
    if (html_content) {
        const required = template.required_variables || [];
        const missing = required.filter(v => !html_content.includes(`{{${v}}}`));
        
        if (missing.length > 0) {
            throw new AppError(`Missing required variables in HTML: ${missing.map(m => `{{${m}}}`).join(', ')}`, 400);
        }
    }

    // 3. Update the database
    const { data: updated, error: updateError } = await supabaseAdmin
        .from('email_templates')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
            updated_by: actorId
        })
        .eq('template_key', key)
        .select()
        .single();

    if (updateError) throw new AppError(updateError.message, 500);

    // 4. Audit Log
    await supabaseAdmin.from('audit_log').insert({
        actor_id: actorId,
        action: 'UPDATE_EMAIL_TEMPLATE',
        resource_type: 'email_templates',
        resource_id: key,
        new_values: updated,
        details: { name: template.name }
    });

    return updated;
};

/**
 * Restore a template to its filesystem default.
 */
export const restoreDefault = async (key, actorId) => {
    const defaultHtml = loadFromFile(key);
    if (!defaultHtml) throw new AppError('Default template file not found on server', 404);

    return await updateTemplate(key, { html_content: defaultHtml }, actorId);
};

/**
 * Compile a template with data, using DB with FS fallback.
 * 
 * @param {string} key - Template key
 * @param {object} data - Dynamic variables for this specific email
 * @returns {Promise<{html: string, subject: string}>}
 */
export const compileTemplate = async (key, data) => {
    let html = '';
    let subject = '';

    try {
        // 1. Try DB first
        const { data: template, error } = await supabaseAdmin
            .from('email_templates')
            .select('html_content, subject_line')
            .eq('template_key', key)
            .single();

        if (template && !error) {
            html = template.html_content;
            subject = template.subject_line;
        } else {
            // 2. Fallback to FS
            html = loadFromFile(key);
            subject = getDefaultSubject(key);
        }
    } catch (err) {
        // 3. Robust Fallback
        html = loadFromFile(key);
        subject = getDefaultSubject(key);
    }

    if (!html) {
        throw new AppError(`Template ${key} could not be loaded from DB or FS`, 500);
    }

    // 4. Inject Global Variables from clinic_settings
    const settings = await getSettings().catch(() => ({}));
    const globalData = {
        clinicName: settings.clinic_name || 'Samson Dental Center',
        clinicAddress: settings.address || '',
        clinicPhone: settings.phone || '',
        clinicEmail: settings.email || '',
        clinicLogo: settings.logo_url || '',
        clinicYear: new Date().getFullYear(),
        facebookUrl: settings.facebook_url || '',
        instagramUrl: settings.instagram_url || '',
    };

    const finalData = { ...globalData, ...data };

    // 5. Replace placeholders {{var}}
    for (const [vKey, vValue] of Object.entries(finalData)) {
        const regex = new RegExp(`{{${vKey}}}`, 'g');
        html = html.replace(regex, vValue || '');
        subject = subject.replace(regex, vValue || '');
    }

    return { html, subject };
};

/**
 * Helper to load template from local filesystem.
 */
const loadFromFile = (key) => {
    const fileName = FILE_MAP[key];
    if (!fileName) return null;

    try {
        const templatePath = path.join(TEMPLATES_DIR, fileName);
        return fs.readFileSync(templatePath, 'utf-8');
    } catch (err) {
        console.error(`Failed to load template ${key} from FS:`, err.message);
        return null;
    }
};

/**
 * Helper to get hardcoded default subject lines for FS fallbacks.
 */
const getDefaultSubject = (key) => {
    const subjects = {
        'guest-otp': 'Your Verification Code — Samson Dental Center',
        'booking-confirmed': 'Your Appointment is Confirmed — Samson Dental Center',
        'booking-request-received': 'We Have Received Your Booking Request — Samson Dental Center',
        'booking-cancelled': 'Appointment Cancellation Confirmation — Samson Dental Center',
        'appointment-rescheduled': 'Your Appointment Has Been Rescheduled — Samson Dental Center',
        'appointment-reminder': 'Friendly Reminder: Your Upcoming Appointment — Samson Dental Center',
        'account-setup-invite': 'Finish setting up your Samson Dental Center account',
        'booking-rejected': 'Update Regarding Your Appointment Request — Samson Dental Center',
        'appointment-reminder-24h': 'Reminder: Your Appointment is Tomorrow — Samson Dental Center',
        'appointment-reminder-48h': 'Upcoming Appointment Reminder (48h) — Samson Dental Center',
        'appointment-displaced': 'Important Update: Your Appointment has Changed — Samson Dental Center'
    };
    return subjects[key] || 'Notification from Samson Dental Center';
};
