import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { ArrowDownUp, Columns3Cog, EllipsisVertical, GripVertical, ListFilter, Rows4, Search } from 'lucide-angular';
import { ColumnDefDirective } from '../../../shared/directives/column-def.directive';
import { SharedModule } from '../../../shared/shared-imports';
import { Size } from '../../../shared/types/common';
import { PHYSIO_BOO_ANIMATION } from '../../../shared/utils/animation.utils';
import { BooIconComponent } from "../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../input/boo-input/boo-input.component";
import { PaginationComponent } from "./boo-pagination-admin.component";

@Component({
  selector: 'boo-table-admin',
  standalone: true,
  imports: [SharedModule, PaginationComponent, BooInputComponent, BooIconComponent],
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="flex flex-col bg-surface overflow-hidden border border-gray-200 rounded-lg shadow-sm">
      <div class="flex w-full items-center justify-between border-b border-gray-200 px-4 py-3 bg-surface z-[1] relative">
        <div class="flex items-center gap-2 w-72">
          <div class="search-input w-full">
            <boo-input
              label="Search..."
              size="small"
            >
              <boo-icon
                [class.animate-spin]="loading"
                [name]="loading ? 'loader-circle' : 'search'"
                color="#64748B"
                endfix
              />
            </boo-input>
          </div>
        </div>
        
        <div class="flex items-center gap-1 text-gray-500">
          <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" aria-label="Filter">
            <lucide-icon [name]="listFilterIcon" class="w-4 h-4"></lucide-icon>
          </button>
          <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" aria-label="Columns">
            <lucide-icon [name]="columns3cogIcon" class="w-4 h-4"></lucide-icon>
          </button>
          <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" aria-label="Density">
            <lucide-icon [name]="rows4Icon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      </div>

      <div class="flex-auto w-full relative" [ngClass]="loading ? 'overflow-hidden' : 'overflow-x-auto'" style="max-height: clamp(350px, -88px + 100vh, 9999px);">
        <table class="w-full table-auto border-separate" style="border-spacing: 0;">
          <thead 
            *ngIf="showHeader && columnsArray.length > 0" 
            class="bg-gray-50 sticky top-0 z-10 text-xs uppercase text-gray-500 tracking-wider"
          >
            <tr cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="drop($event)">
              <th 
                *ngFor="let col of columnsArray; let i = index" 
                class="whitespace-nowrap border-b border-gray-200" 
                [ngClass]="[tdPaddingClass, col.headerClass]"
                [style.width]="col.width"
                [style.min-width]="col.width"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span *ngIf="col.type === 'checkbox'" class="inline-flex items-center">
                      <input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll()" class="w-4 h-4 rounded border-gray-300" />
                    </span>
                    <ng-container *ngIf="col.type !== 'checkbox'">
                      {{ col.headerLabel }}
                      <button *ngIf="col.sortable" (click)="handleSort(col.name)" class="ml-1 hover:text-gray-700">
                        <lucide-icon [name]="arrowDownUpIcon" class="w-4 h-4"></lucide-icon>
                      </button>
                    </ng-container>
                  </div>

                  <div *ngIf="col.hasActions" class="flex items-center gap-1">
                    <button *ngIf="col.draggable" cdkDrag class="cursor-move p-1 hover:bg-gray-200 rounded" aria-label="Move">
                      <lucide-icon [name]="gripVerticalIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                    <button class="p-1 hover:bg-gray-200 rounded" aria-label="Column Actions">
                      <lucide-icon [name]="ellipsisVerticalIcon" class="w-4 h-4"></lucide-icon>
                    </button>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          <tbody class="bg-surface relative">
            @if (loading) {
              @for (item of skeletonRows; track $index) {
                <tr class="border-b border-gray-100">
                  @for (col of columnsArray; track col) {
                    <td class="whitespace-nowrap text-sm" [class]="tdClass" [ngClass]="[tdPaddingClass]">
                      <div class="flex items-center w-full" [ngClass]="[contentLimitClass, col.cellClass]">
                        <div class="h-3.5 bg-gray-200 rounded animate-pulse" [style.width.%]="getStableWidth($index)"></div>
                      </div>
                    </td>
                  }
                </tr>
              }
            } 
            @else {
              @for (row of data; track row.id; let isLast = $last) {
                <tr 
                  @rowAnimation
                  [class.border-b]="!isLast && showBorder" 
                  class="hover:bg-gray-50 border-gray-200 group transition-colors"
                  [ngClass]="rowHeightClass"
                >
                  @for (col of columnsArray; track col) {
                    <td class="text-sm text-gray-900" [class]="tdClass" [ngClass]="[tdPaddingClass]">
                      <div class="flex items-center w-full overflow-hidden" [ngClass]="[contentLimitClass]">
                        <span *ngIf="col.type === 'checkbox'" class="inline-flex items-center mr-3">
                          <input type="checkbox" [checked]="isSelected(row.id)" (change)="toggleRowSelection(row.id)" class="w-4 h-4 rounded border-gray-300" />
                        </span>

                        <div class="line-clamp-2 whitespace-normal break-words w-full" [ngClass]="[col.cellClass]">
                          <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
                        </div>
                      </div>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div *ngIf="showFooter" class="border-t border-gray-200 bg-gray-50 flex items-center justify-end sticky bottom-0 z-10" [ngClass]="tdPaddingClass">
        <boo-pagination-admin [totalItems]="totalItems" [pageSize]="pageSize" [currentPage]="currentPage" (pageChange)="onPageChange($event)" [loading]="loading" />
      </div>
    </div>
  `
})
export class BooTableAdminComponent implements AfterContentInit {
  // #region Inputs, Outputs, Properties
  searchIcon = Search;
  listFilterIcon = ListFilter;
  columns3cogIcon = Columns3Cog;
  rows4Icon = Rows4;
  arrowDownUpIcon = ArrowDownUp;
  gripVerticalIcon = GripVertical;
  ellipsisVerticalIcon = EllipsisVertical;

  @Input() data: any[] = [];
  @Input() showHeader: boolean = true;
  @Input() showBorder: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() tdClass: string = "";
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 5;
  @Input() totalItems: number = 0;
  @Input() maxVisiblePages: number = 5;
  @Input() loading: boolean = false;
  @Input() size: Size = 'middle';

  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ key: string, direction: 'asc' | 'desc' }>();

  @ContentChildren(ColumnDefDirective, { descendants: true }) columnDefs!: QueryList<ColumnDefDirective>;

  columnsArray: any[] = [];
  selectedRows: (number | string)[] = [];
  sortConfig = { key: '', direction: 'asc' as 'asc' | 'desc' };

  booAnim = PHYSIO_BOO_ANIMATION;

  get skeletonRows(): number[] {
    return Array(this.pageSize).fill(0);
  }

  get tdPaddingClass(): string {
    switch (this.size) {
      case 'small': return 'px-2 py-1 text-xs';
      case 'large': return 'px-6 py-4 text-base';
      default: return 'px-4 py-2 text-sm';
    }
  }

  get rowHeightClass(): string {
    switch (this.size) {
      case 'small': return 'h-10';
      case 'large': return 'h-20';
      default: return 'h-14';
    }
  }

  get contentLimitClass(): string {
    switch (this.size) {
      case 'small': return 'h-6';
      case 'large': return 'h-14';
      default: return 'h-10';
    }
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngAfterContentInit() {
    if (this.totalItems === 0 && this.data) {
      this.totalItems = this.data.length;
    }
    this.columnDefs.changes.subscribe(() => {
      this.columnsArray = this.columnDefs.toArray();
    });
    if (this.columnDefs) {
      this.columnsArray = this.columnDefs.toArray();
    }
  }
  // #endregion

  // #region Methods
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchChange.emit(input.value);
  }

  handleSort(columnKey: string): void {
    if (this.sortConfig.key === columnKey) {
      this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortConfig = { key: columnKey, direction: 'asc' };
    }
    this.sortChange.emit(this.sortConfig);
  }

  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.columnsArray, event.previousIndex, event.currentIndex);
  }

  // Row Selection Logic
  toggleRowSelection(id: number | string): void {
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

  isSelected(id: number | string): boolean {
    return this.selectedRows.includes(id);
  }

  getStableWidth(index: number): number {
    const randomBase = (index * 37) % 40;
    return 50 + randomBase;
  }
  // #endregion
}