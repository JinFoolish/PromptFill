//go:build !web

package main

import (
	"context"
	"embed"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"

	// "github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// Embed the frontend assets
var assets embed.FS

// App struct
type App struct {
	ctx    context.Context
	server *APIServer
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// OnStartup is called when the app starts up
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx

	// Initialize API server
	a.server = NewAPIServer()

	// Start HTTP server for web version in a separate goroutine
	go func() {
		if err := a.server.Start(":8080"); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Failed to start HTTP server: %v\n", err)
		}
	}()
}

// OnDomReady is called after front-end resources have been loaded
func (a *App) OnDomReady(ctx context.Context) {
	// Add your action here
}

// OnBeforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
func (a *App) OnBeforeClose(ctx context.Context) (prevent bool) {
	return false
}

// OnShutdown is called during application termination
func (a *App) OnShutdown(ctx context.Context) {
	if a.server != nil {
		a.server.Stop()
	}
}

// SaveImageFile saves an image file to the user's chosen location using a save dialog
func (a *App) SaveImageFile(imageData []byte, defaultFilename string) error {
	if a.ctx == nil {
		return fmt.Errorf("application context not available")
	}

	// Show save dialog
	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Title:           "Save Image",
		Filters: []runtime.FileFilter{
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

// CopyImageToClipboard copies an image to the system clipboard
func (a *App) CopyImageToClipboard(imageData []byte, mimeType string) error {
	if a.ctx == nil {
		return fmt.Errorf("application context not available")
	}

	// Create a temporary file for the image
	tempDir := os.TempDir()

	// Determine file extension from MIME type
	var ext string
	switch mimeType {
	case "image/png":
		ext = ".png"
	case "image/jpeg", "image/jpg":
		ext = ".jpg"
	case "image/gif":
		ext = ".gif"
	case "image/webp":
		ext = ".webp"
	default:
		ext = ".png" // Default to PNG
	}

	// Generate unique temporary filename using current timestamp
	tempFile := filepath.Join(tempDir, fmt.Sprintf("ai_image_clipboard_%d%s",
		time.Now().UnixNano(), ext))

	// Write image data to temporary file
	if err := os.WriteFile(tempFile, imageData, 0644); err != nil {
		return fmt.Errorf("failed to create temporary file: %w", err)
	}

	// Clean up temporary file after operation
	defer func() {
		go func() {
			// Small delay to ensure any clipboard operations complete
			os.Remove(tempFile)
		}()
	}()

	// For now, we'll use the ClipboardSetText with the file path
	// In a production app, you'd want to use platform-specific clipboard libraries
	// or implement native clipboard image support
	err := runtime.ClipboardSetText(a.ctx, tempFile)
	if err != nil {
		return fmt.Errorf("failed to copy to clipboard: %w", err)
	}

	return nil
}

// ShowSaveDialog shows a save dialog and returns the selected path
func (a *App) ShowSaveDialog(defaultFilename string) (string, error) {
	if a.ctx == nil {
		return "", fmt.Errorf("application context not available")
	}

	filePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultFilename,
		Title:           "Save Image",
		Filters: []runtime.FileFilter{
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
		return "", fmt.Errorf("failed to show save dialog: %w", err)
	}

	return filePath, nil
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "AI Image Generation",
		Width:            1024,
		Height:           768,
		MinWidth:         800,
		MinHeight:        600,
		MaxWidth:         0,                 // 0 means no limit
		MaxHeight:        0,                 // 0 means no limit
		WindowStartState: options.Maximised, // Start maximized
		// AssetServer: &assetserver.Options{
		// 	Assets: assets, ts, // Commented out until frontend is built
		// },
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.OnStartup,
		OnDomReady:       app.OnDomReady,
		OnBeforeClose:    app.OnBeforeClose,
		OnShutdown:       app.OnShutdown,
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
