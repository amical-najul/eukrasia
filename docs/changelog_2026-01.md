# Changelog - Enero 2026

## [2026-01-20] Análisis Profundo y Correcciones

### 🔴 Bugs Críticos Corregidos

#### 1. Método `api.patch()` Faltante
- **Archivo:** `frontend/src/services/api.js`
- **Problema:** El servicio `sleepService.js` llamaba a `api.patch()` para editar registros de sueño, pero el método no existía
- **Solución:** Añadido método `patch()` al wrapper de API

#### 2. CORS Sin Método PATCH
- **Archivo:** `backend/src/app.js`
- **Problema:** Configuración CORS no incluía `PATCH` en métodos permitidos
- **Solución:** Añadido `PATCH` a la lista de métodos CORS

### 🟠 Bugs Importantes Corregidos

#### 3. Keys Duplicadas en Settings
- **Archivo:** `backend/src/controllers/settingsController.js`
- **Problema:** `rate_limit_avatar_enabled` y `rate_limit_password_enabled` declaradas dos veces
- **Solución:** Eliminadas declaraciones duplicadas

#### 4. Variable Scope en uploadAvatar
- **Archivo:** `backend/src/controllers/userController.js`
- **Problema:** `bucketName` y `objectName` no accesibles en bloque catch para rollback
- **Solución:** Variables movidas fuera del bloque try

#### 5. Campos Faltantes en Breathing Config
- **Archivo:** `backend/src/controllers/breathingController.js`
- **Problema:** `inhale_prompt` y `exhale_prompt` no se guardaban
- **Solución:** Añadidos campos al INSERT/UPDATE
- **Migración:** `009_breathing_prompt_columns.sql`

#### 6. Validación de Password en createUser
- **Archivo:** `backend/src/controllers/userController.js`
- **Problema:** Admin podía crear usuarios con contraseñas débiles
- **Solución:** Añadida validación (mín 8 chars, mayúsculas, minúsculas, número)

### 🟡 Mejoras de Código

#### 7. Import No Usado
- **Archivo:** `backend/src/middleware/adminMiddleware.js`
- **Problema:** `jwt` importado pero nunca usado
- **Solución:** Import eliminado

---

## Migraciones Nuevas

| Archivo | Descripción |
|---------|-------------|
| `009_breathing_prompt_columns.sql` | Añade columnas `inhale_prompt` y `exhale_prompt` a `breathing_configurations` |

## Cómo Aplicar

```bash
# Ejecutar migración
cd backend
node src/scripts/migrate.js

# O manualmente en PostgreSQL
psql -d tu_db -f src/db/migrations/009_breathing_prompt_columns.sql
```
