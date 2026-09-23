import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';
export const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let errors;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
        const mongooseErr = err;
        errors = Object.values(mongooseErr.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        code = 'INVALID_ID';
    }
    else if (err.code === 'LIMIT_FILE_SIZE') {
        statusCode = 400;
        message = 'File size exceeds the allowed limit';
        code = 'FILE_TOO_LARGE';
    }
    if (config.nodeEnv === 'development') {
        console.error('Error:', err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        code,
        ...(errors && { errors }),
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
};
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        code: 'NOT_FOUND',
    });
};
