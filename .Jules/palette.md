## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.

## 2026-02-19 - Accessible Card Lists
**Learning:** Nested interactive elements (like dropdowns inside clickable cards) break accessibility if the parent is a clickable `div`. The "Overlay Button" pattern (absolute, full-size button + `pointer-events-none` on content) solves this elegantly.
**Action:** Use the overlay button pattern for list items with secondary actions. Ensure secondary actions have higher z-index and `pointer-events-auto`.
