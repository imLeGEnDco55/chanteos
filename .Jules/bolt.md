## 2025-05-23 - SongEditor Optimization
**Learning:** The `SongEditor` component re-renders frequently (approx 4Hz) because it consumes `currentTime` from `useAudioPlayer` to update the `AudioPlayer` UI. This causes the entire lyrics list to be reconciled on every frame.
**Action:** Extracted the lyrics rendering logic into a memoized `LyricsList` component. This prevents the list items (which are many) from being diffed/re-rendered when `activeLineIndex` hasn't changed, significantly reducing the main thread work during playback.

## 2025-05-23 - Testing Environment
**Learning:** `bun test` fails with `Cannot find module 'react/jsx-dev-runtime'`. The project is configured for `vitest` via `pnpm test`.
**Action:** Always use `pnpm test` (or `vitest run`) for running tests in this repository.

## 2025-05-24 - SongEditor Dialog Re-renders
**Learning:** `SongEditor` re-renders every frame due to `currentTime` updates. Components like `PromptLibraryDialog` and `RhymePanel` were re-rendering unnecessarily because they received unstable callback references or new empty array references on each render.
**Action:** Memoized `PromptLibraryDialog` and used stable `NO_OP` and `EMPTY_ARRAY` constants for props passed to children of `SongEditor`. This prevents reconciliation of heavy sub-trees during playback.
