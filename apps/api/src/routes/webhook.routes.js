import express from 'express';
import { handleResendWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// Public webhook endpoint (Resend calls this)
router.post('/resend', handleResendWebhook);

export default router;
