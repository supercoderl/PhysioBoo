import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooBadgeTone, BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PaginationData } from "../../../../../shared/types/common";
import { RevenueTransaction, RevenueTransactionStatus } from "../../../../../shared/types/revenue.types";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
    selector: 'revenue-transactions-table-card',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooStatusBadgeComponent],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 h-full overflow-hidden">
      <boo-table-admin
        minTableWidth="960px"
        title="Bills" subtitle="Dated in the period · totals are bill amounts, not collections"
        [data]="data?.items ?? []"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? filter.pageNumber"
        [pageSize]="data?.pageSize ?? filter.pageSize"
        [totalItems]="data?.totalCount ?? 0"
        (pageChange)="pageChange.emit($event)"
        [loading]="loading"
      >
        <ng-template appColumnDef="billNo" headerLabel="Bill No." headerClass="text-left" let-item>
          <button type="button" class="text-sm font-semibold text-primary hover:underline" (click)="rowClick.emit(item.id)">
            {{ item.billNo }}
          </button>
        </ng-template>

        <ng-template appColumnDef="datetime" headerLabel="Date & Time" headerClass="text-left" let-item>
          <span class="text-sm text-secondary">{{ item.datetime | date:'MMM d, y, h:mm a' }}</span>
        </ng-template>

        <ng-template appColumnDef="patientName" headerLabel="Patient" headerClass="text-left" let-item>
          <span class="text-sm text-regular">{{ item.patientName }}</span>
        </ng-template>

        <ng-template appColumnDef="department" headerLabel="Department" headerClass="text-left" let-item>
          <span class="text-sm text-secondary">{{ item.department }}</span>
        </ng-template>

        <ng-template appColumnDef="paymentMethod" headerLabel="Payment" headerClass="text-left" let-item>
          <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-secondary">{{ item.paymentMethod }}</span>
        </ng-template>

        <ng-template appColumnDef="amount" headerLabel="Bill total" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold text-regular tabular-nums">{{ item.amount | currency }}</span>
        </ng-template>

        <ng-template appColumnDef="discount" headerLabel="Discount" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm tabular-nums" [ngClass]="item.discount > 0 ? 'text-amber-700' : 'text-gray-400'">{{ item.discount > 0 ? (item.discount | currency) : '—' }}</span>
        </ng-template>

        <ng-template appColumnDef="refund" headerLabel="Refunded" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm tabular-nums" [ngClass]="item.refund > 0 ? 'text-rose-600' : 'text-gray-400'">{{ item.refund > 0 ? (item.refund | currency) : '—' }}</span>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-center" cellClass="text-center" let-item>
          <boo-status-badge [label]="item.status" [tone]="statusTone(item.status)" [dotted]="true"></boo-status-badge>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class RevenueTransactionsTableCardComponent {
    @Input() data: PaginationData<RevenueTransaction> | null = null;
    @Input() filter!: { pageNumber: number; pageSize: number };
    @Input() loading = false;
    @Output() pageChange = new EventEmitter<number>();
    @Output() rowClick = new EventEmitter<string>();

    statusTone(status: RevenueTransactionStatus): BooBadgeTone {
        switch (status) {
            case 'Paid': return 'success';
            case 'Partial':
            case 'Pending': return 'warning';
            default: return 'danger';
        }
    }
}
