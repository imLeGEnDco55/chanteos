## 2025-05-23 - SongEditor Optimization
**Learning:** The `SongEditor` component re-renders frequently (approx 4Hz) because it consumes `currentTime` from `useAudioPlayer` to update the `AudioPlayer` UI. This causes the entire lyrics list to be reconciled on every frame.
**Action:** Extracted the lyrics rendering logic into a memoized `LyricsList` component. This prevents the list items (which are many) from being diffed/re-rendered when `activeLineIndex` hasn't changed, significantly reducing the main thread work during playback.

## 2025-05-23 - Testing Environment
**Learning:** `bun test` fails with `Cannot find module 'react/jsx-dev-runtime'`. The project is configured for `vitest` via `pnpm test`.
**Action:** Always use `pnpm test` (or `vitest run`) for running tests in this repository.

## 2025-05-24 - RhymePanel & PromptLibraryDialog Optimization
**Learning:** `SongEditor` (and consequently `AudioPlayer`) re-renders at 60fps due to `currentTime` updates. Passing unstable props (like `[]` or `() => {}`) to memoized child components (`RhymePanel`, `PromptLibraryDialog`) causes them to re-render unnecessarily on every frame, wasting significant CPU cycles.
**Action:** Always define static `EMPTY_ARRAY` and `NO_OP` constants outside the component scope for default prop values, especially in components driven by high-frequency updates like audio players.
