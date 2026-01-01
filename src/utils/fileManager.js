/**
 * Platform File Manager for AI Image Generation
 * 
 * This module provides unified file management functionality across Web and Desktop platforms.
 * It handles image saving, clipboard operations, and file dialogs with platform-specific implementations.
 * 
 * Requirements: 3.1, 3.2, 3.3, 8.3
 */

/**
 * Platform detection utility
 * @returns {string} 'web' or 'desktop'
 */
function detectPlatform() {
  // Check if we're running in a Wails environment
  if (typeof window !== 'undefined' && window.go && window.go.main) {
    return 'desktop';
  }
  return 'web';
}

/**
 * Abstract interface for platform-specific file operations
 */
class PlatformFileManager {
  /**
   * Save an image file to the user's chosen location
   * @param {Blob} blob - Image blob data
   * @param {string} filename - Default filename
   * @returns {Promise<void>}
   */
  async saveImageFile(blob, filename) {
    throw new Error('saveImageFile must be implemented by platform-specific class');
  }

  /**
   * Copy an image to the system clipboard
   * @param {Blob} blob - Image blob data
   * @returns {Promise<void>}
   */
  async copyImageToClipboard(blob) {
    throw new Error('copyImageToClipboard must be implemented by platform-specific class');
  }

  /**
   * Show a save dialog and return the selected path
   * @param {string} defaultName - Default filename
   * @returns {Promise<string|null>} Selected path or null if cancelled
   */
  async showSaveDialog(defaultName) {
    throw new Error('showSaveDialog must be implemented by platform-specific class');
  }

  /**
   * Get platform-specific capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return {
      saveDialog: false,
      clipboard: false,
      directSave: false
    };
  }
}

/**
 * Web platform implementation using browser APIs
 */
class WebFileManager extends PlatformFileManager {
  constructor() {
    super();
    this.capabilities = {
      saveDialog: false, // Web uses download instead
      clipboard: 'clipboard' in navigator && 'write' in navigator.clipboard,
      directSave: true // Via download
    };
  }

