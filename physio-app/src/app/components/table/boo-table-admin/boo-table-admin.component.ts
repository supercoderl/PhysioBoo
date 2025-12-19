import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList } from '@angular/core';
import { ColumnDefDirective } from '../../../shared/directives/column-def.directive';
import { SharedModule } from '../../../shared/shared-imports';
import { BooButtonAdminComponent } from "../../button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../button/button-icon/button-icon.component";

@Component({
  selector: 'boo-table-admin',
  standalone: true,
  imports: [SharedModule, ButtonIconComponent, BooButtonAdminComponent],
  template: `
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead 
          *ngIf="showHeader && columnDefs && columnDefs.length > 0" 
          class="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b">
        
          <tr>
            <th *ngFor="let col of columnDefs" class="px-6 py-3" [ngClass]="col.headerClass">
              {{ col.headerLabel }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let row of data; let isLast = last" 
              [class.border-b]="!isLast && showBorder" 
              class="hover:bg-gray-50 transition-colors">
            
            <td *ngFor="let col of columnDefs" [class]="tdClass" [ngClass]="col.cellClass">
              <ng-container *ngTemplateOutlet="col.template; context: { $implicit: row }"></ng-container>
            </td>
          </tr>

          <tr *ngIf="!data || data.length === 0">
            <td [attr.colspan]="columnDefs.length || 1" class="p-8 text-center text-gray-500">
              There's empty data...
            </td>
          </tr>
        </tbody>
      </table>
      <ng-container *ngIf="showFooter && data && data.length > 0" >
        <div 
          class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50"
        >
          <div class="flex items-center gap-2">
            <button-icon 
              [icon]="{ name: 'chevron-left' }"
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              buttonClass="!p-2"
            />
            <div class="flex items-center gap-1">
              <boo-button-admin 
                *ngFor="let page of getPageNumbers()"
                textColor="white"
                (click)="goToPage(page)"
              >
                {{ page }}
              </boo-button-admin>
            </div>

            <button-icon  
              (click)="nextPage()"
              [icon]="{ name: 'chevron-right' }"
              [disabled]="currentPage === getTotalPages()"
              buttonClass="!p-2"
            />
          </div>
        </div>
      </ng-container>
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
  @Input() pageSize: number = 10;
  @Input() totalItems: number = 0;
  @Input() maxVisiblePages: number = 5;
  @Output() pageChange = new EventEmitter<number>();
  @ContentChildren(ColumnDefDirective, { descendants: true }) columnDefs!: QueryList<ColumnDefDirective>;

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];

    if (totalPages <= this.maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis logic
      const halfVisible = Math.floor(this.maxVisiblePages / 2);
      let startPage = Math.max(1, this.currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + this.maxVisiblePages - 1);

      if (endPage - startPage < this.maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - this.maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
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
  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages() && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.goToPage(this.currentPage + 1);
    }
  }
  // #endregion
}