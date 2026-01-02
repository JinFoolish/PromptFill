package main

import (
	"context"
	"testing"
)

func TestDashScopeProvider_TemplateProcessing(t *testing.T) {
	// Create a config service with test configuration
	configService := NewConfigService()

	// Create DashScope provider
	provider := NewDashScopeProvider(configService)

	// Test template processing
	config, err := configService.GetProviderConfig("dashscope")
	if err != nil {
		t.Fatalf("Failed to get provider config: %v", err)
	}

	// Test request building
	req := &GenerateRequest{
		Prompt: "A beautiful sunset over mountains",
		Model:  "z-image-turbo",
		Size:   "1536*1536",
	}

	requestData, err := provider.buildRequestFromTemplate(config, req)
	if err != nil {
		t.Fatalf("Failed to build request from template: %v", err)
	}

	// Verify the request structure
	if requestData["model"] != "z-image-turbo" {
		t.Errorf("Expected model 'z-image-turbo', got %v", requestData["model"])
	}

	// Check input structure
	input, ok := requestData["input"].(map[string]interface{})
	if !ok {
		t.Fatal("Input field is not a map")
	}

	messages, ok := input["messages"].([]interface{})
	if !ok {
		t.Fatal("Messages field is not an array")
	}

	if len(messages) != 1 {
		t.Fatalf("Expected 1 message, got %d", len(messages))
	}

	message, ok := messages[0].(map[string]interface{})
	if !ok {
		t.Fatal("Message is not a map")
	}

	content, ok := message["content"].([]interface{})
	if !ok {
		t.Fatal("Content field is not an array")
	}

	if len(content) != 1 {
		t.Fatalf("Expected 1 content item, got %d", len(content))
	}

	contentItem, ok := content[0].(map[string]interface{})
	if !ok {
		t.Fatal("Content item is not a map")
	}

	if contentItem["text"] != "A beautiful sunset over mountains" {
		t.Errorf("Expected prompt text, got %v", contentItem["text"])
	}

	// Check parameters
	parameters, ok := requestData["parameters"].(map[string]interface{})
	if !ok {
		t.Fatal("Parameters field is not a map")
	}

	if parameters["size"] != "1536*1536" {
		t.Errorf("Expected size '1536*1536', got %v", parameters["size"])
	}
}

func TestDashScopeProvider_ValidateConfig(t *testing.T) {
	configService := NewConfigService()
	provider := NewDashScopeProvider(configService)

	// Test valid config
	validConfig := map[string]interface{}{
		"apiKey": "test-api-key",
	}

	err := provider.ValidateConfig(validConfig)
	if err != nil {
		t.Errorf("Expected valid config to pass validation, got error: %v", err)
	}

	// Test invalid config (empty API key)
	invalidConfig := map[string]interface{}{
		"apiKey": "",
	}

	err = provider.ValidateConfig(invalidConfig)
	if err == nil {
		t.Error("Expected invalid config to fail validation")
	}

	// Test missing API key
	missingKeyConfig := map[string]interface{}{}

	err = provider.ValidateConfig(missingKeyConfig)
	if err == nil {
		t.Error("Expected config without API key to fail validation")
	}
}

func TestDashScopeProvider_GetProviderInfo(t *testing.T) {
	configService := NewConfigService()
	provider := NewDashScopeProvider(configService)

	info := provider.GetProviderInfo()

	if info.ID != "dashscope" {
		t.Errorf("Expected provider ID 'dashscope', got %s", info.ID)
	}

	if info.Name != "阿里云百炼" {
		t.Errorf("Expected provider name '阿里云百炼', got %s", info.Name)
	}

	if len(info.Models) == 0 {
		t.Error("Expected at least one model")
	}

	if len(info.SizeOptions) == 0 {
		t.Error("Expected at least one size option")
	}
}

func TestDashScopeProvider_GenerateImage_MissingAPIKey(t *testing.T) {
	configService := NewConfigService()

	// Directly modify the configuration to have empty API key
	config := configService.config
	dashscopeConfig := config.Providers["dashscope"]
	dashscopeConfig.APIKey = ""
	config.Providers["dashscope"] = dashscopeConfig

	provider := NewDashScopeProvider(configService)

	req := &GenerateRequest{
		Prompt: "Test prompt",
	}

	response, err := provider.GenerateImage(context.Background(), req)
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}

	if response.Success {
		t.Error("Expected response to indicate failure")
	}

	if response.Error == nil {
		t.Error("Expected error in response")
	}

	if response.Error.Code != "MISSING_API_KEY" {
		t.Errorf("Expected error code 'MISSING_API_KEY', got %s", response.Error.Code)
	}
}
