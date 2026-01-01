package main

import (
	"context"
	"fmt"
)

// ImageService handles image generation requests
type ImageService struct {
	configService *ConfigService
	registry      *AdapterRegistry
	errorHandler  *ErrorHandler
}

// NewImageService creates a new image service
func NewImageService(configService *ConfigService) *ImageService {
	service := &ImageService{
		configService: configService,
		registry:      NewAdapterRegistry(),
		errorHandler:  NewErrorHandler(),
	}

	// Register available providers
	service.registerProviders()

	return service
}

// registerProviders registers all available image providers
func (s *ImageService) registerProviders() {
	// Register DashScope provider
	dashscopeProvider := NewDashScopeProvider(s.configService)
	if err := s.registry.RegisterProvider(dashscopeProvider); err != nil {
		fmt.Printf("Failed to register DashScope provider: %v\n", err)
	}
}

// GenerateImage generates images using the specified provider
func (s *ImageService) GenerateImage(ctx context.Context, req *GenerateRequest) (*GenerateResponse, error) {
	// Validate request
	if req.Prompt == "" {
		return &GenerateResponse{
			Success: false,
			Error:   s.errorHandler.HandleValidationError("prompt", "Prompt is required"),
		}, nil
	}

	if req.Count < 1 || req.Count > 10 {
		return &GenerateResponse{
			Success: false,
			Error:   s.errorHandler.HandleValidationError("count", "Count must be between 1 and 10"),
		}, nil
	}

	// Use active provider if not specified
	providerID := req.Provider
	if providerID == "" {
		providerID = s.configService.GetActiveProvider()
	}

	// Get provider
	provider, err := s.registry.GetProvider(providerID)
	if err != nil {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "PROVIDER_NOT_FOUND",
				Message:  fmt.Sprintf("Provider %s not found", providerID),
				Provider: "system",
			},
		}, nil
	}

	// Generate images
	return provider.GenerateImage(ctx, req)
}

// GetProviders returns information about all available providers
func (s *ImageService) GetProviders() []ProviderInfo {
	return s.registry.ListProviders()
}

// GetProvider returns a specific provider by ID
func (s *ImageService) GetProvider(providerID string) (ImageProvider, error) {
	return s.registry.GetProvider(providerID)
}
