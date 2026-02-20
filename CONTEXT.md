# CHANTEOS CONTEXT v0.1.0

## ⚡ SYSTEM STATUS
**VERSION:** 0.1.1 (Lean Prototype)
**STATE:** 🟢 CLEANED & OPTIMIZED
**DEPLOY:** LOCALHOST

## 🎯 OBJECTIVE
**NOT A NOTE-TAKING APP.**
A **Sonic Workspace** for structuring chaotic inspiration into cohesive lyrics.
- **Capture:** Immediate block-based lyric entry.
- **Structure:** Verse/Chorus/Bridge tagging.
- **Flow:** Audio playback integration (Local).

## 🛠️ TECHNICAL STACK
- **Runtime:** Vite + React 18
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS + Shadcn Elements
- **Data:** Local Storage / JSON Export
- **Audio:** Browser Audio API

## 🧩 MODULES STATUS (v0.1.0)
| MODULE | STATUS | DESCRIPTION |
| :--- | :--- | :--- |
| **LYRIC ENGINE** | 🟢 ACTIVE | Block-based editor with timestamps. |
| **AUDIO VAULT** | 🟡 PARTIAL | Playback implemented. Local file only. |
| **PROMPT INJ** | 🟢 ACTIVE | Creative obstruction library. |
| **IMP/EXP** | 🟢 ACTIVE | JSON Data portability. |

## ⚠️ KNOWN ANOMALIES
- **Mobile View:** Layout shifts on small screens.
- **Audio Persist:** Refreshes clear loaded audio (Browser limitation).

# CHANTEOS CONTEXT v0.1.0

## ⚡ SYSTEM STATUS
**VERSION:** 0.1.1 (Lean Prototype)
**STATE:** 🟢 CLEANED & OPTIMIZED
**DEPLOY:** LOCALHOST

## 🎯 OBJECTIVE
**NOT A NOTE-TAKING APP.**
A **Sonic Workspace** for structuring chaotic inspiration into cohesive lyrics.
- **Capture:** Immediate block-based lyric entry.
- **Structure:** Verse/Chorus/Bridge tagging.
- **Flow:** Audio playback integration (Local).

## 🛠️ TECHNICAL STACK
- **Runtime:** Vite + React 18
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS + Shadcn Elements
- **Data:** Local Storage / JSON Export
- **Audio:** Browser Audio API

## 🧩 MODULES STATUS (v0.1.0)
| MODULE | STATUS | DESCRIPTION |
| :--- | :--- | :--- |
| **LYRIC ENGINE** | 🟢 ACTIVE | Block-based editor with timestamps. |
| **AUDIO VAULT** | 🟡 PARTIAL | Playback + Opus conversion. Local file only. |
| **PROMPT INJ** | 🟢 ACTIVE | Creative obstruction library. |
| **IMP/EXP** | 🟢 ACTIVE | JSON Data portability. |
| **PTR** | 🟢 ACTIVE | Push-To-Rec: mic capture via long-press Play. |

## ⚠️ KNOWN ANOMALIES
- **Mobile View:** Layout shifts on small screens.
- **Audio Persist:** Refreshes clear loaded audio (Browser limitation).

## 📋 NEXT CYCLES
1.  **Refine UI:** Cruel optimization of screen real estate.
2.  **Audio Vis:** Waveform rendering for precision.
3.  **Local Persist:** IndexedDB implementation for audio safety.

## UI REFRESH v0.1.2
- Added Delete Confirmation Dialog for song deletion.
- Applied ARIA labels and semantic buttons throughout the app for accessibility.
- Memoized event handlers and optimized RhymePanel for better performance.
- Debounced localStorage writes to reduce UI lag.
- Consolidated Jules' PRs (#5 to #12).
- Scope: Visual refresh across list, editor, player, and rhyme panel. No functional behavior changes.
- Regression locks:
  - LyricLine and PromptLine now use strict visual height constraints to prevent accidental input height drift.
  - Audio player remains anchored in layout flow, outside scroll area, with keyboard-aware bottom offset on mobile.
- Rhyme panel:
  - Full slide-in/out coverage for panel width.
  - Dual horizontal lanes: Rhymes (top) and Context/Related (bottom), both horizontally scrollable.

## AUDIO OPTIMIZER v0.2.0
- Auto-converts any imported audio to **Opus/WebM** (native browser encoding, zero dependencies).
- ~10x size reduction vs WAV, superior quality vs MP3 at same bitrate.
- Conversion happens transparently on import via `audioConverter.ts`.
- Graceful fallback: if browser doesn't support Opus, stores raw file unchanged.
- Console logs original → converted size for debugging.

## PTR (Push To Rec) v0.2.0
- Long-press Play button (>120ms) = start recording from mic.
- Release = stop recording immediately. No toggle state.
- Short tap (<120ms) = normal play/pause behavior (unchanged).
- Circular 2-voice buffer (newest replaces oldest).
- Red halo animation on Play button + slider pulse when recording.
- Does NOT affect Loop/Cue state.
- Voice playback (mixing over maketa) = next iteration.

## VOICE PLAYBACK v0.3.0
- `useVoiceMixer` routes maketa + voices through shared `AudioContext`.
- `createMediaElementSource` captures HTMLAudioElement for mixing.
- Voices store `startTime` — the maketa timestamp when recording began.
- **Auto-sync**: voices auto-play when maketa reaches their recorded timestamp.
- Supports mid-voice seeking (calculates offset into voice buffer).
- Mic button = mute/unmute toggle (voices auto-play when enabled).
- Per-channel `GainNode` for independent volume.

## UX REFINEMENTS v0.3.1
- **API Key Visibility:** Added visibility toggle (Eye/EyeOff) for Gemini API key input in Settings.
- **Testing:** Added Vitest + Testing Library infrastructure for component verification.
