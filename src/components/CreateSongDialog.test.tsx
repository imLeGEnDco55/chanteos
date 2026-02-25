import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CreateSongDialog } from './CreateSongDialog';

// Mock dialog
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
}));

describe('CreateSongDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onCreateSong: vi.fn(),
  };

  it('renders correctly', () => {
    render(<CreateSongDialog {...defaultProps} />);
    expect(screen.getByText('Nueva Canción')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
  });

  it('clears file selection when clear button is clicked', async () => {
    render(<CreateSongDialog {...defaultProps} />);

    // Check initial state: "Seleccionar archivo de audio" button visible
    expect(screen.getByText('Seleccionar archivo de audio')).toBeInTheDocument();

    // Verify accessibility: Label should be associated with input
    // Since input is hidden, we can find it by label text if association is correct
    // However, some testing libraries might complain about visibility.
    // Let's try to get the input associated with the label.
    const input = screen.getByLabelText(/Audio \(opcional\)/i);
    expect(input).toBeInTheDocument();

    // Simulate file selection
    const file = new File(['audio content'], 'test-audio.mp3', { type: 'audio/mp3' });
    fireEvent.change(input, { target: { files: [file] } });

    // Check if file name is displayed
    await waitFor(() => {
        expect(screen.getByText('test-audio.mp3')).toBeInTheDocument();
    });

    // "Seleccionar archivo de audio" should be gone
    expect(screen.queryByText('Seleccionar archivo de audio')).not.toBeInTheDocument();

    // Verify clear button exists
    const clearButton = screen.getByLabelText('Quitar archivo');
    expect(clearButton).toBeInTheDocument();

    // Click clear button
    fireEvent.click(clearButton);

    // Verify file name is gone
    expect(screen.queryByText('test-audio.mp3')).not.toBeInTheDocument();

    // "Seleccionar archivo de audio" should be back
    expect(screen.getByText('Seleccionar archivo de audio')).toBeInTheDocument();
  });
});
