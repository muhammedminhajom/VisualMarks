import { useState, useEffect } from 'react';
import { Star, Save, Loader2, CheckCircle, X, ExternalLink } from 'lucide-react';
import { BookmarkInput } from '../types/bookmark';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCollections } from '../hooks/useCollections';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { TagInput, Tag } from '../components/Tag';

export function Popup() {
  const [tab, setTab] = useState<chrome.tabs.Tab | null>(null);
  const [form, setForm] = useState<BookmarkInput>({
    title: '',
    url: '',
    collectionId: null,
    tags: [],
    favorite: false,
    description: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState('');

  const { addBookmark } = useBookmarks();
  const { collections } = useCollections();
  const { showToast } = useToast();

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const currentTab = tabs[0];
        setTab(currentTab);
        setForm(prev => ({
          ...prev,
          title: currentTab.title || '',
          url: currentTab.url || '',
        }));
        if (currentTab.url) {
          if (currentTab.favIconUrl) {
            setFaviconUrl(currentTab.favIconUrl);
          } else {
            try {
              const domain = new URL(currentTab.url).hostname;
              setFaviconUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=32`);
            } catch {
              setFaviconUrl('');
            }
          }
        }
      }
    });
  }, []);

  const handleTagAdd = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !(form.tags || []).includes(trimmed)) {
      setForm(prev => ({ ...prev, tags: [...(prev.tags || []), trimmed] }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tag: string) => {
    setForm(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tag) }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      showToast({ type: 'error', title: 'Title and URL are required' });
      return;
    }
    try {
      setSaving(true);
      await addBookmark({
        ...form,
        favicon: faviconUrl || undefined,
      });
      setSaved(true);
      showToast({ type: 'success', title: 'Bookmark saved successfully' });
      setTimeout(() => window.close(), 1200);
    } catch {
      showToast({ type: 'error', title: 'Failed to save bookmark' });
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Saved!</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Bookmark added to VisualMarks</p>
      </div>
    );
  }

  if (!tab) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-96 p-4">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={faviconUrl}
          alt=""
          className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 object-contain p-1"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {form.title}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
            {form.url}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Collection</label>
          <select
            value={form.collectionId || ''}
            onChange={(e) => setForm(prev => ({ ...prev, collectionId: e.target.value || null }))}
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
            tags={form.tags || []}
            onRemoveTag={handleTagRemove}
            placeholder="Add tag..."
          />
          {form.tags && form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <Tag key={tag} variant="outline" removable onRemove={() => handleTagRemove(tag)} size="sm">
                  {tag}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.favorite}
              onChange={(e) => setForm(prev => ({ ...prev, favorite: e.target.checked }))}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              <Star className="w-4 h-4 inline mr-1" fill={form.favorite ? 'currentColor' : 'none'} />
              Favorite
            </span>
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" className="flex-1" onClick={() => window.close()}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        <button
          onClick={() => { chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') }); window.close(); }}
          className="w-full mt-3 text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1"
        >
          <ExternalLink className="w-4 h-4" />
          Open Full Dashboard
        </button>
      </div>
    </div>
  );
}