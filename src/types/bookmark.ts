export interface Bookmark {
  id: string;
  title: string;
  url: string;
  domain: string;
  favicon: string;
  thumbnail: string;
  description: string;
  tags: string[];
  collectionId: string | null;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BookmarkInput {
  title: string;
  url: string;
  domain?: string;
  favicon?: string;
  thumbnail?: string;
  description?: string;
  tags?: string[];
  collectionId?: string | null;
  favorite?: boolean;
}

export const STORAGE_KEYS = {
  BOOKMARKS: 'visualmarks_bookmarks',
  COLLECTIONS: 'visualmarks_collections',
  SETTINGS: 'visualmarks_settings',
} as const;

export type ViewMode = 'all' | 'favorites' | 'recent' | 'collection';

export interface SearchFilters {
  query: string;
  collectionId: string | null;
  favoritesOnly: boolean;
  tags: string[];
  domain: string;
  dateRange: { start: number | null; end: number | null };
  sortBy: SortOption;
}

export type SortOption = 'recent' | 'oldest' | 'alphabetical' | 'updated';