import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierTransactionEvent, CashierTransactionEventType } from "../../../../shared/types/cashier.types";

const TYPE_META: Record<CashierTransactionEventType, { icon: string; class: string; label: string }> = {
    Payment: { icon: 'arrow-down-circle', class: 'bg-emerald-100 text-emerald-600', label: 'Payment received' },
    Refund: { icon: 'arrow-up-circle', class: 'bg-rose-100 text-rose-600', label: 'Refund issued' },
    Void: { icon: 'ban', class: 'bg-slate-200 text-slate-600', label: 'Invoice voided' },
    Reprint: { icon: 'printer', class: 'bg-sky-100 text-sky-600', label: 'Receipt reprinted' },
};

@Component({
    selector: 'cashier-transactions-timeline',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <boo-icon name="activity" [size]="14" iconClass="text-amber-600"></boo-icon>
          Recent Activity
        </h3>
        <boo-icon name="loader-circle" [size]="14" iconClass="text-slate-300" [class.animate-spin]="loading"></boo-icon>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        <div *ngIf="!loading && !events.length" class="text-center py-10">
          <p class="text-xs text-slate-400">No recent activity yet</p>
        </div>

        <ol class="relative">
          <li *ngFor="let e of events; let last = last" class="relative pl-8" [class.pb-4]="!last">
            <span *ngIf="!last" class="absolute left-[13px] top-6 bottom-0 w-px bg-slate-100"></span>
            <span class="absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center" [ngClass]="meta(e.type).class">
              <boo-icon [name]="meta(e.type).icon" [size]="13"></boo-icon>
            </span>
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-xs font-semibold text-slate-700">{{ meta(e.type).label }}</p>
                <p class="text-xs text-slate-500 truncate">{{ e.patientName }} · {{ e.invoiceNo }}</p>
                <p class="text-[11px] text-slate-400">{{ e.timestamp | date:'short' }}<span *ngIf="e.method"> · {{ e.method }}</span></p>
              </div>
              <span class="text-sm font-semibold shrink-0" [ngClass]="e.type === 'Refund' ? 'text-rose-600' : 'text-slate-800'">
                {{ e.type === 'Refund' ? '-' : '' }}\${{ e.amount.toFixed(2) }}
              </span>
            </div>
          </li>
        </ol>
      </div>
    </div>
  `,
})
export class CashierTransactionsTimelineComponent {
    @Input() events: CashierTransactionEvent[] = [];
    @Input() loading = false;

    meta(type: CashierTransactionEventType) {
        return TYPE_META[type];
    }
}
