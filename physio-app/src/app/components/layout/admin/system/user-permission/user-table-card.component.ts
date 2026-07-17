import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { User } from "../../../../../shared/types/core.types";
import { BulkAction, GroupableColumn, SavedView, SortOption, TableComment } from "../../../../../shared/types/table.types";
import { ColorUtils } from "../../../../../shared/utils/color.utils";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent, FilterConfig } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'user-permission-user-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent
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

        <ng-template appColumnDef="user" headerLabel="User" headerClass="text-left" let-item>
          <div class="flex items-center gap-3 overflow-hidden" (click)="onEditClick(item.id)">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3">
                <div
                    *ngIf="!item.profilePicture"
                    class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm"
                >
                  {{ onInit(item) }}
                </div>
                <img
                  *ngIf="item.profilePicture"
                  [src]="item.profilePicture"
                  class="w-9 h-9 rounded-full object-cover"
                />
                <div class="min-w-0">
                  <div class="font-medium text-primary truncate">
                    {{ item.email }}
                  </div>
                  <div class="text-xs text-secondary">
                    {{ item.id.slice(0, 8) }}…
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.phone || "—" }}</div>
          <div class="text-xs text-secondary" *ngIf="item.isVerified">
            Verified
          </div>
        </ng-template>

        <ng-template appColumnDef="roles" headerLabel="Roles" headerClass="text-left" let-item>
          <div class="flex flex-wrap gap-1">
            <span
              *ngFor="let r of item.roles ?? []"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              [style.background-color]="ColorUtils.softBg(ColorUtils.roleColorFor(r))"
              [style.color]="ColorUtils.roleColorFor(r)"
            >
              {{ r.name }}
            </span>
            <span
              *ngIf="!item.roles?.length"
              class="text-xs text-gray-400 italic"
              >No roles</span
            >
          </div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="item.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              [ngClass]="item.isActive ? 'bg-emerald-500' : 'bg-gray-400'"
            ></span>
            {{ item.isActive ? "Active" : "Inactive" }}
          </span>
          <span
            *ngIf="item.twoFactorEnabled"
            class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700"
            title="2FA enabled"
          >
            2FA
          </span>
        </ng-template>

        <ng-template appColumnDef="lastLogin" headerLabel="Last Login" headerClass="text-left" let-item>
          {{ item.lastLoginAt ? (item.lastLoginAt | date: "short") : "—" }}
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
export class UserPermissionUserTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<User> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort?: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter?: Record<string, any> = {};
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
  @Output() init = new EventEmitter<User>();

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

  onInit(user: User) {
    this.init.emit(user);
  }
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