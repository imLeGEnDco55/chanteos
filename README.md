# 🎵 CHANTEOS

> **"Arquitectura para el caos lírico. No es un editor de texto. Es un motor de construcción de canciones."**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ⚡ MANIFESTO

Chanteos destruye el paradigma del documento lineal. Las canciones no son texto — son **estructuras temporales** con arquitectura rítmica. Este sistema implementa:

- **Block-Based Lyric Engine:** Cada línea es una entidad atómica con timestamp, sílabas, y tipo.
- **Audio-First Workflow:** Sincronización precisa entre playback y escritura.
- **AI-Powered Rhymes:** Sugerencias contextuales vía Google Gemini.
- **Zero-Server Architecture:** Todo vive localmente (IndexedDB + LocalStorage).

---

## 🛰️ SISTEMA DE MÓDULOS

### 1. **LYRIC ENGINE** ✅ ONLINE
El núcleo del sistema. Cada línea de letra es un objeto estructurado:

```typescript
interface LyricLine {
  id: string;
  type: 'lyric' | 'prompt';  // Letra vs Instrucción estructural
  timestamp: string;          // "1:23" - Sync con audio
  text: string;
  syllableCount: number;      // Cálculo automático en español
}
```

**Características:**
- ⏱️ **Smart Timestamping:** `#` añade timestamp a línea actual o crea nueva
- 🔢 **Syllable Counter:** Algoritmo de silabeo español en tiempo real
- 📝 **Dual Line Types:**
  - `lyric`: Letras normales con timestamp y sílabas
  - `prompt`: Instrucciones estructurales (`[Verse]`, `[Chorus]`) sin timestamp
- ↩️ **Undo/Redo:** Historia completa con debouncing inteligente (500ms)
- 🎯 **Active Line Sync:** Highlighting automático basado en playback

### 2. **AUDIO VAULT** ⚡ VOLATILE
Reproductor de audio con controles de precisión quirúrgica:

**Controles:**
- ⏯️ **Play/Pause:** Centro de comando
- ⏪⏩ **Skip ±3s:** Navegación rápida
- 🔁 **Loop A-B:** Marca punto A, marca punto B, loop infinito entre ambos
- ⚡ **Playback Speed:** 0.5x → 0.75x → 1x → 1.25x → 1.5x
- 📍 **Timeline Scrubbing:** Seek preciso con preview de tiempo

**Persistencia:**
- 💾 **IndexedDB Storage:** Audio guardado como Blob (evita límite 5MB de localStorage)
- 🔗 **Blob URL Caching:** Sesión activa mantiene URLs en memoria
- 🔄 **Auto-Restore:** Carga audio al reabrir proyecto

### 3. **RHYME PANEL** 🤖 AI-POWERED
Integración con Google Gemini para sugerencias lingüísticas:

**Activación:**
1. Doble-click en palabra → Selección automática
2. Panel slide-up con sugerencias
3. Click en palabra → Nueva búsqueda recursiva

**Respuesta:**
```typescript
{
  "rhymes": ["cielo", "vuelo", "hielo", "suelo"],     // Rimas consonantes
  "related": ["aire", "libertad", "altura", "alas"]   // Palabras contextuales
}
```

**Configuración requerida:**
- API Key de Google Gemini en Settings
- Guardada localmente (localStorage: `gemini_api_key`)
- Modelo: `gemini-2.0-flash`

### 4. **PROMPT LIBRARY** 📚 TEMPLATE SYSTEM
Biblioteca de fragmentos estructurales reutilizables:

**Uso:**
1. Crear plantillas en Settings (ej: estructuras Suno AI)
2. Insertar desde player (botón 🎵)
3. Se añaden como líneas tipo `prompt`

**Ejemplo plantilla:**
```
[Verse]
[Chorus]
[Verse]
[Chorus]
[Bridge]
[Chorus]
```

### 5. **PROJECT SYSTEM** 💾 `.CHNT` FORMAT
Formato propietario basado en ZIP:

**Estructura .CHNT:**
```
proyecto.chnt/
├── project.json    # Metadata + letras + timestamps
└── audio.mp3       # Archivo de audio original
```

**Exportaciones disponibles:**
- `.CHNT` → Proyecto completo (importable)
- `.TXT` → Solo letras formateadas (para uso externo)

---

## 🔧 STACK TÉCNICO

### Core
- **Runtime:** Vite 5 (HMR ultra-rápido)
- **Framework:** React 18 (Concurrent Mode)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Shadcn/UI Components

### State Management
- **React Query:** Cache de datos async
- **Custom Hooks:** Estado local optimizado
- **Refs:** Estabilidad de callbacks

### Storage
- **IndexedDB:** Audio files (ilimitado)
- **LocalStorage:** Metadata + Settings + Lyrics
- **Blob URLs:** Audio runtime cache

