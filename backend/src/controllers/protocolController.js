// Controlador para el Sistema de Protocolos
const pool = require('../config/db');

// Obtener todos los protocolos disponibles
exports.getProtocols = async (req, res, next) => {
    try {
        const query = `
            SELECT * 
            FROM protocols 
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

// Obtener detalle de un protocolo
exports.getProtocolById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT * FROM protocols WHERE id = $1
        `;
        const { rows } = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Protocolo no encontrado' });
        }

        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
};

// Obtener protocolo activo del usuario
exports.getActiveProtocol = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT 
                up.id as user_protocol_id,
                up.started_at,
                up.current_day,
                up.status,
                up.custom_duration,
                up.scheduled_start_date,
                p.id as protocol_id,
                p.name,
                p.description,
                p.duration_days,
                p.icon,
                p.phases,
                p.daily_tasks,
                p.rules
            FROM user_protocols up
            JOIN protocols p ON up.protocol_id = p.id
            WHERE up.user_id = $1 AND up.status = 'activo'
            LIMIT 1
        `;

        const { rows } = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.json(null); // Sin protocolo activo
        }

        const protocol = rows[0];

        // Usar duración custom si existe, sino la del protocolo
        const effectiveDuration = protocol.custom_duration || protocol.duration_days;

        // Usar fecha programada si existe, sino started_at
        const startDate = protocol.scheduled_start_date
            ? new Date(protocol.scheduled_start_date)
            : new Date(protocol.started_at);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        // Si aún no ha llegado la fecha de inicio
        if (startDate > today) {
            return res.json({
                ...protocol,
                duration_days: effectiveDuration,
                current_day: 0,
                current_phase: null,
                today_log: { tasks_completed: [], notes: '', symptoms: [] },
                waiting_to_start: true,
                starts_on: startDate.toISOString().split('T')[0]
            });
        }

        // Calcular día actual
        const diffTime = today - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const calculatedDay = Math.min(diffDays, effectiveDuration);

        // Si el día calculado es diferente al guardado, actualizar
        if (calculatedDay !== protocol.current_day) {
            await pool.query(
                'UPDATE user_protocols SET current_day = $1 WHERE id = $2',
                [calculatedDay, protocol.user_protocol_id]
            );
            protocol.current_day = calculatedDay;
        }

        // Calcular fases dinámicamente según duración
        let dynamicPhases;
        if (protocol.name === 'Anti-Cándida') {
            // Calcular fases proporcionalmente
            const phase1End = Math.ceil(effectiveDuration * 0.33);
            const phase2End = Math.ceil(effectiveDuration * 0.66);
            dynamicPhases = [
                { phase: 1, name: 'Inicial', days_start: 1, days_end: phase1End, oregano_drops: 2 },
                { phase: 2, name: 'Intermedia', days_start: phase1End + 1, days_end: phase2End, oregano_drops: 4 },
                { phase: 3, name: 'Intensiva', days_start: phase2End + 1, days_end: effectiveDuration, oregano_drops: 5 }
            ];
        } else {
            dynamicPhases = protocol.phases;
        }

        // Determinar fase actual
        const currentPhase = dynamicPhases.find(
            p => protocol.current_day >= p.days_start && protocol.current_day <= p.days_end
        );

        // Obtener registro del día actual de protocolo
        const logQuery = `
            SELECT * FROM protocol_daily_logs 
            WHERE user_protocol_id = $1 AND day_number = $2
        `;
        const logResult = await pool.query(logQuery, [protocol.user_protocol_id, protocol.current_day]);
        const todayLog = logResult.rows[0] || { tasks_completed: [], notes: '' };

        // --- NEW: Fetch Symptoms from metabolic_logs ---
        // We aggregate them here to maintain the API contract with the frontend
        const symptomsQuery = `
            SELECT item_name as name, created_at, notes, image_url 
            FROM metabolic_logs 
            WHERE user_id = $1 
              AND event_type = 'SINTOMA' 
              AND created_at::date = CURRENT_DATE 
            ORDER BY created_at DESC
        `;
        const symptomsResult = await pool.query(symptomsQuery, [userId]);

        // Merge into today_log for frontend compatibility
        todayLog.symptoms = symptomsResult.rows;

        res.json({
            ...protocol,
            duration_days: effectiveDuration,
            phases: dynamicPhases,
            current_phase: currentPhase,
            today_log: todayLog
        });
    } catch (err) {
        next(err);
    }
};

// Iniciar un protocolo
exports.startProtocol = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id: protocolId } = req.params;
        const { duration_days, start_date } = req.body;

        // Verificar que no haya otro protocolo activo
        const activeCheck = await pool.query(
            "SELECT id FROM user_protocols WHERE user_id = $1 AND status = 'activo'",
            [userId]
        );

        if (activeCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'Ya tienes un protocolo activo. Debes completarlo o abandonarlo primero.'
            });
        }

        // Verificar que el protocolo existe
        const protocolCheck = await pool.query(
            'SELECT * FROM protocols WHERE id = $1',
            [protocolId]
        );

        if (protocolCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Protocolo no encontrado' });
        }

        const protocol = protocolCheck.rows[0];

        // Determinar duración (usar custom si se proporciona, sino default del protocolo)
        const finalDuration = duration_days || protocol.duration_days;

        // Determinar fecha de inicio (si no se proporciona, es hoy)
        const scheduledStart = start_date ? new Date(start_date) : new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        scheduledStart.setHours(0, 0, 0, 0);

        // Calcular día inicial (0 si aún no empieza, 1 si ya empezó)
        const initialDay = scheduledStart <= today ? 1 : 0;

        // Crear registro de protocolo del usuario
        const insertQuery = `
            INSERT INTO user_protocols (user_id, protocol_id, current_day, status, custom_duration, scheduled_start_date)
            VALUES ($1, $2, $3, 'activo', $4, $5)
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [
            userId,
            protocolId,
            initialDay,
            finalDuration,
            scheduledStart.toISOString().split('T')[0]
        ]);

        // Si el día inicial es 1, crear registro para el día 1
        if (initialDay === 1) {
            await pool.query(`
                INSERT INTO protocol_daily_logs (user_protocol_id, day_number, date)
                VALUES ($1, 1, CURRENT_DATE)
            `, [result.rows[0].id]);
        }

        res.status(201).json({
            message: 'Protocolo iniciado exitosamente',
            user_protocol: result.rows[0],
            starts_on: scheduledStart.toISOString().split('T')[0]
        });
    } catch (err) {
        next(err);
    }
};

