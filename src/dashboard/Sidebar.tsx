import { LayoutDashboard, Star, Clock, Folder, Settings, Plus, ChevronDown, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { ViewMode } from '../types/bookmark';
import { Button } from '../components/Button';
import { useCollections } from '../hooks/useCollections';
import { Modal } from '../components/Modal';
import { useState, useRef } from 'react';
import { cn } from '../utils/cn';
import { exportData, downloadJSON, importData, clearAllData } from '../services/exportImport';
import { useToast } from '../components/Toast';

interface SidebarProps {
  currentView: ViewMode;
  currentCollectionId: string | null;
  onViewChange: (view: ViewMode, collectionId?: string) => void;
}

const NAV_ITEMS = [
  { id: 'all', label: 'All Bookmarks', icon: LayoutDashboard },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'recent', label: 'Recently Added', icon: Clock },
] as const;

export function Sidebar({
  currentView,
  currentCollectionId,
  onViewChange,
}: SidebarProps) {
  const [showCollections, setShowCollections] = useState(true);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { collections, addCollection, loading } = useCollections();
  const { showToast } = useToast();

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      await addCollection({ name: newCollectionName.trim() });
      setShowCreateCollection(false);
      setNewCollectionName('');
      showToast({ type: 'success', title: 'Collection created' });
    } catch (error) {
      console.error('Failed to create collection:', error);
      showToast({ type: 'error', title: 'Failed to create collection' });
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      downloadJSON(data);
      showToast({ type: 'success', title: 'Bookmarks exported successfully' });
    } catch (err) {
      console.error('Export failed:', err);
      showToast({ type: 'error', title: 'Export failed' });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importData(json);
      showToast({
        type: 'success',
        title: `Imported ${result.bookmarksAdded} bookmarks and ${result.collectionsAdded} collections`,
      });
      setShowSettings(false);
    } catch (err) {
      console.error('Import failed:', err);
      showToast({ type: 'error', title: 'Failed to import JSON file' });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      showToast({ type: 'success', title: 'All bookmarks and collections cleared' });
      setShowClearConfirm(false);
      setShowSettings(false);
    } catch (err) {
      console.error('Clear failed:', err);
      showToast({ type: 'error', title: 'Failed to clear data' });
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-700 flex flex-col h-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
          <span className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard className="w-5 h-5" />
          </span>
          VisualMarks
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Your bookmarks. Visualized.</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewMode)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-medium transition-colors',
                'text-left',
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setShowCollections(!showCollections)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-expanded={showCollections}
          >
            <span className="flex items-center gap-3">
              <Folder className="w-5 h-5 flex-shrink-0" />
              <span>Collections</span>
            </span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', showCollections && 'rotate-180')} />
          </button>

          {showCollections && (
            <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {collections.map((collection) => {
                const isActive = currentView === 'collection' && currentCollectionId === collection.id;
                return (
                  <button
                    key={collection.id}
                    onClick={() => onViewChange('collection', collection.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                      'text-sm transition-colors',
                      'text-left',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Folder className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{collection.name}</span>
                  </button>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start px-3"
                onClick={() => setShowCreateCollection(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>New Collection</span>
              </Button>
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-neutral-600 dark:text-neutral-400"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          <span>Settings & Backup</span>
        </Button>
      </div>

      {/* Create Collection Modal */}
      <Modal isOpen={showCreateCollection} onClose={() => setShowCreateCollection(false)} title="Create Collection" size="sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="collection-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Collection Name
            </label>
            <input
              id="collection-name"
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., My Projects"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCreateCollection(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateCollection} disabled={!newCollectionName.trim() || loading}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* Settings & Backup Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Settings & Backup" size="md">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Export Data</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Download a JSON backup of all your bookmarks, tags, and collections.
            </p>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Bookmarks (JSON)
            </Button>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Import Data</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Restore bookmarks and collections from a previously exported JSON file.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              loading={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Bookmarks (JSON)
            </Button>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Reset Storage</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Permanently delete all bookmarks and restore collections to defaults.
            </p>
            <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowSettings(false)}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Clear Confirmation Modal */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Confirm Reset" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Are you sure you want to delete all bookmarks? This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleClearAll}>Yes, Clear All</Button>
          </div>
        </div>
      </Modal>
    </aside>
  );
}