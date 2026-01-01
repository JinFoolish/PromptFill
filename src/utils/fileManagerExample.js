/**
 * Example usage of the Platform File Manager
 * 
 * This file demonstrates how to use the file manager in the AI image generation application.
 * Requirements: 3.1, 3.2, 3.3, 8.3
 */

import fileManager from './fileManager.js';

/**
 * Example: Save generated image with user interaction
 */
export async function saveGeneratedImage(imageBlob, prompt, provider) {
  try {
    // Validate the image blob first
    const validation = fileManager.validateImageBlob(imageBlob);
    if (!validation.valid) {
      throw new Error(`Invalid image: ${validation.errors.join(', ')}`);
    }

    // Generate a default filename
    const defaultFilename = fileManager.generateFilename(prompt, provider, 'png');
    
    // Check platform capabilities
    const capabilities = fileManager.getCapabilities();
    
    if (capabilities.saveDialog) {
      // Desktop: Show save dialog
      const selectedPath = await fileManager.showSaveDialog(defaultFilename);
      if (selectedPath) {
        await fileManager.saveImageFile(imageBlob, selectedPath);
        console.log(`Image saved to: ${selectedPath}`);
      } else {
        console.log('Save operation cancelled by user');
      }
    } else {
      // Web: Direct download
      await fileManager.saveImageFile(imageBlob, defaultFilename);
      console.log(`Image downloaded as: ${defaultFilename}`);
    }
  } catch (error) {
    console.error('Failed to save image:', error.message);
    throw error;
  }
}

/**
 * Example: Copy image to clipboard
 */
export async function copyImageToClipboard(imageBlob) {
  try {
    // Check if clipboard is supported
    const capabilities = fileManager.getCapabilities();
    if (!capabilities.clipboard) {
      throw new Error('Clipboard functionality is not supported on this platform');
    }

    // Validate the image blob
    const validation = fileManager.validateImageBlob(imageBlob);
    if (!validation.valid) {
      throw new Error(`Invalid image: ${validation.errors.join(', ')}`);
    }

    await fileManager.copyImageToClipboard(imageBlob);
    console.log('Image copied to clipboard successfully');
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error.message);
    throw error;
  }
}

/**
 * Example: Handle multiple file operations for batch generation
 */
export async function handleBatchImageSave(images, prompts, provider) {
  const results = [];
  
  for (let i = 0; i < images.length; i++) {
    const imageBlob = images[i];
    const prompt = prompts[i] || 'Generated Image';
    
    try {
      const filename = fileManager.generateFilename(
        `${prompt} (${i + 1})`, 
        provider, 
        'png'
      );
      
      await fileManager.saveImageFile(imageBlob, filename);
      results.push({
        index: i,
        success: true,
        filename: filename
      });
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Example: Platform-aware UI component helper
 */
export function getFileOperationButtons() {
  const capabilities = fileManager.getCapabilities();
  const platform = fileManager.getPlatform();
  
  return {
    platform: platform,
    buttons: [
      {
        id: 'save',
        label: capabilities.saveDialog ? 'Save As...' : 'Download',
        icon: capabilities.saveDialog ? 'save' : 'download',
        available: true
      },
      {
        id: 'copy',
        label: 'Copy to Clipboard',
        icon: 'copy',
        available: capabilities.clipboard
      },
      {
        id: 'saveToHistory',
        label: 'Save to History',
        icon: 'history',
        available: true
      }
    ].filter(button => button.available)
  };
}

/**
 * Example: Error handling wrapper
 */
export async function safeFileOperation(operation, ...args) {
  try {
    return await operation(...args);
  } catch (error) {
    // Log error for debugging
    console.error('File operation failed:', error);
    
    // Return user-friendly error message
    if (error.message.includes('not supported')) {
      return {
        success: false,
        error: 'This operation is not supported on your platform'
      };
    } else if (error.message.includes('cancelled')) {
      return {
        success: false,
        error: 'Operation cancelled by user'
      };
    } else if (error.message.includes('Invalid')) {
      return {
        success: false,
        error: 'Invalid file format or data'
      };
    } else {
      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
    }
  }
}

/**
 * Example: React component integration helper
 */
export function useFileManager() {
  const platform = fileManager.getPlatform();
  const capabilities = fileManager.getCapabilities();
  
  const saveImage = async (blob, filename) => {
    return safeFileOperation(fileManager.saveImageFile.bind(fileManager), blob, filename);
  };
  
  const copyImage = async (blob) => {
    return safeFileOperation(fileManager.copyImageToClipboard.bind(fileManager), blob);
  };
  
  const showSaveDialog = async (defaultName) => {
    return safeFileOperation(fileManager.showSaveDialog.bind(fileManager), defaultName);
  };
  
  return {
    platform,
    capabilities,
    saveImage,
    copyImage,
    showSaveDialog,
    generateFilename: fileManager.generateFilename.bind(fileManager),
    validateBlob: fileManager.validateImageBlob.bind(fileManager)
  };
}

// Export the file manager instance for direct use
export { fileManager };