# Guía de Construcción: Android App (Capacitor)

Esta guía explica cómo generar el archivo `eukrasia-pilot.apk` para la distribución piloto.

## Prerrequisitos
1.  **Node.js** instalado (v18+).
2.  **Android Studio** instalado (con Android SDK y un emulador o dispositivo físico).
3.  **Java/JDK** 17+.

## Pasos (Local en tu PC)

### 1. Preparar el Proyecto
En la carpeta `frontend/`:

```bash
# 1. Instalar dependencias de Capacitor (si no lo has hecho)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar Capacitor (solo la primera vez)
npx cap init Eukrasia com.eukrasia.app --web-dir dist

# 3. Añadir plataforma Android
npx cap add android

# 4. Generar Build Web fresca
npm run build
```

### 2. Sincronizar y Abrir en Android Studio
```bash
# Sincroniza los archivos 'dist/' con la carpeta nativa 'android/'
npx cap sync

# Abre el proyecto nativo en Android Studio
npx cap open android
```

### 3. Generar APK
1.  En Android Studio, espera a que termine la indexación de Gradle.
2.  Ve al menú: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3.  Una vez termine, verás una notificación "APK(s) generated successfully". Haz clic en **locate**.
    -   Ruta típica: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`.

### 4. Desplegar para Descarga
1.  Renombra el archivo generado a `eukrasia-pilot.apk`.
2.  Copia este archivo a la carpeta `frontend/public/downloads/` de tu proyecto.
    -   Ruta destino: `d:\Antigravity\B - Eukrasia\frontend\public\downloads\eukrasia-pilot.apk`
3.  Redesplegar el contenedor web (o simplemente el archivo si estás en local) para que esté disponible.

## Verificación
Abre la App Web, ve a **Configuración > Información** y pulsa "Descargar APK".
