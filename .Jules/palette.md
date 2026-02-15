## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.

## 2026-02-15 - Split Action Card Pattern
**Learning:** Nested interactive controls (e.g., dropdown inside a card-button) violate accessibility rules. A single clickable card is elegant but fails with secondary actions.
**Action:** Use a "Split Action" structure: Wrap the primary content in a `<button>` and place secondary actions (menus) as siblings, maintaining the visual card style.
