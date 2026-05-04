import { supabaseAdmin } from '../config/supabase.js';

/**
 * Handle Resend Webhooks to update message_logs status.
 * 
 * Resend sends a payload like:
 * {
 *   "type": "email.delivered",
 *   "data": {
 *     "email_id": "...",
 *     "to": ["..."],
 *     "subject": "...",
 *     "created_at": "..."
 *   }
 * }
 */
export const handleResendWebhook = async (req, res, next) => {
    try {
        const { type, data } = req.body;

        if (!type || !data || !data.email_id) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        // Map Resend events to our status
        // Events: email.sent, email.delivered, email.delivery_delayed, email.complained, email.bounced, email.opened, email.clicked
        const statusMap = {
            'email.sent': 'sent',
            'email.delivered': 'delivered',
            'email.opened': 'opened',
            'email.clicked': 'clicked',
            'email.bounced': 'bounced',
            'email.complained': 'complained',
            'email.delivery_delayed': 'delayed'
        };

        const newStatus = statusMap[type];

        if (newStatus) {
            console.log(`[Webhook] Updating email ${data.email_id} to status: ${newStatus}`);
            
            const { error } = await supabaseAdmin
                .from('message_logs')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('provider_id', data.email_id);

            if (error) {
                console.error(`[Webhook] Failed to update message_logs: ${error.message}`);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('[Webhook] Error:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
