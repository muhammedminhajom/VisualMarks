import { Bookmark, SearchFilters } from '../types/bookmark';

export function searchBookmarks(bookmarks: Bookmark[], filters: SearchFilters): Bookmark[] {
  let results = [...bookmarks];

  if (filters.query.trim()) {
    const query = filters.query.toLowerCase().trim();
    results = results.filter(bookmark =>
      bookmark.title.toLowerCase().includes(query) ||
      bookmark.url.toLowerCase().includes(query) ||
      bookmark.domain.toLowerCase().includes(query) ||
      bookmark.description.toLowerCase().includes(query) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  if (filters.collectionId) {
    results = results.filter(b => b.collectionId === filters.collectionId);
  }

  if (filters.favoritesOnly) {
    results = results.filter(b => b.favorite);
  }

  if (filters.tags.length > 0) {
    results = results.filter(b => filters.tags.every(tag => b.tags.includes(tag)));
  }

  if (filters.domain) {
    results = results.filter(b => b.domain === filters.domain);
  }

  if (filters.dateRange.start) {
    results = results.filter(b => b.createdAt >= filters.dateRange.start!);
  }
  if (filters.dateRange.end) {
    results = results.filter(b => b.createdAt <= filters.dateRange.end!);
  }

  results.sort((a, b) => {
    switch (filters.sortBy) {
      case 'recent':
        return b.createdAt - a.createdAt;
      case 'oldest':
        return a.createdAt - b.createdAt;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'updated':
        return b.updatedAt - a.updatedAt;
      default:
        return b.createdAt - a.createdAt;
    }
  });

  return results;
}

export function getUniqueTags(bookmarks: Bookmark[]): string[] {
  const tagSet = new Set<string>();
  bookmarks.forEach(b => b.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

export function getUniqueDomains(bookmarks: Bookmark[]): string[] {
  const domainSet = new Set<string>();
  bookmarks.forEach(b => domainSet.add(b.domain));
  return Array.from(domainSet).sort();
}