# STITCH PROMPTS - CHANTEOS REDESIGN

Here are the detailed prompts to use with Google Stitch (or any AI coding assistant) to generate the "Premium & Lightweight" UI for Chanteos.

## 🎨 GLOBAL STYLE RULES
(Copy this at the start of *every* prompt to ensure consistency)

```text
DESIGN SYSTEM: "Sonic Obsidian"
- Vibe: Professional Audio Tool, Dark Mode First, Distraction-Free.
- Colors: Background `bg-zinc-950`, Surfaces `bg-zinc-900`, Accents `text-violet-400` or `indigo-500`.
- Typography: Sans-serif (Inter/Geist), readable, varying weights for hierarchy.
- Shapes: `rounded-xl` for cards, `rounded-full` for buttons.
- Borders: Subtle, `border-white/5` or `border-white/10`.
- Tech Stack: React + Tailwind CSS + Lucide React Icons.
- Mobile Constraint: Touch targets must be min 44px. Safe areas for top/bottom.
```

---

## 1. PANTALLA PRINCIPAL (Home & Song List)

**Prompt:**
```text
Create the Main Dashboard component for a songwriting app called "Chanteos".
Appply the "Sonic Obsidian" design system.

Layout Requirements:
1. Header:
   - Left: App Name "Chanteos" (Bold, tracking-tight).
   - Right: 3 Actions:
     - Import Button (Icon: Upload, Ghost variant).
     - Settings Button (Icon: Settings, Ghost variant).
     - New Project Button (Icon: Plus, Primary Solid variant, rounded-full).

2. Content Area (Scrollable):
   - Empty State: If no projects, show a minimal illustration/icon (Music note) centered with "No songs yet" text and a "Create New" CTA.
   - Project List: Grid or List view of cards.
   - Card Design:
     - Minimal dark card (`bg-zinc-900/50` hover: `bg-zinc-900`).
     - Title (White, brave).
     - Metadata row (Gray text, small): Line count, Last edited date.
     - Audio Indicator: If audio exists, show small badge/icon.
     - Actions: Context menu (3-dots) on the right for "Delete".

3. Mobile Optimization:
   - Ensure header is sticky or fixed.
   - List must have padding-bottom to avoid cut-off.
```

---

## 2. PANTALLA DE PROYECTO (Song Editor & Player)

**Prompt:**
```text
Create the "Song Editor" interface for a mobile-first songwriting app.
Apply the "Sonic Obsidian" design system.

Layout Structure (Flex-col, h-screen):

1. Navigation Bar (Top):
   - Left: Back Chevron.
   - Center: Song Title Input (Transparent, centered text, looks like a heading) + Audio Filename (Tiny, subtitle below title).
   - Right: Menu Button (MoreVertical).

2. Lyrics Canvas (Middle, Scrollable):
   - A clean vertical list of text blocks.
   - Lyric Block: Simple text input, transparent background. To the left, a small timestamp (e.g., "0:12") if set.
   - Prompt Block: Different visual style (e.g., dashed border `border-violet-500/20`, subtle purple bg `bg-violet-500/5`) to distinguish from lyrics.
   - Active State: The current line playing should have a subtle glow or lighter background (`bg-white/5`).
   - Bottom Actions: Two wide buttons "Add Lyric" and "Add Prompt" side-by-side.

3. Player Control Bar (Bottom, Fixed):
   - Visual: Glassmorphism background (`backdrop-blur-md`, `bg-zinc-950/90`), top border (`border-white/10`).
   - Top Edge: Small "pull handle" or button to toggle "Rhyme Suggestions".
   - Progress Bar: Thin, interactive slider at the very top of the bar.
   - Controls Row (Flex, centered):
     - Prompt Lib Icon (Music/Library).
     - Undo Icon.
     - Skip Back (RotaryCcw-3).
     - Play/Pause (Huge, Central, Floating/Fab style, maybe `bg-white` text-black for contrast).
     - Skip Fwd (RotaryCw-3).
     - Loop Button (Cyclable states: Off (gray), Point A (yellow), A-B (green)).
     - Timestamp Button (Hash icon).
```

---

## 3. PANTALLA DE AJUSTES (Settings Dialog)

**Prompt:**
```text
Create a Settings Dialog overlay.
Apply the "Sonic Obsidian" design system.

Content:
1. Header: Title "Settings", Description "Configure your creative space".

2. Section "Appearance":
   - Row with Label "Dark Mode" and a Switch/Toggle.

3. Section "AI Intelligence (Gemini)":
   - Input field for "API Key" (Password type with show toggle).
   - Dropdown (Select) for "Model":
     - Gemini 2.0 Flash
     - Gemini 2.5 Flash Lite
     - Gemini 3 Flash Preview
   - Helper text explaining 2.5 is fastest.

4. Section "Creative Prompt Library":
   - Header with "Export JSON" button.
   - List of existing prompts (Scrollable).
   - Item Design: Compact row with Name + Delete button. Click to edit.
   - "Add New Prompt" button at the bottom.

5. Footer:
   - Credits text (small, muted): "Powered by Antigravity & Lovable".
```
