/**
 * Custom application error class.
 * Ensures we can distinguish between operational errors (safe to show user)
 * and technical errors (keep hidden).
 */
export class AppError extends Error {
    constructor(message, status = 500, details = null) {
        super(message);
        this.status = status;
        this.details = details;
        this.isOperational = true; // Flag for our error middleware

        Error.captureStackTrace(this, this.constructor);
    }
}
