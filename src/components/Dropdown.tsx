import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export interface DropdownOption<T> {
  value: T;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  value: T | T[];
  onChange: (value: T | T[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  renderOption?: (option: DropdownOption<T>, selected: boolean) => ReactNode;
  renderValue?: (selectedOptions: DropdownOption<T>[]) => ReactNode;
}

export function Dropdown<T>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  searchable = false,
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  renderOption,
  renderValue,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedValues = Array.isArray(value) ? value : [value];
  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node) || menuRef.current?.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredOptions = searchable
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (option: DropdownOption<T>) => {
    if (option.disabled) return;
    if (multiple) {
      const newValues = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  const triggerContent = renderValue
    ? renderValue(selectedOptions)
    : multiple
    ? selectedOptions.length > 0
      ? selectedOptions.map(o => o.label).join(', ')
      : placeholder
    : selectedOptions[0]?.label || placeholder;

  return (
    <div className={cn('relative inline-block w-full', className)}>
      <div
        ref={triggerRef}
        tabIndex={0}
        role={multiple ? 'listbox' : 'combobox'}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2.5',
          'bg-white dark:bg-neutral-800',
          'border border-neutral-300 dark:border-neutral-600',
          'rounded-lg',
          'text-neutral-900 dark:text-neutral-100',
          'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
          'hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          triggerClassName
        )}
      >
        <span className="truncate flex-1">{triggerContent}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-neutral-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-50 mt-1 w-full max-h-60 overflow-auto',
            'bg-white dark:bg-neutral-800',
            'border border-neutral-200 dark:border-neutral-700',
            'rounded-lg shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            menuClassName
          )}
          role="listbox"
        >
          {searchable && (
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
              autoFocus
            />
          )}
          <div className="py-1">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                No options found
              </div>
            )}
            {filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={String(option.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer transition-colors',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                    isSelected && 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {renderOption
                    ? renderOption(option, isSelected)
                    : (
                      <div className="flex items-center gap-2">
                        {option.icon && <span>{option.icon}</span>}
                        <span className="truncate">{option.label}</span>
                        {isSelected && !multiple && <Check className="w-4 h-4 flex-shrink-0" />}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}