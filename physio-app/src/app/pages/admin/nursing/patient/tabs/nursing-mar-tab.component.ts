import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MarEntry } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-mar-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Medication</th>
            <th class="px-4 py-3 text-left">Dosage</th>
            <th class="px-4 py-3 text-left">Route</th>
            <th class="px-4 py-3 text-left">Scheduled</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Given By</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let m of entries()">
            <td class="px-4 py-3 font-medium text-gray-800">{{ m.medicationName }}</td>
            <td class="px-4 py-3">{{ m.dosage }}</td>
            <td class="px-4 py-3">{{ m.route }}</td>
            <td class="px-4 py-3">{{ m.scheduledAt | date:'short' }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="m.status" [tone]="statusTone(m.status)"></boo-status-badge></td>
            <td class="px-4 py-3 text-gray-500">{{ m.givenBy ?? '—' }}</td>
            <td class="px-4 py-3">
              <div *ngIf="m.status === 'Due'" class="flex gap-2">
                <button (click)="markGiven(m)" [disabled]="loadingSrv.isLoading('mar-' + m.id)" class="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:opacity-50">Given</button>
                <button (click)="markMissed(m)" [disabled]="loadingSrv.isLoading('mar-' + m.id)" class="px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">Missed</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div *ngIf="!entries().length" class="px-5 py-8 text-center text-xs text-secondary">No medications scheduled.</div>
    </div>
  `,
})
export class NursingMarTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  entries = signal<MarEntry[]>([]);

  constructor(
    private srv: NursingService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getMar(this.patientId).subscribe({
      next: (res) => { if (res.success) this.entries.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  statusTone(status: MarEntry['status']): BadgeTone {
    switch (status) {
      case 'Given': return 'success';
      case 'Missed': return 'danger';
      case 'Held': return 'warning';
      default: return 'primary';
    }
  }

  markGiven(entry: MarEntry): void {
    this.updateStatus(entry, 'Given');
  }

  markMissed(entry: MarEntry): void {
    this.dialogSrv.confirm(
      `Confirm ${entry.medicationName} (${entry.dosage}) was not administered.`,
      () => this.updateStatus(entry, 'Missed', 'Not administered'),
      'Mark dose as missed?',
      'warning',
      'Mark Missed',
    );
  }

  private updateStatus(entry: MarEntry, status: MarEntry['status'], reason?: string): void {
    const key = 'mar-' + entry.id;
    this.loadingSrv.setLoading(key, true);
    this.srv.updateMarStatus(entry.id, status, reason).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading(key, false);
        if (res.success) {
          this.entries.set(this.entries().map(e => e.id === entry.id
            ? { ...e, status, givenAt: status === 'Given' ? new Date().toISOString() : e.givenAt, givenBy: status === 'Given' ? 'You' : e.givenBy, reason }
            : e));
          this.toastSrv.success(`Dose marked as ${status.toLowerCase()}`);
        } else {
          this.toastSrv.error('Unable to update dose status');
        }
      },
      error: () => { this.loadingSrv.setLoading(key, false); this.toastSrv.error('Unable to update dose status'); },
    });
  }
}
