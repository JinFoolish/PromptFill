package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestConfigAPI_GetConfig(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Create test request
	req, err := http.NewRequest("GET", "/api/v1/config", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create response recorder
	rr := httptest.NewRecorder()

	// Execute request
	server.router.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, status)
	}

	// Parse response
	var response ConfigResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify response
	if response.ActiveProvider != "dashscope" {
		t.Errorf("Expected active provider 'dashscope', got '%s'", response.ActiveProvider)
	}

	if len(response.Providers) == 0 {
		t.Error("Expected at least one provider")
	}
}

func TestConfigAPI_SetConfig(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Create test request body
	configReq := ConfigRequest{
		Provider: "dashscope",
		Config: map[string]any{
			"apiKey": "test-api-key-123",
		},
	}

	reqBody, err := json.Marshal(configReq)
	if err != nil {
		t.Fatal(err)
	}

	// Create test request
	req, err := http.NewRequest("POST", "/api/v1/config", bytes.NewBuffer(reqBody))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Execute request
	server.router.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status code %d, got %d. Response: %s", http.StatusOK, status, rr.Body.String())
	}

	// Parse response
	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify response
	if success, ok := response["success"].(bool); !ok || !success {
		t.Error("Expected success to be true")
	}

	// Verify configuration was actually updated
	provider, err := server.configService.GetProviderConfig("dashscope")
	if err != nil {
		t.Fatalf("Failed to get provider config: %v", err)
	}

	if provider.APIKey != "test-api-key-123" {
		t.Errorf("Expected API key 'test-api-key-123', got '%s'", provider.APIKey)
	}
}

func TestConfigAPI_GetProviders(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Create test request
	req, err := http.NewRequest("GET", "/api/v1/providers", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create response recorder
	rr := httptest.NewRecorder()

	// Execute request
	server.router.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, status)
	}

	// Parse response
	var response ProvidersResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify response
	if len(response.Providers) == 0 {
		t.Error("Expected at least one provider")
	}
}

func TestConfigAPI_ReloadConfig(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Create test request
	req, err := http.NewRequest("POST", "/api/v1/config/reload", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create response recorder
	rr := httptest.NewRecorder()

	// Execute request
	server.router.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status code %d, got %d. Response: %s", http.StatusOK, status, rr.Body.String())
	}

	// Parse response
	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify response
	if success, ok := response["success"].(bool); !ok || !success {
		t.Error("Expected success to be true")
	}
}

func TestConfigAPI_ValidateConfig(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Create valid configuration
	config := server.configService.createDefaultConfig()

	reqBody, err := json.Marshal(config)
	if err != nil {
		t.Fatal(err)
	}

	// Create test request
	req, err := http.NewRequest("POST", "/api/v1/config/validate", bytes.NewBuffer(reqBody))
	if err != nil {
		t.Fatal(err)
	}
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// Execute request
	server.router.ServeHTTP(rr, req)

	// Check status code
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("Expected status code %d, got %d. Response: %s", http.StatusOK, status, rr.Body.String())
	}

	// Parse response
	var response map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	// Verify response
	if success, ok := response["success"].(bool); !ok || !success {
		t.Error("Expected success to be true")
	}
}
