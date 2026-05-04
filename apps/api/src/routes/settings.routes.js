import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin, requireAdminOrSecretary } from '../middleware/admin.middleware.js';
import { validate } from '../utils/validate.js';
import { updateSettingsSchema, updateScheduleSchema, holidaySchema } from '../schemas/settings.schema.js';

const router = Router();

/**
 * @route   GET /api/v1/settings
 * @desc    Get clinic settings (Public)
 * @access  Public
 */
router.get('/', settingsController.getClinicSettings);

/**
 * @route   GET /api/v1/settings/schedule
 * @desc    Get clinic schedule (Public)
 * @access  Public
 */
router.get('/schedule', settingsController.getClinicSchedule);

/**
 * @route   GET /api/v1/settings/holidays
 * @desc    Get clinic holidays (Public)
 * @access  Public
 */
router.get('/holidays', settingsController.listHolidays);

// ── Staff Protected Routes (Admin/Secretary) ──
router.use(requireAuth, requireAdminOrSecretary);

/**
 * @route   POST /api/v1/settings/holidays
 * @desc    Add a holiday
 * @access  Staff
 */
router.post('/holidays', validate(holidaySchema), settingsController.createHoliday);

/**
 * @route   DELETE /api/v1/settings/holidays/:id
 * @desc    Remove a holiday
 * @access  Staff
 */
router.delete('/holidays/:id', settingsController.removeHoliday);

// ── Admin Only Routes ──
/**
 * @route   PATCH /api/v1/settings
 * @desc    Update clinic system settings
 * @access  Admin
 */
router.patch('/', requireAdmin, validate(updateSettingsSchema), settingsController.updateClinicSettings);

/**
 * @route   PATCH /api/v1/settings/schedule
 * @desc    Update clinic weekly schedule
 * @access  Admin
 */
router.patch('/schedule', requireAdmin, validate(updateScheduleSchema), settingsController.updateClinicSchedule);

export default router;
