export interface SortOption {
  label: string;
  value: string; 
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  { label: 'Recent', value: 'createdAt_desc' },
  { label: 'Oldest', value: 'createdAt_asc' }
];