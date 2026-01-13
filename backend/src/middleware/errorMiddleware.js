const errorHandler = (err, req, res, next) => {
    // Log the error for server-side debugging
    console.error('SERVER ERROR:', err);

    // Default status code and message
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const message = err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { errorHandler };
