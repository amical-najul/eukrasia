# API Endpoints Reference

Esta documentación completa describe todos los endpoints disponibles en la API del backend.

**Base URL:** `http://localhost:3001/api`

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Usuarios](#usuarios)
3. [Configuración](#configuración)
4. [Plantillas de Email](#plantillas-de-email)
5. [Metabolic (Laboratorio Metabólico)](#metabolic-laboratorio-metabólico)
6. [Sleep (Rastreo de Sueño)](#sleep-rastreo-de-sueño)

---

## Autenticación

### Registro
**POST** `/auth/register`

Crea una nueva cuenta de usuario.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "name": "Nombre Usuario"
}
```

**Response (201):**
```json
{
  "message": "Usuario creado. Verifica tu email.",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "is_verified": false,
    "name": "Nombre Usuario"
  }
}
```

**Errores:**
- `400` - Email inválido o usuario ya existe
- `500` - Error del servidor

---

### Login
**POST** `/auth/login`

Inicia sesión con email y contraseña.

**Request Body:**
```json
{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "role": "user",
    "name": "Nombre Usuario",
    "avatar_url": "https://..."
  }
}
```

**Errores:**
- `400` - Credenciales inválidas
- `500` - Error del servidor

---

### Google OAuth Login
**POST** `/auth/google`

Autenticación mediante Google OAuth.

**Request Body:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "usuario@gmail.com",
    "role": "user",
    "name": "Nombre Usuario",
    "avatar_url": "https://..."
  }
}
```

**Errores:**
- `401` - Token de Google inválido
- `500` - Error del servidor

---

### Verificar Email
**GET** `/auth/verify-email?token=XXXXXX`

Verifica la dirección de email del usuario.

**Query Parameters:**
- `token` - Token de verificación enviado por email

**Response (200):**
```json
{
  "message": "Email verificado exitosamente"
}
```

**Errores:**
- `400` - Token inválido o expirado
- `500` - Error del servidor

---

### Olvidé mi Contraseña
**POST** `/auth/forgot-password`

Solicita un enlace para restablecer contraseña.

**Request Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (200):**
```json
{
  "message": "Si el email existe, recibirás un correo con instrucciones"
}
```

**Notas:**
- Siempre retorna mismo mensaje por seguridad
- Email solo se envía si el usuario existe
- Token expira en 1 hora

---

### Restablecer Contraseña
**POST** `/auth/reset-password`

Restablece la contraseña usando un token válido.

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewPassword123!"
}
```

**Validaciones:**
- Contraseña mínimo 8 caracteres
- Debe contener mayúsculas, minúsculas y números

**Response (200):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**
- `400` - Token inválido/expirado o contraseña no cumple requisitos
- `500` - Error del servidor

---

## Usuarios

### Obtener Todos los Usuarios (Admin)
**GET** `/users`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Query Parameters:**
- `page` (opcional) - Número de página (default: 1)
- `limit` (opcional) - Registros por página (default: 10)
- `search` (opcional) - Buscar por nombre o email
- `role` (opcional) - Filtrar por rol (admin, user, all)
- `active` (opcional) - Filtrar por estado (true, false, all)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "role": "admin",
      "is_verified": true,
      "active": true,
      "name": "Admin User",
      "avatar_url": "https://...",
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### Crear Usuario (Admin)
**POST** `/users`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "email": "nuevo@example.com",
  "password": "Password123!",
  "name": "Nuevo Usuario",
  "role": "user"
}
```

**Response (201):**
```json
{
  "id": 5,
  "email": "nuevo@example.com",
  "role": "user",
  "name": "Nuevo Usuario",
  "active": true
}
```

**Notas:**
- Usuarios creados por admin son automáticamente verificados
- Usuarios creados por admin están activos por defecto

---

### Actualizar Usuario (Admin)
**PUT** `/users/:id`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "email": "updated@example.com",
  "name": "Nombre Actualizado",
  "role": "admin",
  "active": true,
  "password": "NewPassword123!"
}
```

**Notas:**
- Password es opcional
- Solo se actualiza si se proporciona

**Response (200):**
```json
{
  "id": 5,
  "email": "updated@example.com",
  "role": "admin",
  "active": true,
  "name": "Nombre Actualizado"
}
```

---

### Eliminar Usuario (Admin)
**DELETE** `/users/:id`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Response (200):**
```json
{
  "message": "Usuario eliminado"
}
```

---

### Actualizar Mi Perfil
**PUT** `/users/profile/me`

**Autenticación:** Requerida  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com",
  "password": "NewPassword123!"
}
```

