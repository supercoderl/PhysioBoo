import { NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BooBadgeTone, BooEmptyStateComponent, BooStatusBadgeComponent } from "@physioboo/ui";
import { OperationTheatre, OperationTheatreStatus } from "../../../../../shared/types/dashboard-overview.types";
import { clampPct } from "../dashboard.utils";
import { DashboardPanelComponent } from "./dashboard-panel.component";

const STATUS: Record<OperationTheatreStatus, { label: string; tone: BooBadgeTone }> = {
    ongoing: { label: 'In progress', tone: 'primary' },
    closing: { label: 'Closing', tone: 'success' },
    scheduled: { label: 'Scheduled', tone: 'neutral' },
};

/** Operating rooms in use and today's live and upcoming cases (the server returns up to six). */
@Component({
    selector: 'dashboard-theatres-panel',
    standalone: true,
    imports: [NgIf, NgFor, BooStatusBadgeComponent, BooEmptyStateComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Operating theatres" icon="scissors" [caption]="caption" [link]="link" linkLabel="Surgery">
            <ul *ngIf="operations.length; else emptyTpl" class="list-none m-0 px-4 py-1 divide-y divide-rowDivider">
                <li *ngFor="let op of operations" class="py-2.5 min-w-0">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="m-0 text-[13px] leading-5 font-medium text-regular truncate" [title]="op.procedure">{{ op.procedure }}</p>
                            <p class="m-0 text-xs leading-4 text-secondary truncate">
                                <span class="font-semibold text-regular">{{ op.room }}</span> · {{ op.surgeon }}
                            </p>
                        </div>
                        <boo-status-badge class="flex-none" [label]="status[op.status].label" [tone]="status[op.status].tone" />
                    </div>
                    <div class="mt-1.5 flex items-center gap-2.5">
                        <div
                            *ngIf="op.status !== 'scheduled'"
                            class="flex-1 h-1 rounded-full bg-rowDivider overflow-hidden"
                            role="meter" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="op.progressPct"
                            [attr.aria-label]="'Estimated progress of ' + op.procedure"
                        >
                            <div class="h-full rounded-full bg-primary" [style.width.%]="clampPct(op.progressPct)"></div>
                        </div>
                        <p class="m-0 text-[11px] leading-4 text-placeholder tabular-nums whitespace-nowrap" [class.ml-auto]="op.status === 'scheduled'">
                            {{ op.status === 'scheduled' ? 'Starts ' + op.startedAt : 'Started ' + op.startedAt + ' · ~' + op.etaMinutes + ' min left (est.)' }}
                        </p>
                    </div>
                </li>
            </ul>
            <ng-template #emptyTpl>
                <boo-empty-state icon="scissors" title="No surgeries today" description="Cases scheduled for today appear here." />
            </ng-template>
        </dashboard-panel>
    `,
})
export class DashboardTheatresPanelComponent {
    @Input({ required: true }) operations: OperationTheatre[] = [];
    @Input() roomsInUse = 0;
    @Input() roomsTotal = 0;
    @Input() link: string | null = null;

    readonly status = STATUS;
    readonly clampPct = clampPct;

    get caption(): string {
        return this.roomsTotal > 0
            ? `${this.roomsInUse} of ${this.roomsTotal} open rooms in surgery now`
            : 'No operating rooms open';
    }
}