### APIs
- **Web Audio API:** Playback control
- **Visual Viewport API:** Keyboard height detection (mobile)
- **Google Gemini API:** Rhyme generation

---

## 🚀 INSTALACIÓN

### Prerequisitos
```bash
Node.js 18+
npm / pnpm / bun
```

### Setup
```bash
# Clonar
git clone <repo>
cd chanteos

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build
```

### Configuración Gemini (Opcional)
1. Obtener API Key: https://makersuite.google.com/app/apikey
2. Settings → API Configuration
3. Pegar key → Guardar
4. Seleccionar palabras para ver rimas

---

## 📱 MOBILE-FIRST DESIGN

### Adaptaciones iOS/Android
- **Keyboard Detection:** Visual Viewport API detecta altura de teclado
- **Player Reposition:** Audio player se mueve sobre teclado (no queda oculto)
- **Safe Areas:** Respeta notch y gestos del sistema
- **Touch Optimized:** Controles grandes (44px+ tap targets)

### Desktop Enhancements
- **Keyboard Shortcuts:** (Próximamente)
- **Drag & Drop:** Audio import
- **Multi-window:** (Roadmap)

---

## 🗂️ ARQUITECTURA DE ARCHIVOS

```
src/
├── components/
│   ├── AudioPlayer.tsx         # Player con loop A-B y controles
│   ├── LyricLine.tsx           # Línea individual editable
│   ├── PromptLine.tsx          # Línea estructural (no editable timestamp)
│   ├── RhymePanel.tsx          # Panel de sugerencias AI
│   ├── SongEditor.tsx          # Editor principal
│   ├── SongList.tsx            # Lista de proyectos
│   ├── SettingsDialog.tsx      # Configuración global
│   └── ui/                     # Shadcn components
├── hooks/
│   ├── useAudioPlayer.ts       # Lógica de playback
│   ├── useLyricsHistory.ts     # Undo/Redo con debouncing
│   ├── useRhymeSuggestions.ts  # Integración Gemini
│   ├── useSongs.ts             # CRUD de proyectos
│   └── useKeyboardHeight.ts    # Detección teclado móvil
├── lib/
│   ├── audioStorage.ts         # IndexedDB wrapper
│   ├── gemini.ts               # Google AI client
│   ├── projectFile.ts          # Import/Export .CHNT
│   ├── syllables.ts            # Contador de sílabas español
│   └── utils.ts                # Helpers
└── types/
    └── song.ts                 # TypeScript interfaces
```

---

## 🔐 PRIVACIDAD & DATOS

- **Zero Cloud:** Todo es local. No hay servidores Chanteos.
- **API Keys:** Gemini key guardada en tu navegador (no se envía a ningún lado excepto Google).
- **Audio Files:** IndexedDB (mismo origen, no compartido entre sitios).
- **Export Portability:** `.CHNT` files son portables entre dispositivos.

---

## 🎯 ROADMAP

### v0.2.0 - PRECISION TOOLS
- [ ] Waveform visualization
- [ ] Multi-track support
- [ ] Keyboard shortcuts
- [ ] Collaborative editing (WebRTC)

### v0.3.0 - AI EXPANSION
- [ ] Melody suggestions
- [ ] Chord progression generator
- [ ] Sentiment analysis
- [ ] Translation engine

### v1.0.0 - PRODUCTION
- [ ] Desktop app (Tauri)
- [ ] Cloud sync (opcional)
- [ ] Plugin system
- [ ] VST integration

---

## 🐛 ANOMALÍAS CONOCIDAS

| Issue | Status | Workaround |
|-------|--------|------------|
| Mobile layout shifts en screens <375px | 🟡 Tracked | Use landscape |
| Audio no persiste en refresh (session cache) | 🟢 Fixed | Usa IndexedDB |
| Gemini rate limiting en rapid queries | 🟡 Known | Debounce implementado |

---

## 💀 CONTRIBUTING

### Protocol
1. **Read `AGENTS.md`** - Protocolo de desarrollo
2. **Check `CONTEXT.md`** - Estado actual del sistema
3. **Branch naming:** `feature/`, `fix/`, `refactor/`
4. **Commits:** Descriptivos, no fluff

### Style Guide
- **TypeScript Strict Mode** - No `any`
- **Functional Components** - No classes
- **Hooks over HOCs** - Composición moderna
- **Tailwind only** - No CSS custom (excepto index.css)

---

## 📄 LICENSE

MIT - Build whatever you want with this.

---

## 🙏 CREDITS

**Built with:**
- React Team - Concurrent rendering
- Vercel - Vite tooling
- Radix UI - Accessible primitives
- Google - Gemini AI
- Shadcn - Component patterns

---

<p align="center">
  <strong>"Order from Chaos. Music from Noise."</strong><br>
  <sub>Chanteos v0.1.1 - Lean Prototype</sub>
</p>