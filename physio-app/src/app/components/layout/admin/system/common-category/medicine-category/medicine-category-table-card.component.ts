import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { MedicineCategory } from "../../../../../../shared/types/clinical";
import { ActionItem, PaginationData } from "../../../../../../shared/types/common";
import { SortOption } from "../../../../../../shared/types/sort";
import { BulkAction, GroupableColumn, SavedView, TableComment } from "../../../../../../shared/types/table";
import { ColorUtils } from "../../../../../../shared/utils/color.utils";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent, FilterConfig } from "../../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'common-category-medicine-category-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooIconComponent
  ],
  host: { class: 'block h-full min-h-0' },
  template: `
    <div class="bg-surface rounded-[6px] border border-gray-200 h-full overflow-hidden">
      <boo-table-admin 
        [data]="data?.items ?? []" 
        tdClass="px-4 py-3"
        [showFooter]="true" 
        [currentPage]="data?.pageNumber ?? filter.pageNumber"
        [pageSize]="data?.pageSize ?? filter.pageSize"
        [totalItems]="data?.totalCount ?? 0"
        [bulkActions]="bulkActions"
        [sortOptions]="sortOptions"
        [currentSort]="currentSort"
        [filterConfigs]="filterConfigs"
        [currentFilter]="currentFilter"
        [savedViews]="savedViews"
        [currentViewId]="currentViewId"
        [groupableColumns]="groupableColumns"
        [currentGroupBy]="currentGroupBy"
        [comments]="comments"
        (pageChange)="onPageClick($event)"
        (searchChange)="onSearchChange($event)"
        (reload)="onReloadClick()"
        (bulkAction)="bulkAction.emit($event)"
        (sortApply)="sortApply.emit($event)"
        (filterApply)="filterApply.emit($event)"
        (viewSelect)="viewSelect.emit($event)"
        (viewSaveAsNew)="viewSaveAsNew.emit()"
        (viewDelete)="viewDelete.emit($event)"
        (groupApply)="groupApply.emit($event)"
        (commentAdd)="commentAdd.emit($event)"
        (commentDelete)="commentDelete.emit($event)"
        (resetView)="resetView.emit()"
        [loading]="loadingSrv.isLoading('search')"
      >  
        <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>

        <ng-template appColumnDef="name" headerLabel="Name" headerClass="text-left" let-item>
          <div class="flex items-center gap-3 overflow-hidden" (click)="onEditClick(item.id)">
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold text-danger cursor-pointer" [title]="item.name">
                {{ item.name }}
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="code" headerLabel="Code" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.code }}</div>
        </ng-template>

        <ng-template appColumnDef="description" headerLabel="Description" headerClass="text-left" let-item>
          {{ item.description }}
        </ng-template>

        <ng-template appColumnDef="isControlled" headerLabel="Controlled" headerClass="text-left" cellClass="text-center" let-item>
          <boo-icon name="circle-check" *ngIf="item.isControlled"  />
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin
              [items]="tableActions"
              [data]="item"
            />
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .pi {
        font-size: 0.875rem;
      }
    }
  `]
})
export class CommonCategoryMedicineCategoryTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<MedicineCategory> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter: Record<string, any> = {};
  @Input() savedViews: SavedView[] = [];
  @Input() currentViewId: string | null = null;
  @Input() currentGroupBy: string | null = null;
  @Input() comments: TableComment[] = [];
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<{ action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();
  @Output() viewSelect = new EventEmitter<SavedView>();
  @Output() viewSaveAsNew = new EventEmitter<void>();
  @Output() viewDelete = new EventEmitter<SavedView>();
  @Output() groupApply = new EventEmitter<string | null>();
  @Output() commentAdd = new EventEmitter<string>();
  @Output() commentDelete = new EventEmitter<TableComment>();
  @Output() resetView = new EventEmitter<void>();

  readonly groupableColumns: GroupableColumn[] = [

  ];
  ColorUtils = ColorUtils;

  readonly bulkActions: BulkAction[] = [
    { key: 'export', label: 'Export', icon: 'download', variant: 'default' },
    { key: 'delete', label: 'Delete', icon: 'trash-2', variant: 'danger', requireConfirm: true },
  ];

  readonly tableActions: ActionItem[] = [
    {
      label: 'Delete',
      isDanger: true,
      onClick: (item: any) => this.onDeleteClick(item.id)
    }
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    protected loadingSrv: LocalLoadingService
  ) { }
  // #endregion

  // #region Methods
  onPageClick(page: number) {
    this.pageChange.emit(page);
  }

  onEditClick(id: string) {
    this.editClick.emit(id);
  }

  onDeleteClick(id: string) {
    this.deleteClick.emit(id);
  }

  onSearchChange(val: string) {
    this.searchChange.emit(val);
  }

  onReloadClick() {
    this.reloadClick.emit();
  }
  // #endregion
}