// Helper para mapear tareas de protocolo a categorías de log
const mapTaskToLog = (taskId) => {
    // Mapeos específicos
    const MAPInfo = {
        'vinagre_manzana': { category: 'COMIDA_REAL', name: 'Vinagre de Manzana', image: null },
        'sopa_huesos': { category: 'COMIDA_REAL', name: 'Sopa de Huesos', image: null },
        'sopa_huesos_inulina': { category: 'COMIDA_REAL', name: 'Sopa de Huesos + Inulina', image: null },
        'fermentados': { category: 'COMIDA_REAL', name: 'Fermentados (Chucrut/Kimchi)', image: null },
        'mezcla_medicinal': { category: 'SUPLEMENTO', name: 'Aceite de Coco + Orégano', is_supplement_log: false },
        'tratamiento_una': { category: 'ESTADO', name: 'Tratamiento Tópico Uña', notes: 'Aplicado' },
        'magnesio_noche': { category: 'SUPLEMENTO', name: 'Triple Magnesium', is_supplement_log: true, supplement_id: 'triple_magnesium' },
        // Limpieza Hepática
        'preparar_sales': { category: 'ESTADO', name: 'Sales de Higuera Preparadas' },
        'dosis_1': { category: 'SUPLEMENTO', name: 'Sales de Higuera (Dosis 1)' },
        'dosis_2': { category: 'SUPLEMENTO', name: 'Sales de Higuera (Dosis 2)' },
        'dosis_3': { category: 'SUPLEMENTO', name: 'Sales de Higuera (Dosis 3)' },
        'dosis_4': { category: 'SUPLEMENTO', name: 'Sales de Higuera (Dosis 4)' },
        'coctel': { category: 'COMIDA_REAL', name: 'Cóctel Toronja + Aceite' },
        // Generic catch-all logic will be applied if not here, but these serve as overrides
    };
    return MAPInfo[taskId] || null;
};

