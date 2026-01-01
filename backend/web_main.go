//go:build web

package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	// Create API server
	server := NewAPIServer()

	// Start HTTP server
	port := ":8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = ":" + envPort
	}

	fmt.Printf("Starting web server on http://localhost%s\n", port)
	fmt.Println("Press Ctrl+C to stop the server")

	// Handle graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		fmt.Println("\nShutting down server...")
		server.Stop()
		os.Exit(0)
	}()

	// Start server
	if err := server.Start(port); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start HTTP server: %v", err)
	}
}
