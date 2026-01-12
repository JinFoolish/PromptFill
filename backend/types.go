package backend

import "time"

// GenerateRequest represents an image generation request
type GenerateRequest struct {
	Prompt     string         `json:"prompt" binding:"required"`
	Provider   string         `json:"provider" binding:"required"`
	Model      string         `json:"model"`
	Size       string         `json:"size"`
	Images     []string       `json:"images"` // Base64 encoded or local paths
	Parameters map[string]any `json:"parameters"`
}

// GenerateResponse represents an image generation response
type GenerateResponse struct {
	Success bool             `json:"success"`
	Images  []GeneratedImage `json:"images,omitempty"`
	Error   *APIError        `json:"error,omitempty"`
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
	Provider string         `json:"provider"`
	Config   map[string]any `json:"config"`
}

// ProvidersResponse represents available providers response
type ProvidersResponse struct {
	Providers []ProviderInfo `json:"providers"`
}

// ProviderInfo represents provider information
type ProviderInfo struct {
	ID                string                       `json:"id"`
	Name              string                       `json:"name"`
	Models            []string                     `json:"models"`
	SizeOptions       map[string][]string          `json:"sizeOptions"`       // Model-specific size options
	ModelCapabilities map[string]ModelCapabilities `json:"modelCapabilities"` // Model-specific capabilities
}

// ProviderConfig represents provider configuration
type ProviderConfig struct {
	ID                string                       `json:"id"`
	Name              string                       `json:"name"`
	APIKey            string                       `json:"apiKey"`
	BaseURL           string                       `json:"baseUrl,omitempty"`
	Endpoint          string                       `json:"endpoint,omitempty"`
	Models            []string                     `json:"models"`
	DefaultModel      string                       `json:"defaultModel"`
	SizeOptions       map[string][]string          `json:"sizeOptions"`       // Model-specific size options
	ModelCapabilities map[string]ModelCapabilities `json:"modelCapabilities"` // Model-specific capabilities
	RequestTemplate   map[string]map[string]any    `json:"requestTemplate"`   // Model-specific request templates
	ResponseMapping   ResponseMapping              `json:"responseMapping"`
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

// HistoryRecord represents an AI generation history record
type HistoryRecord struct {
	ID        string                 `json:"id"`
	Params    GenerationParams       `json:"params"`
	Images    []GeneratedImage       `json:"images"`
	Timestamp int64                  `json:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// GenerationParams represents the parameters used for image generation
type GenerationParams struct {
	Prompt     string                 `json:"prompt"`
	Provider   string                 `json:"provider"`
	Model      string                 `json:"model"`
	Size       string                 `json:"size"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
}

// Template represents a prompt template
type Template struct {
	ID        string            `json:"id"`
	Name      map[string]string `json:"name"`
	Content   map[string]string `json:"content"`
	ImageURL  string            `json:"imageUrl"`
	ImageURLs []string          `json:"imageUrls,omitempty"`
	Author    string            `json:"author"`
}

// BankItem represents a category of words/phrases for substitution
type BankItem struct {
	Label    map[string]string   `json:"label"`
	Category string              `json:"category"`
	Options  []map[string]string `json:"options"`
}

// BankMap represents the collection of all bank items
type BankMap map[string]BankItem

type Category struct {
	ID    string            `json:"id"`
	Label map[string]string `json:"label"`
	Color string            `json:"color"`
}

type CategoryMap map[string]Category

// ModelCapabilities defines what a model supports
type ModelCapabilities struct {
	SupportsReferenceImage bool `json:"supportsReferenceImage"`
	MaxReferenceImages     int  `json:"maxReferenceImages"`
}
