package main

import "time"

// GenerateRequest represents an image generation request
type GenerateRequest struct {
	Prompt     string                 `json:"prompt" binding:"required"`
	Provider   string                 `json:"provider" binding:"required"`
	Model      string                 `json:"model"`
	Count      int                    `json:"count" validate:"min=1,max=10"`
	Size       string                 `json:"size"`
	Parameters map[string]interface{} `json:"parameters"`
}

// GenerateResponse represents an image generation response
type GenerateResponse struct {
	Success bool              `json:"success"`
	Images  []GeneratedImage  `json:"images,omitempty"`
	Error   *APIError         `json:"error,omitempty"`
}

// GeneratedImage represents a generated image
type GeneratedImage struct {
	ID     string `json:"id"`
	URL    string `json:"url"`
	Width  int    `json:"width,omitempty"`
	Height int    `json:"height,omitempty"`
}

// APIError represents an API error response
type APIError struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	Provider  string `json:"provider"`
	RequestID string `json:"requestId,omitempty"`
}

// ConfigResponse represents configuration response
type ConfigResponse struct {
	Providers      []ProviderConfig `json:"providers"`
	ActiveProvider string           `json:"activeProvider"`
}

// ConfigRequest represents configuration update request
type ConfigRequest struct {
	Provider string                 `json:"provider"`
	Config   map[string]interface{} `json:"config"`
}

// ProvidersResponse represents available providers response
type ProvidersResponse struct {
	Providers []ProviderInfo `json:"providers"`
}

// ProviderInfo represents provider information
type ProviderInfo struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Models      []string `json:"models"`
	SizeOptions []string `json:"sizeOptions"`
}

// ProviderConfig represents provider configuration
type ProviderConfig struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	APIKey          string                 `json:"apiKey"`
	BaseURL         string                 `json:"baseUrl,omitempty"`
	Models          []string               `json:"models"`
	DefaultModel    string                 `json:"defaultModel"`
	SizeOptions     []string               `json:"sizeOptions"`
	RequestTemplate map[string]interface{} `json:"requestTemplate"`
	ResponseMapping ResponseMapping        `json:"responseMapping"`
}

// ResponseMapping defines how to parse provider responses
type ResponseMapping struct {
	SuccessIndicator string `json:"successIndicator"`
	ImagesPath       string `json:"imagesPath"`
	ImageURLField    string `json:"imageUrlField"`
	UsagePath        string `json:"usagePath"`
	WidthField       string `json:"widthField"`
	HeightField      string `json:"heightField"`
	ErrorCodePath    string `json:"errorCodePath"`
	ErrorMessagePath string `json:"errorMessagePath"`
	RequestIDPath    string `json:"requestIdPath"`
}

// SaveFileRequest represents file save request
type SaveFileRequest struct {
	ImageURL string `json:"imageUrl" binding:"required"`
	Filename string `json:"filename" binding:"required"`
	Path     string `json:"path"`
}

// Configuration represents the application configuration
type Configuration struct {
	Providers      map[string]ProviderConfig `json:"providers"`
	ActiveProvider string                    `json:"activeProvider"`
	UpdatedAt      time.Time                 `json:"updatedAt"`
}