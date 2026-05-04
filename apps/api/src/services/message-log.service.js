import { supabaseAdmin } from '../config/supabase.js';

/**
 * Log a communication (Email/SMS) to the message_logs table.
 * 
 * @param {object} logData - { provider_id, recipient, channel, purpose, status, error_details, appointment_id, patient_id }
 */
export const logCommunication = async (logData) => {
    try {
        const { error } = await supabaseAdmin.from('message_logs').insert({
            provider_id: logData.provider_id || null,
            recipient: logData.recipient,
            channel: logData.channel,
            purpose: logData.purpose,
            status: logData.status || 'queued',
            error_details: logData.error_details || null,
            appointment_id: logData.appointment_id || null,
            patient_id: logData.patient_id || null
        });

        if (error) {
            console.error('Failed to log communication:', error.message);
        }
    } catch (err) {
        console.error('Error in logCommunication service:', err.message);
    }
};

/**
 * Fetch message logs from the database.
 * 
 * @param {number} limit - Max records to fetch
 * @returns {Promise<Array>}
 */
export const getMessageLogs = async (limit = 50) => {
    const { data, error } = await supabaseAdmin
        .from('message_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
};
