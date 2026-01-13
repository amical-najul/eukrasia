# Flujos de Autenticación

Este documento describe todos los flujos de autenticación implementados en la aplicación, incluyendo los endpoints del API, las páginas del frontend y el comportamiento esperado.

## Tabla de Contenidos

1. [Registro de Usuario](#registro-de-usuario)
2. [Login con Email/Password](#login-con-emailpassword)
3. [Login con Google OAuth](#login-con-google-oauth)
4. [Verificación de Email](#verificación-de-email)
5. [Olvidé mi Contraseña](#olvidé-mi-contraseña)
6. [Cambio de Email](#cambio-de-email)

---

## Registro de Usuario

### Endpoint
**POST** `/api/auth/register`

### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "Password123!",
  "name": "Nombre Usuario"
}
```

### Validaciones
- Email debe ser válido y único
- Contraseña mínimo 8 caracteres
- Nombre es opcional

### Response
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

### Flujo
1. Usuario ingresa datos en formulario
2. Backend valida datos
3. Se hashea la contraseña con bcrypt
4. Se genera token de verificación
5. Se crea usuario en BD con `is_verified: false`
6. Se envía email de verificación
7. Usuario debe verificar email para activar cuenta

### Página Frontend
`/` - LoginPage (pestaña "Crear Cuenta")

---

## Login con Email/Password

### Endpoint
**POST** `/api/auth/login`

### Request Body
```json
{
  "email": "usuario@example.com",
  "password": "Password123!"
}
```

### Response
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

### Flujo
1. Usuario ingresa email y contraseña
2. Backend busca usuario por email
3. Compara password con bcrypt
4. Genera JWT token
5. Retorna token y datos del usuario
6. Frontend guarda token en localStorage
7. Redirección según rol (admin → /admin, user → /dashboard)

### Página Frontend
`/` - LoginPage (pestaña "Iniciar Sesión")

---

## Login con Google OAuth

### Endpoint
**POST** `/api/auth/google`

### Request Body
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Flujo
1. Usuario hace clic en botón "Continuar con Google"
2. Google OAuth popup se abre
3. Usuario autoriza la aplicación
4. Frontend recibe credential de Google
5. Backend verifica credential con Google API
6. Si usuario no existe, se crea automáticamente
7. Se genera JWT token
8. Usuario logeado automáticamente

### Configuración Requerida
- Google Client ID en `.env` (`VITE_GOOGLE_CLIENT_ID`)
- Google Client Secret en `app_settings` tabla
- Configuración OAuth en panel de admin

### Página Frontend
`/` - LoginPage (botón Google OAuth)

---

## Verificación de Email

### Endpoint
**GET** `/api/auth/verify-email?token=XXXX`

### Flujo
1. Usuario recibe email de verificación
2. Click en enlace con token
3. Backend valida token
4. Marca usuario como verificado (`is_verified: true`)
5. Redirección al login con mensaje de éxito

### Plantilla de Email
- **Key:** `email_verification`
- **Variables:** `%DISPLAY_NAME%`, `%APP_NAME%`, `%LINK%`

---

## Olvidé mi Contraseña

Flujo completo para restablecer contraseña cuando el usuario la olvida.

### Endpoints

#### 1. Solicitar Restablecimiento
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "usuario@example.com"
}
```

**Response:**
```json
{
  "message": "Si el email existe, recibirás un correo con instrucciones"
}
```

**Comportamiento:**
- Siempre retorna mismo mensaje (seguridad)
- Si email existe, genera token y envía email
- Token expira en 1 hora
- Token es único y criptográficamente seguro

---

#### 2. Restablecer Contraseña
**POST** `/api/auth/reset-password`

**Request:**
```json
{
  "token": "a1b2c3d4e5f6...",
  "newPassword": "NewPassword123!"
}
```

**Validaciones:**
- Token debe ser válido (no usado, no expirado)
- Contraseña mínimo 8 caracteres
- Debe contener mayúsculas, minúsculas y números

**Response:**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Flujo:**
1. Valida token en tabla `password_reset_tokens`
2. Verifica que no esté usado (`used = false`)
3. Verifica que no esté expirado (`expires_at > NOW()`)
4. Hashea nueva contraseña con bcrypt
5. Actualiza `password_hash` en tabla `users`
6. Marca token como usado (`used = true`)

---

### Páginas Frontend

#### `/forgot-password`
- Formulario simple con campo email
- Validación de formato de email
- Mensaje de confirmación tras envío

#### `/reset-password?token=XXXX`
- Formulario con dos campos:
  - Nueva contraseña (con toggle show/hide)
  - Confirmar contraseña
- Validaciones en tiempo real
- Redirección automática a login tras éxito

### Plantilla de Email
- **Key:** `password_reset`
- **Variables:** `%DISPLAY_NAME%`, `%APP_NAME%`, `%LINK%`
- **Link Format:** `http://domain.com/reset-password?token=XXXX`

### Tabla de Base de Datos
```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Cambio de Email

Flujo para que usuarios cambien su dirección de email con verificación de seguridad.

### Endpoints

#### 1. Solicitar Cambio
**POST** `/api/users/change-email`

**Autenticación:** Requerida (JWT token)

**Request:**
```json
{
  "newEmail": "nuevo@example.com"
}
```

**Validaciones:**
- Usuario debe estar autenticado
- Email debe ser válido
- Email no debe estar en uso por otro usuario

**Response:**
```json
{
  "message": "Se ha enviado un correo de confirmación a nuevo@example.com"
}
```

**Comportamiento:**
- Genera token único
- Email se envía a la NUEVA dirección (no a la anterior)
- Token expira en 1 hora
- Token se guarda en `email_change_tokens`

---

#### 2. Verificar Cambio
**POST** `/api/users/verify-email-change`

**Request:**
```json
{
  "token": "x1y2z3a4b5c6..."
}
```

**Response:**
```json
{
  "message": "Email actualizado exitosamente"
}
```

**Flujo:**
1. Valida token en tabla `email_change_tokens`
2. Verifica que no esté usado (`used = false`)
3. Verifica que no esté expirado (`expires_at > NOW()`)
4. **Verifica nuevamente** que nuevo email no esté en uso (race condition)
5. Actualiza `email` en tabla `users`
6. Marca token como usado (`used = true`)

---

### Páginas Frontend

#### Sección en `/admin/profile` (o `/profile`)
- Formulario con campo "Nuevo Email"
- Botón "Solicitar Cambio de Email"
- AlertModal muestra confirmación

#### `/verify-email-change?token=XXXX`
- Verificación automática al cargar página
- Estados:
  - Loading: Spinner "Verificando..."
  - Success: Mensaje de éxito + logout automático
  - Error: Mensaje de error con opción de volver
- **Logout automático** tras éxito (por seguridad)
- Redirección a login (3 segundos)

### Comportamiento de Seguridad

**¿Por qué logout automático?**
Al cambiar el email, el usuario debe iniciar sesión nuevamente con su nuevo email para confirmar que tiene acceso. Esto previene:
- Secuestro de sesiones
- Cambios de email maliciosos
- Acceso no autorizado tras cambio

### Plantilla de Email
- **Key:** `email_change`
- **Variables:** `%DISPLAY_NAME%`, `%APP_NAME%`, `%LINK%`, `%NEW_EMAIL%`
- **Link Format:** `http://domain.com/verify-email-change?token=XXXX`
- **Enviado a:** NUEVO email (no al email actual)

### Tabla de Base de Datos
```sql
CREATE TABLE email_change_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    new_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Características de Seguridad Compartidas

### Tokens
- **Generación:** `crypto.randomBytes(32).toString('hex')` (64 caracteres)
- **Almacenamiento:** Columna UNIQUE en base de datos
- **Expiración:** 1 hora desde creación
- **Un solo uso:** Campo `used` previene reutilización

### Validaciones
- Email: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Contraseña (mínimo):
  - 8 caracteres de longitud
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
  - Regex: `/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

### Email Service
- Configurado en `backend/src/services/emailService.js`
- Usa plantillas de `email_templates` tabla
- SMTP configurado en `app_settings` o `.env`
- Función principal: `sendAuthEmail(templateKey, user, variables)`

---

## Variables de Entorno Requeridas

### Backend (.env)
```env
# Frontend URL para links en emails
FRONTEND_URL=http://localhost:8090

# SMTP (o configurado en app_settings)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app-password

# JWT Secret (o configurado en app_settings)
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
# API URL
VITE_API_URL=http://localhost:3001/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Flujo de Desarrollo

### Añadir Nuevo Flujo de Autenticación

1. **Base de Datos:**
   - Crear tabla SQL en `backend/src/db/tables/`
   - Añadir a `backend/src/db/schema.sql`

2. **Backend:**
   - Añadir función en controller (`authController.js` o `userController.js`)
   - Añadir ruta en routes (`authRoutes.js` o `userRoutes.js`)
   - Añadir validaciones necesarias

3. **Frontend:**
   - Crear página en `frontend/src/pages/`
   - Añadir ruta en `frontend/src/App.jsx`
   - Añadir navegación donde sea relevante

4. **Email:**
   - Crear plantilla en tabla `email_templates`
   - UI para editar en `AdminTemplatesPage`
   - Añadir a `TEMPLATES_CONFIG` en `constants.js`

5. **Testing:**
   - Probar flujo end-to-end
   - Verificar validaciones
   - Verificar seguridad (tokens, expiración)

---

## Troubleshooting

### Emails no llegan
1. Verificar configuración SMTP en `.env` o admin panel
2. Gmail: Usar "Contraseña de aplicación", no contraseña normal
3. Verificar logs: `docker-compose logs api`

### Token inválido inmediatamente
1. Verificar formato correcto del token en URL
2. Verificar sincronización de reloj del servidor
3. Revisar tabla de tokens en BD

### Logout no funciona en cambio de email
1. Verificar que JavaScript está habilitado
2. Verificar DevTools Console para errores
3. Verificar que `localStorage.clear()` se ejecuta

---

## Referencias

- **Código Backend:** `backend/src/controllers/authController.js`
- **Código Backend:** `backend/src/controllers/userController.js`
- **Email Service:** `backend/src/services/emailService.js`
- **Frontend Pages:** `frontend/src/pages/`
- **Tablas SQL:** `backend/src/db/tables/`

---

**Última Actualización:** 2026-01-08  
**Versión:** 1.0  
**Autor:** Antigravity AI Development Team
