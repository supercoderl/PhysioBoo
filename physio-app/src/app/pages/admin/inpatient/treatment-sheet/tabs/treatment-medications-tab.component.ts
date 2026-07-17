import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MedicationAdministration } from "../../../../../shared/types/treatment-sheet.types";

type ViewMode = 'table' | 'timeline';

@Component({
  selector: 'treatment-medications-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-primary m-0">Medication Administration Record</h3>
      <div class="flex bg-gray-100 rounded-lg p-0.5">
        <button (click)="view = 'table'" class="px-3 py-1.5 text-xs font-semibold rounded-lg" [ngClass]="view === 'table' ? 'bg-surface shadow text-primary' : 'text-gray-500'">Table</button>
        <button (click)="view = 'timeline'" class="px-3 py-1.5 text-xs font-semibold rounded-lg" [ngClass]="view === 'timeline' ? 'bg-surface shadow text-primary' : 'text-gray-500'">Timeline</button>
      </div>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !entries().length"><boo-empty-state icon="pill" title="No medications scheduled"></boo-empty-state></div>

    <div *ngIf="!isLoading() && entries().length && view === 'table'" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Medication</th>
            <th class="px-4 py-3 text-left">Dose</th>
            <th class="px-4 py-3 text-left">Route</th>
            <th class="px-4 py-3 text-left">Frequency</th>
            <th class="px-4 py-3 text-left">Scheduled</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Administered By</th>
            <th class="px-4 py-3 text-left">Notes</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let m of entries()">
            <td class="px-4 py-3 font-medium text-gray-800">{{ m.medicationName }}</td>
            <td class="px-4 py-3">{{ m.dose }}</td>
            <td class="px-4 py-3">{{ m.route }}</td>
            <td class="px-4 py-3">{{ m.frequency }}</td>
            <td class="px-4 py-3">{{ m.scheduledTime | date:'short' }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="m.status" [tone]="statusTone(m.status)"></boo-status-badge></td>
            <td class="px-4 py-3 text-gray-500">{{ m.administeredByName ?? '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ m.notes ?? '—' }}</td>
            <td class="px-4 py-3">
              <div *ngIf="m.status === 'Scheduled'" class="flex gap-2">
                <button (click)="markGiven(m)" [disabled]="loadingSrv.isLoading('med-' + m.id)" class="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:opacity-50">Given</button>
                <button (click)="markMissed(m)" [disabled]="loadingSrv.isLoading('med-' + m.id)" class="px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 disabled:opacity-50">Missed</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ol *ngIf="!isLoading() && entries().length && view === 'timeline'" class="relative border-l border-gray-200 ml-2 space-y-4">
      <li *ngFor="let m of entries()" class="ml-4">
        <span class="absolute -left-[5px] w-2.5 h-2.5 rounded-full mt-1.5" [ngClass]="statusTone(m.status) === 'danger' ? 'bg-rose-500' : 'bg-primary'"></span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-800">{{ m.medicationName }} {{ m.dose }}</span>
          <boo-status-badge [label]="m.status" [tone]="statusTone(m.status)"></boo-status-badge>
        </div>
        <p class="text-xs text-secondary">{{ m.scheduledTime | date:'short' }} · {{ m.route }} · {{ m.frequency }}</p>
      </li>
    </ol>
  `,
})
export class TreatmentMedicationsTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  entries = signal<MedicationAdministration[]>([]);
  view: ViewMode = 'table';

  constructor(
    private srv: TreatmentSheetService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getMedications(this.patientId).subscribe({
      next: (res) => { if (res.success) this.entries.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  statusTone(status: MedicationAdministration['status']): BadgeTone {
    switch (status) {
      case 'Given': return 'success';
      case 'Missed': return 'danger';
      case 'Refused': return 'danger';
      case 'Held': return 'warning';
      default: return 'primary';
    }
  }

  markGiven(entry: MedicationAdministration): void {
    this.updateStatus(entry, 'Given');
  }

  markMissed(entry: MedicationAdministration): void {
    this.dialogSrv.confirm(
      `Confirm ${entry.medicationName} (${entry.dose}) was not administered.`,
      () => this.updateStatus(entry, 'Missed', 'Not administered'),
      'Mark dose as missed?',
      'warning',
      'Mark Missed',
    );
  }

  private updateStatus(entry: MedicationAdministration, status: MedicationAdministration['status'], notes?: string): void {
    const key = 'med-' + entry.id;
    this.loadingSrv.setLoading(key, true);
    this.srv.updateMedicationStatus(entry.id, status, notes).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading(key, false);
        if (res.success) {
          this.entries.set(this.entries().map(e => e.id === entry.id
            ? { ...e, status, administeredByName: status === 'Given' ? 'You' : e.administeredByName, notes: notes ?? e.notes }
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
