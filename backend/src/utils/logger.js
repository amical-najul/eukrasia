/**
 * Structured Logger for Production
 * Replaces console.log with structured, level-based logging
 * 
 * Levels: error, warn, info, debug
 * In production (NODE_ENV=production), debug logs are suppressed
 */

const isDev = process.env.NODE_ENV !== 'production';

const formatMessage = (level, context, message, data) => {
    const timestamp = new Date().toISOString();
    const prefix = context ? `[${context}]` : '';

    if (isDev) {
        // Pretty format for development
        return { timestamp, level, context, message, ...(data && { data }) };
    } else {
        // JSON format for production (better for log aggregation)
        return JSON.stringify({ timestamp, level, context, message, ...(data && { data }) });
    }
};

const logger = {
    error: (context, message, data) => {
        console.error(formatMessage('ERROR', context, message, data));
    },

    warn: (context, message, data) => {
        console.warn(formatMessage('WARN', context, message, data));
    },

    info: (context, message, data) => {
        console.log(formatMessage('INFO', context, message, data));
    },

    debug: (context, message, data) => {
        // Only log debug in development
        if (isDev) {
            console.log(formatMessage('DEBUG', context, message, data));
        }
    },

    // Shorthand for common operations
    startup: (message) => logger.info('Startup', message),
    db: (message, data) => logger.info('Database', message, data),
    api: (message, data) => logger.info('API', message, data),
    auth: (message, data) => logger.info('Auth', message, data),
    minio: (message, data) => logger.info('MinIO', message, data),
    ai: (message, data) => logger.info('AI', message, data)
};

module.exports = logger;
