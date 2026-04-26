import { animate, style, transition, trigger } from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
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
        style({ opacity: 0, transform: 'translateY(6px)' }),
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  styles: [`
    .shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    tr.data-row:hover td { background-color: rgb(239 246 255 / 0.6); }
    tr.data-row:hover td:first-child { box-shadow: inset 2px 0 0 0 #1565C0; }
    tbody tr.data-row:nth-child(even) td { background-color: rgb(248 250 252 / 0.5); }
    tbody tr.data-row:nth-child(even):hover td { background-color: rgb(239 246 255 / 0.6); }
    thead th { border-bottom: 1.5px solid #e2e8f0; }
  `],
  template: `
    <div class="flex flex-col bg-surface overflow-hidden border border-gray-200 rounded-xl shadow-sm" [style.height]="tableHeight">

      <!-- ── Toolbar ─────────────────────────────────────────────────── -->
      <div class="flex-none flex w-full items-center justify-between border-b border-gray-100 px-4 py-2.5 bg-surface gap-3">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="search-input w-60">
            <boo-input label="Search..." size="small">
              <boo-icon
                [class.animate-spin]="loading"
                [name]="loading ? 'loader-circle' : 'search'"
                color="#64748B"
                endfix
              />
            </boo-input>
          </div>
          <span *ngIf="!loading && totalItems > 0"
            class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[11px] font-semibold">
            {{ totalItems | number }} results
          </span>
        </div>

        <div class="flex items-center gap-0.5 text-gray-400 shrink-0">
          <button
            class="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            [class.bg-gray-100]="striped"
            (click)="striped = !striped"
            title="Toggle stripes"
          >
            <boo-icon name="rows-4" iconClass="w-4 h-4"></boo-icon>
          </button>
          <button class="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Columns">
            <boo-icon name="columns-3-cog" iconClass="w-4 h-4"></boo-icon>
          </button>
        </div>
      </div>

      <!-- ── Table scroll area ─────────────────────────────────────────── -->
      <div class="flex-1 min-h-0 w-full overflow-auto relative">
        <table class="w-full table-auto border-separate" style="border-spacing: 0;">

          <!-- Header -->
          <thead
            *ngIf="showHeader && columnsArray.length > 0"
            class="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10"
          >
            <tr cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="drop($event)">
              <th
                *ngFor="let col of columnsArray; let i = index"
                class="whitespace-nowrap text-[11px] font-semibold uppercase tracking-widest text-gray-400 select-none"
                [ngClass]="[tdPaddingClass, col.headerClass]"
                [style.width]="col.width"
                [style.min-width]="col.width"
              >
                <div class="flex items-center gap-1.5">
                  <span *ngIf="col.type === 'checkbox'" class="inline-flex items-center">
                    <input type="checkbox" [checked]="allSelected" (change)="toggleSelectAll()"
                      class="w-3.5 h-3.5 rounded border-gray-300 accent-primary" />
                  </span>
                  <ng-container *ngIf="col.type !== 'checkbox'">
                    <span>{{ col.headerLabel }}</span>
                    <button *ngIf="col.sortable" (click)="handleSort(col.name)"
                      class="transition-colors rounded p-0.5"
                      [class.text-primary]="sortConfig.key === col.name"
                      [class.text-gray-300]="sortConfig.key !== col.name"
                      [class.hover:text-gray-600]="sortConfig.key !== col.name">
                      <boo-icon 
                        [name]="sortConfig.key === col.name ? (sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down') : 'arrow-down-up'" 
                        iconClass="w-3 h-3"
                      />
                    </button>
                  </ng-container>
                </div>
              </th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody class="bg-surface relative divide-y divide-gray-100">
            <!-- Skeleton -->
            @if (loading) {
              @for (item of skeletonRows; track $index) {
                <tr>
                  @for (col of columnsArray; track col; let ci = $index) {
                    <td [ngClass]="[tdPaddingClass]">
                      <div class="flex items-center gap-2" [ngClass]="contentLimitClass">
                        <div *ngIf="ci === 0" class="shimmer w-7 h-7 rounded-lg shrink-0"></div>
                        <div class="shimmer h-3 rounded-full flex-1" [style.max-width.%]="getStableWidth($index * columnsArray.length + ci)"></div>
                      </div>
                    </td>
                  }
                </tr>
              }
            }
            @else {
              @for (row of data; track row.id; let idx = $index) {
                <tr
                  @rowAnimation
                  class="data-row transition-colors duration-100 cursor-default"
                  [ngClass]="rowHeightClass"
                >
                  @for (col of columnsArray; track col) {
                    <td class="text-sm text-gray-800 transition-colors duration-100" [class]="tdClass" [ngClass]="[tdPaddingClass]">
                      <div class="flex items-center w-full overflow-hidden" [ngClass]="contentLimitClass">
                        <span *ngIf="col.type === 'checkbox'" class="inline-flex items-center mr-3">
                          <input type="checkbox" [checked]="isSelected(row.id)" (change)="toggleRowSelection(row.id)"
                            class="w-3.5 h-3.5 rounded border-gray-300 accent-primary" />
                        </span>
                        <div class="line-clamp-2 whitespace-normal break-words w-full" [ngClass]="col.cellClass">
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

        <!-- Empty state -->
        <div *ngIf="!loading && data.length === 0"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
          <div class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
            <boo-icon name="rows-4" iconClass="w-6 h-6 text-gray-300"></boo-icon>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-500 mb-0.5">No records found</p>
            <p class="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        </div>
      </div>

      <!-- ── Footer ────────────────────────────────────────────────────── -->
      <div *ngIf="showFooter"
        class="flex-none border-t border-gray-100 bg-gray-50/60 flex items-center justify-between px-4 py-2 z-10">
        <span class="text-xs text-gray-400 select-none">
          <ng-container *ngIf="!loading && totalItems > 0">
            Showing
            <span class="font-semibold text-gray-600">{{ rangeStart }}–{{ rangeEnd }}</span>
            of
            <span class="font-semibold text-gray-600">{{ totalItems | number }}</span>
          </ng-container>
          <ng-container *ngIf="loading">
            <div class="shimmer h-3 w-32 rounded-full inline-block"></div>
          </ng-container>
        </span>
        <boo-pagination-admin
          [totalItems]="totalItems"
          [pageSize]="pageSize"
          [currentPage]="currentPage"
          (pageChange)="onPageChange($event)"
          [loading]="loading"
        />
      </div>
    </div>
  `
})
export class BooTableAdminComponent implements AfterContentInit {
  // #region Inputs, Outputs, Properties
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
  @Input() height: string = 'calc(100vh - 250px)';

  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ key: string, direction: 'asc' | 'desc' }>();

  @ContentChildren(ColumnDefDirective, { descendants: true }) columnDefs!: QueryList<ColumnDefDirective>;

  columnsArray: any[] = [];
  selectedRows: (number | string)[] = [];
  sortConfig = { key: '', direction: 'asc' as 'asc' | 'desc' };
  striped = true;

  booAnim = PHYSIO_BOO_ANIMATION;

  get tableHeight(): string {
    return this.height;
  }

  get skeletonRows(): number[] {
    return Array(this.pageSize).fill(0);
  }

  get tdPaddingClass(): string {
    switch (this.size) {
      case 'small': return 'px-3 py-1.5 text-xs';
      case 'large': return 'px-6 py-4 text-base';
      default: return 'px-4 py-2.5 text-sm';
    }
  }

  get rowHeightClass(): string {
    switch (this.size) {
      case 'small': return 'h-9';
      case 'large': return 'h-20';
      default: return 'h-12';
    }
  }

  get contentLimitClass(): string {
    switch (this.size) {
      case 'small': return 'h-5';
      case 'large': return 'h-14';
      default: return 'h-8';
    }
  }

  get allSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  get rangeStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
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