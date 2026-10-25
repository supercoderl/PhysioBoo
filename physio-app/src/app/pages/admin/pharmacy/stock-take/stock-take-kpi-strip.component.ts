import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooInlineErrorComponent } from '@physioboo/ui';
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { StatTone } from "../../../../shared/types/doctor-desk.types";
import { formatStockTakeValue, StockTakeKpis } from "../../../../shared/types/stock-take.types";

interface KpiCard {
    label: string;
    value: string;
    icon: string;
    tone: StatTone;
}

const COUNT = new Intl.NumberFormat('en-US');

/**
 * The API counts open (Draft + Counting) and pending sessions overall, and the other figures over sessions approved
 * this month; the variance is valued at batch purchase cost.
 */
@Component({
    selector: 'stock-take-kpi-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent, BooInlineErrorComponent],
    template: `
    <boo-inline-error *ngIf="error" what="the stock take overview" [state]="retrying ? 'retrying' : 'default'" (retry)="retry.emit()"></boo-inline-error>

    <section *ngIf="!error" aria-label="Stock take overview" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      <boo-stat-card *ngFor="let card of cards" [label]="card.label" [value]="card.value" [icon]="card.icon" [tone]="card.tone"></boo-stat-card>
    </section>
  `,
})
export class StockTakeKpiStripComponent {
    @Input() kpis: StockTakeKpis | null = null;
    @Input() error = false;
    @Input() retrying = false;
    @Output() retry = new EventEmitter<void>();

    get cards(): KpiCard[] {
        const k = this.kpis;
        return [
            { label: 'Open sessions', value: k ? COUNT.format(k.activeSessions) : '—', icon: 'clipboard-list', tone: 'primary' },
            { label: 'Awaiting approval', value: k ? COUNT.format(k.pendingApproval) : '—', icon: 'clock-alert', tone: k && k.pendingApproval > 0 ? 'warning' : 'neutral' },
            { label: 'Approved this month', value: k ? COUNT.format(k.completedThisMonth) : '—', icon: 'circle-check', tone: 'success' },
            { label: 'With discrepancies', value: k ? COUNT.format(k.discrepancySessions) : '—', icon: 'triangle-alert', tone: k && k.discrepancySessions > 0 ? 'danger' : 'neutral' },
            { label: 'Variance at cost', value: k ? formatStockTakeValue(k.totalDifferenceValue) : '—', icon: 'scale', tone: k && k.totalDifferenceValue < 0 ? 'danger' : 'neutral' },
        ];
    }
}
