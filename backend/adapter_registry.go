package main

import (
	"fmt"
	"sync"
)

// AdapterRegistry manages the registration and retrieval of image providers
type AdapterRegistry struct {
	providers map[string]ImageProvider
	mutex     sync.RWMutex
}

// NewAdapterRegistry creates a new adapter registry
func NewAdapterRegistry() *AdapterRegistry {
	return &AdapterRegistry{
		providers: make(map[string]ImageProvider),
	}
}

// RegisterProvider registers a new image provider
func (r *AdapterRegistry) RegisterProvider(provider ImageProvider) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	info := provider.GetProviderInfo()
	if info.ID == "" {
		return fmt.Errorf("provider ID cannot be empty")
	}

	// Validate provider configuration
	if err := provider.ValidateConfig(map[string]interface{}{}); err != nil {
		// This is expected for providers that require configuration
		// We still register them but they won't be usable until configured
	}

	r.providers[info.ID] = provider
	return nil
}

// GetProvider retrieves a provider by ID
func (r *AdapterRegistry) GetProvider(providerID string) (ImageProvider, error) {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	provider, exists := r.providers[providerID]
	if !exists {
		return nil, fmt.Errorf("provider %s not found", providerID)
	}

	return provider, nil
}

// ListProviders returns information about all registered providers
func (r *AdapterRegistry) ListProviders() []ProviderInfo {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	providers := make([]ProviderInfo, 0, len(r.providers))
	for _, provider := range r.providers {
		providers = append(providers, provider.GetProviderInfo())
	}

	return providers
}

// HasProvider checks if a provider is registered
func (r *AdapterRegistry) HasProvider(providerID string) bool {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	_, exists := r.providers[providerID]
	return exists
}

// UnregisterProvider removes a provider from the registry
func (r *AdapterRegistry) UnregisterProvider(providerID string) error {
	r.mutex.Lock()
	defer r.mutex.Unlock()

	if _, exists := r.providers[providerID]; !exists {
		return fmt.Errorf("provider %s not found", providerID)
	}

	delete(r.providers, providerID)
	return nil
}

// GetProviderCount returns the number of registered providers
func (r *AdapterRegistry) GetProviderCount() int {
	r.mutex.RLock()
	defer r.mutex.RUnlock()

	return len(r.providers)
}
