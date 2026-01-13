---
description: Guías para desarrollo frontend y prevención de errores de build
---

# Desarrollo Frontend

## Reglas Críticas

1. **NO actualizar** React a v19, Vite a v7, o Tailwind a v4 hasta nuevo aviso
2. **SIEMPRE** commitear `package-lock.json`
3. **EJECUTAR** `npm run lint` antes de cada commit

## Antes de Push

// turbo
1. Ejecutar lint: `npm run lint`

// turbo  
2. Verificar build: `npm run build`

3. Si hay errores, corregirlos antes de push

## Comandos Frecuentes

```bash
# Desarrollo
npm run dev

# Lint
npm run lint

# Build
npm run build
```

## Troubleshooting

### Error "Expected identifier but found /"
- Revisar archivos JSX por sintaxis inválida
- Buscar `</div >` (espacio antes de >)
- Verificar que todos los imports existan

### Error "Could not resolve"
- Verificar que el archivo importado existe
- Crear el archivo faltante o eliminar el import
