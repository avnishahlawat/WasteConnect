import { AppError } from '../utils/AppError.js';
export const validate = (schema) => {
    return (req, _res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            const zodError = error;
            const errors = zodError.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
        }
    };
};
