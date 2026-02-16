import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SongList } from '../components/SongList';
import type { Song } from '../types/song';

// Mock ResizeObserver for ScrollArea
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Test Song',
    lyrics: [],
    updatedAt: Date.now(),
    createdAt: Date.now(),
    notes: '',
  }
];

describe('SongList Accessibility', () => {
  it('has accessible import button', () => {
    render(
      <SongList
        songs={mockSongs}
        onSelectSong={vi.fn()}
        onCreateSong={vi.fn()}
        onDeleteSong={vi.fn()}
        onImportSong={vi.fn()}
        prompts={[]}
        onAddPrompt={vi.fn()}
        onUpdatePrompt={vi.fn()}
        onDeletePrompt={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Importar proyecto')).toBeInTheDocument();
  });

  it('has accessible song menu button', () => {
    render(
      <SongList
        songs={mockSongs}
        onSelectSong={vi.fn()}
        onCreateSong={vi.fn()}
        onDeleteSong={vi.fn()}
        onImportSong={vi.fn()}
        prompts={[]}
        onAddPrompt={vi.fn()}
        onUpdatePrompt={vi.fn()}
        onDeletePrompt={vi.fn()}
      />
    );

    expect(screen.getAllByLabelText('Opciones de canción').length).toBeGreaterThan(0);
  });
});
