import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkInput, SearchFilters, STORAGE_KEYS } from '../types/bookmark';
import {
  getBookmarks,
  saveBookmark,
  updateBookmark,
  deleteBookmark,
  toggleFavorite,
  moveToCollection,
  clearAllBookmarks,
} from '../services/bookmarkStorage';
import { searchBookmarks, getUniqueTags, getUniqueDomains } from '../utils/search';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookmarks();
      setBookmarks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes[STORAGE_KEYS.BOOKMARKS]) {
        setBookmarks(changes[STORAGE_KEYS.BOOKMARKS].newValue || []);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [loadBookmarks]);

  const addBookmark = useCallback(async (input: BookmarkInput) => {
    try {
      const newBookmark = await saveBookmark(input);
      setBookmarks(prev => [newBookmark, ...prev]);
      return newBookmark;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark');
      throw err;
    }
  }, []);

  const updateBookmarkById = useCallback(async (id: string, updates: Partial<Bookmark>) => {
    try {
      const updated = await updateBookmark(id, updates);
      if (updated) {
        setBookmarks(prev => prev.map(b => (b.id === id ? updated : b)));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
      throw err;
    }
  }, []);

  const removeBookmark = useCallback(async (id: string) => {
    try {
      const success = await deleteBookmark(id);
      if (success) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark');
      throw err;
    }
  }, []);

  const toggleBookmarkFavorite = useCallback(async (id: string) => {
    try {
      const updated = await toggleFavorite(id);
      if (updated) {
        setBookmarks(prev => prev.map(b => (b.id === id ? updated : b)));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  }, []);

  const moveBookmarkToCollection = useCallback(async (bookmarkId: string, collectionId: string | null) => {
    try {
      const updated = await moveToCollection(bookmarkId, collectionId);
      if (updated) {
        setBookmarks(prev => prev.map(b => (b.id === bookmarkId ? updated : b)));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move bookmark');
      throw err;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await clearAllBookmarks();
      setBookmarks([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear bookmarks');
      throw err;
    }
  }, []);

  return {
    bookmarks,
    loading,
    error,
    loadBookmarks,
    addBookmark,
    updateBookmark: updateBookmarkById,
    deleteBookmark: removeBookmark,
    toggleFavorite: toggleBookmarkFavorite,
    moveToCollection: moveBookmarkToCollection,
    clearAll,
    uniqueTags: getUniqueTags(bookmarks),
    uniqueDomains: getUniqueDomains(bookmarks),
  };
}

export function useFilteredBookmarks(filters: SearchFilters) {
  const { bookmarks, loading, error } = useBookmarks();
  const filtered = searchBookmarks(bookmarks, filters);
  return { bookmarks: filtered, loading, error, allBookmarks: bookmarks };
}