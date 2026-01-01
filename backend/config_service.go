package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// ConfigService implements configuration management
type ConfigService struct {
	configPath string
	config     *Configuration
}

// NewConfigService creates a new configuration service
func NewConfigService() *ConfigService {
	// Create config directory if it doesn't exist
	configDir := filepath.Join(".", "config")
	os.MkdirAll(configDir, 0755)
	
	configPath := filepath.Join(configDir, "ai-providers.json")
	
	service := &ConfigService{
		configPath: configPath,
	}
	
	// Load or create default configuration
	config, err := service.LoadConfig()
	if err != nil {
		// Create default configuration
		config = service.createDefaultConfig()
		service.SaveConfig(config)
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
	config.UpdatedAt = time.Now()
	
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}
	
	if err := os.WriteFile(c.configPath, data, 0644); err != nil {
		return err
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
func (c *ConfigService) SetProviderConfig(providerID string, config map[string]interface{}) error {
	if c.config == nil {
		return fmt.Errorf("configuration not loaded")
	}
	
	providerConfig, exists := c.config.Providers[providerID]
	if !exists {
		return fmt.Errorf("provider %s not found", providerID)
	}
	
	// Update specific fields
	if apiKey, ok := config["apiKey"].(string); ok {
		providerConfig.APIKey = apiKey
	}
	if baseURL, ok := config["baseUrl"].(string); ok {
		providerConfig.BaseURL = baseURL
	}
	if defaultModel, ok := config["defaultModel"].(string); ok {
		providerConfig.DefaultModel = defaultModel
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
				RequestTemplate: map[string]interface{}{
					"model": "{{.Model}}",
					"input": map[string]interface{}{
						"messages": []map[string]interface{}{
							{
								"role": "user",
								"content": []map[string]interface{}{
									{
										"text": "{{.Prompt}}",
									},
								},
							},
						},
					},
					"parameters": map[string]interface{}{
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