# AI Image Generation Backend

This is the Go backend for the AI Image Generation feature, built with Gin web framework and designed to work with both web and desktop versions via Wails.

## Features

- RESTful API for image generation
- Support for multiple AI service providers (starting with Alibaba Cloud DashScope)
- Configuration management with JSON files
- CORS support for web version
- Extensible provider architecture

## API Endpoints

### Image Generation
- `POST /api/v1/generate` - Generate images
- `GET /api/v1/providers` - Get available providers

### Configuration
- `GET /api/v1/config` - Get current configuration
- `POST /api/v1/config` - Update configuration

### File Management
- `POST /api/v1/files/save` - Save image file (placeholder)
- `GET /api/v1/files/:id` - Get image file (placeholder)

### Health Check
- `GET /api/v1/health` - Health check endpoint

## Configuration

The backend uses a JSON configuration file located at `config/ai-providers.json`. The configuration includes:

- Provider settings (API keys, base URLs, models)
- Active provider selection
- Request templates and response mappings

### Example Configuration

```json
{
  "providers": {
    "dashscope": {
      "id": "dashscope",
      "name": "阿里云百炼",
      "apiKey": "your-api-key-here",
      "baseUrl": "https://dashscope.aliyuncs.com",
      "models": ["z-image-turbo"],
      "defaultModel": "z-image-turbo",
      "sizeOptions": ["1536*1536", "1296*1728", "1728*1296"]
    }
  },
  "activeProvider": "dashscope"
}
```

## Running the Backend

### Prerequisites

- Go 1.22 or later
- Valid API key for your chosen provider

### Development Mode
```bash
cd backend
go run .
```

The server will start on port 8080.

### Building
```bash
cd backend
go build -o ai-image-generation .
```

## Project Structure

```
backend/
├── main.go              # Application entry point and Wails setup
├── api_server.go        # HTTP server and routing
├── types.go             # Data structures and types
├── interfaces.go        # Interface definitions
├── config_service.go    # Configuration management
├── image_service.go     # Image generation service
├── dashscope_provider.go # Alibaba Cloud DashScope provider
├── handlers.go          # HTTP request handlers
└── config/              # Configuration files
    └── ai-providers.json
```

## Adding New Providers

To add a new AI service provider:

1. Implement the `ImageProvider` interface
2. Register the provider in `image_service.go`
3. Add provider configuration to the default config
4. Update the configuration file structure if needed

## Error Handling

The backend follows a consistent error handling pattern:
- API errors are returned in a standardized format
- Provider-specific errors are preserved and passed through
- System errors are wrapped with appropriate context

## Testing

Unit tests and property-based tests will be added in subsequent tasks as specified in the implementation plan.