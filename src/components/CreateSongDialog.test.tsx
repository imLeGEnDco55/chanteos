import { render, screen, fireEvent } from '@testing-library/react';
import { CreateSongDialog } from './CreateSongDialog';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock ResizeObserver for Dialog
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CreateSongDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onCreateSong: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<CreateSongDialog {...defaultProps} />);
    expect(screen.getByText('Nueva Canción')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar archivo de audio')).toBeInTheDocument();
  });

  it('allows file selection and shows file name', async () => {
    render(<CreateSongDialog {...defaultProps} />);

    const file = new File(['(⌐□_□)'], 'test-audio.mp3', { type: 'audio/mp3' });
    // Radix Dialog renders in a portal, so we need to search the document body
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test-audio.mp3')).toBeInTheDocument();
    expect(screen.queryByText('Seleccionar archivo de audio')).not.toBeInTheDocument();
  });

  it('allows clearing the selected file', async () => {
    render(<CreateSongDialog {...defaultProps} />);

    // Select file first
    const file = new File(['(⌐□_□)'], 'test-audio.mp3', { type: 'audio/mp3' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test-audio.mp3')).toBeInTheDocument();

    // Find and click the remove button
    // Note: This button doesn't exist yet, so this part of the test will fail if run now.
    // I am writing the test to anticipate the feature.
    const removeButton = screen.getByLabelText('Eliminar archivo seleccionado');
    fireEvent.click(removeButton);

    // Verify file is removed
    expect(screen.queryByText('test-audio.mp3')).not.toBeInTheDocument();
    expect(screen.getByText('Seleccionar archivo de audio')).toBeInTheDocument();

    // Verify input value is cleared
    expect(input.value).toBe('');
  });
});
