package main

import (
	"context"
	"fmt"
)

// ImageService handles image generation requests
type ImageService struct {
	configService *ConfigService
	providers     map[string]ImageProvider
}

// NewImageService creates a new image service
func NewImageService(configService *ConfigService) *ImageService {
	service := &ImageService{
		configService: configService,
		providers:     make(map[string]ImageProvider),
	}
	
	// Register available providers
	service.registerProviders()
	
	return service
}

// registerProviders registers all available image providers
func (s *ImageService) registerProviders() {
	// Register DashScope provider
	dashscopeProvider := NewDashScopeProvider(s.configService)
	s.providers[dashscopeProvider.GetProviderInfo().ID] = dashscopeProvider
}

// GenerateImage generates images using the specified provider
func (s *ImageService) GenerateImage(ctx context.Context, req *GenerateRequest) (*GenerateResponse, error) {
	// Validate request
	if req.Prompt == "" {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "INVALID_REQUEST",
				Message:  "Prompt is required",
				Provider: "system",
			},
		}, nil
	}
	
	if req.Count < 1 || req.Count > 10 {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "INVALID_REQUEST",
				Message:  "Count must be between 1 and 10",
				Provider: "system",
			},
		}, nil
	}
	
	// Use active provider if not specified
	providerID := req.Provider
	if providerID == "" {
		providerID = s.configService.GetActiveProvider()
	}
	
	// Get provider
	provider, exists := s.providers[providerID]
	if !exists {
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
	providers := make([]ProviderInfo, 0, len(s.providers))
	for _, provider := range s.providers {
		providers = append(providers, provider.GetProviderInfo())
	}
	return providers
}

// GetProvider returns a specific provider by ID
func (s *ImageService) GetProvider(providerID string) (ImageProvider, error) {
	provider, exists := s.providers[providerID]
	if !exists {
		return nil, fmt.Errorf("provider %s not found", providerID)
	}
	return provider, nil
}