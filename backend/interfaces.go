package main

import "context"

// ImageProvider defines the interface for AI image generation providers
type ImageProvider interface {
	// GenerateImage generates images based on the request
	GenerateImage(ctx context.Context, req *GenerateRequest) (*GenerateResponse, error)
	
	// GetModels returns available models for this provider
	GetModels() []string
	
	// GetSizeOptions returns available size options for this provider
	GetSizeOptions() []string
	
	// ValidateConfig validates the provider configuration
	ValidateConfig(config map[string]interface{}) error
	
	// ParseResponse parses the provider's response into standard format
	ParseResponse(body []byte) (*GenerateResponse, error)
	
	// GetProviderInfo returns basic information about the provider
	GetProviderInfo() ProviderInfo
}

// ConfigManager defines the interface for configuration management
type ConfigManager interface {
	// LoadConfig loads configuration from storage
	LoadConfig() (*Configuration, error)
	
	// SaveConfig saves configuration to storage
	SaveConfig(config *Configuration) error
	
	// GetProviderConfig gets configuration for a specific provider
	GetProviderConfig(providerID string) (*ProviderConfig, error)
	
	// SetProviderConfig sets configuration for a specific provider
	SetProviderConfig(providerID string, config map[string]interface{}) error
	
	// GetActiveProvider returns the currently active provider ID
	GetActiveProvider() string
	
	// SetActiveProvider sets the active provider
	SetActiveProvider(providerID string) error
}

// FileManager defines the interface for file operations
type FileManager interface {
	// SaveImageFile saves an image file to the specified path
	SaveImageFile(imageData []byte, filename string, path string) error
	
	// GetImageFile retrieves an image file by ID
	GetImageFile(id string) ([]byte, error)
	
	// DeleteImageFile deletes an image file
	DeleteImageFile(id string) error
	
	// ListImageFiles lists all saved image files
	ListImageFiles() ([]string, error)
}