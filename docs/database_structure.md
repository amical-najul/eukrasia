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

## Relaciones

```
users (1) ──< (N) password_reset_tokens
users (1) ──< (N) email_change_tokens
users (1) ──< (N) password_history
users (1) ──< (N) avatar_history
users (1) ──< (N) ai_usage_logs
```

## Migración Automática

El backend ejecuta migraciones automáticamente al iniciar.

---

**Versión:** 1.2  
**Fecha:** 2026-01-10  
**Cambios:** Añadidas tablas advanced_settings, ai_limits, ai_usage_logs, password_history, avatar_history
