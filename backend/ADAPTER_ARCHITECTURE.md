# Service Adapter Architecture

This document describes the service adapter infrastructure implemented for the AI Image Generation system.

## Overview

The service adapter architecture provides a unified interface for integrating multiple AI image generation providers. It consists of three main components:

1. **ImageProvider Interface** - Defines the contract that all providers must implement
2. **AdapterRegistry** - Manages provider registration and retrieval
3. **ErrorHandler** - Provides unified error handling across all providers

## Components

### ImageProvider Interface

All image providers must implement the `ImageProvider` interface:

```go
type ImageProvider interface {
    GenerateImage(ctx context.Context, req *GenerateRequest) (*GenerateResponse, error)
    GetModels() []string
    GetSizeOptions() []string
    ValidateConfig(config map[string]interface{}) error
    ParseResponse(body []byte) (*GenerateResponse, error)
    GetProviderInfo() ProviderInfo
}
```

### AdapterRegistry

The `AdapterRegistry` manages provider registration and provides thread-safe access to providers:

```go
type AdapterRegistry struct {
    providers map[string]ImageProvider
    mutex     sync.RWMutex
}
```

Key methods:
- `RegisterProvider(provider ImageProvider) error` - Registers a new provider
- `GetProvider(providerID string) (ImageProvider, error)` - Retrieves a provider by ID
- `ListProviders() []ProviderInfo` - Lists all registered providers
- `HasProvider(providerID string) bool` - Checks if a provider exists

### ErrorHandler

The `ErrorHandler` provides unified error handling and parsing:

```go
type ErrorHandler struct{}
```

Key methods:
- `HandleProviderError(providerID string, responseBody []byte, statusCode int) *APIError`
- `HandleValidationError(field string, message string) *APIError`
- `HandleConfigurationError(providerID string, message string) *APIError`
- `IsRetryableError(apiError *APIError) bool`

## Adding New Providers

To add a new AI image generation provider:

1. **Implement the ImageProvider interface**:
   ```go
   type NewProvider struct {
       configService *ConfigService
       errorHandler  *ErrorHandler
   }
   
   func (n *NewProvider) GenerateImage(ctx context.Context, req *GenerateRequest) (*GenerateResponse, error) {
       // Implementation specific to the new provider
   }
   
   // Implement other required methods...
   ```

2. **Register the provider** in `ImageService.registerProviders()`:
   ```go
   func (s *ImageService) registerProviders() {
       // Existing providers...
       
       // Register new provider
       newProvider := NewNewProvider(s.configService)
       if err := s.registry.RegisterProvider(newProvider); err != nil {
           fmt.Printf("Failed to register new provider: %v\n", err)
       }
   }
   ```

3. **Add provider configuration** to the configuration file:
   ```json
   {
     "providers": {
       "new-provider": {
         "name": "New AI Provider",
         "apiKey": "",
         "baseUrl": "https://api.newprovider.com",
         "models": ["model-1", "model-2"],
         "defaultModel": "model-1",
         "sizeOptions": ["512x512", "1024x1024"]
       }
     }
   }
   ```

## Error Handling

The system provides unified error handling with the following error types:

- **Provider Errors**: Errors returned by AI service providers
- **Validation Errors**: Input validation failures
- **Configuration Errors**: Configuration-related issues
- **System Errors**: Internal system errors

All errors are returned in a standardized format:

```go
type APIError struct {
    Code      string `json:"code"`
    Message   string `json:"message"`
    Provider  string `json:"provider"`
    RequestID string `json:"requestId,omitempty"`
}
```

## Thread Safety

The `AdapterRegistry` is thread-safe and can be accessed concurrently from multiple goroutines. It uses read-write mutexes to ensure safe access to the provider map.

## Testing

The infrastructure includes comprehensive tests covering:

- Provider registration and retrieval
- Error handling for various scenarios
- Thread safety of the registry
- Integration with the ImageService

Run tests with:
```bash
go test -v ./adapter_test.go ./adapter_registry.go ./error_handler.go ./image_service.go ./dashscope_provider.go ./config_service.go ./interfaces.go ./types.go
```

## Example Implementation

See `example_provider.go` for a complete example of how to implement a new provider.

## Benefits

This architecture provides:

1. **Extensibility**: Easy to add new AI providers
2. **Consistency**: Unified interface across all providers
3. **Error Handling**: Standardized error handling and reporting
4. **Thread Safety**: Safe concurrent access to providers
5. **Testability**: Easy to test individual providers and the overall system
6. **Maintainability**: Clear separation of concerns and modular design