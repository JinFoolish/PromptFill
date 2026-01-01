package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// ConfigService implements configuration management
type ConfigService struct {
	configPath string
	backupPath string
	config     *Configuration
}

// NewConfigService creates a new configuration service
func NewConfigService() *ConfigService {
	// Create config directory if it doesn't exist
	configDir := filepath.Join(".", "config")
	os.MkdirAll(configDir, 0755)

	configPath := filepath.Join(configDir, "ai-providers.json")
	backupPath := filepath.Join(configDir, "ai-providers.backup.json")

	service := &ConfigService{
		configPath: configPath,
		backupPath: backupPath,
	}

	// Load or create default configuration
	config, err := service.LoadConfig()
	if err != nil {
		// Try to restore from backup
		if backupConfig, backupErr := service.RestoreFromBackup(); backupErr == nil {
			config = backupConfig
			service.SaveConfig(config)
		} else {
			// Create default configuration
			config = service.createDefaultConfig()
			service.SaveConfig(config)
		}
	}

	service.config = config
	return service
}

// LoadConfig loads configuration from file
func (c *ConfigService) LoadConfig() (*Configuration, error) {
	data, err := os.ReadFile(c.configPath)
	if err != nil {
		return nil, err
	}

	var config Configuration
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, err
	}

	c.config = &config
	return &config, nil
}

// SaveConfig saves configuration to file
func (c *ConfigService) SaveConfig(config *Configuration) error {
	// Validate configuration before saving
	if err := c.ValidateConfig(config); err != nil {
		return fmt.Errorf("configuration validation failed: %w", err)
	}

	// Create backup of current configuration
	if c.config != nil {
		c.createBackup()
	}

	config.UpdatedAt = time.Now()

	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal configuration: %w", err)
	}

	if err := os.WriteFile(c.configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write configuration file: %w", err)
	}

	c.config = config
	return nil
}

// GetProviderConfig gets configuration for a specific provider
func (c *ConfigService) GetProviderConfig(providerID string) (*ProviderConfig, error) {
	if c.config == nil {
		return nil, fmt.Errorf("configuration not loaded")
	}

	providerConfig, exists := c.config.Providers[providerID]
	if !exists {
		return nil, fmt.Errorf("provider %s not found", providerID)
	}

	return &providerConfig, nil
}

// SetProviderConfig sets configuration for a specific provider
func (c *ConfigService) SetProviderConfig(providerID string, config map[string]any) error {
	if c.config == nil {
		return fmt.Errorf("configuration not loaded")
	}

	providerConfig, exists := c.config.Providers[providerID]
	if !exists {
		return fmt.Errorf("provider %s not found", providerID)
	}

	// Validate the configuration update
	if err := c.validateProviderConfig(providerID, config); err != nil {
		return fmt.Errorf("invalid provider configuration: %w", err)
	}

	// Update specific fields
	if apiKey, ok := config["apiKey"].(string); ok {
		providerConfig.APIKey = strings.TrimSpace(apiKey)
	}
	if baseURL, ok := config["baseUrl"].(string); ok {
		providerConfig.BaseURL = strings.TrimSpace(baseURL)
	}
	if defaultModel, ok := config["defaultModel"].(string); ok {
		providerConfig.DefaultModel = strings.TrimSpace(defaultModel)
	}
	if parameters, ok := config["parameters"].(map[string]any); ok {
		// Merge parameters instead of replacing
		if providerConfig.RequestTemplate == nil {
			providerConfig.RequestTemplate = make(map[string]any)
		}
		if templateParams, exists := providerConfig.RequestTemplate["parameters"].(map[string]any); exists {
			for k, v := range parameters {
				templateParams[k] = v
			}
		}
	}

	c.config.Providers[providerID] = providerConfig
	return c.SaveConfig(c.config)
}

