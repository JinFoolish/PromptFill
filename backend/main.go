package main

import (
	"context"
	"embed"
	"fmt"
	"net/http"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:dist
var assets embed.FS

// App struct
type App struct {
	ctx context.Context
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
		MaxWidth:         0, // 0 means no limit
		MaxHeight:        0, // 0 means no limit
		WindowStartState: options.Maximised, // Start maximized
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
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