# 🚀 Interfaz - Base Template

Template base para aplicaciones web con autenticación, panel de administración y configuración dinámica.

## ⚡ Quick Start

```bash
# 1. Clonar
git clone <repo> mi-proyecto && cd mi-proyecto

# 2. Setup
cd backend && npm run setup:project

# 3. Desarrollo
docker-compose up --build -d
```

## 📁 Estructura

```
├── backend/         # API Express + PostgreSQL
├── frontend/        # React + Vite + TailwindCSS
├── docs/            # Documentación completa
├── .env.example     # Template de variables
└── docker-compose.prod.yml  # Para Portainer
```

## 🔧 Características

- ✅ Autenticación JWT + Google OAuth
- ✅ Panel de Administración
- ✅ Gestión de Usuarios
- ✅ Plantillas de Email editables
- ✅ Configuración SMTP desde UI
- ✅ MinIO para almacenamiento
- ✅ i18n (ES/EN/PT)
- ✅ Dark Mode

## 📦 Despliegue (Portainer)

1. `npm run setup:project` → genera `portainer.env`
2. Portainer → Stacks → Add Stack
3. Pegar `docker-compose.prod.yml`
4. Environment → pegar `portainer.env`
5. Deploy

## 📚 Documentación

Ver [docs/README.md](./docs/README.md) para guía completa.

---
**v1.2** | 2026-01-11
