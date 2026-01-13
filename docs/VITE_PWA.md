# Manual de Implementación PWA (Progressive Web App)

Este documento explica cómo funciona la lógica de aplicación instalable en este proyecto y los pasos para pasar de un sitio web normal a una aplicación móvil/escritorio completa.

## Piezas del Rompecabezas PWA

### 1. El Manifiesto (`frontend/public/manifest.json`)
Es el archivo que los navegadores (Chrome, Safari) buscan para saber si el sitio es "instalable".
- **Identidad**: Controla el nombre (`short_name`) y el color de fondo.
- **Iconos**: Usa los archivos de `/public/icons` que configuramos. Estos se verán en el escritorio del celular.
- **Standalone**: Al estar en modo `standalone`, la app se abre sin botones de navegador, pareciendo una app nativa.

### 2. El Service Worker (`frontend/public/sw.js`)
Es un script que vive en el navegador del usuario incluso cuando la pestaña está cerrada.
- **Misión Actual**: Está configurado para guardar en caché la página de inicio e `index.html`.
- **Misión Futura**: Permitir que la app abra instantáneamente y funcione sin internet.

---

## La Ventana de "Service Worker Killer"

Actualmente, en `index.html` (líneas 17-27), existe un bloque de código que **desactiva** la PWA intencionalmente:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister(); // <--- ESTO ELIMINA EL PWA CADA VEZ QUE CARGAS
    }
  });
}
```

### ¿Por qué está ahí?
Durante el desarrollo, si el PWA está activo, el navegador guarda una copia de la web "vieja". Si haces un cambio en el código y refrescas, **no verás el cambio** porque el Service Worker te servirá la copia guardada. Para evitar esa confusión, lo mantenemos desactivado mientras programamos.

---

## Cómo proceder para Activar la PWA (Producción)

Cuando el diseño y la funcionalidad estén listos y quieras que los usuarios instalen la App, sigue estos pasos:

### Paso 1: Eliminar el "Killer"
Borra el script mencionado arriba del archivo `frontend/index.html`.

### Paso 2: Registrar el Service Worker Real
Añade este script en su lugar dentro del `index.html`:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('PWA Lista!', reg))
      .catch(err => console.log('Error PWA', err));
  });
}
```

### Paso 3: Verificar en Chrome
1. Abre las herramientas de desarrollador (F12).
2. Ve a la pestaña **Application** -> **Manifest**.
3. Verás si los iconos cargan bien y si aparece el botón de "Install".

### Paso 4: HTTPS Directo
Las PWA solo se activan si el sitio tiene **SSL (Candado verde)**. Como tu dominio `prueba.n8nprueba.shop` ya tiene Traefik con SSL, funcionará perfectamente en producción.

---

## Recomendación
**No actives la PWA hasta que la interfaz de usuario esté terminada.** De lo contrario, cada vez que hagas un cambio visual, tendrás que vaciar manualmente la caché del navegador para poder verlo.
