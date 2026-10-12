import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { TenantSubscription } from "../../../../shared/types/billing.types";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { billingStatusLabel, billingStatusTone, formatMoney } from "../../../../shared/utils/billing.utils";
import { BooActionAdminComponent } from "../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent, FilterConfig } from "../../../table/boo-table-admin/boo-table-admin.component";
import { StatusBadgeComponent } from "../../../ui/status-badge.component";

@Component({
  selector: 'superadmin-subscription-table-card',
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
        [filterConfigs]="filterConfigs"
        [currentFilter]="currentFilter"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
        (searchChange)="searchChange.emit($event)"
        (reload)="reloadClick.emit()"
        (filterApply)="filterApply.emit($event)"
      >
        <ng-template appColumnDef="tenant" headerLabel="Tenant" headerClass="text-left" let-item>
          <button
            type="button"
            class="min-w-0 max-w-full text-left rounded-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
            [attr.aria-label]="'Manage subscription of ' + item.tenantName"
            (click)="manageClick.emit(item.hospitalGroupId)"
          >
            <div class="font-medium text-primary truncate" [title]="item.tenantName">{{ item.tenantName }}</div>
            <div class="text-xs text-secondary truncate">{{ item.tenantEmail || '—' }}</div>
          </button>
        </ng-template>

        <ng-template appColumnDef="plan" headerLabel="Plan" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.planName ?? '—' }}</div>
          <div *ngIf="item.planName" class="text-xs text-secondary tabular-nums">{{ money(item.monthlyPrice, item.currency) }} / month</div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted />
        </ng-template>

        <ng-template appColumnDef="period" headerLabel="Period" headerClass="text-left" let-item>
          <ng-container *ngIf="periodEnd(item) as end; else noPeriod">
            <div class="text-sm tabular-nums">{{ end | date: 'mediumDate' }}</div>
            <div class="text-xs text-secondary">{{ item.status === 'Trial' ? 'Trial ends' : 'Period ends' }}</div>
          </ng-container>
          <ng-template #noPeriod><span class="text-sm text-secondary">—</span></ng-template>
        </ng-template>

        <ng-template appColumnDef="outstanding" headerLabel="Outstanding" headerClass="text-right" cellClass="text-right" let-item>
          <span
            *ngIf="item.outstandingAmount > 0; else settled"
            class="text-sm font-medium tabular-nums text-amber-700"
          >
            {{ money(item.outstandingAmount, item.currency) }}
          </span>
          <ng-template #settled><span class="text-sm text-secondary">—</span></ng-template>
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
export class SuperadminSubscriptionTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<TenantSubscription> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter?: Record<string, any> = {};
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();
  @Output() manageClick = new EventEmitter<string>();
  @Output() viewTenantClick = new EventEmitter<string>();

  readonly money = formatMoney;
  readonly statusTone = billingStatusTone;
  readonly statusLabel = billingStatusLabel;

  readonly tableActions: ActionItem[] = [
    { label: 'Manage subscription', onClick: (item: any) => this.manageClick.emit(item.hospitalGroupId) },
    { label: 'View tenant', onClick: (item: any) => this.viewTenantClick.emit(item.hospitalGroupId) }
  ];
  // #endregion

  // #region Methods
  periodEnd(item: TenantSubscription): string | null {
    return item.status === 'Trial' ? item.trialEndsAt : item.currentPeriodEnd;
  }
  // #endregion
}
