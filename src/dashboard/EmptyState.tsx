import { BookOpen, ExternalLink, Folder, Star, Clock } from 'lucide-react';
import { ViewMode } from '../types/bookmark';
import { Button } from '../components/Button';

interface EmptyStateProps {
  view?: ViewMode;
  collectionName?: string;
  onAction?: () => void;
}

export function EmptyState({ view = 'all', collectionName, onAction }: EmptyStateProps) {
  const getContent = () => {
    switch (view) {
      case 'favorites':
        return {
          icon: Star,
          title: 'No favorites yet',
          description: 'Click the star on any bookmark to add it to your favorites.',
          actionLabel: 'Browse Bookmarks',
        };
      case 'recent':
        return {
          icon: Clock,
          title: 'No recent bookmarks',
          description: 'Your recently added bookmarks will appear here.',
          actionLabel: 'Save a Bookmark',
        };
      case 'collection':
        return {
          icon: Folder,
          title: collectionName ? `"${collectionName}" is empty` : 'Collection is empty',
          description: 'Add bookmarks to this collection to get started.',
          actionLabel: 'Add Bookmark',
        };
      default:
        return {
          icon: BookOpen,
          title: 'No bookmarks yet',
          description: 'Save your first webpage and build your personal knowledge library.',
          actionLabel: 'Save Current Page',
        };
    }
  };

  const { icon: Icon, title, description, actionLabel } = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{title}</h3>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">{description}</p>
      {onAction && (
        <Button onClick={onAction}>
          <ExternalLink className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}