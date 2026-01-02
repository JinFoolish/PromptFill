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
	errorHandler  *ErrorHandler
}

// NewDashScopeProvider creates a new DashScope provider
func NewDashScopeProvider(configService *ConfigService) *DashScopeProvider {
	return &DashScopeProvider{
		configService: configService,
		client: &http.Client{
			Timeout: 60 * time.Second,
		},
		errorHandler: NewErrorHandler(),
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

	// Build request payload using template
	requestData, err := d.buildRequestFromTemplate(config, req)
	if err != nil {
		return &GenerateResponse{
			Success: false,
			Error: &APIError{
				Code:     "TEMPLATE_ERROR",
				Message:  fmt.Sprintf("Failed to build request from template: %v", err),
				Provider: "dashscope",
			},
		}, nil
	}

	// Generate single image
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

	return response, nil
}

// makeAPICall makes a single API call to DashScope
func (d *DashScopeProvider) makeAPICall(ctx context.Context, config *ProviderConfig, requestData map[string]interface{}) (*GenerateResponse, error) {
	// Marshal request data
	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	url := config.BaseURL + config.Endpoint
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+config.APIKey)
	// Remove async header as it's not supported by all API keys
	// httpReq.Header.Set("X-DashScope-Async", "enable")

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

	// Handle HTTP errors
	if resp.StatusCode != http.StatusOK {
		// Use error handler to create appropriate error response
		apiError := d.errorHandler.HandleProviderError("dashscope", body, resp.StatusCode)
		return &GenerateResponse{
			Success: false,
			Error:   apiError,
		}, nil
	}

	// Parse response
	return d.ParseResponse(body)
}

// ParseResponse parses DashScope API response
func (d *DashScopeProvider) ParseResponse(body []byte) (*GenerateResponse, error) {
	// Use the error handler to parse provider-specific errors
	if apiError := d.errorHandler.extractDashScopeError(body); apiError != nil {
		return &GenerateResponse{
			Success: false,
			Error:   apiError,
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
	config, err := d.configService.GetProviderConfig("dashscope")
	if err != nil {
		return []string{} // Return empty slice if config unavailable
	}
	return config.Models
}

// GetSizeOptions returns available size options
// If model is provided, returns model-specific options; otherwise returns all options
func (d *DashScopeProvider) GetSizeOptions(model ...string) map[string][]string {
	config, err := d.configService.GetProviderConfig("dashscope")
	if err != nil {
		return map[string][]string{} // Return empty map if config unavailable
	}

	if len(model) > 0 && model[0] != "" {
		// Return options for specific model
		if options, exists := config.SizeOptions[model[0]]; exists {
			return map[string][]string{model[0]: options}
		}
		return map[string][]string{}
	}

	// Return all options
	return config.SizeOptions
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
	config, err := d.configService.GetProviderConfig("dashscope")
	if err != nil {
		// Return basic info if config unavailable
		return ProviderInfo{
			ID:          "dashscope",
			Name:        "DashScope",
			Models:      []string{},
			SizeOptions: map[string][]string{},
		}
	}

	return ProviderInfo{
		ID:          config.ID,
		Name:        config.Name,
		Models:      config.Models,
		SizeOptions: config.SizeOptions,
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
	FinishReason string                   `json:"finish_reason"`
	Message      DashScopeResponseMessage `json:"message"`
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

// buildRequestFromTemplate builds the API request using the configured template
func (d *DashScopeProvider) buildRequestFromTemplate(config *ProviderConfig, req *GenerateRequest) (map[string]interface{}, error) {
	// Prepare template variables
	model := req.Model
	if model == "" {
		model = config.DefaultModel
	}

	size := req.Size
	if size == "" {
		// Get default size from config - use first available size for the model
		if sizeOptions := d.GetSizeOptions(model); len(sizeOptions[model]) > 0 {
			size = sizeOptions[model][0]
		} else {
			size = "1536*1536" // Fallback default
		}
	}

	templateVars := map[string]interface{}{
		"Prompt": req.Prompt,
		"Size":   size,
	}

	// Get model-specific request template
	var requestTemplate map[string]any
	if modelTemplate, exists := config.RequestTemplate[model]; exists {
		requestTemplate = modelTemplate
	} else {
		// Fallback to default model template if current model template doesn't exist
		if defaultTemplate, exists := config.RequestTemplate[config.DefaultModel]; exists {
			requestTemplate = defaultTemplate
		} else {
			return nil, fmt.Errorf("no request template found for model %s", model)
		}
	}

	// Process the request template
	processed, err := d.processTemplate(requestTemplate, templateVars)
	if err != nil {
		return nil, err
	}

	// Type assert to map[string]interface{}
	result, ok := processed.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("template processing did not result in a map")
	}

	return result, nil
}

// processTemplate recursively processes template placeholders
func (d *DashScopeProvider) processTemplate(template interface{}, vars map[string]interface{}) (interface{}, error) {
	switch t := template.(type) {
	case string:
		// Replace template placeholders like {{.Model}}, {{.Prompt}}, {{.Size}}
		result := t
		for key, value := range vars {
			placeholder := fmt.Sprintf("{{.%s}}", key)
			if strings.Contains(result, placeholder) {
				result = strings.ReplaceAll(result, placeholder, fmt.Sprintf("%v", value))
			}
		}
		return result, nil

	case map[string]interface{}:
		processed := make(map[string]interface{})
		for key, value := range t {
			processedValue, err := d.processTemplate(value, vars)
			if err != nil {
				return nil, err
			}
			processed[key] = processedValue
		}
		return processed, nil

	case []interface{}:
		processed := make([]interface{}, len(t))
		for i, value := range t {
			processedValue, err := d.processTemplate(value, vars)
			if err != nil {
				return nil, err
			}
			processed[i] = processedValue
		}
		return processed, nil

	default:
		// Return as-is for other types (numbers, booleans, etc.)
		return template, nil
	}
}

// generateImageID generates a unique ID for an image
func generateImageID() string {
	return fmt.Sprintf("img_%d", time.Now().UnixNano())
}
