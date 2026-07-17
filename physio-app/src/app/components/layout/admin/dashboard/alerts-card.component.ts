import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { AlertItem, AlertsSnapshot, AlertSeverity } from "../../../../shared/types/dashboard-overview.types";

@Component({
    selector: 'admin-alerts-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface border border-borderGray rounded-lg overflow-hidden h-full flex flex-col">
        <div class="px-3.5 pt-[13px] pb-2.5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-md bg-red-50 flex items-center justify-center shrink-0">
                    <boo-icon name="bell-ring" [size]="13" color="#ef4444"></boo-icon>
                </span>
                <div>
                    <h2 class="text-[12.5px] font-bold text-gray-900 m-0">Alerts</h2>
                    <p class="text-[10.5px] text-gray-400 m-0">{{ totalCount }} unresolved</p>
                </div>
            </div>
            <button type="button" class="text-[10.5px] text-blue-500 bg-transparent border-0 cursor-pointer p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" (click)="markAllRead()">Mark read</button>
        </div>

        <div class="flex-1 overflow-y-auto">
            <!-- Critical -->
            <div class="border-b border-gray-100">
                <button type="button" class="w-full flex items-center justify-between px-3.5 py-2.5 bg-transparent border-0 cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    [attr.aria-expanded]="open.critical" (click)="open.critical = !open.critical">
                    <span class="flex items-center gap-[7px]">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        <span class="text-[11.5px] font-bold text-red-500 uppercase tracking-wide">Critical</span>
                        <span class="bg-red-50 text-red-500 text-[9.5px] font-bold px-1.5 rounded-full">{{ critical.length }}</span>
                    </span>
                    <boo-icon [name]="open.critical ? 'chevron-up' : 'chevron-down'" [size]="12" color="#9ca3af"></boo-icon>
                </button>
                <div *ngIf="open.critical" class="px-3.5 pb-2.5 flex flex-col gap-[7px]">
                    <div *ngFor="let al of critical" class="p-2.5 bg-red-50 rounded-md border-l-[3px] border-red-500">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[9.5px] font-bold text-red-500 uppercase tracking-wide">{{ al.department }}</span>
                            <span class="text-[9.5px] text-gray-400 tabular-nums">{{ al.occurredAt }}</span>
                        </div>
                        <p class="text-[11px] text-gray-700 m-0 leading-[1.45]">{{ al.message }}</p>
                        <div class="flex gap-1.5 mt-2">
                            <button type="button" class="text-[10px] font-semibold text-white bg-red-500 border-0 px-2.5 py-[3px] rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" (click)="respond(al, 'critical')">Respond</button>
                            <button type="button" class="text-[10px] font-semibold text-gray-500 bg-transparent border border-gray-200 px-2 py-[3px] rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" (click)="dismiss(al, 'critical')">Dismiss</button>
                        </div>
                    </div>
                    <div *ngIf="!critical.length" class="text-[11px] text-gray-400 py-1">No critical alerts</div>
                </div>
            </div>

            <!-- Warning -->
            <div class="border-b border-gray-100">
                <button type="button" class="w-full flex items-center justify-between px-3.5 py-2.5 bg-transparent border-0 cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    [attr.aria-expanded]="open.warning" (click)="open.warning = !open.warning">
                    <span class="flex items-center gap-[7px]">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span class="text-[11.5px] font-bold text-amber-500 uppercase tracking-wide">Warning</span>
                        <span class="bg-amber-50 text-amber-500 text-[9.5px] font-bold px-1.5 rounded-full">{{ warning.length }}</span>
                    </span>
                    <boo-icon [name]="open.warning ? 'chevron-up' : 'chevron-down'" [size]="12" color="#9ca3af"></boo-icon>
                </button>
                <div *ngIf="open.warning" class="px-3.5 pb-2.5 flex flex-col gap-1.5">
                    <div *ngFor="let al of warning" class="p-2.5 bg-amber-50 rounded-md border-l-[3px] border-amber-500">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[9.5px] font-bold text-amber-600 uppercase tracking-wide">{{ al.department }}</span>
                            <span class="text-[9.5px] text-gray-400 tabular-nums">{{ al.occurredAt }}</span>
                        </div>
                        <p class="text-[11px] text-gray-700 m-0 leading-[1.4]">{{ al.message }}</p>
                    </div>
                    <div *ngIf="!warning.length" class="text-[11px] text-gray-400 py-1">No warnings</div>
                </div>
            </div>

            <!-- Info -->
            <div>
                <button type="button" class="w-full flex items-center justify-between px-3.5 py-2.5 bg-transparent border-0 cursor-pointer hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    [attr.aria-expanded]="open.info" (click)="open.info = !open.info">
                    <span class="flex items-center gap-[7px]">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span class="text-[11.5px] font-bold text-blue-500 uppercase tracking-wide">Info</span>
                        <span class="bg-blue-100 text-blue-500 text-[9.5px] font-bold px-1.5 rounded-full">{{ info.length }}</span>
                    </span>
                    <boo-icon [name]="open.info ? 'chevron-up' : 'chevron-down'" [size]="12" color="#9ca3af"></boo-icon>
                </button>
                <div *ngIf="open.info" class="px-3.5 pb-2.5 flex flex-col gap-1.5">
                    <div *ngFor="let al of info" class="p-2.5 bg-blue-50 rounded-md border-l-[3px] border-blue-500">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-[9.5px] font-bold text-blue-500 uppercase tracking-wide">{{ al.department }}</span>
                            <span class="text-[9.5px] text-gray-400 tabular-nums">{{ al.occurredAt }}</span>
                        </div>
                        <p class="text-[11px] text-gray-700 m-0 leading-[1.4]">{{ al.message }}</p>
                    </div>
                    <div *ngIf="!info.length" class="text-[11px] text-gray-400 py-1">No informational alerts</div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class AdminAlertsCardComponent implements OnChanges {
    @Input() alerts: AlertsSnapshot | null = null;
    @Output() respondAlert = new EventEmitter<{ alertId: string; severity: AlertSeverity }>();
    @Output() dismissAlert = new EventEmitter<{ alertId: string; severity: AlertSeverity }>();

    critical: AlertItem[] = [];
    warning: AlertItem[] = [];
    info: AlertItem[] = [];

    open = { critical: true, warning: false, info: false };

    ngOnChanges() {
        this.critical = [...(this.alerts?.critical ?? [])];
        this.warning = [...(this.alerts?.warning ?? [])];
        this.info = [...(this.alerts?.info ?? [])];
    }

    get totalCount(): number {
        return this.critical.length + this.warning.length + this.info.length;
    }

    respond(alert: AlertItem, severity: AlertSeverity) {
        this.removeLocally(alert, severity);
        this.respondAlert.emit({ alertId: alert.id, severity });
    }

    dismiss(alert: AlertItem, severity: AlertSeverity) {
        this.removeLocally(alert, severity);
        this.dismissAlert.emit({ alertId: alert.id, severity });
    }

    markAllRead() {
        this.critical = [];
        this.warning = [];
        this.info = [];
    }

    private removeLocally(alert: AlertItem, severity: AlertSeverity) {
        const list = severity === 'critical' ? this.critical : severity === 'warning' ? this.warning : this.info;
        const idx = list.findIndex(a => a.id === alert.id);
        if (idx >= 0) list.splice(idx, 1);
    }
}
