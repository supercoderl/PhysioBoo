import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { MasterDataColumn } from "../../../../shared/types/master-data.types";
import { SortOption } from "../../../../shared/types/sort";
import { BooActionAdminComponent } from "../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent, FilterConfig } from "../../../table/boo-table-admin/boo-table-admin.component";
import { StatusBadgeComponent } from "../../../ui/status-badge.component";

/** Table for any Master Data catalog: a clickable name column, the configured columns, and row actions. */
@Component({
  selector: 'superadmin-master-data-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    StatusBadgeComponent
  ],
  host: { class: 'block h-full min-h-0' },
  template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 h-full overflow-hidden">
      <boo-table-admin
        [data]="data?.items ?? []"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? filter.pageNumber"
        [pageSize]="data?.pageSize ?? filter.pageSize"
        [totalItems]="data?.totalCount ?? 0"
        [sortOptions]="sortOptions"
        [currentSort]="currentSort"
        [filterConfigs]="filterConfigs"
        [currentFilter]="currentFilter"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
        (searchChange)="searchChange.emit($event)"
        (reload)="reloadClick.emit()"
        (sortApply)="sortApply.emit($event)"
        (filterApply)="filterApply.emit($event)"
      >
        <ng-template [appColumnDef]="nameKey" headerLabel="Name" headerClass="text-left" let-item>
          <button
            type="button"
            class="min-w-0 max-w-full text-left rounded-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            [attr.aria-label]="'Edit ' + item[nameKey]"
            (click)="editClick.emit(item.id)"
          >
            <span class="block font-medium text-primary truncate" [title]="item[nameKey]">{{ item[nameKey] || '—' }}</span>
          </button>
        </ng-template>

        <ng-container *ngFor="let col of columns">
          <ng-template
            [appColumnDef]="col.key"
            [headerLabel]="col.label"
            [headerClass]="'text-' + (col.align ?? 'left')"
            [cellClass]="'text-' + (col.align ?? 'left')"
            let-item
          >
            <ng-container [ngSwitch]="col.kind">
              <ng-container *ngSwitchCase="'boolean'">
                <boo-status-badge *ngIf="item[col.key]; else none" label="Yes" tone="primary" />
              </ng-container>
              <ng-container *ngSwitchCase="'badge'">
                <boo-status-badge *ngIf="display(item, col) as text; else none" [label]="text" tone="neutral" />
              </ng-container>
              <span *ngSwitchCase="'number'" class="text-sm tabular-nums">{{ display(item, col) ?? '—' }}</span>
              <span *ngSwitchDefault class="text-sm">{{ display(item, col) ?? '—' }}</span>
            </ng-container>
            <ng-template #none><span class="text-sm text-secondary">—</span></ng-template>
          </ng-template>
        </ng-container>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin [items]="tableActions" [data]="item" />
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `
})
export class SuperadminMasterDataTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<any> | null = null;
  @Input({ required: true }) nameKey!: string;
  @Input({ required: true }) columns!: MasterDataColumn[];
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort?: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter?: Record<string, any> = {};
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();

  readonly tableActions: ActionItem[] = [
    { label: 'Edit', onClick: (item: any) => this.editClick.emit(item.id) },
    { label: 'Delete', isDanger: true, onClick: (item: any) => this.deleteClick.emit(item.id) }
  ];
  // #endregion

  // #region Methods
  display(row: any, col: MasterDataColumn): string | null {
    if (col.format) return col.format(row);
    const value = row[col.key];
    if (value === null || value === undefined || value === '') return null;
    return col.kind === 'number' ? Number(value).toLocaleString() : String(value);
  }
  // #endregion
}
