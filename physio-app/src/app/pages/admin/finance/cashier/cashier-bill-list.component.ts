import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooStatusBadgeComponent } from '@physioboo/ui';
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierInvoice, cashierStatusLabel, cashierStatusTone } from "../../../../shared/types/cashier.types";
import { PaginationData } from "../../../../shared/types/common";

/** The queue: four columns, one row per bill. Everything else about a bill lives in the bill panel. */
@Component({
    selector: 'cashier-bill-list',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooStatusBadgeComponent],
    host: { class: 'block h-full min-h-0 min-w-0' },
    template: `
    <div class="h-full min-h-0 bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <boo-table-admin
        minTableWidth="560px"
        [data]="data?.items ?? []"
        [showToolbar]="false"
        [fillEmpty]="false"
        tdClass="px-4"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 12"
        [totalItems]="data?.totalCount ?? 0"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
      >
        <ng-template appColumnDef="bill" headerLabel="Bill" headerClass="text-left" width="34%" let-item>
          <div class="min-w-0 leading-tight">
            <button type="button" (click)="select.emit(item)" [attr.aria-current]="item.id === selectedId ? 'true' : null"
              class="block max-w-full truncate text-left text-sm font-semibold hover:underline"
              [ngClass]="item.id === selectedId ? 'text-primary underline' : 'text-regular'">{{ item.billNumber }}</button>
            <div class="truncate text-[11px] text-secondary">{{ item.billDate | date:'mediumDate' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="patient" headerLabel="Patient" headerClass="text-left" let-item>
          <div class="min-w-0 leading-tight">
            <div class="truncate text-sm text-regular">{{ item.patientName || '—' }}</div>
            <div class="truncate text-[11px] text-secondary">{{ item.patientMrn || 'No MRN' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="due" headerLabel="Outstanding" headerClass="text-right" cellClass="text-right" let-item>
          <div class="leading-tight">
            <div class="text-sm font-semibold tabular-nums" [ngClass]="item.remainingBalance > 0 ? 'text-rose-700' : 'text-secondary'">{{ item.remainingBalance | currency:'USD':'symbol':'1.2-2' }}</div>
            <div class="text-[11px] text-secondary tabular-nums">of {{ item.totalAmount | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted></boo-status-badge>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class CashierBillListComponent {
    @Input() data: PaginationData<CashierInvoice> | null = null;
    @Input() loading = false;
    @Input() selectedId: string | null = null;

    @Output() pageChange = new EventEmitter<number>();
    @Output() select = new EventEmitter<CashierInvoice>();

    statusLabel = cashierStatusLabel;
    statusTone = cashierStatusTone;
}
