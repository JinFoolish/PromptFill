package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"spark-prompt/backend"
)

// Embed the frontend assets
//
//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := backend.NewApp()

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
		Frameless:        true,              // Frameless window
		DisableResize:    false,             // Allow resize
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 0}, // Transparent background to let CSS handle it
		Bind:             []interface{}{app},                       // Bind App methods to frontend
		OnStartup:        app.OnStartup,
		OnDomReady:       app.OnDomReady,
		OnBeforeClose:    app.OnBeforeClose,
		OnShutdown:       app.OnShutdown,
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
