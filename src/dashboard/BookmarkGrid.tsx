import { BookmarkCard } from './BookmarkCard';
import { EmptyState } from './EmptyState';
import { Bookmark } from '../types/bookmark';
import { cn } from '../utils/cn';

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  onOpen?: (url: string) => void;
}

export function BookmarkGrid({ bookmarks, onOpen }: BookmarkGridProps) {
  if (bookmarks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        'grid-cols-1',
        'sm:grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'xl:grid-cols-5',
        '2xl:grid-cols-6'
      )}
      role="list"
      aria-label="Bookmarks"
    >
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} onOpen={onOpen} />
      ))}
    </div>
  );
}