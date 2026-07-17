import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTakeKpis } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-hero-header',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="relative rounded-2 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-neutral-800 px-6 pt-6 pb-12 text-white">
      <div class="absolute inset-0 opacity-[0.06] pointer-events-none" style="background-image: radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px); background-size: 22px 22px;"></div>

      <div class="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-300 text-[11px] font-semibold mb-3">
            <boo-icon name="clipboard-check" [size]="12"></boo-icon> Pharmacy · Inventory Counting
          </div>
          <h1 class="text-2xl font-bold leading-tight">Stock Take</h1>
          <p class="text-sm text-slate-300 mt-1 max-w-md">Plan, assign, and reconcile physical inventory counts against system stock.</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button type="button" (click)="print.emit()" title="Print"
            class="w-10 h-10 rounded-1.5 bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors" aria-label="Print">
            <boo-icon name="printer" [size]="16" iconClass="text-white"></boo-icon>
          </button>
          <button type="button" (click)="exportExcel.emit()" title="Export Excel"
            class="w-10 h-10 rounded-1.5 bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors" aria-label="Export Excel">
            <boo-icon name="file-spreadsheet" [size]="16" iconClass="text-white"></boo-icon>
          </button>
          <button type="button" (click)="create.emit()"
            class="h-10 px-4 rounded-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-sm font-semibold flex items-center gap-1.5 transition-colors">
            <boo-icon name="plus" [size]="16"></boo-icon> Create Stock Take
          </button>
        </div>
      </div>
    </div>

    <!-- floating stat chips -->
    <div class="relative -mt-8 px-2 grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
      <div *ngFor="let s of stats" class="bg-surface/95 backdrop-blur border border-borderGray/60 rounded-1.5 shadow-card px-4 py-3 flex items-center gap-3">
        <div class="w-9 h-9 rounded-1.5 flex items-center justify-center shrink-0" [ngClass]="s.bg">
          <boo-icon [name]="s.icon" [size]="16" [iconClass]="s.iconColor"></boo-icon>
        </div>
        <div class="min-w-0">
          <p class="text-[11px] text-secondary font-medium truncate">{{ s.label }}</p>
          <p class="text-lg font-bold text-regular leading-none mt-0.5">{{ s.value }}</p>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeHeroHeaderComponent {
    @Input() kpis: StockTakeKpis | null = null;

    @Output() create = new EventEmitter<void>();
    @Output() exportExcel = new EventEmitter<void>();
    @Output() print = new EventEmitter<void>();

    get stats() {
        const k = this.kpis;
        return [
            { label: 'Active Sessions', value: k?.activeSessions ?? '—', icon: 'activity', bg: 'bg-primary/10', iconColor: 'text-primary' },
            { label: 'Pending Approval', value: k?.pendingApproval ?? '—', icon: 'clock-alert', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
            { label: 'Completed This Month', value: k?.completedThisMonth ?? '—', icon: 'circle-check-big', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
            { label: 'Total Variance Value', value: k ? (k.totalDifferenceValue >= 0 ? '+' : '') + '$' + k.totalDifferenceValue.toFixed(2) : '—', icon: 'scale', bg: 'bg-rose-50', iconColor: 'text-rose-600' },
        ];
    }
}
