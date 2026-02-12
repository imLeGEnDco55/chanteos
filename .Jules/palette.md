## 2024-05-24 - The Nested Interactive Element Trap
**Learning:** Wrapping complex card components in a single `onClick` handler (or making the whole card a button) creates accessibility nightmares when nested actions (like dropdowns) are present. Screen readers struggle with nested interactive elements, and keyboard navigation becomes ambiguous.
**Action:** Default to the "Split Action Card" pattern:
1. Make the primary content area a distinct `<button>` (e.g., `flex-1`).
2. Keep secondary actions (menus, icons) as siblings to the primary button.
3. Use a wrapper `div` (not button) to group them visually.
