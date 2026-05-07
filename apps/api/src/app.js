import express, { Router } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger.js';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/error.middleware.js';

// ── Route imports ──
import authRoutes from './routes/auth.routes.js';
import servicesRoutes from './routes/services.routes.js';
import slotsRoutes from './routes/slots.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import waitlistRoutes from './routes/waitlist.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import adminRoutes from './routes/admin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import smartSlotsRoutes from './routes/smart-slots.routes.js';
import profilesRoutes from './routes/profiles.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import emailTemplateRoutes from './routes/email-template.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

const app = express();

// ── Global Middleware ──
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'img-src': ["'self'", 'https://*.supabase.co'],
            },
        },
    }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(pinoHttp({ 
    logger,
    autoLogging: true,
    // Hide verbose headers/details to keep logs readable in development
    quietReqLogger: true,
    serializers: {
        req: (req) => ({ method: req.method, url: req.url }),
        res: (res) => ({ statusCode: res.statusCode })
    }
})); 

// ── Timeout Middleware ──
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        const err = new Error('Request Timeout');
        err.status = 408;
        next(err);
    });
    res.setTimeout(30000, () => {
        const err = new Error('Service Unavailable - Response Timeout');
        err.status = 503;
        next(err);
    });
    next();
});
app.use(
    cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.FRONTEND_URL || 'http://localhost:5173',
                process.env.ADMIN_URL || 'http://localhost:5174',
                process.env.SECRETARY_URL || 'http://localhost:5175',
                process.env.DOCTOR_URL || 'http://localhost:5176',
                'http://localhost:3000', // Documentation or Legacy
            ].filter(Boolean)
             .concat((process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean))
             .map(url => url.replace(/\/$/, ''));

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }),
);

// ── Rate Limiting ──
// ✅ DEVELOPMENT: Adjust limits for testing (disabled or very high)
// PRODUCTION: Keep strict limits for security
const isDevelopment = process.env.NODE_ENV === 'development';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 5000 : 500, // 5000 req/15min in dev, 500 in prod
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => isDevelopment && process.env.DISABLE_RATE_LIMIT === 'true', // Can disable entirely
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 1000 : 10, // 1000 auth attempts in dev, 10 in prod
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    skip: (req, res) => isDevelopment && process.env.DISABLE_RATE_LIMIT === 'true',
});

const holdLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 1000 : 10, // 10 holds per 15 min per IP in prod
    message: { error: 'Too many slot hold attempts. Please try again later.' },
    skip: (req, res) => isDevelopment && process.env.DISABLE_RATE_LIMIT === 'true',
});

// ── Health Check (unversioned — infra endpoint) ──
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'PrimeraDental API is running',
        version: 'v1',
        timestamp: new Date().toISOString(),
    });
});

// ═══════════════════════════════════════════════
// API v1 Routes
// ═══════════════════════════════════════════════
const v1Router = Router();

// Apply rate limiting to auth routes
v1Router.use('/auth/login', authLimiter);
v1Router.use('/auth/register', authLimiter);

// Register all v1 routes
v1Router.use('/auth', authRoutes);
v1Router.use('/services', servicesRoutes);
v1Router.use('/slots', slotsRoutes);
v1Router.use('/slots/smart', smartSlotsRoutes);
v1Router.use('/appointments', appointmentsRoutes);
v1Router.use('/waitlist', waitlistRoutes);
v1Router.use('/notifications', notificationsRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/admin/analytics', analyticsRoutes);
v1Router.use('/doctor', doctorRoutes);
v1Router.use('/profiles', profilesRoutes);
v1Router.use('/settings', settingsRoutes);
v1Router.use('/email-templates', emailTemplateRoutes);
v1Router.use('/webhooks', webhookRoutes);

// Apply rate limiting to hold routes
v1Router.use('/appointments/slots/hold', holdLimiter);
v1Router.use('/appointments/slots/release-hold', holdLimiter);

// Mount v1 router under /api/v1
app.use('/api/v1', apiLimiter, v1Router);

// ── Error handler
app.use(errorHandler);

export default app;
