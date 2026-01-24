# Estructura de Base de Datos

Este documento describe todas las tablas de la base de datos del proyecto.

## Ubicación de Scripts SQL

`backend/src/db/tables/`

## Tablas del Sistema

### 1. Usuarios (`01_users.sql`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL | Primary key |
| email | VARCHAR(255) | Email único |
| password_hash | VARCHAR(255) | Hash bcrypt |
| role | VARCHAR(50) | 'admin' / 'user' |
| is_verified | BOOLEAN | Email verificado |
| verification_token | TEXT | Token de verificación |
| avatar_url | TEXT | URL del avatar en MinIO |
| status | VARCHAR(20) | 'active' / 'inactive' / 'deleted' |
| active | BOOLEAN | Estado activo |

---

### 2. Plantillas de Email (`02_email_templates.sql`)
| Template Key | Uso |
|--------------|-----|
| `email_verification` | Verificación de cuenta nueva |
| `password_reset` | Restablecimiento de contraseña |
| `email_change` | Confirmación de cambio de email |

---

### 3. Configuración del Sistema (`03_app_settings.sql`)
Almacena configuración key-value para:
- **Branding**: `app_name`, `app_favicon_url`, `app_version`, `footer_text`
- **SMTP**: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_secure`
- **OAuth**: `google_oauth_enabled`, `google_client_id`, `google_client_secret`
- **Rate Limits**: `rate_limit_avatar_enabled`, `rate_limit_password_enabled`, `rate_limit_login_enabled`

---

### 4. Tokens de Reset de Contraseña (`04_password_reset_tokens.sql`)
| Columna | Descripción |
|---------|-------------|
| user_id | FK a users |
| token | Token único (64 chars) |
| expires_at | Expiración (1 hora) |
| used | Previene reutilización |

---

### 5. Tokens de Cambio de Email (`05_email_change_tokens.sql`)
| Columna | Descripción |
|---------|-------------|
| user_id | FK a users |
| new_email | Nueva dirección |
| token | Token único |
| expires_at | Expiración (1 hora) |
| used | Previene reutilización |

---

### 6. Configuración Avanzada (`06_advanced_settings.sql`)
Almacena configuraciones sensibles (encriptadas):
- `jwt_secret` - Secreto JWT personalizado
- `ai_global_enabled` - Toggle maestro de IA
- `llm_provider` / `llm_model` / `llm_api_key` - Proveedor primario
- `llm_provider_secondary` / `llm_model_secondary` / `llm_api_key_secondary` - Fallback

---

### 7. Límites de IA (`ai_limits` en 06)
| Rol | Tokens/día | Requests/día |
|-----|------------|--------------|
| admin | 100,000 | 1,000 |
| user | 10,000 | 50 |
| guest | 1,000 | 10 |

---

### 8. Logs de Uso de IA (`ai_usage_logs` en 06)
Tracking de uso por usuario para rate limiting.

---

### 9. Historial de Contraseñas (`07_password_history.sql`)
Almacena últimas 5 contraseñas para prevenir reutilización.

---

### 10. Historial de Avatares (`08_avatar_history.sql`)
Tracking de cambios de avatar para rate limiting (2 cambios/24h).

---

### 11. Logs Metabólicos (`003_metabolic_logs.sql`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | FK a users |
| event_type | VARCHAR | 'CONSUMO', 'SINTOMA', 'INICIO_AYUNO' |
| category | VARCHAR | 'HIDRATACION', 'SUPLEMENTO', 'COMIDA_REAL', 'SINTOMA_GENERAL' |
| item_name | VARCHAR | Nombre del ítem consumido |
| is_fasting_breaker | BOOLEAN | ¿Rompe el ayuno? |
| image_url | TEXT | URL de imagen en MinIO (opcional) |
| notes | TEXT | Notas/síntomas adicionales |
| created_at | TIMESTAMPTZ | Fecha/hora del evento |

**Índices:** `user_id`, `created_at`

---

### 12. Sesiones de Sueño (`004_sleep_sessions.sql`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | FK a users |
| start_time | TIMESTAMPTZ | Hora de inicio de sueño |
| end_time | TIMESTAMPTZ | Hora de despertar (nullable) |
| duration_minutes | INTEGER | Duración calculada |
| quality_score | INTEGER | Calidad 1-5 estrellas |
| symptoms | TEXT[] | Array de síntomas (BOCA_SECA, DOLOR_CABEZA, etc.) |
| apnea_flag | BOOLEAN | Indica sospecha de apnea |
| notes | TEXT | Notas adicionales |
| created_at | TIMESTAMPTZ | Fecha de creación |

**Índices:** `user_id`, `start_time`

---

### 13. Sesiones de Concentración (`15_mind_sessions.sql`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | FK a users |
| target_duration_sec | INTEGER | Duración objetivo |
| actual_duration_sec | INTEGER | Duración real |
| distraction_count | INTEGER | Número de distracciones |
| focus_object | VARCHAR(20) | 'candle', 'moon', 'yantra', 'dot' |
| status | VARCHAR(20) | 'completed', 'partial' |
| notes | TEXT | Notas opcionales |
| created_at | TIMESTAMPTZ | Fecha de creación |

**Índices:** `user_id`, `created_at`

---

### 14. Configuración de Concentración (`16_mind_configurations.sql`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | FK a users (UNIQUE) |
| default_focus_object | VARCHAR(20) | Objeto predeterminado |
| default_duration_sec | INTEGER | Duración predeterminada |
| bg_sounds | BOOLEAN | Sonidos de fondo |
| transition_sounds | BOOLEAN | Sonidos de transición |
| micro_shift | BOOLEAN | Protección OLED |
| updated_at | TIMESTAMPTZ | Última actualización |

### 15. Registros de Peso (`008/body_weight_logs`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | Primary key |
| user_id | INTEGER | FK a users |
| weight | NUMERIC(5,2) | Peso en kg |
| recorded_at | TIMESTAMPTZ | Fecha de registro |
| note | TEXT | Nota opcional |

### 16. Metas de Peso (`008/body_weight_goals`)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | PK |
| start_weight | NUMERIC | Peso inicial |
| target_weight | NUMERIC | Peso objetivo |
| is_active | BOOLEAN | Meta actual |

### 17. Medidas Corporales (`008/body_measurements`)
Tabla esbelta (EAV) para métricas de salud.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | PK |
| measurement_type | VARCHAR | Tipo de medida |
| value | NUMERIC | Valor numérico |
| unit | VARCHAR | Unidad (cm, mg/dL, mmHg) |

**Tipos Soportados:**
-   `CHEST` (Pecho), `WAIST` (Cintura), `HIPS` (Caderas), `THIGH` (Muslo)
-   `GLUCOSE` (Glucosa)
-   `BLOOD_PRESSURE_SYSTOLIC` (Presión Sistólica)
-   `BLOOD_PRESSURE_DIASTOLIC` (Presión Diastólica)
-   `HEIGHT` (Altura)

---

## Relaciones

```
users (1) ──< (N) password_reset_tokens
users (1) ──< (N) email_change_tokens
users (1) ──< (N) password_history
users (1) ──< (N) avatar_history
users (1) ──< (N) ai_usage_logs
users (1) ──< (N) metabolic_logs
users (1) ──< (N) sleep_sessions
users (1) ──< (N) mind_sessions
users (1) ──< (1) mind_configurations
```

## Migración Automática

El backend ejecuta migraciones automáticamente al iniciar.

---

**Versión:** 1.5  
**Fecha:** 2026-01-20  
**Cambios:** Añadidas columnas `inhale_prompt`, `exhale_prompt` a `breathing_configurations`

