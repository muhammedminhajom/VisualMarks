import { Bookmark } from '../types/bookmark';

export function isDuplicateBookmark(existingBookmarks: Bookmark[], url: string): Bookmark | null {
  const normalizedUrl = normalizeUrl(url);
  return existingBookmarks.find(b => normalizeUrl(b.url) === normalizedUrl) || null;
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}