/**
 * Secure Storage Utility
 * Implements modern security practices for client-side data storage
 */

// Encryption utilities
const generateEncryptionKey = async () => {
  // Generate a CryptoKey for AES-GCM encryption
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    crypto.getRandomValues(new Uint8Array(32)),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: crypto.getRandomValues(new Uint8Array(16)),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptData = async (data, key) => {
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
};

const decryptData = async (encryptedData, key) => {
  try {
    const decoder = new TextDecoder();
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Session-based storage with automatic cleanup
class SecureSessionStorage {
  constructor() {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      this.isServer = true;
      this.sessionKey = 'server_session_key';
      this.encryptionKey = null;
      return;
    }
    
    this.isServer = false;
    this.sessionKey = this.getOrCreateSessionKey();
    this.encryptionKey = null;
    this.setupSessionCleanup();
    this.initializeEncryption();
  }

  async initializeEncryption() {
    if (this.isServer) return;
    
    try {
      this.encryptionKey = await generateEncryptionKey();
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
    }
  }

  getOrCreateSessionKey() {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return 'server_session_key';
    }
    
    let sessionKey = sessionStorage.getItem('secure_session_id');
    if (!sessionKey) {
      sessionKey = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('secure_session_id', sessionKey);
    }
    return sessionKey;
  }

  setupSessionCleanup() {
    if (this.isServer || typeof window === 'undefined') return;
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.clearSessionData();
    });

    // Clean up on tab close
    window.addEventListener('pagehide', () => {
      this.clearSessionData();
    });
  }

  async setItem(key, value, options = {}) {
    if (this.isServer || typeof sessionStorage === 'undefined') return;
    
    const data = {
      value,
      timestamp: Date.now(),
      expires: options.expires ? Date.now() + options.expires : null,
      encrypted: options.encrypt !== false
    };

    if (data.encrypted) {
      // Wait for encryption key to be ready
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }
      
      if (this.encryptionKey) {
        const encrypted = await encryptData(data, this.encryptionKey);
        if (encrypted) {
          sessionStorage.setItem(`${this.sessionKey}_${key}`, encrypted);
        }
      } else {
        // Fallback to unencrypted storage if encryption fails
        sessionStorage.setItem(`${this.sessionKey}_${key}`, JSON.stringify(data));
      }
    } else {
      sessionStorage.setItem(`${this.sessionKey}_${key}`, JSON.stringify(data));
    }
  }

  async getItem(key) {
    if (this.isServer || typeof sessionStorage === 'undefined') return null;
    
    const encryptedData = sessionStorage.getItem(`${this.sessionKey}_${key}`);
    if (!encryptedData) return null;

    try {
      let data;
      if (encryptedData.startsWith('{')) {
        // Unencrypted data
        data = JSON.parse(encryptedData);
      } else {
        // Encrypted data - ensure encryption key is ready
        if (!this.encryptionKey) {
          await this.initializeEncryption();
        }
        
        if (this.encryptionKey) {
          data = await decryptData(encryptedData, this.encryptionKey);
        } else {
          console.error('Encryption key not available for decryption');
          return null;
        }
      }

      if (!data) return null;

      // Check expiration
      if (data.expires && Date.now() > data.expires) {
        this.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  }

  removeItem(key) {
    if (this.isServer || typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(`${this.sessionKey}_${key}`);
  }

  clearSessionData() {
    if (this.isServer || typeof sessionStorage === 'undefined') return;
    
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.sessionKey)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

// IndexedDB for larger datasets
class SecureIndexedDB {
  constructor() {
    this.dbName = 'SecureFontStore';
    this.dbVersion = 1;
    this.storeName = 'userData';
    this.isServer = typeof window === 'undefined' || typeof indexedDB === 'undefined';
  }

  async initDB() {
    if (this.isServer) {
      throw new Error('IndexedDB not available on server side');
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeData(key, data, options = {}) {
    if (this.isServer) return;
    
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    const record = {
      id: key,
      data,
      timestamp: Date.now(),
      expires: options.expires ? Date.now() + options.expires : null
    };

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getData(key) {
    if (this.isServer) return null;
    
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const record = request.result;
        if (!record) {
          resolve(null);
          return;
        }

        // Check expiration
        if (record.expires && Date.now() > record.expires) {
          this.deleteData(key);
          resolve(null);
          return;
        }

        resolve(record.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(key) {
    if (this.isServer) return;
    
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredData() {
    if (this.isServer) return;
    
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const record = cursor.value;
          if (record.expires && Date.now() > record.expires) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Lazy initialization - only instantiate in browser
let secureStorage = null;
let secureDB = null;

function getSecureStorage() {
  if (typeof window === 'undefined') return null;
  if (!secureStorage) secureStorage = new SecureSessionStorage();
  return secureStorage;
}

function getSecureDB() {
  if (typeof window === 'undefined') return null;
  if (!secureDB) secureDB = new SecureIndexedDB();
  return secureDB;
}

export const SecureStorage = {
  // Session-based storage for sensitive data
  session: {
    set: (key, value, options = {}) => {
      const s = getSecureStorage();
      return s ? s.setItem(key, value, options) : Promise.resolve();
    },
    get: (key) => {
      const s = getSecureStorage();
      return s ? s.getItem(key) : Promise.resolve(null);
    },
    remove: (key) => {
      const s = getSecureStorage();
      return s ? s.removeItem(key) : undefined;
    },
    clear: () => {
      const s = getSecureStorage();
      return s ? s.clearSessionData() : undefined;
    }
  },

  // IndexedDB for larger datasets
  database: {
    store: (key, data, options = {}) => {
      const db = getSecureDB();
      return db ? db.storeData(key, data, options) : Promise.resolve();
    },
    get: (key) => {
      const db = getSecureDB();
      return db ? db.getData(key) : Promise.resolve(null);
    },
    delete: (key) => {
      const db = getSecureDB();
      return db ? db.deleteData(key) : Promise.resolve();
    },
    clearExpired: () => {
      const db = getSecureDB();
      return db ? db.clearExpiredData() : Promise.resolve();
    }
  },

  // Utility functions
  isSecureStorageAvailable: () => {
    return typeof window !== 'undefined' && 
           'sessionStorage' in window && 
           'indexedDB' in window &&
           'crypto' in window &&
           'subtle' in crypto;
  },

  // Migration helper
  migrateFromLocalStorage: async (keys) => {
    if (typeof window === 'undefined') return;
    
    if (!SecureStorage.isSecureStorageAvailable()) {
      console.warn('Secure storage not available, skipping migration');
      return;
    }

    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          await SecureStorage.session.set(key, parsed, { encrypt: true });
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Failed to migrate ${key}:`, error);
        }
      }
    }
  }
};

export default SecureStorage; 