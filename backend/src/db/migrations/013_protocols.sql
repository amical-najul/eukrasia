-- Migration: 013_protocols.sql
-- Descripción: Crear tablas para el Sistema de Protocolos
-- Permite a usuarios seguir protocolos multi-día con seguimiento de tareas

BEGIN;

-- Enum para estado del protocolo del usuario
DO $$ BEGIN
    CREATE TYPE protocol_status_enum AS ENUM ('activo', 'completado', 'pausado', 'abandonado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabla: Definición de Protocolos
CREATE TABLE IF NOT EXISTS protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    icon VARCHAR(10) DEFAULT '🧪',  -- Emoji del protocolo
    phases JSONB NOT NULL,          -- Fases con dosis progresivas
    daily_tasks JSONB NOT NULL,     -- Tareas diarias estructuradas
    rules JSONB,                    -- Reglas de seguridad
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: Protocolos activos de usuarios
CREATE TABLE IF NOT EXISTS user_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    current_day INTEGER DEFAULT 1,
    status protocol_status_enum DEFAULT 'activo',
    completed_at TIMESTAMP WITH TIME ZONE,
    paused_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Índice parcial único para garantizar solo un protocolo activo por usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_protocol 
ON user_protocols(user_id) 
WHERE status = 'activo';

-- Tabla: Registro diario del protocolo
CREATE TABLE IF NOT EXISTS protocol_daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_protocol_id UUID NOT NULL REFERENCES user_protocols(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasks_completed JSONB DEFAULT '[]',  -- Array de IDs de tareas completadas
    notes TEXT,
    symptoms JSONB DEFAULT '[]',         -- Síntomas reportados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_protocol_id, day_number)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_user_protocols_user ON user_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_user_protocols_status ON user_protocols(user_id, status);
CREATE INDEX IF NOT EXISTS idx_protocol_daily_logs_user_protocol ON protocol_daily_logs(user_protocol_id);

-- Seed: Protocolo Anti-Cándida (15 días)
INSERT INTO protocols (name, description, duration_days, icon, phases, daily_tasks, rules)
VALUES (
    'Anti-Cándida',
    'Debilitar y eliminar la sobrepoblación de hongo Cándida, limpiar el hígado y preparar el cuerpo para la pérdida de peso acelerada. Se realiza bajo un esquema de Ayuno Intermitente de 18 a 24 horas.',
    15,
    '🛡️',
    '[
        {"phase": 1, "name": "Inicial", "days_start": 1, "days_end": 5, "oregano_drops": 2},
        {"phase": 2, "name": "Intermedia", "days_start": 6, "days_end": 10, "oregano_drops": 4},
        {"phase": 3, "name": "Intensiva", "days_start": 11, "days_end": 15, "oregano_drops": 5}
    ]'::jsonb,
    '[
        {"id": "mezcla_medicinal", "name": "Mezcla Medicinal", "description": "1 Cda Aceite Coco + gotas de Orégano (según fase)", "icon": "💊", "required": true, "order": 1},
        {"id": "sopa_huesos", "name": "Sopa de Huesos", "description": "1 taza caliente 15-20 min después de la mezcla", "icon": "🥣", "required": true, "order": 2},
        {"id": "comida_principal", "name": "Comida Principal", "description": "Alta en proteínas, grasas saludables y vegetales. CERO azúcar/harinas", "icon": "🍽️", "required": true, "order": 3},
        {"id": "suplementos", "name": "Suplementos", "description": "Omega 3, Enzimas, CoQ10, B12, Cromo (con comida)", "icon": "💊", "required": true, "order": 4},
        {"id": "magnesio_noche", "name": "Magnesio Nocturno", "description": "Triple Magnesium antes de dormir", "icon": "🌙", "required": true, "order": 5},
        {"id": "tratamiento_una", "name": "Tratamiento Uña", "description": "Aplicar mezcla tópica nocturna (1 cdta coco + 10 gotas orégano)", "icon": "🦶", "required": false, "order": 6}
    ]'::jsonb,
    '[
        {"type": "hydration", "icon": "💧", "message": "Beber 3-4 litros de líquido al día"},
        {"type": "restriction", "icon": "⚠️", "message": "CERO azúcar, harinas o trampas"},
        {"type": "warning", "icon": "🔥", "message": "Si sientes ardor, reduce las gotas de orégano"}
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Seed: Protocolo Limpieza Hepática (2 días)
INSERT INTO protocols (name, description, duration_days, icon, phases, daily_tasks, rules)
VALUES (
    'Limpieza Hepática Profunda',
    'Expulsar piedras biliares, barro biliar y acumulaciones de colesterol de los conductos hepáticos para "destapar" el metabolismo. Necesitas estar en casa, cerca de un baño, y tener tiempo para descansar. ⚠️ NO se puede hacer al mismo tiempo que el Protocolo Anti-Cándida.',
    2,
    '🧼',
    '[
        {"phase": 1, "name": "Preparación", "days_start": 1, "days_end": 1, "description": "Acumulación de presión biliar"},
        {"phase": 2, "name": "Expulsión", "days_start": 2, "days_end": 2, "description": "Liberación de cálculos"}
    ]'::jsonb,
    '[
        {"id": "dieta_cero_grasa", "name": "Dieta Cero Grasa", "description": "Hasta 14:00 - Solo fruta, avena, arroz, verduras. SIN aceites, mantequilla, huevos, carne", "icon": "🥗", "required": true, "order": 1, "day": 1},
        {"id": "ayuno_total", "name": "Ayuno Total (14:00)", "description": "Dejar de comer. Solo agua permitida", "icon": "🛑", "required": true, "order": 2, "day": 1},
        {"id": "preparar_sales", "name": "Preparar Sales de Higuera", "description": "4 Cdas en 750ml agua fría. Guardar en refrigerador", "icon": "🧪", "required": true, "order": 3, "day": 1},
        {"id": "dosis_1", "name": "Dosis 1 (18:00)", "description": "3/4 taza de mezcla de sales de higuera", "icon": "🥤", "required": true, "order": 4, "day": 1},
        {"id": "dosis_2", "name": "Dosis 2 (20:00)", "description": "3/4 taza de mezcla de sales de higuera", "icon": "🥤", "required": true, "order": 5, "day": 1},
        {"id": "coctel", "name": "Preparar Cóctel (21:45)", "description": "3/4 taza jugo toronja + 1/2 taza aceite oliva. Agitar fuerte", "icon": "🍊", "required": true, "order": 6, "day": 1},
        {"id": "beber_coctel", "name": "Beber Cóctel (22:00)", "description": "Beber todo en 5 min. ACOSTARSE INMEDIATAMENTE boca arriba 20 min", "icon": "🛏️", "required": true, "order": 7, "day": 1},
        {"id": "dosis_3", "name": "Dosis 3 (06:00)", "description": "3/4 taza de sales al despertar", "icon": "🥤", "required": true, "order": 1, "day": 2},
        {"id": "dosis_4", "name": "Dosis 4 (08:00)", "description": "Última porción de sales. Observar evacuaciones", "icon": "🥤", "required": true, "order": 2, "day": 2},
        {"id": "romper_ayuno", "name": "Romper Ayuno (10:00)", "description": "Jugo de fruta → 30min → Fruta sólida → 1h → Sopa ligera", "icon": "🍎", "required": true, "order": 3, "day": 2}
    ]'::jsonb,
    '[
        {"type": "warning", "icon": "⚠️", "message": "NO hacer junto con Protocolo Anti-Cándida"},
        {"type": "restriction", "icon": "🚫", "message": "CERO grasa hasta la noche del Día 1"},
        {"type": "hydration", "icon": "💧", "message": "Hidratar mucho - el efecto laxante deshidrata"},
        {"type": "info", "icon": "🏠", "message": "Quedarse en casa cerca del baño"},
        {"type": "info", "icon": "🦠", "message": "Consumir probióticos después para repoblar flora"}
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Seed: Protocolo 3 - Repoblación y Blindaje Intestinal (30 días)
INSERT INTO protocols (name, description, duration_days, icon, phases, daily_tasks, rules)
VALUES (
    'Repoblación e Intestino',
    'Fase de Reconstrucción: Sembrar flora buena (Probióticos) y reparar la pared intestinal (Caldo de huesos). Iniciar el lunes siguiente tras terminar la Limpieza Hepática.',
    30,
    '🌱',
    '[
        {"phase": 1, "name": "Adaptación", "days_start": 1, "days_end": 7, "description": "Dosis baja de Inulina (1/2 cdta) para evitar gases"},
        {"phase": 2, "name": "Repoblación Total", "days_start": 8, "days_end": 30, "description": "Dosis completa de Inulina (1 cdta)"}
    ]'::jsonb,
    '[
        {"id": "vinagre_manzana", "name": "Vinagre de Manzana (Min -15)", "description": "1 Cda (15ml) diluida en 250ml agua. Antes de romper ayuno", "icon": "🍎", "required": true, "order": 1},
        {"id": "sopa_huesos_inulina", "name": "Sopa + Inulina (Min 0)", "description": "1 Taza calida de Sopa de Huesos + Inulina (1/2 o 1 cdta según fase)", "icon": "🥣", "required": true, "order": 2},
        {"id": "fermentados", "name": "Fermentados Vivos (Min 15)", "description": "2-3 Cdas Chucrut, Kimchi o Kéfir. Masticar bien", "icon": "🥬", "required": true, "order": 3},
        {"id": "comida_principal", "name": "Comida Principal (Min 20-30)", "description": "Alta en Proteína y Grasas Saludables. Vegetales verdes. Pocos carbohidratos", "icon": "🍽️", "required": true, "order": 4},
        {"id": "suplementos_full", "name": "Mega-Suplementación", "description": "Vit D3+K2, Omega 3, Complejo B, CoQ10, B12, Cromo, Enzimas Digestivas", "icon": "💊", "required": true, "order": 5},
        {"id": "magnesio_noche", "name": "Magnesio Nocturno", "description": "Triple Magnesium (2 caps) antes de dormir", "icon": "🌙", "required": true, "order": 6}
    ]'::jsonb,
    '[
        {"type": "info", "icon": "📅", "message": "Iniciar lunes tras Limpieza Hepática"},
        {"type": "warning", "icon": "💨", "message": "Si hay muchos gases, reduce Inulina a mitad"},
        {"type": "restriction", "icon": "🚫", "message": "Evitar Azúcar, Harinas Blancas y Alcohol (matan la flora nueva)"},
        {"type": "info", "icon": "🦷", "message": "Vinagre SIEMPRE diluido con popote/pajita para cuidar esmalte"}
    ]'::jsonb
) ON CONFLICT DO NOTHING;

COMMIT;
