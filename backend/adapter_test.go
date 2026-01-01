package main

import (
	"testing"
)

func TestAdapterRegistry(t *testing.T) {
	registry := NewAdapterRegistry()

	// Test empty registry
	if registry.GetProviderCount() != 0 {
		t.Errorf("Expected empty registry, got %d providers", registry.GetProviderCount())
	}

	// Test provider registration
	configService := NewConfigService()
	provider := NewDashScopeProvider(configService)

	err := registry.RegisterProvider(provider)
	if err != nil {
		t.Errorf("Failed to register provider: %v", err)
	}

	// Test provider count
	if registry.GetProviderCount() != 1 {
		t.Errorf("Expected 1 provider, got %d", registry.GetProviderCount())
	}

	// Test provider retrieval
	retrievedProvider, err := registry.GetProvider("dashscope")
	if err != nil {
		t.Errorf("Failed to get provider: %v", err)
	}

	if retrievedProvider == nil {
		t.Error("Retrieved provider is nil")
	}

	// Test provider info
	info := retrievedProvider.GetProviderInfo()
	if info.ID != "dashscope" {
		t.Errorf("Expected provider ID 'dashscope', got '%s'", info.ID)
	}

	if info.Name != "阿里云百炼" {
		t.Errorf("Expected provider name '阿里云百炼', got '%s'", info.Name)
	}

	// Test provider existence check
	if !registry.HasProvider("dashscope") {
		t.Error("Registry should have dashscope provider")
	}

	if registry.HasProvider("nonexistent") {
		t.Error("Registry should not have nonexistent provider")
	}

	// Test list providers
	providers := registry.ListProviders()
	if len(providers) != 1 {
		t.Errorf("Expected 1 provider in list, got %d", len(providers))
	}

	if providers[0].ID != "dashscope" {
		t.Errorf("Expected first provider ID 'dashscope', got '%s'", providers[0].ID)
	}
}

func TestErrorHandler(t *testing.T) {
	handler := NewErrorHandler()

	// Test validation error
	validationError := handler.HandleValidationError("prompt", "Prompt is required")
	if validationError.Code != "VALIDATION_ERROR" {
		t.Errorf("Expected validation error code, got %s", validationError.Code)
	}

	if validationError.Provider != "system" {
		t.Errorf("Expected system provider, got %s", validationError.Provider)
	}

	// Test configuration error
	configError := handler.HandleConfigurationError("dashscope", "API key missing")
	if configError.Code != "CONFIGURATION_ERROR" {
		t.Errorf("Expected configuration error code, got %s", configError.Code)
	}

	if configError.Provider != "dashscope" {
		t.Errorf("Expected dashscope provider, got %s", configError.Provider)
	}

	// Test retryable error detection
	retryableError := &APIError{
		Code:     "RATE_LIMIT_EXCEEDED",
		Message:  "Rate limit exceeded",
		Provider: "dashscope",
	}

	if !handler.IsRetryableError(retryableError) {
		t.Error("Rate limit error should be retryable")
	}

	nonRetryableError := &APIError{
		Code:     "INVALID_API_KEY",
		Message:  "Invalid API key",
		Provider: "dashscope",
	}

	if handler.IsRetryableError(nonRetryableError) {
		t.Error("Invalid API key error should not be retryable")
	}

	// Test error formatting for logging
	logMessage := handler.FormatErrorForLogging(retryableError)
	expectedParts := []string{"Provider: dashscope", "Code: RATE_LIMIT_EXCEEDED", "Message: Rate limit exceeded"}

	for _, part := range expectedParts {
		if !contains(logMessage, part) {
			t.Errorf("Log message should contain '%s', got: %s", part, logMessage)
		}
	}
}

func TestImageServiceWithRegistry(t *testing.T) {
	configService := NewConfigService()
	imageService := NewImageService(configService)

	// Test provider registration
	providers := imageService.GetProviders()
	if len(providers) != 1 {
		t.Errorf("Expected 1 provider, got %d", len(providers))
	}

	if providers[0].ID != "dashscope" {
		t.Errorf("Expected dashscope provider, got %s", providers[0].ID)
	}

	// Test provider retrieval
	provider, err := imageService.GetProvider("dashscope")
	if err != nil {
		t.Errorf("Failed to get provider: %v", err)
	}

	if provider == nil {
		t.Error("Provider should not be nil")
	}

	// Test nonexistent provider
	_, err = imageService.GetProvider("nonexistent")
	if err == nil {
		t.Error("Should return error for nonexistent provider")
	}
}

// Helper function to check if a string contains a substring
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		(len(s) > len(substr) && (s[:len(substr)] == substr || s[len(s)-len(substr):] == substr ||
			containsAt(s, substr))))
}

func containsAt(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