// GetActiveProvider returns the currently active provider ID
func (c *ConfigService) GetActiveProvider() string {
	if c.config == nil {
		return ""
	}
	return c.config.ActiveProvider
}

// SetActiveProvider sets the active provider
func (c *ConfigService) SetActiveProvider(providerID string) error {
	if c.config == nil {
		return fmt.Errorf("configuration not loaded")
	}

	if _, exists := c.config.Providers[providerID]; !exists {
		return fmt.Errorf("provider %s not found", providerID)
	}

	c.config.ActiveProvider = providerID
	return c.SaveConfig(c.config)
}

// GetAllProviders returns all configured providers
func (c *ConfigService) GetAllProviders() []ProviderConfig {
	if c.config == nil {
		return nil
	}

	providers := make([]ProviderConfig, 0, len(c.config.Providers))
	for _, provider := range c.config.Providers {
		providers = append(providers, provider)
	}

	return providers
}

// createDefaultConfig creates a default configuration
func (c *ConfigService) createDefaultConfig() *Configuration {
	return &Configuration{
		Providers: map[string]ProviderConfig{
			"dashscope": {
				ID:           "dashscope",
				Name:         "阿里云百炼",
				APIKey:       "",
				BaseURL:      "https://dashscope.aliyuncs.com",
				Models:       []string{"z-image-turbo"},
				DefaultModel: "z-image-turbo",
				SizeOptions: []string{
					"1536*1536",
					"1296*1728",
					"1728*1296",
					"1152*2048",
					"864*2016",
					"2048*1152",
					"2016*864",
				},
				RequestTemplate: map[string]any{
					"model": "{{.Model}}",
					"input": map[string]any{
						"messages": []map[string]any{
							{
								"role": "user",
								"content": []map[string]any{
									{
										"text": "{{.Prompt}}",
									},
								},
							},
						},
					},
					"parameters": map[string]any{
						"prompt_extend": false,
						"size":          "{{.Size}}",
					},
				},
				ResponseMapping: ResponseMapping{
					SuccessIndicator: "output",
					ImagesPath:       "output.choices[0].message.content",
					ImageURLField:    "image",
					UsagePath:        "usage",
					WidthField:       "width",
					HeightField:      "height",
					ErrorCodePath:    "code",
					ErrorMessagePath: "message",
					RequestIDPath:    "request_id",
				},
			},
		},
		ActiveProvider: "dashscope",
		UpdatedAt:      time.Now(),
	}
}

// ValidateConfig validates the entire configuration
func (c *ConfigService) ValidateConfig(config *Configuration) error {
	if config == nil {
		return fmt.Errorf("configuration cannot be nil")
	}

	if len(config.Providers) == 0 {
		return fmt.Errorf("at least one provider must be configured")
	}

	// Validate active provider exists
	if config.ActiveProvider != "" {
		if _, exists := config.Providers[config.ActiveProvider]; !exists {
			return fmt.Errorf("active provider '%s' not found in providers", config.ActiveProvider)
		}
	}

	// Validate each provider
	for id, provider := range config.Providers {
		if err := c.validateProvider(id, &provider); err != nil {
			return fmt.Errorf("provider '%s' validation failed: %w", id, err)
		}
	}

	return nil
}

