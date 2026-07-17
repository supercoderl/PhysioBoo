import { Component, Input, OnChanges } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { FinancialClinicalSnapshot } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-financial-clinical-strip',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-3" *ngIf="financial; else skeletonTpl">
        <!-- Revenue -->
        <div class="bg-surface border border-borderGray rounded-lg p-3.5 hover:shadow-card transition-shadow">
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Revenue Today</span>
                <boo-icon name="trending-up" [size]="13" color="#10b981"></boo-icon>
            </div>
            <div class="text-[23px] font-extrabold text-gray-900 tabular-nums mb-1.5">{{ formatCurrency(financial.revenue.today) }}</div>
            <div class="h-[3.5px] bg-gray-100 rounded-full overflow-hidden mb-1">
                <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="revenuePct"></div>
            </div>
            <div class="flex justify-between mb-2">
                <span class="text-[9.5px] text-gray-400">{{ revenuePct }}% of {{ formatCurrency(financial.revenue.target) }} target</span>
                <span class="text-[9.5px] font-semibold text-emerald-500">+{{ financial.revenue.changePct }}% vs yesterday</span>
            </div>
            <svg viewBox="0 0 80 28" class="w-full h-7 block" preserveAspectRatio="none">
                <path [attr.d]="revArea" fill="rgba(16,185,129,.12)"></path>
                <path [attr.d]="revLine" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </div>

        <!-- Insurance -->
        <div class="bg-surface border border-borderGray rounded-lg p-3.5 hover:shadow-card transition-shadow">
            <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Insurance Claims</span>
                <boo-icon name="shield-check" [size]="13" color="#0e82fd"></boo-icon>
            </div>
            <div class="flex items-center gap-2.5">
                <svg viewBox="0 0 60 60" class="w-[52px] h-[52px] shrink-0">
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#f1f5f9" stroke-width="7"></circle>
                    <circle cx="30" cy="30" r="22" fill="none" stroke="#0e82fd" stroke-width="7" [attr.stroke-dasharray]="insDash" stroke-linecap="round" transform="rotate(-90 30 30)"></circle>
                    <text x="30" y="33" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">{{ financial.insuranceClaims.approvedPct }}%</text>
                </svg>
                <div>
                    <div class="text-xl font-extrabold text-gray-900 tabular-nums mb-0.5">{{ financial.insuranceClaims.pending }}</div>
                    <div class="text-[10.5px] text-gray-500 mb-1">pending claims</div>
                    <span class="text-[9.5px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-[3px]">{{ financial.insuranceClaims.criticalCount }} critical</span>
                </div>
            </div>
            <p class="text-[10px] text-gray-400 mt-2 mb-0">Avg processing: {{ financial.insuranceClaims.avgProcessingDays }} days</p>
        </div>

        <!-- Pharmacy -->
        <div class="bg-surface border border-borderGray rounded-lg p-3.5 hover:shadow-card transition-shadow">
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Pharmacy</span>
                <boo-icon name="pill" [size]="13" color="#8b5cf6"></boo-icon>
            </div>
            <div class="text-[23px] font-extrabold text-gray-900 tabular-nums mb-0.5">{{ financial.pharmacy.dispensedToday | number }}</div>
            <div class="text-[10.5px] text-gray-500 mb-2">dispensed today</div>
            <div class="h-[3.5px] bg-gray-100 rounded-full overflow-hidden mb-1">
                <div class="h-full bg-violet-500 rounded-full" [style.width.%]="pharmacyPct"></div>
            </div>
            <div class="flex justify-between mb-2">
                <span class="text-[9.5px] text-gray-400">{{ pharmacyPct }}% of {{ financial.pharmacy.target | number }} target</span>
            </div>
            <div *ngIf="financial.pharmacy.lowStockCount > 0" class="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded">
                <boo-icon name="alert-triangle" [size]="11" color="#f59e0b"></boo-icon>
                <span class="text-[10.5px] text-amber-800">{{ financial.pharmacy.lowStockCount }} items low stock</span>
            </div>
        </div>

        <!-- Laboratory -->
        <div class="bg-surface border border-borderGray rounded-lg p-3.5 hover:shadow-card transition-shadow">
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Laboratory</span>
                <boo-icon name="flask-conical" [size]="13" color="#06b6d4"></boo-icon>
            </div>
            <div class="flex gap-3 mb-2">
                <div>
                    <div class="text-[23px] font-extrabold text-gray-900 tabular-nums">{{ financial.laboratory.ordersPending }}</div>
                    <p class="text-[9.5px] text-gray-400 m-0">orders pending</p>
                </div>
                <div class="w-px bg-gray-100"></div>
                <div>
                    <div class="text-[23px] font-extrabold text-gray-900">{{ financial.laboratory.avgTurnaroundHours }}h</div>
                    <p class="text-[9.5px] text-gray-400 m-0">avg turnaround</p>
                </div>
            </div>
            <div *ngIf="financial.laboratory.statOrdersPending > 0" class="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded">
                <span class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0"></span>
                <span class="text-[10.5px] text-red-800 font-semibold">{{ financial.laboratory.statOrdersPending }} STAT orders pending</span>
            </div>
        </div>

        <!-- Radiology -->
        <div class="bg-surface border border-borderGray rounded-lg p-3.5 hover:shadow-card transition-shadow">
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Radiology</span>
                <boo-icon name="scan-line" [size]="13" color="#f97316"></boo-icon>
            </div>
            <div class="flex gap-3 mb-2">
                <div>
                    <div class="text-[23px] font-extrabold text-gray-900 tabular-nums">{{ financial.radiology.studiesInQueue }}</div>
                    <p class="text-[9.5px] text-gray-400 m-0">studies in queue</p>
                </div>
                <div class="w-px bg-gray-100"></div>
                <div>
                    <div class="text-[23px] font-extrabold text-gray-900">{{ financial.radiology.avgReadMinutes }}m</div>
                    <p class="text-[9.5px] text-gray-400 m-0">avg read time</p>
                </div>
            </div>
            <div *ngIf="financial.radiology.urgentReadsPending > 0" class="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded">
                <boo-icon name="zap" [size]="11" color="#f97316"></boo-icon>
                <span class="text-[10.5px] text-orange-800">{{ financial.radiology.urgentReadsPending }} urgent reads pending</span>
            </div>
        </div>
    </div>
    <ng-template #skeletonTpl>
        <div class="grid xl:grid-cols-5 md:grid-cols-3 grid-cols-2 gap-3">
            <div *ngFor="let i of [1,2,3,4,5]" class="h-[150px] bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
    </ng-template>
  `
})
export class AdminFinancialClinicalStripComponent implements OnChanges {
    @Input() financial: FinancialClinicalSnapshot | null = null;

    revLine = '';
    revArea = '';
    insDash = '';

    get revenuePct(): number {
        if (!this.financial) return 0;
        return Math.round((this.financial.revenue.today / this.financial.revenue.target) * 100);
    }

    get pharmacyPct(): number {
        if (!this.financial) return 0;
        return Math.round((this.financial.pharmacy.dispensedToday / this.financial.pharmacy.target) * 100);
    }

    ngOnChanges() {
        if (!this.financial) return;
        this.revLine = this.path(this.financial.revenue.trend, 80, 26);
        this.revArea = this.area(this.financial.revenue.trend, 80, 26);
        const circumference = 2 * Math.PI * 22;
        this.insDash = `${(this.financial.insuranceClaims.approvedPct / 100 * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value);
    }

    private path(data: number[], w: number, h: number): string {
        const mx = Math.max(...data) * 1.1;
        const pts = data.map((v, i) => [
            +((i / (data.length - 1)) * w).toFixed(2),
            +(h - (v / mx) * h * 0.88).toFixed(2),
        ]);
        let d = `M${pts[0]}`;
        for (let i = 1; i < pts.length; i++) {
            const dx = (pts[i][0] - pts[i - 1][0]) * 0.42;
            d += ` C${(pts[i - 1][0] + dx).toFixed(2)},${pts[i - 1][1]} ${(pts[i][0] - dx).toFixed(2)},${pts[i][1]} ${pts[i]}`;
        }
        return d;
    }

    private area(data: number[], w: number, h: number): string {
        return this.path(data, w, h) + ` L${w},${h} L0,${h} Z`;
    }
}
