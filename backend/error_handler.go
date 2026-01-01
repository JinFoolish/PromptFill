package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// ErrorHandler provides unified error handling across the application
type ErrorHandler struct{}

// NewErrorHandler creates a new error handler
func NewErrorHandler() *ErrorHandler {
	return &ErrorHandler{}
}

// HandleProviderError handles errors from AI service providers
func (h *ErrorHandler) HandleProviderError(providerID string, responseBody []byte, statusCode int) *APIError {
	// Try to extract structured error from response
	if apiError := h.extractStructuredError(providerID, responseBody); apiError != nil {
		return apiError
	}

	// Fall back to HTTP status code based error
	return h.createHTTPError(providerID, statusCode, string(responseBody))
}

// extractStructuredError attempts to extract structured error information from provider response
func (h *ErrorHandler) extractStructuredError(providerID string, responseBody []byte) *APIError {
	switch providerID {
	case "dashscope":
		return h.extractDashScopeError(responseBody)
	default:
		return h.extractGenericError(providerID, responseBody)
	}
}

// extractDashScopeError extracts error information from DashScope API response
func (h *ErrorHandler) extractDashScopeError(responseBody []byte) *APIError {
	var errorResp DashScopeError
	if err := json.Unmarshal(responseBody, &errorResp); err != nil {
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

// extractGenericError attempts to extract error from generic JSON response
func (h *ErrorHandler) extractGenericError(providerID string, responseBody []byte) *APIError {
	var genericError map[string]interface{}
	if err := json.Unmarshal(responseBody, &genericError); err != nil {
		return nil
	}

	// Try common error field names
	var code, message, requestID string

	if c, ok := genericError["error_code"].(string); ok {
		code = c
	} else if c, ok := genericError["code"].(string); ok {
		code = c
	} else if c, ok := genericError["error"].(string); ok {
		code = c
	}

	if m, ok := genericError["error_message"].(string); ok {
		message = m
	} else if m, ok := genericError["message"].(string); ok {
		message = m
	} else if m, ok := genericError["detail"].(string); ok {
		message = m
	}

	if r, ok := genericError["request_id"].(string); ok {
		requestID = r
	} else if r, ok := genericError["requestId"].(string); ok {
		requestID = r
	}

	if code == "" && message == "" {
		return nil
	}

	return &APIError{
		Code:      code,
		Message:   message,
		Provider:  providerID,
		RequestID: requestID,
	}
}

// createHTTPError creates an error based on HTTP status code
func (h *ErrorHandler) createHTTPError(providerID string, statusCode int, responseBody string) *APIError {
	var code, message string

	switch statusCode {
	case http.StatusBadRequest:
		code = "BAD_REQUEST"
		message = "Invalid request parameters"
	case http.StatusUnauthorized:
		code = "UNAUTHORIZED"
		message = "Invalid or missing API key"
	case http.StatusForbidden:
		code = "FORBIDDEN"
		message = "Access denied"
	case http.StatusNotFound:
		code = "NOT_FOUND"
		message = "API endpoint not found"
	case http.StatusTooManyRequests:
		code = "RATE_LIMIT_EXCEEDED"
		message = "Rate limit exceeded"
	case http.StatusInternalServerError:
		code = "INTERNAL_SERVER_ERROR"
		message = "Internal server error"
	case http.StatusBadGateway:
		code = "BAD_GATEWAY"
		message = "Bad gateway"
	case http.StatusServiceUnavailable:
		code = "SERVICE_UNAVAILABLE"
		message = "Service temporarily unavailable"
	case http.StatusGatewayTimeout:
		code = "GATEWAY_TIMEOUT"
		message = "Gateway timeout"
	default:
		code = fmt.Sprintf("HTTP_%d", statusCode)
		message = fmt.Sprintf("HTTP error %d", statusCode)
	}

	// Include response body if it's short and might contain useful info
	if len(responseBody) > 0 && len(responseBody) < 200 {
		message = fmt.Sprintf("%s: %s", message, strings.TrimSpace(responseBody))
	}

	return &APIError{
		Code:     code,
		Message:  message,
		Provider: providerID,
	}
}

// HandleSystemError handles system-level errors
func (h *ErrorHandler) HandleSystemError(operation string, err error) *APIError {
	return &APIError{
		Code:     "SYSTEM_ERROR",
		Message:  fmt.Sprintf("%s failed: %v", operation, err),
		Provider: "system",
	}
}

// HandleValidationError handles validation errors
func (h *ErrorHandler) HandleValidationError(field string, message string) *APIError {
	return &APIError{
		Code:     "VALIDATION_ERROR",
		Message:  fmt.Sprintf("Validation failed for %s: %s", field, message),
		Provider: "system",
	}
}

// HandleConfigurationError handles configuration-related errors
func (h *ErrorHandler) HandleConfigurationError(providerID string, message string) *APIError {
	return &APIError{
		Code:     "CONFIGURATION_ERROR",
		Message:  message,
		Provider: providerID,
	}
}

// IsRetryableError determines if an error is retryable
func (h *ErrorHandler) IsRetryableError(apiError *APIError) bool {
	if apiError == nil {
		return false
	}

	retryableCodes := map[string]bool{
		"RATE_LIMIT_EXCEEDED":   true,
		"INTERNAL_SERVER_ERROR": true,
		"BAD_GATEWAY":           true,
		"SERVICE_UNAVAILABLE":   true,
		"GATEWAY_TIMEOUT":       true,
		"NETWORK_ERROR":         true,
	}

	return retryableCodes[apiError.Code]
}

// FormatErrorForLogging formats an error for logging purposes
func (h *ErrorHandler) FormatErrorForLogging(apiError *APIError) string {
	if apiError == nil {
		return "unknown error"
	}

	parts := []string{
		fmt.Sprintf("Provider: %s", apiError.Provider),
		fmt.Sprintf("Code: %s", apiError.Code),
		fmt.Sprintf("Message: %s", apiError.Message),
	}

	if apiError.RequestID != "" {
		parts = append(parts, fmt.Sprintf("RequestID: %s", apiError.RequestID))
	}

	return strings.Join(parts, ", ")
}
