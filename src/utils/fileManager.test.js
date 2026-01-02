/**
 * Tests for Platform File Manager
 * 
 * These tests verify the file management functionality across different platforms.
 * Requirements: 3.1, 3.2, 3.3, 8.3
 */

import { 
  detectPlatform, 
  WebFileManager, 
  DesktopFileManager, 
  UnifiedFileManager 
} from './fileManager.js';

// Mock Wails environment for testing
const mockWailsEnvironment = () => {
  global.window = {
    go: {
      main: {
        App: {
          SaveImageFile: vi.fn().mockResolvedValue(),
          CopyImageToClipboard: vi.fn().mockResolvedValue(),
          ShowSaveDialog: vi.fn().mockResolvedValue('/path/to/file.png')
        }
      }
    }
  };
};

// Mock web environment for testing
const mockWebEnvironment = () => {
  global.window = {};
  global.navigator = {
    clipboard: {
      write: vi.fn().mockResolvedValue()
    }
  };
  global.document = {
    createElement: vi.fn(() => ({
      click: vi.fn(),
      style: {}
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    }
  };
  global.URL = {
    createObjectURL: vi.fn(() => 'blob:mock-url'),
    revokeObjectURL: vi.fn()
  };
  global.ClipboardItem = vi.fn();
};

describe('Platform Detection', () => {
  beforeEach(() => {
    // Reset global window
    delete global.window;
  });

  test('should detect desktop platform when Wails is available', () => {
    mockWailsEnvironment();
    expect(detectPlatform()).toBe('desktop');
  });

  test('should detect web platform when Wails is not available', () => {
    mockWebEnvironment();
    expect(detectPlatform()).toBe('web');
  });

  test('should detect web platform when window is undefined', () => {
    expect(detectPlatform()).toBe('web');
  });
});

describe('WebFileManager', () => {
  let webManager;
  let mockBlob;

  beforeEach(() => {
    mockWebEnvironment();
    webManager = new WebFileManager();
    mockBlob = new Blob(['test image data'], { type: 'image/png' });
  });

  test('should have correct capabilities', () => {
    const capabilities = webManager.getCapabilities();
    expect(capabilities.saveDialog).toBe(false);
    expect(capabilities.directSave).toBe(true);
  });

  test('should save image file using download mechanism', async () => {
    const mockAnchor = {
      click: vi.fn(),
      style: {},
      href: '',
      download: ''
    };
    
    document.createElement.mockReturnValue(mockAnchor);

    await webManager.saveImageFile(mockBlob, 'test.png');

    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toBe('test.png');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  test('should copy image to clipboard when supported', async () => {
    await webManager.copyImageToClipboard(mockBlob);

    expect(ClipboardItem).toHaveBeenCalledWith({
      'image/png': mockBlob
    });
    expect(navigator.clipboard.write).toHaveBeenCalled();
  });

  test('should return default name for save dialog', async () => {
    const result = await webManager.showSaveDialog('test.png');
    expect(result).toBe('test.png');
  });
});

describe('DesktopFileManager', () => {
  let desktopManager;
  let mockBlob;

  beforeEach(() => {
    mockWailsEnvironment();
    desktopManager = new DesktopFileManager();
    mockBlob = new Blob(['test image data'], { type: 'image/png' });
  });

  test('should have correct capabilities', () => {
    const capabilities = desktopManager.getCapabilities();
    expect(capabilities.saveDialog).toBe(true);
    expect(capabilities.clipboard).toBe(true);
    expect(capabilities.directSave).toBe(true);
  });

  test('should save image file using Wails API', async () => {
    // Mock arrayBuffer method
    mockBlob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

    await desktopManager.saveImageFile(mockBlob, 'test.png');

    expect(window.go.main.App.SaveImageFile).toHaveBeenCalled();
  });

  test('should copy image to clipboard using Wails API', async () => {
    // Mock arrayBuffer method
    mockBlob.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));

    await desktopManager.copyImageToClipboard(mockBlob);

    expect(window.go.main.App.CopyImageToClipboard).toHaveBeenCalled();
  });

  test('should show save dialog using Wails API', async () => {
    const result = await desktopManager.showSaveDialog('test.png');

    expect(window.go.main.App.ShowSaveDialog).toHaveBeenCalledWith('test.png');
    expect(result).toBe('/path/to/file.png');
  });
});

describe('UnifiedFileManager', () => {
  let unifiedManager;
  let mockBlob;

  beforeEach(() => {
    mockBlob = new Blob(['test image data'], { type: 'image/png' });
  });

  test('should use WebFileManager for web platform', () => {
    mockWebEnvironment();
    unifiedManager = new UnifiedFileManager();
    
    expect(unifiedManager.getPlatform()).toBe('web');
    expect(unifiedManager.manager).toBeInstanceOf(WebFileManager);
  });

  test('should use DesktopFileManager for desktop platform', () => {
    mockWailsEnvironment();
    unifiedManager = new UnifiedFileManager();
    
    expect(unifiedManager.getPlatform()).toBe('desktop');
    expect(unifiedManager.manager).toBeInstanceOf(DesktopFileManager);
  });

  test('should validate image blob correctly', () => {
    mockWebEnvironment();
    unifiedManager = new UnifiedFileManager();

    // Create a proper mock blob with image type and sufficient size
    const imageData = new Array(2048).fill('x').join(''); // Create 2KB of data
    const imageBlob = new Blob([imageData], { type: 'image/png' });

    // Valid blob
    const validResult = unifiedManager.validateImageBlob(imageBlob);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Invalid blob (not an image)
    const textBlob = new Blob(['text'], { type: 'text/plain' });
    const invalidResult = unifiedManager.validateImageBlob(textBlob);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors).toContain('Blob is not an image');

    // Null blob
    const nullResult = unifiedManager.validateImageBlob(null);
    expect(nullResult.valid).toBe(false);
    expect(nullResult.errors).toContain('Invalid blob object');
  });

  test('should generate appropriate filenames', () => {
    mockWebEnvironment();
    unifiedManager = new UnifiedFileManager();

    // Basic filename
    const basic = unifiedManager.generateFilename();
    expect(basic).toMatch(/^ai-image-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);

    // With provider
    const withProvider = unifiedManager.generateFilename('', 'openai');
    expect(withProvider).toContain('-openai');

  });

  test('should throw error for invalid inputs', async () => {
    mockWebEnvironment();
    unifiedManager = new UnifiedFileManager();

    // Invalid blob
    await expect(unifiedManager.saveImageFile(null, 'test.png'))
      .rejects.toThrow('Invalid blob provided');

    // Invalid filename
    await expect(unifiedManager.saveImageFile(mockBlob, null))
      .rejects.toThrow('Invalid filename provided');

    // Invalid clipboard blob
    await expect(unifiedManager.copyImageToClipboard(null))
      .rejects.toThrow('Invalid blob provided');

    // Invalid save dialog name
    await expect(unifiedManager.showSaveDialog(null))
      .rejects.toThrow('Invalid default name provided');
  });
});

describe('Integration Tests', () => {
  test('should handle platform switching correctly', () => {
    // Start with web environment
    mockWebEnvironment();
    let manager = new UnifiedFileManager();
    expect(manager.getPlatform()).toBe('web');

    // Switch to desktop environment
    mockWailsEnvironment();
    manager = new UnifiedFileManager();
    expect(manager.getPlatform()).toBe('desktop');
  });

  test('should maintain consistent API across platforms', () => {
    const webManager = new WebFileManager();
    const desktopManager = new DesktopFileManager();

    // Both should have the same methods
    const methods = ['saveImageFile', 'copyImageToClipboard', 'showSaveDialog', 'getCapabilities'];
    
    methods.forEach(method => {
      expect(typeof webManager[method]).toBe('function');
      expect(typeof desktopManager[method]).toBe('function');
    });
  });
});