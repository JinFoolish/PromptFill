package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// DashScopeProvider implements ImageProvider for Alibaba Cloud DashScope
type DashScopeProvider struct {
	configService *ConfigService
	client        *http.Client
}

// NewDashScopeProvider creates a new DashScope provider
func NewDashScopeProvider(configService *ConfigService) *DashScopeProvider {
	return &DashScopeProvider{
		configService: configService,
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
	}
}

// GenerateImage generates images using DashScope API
func (d *DashScopeProvider) GenerateImage(ctx context.Context, req *GenerateRequest) (*GenerateResponse, error) {
	// Get provider configuration
	config, err := d.configService.GetProviderConfig("dashscope")
	if err != nil {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "CONFIG_ERROR",
				Message:  "Failed to get provider configuration",
				Provider: "dashscope",
			},
		}, nil
	}
	
	if config.APIKey == "" {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "MISSING_API_KEY",
				Message:  "API key is required",
				Provider: "dashscope",
			},
		}, nil
	}
	
	// Prepare request data
	model := req.Model
	if model == "" {
		model = config.DefaultModel
	}
	
	size := req.Size
	if size == "" {
		size = "1536*1536" // Default size
	}
	
	// Build request payload
	requestData := map[string]interface{}{
		"model": model,
		"input": map[string]interface{}{
			"messages": []map[string]interface{}{
				{
					"role": "user",
					"content": []map[string]interface{}{
						{
							"text": req.Prompt,
						},
					},
				},
			},
		},
		"parameters": map[string]interface{}{
			"prompt_extend": false,
			"size":          size,
		},
	}
	
	// Generate multiple images if requested
	responses := make([]*GenerateResponse, 0, req.Count)
	for i := 0; i < req.Count; i++ {
		response, err := d.makeAPICall(ctx, config, requestData)
		if err != nil {
			return &GenerateResponse{
				Success: false,
				Error: &APIError{
					Code:     "API_CALL_ERROR",
					Message:  err.Error(),
					Provider: "dashscope",
				},
			}, nil
		}
		responses = append(responses, response)
	}
	
	// Combine all successful responses
	var allImages []GeneratedImage
	for _, resp := range responses {
		if resp.Success {
			allImages = append(allImages, resp.Images...)
		} else {
			// Return first error encountered
			return resp, nil
		}
	}
	
	return &GenerateResponse{
		Success: true,
		Images:  allImages,
	}, nil
}

// makeAPICall makes a single API call to DashScope
func (d *DashScopeProvider) makeAPICall(ctx context.Context, config *ProviderConfig, requestData map[string]interface{}) (*GenerateResponse, error) {
	// Marshal request data
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}
	
	// Create HTTP request
	url := config.BaseURL + "/api/v1/services/aigc/text2image/image-synthesis"
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+config.APIKey)
	httpReq.Header.Set("X-DashScope-Async", "enable")
	
	// Make request
	resp, err := d.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()
	
	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}
	
	// Parse response
	return d.ParseResponse(body)
}

// ParseResponse parses DashScope API response
func (d *DashScopeProvider) ParseResponse(body []byte) (*GenerateResponse, error) {
	// Try to parse as error response first
	var errorResp DashScopeError
	if json.Unmarshal(body, &errorResp) == nil && errorResp.Code != "" {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:      errorResp.Code,
				Message:   errorResp.Message,
				Provider:  "dashscope",
				RequestID: errorResp.RequestID,
			},
		}, nil
	}
	
	// Parse as success response
	var successResp DashScopeResponse
	if err := json.Unmarshal(body, &successResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}
	
	// Extract images
	var images []GeneratedImage
	for _, choice := range successResp.Output.Choices {
		for _, content := range choice.Message.Content {
			if content.Image != "" {
				images = append(images, GeneratedImage{
					ID:     generateImageID(),
					URL:    content.Image,
					Width:  successResp.Usage.Width,
					Height: successResp.Usage.Height,
				})
			}
		}
	}
	
	if len(images) == 0 {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "NO_IMAGES_GENERATED",
				Message:  "No images were generated",
				Provider: "dashscope",
			},
		}, nil
	}
	
	return &GenerateResponse{
		Success: true,
		Images:  images,
	}, nil
}

// GetModels returns available models
func (d *DashScopeProvider) GetModels() []string {
	return []string{"z-image-turbo"}
}

// GetSizeOptions returns available size options
func (d *DashScopeProvider) GetSizeOptions() []string {
	return []string{
		"1536*1536",
		"1296*1728",
		"1728*1296",
		"1152*2048",
		"864*2016",
		"2048*1152",
		"2016*864",
	}
}

// ValidateConfig validates the provider configuration
func (d *DashScopeProvider) ValidateConfig(config map[string]interface{}) error {
	apiKey, ok := config["apiKey"].(string)
	if !ok || strings.TrimSpace(apiKey) == "" {
		return fmt.Errorf("API key is required")
	}
	return nil
}

// GetProviderInfo returns provider information
func (d *DashScopeProvider) GetProviderInfo() ProviderInfo {
	return ProviderInfo{
		ID:          "dashscope",
		Name:        "阿里云百炼",
		Models:      d.GetModels(),
		SizeOptions: d.GetSizeOptions(),
	}
}

// DashScope API response structures
type DashScopeResponse struct {
	Output    DashScopeOutput `json:"output"`
	Usage     DashScopeUsage  `json:"usage"`
	RequestID string          `json:"request_id"`
}

type DashScopeOutput struct {
	Choices []DashScopeChoice `json:"choices"`
}

type DashScopeChoice struct {
	FinishReason string                    `json:"finish_reason"`
	Message      DashScopeResponseMessage  `json:"message"`
}

type DashScopeResponseMessage struct {
	Content          []DashScopeResponseContent `json:"content"`
	ReasoningContent string                     `json:"reasoning_content"`
	Role             string                     `json:"role"`
}

type DashScopeResponseContent struct {
	Image string `json:"image,omitempty"`
	Text  string `json:"text,omitempty"`
}

type DashScopeUsage struct {
	Height       int `json:"height"`
	ImageCount   int `json:"image_count"`
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
	TotalTokens  int `json:"total_tokens"`
	Width        int `json:"width"`
}

type DashScopeError struct {
	RequestID string `json:"request_id"`
	Code      string `json:"code"`
	Message   string `json:"message"`
}

// generateImageID generates a unique ID for an image
func generateImageID() string {
	return fmt.Sprintf("img_%d", time.Now().UnixNano())
}