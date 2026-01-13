# Directrices de Desarrollo Frontend

## Restricciones de Versiones (CRÍTICO)

> **NO ACTUALIZAR** las siguientes dependencias hasta que sean versiones estables y probadas:

| Paquete | Versión Actual | Versión a Evitar | Razón |
|---------|----------------|------------------|-------|
| React | ^18.3.1 | 19.x | Versión experimental, incompatible con muchas librerías |
| Vite | ^5.4.0 | 7.x | Versión bleeding-edge con bugs en esbuild |
| Tailwind CSS | ^3.4.0 | 4.x | Cambio radical de configuración, requiere migración completa |

## Política de Lockfiles

**SIEMPRE** mantener `package-lock.json` en el repositorio:
- Garantiza builds reproducibles
- Evita diferencias entre entornos (local vs Docker vs CI)
- Previene instalación accidental de versiones incompatibles

```gitignore
# ❌ NO HACER ESTO
package-lock.json

# ✅ CORRECTO: No ignorar lockfiles
```

## CI/CD Linting

El proyecto incluye GitHub Actions que:
1. Ejecuta ESLint en cada PR al branch `main` o `develop`
2. Verifica que el build complete exitosamente
3. Bloquea merge si hay errores de sintaxis JSX

**Archivo:** `.github/workflows/frontend-lint.yml`

## Prevención de Errores Comunes

### Error de Sintaxis JSX
```jsx
// ❌ INCORRECTO - Espacio antes del cierre
</div >

// ✅ CORRECTO
</div>
```

### Imports de Archivos Inexistentes
Antes de importar un componente, verificar que el archivo existe:
```jsx
// Verificar que './tabs/MyTab.jsx' existe antes de:
import MyTab from './tabs/MyTab';
```

## Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Verificar sintaxis antes de commit
npm run lint

# Build de producción (prueba antes de push)
npm run build

# Preview del build
npm run preview
```

---

*Última actualización: 2026-01-09*
