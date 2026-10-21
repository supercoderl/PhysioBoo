import { NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { BooEmptyStateComponent } from "@physioboo/ui";
import { StaffDutySummary, StaffGroupDuty } from "../../../../../shared/types/dashboard-overview.types";
import { percentOf } from "../dashboard.utils";
import { DashboardPanelComponent } from "./dashboard-panel.component";

interface StaffRow {
    label: string;
    measure: string;
    group: StaffGroupDuty;
    pct: number;
}

/**
 * Staffing. The two measures differ on the server: doctors count when a working schedule applies today;
 * other staff count when their employment status is Active. Each row says which one it shows.
 */
@Component({
    selector: 'dashboard-staff-panel',
    standalone: true,
    imports: [NgIf, NgFor, BooEmptyStateComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Staffing" icon="users" caption="Doctors scheduled today and active staff by group">
            <ul *ngIf="!isEmpty; else emptyTpl" class="list-none m-0 px-4 py-3 flex flex-col gap-3">
                <li *ngFor="let row of rows" class="min-w-0">
                    <div class="flex items-baseline justify-between gap-3">
                        <span class="min-w-0">
                            <span class="block text-[13px] font-medium text-regular truncate">{{ row.label }}</span>
                            <span class="block text-[11px] leading-4 text-placeholder">{{ row.measure }}</span>
                        </span>
                        <span class="flex-none text-sm font-semibold text-regular tabular-nums">
                            {{ row.group.onDuty }}<span class="text-xs font-normal text-secondary"> / {{ row.group.total }}</span>
                        </span>
                    </div>
                    <div
                        class="mt-1.5 h-1.5 rounded-full bg-rowDivider overflow-hidden"
                        role="meter" aria-valuemin="0" [attr.aria-valuemax]="row.group.total" [attr.aria-valuenow]="row.group.onDuty"
                        [attr.aria-label]="row.label + ', ' + row.measure"
                    >
                        <div class="h-full rounded-full bg-primary" [style.width.%]="row.pct"></div>
                    </div>
                </li>
            </ul>
            <ng-template #emptyTpl>
                <boo-empty-state icon="users" title="No staff records" description="Doctors and hospital staff appear here once they are added." />
            </ng-template>
        </dashboard-panel>
    `,
})
export class DashboardStaffPanelComponent implements OnChanges {
    @Input({ required: true }) staff!: StaffDutySummary;

    rows: StaffRow[] = [];
    isEmpty = true;

    ngOnChanges(): void {
        const s = this.staff;
        const row = (label: string, measure: string, group: StaffGroupDuty | undefined): StaffRow | null =>
            group ? { label, measure, group, pct: percentOf(group.onDuty, group.total) ?? 0 } : null;

        this.rows = s ? [
            row('Doctors', 'Scheduled to work today', s.doctors),
            row('Nurses', 'Active staff', s.nurses),
            row('Technical & pharmacy', 'Active staff', s.technicians),
            row('Admin & reception', 'Active staff', s.admin),
        ].filter((r): r is StaffRow => r !== null) : [];
        this.isEmpty = this.rows.every(r => r.group.total === 0);
    }
}
