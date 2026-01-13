# Archivos Protegidos (Shielded Files)

> [!CAUTION]
> **PROTOCOLO DE SEGURIDAD**: Los siguientes archivos forman parte del núcleo estable (Core, Auth, Admin) de la aplicación.
> **REGLA**: El agente NO DEBE modificar estos archivos a menos que el usuario lo solicite EXPLÍCITAMENTE "desblindándolos" o autorizando la edición específica tras una advertencia.

## Backend

### Core
- `backend/src/app.js`
- `backend/src/server.js`
- `backend/src/config/db.js`
- `backend/src/config/minio.js`

### Middlewares
- `backend/src/middleware/authMiddleware.js`
- `backend/src/middleware/adminMiddleware.js`
- `backend/src/middleware/errorMiddleware.js`

### Controladores (Auth & Settings)
- `backend/src/controllers/authController.js`
- `backend/src/controllers/userController.js`
- `backend/src/controllers/settingsController.js`
- `backend/src/controllers/advancedSettingsController.js`

### Rutas
- `backend/src/routes/authRoutes.js`
- `backend/src/routes/userRoutes.js`
- `backend/src/routes/settingsRoutes.js`

## Frontend

### Core & Contexto
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/context/AuthContext.jsx`

### Páginas de Autenticación
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/ForgotPasswordPage.jsx`
- `frontend/src/pages/ResetPasswordPage.jsx`
- `frontend/src/pages/VerifyEmailChangePage.jsx`

### Panel de Administración (Critical)
- `frontend/src/layouts/AdminLayout.jsx`
- `frontend/src/components/AdminRoute.jsx`
- `frontend/src/pages/admin/AdminUsersPage.jsx`
- `frontend/src/pages/admin/AdminProfilePage.jsx`
- `frontend/src/pages/admin/AdminGeneralSettingsPage.jsx`
- `frontend/src/pages/admin/AdminGoogleAuthPage.jsx`
