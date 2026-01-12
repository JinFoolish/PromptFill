package backend

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// AI Image Generation Methods

// GenerateImage generates images using the specified AI provider
func (a *App) GenerateImage(req *GenerateRequest) (*GenerateResponse, error) {
	config, err := a.loadOrCreateConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load configuration: %w", err)
	}

	provider, exists := config.Providers[req.Provider]
	if !exists {
		return a.newErrorResponse("PROVIDER_NOT_FOUND", fmt.Sprintf("Provider %s not configured", req.Provider), req.Provider), nil
	}

	// Check if API key is configured
	if provider.APIKey == "" {
		return a.newErrorResponse("MISSING_API_KEY", "API key is required for this provider", req.Provider), nil
	}

	// Call the appropriate provider based on provider ID
	switch req.Provider {
	case "dashscope":
		return a.generateImageDashScope(&provider, req)
	case "nanobanana":
		return a.generateImageNanobanana(&provider, req)
	default:
		return a.newErrorResponse("UNSUPPORTED_PROVIDER", fmt.Sprintf("Provider %s is not yet supported", req.Provider), req.Provider), nil
	}
}

// generateImageDashScope generates images using DashScope API
func (a *App) generateImageDashScope(provider *ProviderConfig, req *GenerateRequest) (*GenerateResponse, error) {
	// Prepare model and size
	model := req.Model
	if model == "" {
		model = provider.DefaultModel
	}

	size := req.Size
	if size == "" {
		// Get default size from config
		if sizeOptions, exists := provider.SizeOptions[model]; exists && len(sizeOptions) > 0 {
			size = sizeOptions[0]
		} else {
			size = "1536*1536" // Fallback default
		}
	}

	// Build request payload using template
	requestData, err := a.buildRequestFromTemplate(provider, req, model, size)
	if err != nil {
		return a.newErrorResponse("TEMPLATE_ERROR", fmt.Sprintf("Failed to build request: %v", err), req.Provider), nil
	}

	// Make HTTP request
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	url := provider.BaseURL + provider.Endpoint
	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+provider.APIKey)

	// Make request
	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return a.newErrorResponse("NETWORK_ERROR", fmt.Sprintf("Failed to make request: %v", err), req.Provider), nil
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Handle HTTP errors
	if resp.StatusCode != http.StatusOK {
		apiError := a.parseDashScopeError(body)
		if apiError == nil {
			apiError = &APIError{
				Code:     "HTTP_ERROR",
				Message:  fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(body)),
				Provider: req.Provider,
			}
		}
		return &GenerateResponse{Success: false, Error: apiError}, nil
	}

	// Parse success response
	return a.parseDashScopeResponse(body)
}

