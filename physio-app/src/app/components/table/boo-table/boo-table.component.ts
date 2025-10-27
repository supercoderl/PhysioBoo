import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { ArrowDownUp, Columns3Cog, EllipsisVertical, GripVertical, ListFilter, Rows4, Search } from "lucide-angular";
import { SharedModule } from '../../../shared/shared-imports';
import { Column, TableRow } from '../../../shared/types/table';

@Component({
  selector: 'boo-table',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './boo-table.component.html',
  styleUrl: './boo-table.component.scss'
})
export class BooTableComponent {
  search = Search;
  listFilter = ListFilter;
  columns3cog = Columns3Cog;
  rows4 = Rows4;
  arrowDownUp = ArrowDownUp;
  gripVertical = GripVertical;
  ellipsisVertical = EllipsisVertical;
  columns: Column[] = [
    { id: 'checkbox', label: '', sortable: false, draggable: false, hasActions: false, pinned: true },
    { id: 'image', label: '', sortable: false, draggable: false, hasActions: true, pinned: false },
    { id: 'name', label: 'Name', sortable: true, draggable: true, hasActions: true, pinned: false },
    { id: 'category', label: 'Category', sortable: true, draggable: true, hasActions: true, pinned: false },
    { id: 'price', label: 'Price', sortable: true, draggable: true, hasActions: true, pinned: false },
    { id: 'quantity', label: 'Quantity', sortable: true, draggable: true, hasActions: true, pinned: false },
    { id: 'active', label: 'Active', sortable: true, draggable: true, hasActions: true, pinned: false },
    { id: 'actions', label: 'Actions', sortable: false, draggable: false, hasActions: false, pinned: true },
  ];
  data: TableRow[] = [
    {
      id: 1,
      name: 'A Walk Amongst Friends - Canvas Print',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Nature'],
      price: 10.24,
      quantity: 3,
      active: true,
      link: '#'
    },
    {
      id: 2,
      name: 'Mountain Sunrise - Photo Print',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=100&h=100&fit=crop',
      category: ['Photo Print', 'Landscape'],
      price: 15.99,
      quantity: 12,
      active: true,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
    {
      id: 3,
      name: 'Urban Streets - Canvas',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=100&h=100&fit=crop',
      category: ['Canvas Print', 'Urban'],
      price: 22.50,
      quantity: 5,
      active: false,
      link: '#'
    },
  ];

  sortConfig = { key: 'name', direction: 'asc' };
  selectedRows: number[] = [];

  // Get draggable columns only
  get draggableColumns(): Column[] {
    return this.columns.filter(col => col.draggable);
  }

  // Sort data
  get sortedData(): TableRow[] {
    if (!this.sortConfig.key) return this.data;
    
    return [...this.data].sort((a: any, b: any) => {
      const aVal = a[this.sortConfig.key];
      const bVal = b[this.sortConfig.key];
      
      if (aVal < bVal) return this.sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  handleSort(columnId: string): void {
    if (this.sortConfig.key === columnId) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig = { key: columnId, direction: 'asc' };
    }
  }

  drop(event: CdkDragDrop<Column[]>): void {
    const allColumns = [...this.columns];
    const draggableStartIndex = allColumns.findIndex(col => col.draggable);
    
    moveItemInArray(
      allColumns, 
      draggableStartIndex + event.previousIndex, 
      draggableStartIndex + event.currentIndex
    );
    
    this.columns = allColumns;
  }

  toggleRowSelection(id: number): void {
    const index = this.selectedRows.indexOf(id);
    if (index > -1) {
      this.selectedRows.splice(index, 1);
    } else {
      this.selectedRows.push(id);
    }
  }

  toggleSelectAll(): void {
    if (this.selectedRows.length === this.data.length) {
      this.selectedRows = [];
    } else {
      this.selectedRows = this.data.map(row => row.id);
    }
  }

  isSelected(id: number): boolean {
    return this.selectedRows.includes(id);
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }
}
