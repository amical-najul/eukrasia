# Guía de Configuración de Google OAuth 2.0

Esta guía explica cómo crear y configurar credenciales de OAuth 2.0 en Google Cloud Console para tu aplicación, tanto en **desarrollo local** como en **producción**.

---

## Paso 1: Configurar la Pantalla de Consentimiento OAuth

Antes de crear credenciales, debes configurar la pantalla de consentimiento:

1. En el menú lateral, ve a **"Branding"** (o "Pantalla de consentimiento OAuth")
2. Selecciona el tipo de usuario:
   - **Interno**: Solo usuarios de tu organización (requiere Google Workspace)
   - **Externo**: Cualquier usuario con cuenta de Google
3. Completa los campos requeridos:
   - Nombre de la aplicación
   - Email de soporte
   - Logo (opcional)
4. En **"Público-alvo"**, agrega los correos de los usuarios de prueba mientras la app esté en modo "Testing"

---

## Paso 2: Crear ID de Cliente OAuth

### Para Desarrollo Local

1. Ve a **"Clientes"** en el menú lateral
2. Haz clic en **"+ Crear cliente"** o **"+ Adicionar URI"**
3. Selecciona **"Aplicativo da Web"** como tipo
4. Nombre: `Cliente Web - Desarrollo` (o cualquier nombre descriptivo)

#### Orígenes JavaScript Autorizados
Agrega las URLs desde donde se hará la solicitud de autenticación:

```
http://localhost:8090
http://localhost:3000
http://127.0.0.1:8090
```

#### URIs de Redirección Autorizados
Agrega las URLs a donde Google redirigirá después del login:

```
http://localhost:8090
http://localhost:8090/auth/callback
```

5. Haz clic en **"Criar"** (Crear)
6. **Copia el ID de Cliente** que aparece (formato: `xxxxx.apps.googleusercontent.com`)

---

### Para Producción

Puedes usar el mismo cliente o crear uno nuevo para producción:

#### Orígenes JavaScript Autorizados
```
https://tudominio.com
https://www.tudominio.com
```

#### URIs de Redirección Autorizados
```
https://tudominio.com
https://tudominio.com/auth/callback
```

> [!IMPORTANT]
> En producción, las URLs deben usar **HTTPS**. Google no permite HTTP en dominios que no sean localhost.

---

## Paso 3: Configurar Variables de Entorno

### En tu archivo `.env`:

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

### Si tienes archivos separados:

**`.env.development`:**
```env
VITE_GOOGLE_CLIENT_ID=tu-client-id-desarrollo.apps.googleusercontent.com
```

**`.env.production`:**
```env
VITE_GOOGLE_CLIENT_ID=tu-client-id-produccion.apps.googleusercontent.com
```

---

## Paso 4: Verificar Configuración en el Código

Tu aplicación ya está configurada para usar la variable de entorno. Verifica en `App.jsx`:

```javascript
const AuthWrapper = ({ children }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID';
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
```

---

## Resumen de URLs

| Entorno | Orígenes JS | URIs Redirección |
|---------|-------------|------------------|
| Local | `http://localhost:8090` | `http://localhost:8090` |
| Producción | `https://tudominio.com` | `https://tudominio.com` |

---

## Notas Importantes

1. **Tiempo de propagación**: Los cambios pueden tardar 5 minutos a varias horas en aplicarse
2. **Modo Testing**: Mientras esté en modo de prueba, solo los usuarios agregados en "Público-alvo" podrán autenticarse
3. **Publicación**: Para permitir cualquier usuario, debes solicitar verificación de la app en Google
4. **Un solo Client ID**: Puedes usar el mismo ID para desarrollo y producción, solo agrega todas las URLs necesarias
