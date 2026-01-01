package main

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// APIServer handles HTTP API requests
type APIServer struct {
	router        *gin.Engine
	server        *http.Server
	imageService  *ImageService
	configService *ConfigService
}

// NewAPIServer creates a new API server instance
func NewAPIServer() *APIServer {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Enable CORS for web version
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	configService := NewConfigService()
	imageService := NewImageService(configService)

	server := &APIServer{
		router:        router,
		imageService:  imageService,
		configService: configService,
	}

	server.setupRoutes()
	return server
}

// setupRoutes configures API routes
func (s *APIServer) setupRoutes() {
	api := s.router.Group("/api/v1")

	// Image generation endpoints
	api.POST("/generate", s.handleGenerate)

	// Configuration endpoints
	api.GET("/config", s.handleGetConfig)
	api.POST("/config", s.handleSetConfig)
	api.GET("/providers", s.handleGetProviders)
	api.POST("/config/reload", s.handleReloadConfig)
	api.POST("/config/backup", s.handleCreateBackup)
	api.POST("/config/restore", s.handleRestoreBackup)
	api.POST("/config/validate", s.handleValidateConfig)

	// File management endpoints
	api.POST("/files/save", s.handleSaveFile)
	api.GET("/files/:id", s.handleGetFile)

	// Health check
	api.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}

// Start starts the HTTP server
func (s *APIServer) Start(addr string) error {
	s.server = &http.Server{
		Addr:    addr,
		Handler: s.router,
	}
	return s.server.ListenAndServe()
}

// Stop gracefully stops the HTTP server
func (s *APIServer) Stop() error {
	if s.server == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	return s.server.Shutdown(ctx)
}
