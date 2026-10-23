import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { finalize } from "rxjs";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { AuthService } from "../../../../../services/auth/auth.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabAlertSeverity, LabCriticalAlert } from "../../../../../shared/types/laboratory.types";
import { alertTone } from "../laboratory-display";

@Component({
  selector: 'laboratory-critical-alerts-tab',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent],
  template: `
    <div *ngIf="isLoading()" aria-hidden="true" class="h-48 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="isLoading()" class="sr-only" role="status">Loading alerts…</span>

    <boo-error-state *ngIf="!isLoading() && error()" appearance="panel" icon="cloud-off" title="We couldn't load the alerts"
      description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <boo-empty-state *ngIf="!isLoading() && !error() && !alerts().length" icon="shield-check" appearance="panel" title="No active critical alerts"
      description="All panic values, critical results, delta checks, and out-of-range flags have been acknowledged." />

    <div *ngIf="!isLoading() && !error() && alerts().length" class="bg-surface border border-gray-200 rounded-lg overflow-x-auto">
      <table class="w-full min-w-[900px] text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th scope="col" class="px-4 py-3 text-left">Severity</th>
            <th scope="col" class="px-4 py-3 text-left">Type</th>
            <th scope="col" class="px-4 py-3 text-left">Description</th>
            <th scope="col" class="px-4 py-3 text-left">Patient / Order</th>
            <th scope="col" class="px-4 py-3 text-left">Suggested action</th>
            <th scope="col" class="px-4 py-3 text-left">Raised</th>
            <th scope="col" class="px-4 py-3 text-left"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let a of sortedAlerts(); trackBy: trackById" [ngClass]="a.severity === 'Critical' ? 'bg-rose-50' : ''">
            <td class="px-4 py-3"><boo-status-badge [label]="a.severity" [tone]="tone(a.severity)" [dotted]="true" /></td>
            <td class="px-4 py-3 text-gray-700">{{ a.type }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">{{ a.description }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.patientName ?? '—' }} <span *ngIf="a.orderNumber">({{ a.orderNumber }})</span></td>
            <td class="px-4 py-3 text-gray-500">{{ a.suggestedAction }}</td>
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ a.raisedAt | date: 'MMM d, y, HH:mm' }}</td>
            <td class="px-4 py-3">
              <button *ngIf="canAcknowledge" boo-button variant="soft" size="sm" type="button" [loading]="busyId() === a.id" [disabled]="!!busyId()"
                (click)="acknowledge(a)" [attr.aria-label]="'Acknowledge ' + a.severity + ' alert'">Acknowledge</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class LaboratoryCriticalAlertsTabComponent implements OnChanges {
  @Input() refreshKey = 0;
  /** The banner and counters on the page depend on the open alerts, so the page reloads them. */
  @Output() changed = new EventEmitter<void>();

  private readonly srv = inject(LaboratoryService);
  private readonly toastSrv = inject(ToastService);
  private readonly authSrv = inject(AuthService);

  readonly canAcknowledge = this.authSrv.hasPermission(Permissions.Lab.AlertAcknowledge);
  readonly tone = alertTone;

  isLoading = signal(true);
  error = signal(false);
  alerts = signal<LabCriticalAlert[]>([]);
  busyId = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey']) this.load();
  }

  load(): void {
    if (!this.alerts().length) this.isLoading.set(true);
    this.error.set(false);
    this.srv.getAlerts().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: res => {
        if (!res.success) { this.error.set(true); return; }
        this.alerts.set(res.data.filter(a => !a.acknowledged));
      },
      error: () => this.error.set(true),
    });
  }

  sortedAlerts(): LabCriticalAlert[] {
    const order: Record<LabAlertSeverity, number> = { Critical: 0, High: 1, Warning: 2, Information: 3 };
    return [...this.alerts()].sort((a, b) => order[a.severity] - order[b.severity]);
  }

  acknowledge(alert: LabCriticalAlert): void {
    if (this.busyId()) return;
    this.busyId.set(alert.id);
    this.srv.acknowledgeAlert(alert.id).pipe(finalize(() => this.busyId.set(null))).subscribe({
      next: res => {
        if (!res.success) { this.toastSrv.error('Unable to acknowledge alert'); return; }
        this.alerts.update(list => list.filter(a => a.id !== alert.id));
        this.toastSrv.success('Alert acknowledged');
        this.changed.emit();
      },
    });
  }

  trackById(_: number, a: LabCriticalAlert): string { return a.id; }
}
