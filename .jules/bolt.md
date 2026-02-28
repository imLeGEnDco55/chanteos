
## 2025-02-28 - Optimizing React re-renders in SongEditor
**Learning:** High-frequency updates from AudioPlayer (via timeupdate events) trigger re-renders in the parent SongEditor. Passing inline arrow functions (e.g. `() => {}`) or dynamic arrays (`|| []`) as props to memoized child components (`PromptLibraryDialog`, `AudioPlayer`) breaks their memoization because the prop references change on every render.
**Action:** Extract empty fallback arrays and no-op functions outside the component as static constants (`EMPTY_ARRAY`, `NO_OP`), and wrap handler functions in `useCallback` to maintain stable prop references and allow `React.memo` to work correctly on child components.
