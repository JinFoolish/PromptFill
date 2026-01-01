# AI Image Generation - Project Setup

This document describes the project structure and setup for the AI Image Generation feature.

## Architecture Overview

The project uses a **front-end + back-end separation architecture**:

- **Frontend**: React + Vite (existing Prompt Fill application)
- **Backend**: Go + Gin web framework
- **Desktop**: Wails v2 for packaging
- **Web**: Direct HTTP API communication

## Project Structure

```
├── backend/                    # Go backend
│   ├── main.go                # Application entry point & Wails setup
│   ├── api_server.go          # HTTP server and routing
│   ├── types.go               # Data structures and types
│   ├── interfaces.go          # Interface definitions
│   ├── config_service.go      # Configuration management
│   ├── image_service.go       # Image generation service
│   ├── dashscope_provider.go  # Alibaba Cloud DashScope provider
│   ├── handlers.go            # HTTP request handlers
│   ├── main_test.go           # Setup tests
│   ├── go.mod                 # Go module definition
│   ├── config/                # Configuration files
│   │   └── ai-providers.json  # Provider configurations
│   └── dist/                  # Embedded frontend assets
│       └── index.html         # Placeholder for frontend build
├── src/
│   └── services/
│       └── aiImageApi.js      # Frontend API service
├── wails.json                 # Wails configuration
├── build-desktop.bat          # Desktop build script (Windows)
├── build-desktop.sh           # Desktop build script (Unix)
├── run-web.bat                # Web development script (Windows)
├── run-web.sh                 # Web development script (Unix)
└── package.json               # Updated with new scripts
```

## Core Interfaces

### Backend API Endpoints

- `POST /api/v1/generate` - Generate images
- `GET /api/v1/config` - Get current configuration
- `POST /api/v1/config` - Update configuration
- `GET /api/v1/providers` - Get available providers
- `POST /api/v1/files/save` - Save image file (placeholder)
- `GET /api/v1/files/:id` - Get image file (placeholder)
- `GET /api/v1/health` - Health check

### Frontend-Backend Communication

The frontend communicates with the backend through:
- **Web version**: Direct HTTP API calls to `http://localhost:8080`
- **Desktop version**: Same HTTP API through Wails runtime

### Configuration Management

Configuration is stored in `backend/config/ai-providers.json`:

```json
{
  "providers": {
    "dashscope": {
      "id": "dashscope",
      "name": "阿里云百炼",
      "apiKey": "",
      "baseUrl": "https://dashscope.aliyuncs.com",
      "models": ["z-image-turbo"],
      "defaultModel": "z-image-turbo",
      "sizeOptions": ["1536*1536", "1296*1728", ...]
    }
  },
  "activeProvider": "dashscope"
}
```

## Development Workflow

### Prerequisites

- Go 1.22 or later
- Node.js and npm
- Wails v2.11.0 (for desktop builds): `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Running the Application

#### Web Version (Development)
```bash
# Terminal 1: Start backend
npm run backend:dev

# Terminal 2: Start frontend
npm run dev
```

Or use the combined script:
```bash
npm run web:dev
```

#### Desktop Version (Development)
```bash
npm run desktop:dev
```

#### Building for Production

**Web Version:**
```bash
npm run web:build
```

**Desktop Version:**
```bash
npm run desktop:build
# or use the platform-specific scripts
./build-desktop.sh    # Unix/Linux/macOS
./build-desktop.bat   # Windows
```

## Service Provider Architecture

The backend uses an extensible provider architecture:

1. **ImageProvider Interface**: Defines the contract for AI service providers
2. **Provider Registration**: Providers are registered in `image_service.go`
3. **Configuration-Driven**: Provider settings are managed through JSON configuration
4. **Error Handling**: Standardized error format across all providers

### Adding New Providers

To add a new AI service provider:

1. Implement the `ImageProvider` interface
2. Register the provider in `NewImageService()`
3. Add default configuration to `createDefaultConfig()`
4. Update the configuration file structure if needed

## Testing

The backend includes comprehensive testing:

```bash
cd backend
go test -v
```

Current test coverage:
- ✅ Configuration service initialization
- ✅ Image service setup
- ✅ API server creation
- ✅ Provider registration

## Next Steps

This setup completes **Task 1: 设置项目结构和核心接口**. The following components are ready:

1. ✅ Go backend project structure
2. ✅ Wails configuration and build scripts
3. ✅ Frontend-backend communication interfaces
4. ✅ Service provider configuration file structure

The next tasks will implement:
- Backend core functionality (configuration management, service adapters)
- Alibaba Cloud DashScope adapter
- Frontend storage layer
- UI components
- Integration and testing