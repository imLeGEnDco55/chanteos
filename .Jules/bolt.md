## 2025-05-23 - SongEditor Optimization
**Learning:** The `SongEditor` component re-renders frequently (approx 4Hz) because it consumes `currentTime` from `useAudioPlayer` to update the `AudioPlayer` UI. This causes the entire lyrics list to be reconciled on every frame.
**Action:** Extracted the lyrics rendering logic into a memoized `LyricsList` component. This prevents the list items (which are many) from being diffed/re-rendered when `activeLineIndex` hasn't changed, significantly reducing the main thread work during playback.

## 2025-05-23 - Testing Environment
**Learning:** `bun test` fails with `Cannot find module 'react/jsx-dev-runtime'`. The project is configured for `vitest` via `pnpm test`.
**Action:** Always use `pnpm test` (or `vitest run`) for running tests in this repository.

## 2025-05-23 - SongEditor Further Optimization
**Learning:** Even after memoizing `LyricsList`, the container `SongEditor` still re-rendered every frame due to `currentTime` updates, causing unnecessary VDOM diffing for static elements like the Header and Controls.
**Action:** Extracted `SongHeader` and `SongControls` into memoized components. This isolates the high-frequency re-renders to only the `AudioPlayer` and the `SongEditor` wrapper, skipping the diffing of static UI trees during playback.
