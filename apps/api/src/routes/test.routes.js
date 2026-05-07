/**
 * 🧪 TEST ROUTES
 *
 * DEBUG endpoints for testing email and other functionality.
 * Remove before production!
 */

import express from 'express';
import {
    test24hReminder,
    test48hReminder,
} from '../controllers/test.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// 🧪 DEBUG ENDPOINTS: Manually trigger reminder emails
router.get('/reminder/24h/:appointmentId', requireAuth, test24hReminder);
router.get('/reminder/48h/:appointmentId', requireAuth, test48hReminder);

export default router;
