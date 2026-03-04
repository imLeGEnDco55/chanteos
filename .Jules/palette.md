## 2026-02-14 - Sensitive Data Visibility
**Learning:** Users often need to verify API keys or passwords after pasting. Hiding them by default is secure, but frustrating without a toggle.
**Action:** Always include a visibility toggle (Eye/EyeOff) for long, complex secrets like API keys to reduce user friction during setup.
## 2026-03-04 - [Clear File Action UX]
**Learning:** Replacing a button text with the selected file name hides the primary action and forces users to cancel and reopen dialogs to clear state. Showing the selected file alongside a dedicated clear action improves flow.
**Action:** When a file is selected, display its name in a container with a dedicated 'Clear' ('X') button instead of overwriting the upload button text. Reset the file input value on clear so users can re-select the same file without issue.
