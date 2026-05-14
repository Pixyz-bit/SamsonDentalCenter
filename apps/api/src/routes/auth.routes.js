import { Router } from 'express';
import { register, initiateRegistration, verifyRegistrationOTP, login, logout, getProfile, updateProfile, setPassword, sendGuestOTP, verifyGuestOTP, upgradeGuestToUser, verifyAndLinkStub, verifySetupToken, completeSetup } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validate.js';
import { initiateRegistrationSchema, verifyRegistrationOTPSchema } from '../schemas/auth.schema.js';

const router = Router();

// Public routes (no login needed)
router.post('/register', register);
router.post('/register/initiate', validate(initiateRegistrationSchema), initiateRegistration);
router.post('/register/verify', validate(verifyRegistrationOTPSchema), verifyRegistrationOTP);
router.post('/login', login);
router.post('/set-password', setPassword);
router.post('/verify-and-link-stub', verifyAndLinkStub);
router.get('/setup/verify', verifySetupToken); // NEW
router.post('/setup/complete', completeSetup); // NEW

// Guest OTP routes
router.post('/guest/send-otp', sendGuestOTP);
router.post('/guest/verify-otp', verifyGuestOTP);
router.post('/guest-to-user', upgradeGuestToUser);

// Protected routes (login required)
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, updateProfile);

export default router;
