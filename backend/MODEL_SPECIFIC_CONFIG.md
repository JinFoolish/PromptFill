# Model-Specific Configuration Guide

This document explains how to configure different parameters and size options for different models in the AI image generation system.

## Configuration Structure

The configuration now supports model-specific settings for both `sizeOptions` and `requestTemplate`:

```json
{
  "providers": {
    "provider-id": {
      "models": ["model1", "model2"],
      "defaultModel": "model1",
      "sizeOptions": {
        "model1": ["size1", "size2"],
        "model2": ["size3", "size4"]
      },
      "requestTemplate": {
        "model1": {
          "model": "{{.Model}}",
          "parameters": {
            "param1": "value1"
          }
        },
        "model2": {
          "model": "{{.Model}}",
          "parameters": {
            "param1": "value2",
            "param2": "value3"
          }
        }
      }
    }
  }
}
```

## Example: DashScope Provider

The DashScope provider now supports two models with different configurations:

### z-image-turbo (Fast Generation)
- **Size Options**: Multiple aspect ratios including square and rectangular formats
- **Parameters**: 
  - `prompt_extend`: false (no prompt enhancement)
  - Basic generation settings

### z-image-pro (High Quality)
- **Size Options**: Standard sizes optimized for quality
- **Parameters**:
  - `prompt_extend`: true (enhanced prompts)
  - `quality`: "high"
  - `style`: "realistic"

## How It Works

1. **Size Options**: When a user selects a model, only the size options for that specific model are available
2. **Request Templates**: Each model uses its own request template with model-specific parameters
3. **Fallback**: If a model-specific template doesn't exist, the system falls back to the default model's template

## Adding New Models

To add a new model with different parameters:

1. Add the model to the `models` array
2. Add model-specific size options to `sizeOptions`
3. Add a model-specific request template to `requestTemplate`
4. Update the provider's `GetModels()` and `GetSizeOptions()` methods

## API Response

The API now returns model-specific size options in the provider info:

```json
{
  "providers": [
    {
      "id": "dashscope",
      "name": "阿里云百炼",
      "models": ["z-image-turbo", "z-image-pro"],
      "sizeOptions": {
        "z-image-turbo": ["1536*1536", "1296*1728", ...],
        "z-image-pro": ["1024*1024", "1536*1536", "2048*2048"]
      }
    }
  ]
}
```

This allows frontend applications to dynamically show appropriate size options based on the selected model.