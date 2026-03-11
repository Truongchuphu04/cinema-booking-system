
// Error handling utility for consistent API responses

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Standard error handler
const errorHandler = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.message = error.message || 'Internal Server Error';

    // Wrong MongoDB ID error
    if (error.name === 'CastError') {
        const message = `Resource not found. Invalid: ${error.path}`;
        return res.status(400).json({
            success: false,
            message,
            error: error.message
        });
    }

    // Mongoose duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        const message = `${field} already exists`;
        return res.status(400).json({
            success: false,
            message,
            field
        });
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token has expired'
        });
    }

    // Validation errors
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors)
            .map(err => err.message)
            .join(', ');

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: messages
        });
    }

    // Default error response
    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorHandler,
    asyncHandler
};