**Notas:**
- Password es opcional
- Email debe ser único

**Response (200):**
```json
{
  "id": 1,
  "email": "nuevo@email.com",
  "name": "Nuevo Nombre",
  "role": "user",
  "avatar_url": "https://..."
}
```

---

### Subir Avatar
**POST** `/users/avatar`

**Autenticación:** Requerida  
**Headers:** `x-auth-token: JWT_TOKEN`  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `avatar` - Archivo de imagen (JPG, PNG, WEBP)

**Procesamiento:**
- Redimensionado a máximo 400x400px
- Compresión a WebP con 80% calidad
- Guardado en MinIO bucket

**Response (200):**
```json
{
  "avatar_url": "https://files.domain.com/bucket/avatars/1-1234567890.webp"
}
```

---

### Eliminar Avatar
**DELETE** `/users/avatar`

**Autenticación:** Requerida  
**Headers:** `x-auth-token: JWT_TOKEN`

**Response (200):**
```json
{
  "message": "Avatar eliminado",
  "avatar_url": null
}
```

---

### Solicitar Cambio de Email
**POST** `/users/change-email`

**Autenticación:** Requerida  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "newEmail": "nuevo@example.com"
}
```

**Response (200):**
```json
{
  "message": "Se ha enviado un correo de confirmación a nuevo@example.com"
}
```

**Notas:**
- Email se envía a la NUEVA dirección
- Token expira en 1 hora
- Nuevo email debe ser único

---

### Verificar Cambio de Email
**POST** `/users/verify-email-change`

**Request Body:**
```json
{
  "token": "x1y2z3a4b5c6..."
}
```

**Response (200):**
```json
{
  "message": "Email actualizado exitosamente"
}
```

**Notas:**
- Usuario debe hacer logout y login con nuevo email
- Frontend maneja logout automático

---

## Configuración

### Obtener Configuración Pública
**GET** `/settings/public`

**Sin Autenticación**

**Response (200):**
```json
{
  "app_name": "Mi Aplicación",
  "app_favicon_url": "https://..."
}
```

**Uso:**
- Branding dinámico del frontend
- Título de la página
- Favicon

---

### Obtener Configuración General (Admin)
**GET** `/settings/general`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Response (200):**
```json
{
  "app_name": "Mi Aplicación",
  "app_logo_url": "https://...",
  "app_favicon_url": "https://..."
}
```

---

### Actualizar Configuración General (Admin)
**PUT** `/settings/general`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "app_name": "Nuevo Nombre",
  "app_logo_url": "https://...",
  "app_favicon_url": "https://..."
}
```

**Response (200):**
```json
{
  "message": "Configuración actualizada"
}
```

---

### Obtener Configuración SMTP (Admin)
**GET** `/settings/smtp`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Response (200):**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_user": "email@gmail.com",
  "smtp_pass": "***" 
}
```

**Nota:** Password se enmascara por seguridad

---

### Actualizar Configuración SMTP (Admin)
**PUT** `/settings/smtp`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": "587",
  "smtp_user": "email@gmail.com",
  "smtp_pass": "app-password"
}
```

**Response (200):**
```json
{
  "message": "Configuración SMTP actualizada"
}
```

---

### Obtener OAuth Config Pública
**GET** `/settings/oauth/public`

**Sin Autenticación**

**Response (200):**
```json
{
  "google_client_id": "123456789.apps.googleusercontent.com"
}
```

**Uso:**
- Configuración del botón OAuth en frontend

---

### Obtener OAuth Config (Admin)
**GET** `/settings/oauth`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Response (200):**
```json
{
  "google_client_id": "123456789.apps.googleusercontent.com",
  "google_client_secret": "***"
}
```

---

