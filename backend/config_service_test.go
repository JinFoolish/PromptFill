package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestConfigService_LoadAndSaveConfig(t *testing.T) {
	// Create a temporary directory for testing
	tempDir := t.TempDir()

	// Create a test config service
	service := &ConfigService{
		configPath: filepath.Join(tempDir, "test-config.json"),
		backupPath: filepath.Join(tempDir, "test-config.backup.json"),
	}

	// Test creating default configuration
	config := service.createDefaultConfig()
	if config == nil {
		t.Fatal("createDefaultConfig returned nil")
	}

	// Test saving configuration
	err := service.SaveConfig(config)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	// Verify file was created
	if _, err := os.Stat(service.configPath); os.IsNotExist(err) {
		t.Fatal("Configuration file was not created")
	}

	// Test loading configuration
	loadedConfig, err := service.LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}

	// Verify loaded configuration
	if loadedConfig.ActiveProvider != config.ActiveProvider {
		t.Errorf("Expected active provider %s, got %s", config.ActiveProvider, loadedConfig.ActiveProvider)
	}

	if len(loadedConfig.Providers) != len(config.Providers) {
		t.Errorf("Expected %d providers, got %d", len(config.Providers), len(loadedConfig.Providers))
	}
}

func TestConfigService_ValidateConfig(t *testing.T) {
	service := &ConfigService{}

	// Test nil configuration
	err := service.ValidateConfig(nil)
	if err == nil {
		t.Error("Expected error for nil configuration")
	}

	// Test empty providers
	config := &Configuration{
		Providers: make(map[string]ProviderConfig),
	}
	err = service.ValidateConfig(config)
	if err == nil {
		t.Error("Expected error for empty providers")
	}

	// Test valid configuration
	config = service.createDefaultConfig()
	err = service.ValidateConfig(config)
	if err != nil {
		t.Errorf("Valid configuration failed validation: %v", err)
	}

	// Test invalid active provider
	config.ActiveProvider = "nonexistent"
	err = service.ValidateConfig(config)
	if err == nil {
		t.Error("Expected error for nonexistent active provider")
	}
}

func TestConfigService_SetProviderConfig(t *testing.T) {
	// Create a temporary directory for testing
	tempDir := t.TempDir()

	service := &ConfigService{
		configPath: filepath.Join(tempDir, "test-config.json"),
		backupPath: filepath.Join(tempDir, "test-config.backup.json"),
	}
	service.config = service.createDefaultConfig()

	// Test setting valid API key
	config := map[string]any{
		"apiKey": "test-api-key",
	}

	err := service.SetProviderConfig("dashscope", config)
	if err != nil {
		t.Fatalf("SetProviderConfig failed: %v", err)
	}

	// Verify the API key was set
	provider, err := service.GetProviderConfig("dashscope")
	if err != nil {
		t.Fatalf("GetProviderConfig failed: %v", err)
	}

	if provider.APIKey != "test-api-key" {
		t.Errorf("Expected API key 'test-api-key', got '%s'", provider.APIKey)
	}

	// Test setting invalid empty API key
	config = map[string]any{
		"apiKey": "",
	}

	err = service.SetProviderConfig("dashscope", config)
	if err == nil {
		t.Error("Expected error for empty API key")
	}

	// Test setting config for nonexistent provider
	err = service.SetProviderConfig("nonexistent", config)
	if err == nil {
		t.Error("Expected error for nonexistent provider")
	}
}

func TestConfigService_BackupAndRestore(t *testing.T) {
	// Create a temporary directory for testing
	tempDir := t.TempDir()

	service := &ConfigService{
		configPath: filepath.Join(tempDir, "test-config.json"),
		backupPath: filepath.Join(tempDir, "test-config.backup.json"),
	}
	service.config = service.createDefaultConfig()

	// Create backup
	err := service.createBackup()
	if err != nil {
		t.Fatalf("createBackup failed: %v", err)
	}

	// Verify backup file was created
	if _, err := os.Stat(service.backupPath); os.IsNotExist(err) {
		t.Fatal("Backup file was not created")
	}

	// Test restore from backup
	restoredConfig, err := service.RestoreFromBackup()
	if err != nil {
		t.Fatalf("RestoreFromBackup failed: %v", err)
	}

	// Verify restored configuration
	if restoredConfig.ActiveProvider != service.config.ActiveProvider {
		t.Errorf("Expected active provider %s, got %s", service.config.ActiveProvider, restoredConfig.ActiveProvider)
	}
}

func TestConfigService_DynamicConfigUpdate(t *testing.T) {
	// Create a temporary directory for testing
	tempDir := t.TempDir()

	service := &ConfigService{
		configPath: filepath.Join(tempDir, "test-config.json"),
		backupPath: filepath.Join(tempDir, "test-config.backup.json"),
	}
	service.config = service.createDefaultConfig()

	// Save initial configuration
	err := service.SaveConfig(service.config)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	// Update configuration
	config := map[string]any{
		"apiKey":       "new-api-key",
		"defaultModel": "z-image-turbo",
	}

	err = service.SetProviderConfig("dashscope", config)
	if err != nil {
		t.Fatalf("SetProviderConfig failed: %v", err)
	}

	// Verify configuration was updated and saved
	provider, err := service.GetProviderConfig("dashscope")
	if err != nil {
		t.Fatalf("GetProviderConfig failed: %v", err)
	}

	if provider.APIKey != "new-api-key" {
		t.Errorf("Expected API key 'new-api-key', got '%s'", provider.APIKey)
	}

	// Reload configuration from file to verify persistence
	err = service.ReloadConfig()
	if err != nil {
		t.Fatalf("ReloadConfig failed: %v", err)
	}

	provider, err = service.GetProviderConfig("dashscope")
	if err != nil {
		t.Fatalf("GetProviderConfig after reload failed: %v", err)
	}

	if provider.APIKey != "new-api-key" {
		t.Errorf("Configuration not persisted: expected API key 'new-api-key', got '%s'", provider.APIKey)
	}
}

func TestConfigService_ActiveProviderManagement(t *testing.T) {
	// Create a temporary directory for testing
	tempDir := t.TempDir()

	service := &ConfigService{
		configPath: filepath.Join(tempDir, "test-config.json"),
		backupPath: filepath.Join(tempDir, "test-config.backup.json"),
	}
	service.config = service.createDefaultConfig()

	// Test getting active provider
	activeProvider := service.GetActiveProvider()
	if activeProvider != "dashscope" {
		t.Errorf("Expected active provider 'dashscope', got '%s'", activeProvider)
	}

	// Test setting active provider to existing provider
	err := service.SetActiveProvider("dashscope")
	if err != nil {
		t.Errorf("SetActiveProvider failed: %v", err)
	}

	// Test setting active provider to nonexistent provider
	err = service.SetActiveProvider("nonexistent")
	if err == nil {
		t.Error("Expected error for nonexistent provider")
	}
}