// Registrar tarea completada
exports.logTask = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { task_id } = req.body;

        if (!task_id) {
            return res.status(400).json({ message: 'task_id es requerido' });
        }

        await client.query('BEGIN');

        // Obtener protocolo activo
        const protocolQuery = `
            SELECT up.id, up.current_day 
            FROM user_protocols up
            WHERE up.user_id = $1 AND up.status = 'activo'
        `;
        const protocolResult = await client.query(protocolQuery, [userId]);

        if (protocolResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'No tienes un protocolo activo' });
        }

        const userProtocol = protocolResult.rows[0];

        // Buscar o crear registro del día
        const logQuery = `
            INSERT INTO protocol_daily_logs (user_protocol_id, day_number, date, tasks_completed)
            VALUES ($1, $2, CURRENT_DATE, $3::jsonb)
            ON CONFLICT (user_protocol_id, day_number) 
            DO UPDATE SET tasks_completed = 
                CASE 
                    WHEN protocol_daily_logs.tasks_completed @> $4::jsonb
                    THEN protocol_daily_logs.tasks_completed
                    ELSE protocol_daily_logs.tasks_completed || $4::jsonb
                END
            RETURNING *
        `;

        const logResult = await client.query(logQuery, [
            userProtocol.id,
            userProtocol.current_day,
            JSON.stringify([task_id]),
            JSON.stringify([task_id])
        ]);

        // --- SISTEMA DE UNIFICACIÓN DE DATOS ---
        // Sincronizar automáticamente con metabolic_logs

        // 1. Determinar qué log crear
        const logInfo = mapTaskToLog(task_id);

        // Solo logueamos si tenemos un mapeo claro, para evitar ruido
        if (logInfo) {
            // Verificar si ya existe este log hoy para evitar duplicados al recargar
            const checkQuery = `
                SELECT id FROM metabolic_logs 
                WHERE user_id = $1 AND item_name = $2 AND created_at::date = CURRENT_DATE
            `;
            const checkRes = await client.query(checkQuery, [userId, logInfo.name]);

            if (checkRes.rows.length === 0) {
                await client.query(`
                    INSERT INTO metabolic_logs (user_id, event_type, category, item_name, is_fasting_breaker)
                    VALUES ($1, 'CONSUMO', $2, $3, FALSE)
                `, [userId, logInfo.category, logInfo.name]);

                // Si es un suplemento rastreable en el checklist, marcarlo ahí también
                if (logInfo.is_supplement_log && logInfo.supplement_id) {
                    await client.query(`
                        INSERT INTO supplement_logs (user_id, supplement_id, date)
                        VALUES ($1, $2, CURRENT_DATE)
                        ON CONFLICT DO NOTHING
                    `, [userId, logInfo.supplement_id]);
                }
            }
        }
        // ---------------------------------------

        await client.query('COMMIT');

        res.json({
            message: 'Tarea registrada',
            log: logResult.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// Desmarcar tarea
exports.unlogTask = async (req, res, next) => {
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { task_id } = req.body;

        await client.query('BEGIN');

        // Obtener protocolo activo
        const protocolQuery = `
            SELECT up.id, up.current_day 
            FROM user_protocols up
            WHERE up.user_id = $1 AND up.status = 'activo'
        `;
        const protocolResult = await client.query(protocolQuery, [userId]);

        if (protocolResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'No tienes un protocolo activo' });
        }

        const userProtocol = protocolResult.rows[0];

        // Eliminar tarea del array
        const updateQuery = `
            UPDATE protocol_daily_logs 
            SET tasks_completed = tasks_completed - $1
            WHERE user_protocol_id = $2 AND day_number = $3
            RETURNING *
        `;

        const result = await client.query(updateQuery, [
            task_id,
            userProtocol.id,
            userProtocol.current_day
        ]);

        // --- UNIFICACIÓN DE DATOS (REVERSE) ---
        const logInfo = mapTaskToLog(task_id);

        if (logInfo) {
            // Eliminar de metabolic_logs
            await client.query(`
                DELETE FROM metabolic_logs 
                WHERE user_id = $1 AND item_name = $2 AND created_at::date = CURRENT_DATE
                AND event_type = 'CONSUMO'
            `, [userId, logInfo.name]);

            // Si es suplemento checklist, eliminar también
            if (logInfo.is_supplement_log && logInfo.supplement_id) {
                await client.query(`
                    DELETE FROM supplement_logs 
                    WHERE user_id = $1 AND supplement_id = $2 AND date = CURRENT_DATE
                `, [userId, logInfo.supplement_id]);
            }
        }
        // --------------------------------------

        await client.query('COMMIT');

        res.json({
            message: 'Tarea desmarcada',
            log: result.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// Abandonar protocolo
exports.abandonProtocol = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const query = `
            UPDATE user_protocols 
            SET status = 'abandonado', completed_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND status = 'activo'
            RETURNING *
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No tienes un protocolo activo' });
        }

        res.json({ message: 'Protocolo abandonado', user_protocol: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// Completar protocolo (llamado automáticamente al terminar los días)
exports.completeProtocol = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const query = `
            UPDATE user_protocols 
            SET status = 'completado', completed_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND status = 'activo'
            RETURNING *
        `;

        const result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No tienes un protocolo activo' });
        }

        res.json({ message: '¡Felicidades! Protocolo completado', user_protocol: result.rows[0] });
    } catch (err) {
        next(err);
    }
};
