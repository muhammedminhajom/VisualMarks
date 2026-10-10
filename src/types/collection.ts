export interface Collection {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: number;
  updatedAt: number;
}

export interface CollectionInput {
  name: string;
  description?: string;
  icon?: string;
}

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'ai-ml',
    name: 'AI / Machine Learning',
    description: 'Artificial intelligence and machine learning resources',
    icon: 'brain',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'development',
    name: 'Development',
    description: 'Programming, frameworks, and development tools',
    icon: 'code',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Academic papers, articles, and research materials',
    icon: 'search',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'design',
    name: 'Design',
    description: 'UI/UX, graphics, and design inspiration',
    icon: 'palette',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'college',
    name: 'College',
    description: 'Course materials, assignments, and academic resources',
    icon: 'graduation-cap',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'Personal and professional project resources',
    icon: 'folder-kanban',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const COLLECTION_ICONS = [
  'brain', 'code', 'search', 'palette', 'graduation-cap', 'folder-kanban',
  'book-open', 'globe', 'server', 'database', 'git-branch', 'terminal',
  'shield', 'cloud', 'cpu', 'hard-drive', 'monitor', 'smartphone',
  'tablet', 'camera', 'music', 'film', 'gamepad', 'heart', 'star',
  'flag', 'tag', 'archive', 'inbox', 'send', 'mail', 'message-circle',
  'users', 'user', 'settings', 'home', 'folder', 'file-text', 'image',
  'video', 'audio', 'pdf', 'presentation', 'spreadsheet', 'doc',
] as const;