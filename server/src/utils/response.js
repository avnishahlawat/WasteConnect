export const sendSuccess = (res, data, message = 'Success', statusCode = 200, meta) => {
    const response = { success: true, message, data };
    if (meta)
        response.meta = meta;
    res.status(statusCode).json(response);
};
export const sendError = (res, message, statusCode = 500, code, errors) => {
    const response = { success: false, message };
    if (code)
        response.code = code;
    if (errors)
        response.errors = errors;
    res.status(statusCode).json(response);
};
