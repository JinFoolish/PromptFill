package backend

import (
	"context"
	"embed"
	"fmt"
	"os"
	"path/filepath"
)

//go:embed json/*
var defaultConfigFS embed.FS

// App struct - flattened design with direct method implementation
type App struct {
	ctx            context.Context
	configPath     string
	historyPath    string
	templatesPath  string
	banksPath      string
	categoriesPath string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// OnStartup is called when the app starts up
func (a *App) OnStartup(ctx context.Context) {
	a.ctx = ctx

	// Get user config directory
	configDir, err := os.UserConfigDir()
	if err != nil {
		// Fallback to current directory
		wd, _ := os.Getwd()
		configDir = wd
	}

	appDir := filepath.Join(configDir, "SparkPrompt")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		fmt.Printf("Warning: Failed to create app directory: %v\n", err)
	}

	// Ensure subdirectories exist
	if err := os.MkdirAll(filepath.Join(appDir, "json"), 0755); err != nil {
		fmt.Printf("Warning: Failed to create json directory: %v\n", err)
	}

	a.configPath = filepath.Join(appDir, "json", "config.json")
	a.historyPath = filepath.Join(appDir, "json", "ai-history.json")
	a.templatesPath = filepath.Join(appDir, "json", "templates.json")
	a.banksPath = filepath.Join(appDir, "json", "banks.json")
	a.categoriesPath = filepath.Join(appDir, "json", "categories.json")
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
	// Cleanup if needed
}
