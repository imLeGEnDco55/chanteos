## 2025-05-23 - SongEditor Optimization
**Learning:** The `SongEditor` component re-renders frequently (approx 4Hz) because it consumes `currentTime` from `useAudioPlayer` to update the `AudioPlayer` UI. This causes the entire lyrics list to be reconciled on every frame.
**Action:** Extracted the lyrics rendering logic into a memoized `LyricsList` component. This prevents the list items (which are many) from being diffed/re-rendered when `activeLineIndex` hasn't changed, significantly reducing the main thread work during playback.

## 2025-05-23 - Testing Environment
**Learning:** `bun test` fails with `Cannot find module 'react/jsx-dev-runtime'`. The project is configured for `vitest` via `pnpm test`.
**Action:** Always use `pnpm test` (or `vitest run`) for running tests in this repository.

## 2025-05-23 - Active Line Search Optimization
**Learning:** The `activeLineIndex` calculation in `SongEditor` was performing an O(N) scan of all lyrics on every playback frame (via `useMemo` dependency on `currentTime`). Even with memoization of the list component, the calculation itself runs frequently.
**Action:** Replaced the linear scan with a binary search (O(log N)) using a pre-sorted index of valid timestamps. This reduces the computational overhead of the `activeLineIndex` derivation, especially for longer songs.
