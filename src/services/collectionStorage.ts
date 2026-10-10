import { Collection, CollectionInput, DEFAULT_COLLECTIONS } from '../types/collection';
import { STORAGE_KEYS } from '../types/bookmark';
import { generateId } from '../utils/duplicateDetection';

async function getStoredCollections(): Promise<Collection[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.COLLECTIONS);
    const stored = result[STORAGE_KEYS.COLLECTIONS];
    if (!stored || stored.length === 0) {
      await setStoredCollections(DEFAULT_COLLECTIONS);
      return DEFAULT_COLLECTIONS;
    }
    return stored;
  } catch {
    await setStoredCollections(DEFAULT_COLLECTIONS);
    return DEFAULT_COLLECTIONS;
  }
}

export async function setStoredCollections(collections: Collection[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.COLLECTIONS]: collections });
  } catch (error) {
    console.error('Failed to save collections:', error);
    throw new Error('Failed to save collections');
  }
}

export async function getCollections(): Promise<Collection[]> {
  return getStoredCollections();
}

export async function createCollection(input: CollectionInput): Promise<Collection> {
  const collections = await getStoredCollections();
  const now = Date.now();
  const newCollection: Collection = {
    id: generateId(),
    name: input.name,
    description: input.description || '',
    icon: input.icon || 'folder',
    createdAt: now,
    updatedAt: now,
  };
  collections.push(newCollection);
  await setStoredCollections(collections);
  return newCollection;
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null> {
  const collections = await getStoredCollections();
  const index = collections.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  collections[index] = {
    ...collections[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await setStoredCollections(collections);
  return collections[index];
}

export async function deleteCollection(id: string): Promise<boolean> {
  const collections = await getStoredCollections();
  const filtered = collections.filter(c => c.id !== id);
  if (filtered.length === collections.length) return false;
  await setStoredCollections(filtered);
  return true;
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  const collections = await getStoredCollections();
  return collections.find(c => c.id === id) || null;
}