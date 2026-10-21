import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BooIconComponent } from "@physioboo/ui";
import { FinancialClinicalSnapshot } from "../../../../../shared/types/dashboard-overview.types";
import { averageOrDash } from "../dashboard.utils";
import { DashboardPanelComponent } from "./dashboard-panel.component";

export interface ServiceQueueLinks {
    laboratory: string | null;
    radiology: string | null;
    pharmacy: string | null;
    insurance: string | null;
}

interface QueueRow {
    key: string;
    name: string;
    icon: string;
    value: number;
    unit: string;
    /** Count that needs attention first (STAT orders, urgent reads…); highlighted when above zero. */
    urgent: { count: number; label: string };
    detail: string;
    link: string | null;
}

/** Workload waiting in the laboratory, radiology, pharmacy and insurance claims. */
@Component({
    selector: 'dashboard-service-queues-panel',
    standalone: true,
    imports: [NgIf, NgFor, NgTemplateOutlet, RouterLink, BooIconComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Service queues" icon="microscope" caption="Pending work in supporting services">
            <ul class="list-none m-0 px-2 py-1.5">
                <li *ngFor="let row of rows; trackBy: trackByKey">
                    <ng-template #body>
                        <span class="flex-none w-8 h-8 rounded-lg bg-body border border-rowDivider text-secondary flex items-center justify-center" aria-hidden="true">
                            <physio-icon [name]="row.icon" [size]="15" />
                        </span>
                        <span class="flex-1 min-w-0">
                            <span class="flex items-baseline justify-between gap-2">
                                <span class="text-[13px] font-medium text-regular truncate">{{ row.name }}</span>
                                <span class="flex-none text-sm font-semibold text-regular tabular-nums">
                                    {{ row.value }} <span class="text-xs font-normal text-secondary">{{ row.unit }}</span>
                                </span>
                            </span>
                            <span class="block text-[11px] leading-4 text-placeholder break-words">
                                <span [class.text-danger]="row.urgent.count > 0" [class.font-semibold]="row.urgent.count > 0">{{ row.urgent.count }} {{ row.urgent.label }}</span>
                                · {{ row.detail }}
                            </span>
                        </span>
                    </ng-template>
                    <a
                        *ngIf="row.link; else plain"
                        [routerLink]="row.link"
                        class="flex items-center gap-3 px-2 py-2.5 rounded-lg no-underline hover:bg-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <ng-container *ngTemplateOutlet="body"></ng-container>
                        <physio-icon name="chevron-right" [size]="14" class="flex-none text-placeholder" aria-hidden="true" />
                    </a>
                    <ng-template #plain>
                        <div class="flex items-center gap-3 px-2 py-2.5"><ng-container *ngTemplateOutlet="body"></ng-container></div>
                    </ng-template>
                </li>
            </ul>
        </dashboard-panel>
    `,
})
export class DashboardServiceQueuesPanelComponent implements OnChanges {
    @Input({ required: true }) data!: FinancialClinicalSnapshot;
    @Input() links: ServiceQueueLinks = { laboratory: null, radiology: null, pharmacy: null, insurance: null };

    rows: QueueRow[] = [];

    ngOnChanges(): void {
        const d = this.data;
        if (!d) {
            this.rows = [];
            return;
        }
        this.rows = [
            {
                key: 'lab', name: 'Laboratory', icon: 'flask-conical',
                value: d.laboratory.ordersPending, unit: 'tests pending',
                urgent: { count: d.laboratory.statOrdersPending, label: 'STAT / emergency' },
                detail: `avg turnaround ${averageOrDash(d.laboratory.avgTurnaroundHours, ' h')} (7 days)`,
                link: this.links.laboratory,
            },
            {
                key: 'rad', name: 'Radiology', icon: 'scan-line',
                value: d.radiology.studiesInQueue, unit: 'waiting today',
                urgent: { count: d.radiology.urgentReadsPending, label: 'urgent reads pending' },
                detail: `avg read ${averageOrDash(d.radiology.avgReadMinutes, ' min')} (7 days)`,
                link: this.links.radiology,
            },
            {
                key: 'pharmacy', name: 'Pharmacy', icon: 'pill',
                value: d.pharmacy.dispensedToday, unit: 'dispensed today',
                urgent: { count: d.pharmacy.lowStockCount, label: 'low / out-of-stock alerts' },
                detail: `28-day benchmark ${d.pharmacy.target}/day`,
                link: this.links.pharmacy,
            },
            {
                key: 'insurance', name: 'Insurance claims', icon: 'shield-check',
                value: d.insuranceClaims.pending, unit: 'open',
                urgent: { count: d.insuranceClaims.criticalCount, label: 'urgent' },
                detail: d.insuranceClaims.approvedPct === 0 && d.insuranceClaims.avgProcessingDays === 0
                    ? 'no claim decisions in the last 30 days'
                    : `${d.insuranceClaims.approvedPct}% approved, avg ${averageOrDash(d.insuranceClaims.avgProcessingDays, ' days')} to decide (30 days)`,
                link: this.links.insurance,
            },
        ];
    }

    trackByKey(_: number, row: QueueRow): string {
        return row.key;
    }
}
