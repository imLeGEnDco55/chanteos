# Changelog

Todas las iteraciones notables del proyecto.

## [0.2.0] - 2025-02-13

### Added
- **PTR (Push To Rec):** Grabación por long-press en Play. Red halo + slider pulse visual.
- **Synced Voice Playback:** Voces se reproducen automáticamente en el timestamp donde se grabaron (overdub real).
- **Voice Mixer:** AudioContext routing con GainNode por canal (maketa + voz).
- **Audio Optimizer:** Conversión automática WAV → Opus/WebM (~10x reducción). Skip para formatos comprimidos (MP3, AAC, OGG).
- **Toasts de conversión:** Progreso visual en-app para conversión de audio.
- **Version Chip:** Badge de versión en el header para verificar deploys.

### Fixed
- Race condition en PTR: `stopRequestedRef` previene grabación atascada cuando getUserMedia es async.

## [0.1.0] - 2025-02-12

### Added
- Lyric Engine: editor block-based con timestamps.
- Audio Vault: playback con loop A-B y Cue mode.
- Rhyme Panel: sugerencias via Gemini API.
- Prompt Library: biblioteca de prompts creativos.
- Import/Export: .CHNT y .TXT.
- PWA: instalable como app.
