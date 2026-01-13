# Guía de Migración para Nuevos Proyectos (Root Projects)

Este documento detalla el procedimiento para migrar un proyecto raíz hacia una nueva instancia de base de datos para un cliente o proyecto específico.

## El Archivo de Arranque: `config_bootstrap.sql`

El archivo `docs/migrations/config_bootstrap.sql` contiene los datos esenciales para que el sistema funcione:
1.  **Traducciones (i18n)**: Todos los textos del sistema.
2.  **Plantillas de Email**: El diseño de los correos de bienvenida, recuperación, etc.
3.  **Configuraciones de App**: Toggles, límites de IA y ajustes globales.

> [!IMPORTANT]
> **Seguridad de Credenciales**: El archivo `config_bootstrap.sql` ha sido saneado para **NO incluir** credenciales de Google OAuth, API Keys de IA (Gemini/OpenAI), configuraciones SMTP ni secretos JWT. Todo esto debe configurarse manualmente desde el Panel de Administración después de la importación.

## Pasos para Iniciar un Nuevo Proyecto

### 1. Preparación de la Base de Datos
- Crea la base de datos vacía en PostgreSQL.
- Aplica el esquema inicial ejecutando `backend/src/db/schema.sql`. Esto creará todas las tablas, incluyendo las de historial (`avatar_history`, `password_history`) y las preferencias de usuario.

### 2. Migración de Configuraciones (Bootstrap)
Para importar las traducciones y plantillas básicas:
```bash
# Truncar tablas para evitar duplicados
psql -h <HOST> -U <USER> -d <NUEVA_BD> -c "TRUNCATE translations, ai_limits, advanced_settings, app_settings, email_templates CASCADE;"

# Importar configuraciones maestras
psql -h <HOST> -U <USER> -d <NUEVA_BD> -f docs/migrations/config_bootstrap.sql
```

### 3. Configuración Inicial Obligatoria
Nada más entrar al Panel de Administrador del nuevo proyecto, **DEBES configurar**:
- **JWT Secret**: Cambia el valor temporal en Ajustes Avanzados/Seguridad.
- **SMTP**: Configura el servidor de correo para que funcionen los registros.
- **AI Keys**: Introduce las API Keys del nuevo cliente.
- **Branding**: Sube el nuevo favicon y cambia el nombre de la App en Ajustes Generales.

### 4. Ajustes de Infraestructura (Docker Compose)
Para despliegues en servidores compartidos (VPS) que utilizan **Traefik**, es crítico asegurar que los routers y servicios tengan nombres únicos para evitar colisiones:

1.  **Nombres de Routers**: Modifica las `labels` en `docker-compose.prod.yml` anteponiendo el nombre del cliente o proyecto.
    -   *Incorrecto*: `traefik.http.routers.api.rule`
    -   *Correcto*: `traefik.http.routers.cliente_api.rule`
2.  **Aislamiento de Puertos**: Los puertos internos (`3000` para API, `8080` para Frontend) no necesitan cambiar entre proyectos, ya que Traefik los identifica por el nombre único del router.

## Tablas de Historial
A diferencia de versiones anteriores, este esquema incluye automáticamente:
- `avatar_history`: Registra cambios de foto de perfil para permitir auditoría y limpieza.
- `password_history`: Para futuras implementaciones de seguridad de no repetición de contraseñas.

