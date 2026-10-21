import { NgFor, NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { BooEmptyStateComponent } from "@physioboo/ui";
import { AppointmentFlowHourlySlot, AppointmentFlowSummary } from "../../../../../shared/types/dashboard-overview.types";
import { clampPct } from "../dashboard.utils";
import { DashboardPanelComponent } from "./dashboard-panel.component";

/** Today's appointment statuses and how full each clinic hour is against the doctors' schedules. */
@Component({
    selector: 'dashboard-appointments-panel',
    standalone: true,
    imports: [NgIf, NgFor, BooEmptyStateComponent, DashboardPanelComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block min-w-0' },
    template: `
        <dashboard-panel title="Appointments" icon="calendar-check" caption="Today, excluding cancelled and rescheduled" [link]="link" linkLabel="Bookings">
            <ng-container *ngIf="!isEmpty; else emptyTpl">
                <dl class="m-0 grid grid-cols-2 sm:grid-cols-4 gap-px bg-rowDivider border-b border-rowDivider">
                    <div *ngFor="let s of stats" class="px-4 py-3 min-w-0 bg-surface">
                        <dt class="text-xs text-secondary truncate">{{ s.label }}</dt>
                        <dd class="m-0 mt-0.5 text-lg font-semibold text-regular tabular-nums">{{ s.value }}</dd>
                    </div>
                </dl>

                <div class="px-4 pt-3 pb-4 flex flex-col gap-2 flex-1">
                    <div class="flex items-center justify-between gap-3 min-h-5">
                        <p class="m-0 text-xs font-medium text-secondary">Booked share of capacity, by hour</p>
                        <p class="m-0 text-xs text-placeholder tabular-nums" aria-hidden="true">
                            {{ active ? active.hour + ' · ' + active.bookedPct + '%' : flow.slotsRemaining + ' slots open' }}
                        </p>
                    </div>
                    <div class="relative h-28 border-b border-borderGray" aria-hidden="true" (mouseleave)="active = null">
                        <div class="absolute inset-x-0 top-0 border-t border-dashed border-rowDivider"></div>
                        <span class="absolute right-0 -top-0.5 -translate-y-full text-[10px] text-placeholder">100%</span>
                        <div class="absolute inset-0 flex items-end gap-1">
                            <div
                                *ngFor="let slot of hourly; trackBy: trackByHour"
                                class="flex-1 h-full flex items-end rounded-t-sm transition-colors"
                                [class.bg-primarySoft]="active === slot"
                                (mouseenter)="active = slot"
                            >
                                <span
                                    class="w-full rounded-t-[4px]"
                                    [class.bg-primary]="slot.bookedPct < 100"
                                    [class.bg-primaryPressed]="slot.bookedPct >= 100"
                                    [style.height.%]="clampPct(slot.bookedPct)"
                                ></span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-1 text-[10px] leading-none text-placeholder" aria-hidden="true">
                        <span *ngFor="let slot of hourly; let i = index; trackBy: trackByHour" class="flex-1 text-center whitespace-nowrap">
                            <span [class.hidden]="i % 2 === 1" class="sm:!inline">{{ slot.hour }}</span>
                        </span>
                    </div>
                    <table class="sr-only">
                        <caption>Share of appointment capacity booked per hour today</caption>
                        <thead><tr><th scope="col">Hour</th><th scope="col">Booked</th></tr></thead>
                        <tbody>
                            <tr *ngFor="let slot of hourly; trackBy: trackByHour"><th scope="row">{{ slot.hour }}</th><td>{{ slot.bookedPct }}%</td></tr>
                        </tbody>
                    </table>
                </div>
            </ng-container>
            <ng-template #emptyTpl>
                <boo-empty-state icon="calendar-days" title="No appointments today" description="No bookings and no doctor schedules in effect for today." />
            </ng-template>
        </dashboard-panel>
    `,
})
export class DashboardAppointmentsPanelComponent implements OnChanges {
    @Input({ required: true }) flow!: AppointmentFlowSummary;
    @Input() link: string | null = null;

    stats: { label: string; value: number }[] = [];
    hourly: AppointmentFlowHourlySlot[] = [];
    isEmpty = true;
    active: AppointmentFlowHourlySlot | null = null;

    readonly clampPct = clampPct;

    ngOnChanges(): void {
        const f = this.flow;
        this.hourly = f?.hourly ?? [];
        this.isEmpty = !f || (f.scheduled === 0 && f.slotsRemaining === 0);
        this.stats = f ? [
            { label: 'Booked', value: f.scheduled },
            { label: 'Confirmed', value: f.confirmed },
            { label: 'Awaiting confirmation', value: f.pending },
            { label: 'No-shows', value: f.noShows },
        ] : [];
        this.active = null;
    }

    trackByHour(_: number, slot: AppointmentFlowHourlySlot): string {
        return slot.hour;
    }
}
