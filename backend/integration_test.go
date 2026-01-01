package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestDashScopeAPI_Integration(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Test generate endpoint with DashScope provider
	generateReq := GenerateRequest{
		Prompt:   "A beautiful landscape with mountains and lakes",
		Provider: "dashscope",
		Model:    "z-image-turbo",
		Size:     "1536*1536",
		Count:    1,
	}

	reqBody, err := json.Marshal(generateReq)
	if err != nil {
		t.Fatalf("Failed to marshal request: %v", err)
	}

	req := httptest.NewRequest("POST", "/api/v1/generate", bytes.NewBuffer(reqBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	server.router.ServeHTTP(w, req)

	// Since we don't have a real API key, we expect an error response
	// but the API should handle it gracefully
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response GenerateResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	// Should return an error due to missing/invalid API key
	if response.Success {
		t.Error("Expected response to indicate failure due to missing API key")
	}

	if response.Error == nil {
		t.Error("Expected error in response")
	}

	// The error should be related to authentication
	t.Logf("Received error: Code=%s, Message=%s", response.Error.Code, response.Error.Message)
}

func TestProviderInfo_Integration(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	req := httptest.NewRequest("GET", "/api/v1/providers", nil)
	w := httptest.NewRecorder()
	server.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ProvidersResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if len(response.Providers) == 0 {
		t.Error("Expected at least one provider")
	}

	// Find DashScope provider
	var dashscopeProvider *ProviderInfo
	for _, provider := range response.Providers {
		if provider.ID == "dashscope" {
			dashscopeProvider = &provider
			break
		}
	}

	if dashscopeProvider == nil {
		t.Error("DashScope provider not found")
	} else {
		if dashscopeProvider.Name != "阿里云百炼" {
			t.Errorf("Expected provider name '阿里云百炼', got %s", dashscopeProvider.Name)
		}

		if len(dashscopeProvider.Models) == 0 {
			t.Error("Expected at least one model")
		}

		if len(dashscopeProvider.SizeOptions) == 0 {
			t.Error("Expected at least one size option")
		}
	}
}

func TestConfigAPI_Integration(t *testing.T) {
	// Create API server
	server := NewAPIServer()

	// Test get config
	req := httptest.NewRequest("GET", "/api/v1/config", nil)
	w := httptest.NewRecorder()
	server.router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response ConfigResponse
	if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
		t.Fatalf("Failed to unmarshal response: %v", err)
	}

	if len(response.Providers) == 0 {
		t.Error("Expected at least one provider in config")
	}

	if response.ActiveProvider == "" {
		t.Error("Expected active provider to be set")
	}

	// Find DashScope provider in config
	var dashscopeConfig *ProviderConfig
	for _, provider := range response.Providers {
		if provider.ID == "dashscope" {
			dashscopeConfig = &provider
			break
		}
	}

	if dashscopeConfig == nil {
		t.Error("DashScope provider not found in config")
	} else {
		if dashscopeConfig.Name != "阿里云百炼" {
			t.Errorf("Expected provider name '阿里云百炼', got %s", dashscopeConfig.Name)
		}

		if dashscopeConfig.BaseURL != "https://dashscope.aliyuncs.com" {
			t.Errorf("Expected base URL 'https://dashscope.aliyuncs.com', got %s", dashscopeConfig.BaseURL)
		}

		if dashscopeConfig.RequestTemplate == nil {
			t.Error("Expected request template to be configured")
		}
	}
}
