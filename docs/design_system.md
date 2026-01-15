# Sistema de Diseño - Eukrasia

Este documento define los padrones visuales del proyecto para asegurar la consistencia y armonía en todas las interfaces.

## 🎨 Paleta de Colores

### Modo Claro (Light Theme)
Ideal para interfaces administrativas y páginas de información general.

| Categoría | Color | Variable CSS | Descripción |
| :--- | :--- | :--- | :--- |
| **Fondo Primario** | `#f3f4f6` | `--bg-primary` | Fondo principal de la aplicación. |
| **Fondo Secundario** | `#ffffff` | `--bg-secondary` | Fondos de tarjetas y contenedores. |
| **Borde** | `#e5e7eb` | `--border-color` | Líneas divisorias y bordes de inputs. |
| **Texto Primario** | `#111827` | `--text-primary` | Títulos y contenido principal. |
| **Texto Secundario**| `#4b5563` | `--text-secondary`| Subtítulos y descripciones. |
| **Acento Blue** | `#2563eb` | `--accent-primary` | Botones de acción y enlaces. |

---

### Modo Oscuro (Dark Theme - Slate Premium)
Utilizado para la experiencia del usuario y sesiones de respiración.

| Categoría | Color | Variable CSS | Descripción |
| :--- | :--- | :--- | :--- |
| **Fondo Primario** | `#0f172a` | `--bg-primary` | Slate-900. Base profunda. |
| **Fondo Secundario** | `#1e293b` | `--bg-secondary` | Slate-800. Tarjetas y elevación. |
| **Fondo Terciario** | `#334155` | `--bg-tertiary` | Slate-700. Inputs y hovers. |
| **Texto Primario** | `#f8fafc` | `--text-primary` | Slate-50. Texto de alto contraste. |
| **Texto Secundario**| `#cbd5e1` | `--text-secondary`| Slate-300. |
| **Acento Lime** | `#84cc16` | `--accent-primary` | Lime-500. Vibrante para dark mode. |

---

## 🔠 Tipografía

### Fuentes (Fonts)
1.  **Principal (UI)**: `Inter`, `system-ui`, `sans-serif`.
    - Usada para dashboards, tablas y administración.
2.  **User Experience (Breathing)**: `'Outfit'`, `sans-serif`.
    - Usada en sesiones guiadas y elementos premium para mejorar la inmersión.

### Jerarquía de Títulos
*   **H1**: `text-3xl` / `text-4xl`, Semibold o Bold.
*   **H2**: `text-xl` / `text-2xl`, Semibold.
*   **Body**: `text-base` / `text-sm`, Regular (400).
*   **Small**: `text-xs`, Medium (500) para etiquetas y meta-datos.

---

## 🍱 Componentes Estándar

### Botones (`.btn-primary`)
*   **Light**: Fondo Azul (`#2563eb`), Texto Blanco.
*   **Dark**: Fondo Lima (`#84cc16`), Texto Slate-900.
*   **Hover**: Sombra suave (`accent-glow`) y aumento ligero de brillo.

### Tarjetas
*   **Estandar**: `.bg-theme-card` con bordes `.border-theme`.
*   **Elevadas**: `.card-elevated` para destacar sobre el fondo primario.
*   **Glassmorphism**: `.glass-modal` (Blur 12px) para ventanas emergentes sobre fondos dinámicos.

---

## 🌗 Gestión de Temas
El proyecto utiliza la clase `.dark` en el elemento raíz (`<html>`).
*   **Transiciones**: Todas las propiedades de color tienen una transición de `0.3s ease` para un cambio fluido.
*   **Contexto**: Se debe usar el hook `useTheme()` del `ThemeContext` para acceder al estado `isDark` o `theme`.

> [!TIP]
> Al crear nuevos componentes, utiliza siempre las variables CSS (v.gr. `var(--bg-primary)`) o las clases de utilidad `.text-theme-primary` para que el componente sea compatible con ambos temas automáticamente.
