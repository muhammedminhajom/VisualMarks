import { useState } from 'react';
import { ExternalLink, Folder, Copy, Trash2, MoreVertical, Star, Edit3 } from 'lucide-react';
import { Bookmark } from '../types/bookmark';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Tag, TagInput } from '../components/Tag';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { getFaviconUrl } from '../utils/url';
import { cn } from '../utils/cn';
import { useBookmarks } from '../hooks/useBookmarks';
import { useCollections } from '../hooks/useCollections';
import { useToast } from '../components/Toast';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onOpen?: (url: string) => void;
}

export function BookmarkCard({ bookmark, onOpen }: BookmarkCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState(bookmark.title);
  const [editUrl, setEditUrl] = useState(bookmark.url);
  const [editDescription, setEditDescription] = useState(bookmark.description || '');
  const [editTags, setEditTags] = useState<string[]>(bookmark.tags || []);
  const [editTagInput, setEditTagInput] = useState('');
  
  const { deleteBookmark, toggleFavorite, moveToCollection, updateBookmark } = useBookmarks();
  const { collections } = useCollections();
  const { showToast } = useToast();

  const handleOpen = () => {
    if (onOpen) {
      onOpen(bookmark.url);
    } else {
      chrome.tabs.create({ url: bookmark.url });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(bookmark.id);
      showToast({
        type: 'success',
        title: bookmark.favorite ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch {
      showToast({ type: 'error', title: 'Failed to update favorite' });
    }
  };

  const handleMoveToCollection = async (collectionId: string | null) => {
    try {
      await moveToCollection(bookmark.id, collectionId);
      showToast({ type: 'success', title: 'Bookmark moved' });
      setShowMoveModal(false);
    } catch {
      showToast({ type: 'error', title: 'Failed to move bookmark' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBookmark(bookmark.id);
      showToast({ type: 'success', title: 'Bookmark deleted' });
    } catch {
      showToast({ type: 'error', title: 'Failed to delete bookmark' });
    }
    setShowDeleteConfirm(false);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      showToast({ type: 'success', title: 'URL copied to clipboard' });
    } catch {
      showToast({ type: 'error', title: 'Failed to copy URL' });
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editUrl.trim()) {
      showToast({ type: 'error', title: 'Title and URL are required' });
      return;
    }
    try {
      let domain = bookmark.domain;
      try {
        domain = new URL(editUrl).hostname.replace(/^www\./, '');
      } catch {
        // preserve existing domain
      }
      await updateBookmark(bookmark.id, {
        title: editTitle.trim(),
        url: editUrl.trim(),
        domain,
        description: editDescription.trim(),
        tags: editTags,
      });
      showToast({ type: 'success', title: 'Bookmark updated' });
      setShowEditModal(false);
    } catch {
      showToast({ type: 'error', title: 'Failed to update bookmark' });
    }
  };

  const collectionOptions: DropdownOption<string | null>[] = [
    { value: null, label: 'No Collection' },
    ...collections.map(c => ({ value: c.id, label: c.name })),
  ];

  const handleMoveToCollectionWrapper = (value: string | null | (string | null)[]) => {
    const collectionId = Array.isArray(value) ? value[0] : value;
    handleMoveToCollection(collectionId);
  };

  return (
    <article
      className={cn(
        'group relative bg-white dark:bg-neutral-900',
        'rounded-xl border border-neutral-200 dark:border-neutral-700',
        'shadow-card hover:shadow-card-hover',
        'transition-all duration-300',
        'overflow-hidden',
        'flex flex-col h-full'
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {bookmark.thumbnail && !imageError ? (
          <img
            src={bookmark.thumbnail}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800">
            <img
              src={bookmark.favicon || getFaviconUrl(bookmark.domain)}
              alt=""
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm',
              'hover:bg-neutral-100 dark:hover:bg-neutral-800',
              'transition-colors',
              bookmark.favorite ? 'text-yellow-500' : 'text-neutral-500 dark:text-neutral-400'
            )}
            aria-label={bookmark.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={cn('w-4 h-4', bookmark.favorite && 'fill-current')} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg py-1 z-20 animate-in fade-in-0 zoom-in-95">
                <button
                  onClick={() => { handleOpen(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
                <button
                  onClick={() => {
                    setEditTitle(bookmark.title);
                    setEditUrl(bookmark.url);
                    setEditDescription(bookmark.description || '');
                    setEditTags(bookmark.tags || []);
                    setShowEditModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Bookmark
                </button>
                <button
                  onClick={() => { setShowMoveModal(true); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Folder className="w-4 h-4" />
                  Move to Collection
                </button>
                <button
                  onClick={() => { handleCopyUrl(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy URL
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                <button
                  onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            onClick={handleOpen}
            className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 flex-1 min-w-0 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {bookmark.title}
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap flex-shrink-0">
            {bookmark.domain}
          </span>
        </div>

        {bookmark.description && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 flex-1">
            {bookmark.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-1.5 mt-auto pt-2">
          {bookmark.tags.slice(0, 4).map(tag => (
            <Tag key={tag} variant="outline" size="sm">{tag}</Tag>
          ))}
          {bookmark.tags.length > 4 && (
            <Tag variant="outline" size="sm">+{bookmark.tags.length - 4}</Tag>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Bookmark" size="sm">
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Are you sure you want to delete <strong className="text-neutral-900 dark:text-neutral-100">{bookmark.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      {/* Move to Collection Modal */}
      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move to Collection" size="sm">
        <div className="space-y-4">
          <Dropdown
            options={collectionOptions}
            value={bookmark.collectionId}
            onChange={handleMoveToCollectionWrapper}
            placeholder="Select collection"
          />
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowMoveModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Bookmark Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Bookmark" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">URL</label>
            <input
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tags</label>
            <TagInput
              value={editTagInput}
              onChange={setEditTagInput}
              onAdd={(tag) => {
                const trimmed = tag.trim();
                if (trimmed && !editTags.includes(trimmed)) {
                  setEditTags([...editTags, trimmed]);
                  setEditTagInput('');
                }
              }}
              tags={editTags}
              onRemoveTag={(t) => setEditTags(editTags.filter(item => item !== t))}
              placeholder="Add tag..."
            />
            {editTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {editTags.map(tag => (
                  <Tag
                    key={tag}
                    variant="outline"
                    removable
                    onRemove={() => setEditTags(editTags.filter(t => t !== tag))}
                    size="sm"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </article>
  );
}