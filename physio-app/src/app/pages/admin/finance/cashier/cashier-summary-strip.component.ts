import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooInlineErrorComponent } from '@physioboo/ui';
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierDashboardStats } from "../../../../shared/types/cashier.types";
import { StatTone } from "../../../../shared/types/doctor-desk.types";

interface SummaryCard {
    label: string;
    value: string;
    icon: string;
    tone: StatTone;
}

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const COUNT = new Intl.NumberFormat('en-US');

/**
 * Only figures that decide what the cashier does next: what was collected today, what is still owed,
 * what went back out and how many payments that was. Method splits and the (always 0) average payment time are left out.
 */
@Component({
    selector: 'cashier-summary-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent, BooInlineErrorComponent],
    template: `
    <boo-inline-error *ngIf="error" what="the cashier summary" [state]="retrying ? 'retrying' : 'default'" (retry)="retry.emit()"></boo-inline-error>

    <section *ngIf="!error" aria-label="Today's cashier summary" class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <boo-stat-card *ngFor="let card of cards" [label]="card.label" [value]="card.value" [icon]="card.icon" [tone]="card.tone"></boo-stat-card>
    </section>
  `,
})
export class CashierSummaryStripComponent {
    @Input() stats: CashierDashboardStats | null = null;
    @Input() error = false;
    @Input() retrying = false;
    @Output() retry = new EventEmitter<void>();

    get cards(): SummaryCard[] {
        const s = this.stats;
        return [
            { label: 'Collected today (net of refunds)', value: s ? MONEY.format(s.todayRevenue) : '—', icon: 'wallet', tone: 'success' },
            { label: 'Outstanding on open bills', value: s ? MONEY.format(s.outstandingBills) : '—', icon: 'receipt', tone: s && s.outstandingBills > 0 ? 'warning' : 'neutral' },
            { label: 'Refunded today', value: s ? MONEY.format(s.refundAmount) : '—', icon: 'undo-2', tone: s && s.refundAmount > 0 ? 'danger' : 'neutral' },
            { label: 'Payments today', value: s ? COUNT.format(s.completedTransactions) : '—', icon: 'banknote', tone: 'primary' },
        ];
    }
}
