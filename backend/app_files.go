package backend

import (
	"encoding/base64"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	"image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"bytes"

	wailsruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

// File Management Methods

// GetUserDownloadDir returns the user's Download directory path
func (a *App) GetUserDownloadDir() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("failed to get user home directory: %w", err)
	}

	// Platform-specific Download directory
	downloadDir := filepath.Join(homeDir, "Downloads")

	// Ensure directory exists
	if err := os.MkdirAll(downloadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create download directory: %w", err)
	}

	return downloadDir, nil
}

// ReadImageFile reads an image file from local path and returns base64 encoded data
func (a *App) ReadImageFile(filePath string) (string, error) {
	// Read file
	data, err := os.ReadFile(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to read image file: %w", err)
	}

	// Determine content type from file extension
	ext := strings.ToLower(filepath.Ext(filePath))
	contentType := "image/png" // default
	switch ext {
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".webp":
		contentType = "image/webp"
	case ".gif":
		contentType = "image/gif"
	case ".png":
		contentType = "image/png"
	}

	// Encode to base64
	base64Data := fmt.Sprintf("data:%s;base64,%s", contentType, base64.StdEncoding.EncodeToString(data))
	return base64Data, nil
}

// SaveImageFile saves an image file to the user's chosen location using a save dialog
// The dialog opens in the user's Download directory by default
func (a *App) SaveImageFile(imageData []byte, defaultFilename string) error {
	if a.ctx == nil {
		return fmt.Errorf("application context not available")
	}

	// Get Download directory as default location
	downloadDir, err := a.GetUserDownloadDir()
	if err != nil {
		// Fallback to current directory if Download directory is not available
		downloadDir = "."
	}

	// Show save dialog with Download directory as default
	filePath, err := wailsruntime.SaveFileDialog(a.ctx, wailsruntime.SaveDialogOptions{
		DefaultFilename:  defaultFilename,
		DefaultDirectory: downloadDir,
		Title:            "Save Image",
		Filters: []wailsruntime.FileFilter{
			{
				DisplayName: "Image Files",
				Pattern:     "*.png;*.jpg;*.jpeg;*.gif;*.webp",
			},
			{
				DisplayName: "PNG Images",
				Pattern:     "*.png",
			},
			{
				DisplayName: "JPEG Images",
				Pattern:     "*.jpg;*.jpeg",
			},
		},
	})

	if err != nil {
		return fmt.Errorf("failed to show save dialog: %w", err)
	}

	// User cancelled the dialog
	if filePath == "" {
		return fmt.Errorf("save operation cancelled by user")
	}

	// Ensure directory exists
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Write file
	if err := os.WriteFile(filePath, imageData, 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// SelectReferenceImages opens a dialog for the user to select reference images
// Returns a list of base64 encoded strings
func (a *App) SelectReferenceImages(multiSelect bool) ([]string, error) {
	if a.ctx == nil {
		return nil, fmt.Errorf("application context not available")
	}

	// Get Download directory as default location
	downloadDir, err := a.GetUserDownloadDir()
	if err != nil {
		downloadDir = "."
	}

	// Show open dialog
	filePaths, err := wailsruntime.OpenMultipleFilesDialog(a.ctx, wailsruntime.OpenDialogOptions{
		DefaultDirectory: downloadDir,
		Title:            "Select Reference Images",
		Filters: []wailsruntime.FileFilter{
			{
				DisplayName: "Image Files",
				Pattern:     "*.png;*.jpg;*.jpeg;*.gif;*.webp",
			},
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to open file dialog: %w", err)
	}

	if len(filePaths) == 0 {
		return []string{}, nil
	}

	// Read files and convert to base64
	var images []string
	for _, path := range filePaths {
		base64Data, err := a.ReadImageFile(path)
		if err != nil {
			fmt.Printf("Warning: Failed to read image file %s: %v\n", path, err)
			continue
		}
		images = append(images, base64Data)
	}

	return images, nil
}

// downloadImage helper to download and save an image to AppData/images
func (a *App) downloadImage(url string) (string, error) {
	resp, err := http.Get(url)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to download: status %d", resp.StatusCode)
	}

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	// Determine extension
	ext := ".png"
	contentType := resp.Header.Get("Content-Type")
	if strings.Contains(contentType, "jpeg") || strings.Contains(contentType, "jpg") {
		ext = ".jpg"
	}

	filename := fmt.Sprintf("img_%d%s", time.Now().UnixNano(), ext)

	// Get AppDir
	configDir, _ := os.UserConfigDir() // Error handled in OnStartup usually, but re-check
	appDir := filepath.Join(configDir, "SparkPrompt", "images")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", err
	}

	localPath := filepath.Join(appDir, filename)
	if err := os.WriteFile(localPath, data, 0644); err != nil {
		return "", err
	}

	return localPath, nil
}

// persistImage saves a remote URL or Data URI to the local images directory, converting to PNG
func (a *App) persistImage(imageURL string) (string, error) {
	var imageData []byte

	// 1. Get Raw Data
	if strings.HasPrefix(imageURL, "data:") {
		// Parse data URI
		parts := strings.Split(imageURL, ",")
		if len(parts) != 2 {
			return "", fmt.Errorf("invalid data URI")
		}
		// Decode base64
		decoded, err := base64.StdEncoding.DecodeString(parts[1])
		if err != nil {
			return "", fmt.Errorf("failed to decode base64 data: %w", err)
		}
		imageData = decoded
	} else {
		// Download image from URL
		resp, err := http.Get(imageURL)
		if err != nil {
			return "", fmt.Errorf("failed to download image: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return "", fmt.Errorf("failed to download image: status code %d", resp.StatusCode)
		}

		// Read image data
		data, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("failed to read image data: %w", err)
		}
		imageData = data
	}

	// 2. Decode Image to check validity and prepare for PNG conversion
	img, format, err := image.Decode(bytes.NewReader(imageData))
	if err != nil {
		// Fallback: If we can't decode it (e.g. unknown format), should we fail?
		// User requested "only store png".
		return "", fmt.Errorf("failed to decode image (format: %s) for conversion to PNG: %w", format, err)
	}

	// 3. Generate filename and paths
	// Always use .png extension
	filename := fmt.Sprintf("ai_image_%d.png", time.Now().UnixNano())

	// Get executable directory for images folder
	execPath, err := os.Executable()
	var appDataDir string
	if err != nil {
		return "", fmt.Errorf("failed to get user config directory: %w", err)
	} else {
		execDir := filepath.Dir(execPath)
		appDataDir = filepath.Join(execDir, "images")
	}

	// Ensure images directory exists
	if err := os.MkdirAll(appDataDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create images directory: %w", err)
	}

	localPath := filepath.Join(appDataDir, filename)
	file, err := os.Create(localPath)
	if err != nil {
		return "", fmt.Errorf("failed to create image file: %w", err)
	}
	defer file.Close()

	// 4. Encode as PNG
	if err := png.Encode(file, img); err != nil {
		return "", fmt.Errorf("failed to save as PNG: %w", err)
	}

	return localPath, nil
}
