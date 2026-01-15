# Tablas del Sistema

Esta carpeta contiene los scripts SQL individuales para cada tabla del proyecto.

## Orden de Ejecución

Los archivos están numerados para indicar el orden correcto de ejecución:

### Core (Autenticación)
1. `01_users.sql` - Tabla de usuarios con autenticación
2. `02_email_templates.sql` - Plantillas de correo electrónico
3. `03_app_settings.sql` - Configuraciones del sistema
4. `04_password_reset_tokens.sql` - Tokens de reset de contraseña
5. `05_email_change_tokens.sql` - Tokens de cambio de email
6. `06_advanced_settings.sql` - Configuraciones avanzadas (JWT, AI)
7. `07_password_history.sql` - Historial de contraseñas
8. `08_avatar_history.sql` - Historial de avatares
9. `09_user_status.sql` - Estado de usuarios

### Internacionalización
10. `10_translations.sql` - Traducciones multi-idioma

### Módulo Respiración
11. `11_breathing_exercises.sql` - Sesiones de ejercicios
12. `12_breathing_config.sql` - Configuración por usuario
13. `13_add_notes_to_breathing.sql` - Notas en sesiones
14. `14_add_global_audio_files.sql` - Archivos de audio globales

### Módulo Mente (Trataka)
15. `15_mind_sessions.sql` - Sesiones de meditación
16. `16_mind_configurations.sql` - Configuración por usuario

## Migraciones Importantes

Las migraciones en `../migrations/` contienen cambios incrementales:

| Archivo | Descripción |
|---------|-------------|
| `003_metabolic_logs.sql` | Tabla de logs metabólicos unificados |
| `004_sleep_sessions.sql` | Tabla de sesiones de sueño |
| `005_database_consistency_fixes.sql` | **NUEVO** - Fixes de ENUM, columnas faltantes, timezones |

## Documentación Completa

Ver [docs/database_architecture.md](../../../docs/database_architecture.md) para documentación detallada de todas las tablas, tipos de datos y convenciones.

## Uso

### Ejecutar migración específica:
```bash
psql -U usuario -d basedatos -f ../migrations/005_database_consistency_fixes.sql
```

### O usar el schema.sql principal:
```bash
psql -U usuario -d basedatos -f ../schema.sql
```

## Notas
- Todas las tablas usan `IF NOT EXISTS` para ser idempotentes
- Los índices se crean automáticamente para mejorar performance
- Las migraciones usan `BEGIN/COMMIT` para transacciones atómicas
