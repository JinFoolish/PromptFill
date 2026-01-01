# Platform File Manager

The Platform File Manager provides unified file management functionality across Web and Desktop platforms for the AI Image Generation application.

## Features

- **Cross-platform compatibility**: Works seamlessly on both Web and Desktop (Wails) platforms
- **Automatic platform detection**: Automatically selects the appropriate implementation
- **File saving**: Save images with platform-appropriate dialogs
- **Clipboard operations**: Copy images to system clipboard (when supported)
- **Input validation**: Validates image blobs and filenames
- **Error handling**: Comprehensive error handling with user-friendly messages

## Requirements Fulfilled

- **3.1**: File save operations with "另存为" functionality
- **3.2**: Clipboard operations with "复制图片" functionality  
- **3.3**: File dialog integration for desktop version
- **8.3**: Consistent functionality across Web and Desktop platforms

## Usage

### Basic Usage

```javascript
import fileManager from './utils/fileManager.js';

// Save an image file
const imageBlob = new Blob([imageData], { type: 'image/png' });
const filename = 'my-image.png';

try {
  await fileManager.saveImageFile(imageBlob, filename);
  console.log('Image saved successfully');
} catch (error) {
  console.error('Save failed:', error.message);
}
```

### Copy to Clipboard

```javascript
// Copy image to clipboard (if supported)
try {
  await fileManager.copyImageToClipboard(imageBlob);
  console.log('Image copied to clipboard');
} catch (error) {
  console.error('Clipboard operation failed:', error.message);
}
```

### Platform Detection

```javascript
const platform = fileManager.getPlatform(); // 'web' or 'desktop'
const capabilities = fileManager.getCapabilities();

console.log('Platform:', platform);
console.log('Supports save dialog:', capabilities.saveDialog);
console.log('Supports clipboard:', capabilities.clipboard);
```

### Advanced Usage with React Hook

```javascript
import { useFileManager } from './utils/fileManagerExample.js';

function ImageComponent() {
  const { platform, capabilities, saveImage, copyImage } = useFileManager();
  
  const handleSave = async () => {
    const result = await saveImage(imageBlob, 'generated-image.png');
    if (result.success) {
      alert('Image saved successfully!');
    } else {
      alert(`Save failed: ${result.error}`);
    }
  };
  
  return (
    <div>
      <button onClick={handleSave}>
        {capabilities.saveDialog ? 'Save As...' : 'Download'}
      </button>
      {capabilities.clipboard && (
        <button onClick={() => copyImage(imageBlob)}>
          Copy to Clipboard
        </button>
      )}
    </div>
  );
}
```

## Platform Differences

### Web Platform
- **File Saving**: Uses browser download mechanism
- **Clipboard**: Uses Clipboard API (requires HTTPS)
- **Save Dialog**: Not available (uses direct download)

### Desktop Platform (Wails)
- **File Saving**: Uses native save dialog
- **Clipboard**: Uses system clipboard via Wails API
- **Save Dialog**: Native file dialog with filters

## API Reference

### UnifiedFileManager

#### Methods

- `getPlatform()`: Returns current platform ('web' or 'desktop')
- `getCapabilities()`: Returns platform capabilities object
- `saveImageFile(blob, filename)`: Save image file
- `copyImageToClipboard(blob)`: Copy image to clipboard
- `showSaveDialog(defaultName)`: Show save dialog (desktop) or return default name (web)
- `generateFilename(prompt, provider, extension)`: Generate appropriate filename
- `validateImageBlob(blob)`: Validate image blob format and size

#### Capabilities Object

```javascript
{
  saveDialog: boolean,    // Native save dialog support
  clipboard: boolean,     // Clipboard operations support
  directSave: boolean     // Direct file saving support
}
```

## Error Handling

The file manager provides comprehensive error handling:

```javascript
try {
  await fileManager.saveImageFile(blob, filename);
} catch (error) {
  if (error.message.includes('not supported')) {
    // Platform doesn't support this operation
  } else if (error.message.includes('cancelled')) {
    // User cancelled the operation
  } else if (error.message.includes('Invalid')) {
    // Invalid input data
  } else {
    // Other errors
  }
}
```

## Backend Integration (Desktop)

The desktop version requires corresponding Go methods in the Wails backend:

```go
// SaveImageFile saves an image using native save dialog
func (a *App) SaveImageFile(imageData []byte, defaultFilename string) error

// CopyImageToClipboard copies image to system clipboard  
func (a *App) CopyImageToClipboard(imageData []byte, mimeType string) error

// ShowSaveDialog shows native save dialog
func (a *App) ShowSaveDialog(defaultFilename string) (string, error)
```

## Testing

Run tests with:

```bash
npm test fileManager.test.js
```

The test suite covers:
- Platform detection
- Web platform functionality
- Desktop platform functionality (mocked)
- Unified manager behavior
- Input validation
- Error handling

## File Structure

```
src/utils/
├── fileManager.js          # Main file manager implementation
├── fileManager.test.js     # Test suite
├── fileManagerExample.js   # Usage examples and helpers
└── FILE_MANAGER_README.md  # This documentation
```

## Notes

- The clipboard functionality on desktop is simplified and may need platform-specific libraries for full image clipboard support
- File size validation limits images to 50MB maximum
- Generated filenames are sanitized to remove special characters
- Temporary files are automatically cleaned up after clipboard operations