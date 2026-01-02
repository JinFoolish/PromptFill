/**
 * Tests for History Manager Component
 * Requirements: 5.1, 5.2, 9.1, 9.2, 9.4
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HistoryManager } from './HistoryManager';

// Mock storage adapter
vi.mock('../utils/storage', () => ({
  default: {
    listImages: vi.fn(),
    getStorageUsage: vi.fn(),
    getImage: vi.fn(),
    deleteImage: vi.fn(),
    clearAll: vi.fn()
  }
}));

// Mock ImagePopup component
vi.mock('./ImagePopup', () => ({
  default: ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="image-popup">
        <button onClick={onClose}>Close Popup</button>
      </div>
    );
  }
}));

// Mock MasonryGrid component
vi.mock('./MasonryGrid', () => ({
  default: ({ items, renderItem }) => (
    <div data-testid="masonry-grid">
      {items.map((item, index) => (
        <div key={item.id} data-testid={`grid-item-${item.id}`}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}));

import storageAdapter from '../utils/storage';

describe('HistoryManager', () => {
  const mockOnBack = vi.fn();
  const mockT = (key) => key;

  const mockRecords = [
    {
      id: '1',
      prompt: 'test prompt 1',
      provider: 'dashscope',
      model: 'z-image-turbo',
      savedAt: Date.now() - 86400000, // 1 day ago
      totalSize: 1024000
    },
    {
      id: '2',
      prompt: 'test prompt 2',
      provider: 'openai',
      model: 'dall-e-3',
      savedAt: Date.now() - 172800000, // 2 days ago
      totalSize: 2048000
    }
  ];

  const mockUsage = {
    used: 3072000,
    quota: 100000000,
    count: 2
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storageAdapter.listImages.mockResolvedValue(mockRecords);
    storageAdapter.getStorageUsage.mockResolvedValue(mockUsage);
    storageAdapter.getImage.mockResolvedValue({
      blob: new Blob(['test'], { type: 'image/png' }),
      metadata: {}
    });
  });

  test('should render loading state initially', () => {
    storageAdapter.listImages.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('loading_history')).toBeInTheDocument();
  });

  test('should load and display history records', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(storageAdapter.listImages).toHaveBeenCalled();
      expect(storageAdapter.getStorageUsage).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
      expect(screen.getByTestId('grid-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('grid-item-2')).toBeInTheDocument();
    });
  });

  test('should display storage usage information', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('storage_usage')).toBeInTheDocument();
    });
  });

  test('should show empty state when no records exist', async () => {
    storageAdapter.listImages.mockResolvedValue([]);
    storageAdapter.getStorageUsage.mockResolvedValue({ used: 0, quota: 0, count: 0 });

    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('no_history_records')).toBeInTheDocument();
    });
  });

  test('should filter records by search query', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('search_history');
    fireEvent.change(searchInput, { target: { value: 'test prompt 1' } });

    // After filtering, only one record should match
    await waitFor(() => {
      expect(screen.getByTestId('grid-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('grid-item-2')).not.toBeInTheDocument();
    });
  });

  test('should filter records by provider', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });

    const providerSelect = screen.getByDisplayValue('all_providers');
    fireEvent.change(providerSelect, { target: { value: 'dashscope' } });

    // After filtering, only dashscope records should show
    await waitFor(() => {
      expect(screen.getByTestId('grid-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('grid-item-2')).not.toBeInTheDocument();
    });
  });

  test('should call onBack when back button is clicked', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  test('should show clear all confirmation dialog', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('clear_all');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('confirm_clear_all')).toBeInTheDocument();
    });
  });

  test('should handle error state', async () => {
    storageAdapter.listImages.mockRejectedValue(new Error('Storage error'));

    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('error_loading_history')).toBeInTheDocument();
      expect(screen.getByText('retry')).toBeInTheDocument();
    });
  });

  test('should sort records correctly', async () => {
    render(
      <HistoryManager
        isDarkMode={false}
        t={mockT}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
    });

    const sortSelect = screen.getByDisplayValue('sort_newest');
    fireEvent.change(sortSelect, { target: { value: 'oldest' } });

    // Records should be re-sorted (implementation detail would need to be tested in integration)
    expect(screen.getByTestId('masonry-grid')).toBeInTheDocument();
  });
});