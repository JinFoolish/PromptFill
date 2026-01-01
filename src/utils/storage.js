/**
 * IndexedDB Storage Adapter for AI Image Generation History
 * 
 * This module provides a unified storage solution for both Web and Desktop platforms
 * using IndexedDB to store image blobs and metadata for AI-generated images.
 * 
 * Requirements: 5.1, 5.3, 8.2
 */

/**
 * Database schema configuration
 */
const DB_CONFIG = {
  name: 'ai-image-history',
  version: 1,
  stores: {
    metadata: {
      keyPath: 'id',
      indexes: {
        createdAt: 'createdAt',
        provider: 'provider',
        savedAt: 'savedAt'
      }
    },
    images: {
      keyPath: 'id',
      indexes: {
        createdAt: 'createdAt',
        size: 'size'
      }
    }
  }
};

/**
 * Storage adapter interface implementation using IndexedDB
 */
class IndexedDBStorage {
  constructor() {
    this.db = null;
    this.dbName = DB_CONFIG.name;
    this.version = DB_CONFIG.version;
    this.imageStore = 'images';
    this.metadataStore = 'metadata';
  }

  /**
   * Initialize the IndexedDB database with proper schema
   * @returns {Promise<void>}
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create metadata store
        if (!db.objectStoreNames.contains(this.metadataStore)) {
          const metadataStore = db.createObjectStore(this.metadataStore, {
            keyPath: DB_CONFIG.stores.metadata.keyPath
          });
          
          // Create indexes for metadata store
          Object.entries(DB_CONFIG.stores.metadata.indexes).forEach(([indexName, keyPath]) => {
            metadataStore.createIndex(indexName, keyPath, { unique: false });
          });
        }

        // Create images store
        if (!db.objectStoreNames.contains(this.imageStore)) {
          const imageStore = db.createObjectStore(this.imageStore, {
            keyPath: DB_CONFIG.stores.images.keyPath
          });
          
          // Create indexes for images store
          Object.entries(DB_CONFIG.stores.images.indexes).forEach(([indexName, keyPath]) => {
            imageStore.createIndex(indexName, keyPath, { unique: false });
          });
        }
      };
    });
  }

  /**
   * Ensure database is initialized before operations
   * @private
   */
  async _ensureInitialized() {
    if (!this.db) {
      await this.initialize();
    }
  }

