# Análisis de Procesos en Segundo Plano y Plan de Optimización

## 🔍 Diagnóstico Actual
Tras un análisis profundo del código fuente, he identificado los siguientes "procesos" (cronómetros, intervalos, audios) que se ejecutan en la aplicación y su estado de limpieza actual.

### 1. 🟢 Modulo de Sueño (`SleepTracker.jsx`)
*   **Proceso:** Cronómetro de sueño y monitoreo de estado.
*   **Estado:** **CORRECTO**. Se mantiene activo intencionalmente. El usuario solicitó explícitamente que este proceso **NO** se mate, ya que debe funcionar mientras el usuario duerme.

### 2. 🟠 Modulo de Mente / Trataka (`TratakaSessionPage.jsx`)
*   **Proceso 1:** `setInterval` para el cronómetro de la sesión.
    *   *Estado:* ✅ Se limpia correctamente al desmontar el componente (`clearInterval`).
*   **Proceso 2:** `WakeLock` (mantener pantalla encendida).
    *   *Estado:* ✅ Se libera correctamente al salir.
*   **Proceso 3:** **Reproducción de Audio (Ruido Marrón, Gongs).**
    *   *Estado:* ⚠️ **RIESGO DE FUGA.** Actualmente, si el usuario navega "Atrás" con el botón del navegador o cambia de ruta inesperadamente sin pulsar "Salir", el audio podría seguir reproduciéndose en segundo plano (Fuga de memoria/audio).
    *   *Acción Requerida:* Implementar limpieza imperativa en el `useEffect` de desmontaje.

### 3. 🟢 Modulo de Respiración (`GuidedBreathingPage.jsx`)
*   **Proceso:** Múltiples cronómetros y audios gestionados por `useBreathingSession`.
*   **Estado:** **CORRECTO**. Implementamos recientemente un sistema de limpieza agresivo (`MASTER CLEANUP`) que detiene y destruye todas las referencias de audio al salir de la página.

### 4. 🟡 Dashboard Metabólico (`MetabolicDashboard.jsx`)
*   **Proceso:** Intervalo de actualización de datos cada 60 segundos.
*   **Estado:** ✅ Se limpia correctamente, pero podría optimizarse para detenerse si la pestaña no está visible (Page Visibility API) para ahorrar batería.

---

## 🛡️ Plan de "Exterminio" de Procesos Innecesarios

Para garantizar que la aplicación no consuma recursos (batería/CPU) cuando el usuario no está realizando una actividad activa, propongo implementar el siguiente **Protocolo de Limpieza**:

### Fase 1: Sellado de Fugas (Inmediato)
Ejecutar correcciones en los componentes identificados con riesgo:

1.  **Parchear `TratakaSessionPage.jsx`:**
    *   Añadir una función de limpieza en el `useEffect` principal que fuerce la detención (`pause()`) y reinicio (`currentTime = 0`) de `audioRef` y `bgAudioRef` incondicionalmente al desmontar el componente.

### Fase 2: Hook Centralizado de Procesos (Arquitectura)
En lugar de confiar en que cada desarrollador recuerde limpiar sus audios e intervalos, crearemos Hooks personalizados que se "autodestruyan".

1.  **Crear `useAutoCleanAudio`:**
    *   Un hook que envuelva la creación de `new Audio()`.
    *   Automáticamente registra el audio en una lista y lo detiene si el componente que lo usó desaparece de la pantalla.
    
2.  **Crear `useSafeInterval`:**
    *   Reemplazo de `setInterval` que se asegura de limpiar el proceso si el componente se desmonta, evitando el error común de "Can't perform a React state update on an unmounted component".

### Fase 3: "Garbage Collector" de Navegación
Implementar un "middleware" en el Router (`App.jsx` o `UserLayout`):

*   **Acción:** Cada vez que cambie la ruta (navegación), ejecutar un "Barrido Global" (excepto si la ruta destino es `/sleep`).
*   **Implementación:** Usar un Contexto Global (`ProcessContext`) donde los módulos registren sus procesos activos. Al cambiar de ruta, este contexto mata todo lo que no esté en una "Lista Blanca" (Allowlist).
