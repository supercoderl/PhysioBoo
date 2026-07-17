import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { User } from "../../../../shared/types/core.types";
import { SortOption } from "../../../../shared/types/sort";
import { ColorUtils } from "../../../../shared/utils/color.utils";
import { BooActionAdminComponent } from "../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent, FilterConfig } from "../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'superadmin-user-table-card',
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
        [sortOptions]="sortOptions"
        [currentSort]="currentSort"
        [filterConfigs]="filterConfigs"
        [currentFilter]="currentFilter"
        (pageChange)="onPageClick($event)"
        (searchChange)="onSearchChange($event)"
        (reload)="onReloadClick()"
        (sortApply)="sortApply.emit($event)"
        (filterApply)="filterApply.emit($event)"
        [loading]="loadingSrv.isLoading('search')"
      >
        <ng-template appColumnDef="user" headerLabel="User" headerClass="text-left" let-item>
          <div class="flex items-center gap-3 overflow-hidden" (click)="onEditClick(item.id)">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3">
                <div
                    *ngIf="!item.profilePicture"
                    class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm"
                >
                  {{ userInitial(item) }}
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

        <ng-template appColumnDef="tenant" headerLabel="Hospital / Tenant" headerClass="text-left" let-item>
          <span
            *ngIf="item.hospital as h; else noTenant"
            class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            {{ h.name }}
          </span>
          <ng-template #noTenant>
            <span class="text-xs text-gray-400 italic">Unassigned</span>
          </ng-template>
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
  `
})
export class SuperadminUserTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<User> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort?: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter?: Record<string, any> = {};
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();

  ColorUtils = ColorUtils;

  readonly tableActions: ActionItem[] = [
    { label: 'Edit', onClick: (item: any) => this.onEditClick(item.id) },
    { label: 'Delete', isDanger: true, onClick: (item: any) => this.onDeleteClick(item.id) }
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    protected loadingSrv: LocalLoadingService
  ) { }
  // #endregion

  // #region Methods
  userInitial(user: User): string {
    return (user.email?.[0] || '?').toUpperCase();
  }

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
