import { NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BooEmptyStateComponent, BooIconComponent } from "@physioboo/ui";
import { DashboardEvent, DashboardEventCategory } from "../../../../../shared/types/dashboard-overview.types";
import { DashboardPanelComponent } from "./dashboard-panel.component";

const CATEGORY: Record<DashboardEventCategory, { icon: string; label: string }> = {
    admission: { icon: 'user-plus', label: 'Admission' },
    discharge: { icon: 'door-open', label: 'Discharge' },
    billing: { icon: 'receipt', label: 'Payment' },
    surgery: { icon: 'scissors', label: 'Surgery' },
    lab: { icon: 'flask-conical', label: 'Laboratory' },
    pharmacy: { icon: 'pill', label: 'Pharmacy' },
};

/** The latest admissions, discharges, payments, surgeries, lab results and stock alerts recorded today. */
@Component({
    selector: 'dashboard-activity-panel',
    standalone: true,
    imports: [NgIf, NgFor, BooIconComponent, BooEmptyStateComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Recent activity" icon="list-checks" caption="Latest events recorded today">
            <ol *ngIf="events.length; else emptyTpl" class="list-none m-0 px-4 py-2">
                <li *ngFor="let event of events; let last = last; trackBy: trackById" class="relative flex gap-3 py-2">
                    <span *ngIf="!last" class="absolute left-[13px] top-9 bottom-0 w-px bg-rowDivider" aria-hidden="true"></span>
                    <span class="relative flex-none w-7 h-7 rounded-full bg-body border border-borderGray text-secondary flex items-center justify-center">
                        <physio-icon [name]="category(event).icon" [size]="13" aria-hidden="true" />
                        <span class="sr-only">{{ category(event).label }}</span>
                    </span>
                    <div class="flex-1 min-w-0 pt-0.5">
                        <p class="m-0 text-[13px] leading-5 text-regular break-words">{{ event.text }}</p>
                        <p class="m-0 text-[11px] leading-4 text-placeholder tabular-nums">{{ category(event).label }} · {{ event.occurredAt }}</p>
                    </div>
                </li>
            </ol>
            <ng-template #emptyTpl>
                <boo-empty-state icon="list-checks" title="Nothing recorded yet today" description="Admissions, discharges, payments, surgeries and lab results appear here as they happen." />
            </ng-template>
        </dashboard-panel>
    `,
})
export class DashboardActivityPanelComponent {
    @Input({ required: true }) events: DashboardEvent[] = [];

    category(event: DashboardEvent): { icon: string; label: string } {
        return CATEGORY[event.category] ?? { icon: 'activity', label: 'Event' };
    }

    trackById(_: number, event: DashboardEvent): string {
        return event.id;
    }
}