### Actualizar OAuth Config (Admin)
**PUT** `/settings/oauth`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "google_client_id": "123456789.apps.googleusercontent.com",
  "google_client_secret": "GOCSPX-..."
}
```

**Response (200):**
```json
{
  "message": "Configuración OAuth actualizada"
}
```

---

## Plantillas de Email

### Obtener Todas las Plantillas (Admin)
**GET** `/templates`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Response (200):**
```json
[
  {
    "id": 1,
    "template_key": "email_verification",
    "sender_name": "Mi App",
    "sender_email": "noreply@miapp.com",
    "reply_to": "support@miapp.com",
    "subject": "Verifica tu email para %APP_NAME%",
    "body_html": "<html>...</html>",
    "body_text": "Texto plano...",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-08T00:00:00.000Z"
  }
]
```

---

### Obtener Plantilla por Key (Admin)
**GET** `/templates/:key`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Ejemplo:** `/templates/password_reset`

**Response (200):**
```json
{
  "id": 2,
  "template_key": "password_reset",
  "sender_name": "Mi App",
  "sender_email": "noreply@miapp.com",
  "reply_to": "support@miapp.com",
  "subject": "Restablece tu contraseña",
  "body_html": "<html>...</html>",
  "body_text": "Texto plano..."
}
```

---

### Actualizar/Crear Plantilla (Admin)
**PUT** `/templates/:key`

**Autenticación:** Requerida (Admin)  
**Headers:** `x-auth-token: JWT_TOKEN`

**Request Body:**
```json
{
  "sender_name": "Mi Aplicación",
  "sender_email": "noreply@miapp.com",
  "reply_to": "support@miapp.com",
  "subject": "Restablece tu contraseña para %APP_NAME%",
  "body_html": "<html><body><p>Hola %DISPLAY_NAME%...</p></body></html>",
  "body_text": "Hola %DISPLAY_NAME%..."
}
```

**Variables Disponibles:**
- `%APP_NAME%` - Nombre de la aplicación
- `%DISPLAY_NAME%` - Nombre del usuario
- `%LINK%` - Enlace de acción (verificación, reset, etc.)
- `%NEW_EMAIL%` - Nuevo email (solo en email_change)

**Response (200):**
```json
{
  "message": "Plantilla actualizada"
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - No tiene permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## Autenticación con JWT

La mayoría de endpoints requieren autenticación. Incluir el token JWT en el header:

```
x-auth-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Obtener Token
El token se obtiene al:
- Login con email/password (`/auth/login`)
- Login con Google OAuth (`/auth/google`)

### Expiración
El token no expira automáticamente. Se invalida si:
- Usuario cambia su email (debe login de nuevo)
- Usuario es eliminado
- JWT_SECRET cambia en el servidor

---

## Rate Limiting

**Estado Actual:** No implementado

**Recomendado para:**
- `/auth/login` - 5 intentos por 15 minutos
- `/auth/register` - 3 registros por hora por IP
- `/auth/forgot-password` - 3 solicitudes por hora por email

---

## CORS

**Configuración Actual:** Permisivo en desarrollo

**Producción:** Restringir a dominio específico en variable `ALLOWED_ORIGINS`

---

## Última Actualización

**Fecha:** 2026-01-14  
**Versión:** 1.1  
**Changelog:** Añadidos endpoints de Laboratorio Metabólico y Rastreo de Sueño

---

## Metabolic (Laboratorio Metabólico)

### Registrar Evento
**POST** `/metabolic/log`

**Autenticación:** Requerida  
**Content-Type:** `multipart/form-data`

**Form Data:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| event_type | string | ✅ | 'CONSUMO', 'SINTOMA', 'INICIO_AYUNO' |
| category | string | ✅ | 'HIDRATACION', 'SUPLEMENTO', 'COMIDA_REAL', 'SINTOMA_GENERAL' |
| item_name | string | ✅ | Nombre del ítem |
| is_fasting_breaker | boolean | ✅ | ¿Rompe el ayuno? |
| notes | string | ❌ | Notas opcionales |
| image | file | ❌ | Imagen (requerida para COMIDA_REAL) |

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "event_type": "CONSUMO",
  "category": "COMIDA_REAL",
  "item_name": "Hígado Encebollado",
  "is_fasting_breaker": true,
  "image_url": "https://minio/bucket/1/2026/01/14/1234567890.jpg",
  "notes": null,
  "created_at": "2026-01-14T12:00:00.000Z"
}
```

---

### Obtener Estado de Ayuno
**GET** `/metabolic/status`

**Autenticación:** Requerida

**Response (200):**
```json
{
  "status": "AYUNANDO",
  "phase": "Cetosis Ligera / Quema Grasa",
  "phaseColor": "green-light",
  "hours_elapsed": 14.5,
  "start_time": "2026-01-13T22:00:00.000Z",
  "last_event": { ... }
}
```

**Fases:**
| Horas | Fase | Color |
|-------|------|-------|
| 0-4 | Digestión / Elevación Insulina | blue |
| 4-12 | Anabólica / Descenso Insulina | blue |
| 12-16 | Cetosis Ligera | green-light |
| 16-24 | Autofagia Temprana | green-intense |
| 24-48 | Pico HGH | yellow |
| 48-72 | Reinicio Inmunitario | orange |
| 72+ | Regeneración Celular | red-gold |

---

### Obtener Historial
**GET** `/metabolic/history?limit=20`

**Autenticación:** Requerida

**Query Parameters:**
- `limit` (opcional) - Número de registros (default: 20)

**Response (200):**
```json
[
  {
    "id": 1,
    "event_type": "CONSUMO",
    "category": "COMIDA_REAL",
    "item_name": "Proteína + Ensalada",
    "is_fasting_breaker": true,
    "image_url": "https://...",
    "notes": null,
    "created_at": "2026-01-14T12:00:00.000Z"
  }
]
```

---

## Sleep (Rastreo de Sueño)

### Iniciar Sesión de Sueño
**POST** `/sleep/start`

**Autenticación:** Requerida

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "start_time": "2026-01-14T23:00:00.000Z",
  "end_time": null,
  "created_at": "2026-01-14T23:00:00.000Z"
}
```

---

### Obtener Estado de Sueño
**GET** `/sleep/status`

**Autenticación:** Requerida

**Response (200) - Sesión Activa:**
```json
{
  "active": true,
  "session": {
    "id": 1,
    "start_time": "2026-01-14T23:00:00.000Z"
  }
}
```

**Response (200) - Sin Sesión Activa:**
```json
{
  "active": false,
  "last_session": {
    "id": 1,
    "duration_minutes": 480,
    "quality_score": 4,
    "apnea_flag": false,
    "created_at": "2026-01-14T07:00:00.000Z"
  }
}
```

---

### Finalizar Sesión de Sueño
**PUT** `/sleep/end`

**Autenticación:** Requerida

**Request Body:**
```json
{
  "session_id": 1,
  "quality_score": 4,
  "symptoms": ["BOCA_SECA", "DOLOR_CABEZA"],
  "notes": "Desperté una vez",
  "manual_duration_minutes": 480
}
```

**Síntomas Disponibles:**
- `BOCA_SECA` - Boca seca / Sed intensa
- `DOLOR_CABEZA` - Dolor de cabeza frontal
- `AHOGO` - Desperté asustado / Falta de aire
- `RONQUIDO_FUERTE` - Ronquidos fuertes

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "start_time": "2026-01-14T23:00:00.000Z",
  "end_time": "2026-01-15T07:00:00.000Z",
  "duration_minutes": 480,
  "quality_score": 4,
  "symptoms": ["BOCA_SECA", "DOLOR_CABEZA"],
  "apnea_flag": true,
  "notes": "Desperté una vez"
}
```

**Nota:** `apnea_flag` se calcula automáticamente si hay 2+ síntomas de riesgo.

---

### Obtener Historial de Sueño
**GET** `/sleep/history?limit=10`

**Autenticación:** Requerida

**Response (200):**
```json
[
  {
    "id": 1,
    "start_time": "2026-01-14T23:00:00.000Z",
    "end_time": "2026-01-15T07:00:00.000Z",
    "duration_minutes": 480,
    "quality_score": 4,
    "apnea_flag": false
  }
]
```
