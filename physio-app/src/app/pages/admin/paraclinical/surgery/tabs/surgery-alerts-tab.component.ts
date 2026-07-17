import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SurgeryAlertSeverity, SurgeryCriticalAlert } from "../../../../../shared/types/surgery.types";

@Component({
  selector: 'surgery-alerts-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !alerts().length"><boo-empty-state icon="shield-check" title="No active clinical alerts" description="All consent, allergy, equipment, scheduling, and delay alerts have been acknowledged."></boo-empty-state></div>

    <div *ngIf="!isLoading() && alerts().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Severity</th>
            <th class="px-4 py-3 text-left">Type</th>
            <th class="px-4 py-3 text-left">Description</th>
            <th class="px-4 py-3 text-left">Patient / Surgery</th>
            <th class="px-4 py-3 text-left">Suggested Action</th>
            <th class="px-4 py-3 text-left">Raised At</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let a of sortedAlerts()" [ngClass]="a.severity === 'Critical' ? 'bg-rose-50' : ''">
            <td class="px-4 py-3"><boo-status-badge [label]="a.severity" [tone]="severityTone(a.severity)" [dotted]="true"></boo-status-badge></td>
            <td class="px-4 py-3 text-gray-700">{{ a.type }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ a.description }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.patientName ?? '—' }} <span *ngIf="a.surgeryNumber">({{ a.surgeryNumber }})</span></td>
            <td class="px-4 py-3 text-gray-500">{{ a.suggestedAction }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.raisedAt | date:'short' }}</td>
            <td class="px-4 py-3">
              <button (click)="acknowledge(a)" class="text-primary text-xs font-semibold hover:underline">Acknowledge</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class SurgeryAlertsTabComponent implements OnInit {
  isLoading = signal(true);
  alerts = signal<SurgeryCriticalAlert[]>([]);

  constructor(private srv: SurgeryService, private toastSrv: ToastService) { }

  ngOnInit(): void {
    this.srv.getAlerts().subscribe({
      next: (res) => { if (res.success) this.alerts.set(res.data.filter(a => !a.acknowledged)); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  sortedAlerts(): SurgeryCriticalAlert[] {
    const order: Record<SurgeryAlertSeverity, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  severityTone(severity: SurgeryAlertSeverity): BadgeTone {
    switch (severity) {
      case 'Critical': return 'danger';
      case 'High': return 'danger';
      case 'Warning': return 'warning';
      default: return 'primary';
    }
  }

  acknowledge(alert: SurgeryCriticalAlert): void {
    this.srv.acknowledgeAlert(alert.id).subscribe(res => {
      if (res.success) {
        this.alerts.set(this.alerts().filter(a => a.id !== alert.id));
        this.toastSrv.success('Alert acknowledged');
      } else {
        this.toastSrv.error('Unable to acknowledge alert');
      }
    });
  }
}
