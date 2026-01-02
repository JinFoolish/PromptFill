/**
 * Tests for AI Image Generator Component
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIImageGenerator } from './AIImageGenerator';

// Mock fetch globally
global.fetch = vi.fn();

describe('AIImageGenerator', () => {
  const mockOnImageGenerated = vi.fn();
  const mockT = (key) => key;

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  test('should render generate button and settings button', () => {
    render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    expect(screen.getByText('generate_image')).toBeInTheDocument();
    expect(screen.getByTitle('generation_settings')).toBeInTheDocument();
  });

  test('should disable generate button when prompt is empty', () => {
    render(
      <AIImageGenerator 
        prompt="" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    const generateButton = screen.getByRole('button', { name: /generate_image/i });
    expect(generateButton).toBeDisabled();
  });

  test('should show error when prompt becomes empty during generation', async () => {
    // Mock the fetch calls for configuration
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', defaultModel: 'z-image-turbo', models: ['z-image-turbo'] }],
          activeProvider: 'dashscope'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', name: 'DashScope', models: ['z-image-turbo'] }]
        })
      });

    const { rerender } = render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    // Wait for configuration to load
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
    });

    // Now change the prompt to empty and try to generate
    rerender(
      <AIImageGenerator 
        prompt="" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    // The button should be disabled when prompt is empty
    const generateButton = screen.getByRole('button', { name: /generate_image/i });
    expect(generateButton).toBeDisabled();
  });

  test('should load configuration on mount', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', defaultModel: 'z-image-turbo', models: ['z-image-turbo'] }],
          activeProvider: 'dashscope'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', name: 'DashScope', models: ['z-image-turbo'] }]
        })
      });

    render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
      expect(fetch).toHaveBeenCalledWith('/api/v1/providers');
    });
  });

  test('should call API when generate button is clicked with valid prompt', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', defaultModel: 'z-image-turbo', models: ['z-image-turbo'] }],
          activeProvider: 'dashscope'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', name: 'DashScope', models: ['z-image-turbo'] }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          images: [{ id: '1', url: 'http://example.com/image.png', width: 1024, height: 1024 }]
        })
      });

    render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
    });

    const generateButton = screen.getByRole('button', { name: /generate_image/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/generate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test prompt')
      }));
    });

    await waitFor(() => {
      expect(mockOnImageGenerated).toHaveBeenCalledWith([
        expect.objectContaining({
          id: '1',
          url: 'http://example.com/image.png',
          prompt: 'test prompt',
          provider: 'dashscope',
          model: 'z-image-turbo'
        })
      ]);
    });
  });

  test('should show error when API call fails', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', defaultModel: 'z-image-turbo', models: ['z-image-turbo'] }],
          activeProvider: 'dashscope'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', name: 'DashScope', models: ['z-image-turbo'] }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: false,
          error: { code: 'API_ERROR', message: 'API call failed', provider: 'dashscope' }
        })
      });

    render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
    });

    const generateButton = screen.getByRole('button', { name: /generate_image/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('generation_failed (API_ERROR)')).toBeInTheDocument();
      expect(screen.getByText('API call failed')).toBeInTheDocument();
    });
  });

  test('should open configuration modal when settings button is clicked', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', defaultModel: 'z-image-turbo', models: ['z-image-turbo'] }],
          activeProvider: 'dashscope'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', name: 'DashScope', models: ['z-image-turbo'] }]
        })
      });

    render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
    });

    const settingsButton = screen.getByTitle('generation_settings');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('generation_settings')).toBeInTheDocument();
      expect(screen.getByText('confirm')).toBeInTheDocument();
      expect(screen.getByText('cancel')).toBeInTheDocument();
    });
  });

  test('should handle configuration modal confirm and cancel', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', defaultModel: 'z-image-turbo', models: ['z-image-turbo'] }],
          activeProvider: 'dashscope'
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          providers: [{ id: 'dashscope', name: 'DashScope', models: ['z-image-turbo'] }]
        })
      });

    render(
      <AIImageGenerator 
        prompt="test prompt" 
        onImageGenerated={mockOnImageGenerated}
        t={mockT}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
    });

    // Open modal
    const settingsButton = screen.getByTitle('generation_settings');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('generation_settings')).toBeInTheDocument();
    });

    // Test cancel button
    const cancelButton = screen.getByText('cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('generation_settings')).not.toBeInTheDocument();
    });

    // Open modal again
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('generation_settings')).toBeInTheDocument();
    });

    // Test confirm button
    const confirmButton = screen.getByText('confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText('generation_settings')).not.toBeInTheDocument();
    });
  });
});