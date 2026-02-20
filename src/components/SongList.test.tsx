import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SongList } from './SongList';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Song, PromptTemplate } from '@/types/song';

// Mock SettingsDialog to avoid complex dependencies
vi.mock('./SettingsDialog', () => ({
  SettingsDialog: () => <div data-testid="settings-dialog">Settings Dialog</div>,
}));

// Mock DropdownMenu components to simplify interaction
// We render content directly so we can click "Eliminar" without opening the menu
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <button aria-label="Opciones">{children}</button>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

// Mock DeleteConfirmationDialog to verify props passed
vi.mock('./DeleteConfirmationDialog', () => ({
  DeleteConfirmationDialog: ({ open, description, onConfirm }: any) => (
    open ? (
      <div data-testid="delete-confirmation-dialog">
        <p data-testid="dialog-description">{description}</p>
        <button onClick={onConfirm}>Confirm Delete</button>
      </div>
    ) : null
  ),
}));

describe('SongList', () => {
  const mockSong: Song = {
    id: 'song-1',
    title: 'Test Song Title',
    audioFileName: 'audio.mp3',
    audioData: 'base64data',
    lyrics: [],
    notes: '',
    createdAt: 1000,
    updatedAt: 2000,
  };

  const mockPrompts: PromptTemplate[] = [];

  const defaultProps = {
    songs: [mockSong],
    onSelectSong: vi.fn(),
    onCreateSong: vi.fn(),
    onDeleteSong: vi.fn(),
    onImportSong: vi.fn(),
    prompts: mockPrompts,
    onAddPrompt: vi.fn(),
    onUpdatePrompt: vi.fn(),
    onDeletePrompt: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders song list correctly', () => {
    render(<SongList {...defaultProps} />);
    expect(screen.getByText('Test Song Title')).toBeInTheDocument();
  });

  it('opens delete confirmation with song title when delete is clicked', async () => {
    render(<SongList {...defaultProps} />);

    // Find the delete button (rendered by our mock DropdownMenuItem)
    const deleteButton = screen.getByText('Eliminar');
    fireEvent.click(deleteButton);

    // Verify dialog appears
    const dialog = screen.getByTestId('delete-confirmation-dialog');
    expect(dialog).toBeInTheDocument();

    // Verify description contains song title
    // Note: The description prop will be passed to our mock.
    // We expect something like "¿Estás seguro de que quieres eliminar 'Test Song Title'?"
    const description = screen.getByTestId('dialog-description');
    expect(description).toHaveTextContent(/Test Song Title/);
  });

  it('calls onDeleteSong with correct ID when confirmed', () => {
    render(<SongList {...defaultProps} />);

    // Click delete
    fireEvent.click(screen.getByText('Eliminar'));

    // Click confirm in dialog
    fireEvent.click(screen.getByText('Confirm Delete'));

    // Check callback
    expect(defaultProps.onDeleteSong).toHaveBeenCalledWith('song-1');
  });
});
