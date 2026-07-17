import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { DiscountRecord, RefundRecord } from "../../../../../shared/types/revenue.types";

@Component({
    selector: 'revenue-refund-discount-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 p-4 h-full">
      <div class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-3">
        <button type="button" (click)="activeTab = 'refunds'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          [ngClass]="activeTab === 'refunds' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">
          Refunds
        </button>
        <button type="button" (click)="activeTab = 'discounts'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          [ngClass]="activeTab === 'discounts' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">
          Discounts
        </button>
      </div>

      <div *ngIf="loading" class="space-y-2.5">
        <div *ngFor="let i of [1,2,3]" class="h-12 animate-pulse bg-gray-100 rounded-1.5"></div>
      </div>

      <ng-container *ngIf="!loading && activeTab === 'refunds'">
        <div *ngIf="(refunds?.length ?? 0) === 0" class="h-[140px] flex flex-col items-center justify-center text-center gap-2">
          <boo-icon name="undo-2" [size]="24" iconClass="text-gray-300"></boo-icon>
          <p class="text-sm text-secondary">No refunds in this range.</p>
        </div>
        <div *ngIf="(refunds?.length ?? 0) > 0" class="divide-y divide-gray-100">
          <div *ngFor="let r of refunds" class="flex items-center justify-between py-2 text-sm">
            <div class="min-w-0">
              <p class="font-medium text-regular truncate">{{ r.patientName }}</p>
              <p class="text-xs text-secondary truncate">{{ r.billNo }} · {{ r.reason }}</p>
            </div>
            <p class="font-semibold text-rose-600 shrink-0 ml-3">-{{ r.amount | currency }}</p>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="!loading && activeTab === 'discounts'">
        <div *ngIf="(discounts?.length ?? 0) === 0" class="h-[140px] flex flex-col items-center justify-center text-center gap-2">
          <boo-icon name="badge-percent" [size]="24" iconClass="text-gray-300"></boo-icon>
          <p class="text-sm text-secondary">No discounts in this range.</p>
        </div>
        <div *ngIf="(discounts?.length ?? 0) > 0" class="divide-y divide-gray-100">
          <div *ngFor="let d of discounts" class="flex items-center justify-between py-2 text-sm">
            <div class="min-w-0">
              <p class="font-medium text-regular truncate">{{ d.patientName }}</p>
              <p class="text-xs text-secondary truncate">{{ d.billNo }} · {{ d.discountType }}</p>
            </div>
            <p class="font-semibold text-amber-600 shrink-0 ml-3">-{{ d.amount | currency }}</p>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class RevenueRefundDiscountCardComponent {
    @Input() refunds: RefundRecord[] | null = null;
    @Input() discounts: DiscountRecord[] | null = null;
    @Input() loading = false;

    activeTab: 'refunds' | 'discounts' = 'refunds';
}
