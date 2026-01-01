/**
 * AI Image Generation API Service
 * 
 * This service provides the interface for communicating with the Go backend
 * for AI image generation functionality.
 */

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Generate images using AI
 * @param {Object} request - Generation request
 * @param {string} request.prompt - Text prompt for image generation
 * @param {string} request.provider - AI service provider ID (optional, uses active provider if not specified)
 * @param {string} request.model - Model to use (optional, uses default model if not specified)
 * @param {number} request.count - Number of images to generate (1-10, default: 1)
 * @param {string} request.size - Image size (optional, uses default size if not specified)
 * @param {Object} request.parameters - Additional parameters (optional)
 * @returns {Promise<Object>} Generation response
 */
export async function generateImages(request) {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get current configuration
 * @returns {Promise<Object>} Configuration response
 */
export async function getConfig() {
  const response = await fetch(`${API_BASE_URL}/config`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update provider configuration
 * @param {Object} request - Configuration update request
 * @param {string} request.provider - Provider ID
 * @param {Object} request.config - Configuration object
 * @returns {Promise<Object>} Update response
 */
export async function updateConfig(request) {
  const response = await fetch(`${API_BASE_URL}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get available providers
 * @returns {Promise<Object>} Providers response
 */
export async function getProviders() {
  const response = await fetch(`${API_BASE_URL}/providers`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Save image file
 * @param {Object} request - Save file request
 * @param {string} request.imageUrl - Image URL to save
 * @param {string} request.filename - Desired filename
 * @param {string} request.path - Save path (optional)
 * @returns {Promise<Object>} Save response
 */
export async function saveImageFile(request) {
  const response = await fetch(`${API_BASE_URL}/files/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get image file by ID
 * @param {string} id - Image file ID
 * @returns {Promise<Blob>} Image file blob
 */
export async function getImageFile(id) {
  const response = await fetch(`${API_BASE_URL}/files/${id}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.blob();
}

/**
 * Check backend health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Type definitions for TypeScript-like documentation
/**
 * @typedef {Object} GenerateRequest
 * @property {string} prompt - Text prompt for image generation
 * @property {string} [provider] - AI service provider ID
 * @property {string} [model] - Model to use
 * @property {number} [count] - Number of images to generate (1-10)
 * @property {string} [size] - Image size
 * @property {Object} [parameters] - Additional parameters
 */

/**
 * @typedef {Object} GenerateResponse
 * @property {boolean} success - Whether the generation was successful
 * @property {GeneratedImage[]} [images] - Generated images (if successful)
 * @property {APIError} [error] - Error information (if failed)
 */

/**
 * @typedef {Object} GeneratedImage
 * @property {string} id - Unique image ID
 * @property {string} url - Image URL
 * @property {number} [width] - Image width
 * @property {number} [height] - Image height
 */

/**
 * @typedef {Object} APIError
 * @property {string} code - Error code
 * @property {string} message - Error message
 * @property {string} provider - Provider that generated the error
 * @property {string} [requestId] - Request ID for tracking
 */

/**
 * @typedef {Object} ConfigResponse
 * @property {ProviderConfig[]} providers - Available providers
 * @property {string} activeProvider - Currently active provider ID
 */

/**
 * @typedef {Object} ProviderConfig
 * @property {string} id - Provider ID
 * @property {string} name - Provider display name
 * @property {string} apiKey - API key
 * @property {string} [baseUrl] - Base URL
 * @property {string[]} models - Available models
 * @property {string} defaultModel - Default model
 * @property {string[]} sizeOptions - Available size options
 */

/**
 * @typedef {Object} ProviderInfo
 * @property {string} id - Provider ID
 * @property {string} name - Provider display name
 * @property {string[]} models - Available models
 * @property {string[]} sizeOptions - Available size options
 */