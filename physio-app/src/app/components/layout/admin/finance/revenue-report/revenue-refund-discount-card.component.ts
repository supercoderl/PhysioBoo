import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { DiscountRecord, RefundRecord } from "../../../../../shared/types/revenue.types";

/** Latest refunds (by refund date) and discounted bills (by bill date) of the period, with how many exist in total. */
@Component({
    selector: 'revenue-refund-discount-card',
    standalone: true,
    imports: [SharedModule],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 p-4 h-full" [attr.aria-busy]="loading">
      <h3 class="text-sm font-semibold text-regular mb-0.5">Refunds and discounts</h3>
      <p class="text-xs text-secondary mb-3">Money returned and price reductions in the period</p>

      <div role="tablist" aria-label="Adjustment type" class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-3">
        <button type="button" role="tab" id="adj-tab-refunds" aria-controls="adj-panel" [attr.aria-selected]="activeTab === 'refunds'"
          (click)="activeTab = 'refunds'"
          class="px-3 min-h-10 lg:min-h-8 rounded-lg text-xs font-semibold transition-colors"
          [ngClass]="activeTab === 'refunds' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">
          Refunds <span class="font-normal tabular-nums">({{ refundTotal }})</span>
        </button>
        <button type="button" role="tab" id="adj-tab-discounts" aria-controls="adj-panel" [attr.aria-selected]="activeTab === 'discounts'"
          (click)="activeTab = 'discounts'"
          class="px-3 min-h-10 lg:min-h-8 rounded-lg text-xs font-semibold transition-colors"
          [ngClass]="activeTab === 'discounts' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">
          Discounts <span class="font-normal tabular-nums">({{ discountTotal }})</span>
        </button>
      </div>

      <div id="adj-panel" role="tabpanel" [attr.aria-labelledby]="'adj-tab-' + activeTab">
        <div *ngIf="loading" class="space-y-2.5">
          <div *ngFor="let i of [1,2,3]" class="h-12 animate-pulse bg-gray-100 rounded-1.5"></div>
        </div>

        <ng-container *ngIf="!loading && activeTab === 'refunds'">
          <div *ngIf="(refunds?.length ?? 0) === 0" class="h-[160px] flex flex-col items-center justify-center text-center gap-2">
            <physio-icon name="undo-2" [size]="24" class="text-gray-300"></physio-icon>
            <p class="text-sm text-secondary mb-0">No refunds were issued in this period.</p>
          </div>
          <ul *ngIf="(refunds?.length ?? 0) > 0" class="divide-y divide-gray-100 list-none p-0 mb-0">
            <li *ngFor="let r of refunds" class="flex items-center justify-between gap-3 py-2 text-sm">
              <div class="min-w-0">
                <p class="font-medium text-regular truncate mb-0">{{ r.patientName }}</p>
                <p class="text-xs text-secondary truncate mb-0">{{ r.billNo }} · {{ r.reason }}</p>
              </div>
              <p class="font-semibold text-rose-600 shrink-0 mb-0 tabular-nums">−{{ r.amount | currency }}</p>
            </li>
          </ul>
          <p *ngIf="refundTotal > (refunds?.length ?? 0)" class="text-xs text-secondary mt-2 mb-0">Showing the latest {{ refunds?.length }} of {{ refundTotal }} refunds.</p>
        </ng-container>

        <ng-container *ngIf="!loading && activeTab === 'discounts'">
          <div *ngIf="(discounts?.length ?? 0) === 0" class="h-[160px] flex flex-col items-center justify-center text-center gap-2">
            <physio-icon name="badge-percent" [size]="24" class="text-gray-300"></physio-icon>
            <p class="text-sm text-secondary mb-0">No discounted bills in this period.</p>
          </div>
          <ul *ngIf="(discounts?.length ?? 0) > 0" class="divide-y divide-gray-100 list-none p-0 mb-0">
            <li *ngFor="let d of discounts" class="flex items-center justify-between gap-3 py-2 text-sm">
              <div class="min-w-0">
                <p class="font-medium text-regular truncate mb-0">{{ d.patientName }}</p>
                <p class="text-xs text-secondary truncate mb-0">{{ d.billNo }} · {{ d.discountType }}</p>
              </div>
              <p class="font-semibold text-amber-700 shrink-0 mb-0 tabular-nums">−{{ d.amount | currency }}</p>
            </li>
          </ul>
          <p *ngIf="discountTotal > (discounts?.length ?? 0)" class="text-xs text-secondary mt-2 mb-0">Showing the latest {{ discounts?.length }} of {{ discountTotal }} discounted bills.</p>
        </ng-container>
      </div>
    </div>
  `,
})
export class RevenueRefundDiscountCardComponent {
    @Input() refunds: RefundRecord[] | null = null;
    @Input() discounts: DiscountRecord[] | null = null;
    /** Totals matching the filter, from the paged searches (the lists above hold only the first page). */
    @Input() refundTotal = 0;
    @Input() discountTotal = 0;
    @Input() loading = false;

    activeTab: 'refunds' | 'discounts' = 'refunds';
}
