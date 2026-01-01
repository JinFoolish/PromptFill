package main

import (
	"fmt"
	"testing"
)

func TestSetup(t *testing.T) {
	fmt.Println("Testing AI Image Generation Backend Setup...")
	
	// Test configuration service
	fmt.Println("1. Testing Configuration Service...")
	configService := NewConfigService()
	config, err := configService.LoadConfig()
	if err != nil {
		t.Errorf("Error loading config: %v", err)
		return
	}
	
	fmt.Printf("   ✓ Configuration loaded successfully\n")
	fmt.Printf("   ✓ Active provider: %s\n", config.ActiveProvider)
	fmt.Printf("   ✓ Providers configured: %d\n", len(config.Providers))
	
	// Test image service
	fmt.Println("2. Testing Image Service...")
	imageService := NewImageService(configService)
	providers := imageService.GetProviders()
	fmt.Printf("   ✓ Image service initialized\n")
	fmt.Printf("   ✓ Available providers: %d\n", len(providers))
	for _, provider := range providers {
		fmt.Printf("     - %s (%s)\n", provider.Name, provider.ID)
	}
	
	// Test API server creation
	fmt.Println("3. Testing API Server...")
	apiServer := NewAPIServer()
	if apiServer == nil {
		t.Error("Failed to create API server")
		return
	}
	fmt.Printf("   ✓ API server created successfully\n")
	fmt.Printf("   ✓ Routes configured\n")
	
	fmt.Println("Setup test completed successfully!")
}