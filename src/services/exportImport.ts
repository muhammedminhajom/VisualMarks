import { Bookmark } from '../types/bookmark';
import { Collection } from '../types/collection';
import { getBookmarks, setStoredBookmarks } from './bookmarkStorage';
import { getCollections, setStoredCollections } from './collectionStorage';
import { isDuplicateBookmark } from '../utils/duplicateDetection';

export interface ExportData {
  version: number;
  exportedAt: number;
  bookmarks: Bookmark[];
  collections: Collection[];
}

export async function exportData(): Promise<ExportData> {
  const [bookmarks, collections] = await Promise.all([
    getBookmarks(),
    getCollections(),
  ]);
  
  return {
    version: 1,
    exportedAt: Date.now(),
    bookmarks,
    collections,
  };
}

export function downloadJSON(data: ExportData, filename = 'visualmarks-export.json'): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(
  jsonData: ExportData,
  options: { merge: boolean; overwriteCollections: boolean } = { merge: true, overwriteCollections: false }
): Promise<{ bookmarksAdded: number; collectionsAdded: number; errors: string[] }> {
  const errors: string[] = [];
  let bookmarksAdded = 0;
  let collectionsAdded = 0;

  try {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('Invalid JSON format');
    }
    if (!Array.isArray(jsonData.bookmarks) || !Array.isArray(jsonData.collections)) {
      throw new Error('Missing bookmarks or collections array');
    }

    const currentCollections = options.merge ? await getCollections() : [];
    const currentBookmarks = options.merge ? await getBookmarks() : [];

    const existingCollectionIds = new Set(currentCollections.map(c => c.id));
    const mergedCollections = [...currentCollections];

    for (const collection of jsonData.collections) {
      if (!collection.id || !collection.name) {
        errors.push(`Invalid collection: ${JSON.stringify(collection)}`);
        continue;
      }
      
      const existingIdx = mergedCollections.findIndex(c => c.id === collection.id);
      if (existingIdx !== -1) {
        if (options.overwriteCollections) {
          mergedCollections[existingIdx] = collection;
        }
      } else {
        mergedCollections.push(collection);
        existingCollectionIds.add(collection.id);
        collectionsAdded++;
      }
    }

    const mergedBookmarks = [...currentBookmarks];

    for (const bookmark of jsonData.bookmarks) {
      if (!bookmark.id || !bookmark.url || !bookmark.title) {
        errors.push(`Invalid bookmark: ${JSON.stringify(bookmark)}`);
        continue;
      }
      
      if (options.merge && isDuplicateBookmark(mergedBookmarks, bookmark.url)) {
        continue;
      }

      mergedBookmarks.unshift(bookmark);
      bookmarksAdded++;
    }

    await setStoredCollections(mergedCollections);
    await setStoredBookmarks(mergedBookmarks);

    return { bookmarksAdded, collectionsAdded, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown import error');
    return { bookmarksAdded, collectionsAdded, errors };
  }
}

export async function clearAllData(): Promise<void> {
  await chrome.storage.local.clear();
}