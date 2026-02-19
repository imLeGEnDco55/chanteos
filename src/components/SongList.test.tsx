import { render, screen, fireEvent } from '@testing-library/react';
import { SongList } from './SongList';
import { vi, describe, it, expect } from 'vitest';
import type { Song } from '@/types/song';

// Mock child components to avoid complex rendering
vi.mock('./SettingsDialog', () => ({
  SettingsDialog: () => <button aria-label="Ajustes">Settings Mock</button>
}));

vi.mock('./DeleteConfirmationDialog', () => ({
  DeleteConfirmationDialog: () => <div data-testid="delete-dialog">Delete Dialog Mock</div>
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Music: () => <svg data-testid="icon-music" />,
  Plus: () => <svg data-testid="icon-plus" />,
  Trash2: () => <svg data-testid="icon-trash" />,
  MoreVertical: () => <svg data-testid="icon-more" />,
  Upload: () => <svg data-testid="icon-upload" />,
}));

// Mock DropdownMenu
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div role="button" aria-label="Opciones">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe('SongList', () => {
  const mockSong: Song = {
    id: '1',
    title: 'Test Song',
    audioFileName: 'test.mp3',
    audioData: '',
    lyrics: [],
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const defaultProps = {
    songs: [mockSong],
    onSelectSong: vi.fn(),
    onCreateSong: vi.fn(),
    onDeleteSong: vi.fn(),
    onImportSong: vi.fn(),
    prompts: [],
    onAddPrompt: vi.fn(),
    onUpdatePrompt: vi.fn(),
    onDeletePrompt: vi.fn(),
  };

  it('renders song list with items', () => {
    render(<SongList {...defaultProps} />);
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('test.mp3')).toBeInTheDocument();
  });

  it('renders upload button with accessible label', () => {
    render(<SongList {...defaultProps} />);
    // This test will fail initially until we add the aria-label
    // Currently relying on title="Importar Proyecto (.CHNT)"
    const uploadBtn = screen.getByTitle('Importar Proyecto (.CHNT)');
    expect(uploadBtn).toBeInTheDocument();
  });

  it('calls onSelectSong when clicking the song card', () => {
    render(<SongList {...defaultProps} />);

    // Verify accessibility improvement: selecting by aria-label
    const songButton = screen.getByLabelText('Abrir canción Test Song');
    expect(songButton).toBeInTheDocument();

    fireEvent.click(songButton);
    expect(defaultProps.onSelectSong).toHaveBeenCalledWith(mockSong);
  });
});
