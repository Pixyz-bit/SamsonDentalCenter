/**
 * 🧪 TEST CONTROLLER
 *
 * DEBUG endpoints for testing email sending and other features.
 * Remove before production!
 */
import {
    testSend24hReminder,
    testSend48hReminder,
} from '../utils/scheduled-tasks.js';
import { supabaseAdmin } from '../config/supabase.js';

/**
 * 🧪 GET /api/test/reminder/24h/:appointmentId
 *
 * Send 24h reminder email immediately for an authenticated patient
 */
export const test24hReminder = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;

        if (!appointmentId) {
            return res.status(400).json({ error: 'appointmentId is required' });
        }

        const result = await testSend24hReminder(appointmentId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Test 24h reminder error:', err);
        next(err);
    }
};

/**
 * 🧪 GET /api/test/reminder/48h/:appointmentId
 *
 * Send 48h reminder email immediately for an authenticated patient
 */
export const test48hReminder = async (req, res, next) => {
    try {
        const { appointmentId } = req.params;

        if (!appointmentId) {
            return res.status(400).json({ error: 'appointmentId is required' });
        }

        const result = await testSend48hReminder(appointmentId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            ...result,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error('Test 48h reminder error:', err);
        next(err);
    }
};


