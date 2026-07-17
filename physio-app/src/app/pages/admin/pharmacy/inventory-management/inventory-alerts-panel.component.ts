import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { InventoryManagementService } from "../../../../services/admin/inventory-management.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { InventoryAlert, InventoryAlertSeverity, alertSeverityRank } from "../../../../shared/types/inventory-management.types";

@Component({
    selector: 'inventory-alerts-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent, StatusBadgeComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-regular">Alerts Center</h2>
        <span *ngIf="unacknowledgedCount" class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold">{{ unacknowledgedCount }} open</span>
      </div>

      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <div *ngIf="loading()" class="flex items-center justify-center py-16">
          <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
        </div>

        <boo-empty-state *ngIf="!loading() && !alerts().length" icon="shield-check" title="No active alerts"></boo-empty-state>

        <div *ngFor="let a of alerts()" class="rounded-1.5 border p-2.5" [ngClass]="a.acknowledged ? 'border-borderGray/60 opacity-60' : severityBorderClass(a.severity)" [attr.role]="a.severity === 'Critical' && !a.acknowledged ? 'alert' : null">
          <div class="flex items-center justify-between mb-1">
            <boo-status-badge [label]="a.severity" [tone]="severityTone(a.severity)" dotted></boo-status-badge>
            <span class="text-[10px] text-secondary">{{ a.createdAt | date:'shortTime' }}</span>
          </div>
          <p class="text-xs font-semibold text-regular leading-tight">{{ a.medicineName }}</p>
          <p class="text-[11px] text-secondary mb-1">{{ a.message }}</p>
          <p class="text-[11px] text-secondary mb-1.5" *ngIf="a.recommendation">{{ a.recommendation }}</p>
          <button type="button" *ngIf="!a.acknowledged" (click)="onAcknowledge(a)" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-gray-300 text-gray-600 hover:bg-gray-50">
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  `,
})
export class InventoryAlertsPanelComponent implements OnInit, OnChanges {
    @Input() medicineId: string | null = null;
    @Output() acknowledge = new EventEmitter<InventoryAlert>();

    loading = signal(true);
    alerts = signal<InventoryAlert[]>([]);

    constructor(private srv: InventoryManagementService, private toastSrv: ToastService) { }

    ngOnInit(): void {
        this.load();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['medicineId'] && !changes['medicineId'].firstChange) this.load();
    }

    private load(): void {
        this.loading.set(true);
        this.srv.getAlerts(this.medicineId ?? undefined).subscribe({
            next: res => {
                if (res.success) this.alerts.set([...res.data].sort((a, b) => alertSeverityRank(b.severity) - alertSeverityRank(a.severity)));
                this.loading.set(false);
            },
            error: () => this.loading.set(false),
        });
    }

    get unacknowledgedCount(): number {
        return this.alerts().filter(a => !a.acknowledged).length;
    }

    onAcknowledge(alert: InventoryAlert): void {
        this.alerts.update(list => list.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a));
        this.srv.acknowledgeAlert(alert.id).subscribe();
        this.acknowledge.emit(alert);
        this.toastSrv.success('Alert acknowledged');
    }

    severityTone(severity: InventoryAlertSeverity): BadgeTone {
        switch (severity) {
            case 'Critical': return 'danger';
            case 'High': return 'danger';
            case 'Warning': return 'warning';
            default: return 'neutral';
        }
    }

    severityBorderClass(severity: InventoryAlertSeverity): string {
        switch (severity) {
            case 'Critical': return 'border-rose-300 bg-rose-50/40';
            case 'High': return 'border-rose-200 bg-rose-50/20';
            case 'Warning': return 'border-amber-200 bg-amber-50/30';
            default: return 'border-borderGray/60';
        }
    }
}
