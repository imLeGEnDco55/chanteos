## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.

## 2026-02-20 - Contextual Confirmations
**Learning:** Generic "Are you sure?" dialogs are risky for destructive actions. Users often click without reading.
**Action:** Always inject the specific item name (e.g., "Delete 'My Song'?") into the confirmation message to force a cognitive check.
