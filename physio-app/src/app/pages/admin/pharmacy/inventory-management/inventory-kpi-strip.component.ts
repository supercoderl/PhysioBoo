import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooInlineErrorComponent } from '@physioboo/ui';
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { StatTone } from "../../../../shared/types/doctor-desk.types";
import { InventoryKpis } from "../../../../shared/types/inventory-management.types";

interface KpiCard {
    label: string;
    value: string;
    icon: string;
    tone: StatTone;
}

const MONEY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const COUNT = new Intl.NumberFormat('en-US');

/**
 * The server counts low stock, near expiry and expiry per batch, so those cards say "batches".
 * Purchase orders (always 0 server-side) and out-of-stock (counts empty batches too) are left out on purpose.
 */
@Component({
    selector: 'inventory-kpi-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent, BooInlineErrorComponent],
    template: `
    <boo-inline-error *ngIf="error" what="the inventory overview" [state]="retrying ? 'retrying' : 'default'" (retry)="retry.emit()"></boo-inline-error>

    <section *ngIf="!error" aria-label="Inventory overview" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      <boo-stat-card *ngFor="let card of cards" [label]="card.label" [value]="card.value" [icon]="card.icon" [tone]="card.tone"></boo-stat-card>
    </section>
  `,
})
export class InventoryKpiStripComponent {
    @Input() kpis: InventoryKpis | null = null;
    @Input() error = false;
    @Input() retrying = false;
    @Output() retry = new EventEmitter<void>();

    get cards(): KpiCard[] {
        const k = this.kpis;
        return [
            { label: 'Active medicines', value: k ? COUNT.format(k.totalMedicines) : '—', icon: 'pill', tone: 'primary' },
            { label: 'Stock value (at cost)', value: k ? MONEY.format(k.totalInventoryValue) : '—', icon: 'wallet', tone: 'neutral' },
            { label: 'Low-stock batches', value: k ? COUNT.format(k.lowStockCount) : '—', icon: 'triangle-alert', tone: k && k.lowStockCount > 0 ? 'warning' : 'neutral' },
            { label: 'Near-expiry batches', value: k ? COUNT.format(k.nearExpiryCount) : '—', icon: 'clock-alert', tone: k && k.nearExpiryCount > 0 ? 'warning' : 'neutral' },
            { label: 'Expired batches', value: k ? COUNT.format(k.expiredCount) : '—', icon: 'circle-alert', tone: k && k.expiredCount > 0 ? 'danger' : 'neutral' },
        ];
    }
}
