const pool = require('../config/db');

/**
 * Middleware para limitar el uso de IA basado en roles y configuración global
 */
const aiLimiter = async (req, res, next) => {
    try {
        // 1. Verificar Toggle Global
        const globalSetting = await pool.query(
            "SELECT setting_value FROM advanced_settings WHERE setting_key = 'ai_global_enabled'"
        );

        // Si existe y es 'false', bloquear todo
        if (globalSetting.rows.length > 0 && globalSetting.rows[0].setting_value === 'false') {
            return res.status(503).json({
                message: 'El servicio de Inteligencia Artificial esta deshabilitado temporalmente.'
            });
        }

        // Si no hay usuario (endpoint publico o error de auth previo), asumir 'guest'
        // IMPORTANTE: Este middleware debe ir DESPUES de authMiddleware si se quiere usar req.user
        const userId = req.user ? req.user.id : null;
        const userRole = req.user ? req.user.role : 'guest';

        // 2. Obtener Límites del Rol
        const limitsRes = await pool.query(
            "SELECT daily_token_limit, daily_request_limit, enabled FROM ai_limits WHERE role = $1",
            [userRole]
        );

        if (limitsRes.rows.length === 0) {
            // Si no hay configuración para el rol, permitir por defecto (fail open) o bloquear
            // Optamos por bloquear 'guest' si no está explícito, o usar defaults seguros
            console.warn(`No AI limits found for role ${userRole}, using strict defaults.`);
            // Default estricto: 0 tokens
            return res.status(403).json({ message: 'Sin permisos para usar IA.' });
        }

        const limits = limitsRes.rows[0];

        if (!limits.enabled) {
            return res.status(403).json({ message: 'El uso de IA esta deshabilitado para tu rol.' });
        }

        // 3. Verificar Uso Diario
        // Sumar uso del día de hoy (UTC)
        const usageRes = await pool.query(
            `SELECT COUNT(*) as request_count, COALESCE(SUM(tokens_used), 0) as token_sum
             FROM ai_usage_logs 
             WHERE user_id = $1 
             AND created_at >= CURRENT_DATE::timestamp`,
            [userId] // Si es guest (null), esto fallará. Deberíamos trackear por IP para guests.
        );

        // Si es guest sin user_id, por ahora bloqueamos o ignoramos tracking (TODO: IP tracking)
        if (!userId && userRole === 'guest') {
            // Simplificación: Guests limitados por IP sería mejor, pero por ahora permitimos si el rol lo permite
            // sin tracking acumulativo persistente (riesgoso pero funcional para demo)
            // O MEJOR: Bloquear guests por ahora si no hay ID.
            if (limits.daily_request_limit <= 0) return res.status(403).json({ message: 'Login requerido.' });
        } else {
            const currentUsage = usageRes.rows[0];
            const requestCount = parseInt(currentUsage.request_count);
            const tokenSum = parseInt(currentUsage.token_sum);

            if (requestCount >= limits.daily_request_limit) {
                return res.status(429).json({
                    message: `Has alcanzado tu limite diario de peticiones (${limits.daily_request_limit}).`
                });
            }

            if (tokenSum >= limits.daily_token_limit) {
                return res.status(429).json({
                    message: `Has alcanzado tu limite diario de tokens (${limits.daily_token_limit}).`
                });
            }
        }

        // 4. Inyectar función helper para registrar uso al finalizar
        // El controlador final debe llamar a req.logAiUsage(tokens, model)
        req.logAiUsage = async (tokens, model, requestType = 'completion') => {
            if (!userId) return; // No loguear guests sin ID
            try {
                await pool.query(
                    `INSERT INTO ai_usage_logs (user_id, tokens_used, model_used, request_type)
                     VALUES ($1, $2, $3, $4)`,
                    [userId, tokens, model, requestType]
                );
            } catch (err) {
                console.error('Error logging AI usage:', err);
            }
        };

        next();

    } catch (err) {
        console.error('AI Limiter Error:', err);
        res.status(500).json({ message: 'Error interno verificando limites de IA.' });
    }
};

module.exports = aiLimiter;
