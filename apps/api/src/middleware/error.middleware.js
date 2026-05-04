import { AppError } from '../utils/errors.js';
import { humanizeError } from '../utils/errorMapper.js';

export const errorHandler = (err, req, res, next) => {
    // 1. Log the full error for developers
    console.error('❌ Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error('   Stack:', err.stack);
    }

    // 2. Determine response status and message
    let statusCode = err.status || 500;
    let message = humanizeError(err.message || 'Internal server error');

    // 3. Security: If it's NOT an operational error and we're in production,
    // mask the message to prevent leaking internal details.
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction && !(err instanceof AppError)) {
        statusCode = 500;
        message = 'Something went wrong. Please try again later.';
    }

    // 4. Send the response
    res.status(statusCode).json({
        error: message,
        details: err.details || null,
        conflicts: err.conflicts || null,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
