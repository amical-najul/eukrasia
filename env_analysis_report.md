# Análisis de Conflictos en Archivos de Entorno (.env)

Se han analizado los siguientes archivos de configuración:
1.  **General/Root** (`./.env`): Usado principalmente por Docker Compose.
2.  **Backend Local** (`./backend/.env`): Usado cuando se corre el backend localmente (`npm start`).
3.  **Frontend Local** (`./frontend/.env`): Usado por Vite en desarrollo local.

## 🚨 Conflictos Críticos (Causan Pérdida/Separación de Datos)

Estos son los conflictos más graves. Si corres la app con Docker vs Localmente, te conectarás a bases de datos y archivos diferentes.

| Variable | Root .env (Docker) | Backend .env (Local) | Impacto |
| :--- | :--- | :--- | :--- |
| **DB_NAME** | `eukrasia` | `pruebas` | **GRAVE**: Los datos guardados en Docker no se ven en local y viceversa. |
| **MINIO_BUCKET_NAME** | `eukrasia` | `pruebas` | **GRAVE**: Las imágenes subidas en un entorno no existen en el otro. |
| **NODE_ENV** | `development` (en docker-compose) | `test` | Comportamientos diferentes en logs y manejo de errores. |

## ⚠️ Inconsistencias de Configuración

Configuraciones que difieren pero podrían ser intencionales o cosméticas.

| Variable | Root .env | Frontend .env | Impacto |
| :--- | :--- | :--- | :--- |
| **VITE_APP_NAME** | `eukrasia` | `"Prototipo PWA"` | El título de la aplicación cambia según cómo se levante el frontend. |
| **VITE_API_URL** | N/A (Docker maps port) | `http://localhost:3001/api` | Generalmente correcto, pero Docker usa puerto interno 3000 mapeado a 3001. |

## ℹ️ Detalles de Puertos

*   **Docker Compose**:
    *   API: Puerto interno 3000 -> Mapeado a 3001 externo.
    *   Web: Puerto interno 8080 -> Mapeado a 8090 externo.
*   **Backend Local**: Corre en puerto 3001 (`PORT=3001`).
*   **Frontend Local**: Espera API en 3001.
    *   *Conclusión*: Esto es **consistente** ✅. Tanto Docker como Local exponen la API en el puerto 3001 del host.

## Recomendación

Para solucionar los problemas de datos "desaparecidos" o inconsistentes, se recomienda **unificar** los nombres de la base de datos y el bucket.
