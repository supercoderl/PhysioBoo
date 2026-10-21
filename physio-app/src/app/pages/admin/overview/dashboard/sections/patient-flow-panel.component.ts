import { NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { BooIconComponent } from "@physioboo/ui";
import { PatientFlowHourlyPoint, PatientFlowSummary } from "../../../../../shared/types/dashboard-overview.types";
import { averageOrDash, niceAxisMax } from "../dashboard.utils";
import { DashboardPanelComponent } from "./dashboard-panel.component";

interface FlowBar {
    point: PatientFlowHourlyPoint;
    admissionsPct: number;
    dischargesPct: number;
    showLabel: boolean;
}

/** Today's admissions and discharges by hour, with the 30-day stay and turnover figures underneath. */
@Component({
    selector: 'dashboard-patient-flow-panel',
    standalone: true,
    imports: [NgIf, NgFor, BooIconComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    styles: [`
        :host { --flow-admissions: #E11D48; --flow-discharges: #0891B2; }
        :host-context(.dark) { --flow-admissions: #F43F5E; --flow-discharges: #0EA5C6; }
        .bar-admissions { background: var(--flow-admissions); }
        .bar-discharges { background: var(--flow-discharges); }
    `],
    template: `
        <dashboard-panel title="Patient flow" icon="activity" caption="Admissions and discharges today, by hour" [link]="link" linkLabel="Admissions">
            <div class="px-4 pt-3 pb-4 flex flex-col gap-3 flex-1">
                <!-- Legend doubles as the readout for the hovered hour -->
                <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 min-h-5" aria-hidden="true">
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
                        <span class="inline-flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-sm bar-admissions"></span>
                            Admissions <strong class="text-regular font-semibold tabular-nums">{{ active ? active.admissions : flow.admissionsToday }}</strong>
                        </span>
                        <span class="inline-flex items-center gap-1.5">
                            <span class="w-2.5 h-2.5 rounded-sm bar-discharges"></span>
                            Discharges <strong class="text-regular font-semibold tabular-nums">{{ active ? active.discharges : flow.dischargesToday }}</strong>
                        </span>
                    </div>
                    <span class="text-xs text-placeholder tabular-nums">{{ active ? active.hour + ' – ' + nextHour(active.hour) : 'All day' }}</span>
                </div>

                <div class="relative flex gap-2">
                    <!-- Y axis -->
                    <div class="flex flex-col justify-between h-40 text-[11px] leading-none text-placeholder tabular-nums text-right w-5 flex-none" aria-hidden="true">
                        <span>{{ axisMax }}</span>
                        <span>{{ axisMid }}</span>
                        <span>0</span>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="relative h-40 border-b border-borderGray" aria-hidden="true" (mouseleave)="active = null">
                            <div class="absolute inset-x-0 top-0 border-t border-dashed border-rowDivider"></div>
                            <div class="absolute inset-x-0 top-1/2 border-t border-dashed border-rowDivider"></div>
                            <div class="absolute inset-0 flex items-end">
                                <div
                                    *ngFor="let bar of bars; trackBy: trackByHour"
                                    class="flex-1 h-full flex items-end justify-center gap-px px-px rounded-t-sm cursor-default transition-colors"
                                    [class.bg-primarySoft]="active === bar.point"
                                    (mouseenter)="active = bar.point"
                                >
                                    <span class="w-full max-w-[7px] rounded-t-[3px] bar-admissions" [style.height.%]="bar.admissionsPct"></span>
                                    <span class="w-full max-w-[7px] rounded-t-[3px] bar-discharges" [style.height.%]="bar.dischargesPct"></span>
                                </div>
                            </div>
                            <div *ngIf="isEmpty" class="absolute inset-0 flex items-center justify-center">
                                <p class="m-0 px-3 py-1.5 rounded-lg bg-surface text-xs text-secondary">No admissions or discharges recorded yet today.</p>
                            </div>
                        </div>
                        <div class="flex mt-1.5 text-[11px] leading-none text-placeholder tabular-nums" aria-hidden="true">
                            <span *ngFor="let bar of bars; trackBy: trackByHour" class="flex-1 text-center whitespace-nowrap overflow-visible">
                                {{ bar.showLabel ? bar.point.hour.slice(0, 2) : '' }}
                            </span>
                        </div>
                    </div>

                    <!-- Screen-reader view of the chart -->
                    <table class="sr-only">
                        <caption>Admissions and discharges per hour today</caption>
                        <thead><tr><th scope="col">Hour</th><th scope="col">Admissions</th><th scope="col">Discharges</th></tr></thead>
                        <tbody>
                            <tr *ngFor="let bar of bars; trackBy: trackByHour">
                                <th scope="row">{{ bar.point.hour }}</th><td>{{ bar.point.admissions }}</td><td>{{ bar.point.discharges }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <dl class="m-0 grid grid-cols-1 sm:grid-cols-3 border-t border-rowDivider divide-y sm:divide-y-0 sm:divide-x divide-rowDivider">
                <div class="px-4 py-3 min-w-0">
                    <dt class="text-xs text-secondary">Due for discharge</dt>
                    <dd class="m-0 mt-0.5 text-lg font-semibold text-regular tabular-nums">{{ flow.dischargesPending }}</dd>
                    <dd class="m-0 text-[11px] leading-4 text-placeholder">Expected by end of day, not yet discharged</dd>
                </div>
                <div class="px-4 py-3 min-w-0">
                    <dt class="text-xs text-secondary">Average length of stay</dt>
                    <dd class="m-0 mt-0.5 text-lg font-semibold text-regular tabular-nums">{{ averageOrDash(flow.avgLengthOfStayDays, ' days') }}</dd>
                    <dd class="m-0 text-[11px] leading-4 text-placeholder">Patients discharged in the last 30 days</dd>
                </div>
                <div class="px-4 py-3 min-w-0">
                    <dt class="text-xs text-secondary">Bed turnover</dt>
                    <dd class="m-0 mt-0.5 flex items-baseline gap-2 flex-wrap">
                        <span class="text-lg font-semibold text-regular tabular-nums">{{ flow.bedTurnoverRate }}</span>
                        <span *ngIf="flow.bedTurnoverRate > 0" class="inline-flex items-center gap-0.5 text-xs text-secondary tabular-nums">
                            <physio-icon [name]="flow.bedTurnoverTrendPct > 0 ? 'trending-up' : flow.bedTurnoverTrendPct < 0 ? 'trending-down' : 'minus'" [size]="13" aria-hidden="true" />
                            {{ flow.bedTurnoverTrendPct > 0 ? '+' : '' }}{{ flow.bedTurnoverTrendPct }}% vs prior 30 days
                        </span>
                    </dd>
                    <dd class="m-0 text-[11px] leading-4 text-placeholder">Discharges per bed, last 30 days</dd>
                </div>
            </dl>
        </dashboard-panel>
    `,
})
export class DashboardPatientFlowPanelComponent implements OnChanges {
    @Input({ required: true }) flow!: PatientFlowSummary;
    @Input() link: string | null = null;

    bars: FlowBar[] = [];
    axisMax = 1;
    axisMid = '';
    isEmpty = true;
    active: PatientFlowHourlyPoint | null = null;

    readonly averageOrDash = averageOrDash;

    ngOnChanges(): void {
        const hourly = this.flow?.hourly ?? [];
        const max = Math.max(0, ...hourly.map(h => Math.max(h.admissions, h.discharges)));
        this.isEmpty = max === 0;
        this.axisMax = niceAxisMax(max);
        const mid = this.axisMax / 2;
        this.axisMid = Number.isInteger(mid) ? `${mid}` : '';
        this.bars = hourly.map((point, i) => ({
            point,
            admissionsPct: (point.admissions / this.axisMax) * 100,
            dischargesPct: (point.discharges / this.axisMax) * 100,
            showLabel: i % 3 === 0,
        }));
        this.active = null;
    }

    nextHour(hour: string): string {
        const h = (parseInt(hour, 10) + 1) % 24;
        return `${`${h}`.padStart(2, '0')}:00`;
    }

    trackByHour(_: number, bar: FlowBar): string {
        return bar.point.hour;
    }
}
