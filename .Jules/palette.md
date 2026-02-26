## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.

## 2026-02-26 - Dynamic Input Accessibility
**Learning:** Inputs dynamically revealed within dialogs often lack visible labels due to space constraints, making them inaccessible to screen readers.
**Action:** Always use `aria-label` for these inputs to ensure they are announced correctly without cluttering the UI.
