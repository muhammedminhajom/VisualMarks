import { useState, useEffect, useCallback } from 'react';
import { Collection, CollectionInput } from '../types/collection';
import { STORAGE_KEYS } from '../types/bookmark';
import { getCollections, createCollection, updateCollection, deleteCollection } from '../services/collectionStorage';

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCollections();
      setCollections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.COLLECTIONS]) {
        setCollections(changes[STORAGE_KEYS.COLLECTIONS].newValue || []);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [loadCollections]);

  const addCollection = useCallback(async (input: CollectionInput) => {
    try {
      const newCollection = await createCollection(input);
      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
      throw err;
    }
  }, []);

  const updateCollectionById = useCallback(async (id: string, updates: Partial<Collection>) => {
    try {
      const updated = await updateCollection(id, updates);
      if (updated) {
        setCollections(prev => prev.map(c => (c.id === id ? updated : c)));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update collection');
      throw err;
    }
  }, []);

  const removeCollection = useCallback(async (id: string) => {
    try {
      const success = await deleteCollection(id);
      if (success) {
        setCollections(prev => prev.filter(c => c.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection');
      throw err;
    }
  }, []);

  return {
    collections,
    loading,
    error,
    loadCollections,
    addCollection,
    updateCollection: updateCollectionById,
    deleteCollection: removeCollection,
  };
}