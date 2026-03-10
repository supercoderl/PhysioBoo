import { animate, style, transition, trigger } from '@angular/animations';
import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { ColumnDefDirective } from '../../../shared/directives/column-def.directive';
import { SharedModule } from '../../../shared/shared-imports';
import { Size } from '../../../shared/types/common';
import { PHYSIO_BOO_ANIMATION } from '../../../shared/utils/animation.utils';
import { PaginationComponent } from "./boo-pagination-admin.component";

@Component({
  selector: 'boo-table-admin',
  standalone: true,
  imports: [SharedModule, PaginationComponent],
  animations: [
    trigger('rowAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <div class="w-full overflow-hidden">
      <div class="w-full" [ngClass]="loading ? 'overflow-hidden' : 'overflow-x-auto'">
        <table class="w-full table-auto">
          <thead 
            *ngIf="showHeader && columnDefs && columnDefs.length > 0" 
            class="bg-surface text-xs uppercase text-gray-700 font-semibold border-b"
          >
            <tr>
              <th 
                *ngFor="let col of columnDefs" 
                class="whitespace-nowrap text-regular" 
                [ngClass]="[tdPaddingClass, col.headerClass]"
                [style.width]="col.width"
                [style.min-width]="col.width"
              >
                {{ col.headerLabel }}
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200 bg-surface relative">
            @if (loading) {
              @for (item of skeletonRows; track $index) {
                <tr class="h-14 border-b border-gray-100">
                  @for (col of columnDefs; track col) {
                    <td 
                      class="whitespace-nowrap text-regular" 
                      [class]="tdClass" 
                      [ngClass]="[tdPaddingClass]"
                    >
                      <div class="flex items-center w-full" [ngClass]="[contentLimitClass, col.cellClass]">
                        <div class="h-3.5 bg-gray-200 rounded col-span-2 animate-pulse" [style.width.%]="getStableWidth($index)"></div>
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
                  class="hover:bg-borderGray h-14 group transition-colors"
                  [ngClass]="rowHeightClass"
                >
                  @for (col of columnDefs; track col) {
                    <td 
                      class="text-regular" 
                      [class]="tdClass" 
                      [ngClass]="[tdPaddingClass]"
                    >
                      <div 
                        class="flex items-center w-full overflow-hidden" 
                        [ngClass]="[contentLimitClass]"
                      >
                        <div 
                          class="line-clamp-2 whitespace-normal break-words w-full" 
                          [ngClass]="[col.cellClass]"
                        >
                          <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
                        </div>
                      </div>
                    </td>
                  }
                </tr>
              }

              @if (!data || data.length === 0) {
                <tr>
                  <td [attr.colspan]="columnDefs.length || 1" class="p-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <div class="p-4 bg-gray-50 rounded-full">
                          <span class="text-4xl opacity-50">📭</span>
                       </div>
                       <span class="text-gray-500 font-medium">No data found</span>
                       <span class="text-xs text-gray-400">Try adjusting your search or filters</span>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
        <div 
          *ngIf="showFooter" 
          class="border-t border-gray-200 bg-surface flex items-center justify-end"
          [ngClass]="tdPaddingClass"
        >
          <boo-pagination-admin 
            [class.opacity-50]="loading"
            [class.pointer-events-none]="loading"
            [totalItems]="totalItems"
            [pageSize]="pageSize"
            [currentPage]="currentPage"
            (pageChange)="onPageChange($event)"
            [loading]="loading"
          />
        </div>
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
  @Output() pageChange = new EventEmitter<number>();
  @ContentChildren(ColumnDefDirective, { descendants: true }) columnDefs!: QueryList<ColumnDefDirective>;
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

  // boo-table-admin.component.ts

  get contentLimitClass(): string {
    switch (this.size) {
      case 'small':
        return 'h-6';
      case 'large':
        return 'h-14';
      default:
        return 'h-10';
    }
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngAfterContentInit() {
    if (this.totalItems === 0 && this.data) {
      this.totalItems = this.data.length;
    }
  }
  // #endregion

  // #region Methods
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  getStableWidth(index: number): number {
    const randomBase = (index * 37) % 40;
    return 50 + randomBase;
  }
  // #endregion
}