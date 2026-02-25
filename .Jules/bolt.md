## 2025-05-23 - SongEditor Optimization
**Learning:** The `SongEditor` component re-renders frequently (approx 4Hz) because it consumes `currentTime` from `useAudioPlayer` to update the `AudioPlayer` UI. This causes the entire lyrics list to be reconciled on every frame.
**Action:** Extracted the lyrics rendering logic into a memoized `LyricsList` component. This prevents the list items (which are many) from being diffed/re-rendered when `activeLineIndex` hasn't changed, significantly reducing the main thread work during playback.

## 2025-05-23 - Testing Environment
**Learning:** `bun test` fails with `Cannot find module 'react/jsx-dev-runtime'`. The project is configured for `vitest` via `pnpm test`.
**Action:** Always use `pnpm test` (or `vitest run`) for running tests in this repository.

## 2025-05-23 - Audio Loop Re-renders
**Learning:** `SongEditor` re-renders on every audio frame (approx 60Hz) because it consumes `currentTime`. This causes ALL children to re-render unless memoized, and ALL inline calculations in the render body to run 60 times/sec.
**Action:** Memoized `totalSyllables` and `PromptLibraryDialog` to prevent wasted cycles. Future components must be memoized if they don't depend on `currentTime`.
