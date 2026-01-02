/**
 * Tests for Simple AI Config Component
 * Requirements: 2.1, 2.2
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimpleAIConfig } from './SimpleAIConfig';

// Mock fetch globally
global.fetch = vi.fn();

describe('SimpleAIConfig', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockClear();
  });

  test('should render provider selection options', () => {
    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('阿里云 DashScope')).toBeInTheDocument();
    expect(screen.getByText('OpenAI DALL-E')).toBeInTheDocument();
    expect(screen.getByText('Stability AI')).toBeInTheDocument();
  });

  test('should render API key input field', () => {
    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByPlaceholderText('请输入您的 API Key')).toBeInTheDocument();
  });

  test('should load existing configuration on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        providers: [
          { id: 'dashscope', apiKey: 'sk-****1234' }
        ],
        activeProvider: 'dashscope'
      })
    });

    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config');
    });

    await waitFor(() => {
      expect(screen.getByText('sk-****1234')).toBeInTheDocument();
    });
  });

  test('should disable save button when no API key is provided and no existing key', () => {
    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const saveButton = screen.getByText('保存配置');
    expect(saveButton).toBeDisabled();
  });

  test('should enable save button when API key is provided', () => {
    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const apiKeyInput = screen.getByPlaceholderText('请输入您的 API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });

    const saveButton = screen.getByText('保存配置');
    expect(saveButton).not.toBeDisabled();
  });

  test('should call API to save configuration when save button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const apiKeyInput = screen.getByPlaceholderText('请输入您的 API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });

    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/v1/config', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('sk-test123')
      }));
    });
  });

  test('should show success message after successful save', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const apiKeyInput = screen.getByPlaceholderText('请输入您的 API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });

    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('配置保存成功！')).toBeInTheDocument();
    });
  });

  test('should show error message when save fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid API key' })
    });

    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const apiKeyInput = screen.getByPlaceholderText('请输入您的 API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'invalid-key' } });

    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid API key')).toBeInTheDocument();
    });
  });

  test('should change provider selection', () => {
    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const openaiOption = screen.getByLabelText(/OpenAI DALL-E/);
    fireEvent.click(openaiOption);

    // The OpenAI option should be selected
    expect(openaiOption.querySelector('input')).toBeChecked();
  });

  test('should handle network errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <SimpleAIConfig
        language="cn"
        isDarkMode={false}
        onClose={mockOnClose}
      />
    );

    const apiKeyInput = screen.getByPlaceholderText('请输入您的 API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'sk-test123' } });

    const saveButton = screen.getByText('保存配置');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('网络错误，请检查连接')).toBeInTheDocument();
    });
  });
});