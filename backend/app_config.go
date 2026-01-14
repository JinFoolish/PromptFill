package backend

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
	"path/filepath"
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
    // 1. 尝试从 %AppData% 路径读取
    data, err := os.ReadFile(a.configPath)
    
    if err != nil {
        if os.IsNotExist(err) {
            // 2. 如果本地文件不存在，回退到嵌入的默认配置
            // 注意：这里确认一下你的嵌入路径是 json/config.json 还是 json/ai-providers.json
            embeddedData, embedErr := defaultConfigFS.ReadFile("json/ai-providers.json") 
            if embedErr != nil {
                return nil, fmt.Errorf("failed to read embedded config: %w", embedErr)
            }

            // 3. 确保目录存在并将默认配置写入磁盘，以便用户后续自定义
            if err := os.MkdirAll(filepath.Dir(a.configPath), 0755); err == nil {
                _ = os.WriteFile(a.configPath, embeddedData, 0644)
            }

            data = embeddedData
        } else {
            // 其他系统读取错误
            return nil, fmt.Errorf("failed to read config file: %w", err)
        }
    }

    // 4. 解析 JSON 数据
    var config Configuration
    if err := json.Unmarshal(data, &config); err != nil {
        // 如果解析失败（可能是文件损坏），返回错误或默认配置
        return nil, fmt.Errorf("failed to parse config: %w", err)
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
