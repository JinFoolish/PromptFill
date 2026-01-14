package backend

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// Category Management Methods
// LoadCategories loads the category definitions
func (a *App) LoadCategories() (CategoryMap, error) {
	data, err := os.ReadFile(a.categoriesPath)
	if err != nil {
		if os.IsNotExist(err) {
			// Fallback to embedded default categories
			embeddedData, embedErr := defaultConfigFS.ReadFile("json/categories.json")
			if embedErr != nil {
				return make(CategoryMap), nil
			}

			// Ensure directory exists before writing
			if err := os.MkdirAll(filepath.Dir(a.categoriesPath), 0755); err == nil {
				// Write to disk for user customization
				_ = os.WriteFile(a.categoriesPath, embeddedData, 0644)
			}

			data = embeddedData
		} else {
			return nil, fmt.Errorf("failed to read categories file: %w", err)
		}
	}

	var categories CategoryMap
	if err := json.Unmarshal(data, &categories); err != nil {
		return make(CategoryMap), nil
	}
	return categories, nil
}
// SaveCategories saves categories to file system
func (a *App) SaveCategories(categories CategoryMap) error {
	data, err := json.MarshalIndent(categories, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal categories: %w", err)
	}
	return os.WriteFile(a.categoriesPath, data, 0644)
}

// EnsureCategory adds or updates a category
func (a *App) EnsureCategory(key string, category Category) error {
	categories, err := a.LoadCategories()
	if err != nil {
		return err
	}

	// Ensure ID matches key
	category.ID = key
	categories[key] = category
	return a.SaveCategories(categories)
}

// DeleteCategory deletes a category by key
func (a *App) DeleteCategory(key string) error {
	categories, err := a.LoadCategories()
	if err != nil {
		return err
	}

	delete(categories, key)
	return a.SaveCategories(categories)
}
