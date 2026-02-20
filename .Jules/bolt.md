## 2025-05-23 - SongEditor Optimization
**Learning:** The `SongEditor` component re-renders frequently (approx 4Hz) because it consumes `currentTime` from `useAudioPlayer` to update the `AudioPlayer` UI. This causes the entire lyrics list to be reconciled on every frame.
**Action:** Extracted the lyrics rendering logic into a memoized `LyricsList` component. This prevents the list items (which are many) from being diffed/re-rendered when `activeLineIndex` hasn't changed, significantly reducing the main thread work during playback.

## 2025-05-23 - Testing Environment
**Learning:** `bun test` fails with `Cannot find module 'react/jsx-dev-runtime'`. The project is configured for `vitest` via `pnpm test`.
**Action:** Always use `pnpm test` (or `vitest run`) for running tests in this repository.

## 2025-05-23 - Lazy Audio Loading
**Learning:** Loading all audio blobs from IndexedDB into memory on startup (creating Blob URLs) scales poorly and causes high initial memory usage.
**Action:** Refactored `useSongs` to lazy-load audio data only when a song is selected using `loadSongAudio(id)`. This keeps the initial load lightweight and reduces memory pressure.
