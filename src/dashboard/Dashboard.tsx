import { useState, useMemo } from 'react';
import { Collection } from '../types/collection';
import { Sidebar } from './Sidebar';
import { BookmarkGrid } from './BookmarkGrid';
import { SearchBar } from './SearchBar';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { TagInput } from '../components/Tag';
import { Tag } from '../components/Tag';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCollections } from '../hooks/useCollections';
import { useSearch } from '../hooks/useSearch';
import { useToast } from '../components/Toast';
import { Plus, ExternalLink, Save, X, Loader2 } from 'lucide-react';

export function Dashboard() {
  const {
    bookmarks: allBookmarks,
    loading: bookmarksLoading,
    addBookmark,
    uniqueDomains,
  } = useBookmarks();

  const { collections, loading: collectionsLoading } = useCollections();

  const {
    filters,
    view,
    updateFilters,
    clearFilters,
    setViewMode,
    setCollectionFilter,
    activeFilterCount,
  } = useSearch('all');

  const { showToast } = useToast();

  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showCollectionView, setShowCollectionView] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [newBookmarkForm, setNewBookmarkForm] = useState({
    title: '',
    url: '',
    collectionId: null as string | null,
    tags: [] as string[],
    favorite: false,
    description: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredBookmarks = useMemo(() => {
    let results = [...allBookmarks];

    if (filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      results = results.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.domain.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.tags.some(tag => tag.toLowerCase().includes(query))
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
        case 'recent': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'alphabetical': return a.title.localeCompare(b.title);
        case 'updated': return b.updatedAt - a.updatedAt;
        default: return b.createdAt - a.createdAt;
      }
    });

    return results;
  }, [allBookmarks, filters]);

  const collectionBookmarks = useMemo(() => {
    if (!selectedCollection) return [];
    return allBookmarks.filter(b => b.collectionId === selectedCollection.id);
  }, [allBookmarks, selectedCollection]);

  const handleOpenAddBookmark = (prefill?: Partial<typeof newBookmarkForm>) => {
    setNewBookmarkForm({
      title: prefill?.title || '',
      url: prefill?.url || '',
      collectionId: prefill?.collectionId || null,
      tags: prefill?.tags || [],
      favorite: prefill?.favorite || false,
      description: prefill?.description || '',
    });
    setTagInput('');
    setShowAddBookmark(true);
  };

  const handleSaveBookmark = async () => {
    if (!newBookmarkForm.title.trim() || !newBookmarkForm.url.trim()) {
      showToast({ type: 'error', title: 'Title and URL are required' });
      return;
    }
    try {
      setSaving(true);
      await addBookmark({
        title: newBookmarkForm.title,
        url: newBookmarkForm.url,
        collectionId: newBookmarkForm.collectionId,
        tags: newBookmarkForm.tags,
        favorite: newBookmarkForm.favorite,
        description: newBookmarkForm.description,
      });
      showToast({ type: 'success', title: 'Bookmark saved successfully' });
      setShowAddBookmark(false);
    } catch {
      showToast({ type: 'error', title: 'Failed to save bookmark' });
    } finally {
      setSaving(false);
    }
  };

  const handleTagAdd = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !newBookmarkForm.tags.includes(trimmed)) {
      setNewBookmarkForm(prev => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setNewBookmarkForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleViewCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setShowCollectionView(true);
    setViewMode('collection');
    setCollectionFilter(collection.id);
  };

  const handleBackToAll = () => {
    setShowCollectionView(false);
    setSelectedCollection(null);
    setViewMode('all');
    clearFilters();
  };

  if (bookmarksLoading || collectionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      <Sidebar
        currentView={view}
        currentCollectionId={filters.collectionId}
        onViewChange={(v, id) => {
          if (v === 'collection' && id) {
            const coll = collections.find(c => c.id === id);
            if (coll) handleViewCollection(coll);
          } else {
            setViewMode(v);
            if (v !== 'collection') setCollectionFilter(null);
          }
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10">
          <div className="max-w-full mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {showCollectionView && selectedCollection
                    ? selectedCollection.name
                    : view === 'favorites'
                    ? 'Favorites'
                    : view === 'recent'
                    ? 'Recently Added'
                    : 'All Bookmarks'}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {showCollectionView && selectedCollection
                    ? `${collectionBookmarks.length} bookmark${collectionBookmarks.length !== 1 ? 's' : ''}`
                    : `${filteredBookmarks.length} bookmark${filteredBookmarks.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear filters
                  </Button>
                )}
                <Button onClick={() => handleOpenAddBookmark()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bookmark
                </Button>
              </div>
            </div>

            <SearchBar
              filters={filters}
              onSearchChange={(query) => updateFilters({ query })}
              onFilterChange={updateFilters}
              onClearFilters={clearFilters}
              onAddBookmark={() => handleOpenAddBookmark()}
              uniqueDomains={uniqueDomains}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {showCollectionView && selectedCollection ? (
            <div className="max-w-full mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={handleBackToAll}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Back to All
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                      {selectedCollection.name}
                    </h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {collectionBookmarks.length} bookmark{collectionBookmarks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleOpenAddBookmark({ collectionId: selectedCollection.id })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Collection
                </Button>
              </div>
              <BookmarkGrid bookmarks={collectionBookmarks} />
            </div>
          ) : (
            <div className="max-w-full mx-auto">
              <BookmarkGrid bookmarks={filteredBookmarks} />
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={showAddBookmark} onClose={() => setShowAddBookmark(false)} title="Save Bookmark" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
            <input
              type="text"
              value={newBookmarkForm.title}
              onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter bookmark title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">URL</label>
            <input
              type="url"
              value={newBookmarkForm.url}
              onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Collection</label>
            <select
              value={newBookmarkForm.collectionId || ''}
              onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, collectionId: e.target.value || null }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No Collection</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tags</label>
            <TagInput
              value={tagInput}
              onChange={setTagInput}
              onAdd={handleTagAdd}
              tags={newBookmarkForm.tags}
              onRemoveTag={handleTagRemove}
              placeholder="Add tag..."
            />
            {newBookmarkForm.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newBookmarkForm.tags.map(tag => (
                  <Tag key={tag} variant="outline" removable onRemove={() => handleTagRemove(tag)} size="sm">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description (optional)</label>
            <textarea
              value={newBookmarkForm.description}
              onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Add a description..."
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newBookmarkForm.favorite}
                onChange={(e) => setNewBookmarkForm(prev => ({ ...prev, favorite: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">Add to favorites</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button variant="ghost" onClick={() => setShowAddBookmark(false)}>Cancel</Button>
            <Button onClick={handleSaveBookmark} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Bookmark
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}