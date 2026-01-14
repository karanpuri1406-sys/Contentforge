/**
 * Simple IndexedDB wrapper inspired by RocketSEO architecture
 * Uses key-value store for settings instead of complex Dexie queries
 */

const DB_NAME = 'BlogForgeDB';
const SETTINGS_STORE = 'app_settings';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize or get existing database connection
 */
const getDB = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    console.log('[SimpleStorage] Using existing DB connection');
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    console.log('[SimpleStorage] Opening IndexedDB:', DB_NAME);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[SimpleStorage] Database error:', request.error);
      reject('Database error: ' + request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('[SimpleStorage] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[SimpleStorage] Database upgrade needed');
      
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        console.log('[SimpleStorage] Created settings store');
      }
    };
  });
};

/**
 * Save a setting (key-value pair)
 */
export const saveSetting = async (key: string, value: any): Promise<void> => {
  console.log('[SimpleStorage] Saving setting:', key, '=', typeof value === 'string' ? value.substring(0, 20) + '...' : value);
  
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    
    const request = store.put({ key, value, updatedAt: Date.now() });
    
    request.onsuccess = () => {
      console.log('[SimpleStorage] Setting saved successfully:', key);
      resolve();
    };
    
    request.onerror = () => {
      console.error('[SimpleStorage] Error saving setting:', key, request.error);
      reject('Error saving setting: ' + request.error);
    };
    
    transaction.oncomplete = () => {
      console.log('[SimpleStorage] Transaction completed for:', key);
    };
  });
};

/**
 * Get a setting by key
 * Returns null if not found (never throws)
 */
export const getSetting = async (key: string): Promise<any> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result?.value;
        console.log('[SimpleStorage] Got setting:', key, '=', result ? 'EXISTS' : 'NULL');
        resolve(result ?? null);
      };
      
      request.onerror = () => {
        console.error('[SimpleStorage] Error getting setting:', key, request.error);
        resolve(null); // Return null on error instead of throwing
      };
    });
  } catch (error) {
    console.error('[SimpleStorage] Exception getting setting:', key, error);
    return null;
  }
};

/**
 * Delete a setting
 */
export const deleteSetting = async (key: string): Promise<void> => {
  console.log('[SimpleStorage] Deleting setting:', key);
  
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.delete(key);
    
    request.onsuccess = () => {
      console.log('[SimpleStorage] Setting deleted:', key);
      resolve();
    };
    
    request.onerror = () => {
      console.error('[SimpleStorage] Error deleting setting:', key, request.error);
      reject('Error deleting setting: ' + request.error);
    };
  });
};

/**
 * Get all settings (for debugging)
 */
export const getAllSettings = async (): Promise<Array<{ key: string; value: any }>> => {
  try {
    const db = await getDB();
    
    return new Promise((resolve) => {
      const transaction = db.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result || [];
        console.log('[SimpleStorage] Got all settings:', results.length, 'items');
        resolve(results);
      };
      
      request.onerror = () => {
        console.error('[SimpleStorage] Error getting all settings:', request.error);
        resolve([]);
      };
    });
  } catch (error) {
    console.error('[SimpleStorage] Exception getting all settings:', error);
    return [];
  }
};

/**
 * Clear all settings (for testing)
 */
export const clearAllSettings = async (): Promise<void> => {
  console.log('[SimpleStorage] Clearing all settings');
  
  const db = await getDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
    const store = transaction.objectStore(SETTINGS_STORE);
    const request = store.clear();
    
    request.onsuccess = () => {
      console.log('[SimpleStorage] All settings cleared');
      resolve();
    };
    
    request.onerror = () => {
      console.error('[SimpleStorage] Error clearing settings:', request.error);
      reject('Error clearing settings: ' + request.error);
    };
  });
};

// API Key specific helpers
export const saveApiKey = async (provider: 'gemini' | 'openrouter', keyValue: string, nickname?: string): Promise<void> => {
  const key = `${provider}_api_key`;
  await saveSetting(key, { keyValue, nickname, savedAt: Date.now() });
};

export const getApiKey = async (provider: 'gemini' | 'openrouter'): Promise<string | null> => {
  const key = `${provider}_api_key`;
  const data = await getSetting(key);
  return data?.keyValue || null;
};

export const deleteApiKey = async (provider: 'gemini' | 'openrouter'): Promise<void> => {
  const key = `${provider}_api_key`;
  await deleteSetting(key);
};

export const hasApiKey = async (provider: 'gemini' | 'openrouter'): Promise<boolean> => {
  const key = await getApiKey(provider);
  return !!key;
};
