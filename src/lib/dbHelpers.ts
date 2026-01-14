import { db, ApiKey } from './db';

/**
 * Helper functions for database operations with better error handling and logging
 */

export async function addApiKey(key: Omit<ApiKey, 'id' | 'createdAt' | 'isActive'>): Promise<number> {
  console.log('[DB] Adding API key:', { provider: key.provider, hasNickname: !!key.nickname });
  
  try {
    const id = await db.apiKeys.add({
      ...key,
      isActive: true,
      createdAt: new Date(),
    });
    
    console.log('[DB] API key added successfully with ID:', id);
    
    // Verify the key was saved
    const savedKey = await db.apiKeys.get(id);
    if (!savedKey) {
      throw new Error('Failed to verify API key was saved');
    }
    
    console.log('[DB] API key verified:', { id: savedKey.id, provider: savedKey.provider, isActive: savedKey.isActive });
    
    return id;
  } catch (error) {
    console.error('[DB] Error adding API key:', error);
    throw error;
  }
}

export async function getActiveApiKeys(): Promise<ApiKey[]> {
  try {
    const keys = await db.apiKeys.where({ isActive: true }).toArray();
    console.log('[DB] Retrieved active API keys:', keys.length);
    return keys;
  } catch (error) {
    console.error('[DB] Error getting active API keys:', error);
    return [];
  }
}

export async function getAllApiKeys(): Promise<ApiKey[]> {
  try {
    const keys = await db.apiKeys.toArray();
    console.log('[DB] Retrieved all API keys:', keys.length);
    return keys;
  } catch (error) {
    console.error('[DB] Error getting all API keys:', error);
    return [];
  }
}

export async function deleteApiKey(id: number): Promise<void> {
  console.log('[DB] Deleting API key:', id);
  try {
    await db.apiKeys.delete(id);
    console.log('[DB] API key deleted successfully');
  } catch (error) {
    console.error('[DB] Error deleting API key:', error);
    throw error;
  }
}

export async function toggleApiKeyActive(id: number): Promise<void> {
  console.log('[DB] Toggling API key active status:', id);
  try {
    const key = await db.apiKeys.get(id);
    if (!key) {
      throw new Error('API key not found');
    }
    
    await db.apiKeys.update(id, { isActive: !key.isActive });
    console.log('[DB] API key toggled successfully');
  } catch (error) {
    console.error('[DB] Error toggling API key:', error);
    throw error;
  }
}

export async function getDatabaseStats() {
  try {
    const [articles, apiKeys, brandVoices, wordPressSites, internalLinks] = await Promise.all([
      db.articles.count(),
      db.apiKeys.count(),
      db.brandVoices.count(),
      db.wordPressSites.count(),
      db.internalLinks.count(),
    ]);
    
    const activeApiKeys = await getActiveApiKeys();
    
    return {
      articles,
      apiKeys,
      activeApiKeys: activeApiKeys.length,
      brandVoices,
      wordPressSites,
      internalLinks,
    };
  } catch (error) {
    console.error('[DB] Error getting database stats:', error);
    throw error;
  }
}
