import { Component, EventEmitter, Input, Output } from "@angular/core";
import { subscriptionPlanLabel } from "../../../../shared/enums/subscription-plan";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { SortOption } from "../../../../shared/types/sort";
import { HospitalGroup } from "../../../../shared/types/support.types";
import { BooActionAdminComponent } from "../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent, FilterConfig } from "../../../table/boo-table-admin/boo-table-admin.component";
import { BooStatusBadgeComponent } from '@physioboo/ui';

@Component({
  selector: 'superadmin-tenant-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooStatusBadgeComponent
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
        <ng-template appColumnDef="tenant" headerLabel="Tenant" headerClass="text-left" let-item>
          <button
            type="button"
            class="flex items-center gap-3 min-w-0 max-w-full text-left rounded-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            [attr.aria-label]="'Open tenant ' + item.name"
            (click)="viewClick.emit(item.id)"
          >
            <img
              *ngIf="item.logoUrl"
              [src]="item.logoUrl"
              alt=""
              class="w-9 h-9 rounded-1.5 object-cover shrink-0"
            />
            <div
              *ngIf="!item.logoUrl"
              class="w-9 h-9 rounded-1.5 bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm shrink-0"
              aria-hidden="true"
            >
              {{ initial(item.name) }}
            </div>
            <div class="min-w-0">
              <div class="font-medium text-primary truncate" [title]="item.name">{{ item.name }}</div>
              <div class="text-xs text-secondary tabular-nums">{{ item.code || '—' }}</div>
            </div>
          </button>
        </ng-template>

        <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.contactPerson || '—' }}</div>
          <div class="text-xs text-secondary truncate">{{ item.email || '' }}</div>
        </ng-template>

        <ng-template appColumnDef="hospitalCount" headerLabel="Hospitals" headerClass="text-center" cellClass="text-center" let-item>
          <span class="text-sm font-medium tabular-nums">{{ item.hospitalCount }}</span>
        </ng-template>

        <ng-template appColumnDef="plan" headerLabel="Plan" headerClass="text-left" let-item>
          <boo-status-badge [label]="planLabel(item.subscriptionPlan)" tone="neutral" />
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge
            [label]="item.isActive ? 'Active' : 'Inactive'"
            [tone]="item.isActive ? 'success' : 'neutral'"
            dotted
          />
        </ng-template>

        <ng-template appColumnDef="createdAt" headerLabel="Created" headerClass="text-left" let-item>
          <span class="text-sm tabular-nums">{{ item.createdAt | date: 'mediumDate' }}</span>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin [items]="tableActions" [data]="item" />
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `
})
export class SuperadminTenantTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<HospitalGroup> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort?: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter?: Record<string, any> = {};
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() viewClick = new EventEmitter<string>();
  @Output() editClick = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();

  readonly planLabel = subscriptionPlanLabel;

  readonly tableActions: ActionItem[] = [
    { label: 'View', onClick: (item: any) => this.viewClick.emit(item.id) },
    { label: 'Edit', onClick: (item: any) => this.editClick.emit(item.id) }
  ];
  // #endregion

  // #region Methods
  initial(name: string | null | undefined): string {
    return (name?.trim()[0] ?? '?').toUpperCase();
  }
  // #endregion
}
