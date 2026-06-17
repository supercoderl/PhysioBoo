export interface Column {
    id: string;
    label: string;
    sortable: boolean;
    draggable: boolean;
    hasActions: boolean;
    pinned: boolean;
}

export interface TableRow {
    id: number;
    name: string;
    image: string;
    category: string[];
    price: number;
    quantity: number;
    active: boolean;
    link: string;
}

export interface BulkAction {
  key: string;
  label: string;
  icon?: string;
  variant?: 'default' | 'primary' | 'danger';
  disabled?: boolean;
  requireConfirm?: boolean;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface SavedView {
  id: string;
  name: string;
  icon?: string;
  isDefault?: boolean;
}

export interface GroupableColumn {
  key: string;
  label: string;
}

export interface TableComment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  createdAt: string | Date;
}