package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// handleGenerate handles image generation requests
func (s *APIServer) handleGenerate(c *gin.Context) {
	var req GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "INVALID_REQUEST",
				Message:  err.Error(),
				Provider: "system",
			},
		})
		return
	}

	// Generate images
	response, err := s.imageService.GenerateImage(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "INTERNAL_ERROR",
				Message:  err.Error(),
				Provider: "system",
			},
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// handleGetConfig handles configuration retrieval
func (s *APIServer) handleGetConfig(c *gin.Context) {
	providers := s.configService.GetAllProviders()
	activeProvider := s.configService.GetActiveProvider()

	response := ConfigResponse{
		Providers:      providers,
		ActiveProvider: activeProvider,
	}

	c.JSON(http.StatusOK, response)
}

// handleSetConfig handles configuration updates
func (s *APIServer) handleSetConfig(c *gin.Context) {
	var req ConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Update provider configuration
	if err := s.configService.SetProviderConfig(req.Provider, req.Config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// Set as active provider if specified
	if activeProvider, ok := req.Config["setActive"].(bool); ok && activeProvider {
		if err := s.configService.SetActiveProvider(req.Provider); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}

// handleGetProviders handles provider information requests
func (s *APIServer) handleGetProviders(c *gin.Context) {
	providers := s.imageService.GetProviders()

	response := ProvidersResponse{
		Providers: providers,
	}

	c.JSON(http.StatusOK, response)
}

// handleSaveFile handles file save requests
func (s *APIServer) handleSaveFile(c *gin.Context) {
	var req SaveFileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	// For now, just return success
	// File saving will be implemented in later tasks
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File save functionality will be implemented in later tasks",
	})
}

// handleGetFile handles file retrieval requests
func (s *APIServer) handleGetFile(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File ID is required",
		})
		return
	}

	// For now, just return not found
	// File retrieval will be implemented in later tasks
	c.JSON(http.StatusNotFound, gin.H{
		"error": "File retrieval functionality will be implemented in later tasks",
	})
}

// handleReloadConfig handles configuration reload requests
func (s *APIServer) handleReloadConfig(c *gin.Context) {
	if err := s.configService.ReloadConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Failed to reload configuration: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Configuration reloaded successfully",
	})
}

// handleCreateBackup handles configuration backup creation
func (s *APIServer) handleCreateBackup(c *gin.Context) {
	if err := s.configService.createBackup(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Failed to create backup: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Configuration backup created successfully",
		"backupPath": s.configService.GetBackupPath(),
	})
}

// handleRestoreBackup handles configuration restoration from backup
func (s *APIServer) handleRestoreBackup(c *gin.Context) {
	config, err := s.configService.RestoreFromBackup()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Failed to restore from backup: %v", err),
		})
		return
	}

	if err := s.configService.SaveConfig(config); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Failed to save restored configuration: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Configuration restored from backup successfully",
	})
}

// handleValidateConfig handles configuration validation requests
func (s *APIServer) handleValidateConfig(c *gin.Context) {
	var config Configuration
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Invalid configuration format: %v", err),
		})
		return
	}

	if err := s.configService.ValidateConfig(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Configuration validation failed: %v", err),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Configuration is valid",
	})
}
