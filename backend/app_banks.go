package backend

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// Bank Management Methods

// LoadBanks loads vocab banks from file system
func (a *App) LoadBanks() (BankMap, error) {
	data, err := os.ReadFile(a.banksPath)
	if err != nil {
		if os.IsNotExist(err) {
			// Fallback to embedded default banks
			embeddedData, embedErr := defaultConfigFS.ReadFile("json/banks.json")
			if embedErr != nil {
				return make(BankMap), nil
			}

			// Ensure directory exists before writing
			if err := os.MkdirAll(filepath.Dir(a.banksPath), 0755); err == nil {
				// Write to disk for user customization
				_ = os.WriteFile(a.banksPath, embeddedData, 0644)
			}

			data = embeddedData
		} else {
			return nil, fmt.Errorf("failed to read banks file: %w", err)
		}
	}

	var banks BankMap
	if err := json.Unmarshal(data, &banks); err != nil {
		return make(BankMap), nil
	}
	return banks, nil
}

// SaveBanks saves vocab banks to file system
func (a *App) SaveBanks(banks BankMap) error {
	data, err := json.MarshalIndent(banks, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal banks: %w", err)
	}
	return os.WriteFile(a.banksPath, data, 0644)
}

// EnsureBank adds or updates a bank
func (a *App) EnsureBank(key string, item BankItem) error {
	banks, err := a.LoadBanks()
	if err != nil {
		return err
	}

	banks[key] = item
	return a.SaveBanks(banks)
}

// DeleteBank deletes a bank by key
func (a *App) DeleteBank(key string) error {
	banks, err := a.LoadBanks()
	if err != nil {
		return err
	}

	delete(banks, key)
	return a.SaveBanks(banks)
}
