import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsDialog } from './SettingsDialog';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock hooks
vi.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    apiKey: 'test-api-key',
    model: 'gemini-2.0-flash',
    saveSettings: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: vi.fn(),
  }),
}));

// Mock ResizeObserver for Dialog
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('SettingsDialog', () => {
  const defaultProps = {
    prompts: [],
    onAddPrompt: vi.fn(),
    onUpdatePrompt: vi.fn(),
    onDeletePrompt: vi.fn(),
  };

  it('renders API key input as password by default', () => {
    render(<SettingsDialog {...defaultProps} />);

    // Open dialog
    const trigger = screen.getByLabelText('Ajustes');
    fireEvent.click(trigger);

    const input = screen.getByLabelText(/Google Gemini API Key/i);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('toggles API key visibility when button is clicked', () => {
    render(<SettingsDialog {...defaultProps} />);

    // Open dialog
    const trigger = screen.getByLabelText('Ajustes');
    fireEvent.click(trigger);

    const input = screen.getByLabelText(/Google Gemini API Key/i);
    const toggleButton = screen.getByLabelText('Mostrar clave API');

    // Default state
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Mostrar clave API')).toBeInTheDocument();

    // Click to show
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Ocultar clave API')).toBeInTheDocument();

    // Click to hide
    const hideButton = screen.getByLabelText('Ocultar clave API');
    fireEvent.click(hideButton);
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Mostrar clave API')).toBeInTheDocument();
  });
});
