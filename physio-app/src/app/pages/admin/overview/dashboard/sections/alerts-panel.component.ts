import { NgClass, NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooBadgeTone, BooButtonComponent, BooEmptyStateComponent, BooIconComponent, BooStatusBadgeComponent } from "@physioboo/ui";
import { AlertItem, AlertSeverity, AlertsSnapshot } from "../../../../../shared/types/dashboard-overview.types";
import { DashboardPanelComponent } from "./dashboard-panel.component";

type AlertFilter = 'all' | AlertSeverity;

const SEVERITY: Record<AlertSeverity, { label: string; tone: BooBadgeTone; icon: string; iconClass: string }> = {
    critical: { label: 'Critical', tone: 'danger', icon: 'siren', iconClass: 'bg-dangerSoft text-danger' },
    warning: { label: 'Warning', tone: 'warning', icon: 'triangle-alert', iconClass: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
    info: { label: 'Info', tone: 'neutral', icon: 'info', iconClass: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' },
};

/** Open alerts from every clinical module, filterable by severity, with acknowledgement when permitted. */
@Component({
    selector: 'dashboard-alerts-panel',
    standalone: true,
    imports: [NgIf, NgFor, NgClass, BooIconComponent, BooButtonComponent, BooStatusBadgeComponent, BooEmptyStateComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Open alerts" icon="bell-ring" caption="Unacknowledged alerts across modules, most severe first">
            <div class="px-4 pt-3" role="group" aria-label="Filter alerts by severity">
                <div class="flex gap-1 p-1 rounded-lg bg-body border border-rowDivider overflow-x-auto">
                    <button
                        *ngFor="let f of filters"
                        type="button"
                        [attr.aria-pressed]="filter === f.key"
                        (click)="setFilter(f.key)"
                        class="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        [ngClass]="filter === f.key ? 'bg-surface text-regular shadow-switch' : 'text-secondary hover:text-regular'"
                    >
                        {{ f.label }}
                        <span class="tabular-nums" [ngClass]="f.key === 'critical' && count('critical') > 0 ? 'text-danger' : 'text-placeholder'">{{ count(f.key) }}</span>
                    </button>
                </div>
            </div>

            <ul *ngIf="filtered.length; else emptyTpl" class="list-none m-0 px-4 py-2 flex-1 max-h-[26rem] overflow-y-auto divide-y divide-rowDivider">
                <li *ngFor="let alert of filtered; trackBy: trackById" class="flex items-start gap-3 py-2.5">
                    <span class="flex-none mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center" [ngClass]="severity[alert.severity].iconClass" aria-hidden="true">
                        <physio-icon [name]="severity[alert.severity].icon" [size]="14" />
                    </span>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <boo-status-badge [label]="severity[alert.severity].label" [tone]="severity[alert.severity].tone" />
                            <span class="text-xs font-semibold text-regular">{{ alert.department }}</span>
                            <span class="text-xs text-placeholder tabular-nums">· {{ alert.occurredAt }}</span>
                        </div>
                        <p class="m-0 mt-1 text-[13px] leading-5 text-regular break-words">{{ alert.message }}</p>
                    </div>
                    <button
                        *ngIf="canDismiss"
                        boo-button
                        variant="ghost"
                        size="sm"
                        [iconOnly]="true"
                        [loading]="dismissingIds.has(alert.id)"
                        [attr.aria-label]="'Acknowledge ' + severity[alert.severity].label.toLowerCase() + ' alert from ' + alert.department"
                        title="Acknowledge"
                        class="flex-none -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        (click)="dismiss.emit(alert)"
                    >
                        <physio-icon *ngIf="!dismissingIds.has(alert.id)" name="check" [size]="16" />
                    </button>
                </li>
            </ul>
            <ng-template #emptyTpl>
                <div class="flex-1 flex items-center justify-center">
                    <boo-empty-state
                        icon="shield-check"
                        [title]="filter === 'all' ? 'No open alerts' : 'No ' + filterLabel.toLowerCase() + ' alerts'"
                        description="New alerts from laboratory, radiology, surgery, nursing and pharmacy appear here."
                    />
                </div>
            </ng-template>

            <p class="m-0 px-4 py-2.5 border-t border-rowDivider text-[11px] leading-4 text-placeholder">
                Shows up to the 10 most recent open alerts per module. Times are when each alert was raised.
            </p>
        </dashboard-panel>
    `,
})
export class DashboardAlertsPanelComponent implements OnChanges {
    @Input({ required: true }) alerts!: AlertsSnapshot;
    @Input() canDismiss = false;
    @Input() dismissingIds: ReadonlySet<string> = new Set();
    @Output() dismiss = new EventEmitter<AlertItem>();

    filter: AlertFilter = 'all';
    filtered: AlertItem[] = [];
    private all: AlertItem[] = [];

    readonly severity = SEVERITY;
    readonly filters: { key: AlertFilter; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'critical', label: 'Critical' },
        { key: 'warning', label: 'Warning' },
        { key: 'info', label: 'Info' },
    ];

    get filterLabel(): string {
        return this.filters.find(f => f.key === this.filter)?.label ?? '';
    }

    ngOnChanges(): void {
        const a = this.alerts;
        this.all = a ? [...(a.critical ?? []), ...(a.warning ?? []), ...(a.info ?? [])] : [];
        this.applyFilter();
    }

    setFilter(key: AlertFilter): void {
        this.filter = key;
        this.applyFilter();
    }

    count(key: AlertFilter): number {
        if (key === 'all') return this.all.length;
        return this.alerts?.[key]?.length ?? 0;
    }

    trackById(_: number, alert: AlertItem): string {
        return alert.id;
    }

    private applyFilter(): void {
        this.filtered = this.filter === 'all' ? this.all : this.all.filter(a => a.severity === this.filter);
    }
}
