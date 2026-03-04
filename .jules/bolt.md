## 2024-03-04 - Optimize derived state in high-frequency render paths
**Learning:** In components with high-frequency updates (like `SongEditor` reacting to audio time updates), calculating derived state using chained functional array methods (`filter`, `reduce`) causes unnecessary object allocations and iterations on every render, even when the underlying data (`song.lyrics`) hasn't changed.
**Action:** Replace chained array methods with a single imperative loop wrapped in `useMemo` for expensive or frequent derived state calculations to minimize overhead.
