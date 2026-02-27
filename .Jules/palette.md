## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.

## 2026-02-14 - Navigation Accessibility
**Learning:** Icon-only navigation buttons (Back, Menu) in immersive editors are invisible to screen readers without explicit labels.
**Action:** Always add `aria-label` to header icon buttons (e.g., "Volver", "Opciones") to ensure users can navigate out of the editor view.
