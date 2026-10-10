import { Bookmark, BookmarkInput, STORAGE_KEYS } from '../types/bookmark';
import { generateId, isDuplicateBookmark } from '../utils/duplicateDetection';

const DEFAULT_BOOKMARKS: Bookmark[] = [];

async function getStoredBookmarks(): Promise<Bookmark[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.BOOKMARKS);
    return result[STORAGE_KEYS.BOOKMARKS] || DEFAULT_BOOKMARKS;
  } catch {
    return DEFAULT_BOOKMARKS;
  }
}

export async function setStoredBookmarks(bookmarks: Bookmark[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.BOOKMARKS]: bookmarks });
  } catch (error) {
    console.error('Failed to save bookmarks:', error);
    throw new Error('Failed to save bookmarks');
  }
}

export async function getBookmarks(): Promise<Bookmark[]> {
  return getStoredBookmarks();
}

export async function saveBookmark(input: BookmarkInput): Promise<Bookmark> {
  const bookmarks = await getStoredBookmarks();
  const now = Date.now();
  let domain = input.domain || '';
  if (!domain) {
    try {
      domain = new URL(input.url).hostname.replace(/^www\./, '');
    } catch {
      domain = 'web';
    }
  }

  const newBookmark: Bookmark = {
    id: generateId(),
    title: input.title,
    url: input.url,
    domain,
    favicon: input.favicon || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
    thumbnail: input.thumbnail || '',
    description: input.description || '',
    tags: input.tags || [],
    collectionId: input.collectionId || null,
    favorite: input.favorite || false,
    createdAt: now,
    updatedAt: now,
  };
  bookmarks.unshift(newBookmark);
  await setStoredBookmarks(bookmarks);
  return newBookmark;
}

export async function updateBookmark(id: string, updates: Partial<Bookmark>): Promise<Bookmark | null> {
  const bookmarks = await getStoredBookmarks();
  const index = bookmarks.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookmarks[index] = {
    ...bookmarks[index],
    ...updates,
    updatedAt: Date.now(),
  };
  await setStoredBookmarks(bookmarks);
  return bookmarks[index];
}

export async function deleteBookmark(id: string): Promise<boolean> {
  const bookmarks = await getStoredBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);
  if (filtered.length === bookmarks.length) return false;
  await setStoredBookmarks(filtered);
  return true;
}

export async function toggleFavorite(id: string): Promise<Bookmark | null> {
  const bookmarks = await getStoredBookmarks();
  const bookmark = bookmarks.find(b => b.id === id);
  if (!bookmark) return null;
  return updateBookmark(id, { favorite: !bookmark.favorite });
}

export async function moveToCollection(bookmarkId: string, collectionId: string | null): Promise<Bookmark | null> {
  return updateBookmark(bookmarkId, { collectionId });
}

export async function getBookmarkByUrl(url: string): Promise<Bookmark | null> {
  const bookmarks = await getStoredBookmarks();
  return isDuplicateBookmark(bookmarks, url);
}

export async function clearAllBookmarks(): Promise<void> {
  await setStoredBookmarks([]);
}