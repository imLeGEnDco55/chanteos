## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.

## 2026-02-14 - File Input Accessibility & Usability
**Learning:** Hidden file inputs (`display: none`) triggered by buttons often fail accessibility checks if the label isn't explicitly associated via `htmlFor`/`id`. Also, users get stuck if they select the wrong file without a clear "Remove" action.
**Action:** Always ensure hidden inputs have matching `id` and `htmlFor` on the label. Provide a visible "Clear" (X) button next to the filename once a file is selected to allow easy reset.
