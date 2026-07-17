import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CriticalFindingAlert, RadiologyAlertSeverity } from "../../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-critical-findings-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !alerts().length">
      <boo-empty-state icon="alert-triangle" title="No critical findings recorded"></boo-empty-state>
    </div>

    <div *ngIf="!isLoading() && alerts().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Severity</th>
            <th class="px-4 py-3 text-left">Type</th>
            <th class="px-4 py-3 text-left">Description</th>
            <th class="px-4 py-3 text-left">Patient / Order</th>
            <th class="px-4 py-3 text-left">Notified</th>
            <th class="px-4 py-3 text-left">Acknowledged</th>
            <th class="px-4 py-3 text-left">Raised At</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let a of alerts()" class="hover:bg-gray-50">
            <td class="px-4 py-3"><boo-status-badge [label]="a.severity" [tone]="severityTone(a.severity)"></boo-status-badge></td>
            <td class="px-4 py-3 text-gray-600">{{ a.type }}</td>
            <td class="px-4 py-3 text-gray-700">{{ a.description }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.patientName ?? '—' }} {{ a.orderNumber ? '· ' + a.orderNumber : '' }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="a.notified ? 'Notified' : 'Pending'" [tone]="a.notified ? 'success' : 'neutral'"></boo-status-badge></td>
            <td class="px-4 py-3"><boo-status-badge [label]="a.acknowledged ? 'Acknowledged' : 'Open'" [tone]="a.acknowledged ? 'success' : 'warning'"></boo-status-badge></td>
            <td class="px-4 py-3 text-gray-500">{{ a.raisedAt | date:'short' }}</td>
            <td class="px-4 py-3">
              <button *ngIf="!a.acknowledged" (click)="acknowledge(a)" class="text-primary text-xs font-semibold hover:underline">Acknowledge</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class RadiologyCriticalFindingsTabComponent implements OnInit {
  isLoading = signal(true);
  alerts = signal<CriticalFindingAlert[]>([]);

  constructor(private srv: RadiologyService, private toastSrv: ToastService) { }

  ngOnInit(): void {
    this.srv.getAlerts().subscribe({
      next: (res) => { if (res.success) this.alerts.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  severityTone(severity: RadiologyAlertSeverity): BadgeTone {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'danger';
      case 'Warning': return 'warning';
      default: return 'primary';
    }
  }

  acknowledge(alert: CriticalFindingAlert): void {
    this.srv.acknowledgeAlert(alert.id).subscribe(res => {
      if (res.success) {
        this.alerts.update(list => list.map(a => a.id === alert.id ? { ...a, acknowledged: true } : a));
        this.toastSrv.success('Finding acknowledged');
      } else {
        this.toastSrv.error('Unable to acknowledge finding');
      }
    });
  }
}
