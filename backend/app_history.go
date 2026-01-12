package backend

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// AI History Management Methods

// SaveAIHistory saves AI generation history to file system
func (a *App) SaveAIHistory(history []HistoryRecord) error {
	data, err := json.MarshalIndent(history, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal history: %w", err)
	}

	return os.WriteFile(a.historyPath, data, 0644)
}

// LoadAIHistory loads AI generation history from file system
func (a *App) LoadAIHistory() ([]HistoryRecord, error) {
	data, err := os.ReadFile(a.historyPath)
	if err != nil {
		if os.IsNotExist(err) {
			return []HistoryRecord{}, nil // Return empty array if file doesn't exist
		}
		return nil, fmt.Errorf("failed to read history file: %w", err)
	}

	var history []HistoryRecord
	if err := json.Unmarshal(data, &history); err != nil {
		// Return empty array if parsing fails to avoid breaking the app
		return []HistoryRecord{}, nil
	}

	return history, nil
}

// DeleteAIHistoryRecord deletes a specific record from AI history
func (a *App) DeleteAIHistoryRecord(recordId string) error {
	history, err := a.LoadAIHistory()
	if err != nil {
		return fmt.Errorf("failed to load history: %w", err)
	}

	// Find the record to delete and remove associated image files
	var recordToDelete *HistoryRecord
	for _, record := range history {
		if record.ID == recordId {
			recordToDelete = &record
			break
		}
	}

	// Delete image files associated with this record
	if recordToDelete != nil {
		for _, img := range recordToDelete.Images {
			if img.URL != "" {
				// Check if it's a local file path
				if !strings.HasPrefix(img.URL, "http://") && !strings.HasPrefix(img.URL, "https://") {
					// Try to delete the file
					if err := os.Remove(img.URL); err != nil {
						// Log error but don't fail the operation
						fmt.Printf("Warning: Failed to delete image file %s: %v\n", img.URL, err)
					}
				}
			}
		}
	}

	// Filter out the specified record
	filtered := make([]HistoryRecord, 0, len(history))
	for _, record := range history {
		if record.ID != recordId {
			filtered = append(filtered, record)
		}
	}

	return a.SaveAIHistory(filtered)
}

// AddHistoryRecord saves a history record and ensures images are saved locally
func (a *App) AddHistoryRecord(record HistoryRecord) error {
	// Ensure all images are saved locally
	for i, img := range record.Images {
		if strings.HasPrefix(img.URL, "http://") || strings.HasPrefix(img.URL, "https://") {
			// Download and save locally
			localPath, err := a.downloadImage(img.URL)
			if err != nil {
				fmt.Printf("Warning: Failed to download image %s: %v\n", img.URL, err)
				continue
			}
			record.Images[i].URL = localPath
		}
	}

	// Check if record exists (update) or new
	history, err := a.LoadAIHistory()
	if err != nil {
		history = []HistoryRecord{}
	}

	// Add to history (prepend for consistency usually, or append?)
	// Let's prepend so newest is first implies UI sorting, but appending is safer for file structure.
	// UI can handle sorting.
	history = append(history, record)

	return a.SaveAIHistory(history)
}

// DownloadImageAndSaveHistory downloads an image from URL to local data folder and saves to history
// Returns the local file path
// DownloadImageAndSaveHistory downloads an image from URL (or handles data URI) to local data folder and saves to history
// Returns the local file path
// post-refactor: use persistImage helper
func (a *App) DownloadImageAndSaveHistory(imageURL string, prompt string, provider string, model string, size string, parameters map[string]interface{}) (string, error) {
	localPath, err := a.persistImage(imageURL)
	if err != nil {
		return "", err
	}

	// Generate filename based on timestamp (persistImage creates a name, but for history we might want just ID linking?
	// persistImage returns full path. We can use that.)

	// Create history record
	// Extract filename from localPath just for unique ID if needed
	filename := filepath.Base(localPath)
	recordID := fmt.Sprintf("record_%s", filename)

	record := HistoryRecord{
		ID: recordID,
		Params: GenerationParams{
			Prompt:     prompt,
			Provider:   provider,
			Model:      model,
			Size:       size,
			Parameters: parameters,
		},
		Images: []GeneratedImage{
			{
				ID:  recordID,
				URL: localPath,
			},
		},
		Timestamp: time.Now().Unix(),
		Metadata:  make(map[string]interface{}),
	}

	// Load existing history
	history, err := a.LoadAIHistory()
	if err != nil {
		history = []HistoryRecord{}
	}

	// Add new record
	history = append(history, record)

	// Save history
	if err := a.SaveAIHistory(history); err != nil {
		// If history save fails, we still have the image saved, so log error but don't fail
		fmt.Printf("Warning: Failed to save history record: %v\n", err)
	}

	return localPath, nil
}
