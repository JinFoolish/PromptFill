package backend

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// Template Management Methods

// LoadTemplates loads templates from file system
func (a *App) LoadTemplates() ([]Template, error) {
	data, err := os.ReadFile(a.templatesPath)
	if err != nil {
		if os.IsNotExist(err) {
			// Fallback to embedded default templates
			embeddedData, embedErr := defaultConfigFS.ReadFile("json/templates.json")
			if embedErr != nil {
				return []Template{}, nil
			}

			// Ensure directory exists before writing
			if err := os.MkdirAll(filepath.Dir(a.templatesPath), 0755); err == nil {
				// Write to disk for user customization
				_ = os.WriteFile(a.templatesPath, embeddedData, 0644)
			}

			data = embeddedData
		} else {
			return nil, fmt.Errorf("failed to read templates file: %w", err)
		}
	}

	var templates []Template
	if err := json.Unmarshal(data, &templates); err != nil {
		return []Template{}, nil
	}
	return templates, nil
}

// SaveTemplates saves templates to file system
func (a *App) SaveTemplates(templates []Template) error {
	data, err := json.MarshalIndent(templates, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal templates: %w", err)
	}
	return os.WriteFile(a.templatesPath, data, 0644)
}

// EnsureTemplate adds or updates a template
func (a *App) EnsureTemplate(template Template) error {
	templates, err := a.LoadTemplates()
	if err != nil {
		return err
	}

	found := false
	for i, t := range templates {
		if t.ID == template.ID {
			templates[i] = template
			found = true
			break
		}
	}

	if !found {
		templates = append(templates, template)
	}

	return a.SaveTemplates(templates)
}

// SetTemplateCover sets the cover image for a template, ensuring the image is saved locally
func (a *App) SetTemplateCover(templateID string, imageURL string) (string, error) {
	// Persist image locally
	localPath, err := a.persistImage(imageURL)
	if err != nil {
		return "", fmt.Errorf("failed to persist cover image: %w", err)
	}

	templates, err := a.LoadTemplates()
	if err != nil {
		return "", err
	}

	found := false
	for i, t := range templates {
		if t.ID == templateID {
			templates[i].ImageURL = localPath
			found = true
			break
		}
	}

	if !found {
		return "", fmt.Errorf("template not found: %s", templateID)
	}

	if err := a.SaveTemplates(templates); err != nil {
		return "", err
	}

	return localPath, nil
}

// DeleteTemplate deletes a template by ID
func (a *App) DeleteTemplate(id string) error {
	templates, err := a.LoadTemplates()
	if err != nil {
		return err
	}

	var newTemplates []Template
	for _, t := range templates {
		if t.ID != id {
			newTemplates = append(newTemplates, t)
		}
	}

	return a.SaveTemplates(newTemplates)
}
