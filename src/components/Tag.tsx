import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantStyles = {
  default: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  outline: 'border border-neutral-300 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export function Tag({ children, variant = 'default', size = 'md', removable, onRemove, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className={cn(
            'flex items-center justify-center rounded-full transition-colors',
            'hover:bg-black/10 dark:hover:bg-white/10',
            size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
          )}
          aria-label="Remove tag"
        >
          <X className={cn('w-3 h-3', size === 'sm' && 'w-2.5 h-2.5')} />
        </button>
      )}
    </span>
  );
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: (tag: string) => void;
  tags: string[];
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
}

export function TagInput({ value, onChange, onAdd, tags, onRemoveTag, placeholder = 'Add tag...', maxTags, disabled }: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if ((e.key === 'Enter' || e.key === ',') && value.trim()) {
      e.preventDefault();
      const tag = value.trim();
      if (!tags.includes(tag) && (!maxTags || tags.length < maxTags)) {
        onAdd(tag);
        onChange('');
      }
    } else if (e.key === 'Backspace' && !value && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag) => (
        <Tag key={tag} variant="outline" removable onRemove={() => onRemoveTag(tag)} size="sm">
          {tag}
        </Tag>
      ))}
      {(!maxTags || tags.length < maxTags) && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => value.trim() && onAdd(value.trim()) && onChange('')}
          placeholder={tags.length === 0 ? placeholder : undefined}
          disabled={disabled}
          className="flex-1 min-w-[80px] px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0"
          aria-label="Add tag"
        />
      )}
    </div>
  );
}