// buildRequestFromTemplate builds the API request using the configured template
func (a *App) buildRequestFromTemplate(provider *ProviderConfig, req *GenerateRequest, model, size string) (map[string]interface{}, error) {
	// Get model-specific request template
	requestTemplate := a.getRequestTemplate(provider, model)
	if requestTemplate == nil {
		return nil, fmt.Errorf("no request template found for model %s", model)
	}

	// Prepare template variables
	templateVars := map[string]interface{}{
		"Model":  model,
		"Prompt": req.Prompt,
		"Size":   size,
	}

	// Process the request template
	processed, err := a.processTemplate(requestTemplate, templateVars)
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

// getRequestTemplate gets the request template for a model, with fallback to default model
func (a *App) getRequestTemplate(provider *ProviderConfig, model string) map[string]any {
	if template, exists := provider.RequestTemplate[model]; exists {
		return template
	}
	if template, exists := provider.RequestTemplate[provider.DefaultModel]; exists {
		return template
	}
	return nil
}

// processTemplate recursively processes template placeholders
func (a *App) processTemplate(template interface{}, vars map[string]interface{}) (interface{}, error) {
	switch t := template.(type) {
	case string:
		// Check for exact object replacement first (e.g. "{{.ContentParts}}")
		trimmed := strings.TrimSpace(t)
		if strings.HasPrefix(trimmed, "{{.") && strings.HasSuffix(trimmed, "}}") {
			key := trimmed[3 : len(trimmed)-2]
			if val, ok := vars[key]; ok {
				// If the variable exists, return it directly regardless of type
				// This allows injecting objects/arrays/maps directly into the JSON structure
				return val, nil
			}
		}

		// Replace template placeholders within string content like "Size: {{.Size}}"
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
			processedValue, err := a.processTemplate(value, vars)
			if err != nil {
				return nil, err
			}
			processed[key] = processedValue
		}
		return processed, nil

	case []interface{}:
		processed := make([]interface{}, len(t))
		for i, value := range t {
			processedValue, err := a.processTemplate(value, vars)
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

// parseDashScopeResponse parses DashScope API success response
func (a *App) parseDashScopeResponse(body []byte) (*GenerateResponse, error) {
	var dashScopeResp struct {
		Output struct {
			Choices []struct {
				Message struct {
					Content []struct {
						Image string `json:"image,omitempty"`
					} `json:"content"`
				} `json:"message"`
			} `json:"choices"`
		} `json:"output"`
		Usage struct {
			Width  int `json:"width"`
			Height int `json:"height"`
		} `json:"usage"`
		RequestID string `json:"request_id"`
	}

	if err := json.Unmarshal(body, &dashScopeResp); err != nil {
		// Try to parse as error first
		if apiError := a.parseDashScopeError(body); apiError != nil {
			return &GenerateResponse{Success: false, Error: apiError}, nil
		}
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Extract images
	var images []GeneratedImage
	if len(dashScopeResp.Output.Choices) > 0 && len(dashScopeResp.Output.Choices[0].Message.Content) > 0 {
		for _, content := range dashScopeResp.Output.Choices[0].Message.Content {
			if content.Image != "" {
				images = append(images, GeneratedImage{
					ID:  fmt.Sprintf("img_%d", time.Now().UnixNano()),
					URL: content.Image,
				})
			}
		}
	}

	if len(images) == 0 {
		return a.newErrorResponse("NO_IMAGES_GENERATED", "No images were generated in the response", "dashscope"), nil
	}

	return &GenerateResponse{Success: true, Images: images}, nil
}

// newErrorResponse creates a new error response
func (a *App) newErrorResponse(code, message, provider string) *GenerateResponse {
	return &GenerateResponse{
		Success: false,
		Error: &APIError{
			Code:     code,
			Message:  message,
			Provider: provider,
		},
	}
}

// parseDashScopeError parses DashScope API error response
func (a *App) parseDashScopeError(body []byte) *APIError {
	var errorResp struct {
		RequestID string `json:"request_id"`
		Code      string `json:"code"`
		Message   string `json:"message"`
	}

	if err := json.Unmarshal(body, &errorResp); err != nil {
		return nil
	}

	if errorResp.Code == "" {
		return nil
	}

	return &APIError{
		Code:      errorResp.Code,
		Message:   errorResp.Message,
		Provider:  "dashscope",
		RequestID: errorResp.RequestID,
	}
}

// generateImageNanobanana generates images using Nanobanana (Gemini) API
func (a *App) generateImageNanobanana(provider *ProviderConfig, req *GenerateRequest) (*GenerateResponse, error) {
	// Prepare model and size
	model := req.Model
	if model == "" {
		model = provider.DefaultModel
	}

	size := req.Size
	if size == "" {
		// Get default size from config
		if sizeOptions, exists := provider.SizeOptions[model]; exists && len(sizeOptions) > 0 {
			size = sizeOptions[0]
		} else {
			size = "1:1" // Fallback default
		}
	}

	// Limit reference images based on model capabilities
	var referenceImages []string
	maxImages := 0
	if caps, exists := provider.ModelCapabilities[model]; exists {
		maxImages = caps.MaxReferenceImages
	}

	if len(req.Images) > 0 && maxImages > 0 {
		count := len(req.Images)
		if count > maxImages {
			count = maxImages
		}
		referenceImages = req.Images[:count]
	}

	// Construct ContentParts
	// Structure: [{"text": prompt}, {"inline_data": {"mime_type":..., "data":...}}, ...]
	contentParts := make([]map[string]interface{}, 0)

	// Add text prompt first
	contentParts = append(contentParts, map[string]interface{}{
		"text": req.Prompt,
	})

	// Add reference images
	for _, imgStr := range referenceImages {
		// Parse base64 string "data:image/png;base64,..."
		parts := strings.Split(imgStr, ";base64,")
		if len(parts) != 2 {
			continue
		}

		mimeType := strings.TrimPrefix(parts[0], "data:")
		base64Data := parts[1]

		contentParts = append(contentParts, map[string]interface{}{
			"inlineData": map[string]interface{}{
				"mimeType": mimeType,
				"data":     base64Data,
			},
		})
	}

	// Prepare template variables
	// Note: We're injecting contentParts as a direct object, not string replacement
	templateVars := map[string]interface{}{
		"Model":        model,
		"Prompt":       req.Prompt,
		"Size":         size,
		"ContentParts": contentParts,
	}

	// Get model-specific request template
	requestTemplate := a.getRequestTemplate(provider, model)
	if requestTemplate == nil {
		return nil, fmt.Errorf("no request template found for model %s", model)
	}

	// Process the request template
	processed, err := a.processTemplate(requestTemplate, templateVars)
	if err != nil {
		return nil, err
	}

	requestBody, ok := processed.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("template processing did not result in a map")
	}

	// Make HTTP request
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second) // Longer timeout for images
	defer cancel()

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Replace {model} in endpoint
	endpoint := strings.ReplaceAll(provider.Endpoint, "{model}", model)
	url := provider.BaseURL + endpoint

	httpReq, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("x-goog-api-key", provider.APIKey)

	// Make request
	client := &http.Client{
		Timeout: 120 * time.Second,
		Transport: &http.Transport{
			Proxy: http.ProxyFromEnvironment,
			// HTTP/2 often causes "unexpected EOF" with some proxies/VPNs
			// Disabling it forces HTTP/1.1 which is more stable
			TLSNextProto: make(map[string]func(authority string, c *tls.Conn) http.RoundTripper),
		},
	}
	resp, err := client.Do(httpReq)
	if err != nil {
		return a.newErrorResponse("NETWORK_ERROR", fmt.Sprintf("Failed to make request: %v", err), req.Provider), nil
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Handle HTTP errors
	if resp.StatusCode != http.StatusOK {
		// Try to parse standard error first
		var errorResp struct {
			Error struct {
				Code    int    `json:"code"`
				Message string `json:"message"`
				Status  string `json:"status"`
			} `json:"error"`
		}
		if json.Unmarshal(body, &errorResp) == nil && errorResp.Error.Code != 0 {
			apiError := &APIError{
				Code:     errorResp.Error.Status,
				Message:  errorResp.Error.Message,
				Provider: req.Provider,
			}
			return &GenerateResponse{Success: false, Error: apiError}, nil
		}

		// Log error body for debugging
		fmt.Printf("Nanobanana API Error: %s\n", string(body))

		apiError := &APIError{
			Code:     "HTTP_ERROR",
			Message:  fmt.Sprintf("HTTP %d: %s", resp.StatusCode, string(body)),
			Provider: req.Provider,
		}
		return &GenerateResponse{Success: false, Error: apiError}, nil
	}

	// Parse success response
	return a.parseNanobananaResponse(body)
}

// parseNanobananaResponse parses Nanobanana (Gemini) API response and saves base64 images
func (a *App) parseNanobananaResponse(body []byte) (*GenerateResponse, error) {
	var geminiResp struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text       string `json:"text,omitempty"`
					InlineData struct {
						MimeType string `json:"mimeType"`
						Data     string `json:"data"`
					} `json:"inlineData,omitempty"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.Unmarshal(body, &geminiResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return a.newErrorResponse("NO_CANDIDATES", "No candidates returned in response", "nanobanana"), nil
	}

	var images []GeneratedImage

	for _, part := range geminiResp.Candidates[0].Content.Parts {
		if part.InlineData.Data != "" {
			// Construct Data URI directly instead of saving to file
			// "data:image/png;base64,..."
			dataURI := fmt.Sprintf("data:%s;base64,%s", part.InlineData.MimeType, part.InlineData.Data)

			images = append(images, GeneratedImage{
				ID:  fmt.Sprintf("img_%d", time.Now().UnixNano()),
				URL: dataURI,
			})
		}
	}

	if len(images) == 0 {
		// If no images, check if there's text content (e.g. error message or refusal)
		var textContent strings.Builder
		for _, candidate := range geminiResp.Candidates {
			for _, part := range candidate.Content.Parts {
				if part.Text != "" {
					textContent.WriteString(part.Text)
					textContent.WriteString(" ")
				}
			}
		}

		msg := "Response contained no image data"
		if textContent.Len() > 0 {
			msg = fmt.Sprintf("%s. Model output: %s", msg, textContent.String())
		}

		return a.newErrorResponse("NO_IMAGES_FOUND", msg, "nanobanana"), nil
	}

	return &GenerateResponse{Success: true, Images: images}, nil
}
