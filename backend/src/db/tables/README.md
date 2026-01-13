# Tablas del Sistema

Esta carpeta contiene los scripts SQL individuales para cada tabla del proyecto.

## Orden de Ejecución

Los archivos están numerados para indicar el orden correcto de ejecución:

1. `01_users.sql` - Tabla de usuarios con autenticación
2. `02_email_templates.sql` - Plantillas de correo electrónico
3. `03_app_settings.sql` - Configuraciones del sistema

## Uso

### Ejecutar todas las tablas en orden:
```bash
psql -U usuario -d basedatos -f 01_users.sql
psql -U usuario -d basedatos -f 02_email_templates.sql
psql -U usuario -d basedatos -f 03_app_settings.sql
```

### O usar el schema.sql principal que las combina todas:
```bash
psql -U usuario -d basedatos -f ../schema.sql
```

## Notas
- Todas las tablas usan `IF NOT EXISTS` para ser idempotentes
- Los índices se crean automáticamente para mejorar performance
