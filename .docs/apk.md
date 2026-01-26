# 📱 Guía: Transformación Web App → APK Android

## Información General

| Aspecto | Detalle |
|---------|---------|
| **Framework** | Capacitor 8.x |
| **Frontend** | React + Vite |
| **CI/CD** | GitHub Actions |
| **Firma** | Debug (release requiere keystore) |

---

## 📋 Índice de Problemas y Soluciones

1. [Configuración Inicial de Capacitor](#1-configuración-inicial-de-capacitor)
2. [Error VANILLA_ICE_CREAM (SDK 35)](#2-error-vanilla_ice_cream-sdk-35)
3. [Conflicto de Clases Duplicadas Kotlin](#3-conflicto-de-clases-duplicadas-kotlin)
4. [Permisos de Gradlew en CI](#4-permisos-de-gradlew-en-ci)
5. [Variables de Entorno no Inyectadas en Build](#5-variables-de-entorno-no-inyectadas-en-build)
6. [APK sin Conexión al Backend (CORS)](#6-apk-sin-conexión-al-backend-cors)
7. [Iconos Genéricos en lugar de Personalizados](#7-iconos-genéricos-en-lugar-de-personalizados)
8. [Sesión no Persiste en App Móvil](#8-sesión-no-persiste-en-app-móvil)

---

## 1. Configuración Inicial de Capacitor

### Problema
El proyecto web no tiene configuración para generar APK.

### Solución

```bash
# 1. Instalar Capacitor
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar Capacitor
npx cap init "NombreApp" "com.empresa.app"

# 3. Agregar plataforma Android
npx cap add android

# 4. Sincronizar
npm run build
npx cap sync android
```

### Archivo: `capacitor.config.json`
```json
{
  "appId": "com.empresa.app",
  "appName": "MiApp",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "cleartext": false
  },
  "android": {
    "allowMixedContent": false
  }
}
```

---

## 2. Error VANILLA_ICE_CREAM (SDK 35)

### Problema
```
error: cannot find symbol VANILLA_ICE_CREAM
```

### Causa
Capacitor 8.x requiere Android SDK 35 (Android 15), pero el proyecto usa SDK 34.

### Solución

**Archivo**: `frontend/android/variables.gradle`
```gradle
ext {
    minSdkVersion = 24
    compileSdkVersion = 35  // ← Cambiar de 34 a 35
    targetSdkVersion = 35   // ← Cambiar de 34 a 35
}
```

**Archivo**: `frontend/android/build.gradle`
```gradle
dependencies {
    classpath 'com.android.tools.build:gradle:8.6.0'  // ← Actualizar AGP
}
```

**Archivo**: `frontend/android/gradle/wrapper/gradle-wrapper.properties`
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-bin.zip
```

---

## 3. Conflicto de Clases Duplicadas Kotlin

### Problema
```
Duplicate class kotlin.collections.jdk8.CollectionsJDK8Kt found in modules
kotlin-stdlib-1.8.22 and kotlin-stdlib-jdk8-1.7.10
```

### Causa
Diferentes plugins usan diferentes versiones de Kotlin stdlib.

### Solución

**Archivo**: `frontend/android/build.gradle` (en bloque `allprojects`)
```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }
    
    // Forzar versión única de Kotlin
    configurations.all {
        resolutionStrategy {
            force 'org.jetbrains.kotlin:kotlin-stdlib:1.9.22'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.9.22'
            force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.9.22'
        }
    }
}
```

---

## 4. Permisos de Gradlew en CI

### Problema
```
./gradlew: Permission denied
```

### Causa
El archivo `gradlew` no tiene permisos de ejecución en el runner de GitHub Actions.

### Solución

**Archivo**: `.github/workflows/android-build.yml`
```yaml
- name: Make gradlew executable
  working-directory: frontend/android
  run: chmod +x ./gradlew

- name: Build APK
  working-directory: frontend/android
  run: ./gradlew assembleDebug
```

---

## 5. Variables de Entorno no Inyectadas en Build

### Problema
El APK se construye pero usa `undefined` o valores vacíos para `VITE_API_URL`.

### Causa
Las variables de entorno deben estar disponibles durante `npm run build`, no solo en runtime.

### Solución

**Archivo**: `.github/workflows/android-build.yml`
```yaml
- name: Build Web Assets
  working-directory: frontend
  run: npm run build
  env:
    VITE_API_URL: https://api.midominio.com/api
    VITE_APP_NAME: MiApp
    VITE_APP_FAVICON_URL: /icons/app.png
```

> ⚠️ **Importante**: Para Vite, las variables deben empezar con `VITE_`

---

## 6. APK sin Conexión al Backend (CORS)

### Problema
La app muestra claves de traducción (`auth.welcome`) en lugar de texto, indicando que no puede conectar al API.

### Causas Múltiples

#### 6.1 URL del API Incorrecta
Si el backend está en subdominio:
```yaml
# ❌ Incorrecto
VITE_API_URL: https://midominio.com/api

# ✅ Correcto (con subdominio api.)
VITE_API_URL: https://api.midominio.com/api
```

#### 6.2 CORS no Permite Origins de Capacitor
El WebView de Capacitor envía origins especiales que deben estar en whitelist.

**Archivo**: `backend/src/app.js`
```javascript
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:8080',
    'http://localhost:3000',
    // Capacitor mobile origins
    'capacitor://localhost',
    'https://localhost',
    'http://localhost'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
```

---

## 7. Iconos Genéricos en lugar de Personalizados

### Problema
El APK usa el icono por defecto de Capacitor.

### Solución

```bash
# 1. Instalar herramienta de assets
cd frontend
npm install @capacitor/assets --save-dev

# 2. Crear carpeta resources con icono fuente
mkdir resources
cp public/icons/mi-icono-512px.png resources/icon.png

# 3. Generar todos los tamaños
npx @capacitor/assets generate --android
```

Esto genera automáticamente:
- Iconos de lanzador (mipmap-*)
- Iconos adaptativos
- Splash screens (light/dark)

---

## 8. Sesión no Persiste en App Móvil

### Problema
El usuario debe iniciar sesión cada vez que abre la app.

### Causa
**localStorage NO es confiable en Capacitor Android WebViews**:
- El sistema operativo puede borrarlo cuando hay poca memoria
- Se pierde en cierres forzados de la app
- Actualizaciones del WebView pueden eliminarlo
- Reinicios del dispositivo pueden limpiarlo

### Solución: Usar Capacitor Preferences

```bash
# Instalar plugin de almacenamiento persistente
cd frontend
npm install @capacitor/preferences
```

**Archivo**: `frontend/src/services/storage.js` (NUEVO)
```javascript
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const Storage = {
    async get(key) {
        if (isNative) {
            const { value } = await Preferences.get({ key });
            return value;
        }
        return localStorage.getItem(key);
    },

    async set(key, value) {
        if (isNative) {
            await Preferences.set({ key, value });
        } else {
            localStorage.setItem(key, value);
        }
    },

    async remove(key) {
        if (isNative) {
            await Preferences.remove({ key });
        } else {
            localStorage.removeItem(key);
        }
    }
};

export default Storage;
```

**Actualizar AuthContext para usar Storage async:**
```jsx
import Storage from '../services/storage';

// En validateSession:
const savedToken = await Storage.get('token');
const savedUser = await Storage.get('user');

// En login:
await Storage.set('token', token);
await Storage.set('user', JSON.stringify(userData));

// En logout:
await Storage.remove('token');
await Storage.remove('user');
```

**Actualizar api.js para obtener token desde Storage:**
```javascript
import Storage from './storage';

const getAuthToken = async (providedToken) => {
    if (providedToken) return providedToken;
    return await Storage.get('token');
};

// En cada método:
const authToken = await getAuthToken(token);
```

> ⚠️ **CRÍTICO**: Esta es la solución definitiva. localStorage no funciona para persistencia en Capacitor Android.

---

## 🔧 Workflow Completo de GitHub Actions

```yaml
name: Build Android APK

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend
        run: npm ci
      
      - name: Build Web Assets
        working-directory: frontend
        run: npm run build
        env:
          VITE_API_URL: https://api.midominio.com/api
          VITE_APP_NAME: MiApp
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
      
      - name: Sync Capacitor
        working-directory: frontend
        run: npx cap sync android
      
      - name: Make gradlew executable
        working-directory: frontend/android
        run: chmod +x ./gradlew
      
      - name: Build APK
        working-directory: frontend/android
        run: ./gradlew assembleDebug
      
      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ github.run_number }}
          files: frontend/android/app/build/outputs/apk/debug/app-debug.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📊 Matriz de Compatibilidad

| Componente | Versión Mínima | Versión Recomendada |
|------------|----------------|---------------------|
| Node.js | 18 | 22 |
| Java | 17 | 21 |
| Gradle | 8.5 | 8.7 |
| Android Gradle Plugin | 8.2.2 | 8.6.0 |
| Android SDK | 34 | 35 |
| Capacitor | 6.x | 8.x |
| Kotlin | 1.8.x | 1.9.22 |

---

## ✅ Checklist Pre-Build

- [ ] `capacitor.config.json` configurado
- [ ] `VITE_API_URL` apunta al subdominio correcto
- [ ] CORS incluye origins de Capacitor
- [ ] Gradle/AGP/SDK actualizados
- [ ] Kotlin stdlib unificado
- [ ] `chmod +x gradlew` en workflow
- [ ] Iconos personalizados generados
- [ ] Token se guarda en localStorage al login
