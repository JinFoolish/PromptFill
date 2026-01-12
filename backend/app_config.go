package backend

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// Configuration Management Methods

// GetConfig loads and returns the current configuration
func (a *App) GetConfig() (*ConfigResponse, error) {
	config, err := a.loadOrCreateConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load configuration: %w", err)
	}

	// Convert to response format with masked API keys
	providers := make([]ProviderConfig, 0, len(config.Providers))
	for _, provider := range config.Providers {
		maskedProvider := provider
		maskedProvider.APIKey = a.maskAPIKey(provider.APIKey)
		providers = append(providers, maskedProvider)
	}

	return &ConfigResponse{
		Providers:      providers,
		ActiveProvider: config.ActiveProvider,
	}, nil
}

// LoadCategories loads the category definitions
func (a *App) LoadCategories() (CategoryMap, error) {
	// Try config dir first
	categoriesFile := filepath.Join(filepath.Dir(a.configPath), "categories.json")

	// Check if file exists in config dir
	if _, err := os.Stat(categoriesFile); os.IsNotExist(err) {
		// Fallback to dev source path if running locally
		if wd, err := os.Getwd(); err == nil {
			categoriesFile = filepath.Join(wd, "backend", "json", "categories.json")
		}
	}

	data, err := os.ReadFile(categoriesFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read categories.json: %w", err)
	}

	var categories CategoryMap
	if err := json.Unmarshal(data, &categories); err != nil {
		return nil, fmt.Errorf("failed to parse categories: %w", err)
	}

	return categories, nil
}

// SetConfig updates the configuration for a specific provider
func (a *App) SetConfig(req *ConfigRequest) error {
	config, err := a.loadOrCreateConfig()
	if err != nil {
		return fmt.Errorf("failed to load configuration: %w", err)
	}

	provider, exists := config.Providers[req.Provider]
	if !exists {
		return fmt.Errorf("provider %s not found", req.Provider)
	}

	// Update provider configuration
	if err := a.updateProviderConfig(&provider, req.Config); err != nil {
		return fmt.Errorf("failed to update provider config: %w", err)
	}

	config.Providers[req.Provider] = provider

	// Set as active provider if specified
	if setActive, ok := req.Config["setActive"].(bool); ok && setActive {
		config.ActiveProvider = req.Provider
	}

	config.UpdatedAt = time.Now()

	return a.saveConfig(config)
}

// GetProviders returns information about all available providers
func (a *App) GetProviders() (*ProvidersResponse, error) {
	config, err := a.loadOrCreateConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load configuration: %w", err)
	}

	// Convert ProviderConfig to ProviderInfo
	providers := make([]ProviderInfo, 0, len(config.Providers))
	for _, provider := range config.Providers {
		providers = append(providers, ProviderInfo{
			ID:                provider.ID,
			Name:              provider.Name,
			Models:            provider.Models,
			SizeOptions:       provider.SizeOptions,
			ModelCapabilities: provider.ModelCapabilities,
		})
	}

	return &ProvidersResponse{
		Providers: providers,
	}, nil
}

// Helper Methods

// loadOrCreateConfig loads configuration from file
func (a *App) loadOrCreateConfig() (*Configuration, error) {
	// First try to load user config from executable directory
	data, err := os.ReadFile(a.configPath)
	if err == nil {
		var config Configuration
		if err := json.Unmarshal(data, &config); err == nil {
			return &config, nil
		}
	}

	// If user config doesn't exist or is corrupted, load embedded default config
	embeddedData, err := defaultConfigFS.ReadFile("json/ai-providers.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read embedded config: %w", err)
	}

	var config Configuration
	if err := json.Unmarshal(embeddedData, &config); err != nil {
		return nil, fmt.Errorf("failed to parse embedded config: %w", err)
	}

	return &config, nil
}

// saveConfig saves configuration to file
func (a *App) saveConfig(config *Configuration) error {
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	return os.WriteFile(a.configPath, data, 0644)
}

// updateProviderConfig updates provider configuration with new values
func (a *App) updateProviderConfig(provider *ProviderConfig, config map[string]any) error {
	if apiKey, ok := config["apiKey"].(string); ok {
		provider.APIKey = apiKey
	}
	if baseURL, ok := config["baseUrl"].(string); ok {
		provider.BaseURL = baseURL
	}
	if defaultModel, ok := config["defaultModel"].(string); ok {
		provider.DefaultModel = defaultModel
	}
	// Add more configuration updates as needed
	return nil
}

// maskAPIKey masks an API key for security purposes
func (a *App) maskAPIKey(apiKey string) string {
	if apiKey == "" {
		return ""
	}
	if len(apiKey) > 12 {
		return apiKey[:4] + "xxxxx" + apiKey[len(apiKey)-4:]
	}
	return "xxxxx"
}
