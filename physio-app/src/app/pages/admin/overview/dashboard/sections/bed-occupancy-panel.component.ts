import { NgClass, NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { BooEmptyStateComponent, BooIconComponent } from "@physioboo/ui";
import { DepartmentLoad, WardOccupancy } from "../../../../../shared/types/dashboard-overview.types";
import { clampPct, HIGH_OCCUPANCY_PCT, percentOf } from "../dashboard.utils";
import { DashboardPanelComponent } from "./dashboard-panel.component";

type OccupancyView = 'ward' | 'department';

interface OccupancyRow {
    name: string;
    pct: number;
    /** "12 / 20 beds" for wards; departments only come with a percentage. */
    detail: string | null;
    high: boolean;
}

/** Current bed occupancy per ward or per department (beds under maintenance excluded). */
@Component({
    selector: 'dashboard-bed-occupancy-panel',
    standalone: true,
    imports: [NgIf, NgFor, NgClass, BooIconComponent, BooEmptyStateComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Bed occupancy" icon="bed" caption="Occupied beds right now, excluding maintenance" [link]="link" linkLabel="Bed map">
            <div panelActions class="flex p-0.5 rounded-lg bg-body border border-rowDivider" role="group" aria-label="Group occupancy by">
                <button
                    *ngFor="let v of views"
                    type="button"
                    [attr.aria-pressed]="view === v.key"
                    (click)="setView(v.key)"
                    class="h-7 px-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    [ngClass]="view === v.key ? 'bg-surface text-regular shadow-switch' : 'text-secondary hover:text-regular'"
                >{{ v.label }}</button>
            </div>

            <ul *ngIf="rows.length; else emptyTpl" class="list-none m-0 px-4 py-3 flex flex-col gap-3 max-h-[22rem] overflow-y-auto">
                <li *ngFor="let row of rows; trackBy: trackByName" class="min-w-0">
                    <div class="flex items-baseline justify-between gap-3">
                        <span class="text-[13px] font-medium text-regular truncate" [title]="row.name">{{ row.name }}</span>
                        <span class="flex-none inline-flex items-center gap-1.5 text-xs tabular-nums">
                            <span *ngIf="row.detail" class="text-placeholder">{{ row.detail }}</span>
                            <span *ngIf="row.high" class="inline-flex items-center gap-0.5 font-semibold text-danger">
                                <physio-icon name="circle-alert" [size]="12" aria-hidden="true" />{{ row.pct }}%
                            </span>
                            <span *ngIf="!row.high" class="font-semibold text-regular">{{ row.pct }}%</span>
                        </span>
                    </div>
                    <div
                        class="mt-1.5 h-1.5 rounded-full bg-rowDivider overflow-hidden"
                        role="meter" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="row.pct"
                        [attr.aria-label]="row.name + ' occupancy' + (row.high ? ', high' : '')"
                    >
                        <div class="h-full rounded-full" [ngClass]="row.high ? 'bg-danger' : 'bg-primary'" [style.width.%]="clampPct(row.pct)"></div>
                    </div>
                </li>
            </ul>
            <ng-template #emptyTpl>
                <boo-empty-state icon="bed" title="No beds configured" description="Wards and beds set up in the bed map appear here." />
            </ng-template>

            <p *ngIf="rows.length" class="mt-auto mb-0 px-4 py-2.5 border-t border-rowDivider text-[11px] leading-4 text-placeholder">
                Marked when occupancy reaches {{ threshold }}%.{{ view === 'department' ? ' Busiest 8 departments.' : '' }}
            </p>
        </dashboard-panel>
    `,
})
export class DashboardBedOccupancyPanelComponent implements OnChanges {
    @Input({ required: true }) wards: WardOccupancy[] = [];
    @Input({ required: true }) departments: DepartmentLoad[] = [];
    @Input() link: string | null = null;

    view: OccupancyView = 'ward';
    rows: OccupancyRow[] = [];

    readonly threshold = HIGH_OCCUPANCY_PCT;
    readonly clampPct = clampPct;
    readonly views: { key: OccupancyView; label: string }[] = [
        { key: 'ward', label: 'Wards' },
        { key: 'department', label: 'Departments' },
    ];

    ngOnChanges(): void {
        this.buildRows();
    }

    setView(view: OccupancyView): void {
        this.view = view;
        this.buildRows();
    }

    trackByName(_: number, row: OccupancyRow): string {
        return row.name;
    }

    private buildRows(): void {
        if (this.view === 'department') {
            this.rows = (this.departments ?? []).map(d => ({
                name: d.name,
                pct: d.utilizationPct,
                detail: null,
                high: d.isCritical,
            }));
            return;
        }
        this.rows = (this.wards ?? [])
            .filter(w => w.total > 0)
            .map(w => {
                const pct = percentOf(w.occupied, w.total) ?? 0;
                return { name: w.name, pct, detail: `${w.occupied} / ${w.total} beds`, high: pct >= HIGH_OCCUPANCY_PCT };
            });
    }
}