  /**
   * Save an image blob with metadata to storage
   * @param {string} id - Unique identifier for the image
   * @param {Blob} imageBlob - Image blob data
   * @param {Object} metadata - Image metadata
   * @returns {Promise<void>}
   */
  async saveImage(id, imageBlob, metadata) {
    await this._ensureInitialized();

    const transaction = this.db.transaction([this.imageStore, this.metadataStore], 'readwrite');
    
    try {
      // Save image blob
      const imageData = {
        id: id,
        data: imageBlob,
        mimeType: imageBlob.type,
        size: imageBlob.size,
        createdAt: Date.now()
      };
      
      const imageStore = transaction.objectStore(this.imageStore);
      await this._promisifyRequest(imageStore.put(imageData));

      // Save metadata
      const metadataRecord = {
        ...metadata,
        id: id,
        savedAt: Date.now(),
        totalSize: imageBlob.size
      };
      
      const metadataStore = transaction.objectStore(this.metadataStore);
      await this._promisifyRequest(metadataStore.put(metadataRecord));

      await this._promisifyTransaction(transaction);
    } catch (error) {
      transaction.abort();
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  /**
   * Retrieve an image blob and its metadata by ID
   * @param {string} id - Image identifier
   * @returns {Promise<{blob: Blob, metadata: Object}>}
   */
  async getImage(id) {
    await this._ensureInitialized();

    const transaction = this.db.transaction([this.imageStore, this.metadataStore], 'readonly');
    
    try {
      const imageStore = transaction.objectStore(this.imageStore);
      const metadataStore = transaction.objectStore(this.metadataStore);

      const [imageData, metadata] = await Promise.all([
        this._promisifyRequest(imageStore.get(id)),
        this._promisifyRequest(metadataStore.get(id))
      ]);

      if (!imageData || !metadata) {
        throw new Error(`Image with id ${id} not found`);
      }

      return {
        blob: imageData.data,
        metadata: metadata
      };
    } catch (error) {
      throw new Error(`Failed to retrieve image: ${error.message}`);
    }
  }

  /**
   * List all stored image metadata
   * @returns {Promise<Array>} Array of metadata objects
   */
  async listImages() {
    await this._ensureInitialized();

    const transaction = this.db.transaction([this.metadataStore], 'readonly');
    const store = transaction.objectStore(this.metadataStore);
    
    try {
      const request = store.getAll();
      const results = await this._promisifyRequest(request);
      
      // Sort by savedAt timestamp (newest first)
      return results.sort((a, b) => b.savedAt - a.savedAt);
    } catch (error) {
      throw new Error(`Failed to list images: ${error.message}`);
    }
  }

  /**
   * Delete an image and its metadata by ID
   * @param {string} id - Image identifier
   * @returns {Promise<void>}
   */
  async deleteImage(id) {
    await this._ensureInitialized();

    const transaction = this.db.transaction([this.imageStore, this.metadataStore], 'readwrite');
    
    try {
      const imageStore = transaction.objectStore(this.imageStore);
      const metadataStore = transaction.objectStore(this.metadataStore);

      await Promise.all([
        this._promisifyRequest(imageStore.delete(id)),
        this._promisifyRequest(metadataStore.delete(id))
      ]);

      await this._promisifyTransaction(transaction);
    } catch (error) {
      transaction.abort();
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Clear all stored images and metadata
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this._ensureInitialized();

    const transaction = this.db.transaction([this.imageStore, this.metadataStore], 'readwrite');
    
    try {
      const imageStore = transaction.objectStore(this.imageStore);
      const metadataStore = transaction.objectStore(this.metadataStore);

      await Promise.all([
        this._promisifyRequest(imageStore.clear()),
        this._promisifyRequest(metadataStore.clear())
      ]);

      await this._promisifyTransaction(transaction);
    } catch (error) {
      transaction.abort();
      throw new Error(`Failed to clear all data: ${error.message}`);
    }
  }

  /**
   * Get storage usage information
   * @returns {Promise<{used: number, quota: number, count: number}>}
   */
  async getStorageUsage() {
    await this._ensureInitialized();

    try {
      // Get storage estimate if available
      let quota = 0;
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        quota = estimate.quota || 0;
      }

      // Calculate used space by summing all image sizes
      const metadata = await this.listImages();
      const used = metadata.reduce((total, record) => total + (record.totalSize || 0), 0);
      const count = metadata.length;

      return { used, quota, count };
    } catch (error) {
      throw new Error(`Failed to get storage usage: ${error.message}`);
    }
  }

  /**
   * Export all history data as a compressed blob
   * @returns {Promise<Blob>} Compressed export data
   */
  async exportHistory() {
    await this._ensureInitialized();

    try {
      const metadata = await this.listImages();
      const exportData = {
        version: this.version,
        exportedAt: Date.now(),
        records: []
      };

      // Collect all image data and metadata
      for (const meta of metadata) {
        const { blob } = await this.getImage(meta.id);
        const arrayBuffer = await blob.arrayBuffer();
        
        exportData.records.push({
          metadata: meta,
          imageData: Array.from(new Uint8Array(arrayBuffer)),
          mimeType: blob.type
        });
      }

      // Convert to JSON and create blob
      const jsonString = JSON.stringify(exportData);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      throw new Error(`Failed to export history: ${error.message}`);
    }
  }

  /**
   * Import history data from a file
   * @param {File} file - Import file
   * @returns {Promise<void>}
   */
  async importHistory(file) {
    await this._ensureInitialized();

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (!importData.records || !Array.isArray(importData.records)) {
        throw new Error('Invalid import file format');
      }

      // Import each record
      for (const record of importData.records) {
        const { metadata, imageData, mimeType } = record;
        
        // Reconstruct blob from array data
        const uint8Array = new Uint8Array(imageData);
        const blob = new Blob([uint8Array], { type: mimeType });
        
        // Save to storage
        await this.saveImage(metadata.id, blob, metadata);
      }
    } catch (error) {
      throw new Error(`Failed to import history: ${error.message}`);
    }
  }

  /**
   * Convert IndexedDB request to Promise
   * @private
   * @param {IDBRequest} request - IndexedDB request
   * @returns {Promise}
   */
  _promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Convert IndexedDB transaction to Promise
   * @private
   * @param {IDBTransaction} transaction - IndexedDB transaction
   * @returns {Promise}
   */
  _promisifyTransaction(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create and export singleton instance
const storageAdapter = new IndexedDBStorage();

export default storageAdapter;

/**
 * Type definitions for TypeScript compatibility
 * 
 * @typedef {Object} ImageMetadata
 * @property {string} id - Unique identifier
 * @property {string} prompt - Generation prompt
 * @property {Array} images - Image information array
 * @property {string} provider - AI service provider
 * @property {string} model - AI model used
 * @property {Object} parameters - Generation parameters
 * @property {number} createdAt - Creation timestamp
 * @property {number} savedAt - Save timestamp
 * @property {number} totalSize - Total size in bytes
 * 
 * @typedef {Object} ImageBlob
 * @property {string} id - Unique identifier
 * @property {Blob} data - Image blob data
 * @property {string} mimeType - MIME type
 * @property {number} size - Size in bytes
 * @property {number} createdAt - Creation timestamp
 * 
 * @typedef {Object} StorageUsage
 * @property {number} used - Used storage in bytes
 * @property {number} quota - Available quota in bytes
 * @property {number} count - Number of stored images
 */