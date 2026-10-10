import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { SearchFilters, SortOption } from '../types/bookmark';
import { Button } from '../components/Button';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { TagInput } from '../components/Tag';

interface SearchBarProps {
  filters: SearchFilters;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  onAddBookmark: () => void;
  uniqueDomains: string[];
  activeFilterCount: number;
}

const SORT_OPTIONS: DropdownOption<SortOption>[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'updated', label: 'Recently Updated' },
];

const DATE_RANGE_OPTIONS: DropdownOption<string>[] = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export function SearchBar({
  filters,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onAddBookmark,
  uniqueDomains,
  activeFilterCount,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleTagAdd = (tag: string) => {
    onFilterChange({ tags: [...filters.tags, tag] });
  };

  const handleTagRemove = (tag: string) => {
    onFilterChange({ tags: filters.tags.filter(t => t !== tag) });
  };

  const handleDomainChange = (domain: string | string[]) => {
    const value = Array.isArray(domain) ? domain[0] : domain;
    onFilterChange({ domain: value || undefined });
  };

  const handleDateRangeChange = (range: string | string[]) => {
    const value = Array.isArray(range) ? range[0] : range;
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    switch (value) {
      case 'today':
        onFilterChange({ dateRange: { start: now - day, end: now } });
        break;
      case 'week':
        onFilterChange({ dateRange: { start: now - 7 * day, end: now } });
        break;
      case 'month':
        onFilterChange({ dateRange: { start: now - 30 * day, end: now } });
        break;
      case 'year':
        onFilterChange({ dateRange: { start: now - 365 * day, end: now } });
        break;
      default:
        onFilterChange({ dateRange: { start: null, end: null } });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            aria-label="Search bookmarks"
          />
        </div>

        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="whitespace-nowrap">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Button onClick={onAddBookmark}>
          <span className="w-4 h-4">+</span>
          Add Bookmark
        </Button>
      </div>

      {showFilters && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200 space-y-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Collection</label>
              <Dropdown
                options={[
                  { value: '', label: 'All Collections' },
                  { value: 'none', label: 'No Collection' },
                ]}
                value={filters.collectionId || ''}
                onChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  onFilterChange({ collectionId: v || null });
                }}
                placeholder="All Collections"
                searchable={false}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Sort By</label>
              <Dropdown
                options={SORT_OPTIONS}
                value={filters.sortBy}
                onChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  onFilterChange({ sortBy: v as SortOption });
                }}
                placeholder="Sort by"
                searchable={false}
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Date Added</label>
              <Dropdown
                options={DATE_RANGE_OPTIONS}
                value={filters.dateRange.start ? 'custom' : ''}
                onChange={handleDateRangeChange}
                placeholder="All Time"
                searchable={false}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Tags</label>
            <TagInput
              value={tagInput}
              onChange={setTagInput}
              onAdd={handleTagAdd}
              tags={filters.tags}
              onRemoveTag={handleTagRemove}
              placeholder="Add tag filter..."
            />
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                  >
                    {tag}
                    <button onClick={() => handleTagRemove(tag)} className="hover:opacity-70">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Domain</label>
            <Dropdown
              options={[
                { value: '', label: 'All Domains' },
                ...uniqueDomains.map(d => ({ value: d, label: d })),
              ]}
              value={filters.domain || ''}
              onChange={handleDomainChange}
              placeholder="All Domains"
              searchable={true}
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-700">
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}