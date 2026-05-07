import { Router } from 'express';
import * as emailTemplateController from '../controllers/email-template.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// All routes require authentication and admin role
router.use(requireAuth, requireAdmin);

router.get('/', emailTemplateController.getAllTemplates);
router.get('/:key', emailTemplateController.getTemplateByKey);
router.put('/:key', emailTemplateController.updateTemplate);
router.post('/:key/restore', emailTemplateController.restoreDefault);

export default router;
