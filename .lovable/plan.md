

# 🎵 Songwriting Notebook MVP

## Visión General
Una app móvil para compositores que combina un reproductor de audio flotante (siempre visible sobre el teclado) con un editor de letras inteligente en formato "Alas" - texto centrado con timestamp a la izquierda y contador de sílabas a la derecha.

---

## Funcionalidades del MVP

### 1. Reproductor de Música Flotante
- **Posición fija** sobre el teclado del dispositivo (bottom sticky)
- **Controles intermedios**:
  - Play / Pause
  - Barra de progreso (seek)
  - Control de velocidad (0.5x, 0.75x, 1x, 1.25x, 1.5x)
  - Loop on/off
- **Carga de audio local** desde el dispositivo
- **Diseño compacto** que no interfiera con la escritura

### 2. Editor de Letras - Diseño "Alas"
- **Línea por línea** con estructura de 3 columnas:
  - 🕐 **Izquierda**: Timestamp (ej: 0:45)
  - 📝 **Centro**: Texto de la letra (editable)
  - 🔢 **Derecha**: Contador automático de sílabas
- **Agregar/eliminar líneas** fácilmente
- **Auto-conteo de sílabas** en tiempo real mientras escribes

### 3. Gestión de Canciones
- **Crear nueva canción** (título + adjuntar audio)
- **Lista de canciones guardadas** (localStorage)
- **Editar/eliminar canciones**
- **Una nota de texto por canción**

### 4. Almacenamiento Local
- Guardado automático en el navegador (localStorage)
- Sin necesidad de cuenta o internet

---

## Diseño Visual
- Interfaz **mobile-first** optimizada para iOS/Android
- Tema oscuro o claro (ideal para sesiones nocturnas de composición)
- Reproductor en **barra inferior fija** que se mantiene visible al escribir
- Editor limpio y enfocado en el contenido

---

## Flujo de Usuario
1. Abre la app → Ve lista de canciones (o vacía si es nuevo)
2. Crea nueva canción → Pone título y adjunta archivo de audio
3. Entra al editor → Reproduce el audio mientras escribe
4. Escribe línea por línea → Ve sílabas automáticamente
5. Agrega timestamps manualmente o con un botón "marcar tiempo actual"
6. Todo se guarda automático en el dispositivo

---

## Stack Técnico
- **React + TypeScript + Tailwind** (ya configurado)
- **localStorage** para persistencia
- **HTML5 Audio API** para el reproductor
- **PWA ready** para que pueda instalarse como app

