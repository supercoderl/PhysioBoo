import { NgClass, NgIf, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BooIconComponent } from "@physioboo/ui";
import { DashboardTrend } from "../dashboard.utils";

export interface DashboardKpi {
    key: string;
    label: string;
    icon: string;
    value: string;
    /** Supporting line under the value (units, breakdown or benchmark). */
    detail: string;
    trend?: DashboardTrend | null;
    /** `attention` marks a figure that needs action (e.g. open critical alerts). */
    tone?: 'default' | 'attention';
    link?: string | null;
}

@Component({
    selector: 'dashboard-kpi-tile',
    standalone: true,
    imports: [NgIf, NgClass, NgTemplateOutlet, RouterLink, BooIconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block h-full min-w-0' },
    template: `
        <ng-template #body>
            <div class="flex items-center justify-between gap-2">
                <p class="m-0 text-xs font-medium text-secondary truncate">{{ kpi.label }}</p>
                <span
                    class="flex-none w-7 h-7 rounded-lg flex items-center justify-center"
                    [ngClass]="attention ? 'bg-dangerSoft text-danger' : 'bg-primarySoft text-primaryDeep'"
                    aria-hidden="true"
                >
                    <physio-icon [name]="kpi.icon" [size]="15" />
                </span>
            </div>
            <p class="m-0 mt-1.5 text-2xl leading-8 font-semibold tabular-nums tracking-tight truncate" [ngClass]="attention ? 'text-danger' : 'text-regular'">
                {{ kpi.value }}
            </p>
            <p class="m-0 mt-0.5 text-xs leading-4 text-secondary break-words">{{ kpi.detail }}</p>
            <p *ngIf="kpi.trend as trend" class="m-0 mt-1.5 inline-flex items-center gap-1 text-xs leading-4 text-secondary">
                <physio-icon [name]="trend.pct > 0 ? 'trending-up' : trend.pct < 0 ? 'trending-down' : 'minus'" [size]="13" aria-hidden="true" />
                <span class="font-semibold text-regular tabular-nums">{{ trend.pct > 0 ? '+' : '' }}{{ trend.pct }}%</span>
                <span>{{ trend.label }}</span>
            </p>
        </ng-template>

        <a
            *ngIf="kpi.link; else plain"
            [routerLink]="kpi.link"
            class="group block h-full px-4 py-3.5 bg-surface border rounded-xl no-underline transition-colors hover:border-primary/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            [ngClass]="attention ? 'border-dangerBorder' : 'border-borderGray'"
        >
            <ng-container *ngTemplateOutlet="body"></ng-container>
        </a>
        <ng-template #plain>
            <div class="h-full px-4 py-3.5 bg-surface border rounded-xl" [ngClass]="attention ? 'border-dangerBorder' : 'border-borderGray'">
                <ng-container *ngTemplateOutlet="body"></ng-container>
            </div>
        </ng-template>
    `,
})
export class DashboardKpiTileComponent {
    @Input({ required: true }) kpi!: DashboardKpi;

    get attention(): boolean {
        return this.kpi.tone === 'attention';
    }
}