  /**
   * Save image file using browser download mechanism
   * @param {Blob} blob - Image blob data
   * @param {string} filename - Default filename
   * @returns {Promise<void>}
   */
  async saveImageFile(blob, filename) {
    try {
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element for download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to save image file: ${error.message}`);
    }
  }

  /**
   * Copy image to clipboard using Clipboard API
   * @param {Blob} blob - Image blob data
   * @returns {Promise<void>}
   */
  async copyImageToClipboard(blob) {
    if (!this.capabilities.clipboard) {
      throw new Error('Clipboard API is not supported in this browser');
    }

    try {
      // Create ClipboardItem with the image blob
      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });
      
      // Write to clipboard
      await navigator.clipboard.write([clipboardItem]);
    } catch (error) {
      // Fallback: try copying as PNG if the original format fails
      if (blob.type !== 'image/png') {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
          });
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(async (pngBlob) => {
            try {
              const clipboardItem = new ClipboardItem({
                'image/png': pngBlob
              });
              await navigator.clipboard.write([clipboardItem]);
            } catch (fallbackError) {
              throw new Error(`Failed to copy image to clipboard: ${fallbackError.message}`);
            }
          }, 'image/png');
          
          URL.revokeObjectURL(img.src);
        } catch (fallbackError) {
          throw new Error(`Failed to copy image to clipboard: ${error.message}`);
        }
      } else {
        throw new Error(`Failed to copy image to clipboard: ${error.message}`);
      }
    }
  }

  /**
   * Web platform doesn't support native save dialogs
   * @param {string} defaultName - Default filename
   * @returns {Promise<string|null>}
   */
  async showSaveDialog(defaultName) {
    // Web platform uses direct download, so we return the default name
    return defaultName;
  }

  /**
   * Get web platform capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return this.capabilities;
  }
}

/**
 * Desktop platform implementation using Wails APIs
 */
class DesktopFileManager extends PlatformFileManager {
  constructor() {
    super();
    this.capabilities = {
      saveDialog: true,
      clipboard: true,
      directSave: true
    };
  }

  /**
   * Save image file using Wails file dialog
   * @param {Blob} blob - Image blob data
   * @param {string} filename - Default filename
   * @returns {Promise<void>}
   */
  async saveImageFile(blob, filename) {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Call Wails backend to save file
      if (window.go && window.go.main && window.go.main.App && window.go.main.App.SaveImageFile) {
        await window.go.main.App.SaveImageFile(Array.from(uint8Array), filename);
      } else {
        throw new Error('Wails SaveImageFile API not available');
      }
    } catch (error) {
      throw new Error(`Failed to save image file: ${error.message}`);
    }
  }

  /**
   * Copy image to clipboard using Wails clipboard API
   * @param {Blob} blob - Image blob data
   * @returns {Promise<void>}
   */
  async copyImageToClipboard(blob) {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Call Wails backend to copy to clipboard
      if (window.go && window.go.main && window.go.main.App && window.go.main.App.CopyImageToClipboard) {
        await window.go.main.App.CopyImageToClipboard(Array.from(uint8Array), blob.type);
      } else {
        throw new Error('Wails CopyImageToClipboard API not available');
      }
    } catch (error) {
      throw new Error(`Failed to copy image to clipboard: ${error.message}`);
    }
  }

  /**
   * Show native save dialog using Wails
   * @param {string} defaultName - Default filename
   * @returns {Promise<string|null>} Selected path or null if cancelled
   */
  async showSaveDialog(defaultName) {
    try {
      if (window.go && window.go.main && window.go.main.App && window.go.main.App.ShowSaveDialog) {
        const result = await window.go.main.App.ShowSaveDialog(defaultName);
        return result || null;
      } else {
        throw new Error('Wails ShowSaveDialog API not available');
      }
    } catch (error) {
      throw new Error(`Failed to show save dialog: ${error.message}`);
    }
  }

  /**
   * Get desktop platform capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return this.capabilities;
  }
}

/**
 * Unified file manager that automatically selects the appropriate platform implementation
 */
class UnifiedFileManager {
  constructor() {
    this.platform = detectPlatform();
    this.manager = this.platform === 'desktop' 
      ? new DesktopFileManager() 
      : new WebFileManager();
  }

  /**
   * Get the current platform
   * @returns {string} 'web' or 'desktop'
   */
  getPlatform() {
    return this.platform;
  }

  /**
   * Get platform capabilities
   * @returns {Object} Capabilities object
   */
  getCapabilities() {
    return this.manager.getCapabilities();
  }

  /**
   * Save an image file with platform-appropriate method
   * @param {Blob} blob - Image blob data
   * @param {string} filename - Default filename
   * @returns {Promise<void>}
   */
  async saveImageFile(blob, filename) {
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('Invalid blob provided');
    }
    
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename provided');
    }

    return await this.manager.saveImageFile(blob, filename);
  }

  /**
   * Copy an image to the system clipboard
   * @param {Blob} blob - Image blob data
   * @returns {Promise<void>}
   */
  async copyImageToClipboard(blob) {
    if (!blob || !(blob instanceof Blob)) {
      throw new Error('Invalid blob provided');
    }

    const capabilities = this.getCapabilities();
    if (!capabilities.clipboard) {
      throw new Error('Clipboard functionality is not supported on this platform');
    }

    return await this.manager.copyImageToClipboard(blob);
  }

  /**
   * Show a save dialog (desktop) or return default name (web)
   * @param {string} defaultName - Default filename
   * @returns {Promise<string|null>} Selected path or null if cancelled
   */
  async showSaveDialog(defaultName) {
    if (!defaultName || typeof defaultName !== 'string') {
      throw new Error('Invalid default name provided');
    }

    return await this.manager.showSaveDialog(defaultName);
  }

  /**
   * Generate a default filename for an image
   * @param {string} prompt - Generation prompt (optional)
   * @param {string} provider - AI provider name (optional)
   * @param {string} extension - File extension (default: 'png')
   * @returns {string} Generated filename
   */
  generateFilename(prompt = '', provider = '', extension = 'png') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    let filename = `ai-image-${timestamp}`;
    
    if (provider) {
      filename += `-${provider}`;
    }
    
    if (prompt) {
      // Clean prompt for filename (remove special characters, limit length)
      const cleanPrompt = prompt
        .replace(/[^a-zA-Z0-9\s\u4e00-\u9fff]/g, '') // Keep alphanumeric, spaces, and Chinese characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .slice(0, 50); // Limit length
      
      if (cleanPrompt) {
        filename += `-${cleanPrompt}`;
      }
    }
    
    return `${filename}.${extension}`;
  }

  /**
   * Validate image blob format and size
   * @param {Blob} blob - Image blob to validate
   * @returns {Object} Validation result
   */
  validateImageBlob(blob) {
    const result = {
      valid: true,
      errors: []
    };

    if (!blob || !(blob instanceof Blob)) {
      result.valid = false;
      result.errors.push('Invalid blob object');
      return result;
    }

    // Check if it's an image
    if (!blob.type.startsWith('image/')) {
      result.valid = false;
      result.errors.push('Blob is not an image');
    }

    // Check size (limit to 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (blob.size > maxSize) {
      result.valid = false;
      result.errors.push(`Image size (${Math.round(blob.size / 1024 / 1024)}MB) exceeds maximum allowed size (50MB)`);
    }

    // Check minimum size (1KB)
    const minSize = 1024; // 1KB
    if (blob.size < minSize) {
      result.valid = false;
      result.errors.push('Image size is too small (minimum 1KB)');
    }

    return result;
  }
}

// Create and export singleton instance
const fileManager = new UnifiedFileManager();

export default fileManager;

// Export individual classes for testing
export {
  PlatformFileManager,
  WebFileManager,
  DesktopFileManager,
  UnifiedFileManager,
  detectPlatform
};

/**
 * Type definitions for TypeScript compatibility
 * 
 * @typedef {Object} PlatformCapabilities
 * @property {boolean} saveDialog - Whether platform supports native save dialogs
 * @property {boolean} clipboard - Whether platform supports clipboard operations
 * @property {boolean} directSave - Whether platform supports direct file saving
 * 
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string[]} errors - Array of validation error messages
 */