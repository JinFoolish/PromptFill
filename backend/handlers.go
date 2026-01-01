package main

import (
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
	
	// Set default count if not specified
	if req.Count == 0 {
		req.Count = 1
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