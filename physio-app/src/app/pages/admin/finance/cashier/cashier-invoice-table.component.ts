import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooActionAdminComponent } from "../../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { CashierInvoice, CashierInvoiceStatus } from "../../../../shared/types/cashier.types";

const STATUS_LABEL: Record<CashierInvoiceStatus, string> = {
    Pending: 'Pending',
    PartiallyPaid: 'Partially Paid',
    Paid: 'Paid',
    Cancelled: 'Cancelled',
    Refunded: 'Refunded',
    InsurancePending: 'Insurance Pending',
};

const STATUS_CLASS: Record<CashierInvoiceStatus, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    PartiallyPaid: 'bg-sky-100 text-sky-700',
    Paid: 'bg-emerald-100 text-emerald-700',
    Cancelled: 'bg-slate-200 text-slate-600',
    Refunded: 'bg-rose-100 text-rose-700',
    InsurancePending: 'bg-purple-100 text-purple-700',
};

@Component({
    selector: 'cashier-invoice-table',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooActionAdminComponent],
    template: `
    <div class="bg-surface rounded-2xl border border-slate-200 shadow-sm h-full overflow-hidden">
      <boo-table-admin
        [data]="data?.items ?? []"
        tdClass="px-3 py-3"
        [showFooter]="true"
        [availableTools]="[]"
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 10"
        [totalItems]="data?.totalCount ?? 0"
        (pageChange)="pageChange.emit($event)"
        [loading]="loading"
      >
        <ng-template appColumnDef="invoiceNo" headerLabel="Invoice" headerClass="text-left" let-item>
          <div class="cursor-pointer" (click)="rowSelect.emit(item)">
            <div class="text-sm font-semibold" [ngClass]="selectedId === item.id ? 'text-amber-700' : 'text-slate-800'">{{ item.invoiceNo }}</div>
            <div class="text-xs text-slate-400">{{ item.invoiceDate | date:'mediumDate' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="patient" headerLabel="Patient" headerClass="text-left" let-item>
          <div class="flex items-center gap-2 cursor-pointer" (click)="rowSelect.emit(item)">
            <div class="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <span class="text-[11px] font-bold text-amber-700">{{ item.patientName?.charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <div class="text-sm font-medium text-slate-800 truncate">{{ item.patientName }}</div>
              <div class="text-xs text-slate-400 truncate">{{ item.patientMrn }}</div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="visitType" headerLabel="Visit" headerClass="text-left" let-item>
          <span class="text-xs font-medium text-slate-600">{{ item.visitType }}</span>
        </ng-template>

        <ng-template appColumnDef="department" headerLabel="Department" headerClass="text-left" let-item>
          <span class="text-xs text-slate-600">{{ item.department }}</span>
          <div class="text-[11px] text-slate-400">{{ item.doctorName }}</div>
        </ng-template>

        <ng-template appColumnDef="totalAmount" headerLabel="Total" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold text-slate-800">\${{ item.totalAmount.toFixed(2) }}</span>
        </ng-template>

        <ng-template appColumnDef="paidAmount" headerLabel="Paid" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm text-emerald-600 font-medium">\${{ item.paidAmount.toFixed(2) }}</span>
        </ng-template>

        <ng-template appColumnDef="remainingBalance" headerLabel="Remaining" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold" [ngClass]="item.remainingBalance > 0 ? 'text-rose-600' : 'text-slate-400'">\${{ item.remainingBalance.toFixed(2) }}</span>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-center" cellClass="text-center" let-item>
          <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold" [ngClass]="statusClass(item.status)">
            {{ statusLabel(item.status) }}
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" headerClass="text-center" cellClass="text-center" let-item>
          <boo-action-admin [items]="actionsFor(item)" [data]="item" />
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class CashierInvoiceTableComponent {
    @Input() data: PaginationData<CashierInvoice> | null = null;
    @Input() loading = false;
    @Input() selectedId: string | null = null;

    @Output() pageChange = new EventEmitter<number>();
    @Output() rowSelect = new EventEmitter<CashierInvoice>();
    @Output() receivePayment = new EventEmitter<CashierInvoice>();
    @Output() refund = new EventEmitter<CashierInvoice>();
    @Output() voidInvoice = new EventEmitter<CashierInvoice>();
    @Output() printInvoice = new EventEmitter<CashierInvoice>();

    statusLabel(status: CashierInvoiceStatus): string {
        return STATUS_LABEL[status];
    }

    statusClass(status: CashierInvoiceStatus): string {
        return STATUS_CLASS[status];
    }

    actionsFor(item: CashierInvoice): ActionItem[] {
        const actions: ActionItem[] = [
            { label: 'View / Collect Payment', icon: 'wallet', onClick: () => this.rowSelect.emit(item) },
            { label: 'Print Invoice', icon: 'printer', onClick: () => this.printInvoice.emit(item) },
        ];
        if (item.status !== 'Paid' && item.status !== 'Cancelled' && item.status !== 'Refunded') {
            actions.push({ label: 'Receive Payment', icon: 'banknote', onClick: () => this.receivePayment.emit(item) });
        }
        if (item.paidAmount > 0 && item.status !== 'Refunded') {
            actions.push({ label: 'Refund', icon: 'undo-2', onClick: () => this.refund.emit(item) });
        }
        if (item.status !== 'Cancelled' && item.status !== 'Refunded') {
            actions.push({ label: 'Void Invoice', icon: 'ban', isDanger: true, onClick: () => this.voidInvoice.emit(item) });
        }
        return actions;
    }
}
