# CHANTEOS BLUEPRINT

## 📊 DATA STRATA

### 1. THE SONG (Unit of Truth)
```typescript
interface Song {
  id: string;          // UUID
  title: string;
  artist?: string;
  bpm?: number;
  key?: string;
  lyrics: LyricBlock[];
  audioUrl?: string;   // Blob URL (Temporary)
  createdAt: number;   // Unix Timestamp
  updatedAt: number;
}
```

### 2. THE BLOCK (Atom of Chaos)
```typescript
interface LyricBlock {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'note';
  content: string;
  timestamp?: number;  // Seconds relative to audio start
}
```

### 3. THE PROMPT (Creative Obstruction)
```typescript
interface Prompt {
  id: string;
  text: string;
  category: 'rhyme' | 'theme' | 'structure';
  tags: string[];
}
```

## 🌊 DATA FLOW

### INPUT VECTOR
1.  **User Init:** Create Song -> `useSongs` Hook.
2.  **Audio Inj:** File Upload -> Blob URL -> `SongEditor`.
3.  **Lyric Gen:** User Input -> Block Creation -> State Update.

### PERSISTENCE VECTOR (Local)
- **Primary:** `localStorage` (Metadata & Lyrics).
- **Volatile:** `Audio Blob` (Lost on reload).
- **Export:** `JSON` Dump (Backup method).

## 🏗️ COMPONENT ARCHITECTURE

```
[Index]
 ├── [SongList] (Grid View)
 │    ├── [NewSongDialog]
 │    └── [ImportDialog]
 └── [SongEditor] (Workspace)
      ├── [AudioPlayer] (Custom Controls)
      ├── [LyricCanvas] (Block Rendering)
      └── [PromptSidebar] (Inspiration Injection)
```
