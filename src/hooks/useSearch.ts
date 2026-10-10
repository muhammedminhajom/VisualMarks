import { useState, useCallback, useMemo } from 'react';
import { SearchFilters, SortOption, ViewMode } from '../types/bookmark';

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  collectionId: null,
  favoritesOnly: false,
  tags: [],
  domain: '',
  dateRange: { start: null, end: null },
  sortBy: 'recent',
};

export function useSearch(initialView: ViewMode = 'all') {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>(initialView);

  const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const setViewMode = useCallback((newView: ViewMode) => {
    setView(newView);
    if (newView === 'favorites') {
      setFilters(prev => ({ ...prev, favoritesOnly: true, collectionId: null }));
    } else if (newView === 'recent') {
      setFilters(prev => ({ ...prev, favoritesOnly: false, collectionId: null }));
    } else if (newView === 'all') {
      setFilters(prev => ({ ...prev, favoritesOnly: false, collectionId: null }));
    }
  }, []);

  const setCollectionFilter = useCallback((collectionId: string | null) => {
    setView('collection');
    setFilters(prev => ({ ...prev, collectionId }));
  }, []);

  const toggleTagFilter = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.collectionId) count++;
    if (filters.favoritesOnly) count++;
    if (filters.tags.length > 0) count++;
    if (filters.domain) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  }, [filters]);

  return {
    filters,
    view,
    updateFilters,
    clearFilters,
    setViewMode,
    setCollectionFilter,
    toggleTagFilter,
    setSortBy,
    activeFilterCount,
  };
}