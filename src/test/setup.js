import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = vi.fn();

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock ClipboardItem
global.ClipboardItem = vi.fn();

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    write: vi.fn(),
    writeText: vi.fn(),
  },
  writable: true,
});

// Mock window.go for Wails
global.window.go = {
  main: {
    App: {
      SaveImageFile: vi.fn(),
      CopyImageToClipboard: vi.fn(),
      ShowSaveDialog: vi.fn(),
    },
  },
};