// validateProvider validates a single provider configuration
func (c *ConfigService) validateProvider(id string, provider *ProviderConfig) error {
	if provider.ID != id {
		return fmt.Errorf("provider ID mismatch: expected '%s', got '%s'", id, provider.ID)
	}

	if strings.TrimSpace(provider.Name) == "" {
		return fmt.Errorf("provider name cannot be empty")
	}

	if strings.TrimSpace(provider.BaseURL) == "" {
		return fmt.Errorf("provider base URL cannot be empty")
	}

	if len(provider.Models) == 0 {
		return fmt.Errorf("provider must have at least one model")
	}

	if strings.TrimSpace(provider.DefaultModel) == "" {
		return fmt.Errorf("provider must have a default model")
	}

	// Validate default model is in the models list
	found := false
	for _, model := range provider.Models {
		if model == provider.DefaultModel {
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("default model '%s' not found in models list", provider.DefaultModel)
	}

	return nil
}

// validateProviderConfig validates provider configuration updates
func (c *ConfigService) validateProviderConfig(providerID string, config map[string]any) error {
	// Validate API key if provided
	if apiKey, ok := config["apiKey"].(string); ok {
		if strings.TrimSpace(apiKey) == "" {
			return fmt.Errorf("API key cannot be empty")
		}
	}

	// Validate base URL if provided
	if baseURL, ok := config["baseUrl"].(string); ok {
		if strings.TrimSpace(baseURL) == "" {
			return fmt.Errorf("base URL cannot be empty")
		}
	}

	// Validate default model if provided
	if defaultModel, ok := config["defaultModel"].(string); ok {
		if strings.TrimSpace(defaultModel) == "" {
			return fmt.Errorf("default model cannot be empty")
		}

		// Check if model exists in provider's models list
		if provider, exists := c.config.Providers[providerID]; exists {
			found := false
			for _, model := range provider.Models {
				if model == defaultModel {
					found = true
					break
				}
			}
			if !found {
				return fmt.Errorf("model '%s' not available for provider '%s'", defaultModel, providerID)
			}
		}
	}

	return nil
}

// createBackup creates a backup of the current configuration
func (c *ConfigService) createBackup() error {
	if c.config == nil {
		return nil // No config to backup
	}

	data, err := json.MarshalIndent(c.config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal backup configuration: %w", err)
	}

	if err := os.WriteFile(c.backupPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write backup file: %w", err)
	}

	return nil
}

// RestoreFromBackup restores configuration from backup
func (c *ConfigService) RestoreFromBackup() (*Configuration, error) {
	data, err := os.ReadFile(c.backupPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read backup file: %w", err)
	}

	var config Configuration
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal backup configuration: %w", err)
	}

	// Validate backup configuration
	if err := c.ValidateConfig(&config); err != nil {
		return nil, fmt.Errorf("backup configuration is invalid: %w", err)
	}

	return &config, nil
}

// ReloadConfig reloads configuration from file
func (c *ConfigService) ReloadConfig() error {
	config, err := c.LoadConfig()
	if err != nil {
		return fmt.Errorf("failed to reload configuration: %w", err)
	}

	c.config = config
	return nil
}

// GetConfigPath returns the configuration file path
func (c *ConfigService) GetConfigPath() string {
	return c.configPath
}

// GetBackupPath returns the backup file path
func (c *ConfigService) GetBackupPath() string {
	return c.backupPath
}

// AddProvider adds a new provider to the configuration
func (c *ConfigService) AddProvider(provider ProviderConfig) error {
	if c.config == nil {
		return fmt.Errorf("configuration not loaded")
	}

	// Validate the new provider
	if err := c.validateProvider(provider.ID, &provider); err != nil {
		return fmt.Errorf("invalid provider configuration: %w", err)
	}

	// Check if provider already exists
	if _, exists := c.config.Providers[provider.ID]; exists {
		return fmt.Errorf("provider '%s' already exists", provider.ID)
	}

	c.config.Providers[provider.ID] = provider
	return c.SaveConfig(c.config)
}

// RemoveProvider removes a provider from the configuration
func (c *ConfigService) RemoveProvider(providerID string) error {
	if c.config == nil {
		return fmt.Errorf("configuration not loaded")
	}

	if _, exists := c.config.Providers[providerID]; !exists {
		return fmt.Errorf("provider '%s' not found", providerID)
	}

	// Cannot remove the active provider
	if c.config.ActiveProvider == providerID {
		return fmt.Errorf("cannot remove active provider '%s'", providerID)
	}

	delete(c.config.Providers, providerID)
	return c.SaveConfig(c.config)
}
