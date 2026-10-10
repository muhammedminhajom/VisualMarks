import { Folder, Edit, Trash2, MoreVertical, ChevronRight } from 'lucide-react';
import { Collection } from '../types/collection';
import { cn } from '../utils/cn';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useCollections } from '../hooks/useCollections';
import { useToast } from '../components/Toast';
import { useState } from 'react';

interface CollectionCardProps {
  collection: Collection;
  bookmarkCount: number;
  onSelect: () => void;
  onDelete: () => void;
}

export function CollectionCard({ collection, bookmarkCount, onSelect, onDelete }: CollectionCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [showEdit, setShowEdit] = useState(false);
  const { updateCollection, deleteCollection } = useCollections();
  const { showToast } = useToast();

  const handleEdit = async () => {
    try {
      await updateCollection(collection.id, { name: editName });
      showToast({ type: 'success', title: 'Collection renamed' });
      setShowEdit(false);
    } catch {
      showToast({ type: 'error', title: 'Failed to rename collection' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCollection(collection.id);
      showToast({ type: 'success', title: 'Collection deleted' });
      onDelete();
    } catch {
      showToast({ type: 'error', title: 'Failed to delete collection' });
    }
    setShowDeleteConfirm(false);
  };

  return (
    <article
      className={cn(
        'group relative bg-white dark:bg-neutral-900',
        'rounded-xl border border-neutral-200 dark:border-neutral-700',
        'shadow-card hover:shadow-card-hover',
        'transition-all duration-300',
        'overflow-hidden',
        'flex flex-col h-full',
        'cursor-pointer'
      )}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
              <Folder className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              {showEdit ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit();
                    if (e.key === 'Escape') setShowEdit(false);
                  }}
                  onBlur={handleEdit}
                  className="px-2 py-1 border border-primary-500 rounded text-sm bg-white dark:bg-neutral-800 focus:outline-none"
                  autoFocus
                />
              ) : (
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {collection.name}
                </h3>
              )}
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {bookmarkCount} {bookmarkCount === 1 ? 'bookmark' : 'bookmarks'}
              </p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:text-neutral-300 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg py-1 z-10 animate-in fade-in-0 zoom-in-95">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowEdit(true); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Rename
                </button>
                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {collection.description && (
          <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
            {collection.description}
          </p>
        )}
      </div>
      <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          View Collection
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Collection" size="sm">
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Are you sure you want to delete <strong className="text-neutral-900 dark:text-neutral-100">{collection.name}</strong>? 
          Bookmarks in this collection will be moved to "No Collection". This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </article>
  );
}