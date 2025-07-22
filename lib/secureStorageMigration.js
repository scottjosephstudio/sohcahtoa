/**
 * Secure Storage Migration Script
 * Migrates sensitive data from localStorage to secure storage
 */

import SecureStorage from './secureStorage.js';

// Define sensitive data keys that should be migrated
const SENSITIVE_KEYS = [
  'firstName',
  'lastName', 
  'userEmail',
  'cartState',
  'savedRegistrationData',
  'purchases',
  'billingDetails',
  'hasProceedBeenClicked',
  'paymentProcessingKey',
  'eulaAccepted',
  'selectedUsage',
  'registrationState',
  'lastFontSelection'
];

// Define keys that should be stored in IndexedDB (larger datasets)
const INDEXEDDB_KEYS = [
  'cartState',
  'purchases',
  'savedRegistrationData',
  'registrationState'
];

export const migrateToSecureStorage = async () => {
  if (!SecureStorage.isSecureStorageAvailable()) {
    console.warn('Secure storage not available, keeping localStorage fallback');
    return { success: false, reason: 'Secure storage not available' };
  }

  const migrationResults = {
    migrated: [],
    failed: [],
    skipped: []
  };

  try {
    // Migrate sensitive data to encrypted session storage
    for (const key of SENSITIVE_KEYS) {
      const value = localStorage.getItem(key);
      if (!value) {
        migrationResults.skipped.push(key);
        continue;
      }

      try {
        const parsed = JSON.parse(value);
        
        // Store in IndexedDB for larger datasets
        if (INDEXEDDB_KEYS.includes(key)) {
          await SecureStorage.database.store(key, parsed, { 
            expires: 24 * 60 * 60 * 1000 // 24 hours
          });
        } else {
          // Store in encrypted session storage
          await SecureStorage.session.set(key, parsed, { 
            encrypt: true,
            expires: 60 * 60 * 1000 // 1 hour
          });
        }
        
        // Remove from localStorage after successful migration
        localStorage.removeItem(key);
        migrationResults.migrated.push(key);
        
        console.log(`✅ Migrated ${key} to secure storage`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${key}:`, error);
        migrationResults.failed.push({ key, error: error.message });
      }
    }

    // Clean up any remaining sensitive data
    cleanupLocalStorage();

    console.log('Migration completed:', migrationResults);
    return { success: true, results: migrationResults };

  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
};

export const cleanupLocalStorage = () => {
  // Remove any remaining sensitive data from localStorage
  const keysToRemove = [
    'firstName',
    'lastName',
    'userEmail',
    'cartState',
    'savedRegistrationData',
    'purchases',
    'billingDetails',
    'hasProceedBeenClicked',
    'paymentProcessingKey',
    'eulaAccepted',
    'selectedUsage',
    'registrationState',
    'lastFontSelection'
  ];

  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`🧹 Cleaned up ${key} from localStorage`);
    }
  });
};

export const getSecureData = async (key) => {
  if (!SecureStorage.isSecureStorageAvailable()) {
    // Fallback to localStorage if secure storage not available
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  // Try IndexedDB first for larger datasets
  if (INDEXEDDB_KEYS.includes(key)) {
    const data = await SecureStorage.database.get(key);
    if (data) return data;
  }

  // Fallback to session storage
  return await SecureStorage.session.get(key);
};

export const setSecureData = async (key, value, options = {}) => {
  if (!SecureStorage.isSecureStorageAvailable()) {
    // Fallback to localStorage if secure storage not available
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }

  // Store in IndexedDB for larger datasets
  if (INDEXEDDB_KEYS.includes(key)) {
    await SecureStorage.database.store(key, value, {
      expires: options.expires || 24 * 60 * 60 * 1000 // 24 hours default
    });
  } else {
    // Store in encrypted session storage
    await SecureStorage.session.set(key, value, {
      encrypt: true,
      expires: options.expires || 60 * 60 * 1000 // 1 hour default
    });
  }
};

export const removeSecureData = async (key) => {
  if (!SecureStorage.isSecureStorageAvailable()) {
    localStorage.removeItem(key);
    return;
  }

  // Remove from both storage types
  await SecureStorage.database.delete(key);
  SecureStorage.session.remove(key);
};

// Auto-migrate on import if in browser environment
if (typeof window !== 'undefined') {
  // Run migration after a short delay to ensure app is loaded
  setTimeout(() => {
    migrateToSecureStorage().then(result => {
      if (result.success) {
        console.log('🛡️ Secure storage migration completed successfully');
      } else {
        console.warn('⚠️ Secure storage migration failed:', result.reason || result.error);
      }
    });
  }, 1000);
} 