import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { InsuranceProviderRevenue } from "../../../../../shared/types/revenue.types";

@Component({
    selector: 'revenue-insurance-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 p-4 h-full">
      <h2 class="text-sm font-semibold text-regular mb-3">Insurance Revenue</h2>

      <div *ngIf="loading" class="space-y-3">
        <div *ngFor="let i of [1,2,3]" class="h-14 animate-pulse bg-gray-100 rounded-1.5"></div>
      </div>

      <div *ngIf="!loading && (data?.length ?? 0) === 0" class="h-[180px] flex flex-col items-center justify-center text-center gap-2">
        <boo-icon name="shield-check" [size]="28" iconClass="text-gray-300"></boo-icon>
        <p class="text-sm text-secondary">No insurance claims for the selected range.</p>
      </div>

      <div *ngIf="!loading && (data?.length ?? 0) > 0" class="space-y-3">
        <div *ngFor="let provider of data" class="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-medium text-regular">{{ provider.providerName }}</span>
            <span class="text-xs text-secondary">{{ provider.claimCount }} claims</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden flex">
              <div class="bg-emerald-500 h-full" [style.width.%]="provider.approvalRatePct"></div>
              <div class="bg-amber-400 h-full" [style.width.%]="pendingSharePct(provider)"></div>
              <div class="bg-rose-400 h-full" [style.width.%]="rejectedSharePct(provider)"></div>
            </div>
            <span class="text-xs font-semibold text-regular w-12 text-right">{{ provider.approvalRatePct.toFixed(0) }}%</span>
          </div>
          <div class="flex items-center gap-3 mt-1 text-xs text-secondary">
            <span>Claimed {{ provider.claimedAmount | currency }}</span>
            <span>Approved {{ provider.approvedAmount | currency }}</span>
            <span>Pending {{ provider.pendingAmount | currency }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RevenueInsuranceCardComponent {
    @Input() data: InsuranceProviderRevenue[] | null = null;
    @Input() loading = false;

    pendingSharePct(p: InsuranceProviderRevenue): number {
        return p.claimedAmount ? (p.pendingAmount / p.claimedAmount) * 100 : 0;
    }

    rejectedSharePct(p: InsuranceProviderRevenue): number {
        return p.claimedAmount ? (p.rejectedAmount / p.claimedAmount) * 100 : 0;
    }
}
