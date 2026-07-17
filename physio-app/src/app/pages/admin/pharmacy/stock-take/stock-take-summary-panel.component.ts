import { Component, Input, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTakeSummary } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-summary-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="fixed bottom-5 right-5 z-[500] w-72 bg-surface border border-borderGray/60 rounded-2 shadow-2xl overflow-hidden">
      <button type="button" (click)="collapsed.set(!collapsed())"
        class="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <span class="text-sm font-semibold flex items-center gap-2">
          <boo-icon name="clipboard-list" [size]="15"></boo-icon> Count Summary
        </span>
        <boo-icon [name]="collapsed() ? 'chevron-up' : 'chevron-down'" [size]="15"></boo-icon>
      </button>

      <div *ngIf="!collapsed()" class="p-4 space-y-3">
        <div>
          <div class="flex items-center justify-between text-xs text-secondary mb-1">
            <span>Completion</span>
            <span class="font-semibold text-regular">{{ summary?.completionPercent ?? 0 }}%</span>
          </div>
          <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div class="h-full rounded-full bg-primary transition-all" [style.width.%]="summary?.completionPercent ?? 0"></div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-gray-50 rounded-1.5 py-2">
            <p class="text-[10px] text-secondary">Total</p>
            <p class="text-sm font-bold text-regular">{{ summary?.totalItems ?? 0 }}</p>
          </div>
          <div class="bg-emerald-50 rounded-1.5 py-2">
            <p class="text-[10px] text-emerald-700">Counted</p>
            <p class="text-sm font-bold text-emerald-700">{{ summary?.countedItems ?? 0 }}</p>
          </div>
          <div class="bg-amber-50 rounded-1.5 py-2">
            <p class="text-[10px] text-amber-700">Remaining</p>
            <p class="text-sm font-bold text-amber-700">{{ summary?.remainingItems ?? 0 }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 text-center">
          <div class="bg-emerald-50 rounded-1.5 py-2">
            <p class="text-[10px] text-emerald-700">+ Difference</p>
            <p class="text-sm font-bold text-emerald-700">{{ summary?.positiveDifferenceCount ?? 0 }}</p>
          </div>
          <div class="bg-rose-50 rounded-1.5 py-2">
            <p class="text-[10px] text-rose-700">- Difference</p>
            <p class="text-sm font-bold text-rose-700">{{ summary?.negativeDifferenceCount ?? 0 }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between px-3 py-2.5 rounded-1.5 bg-gray-50">
          <span class="text-xs font-medium text-secondary">Value Difference</span>
          <span class="text-sm font-bold" [ngClass]="(summary?.valueDifference ?? 0) < 0 ? 'text-rose-600' : 'text-emerald-600'">
            {{ (summary?.valueDifference ?? 0) > 0 ? '+' : '' }}{{ '$' + (summary?.valueDifference ?? 0).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeSummaryPanelComponent {
    @Input() summary: StockTakeSummary | null = null;
    collapsed = signal(false);
}
