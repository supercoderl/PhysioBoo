import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ScheduleMedicationRequest } from "../../../../../shared/types/nursing.types";
import { MedicationAdministration } from "../../../../../shared/types/treatment-sheet.types";
import { toLocalDateTime } from "../../admission/admission.utils";

type ViewMode = 'table' | 'timeline';
type RecordableStatus = Exclude<MedicationAdministration['status'], 'Scheduled'>;

interface DoseDraft {
  medicationName: string;
  dose: string;
  route: string | null;
  frequency: string;
  scheduledDate: string;
  scheduledTime: string;
}

@Component({
  selector: 'treatment-medications-tab',
  standalone: true,
  imports: [SharedModule, BooButtonAdminComponent, BooDatepickerComponent, BooInputComponent, BooSelectComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent],
  template: `
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-primary m-0">Medication Administration Record</h3>
      <div class="flex items-center gap-2">
      <boo-button-admin *ngIf="canWrite" (click)="toggleSchedule()" textColor="white" [fontSize]="12" [radius]="8" fontWeight="600">{{ scheduleOpen() ? 'Close form' : 'Schedule dose' }}</boo-button-admin>
      <div class="flex bg-gray-100 rounded-lg p-0.5" role="group" aria-label="Record view">
        <button type="button" (click)="view = 'table'" [attr.aria-pressed]="view === 'table'" class="px-3 py-1.5 text-xs font-semibold rounded-lg" [ngClass]="view === 'table' ? 'bg-surface shadow text-primary' : 'text-gray-500'">Table</button>
        <button type="button" (click)="view = 'timeline'" [attr.aria-pressed]="view === 'timeline'" class="px-3 py-1.5 text-xs font-semibold rounded-lg" [ngClass]="view === 'timeline' ? 'bg-surface shadow text-primary' : 'text-gray-500'">Timeline</button>
      </div>
      </div>
    </div>

    <form *ngIf="scheduleOpen()" (ngSubmit)="scheduleDose()" class="mb-4 rounded-lg border border-dashed border-amber-400 bg-amber-50/40 p-4" aria-label="Schedule a medication dose">
      <div class="flex items-center gap-2 mb-3">
        <h3 class="text-sm font-semibold text-primary m-0">New scheduled dose</h3>
        <boo-status-badge label="Unsaved draft" tone="warning" [dotted]="true"></boo-status-badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
        <div class="md:col-span-2">
          <boo-input [(ngModel)]="dose.medicationName" name="medicationName" [maxlength]="200" label="Medication" required size="small"></boo-input>
        </div>
        <boo-input [(ngModel)]="dose.dose" name="dose" [maxlength]="64" label="Dose" required size="small"></boo-input>
        <boo-select [(ngModel)]="dose.route" name="route" label="Route" required [options]="routeOptions" size="small"></boo-select>
        <boo-input [(ngModel)]="dose.frequency" name="frequency" [maxlength]="64" label="Frequency" required size="small"></boo-input>
        <div class="md:col-span-3">
          <boo-datepicker [(ngModel)]="dose.scheduledDate" name="scheduledDate" label="Scheduled date" required size="small"></boo-datepicker>
        </div>
        <div class="md:col-span-3">
          <boo-input [(ngModel)]="dose.scheduledTime" name="scheduledTime" type="time" label="Scheduled time" required size="small"></boo-input>
        </div>
      </div>
      <p *ngIf="submitted() && validationMessage()" class="text-xs text-red-600 mt-2" role="alert">{{ validationMessage() }}</p>
      <div class="flex justify-end gap-2 mt-3">
        <boo-button-admin (click)="discardDraft()" [disabled]="savingDose()" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 12px" [fontSize]="12" [radius]="8">Discard</boo-button-admin>
        <boo-button-admin (click)="scheduleDose()" [disabled]="savingDose()" [loading]="savingDose()" textColor="white" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600">{{ savingDose() ? 'Saving…' : 'Schedule' }}</boo-button-admin>
      </div>
    </form>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16" aria-live="polite">
      <physio-icon name="loader" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
    </div>

    <boo-error-state *ngIf="!isLoading() && loadError()" title="Couldn't load the medication record" [description]="loadError()" appearance="panel" (retry)="load()"></boo-error-state>

    <ng-container *ngIf="!isLoading() && !loadError()">
    <div *ngIf="!entries().length"><boo-empty-state icon="pill" title="No medications scheduled" description="Scheduled and recorded doses for this stay will appear here."></boo-empty-state></div>

    <div *ngIf="entries().length && view === 'table'" class="bg-surface border border-gray-200 rounded-lg overflow-x-auto">
      <table class="w-full text-sm">
        <caption class="sr-only">Saved medication administration record</caption>
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th scope="col" class="px-4 py-3 text-left">Medication</th>
            <th scope="col" class="px-4 py-3 text-left">Dose</th>
            <th scope="col" class="px-4 py-3 text-left">Route</th>
            <th scope="col" class="px-4 py-3 text-left">Frequency</th>
            <th scope="col" class="px-4 py-3 text-left">Scheduled</th>
            <th scope="col" class="px-4 py-3 text-left">Status</th>
            <th scope="col" class="px-4 py-3 text-left">Administered By</th>
            <th scope="col" class="px-4 py-3 text-left">Notes</th>
            <th *ngIf="canWrite" scope="col" class="px-4 py-3 text-left">Record</th>
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
            <td *ngIf="canWrite" class="px-4 py-3">
              <div *ngIf="isOpen(m)" class="flex flex-wrap gap-2">
                <boo-button-admin (click)="record(m, 'Given')" [disabled]="loadingSrv.isLoading('med-' + m.id)" background="#059669" textColor="white" padding="4px 10px" [fontSize]="12" [radius]="4">Given</boo-button-admin>
                <boo-button-admin (click)="record(m, 'Missed')" [disabled]="loadingSrv.isLoading('med-' + m.id)" background="#EFE3E7" textColor="#55434B" padding="4px 10px" [fontSize]="12" [radius]="4">Missed</boo-button-admin>
                <boo-button-admin (click)="record(m, 'Refused')" [disabled]="loadingSrv.isLoading('med-' + m.id)" background="#EFE3E7" textColor="#55434B" padding="4px 10px" [fontSize]="12" [radius]="4">Refused</boo-button-admin>
                <boo-button-admin *ngIf="m.status === 'Scheduled'" (click)="record(m, 'Held')" [disabled]="loadingSrv.isLoading('med-' + m.id)" background="#EFE3E7" textColor="#55434B" padding="4px 10px" [fontSize]="12" [radius]="4">Hold</boo-button-admin>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ol *ngIf="entries().length && view === 'timeline'" class="relative border-l border-gray-200 ml-2 space-y-4">
      <li *ngFor="let m of entries()" class="ml-4">
        <span class="absolute -left-[5px] w-2.5 h-2.5 rounded-full mt-1.5" [ngClass]="statusTone(m.status) === 'danger' ? 'bg-rose-500' : 'bg-primary'"></span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-800">{{ m.medicationName }} {{ m.dose }}</span>
          <boo-status-badge [label]="m.status" [tone]="statusTone(m.status)"></boo-status-badge>
        </div>
        <p class="text-xs text-secondary">{{ m.scheduledTime | date:'short' }} · {{ m.route }} · {{ m.frequency }}</p>
      </li>
    </ol>
    <p *ngIf="truncated()" class="text-xs text-secondary mt-3">Showing the {{ entries().length }} most recent of {{ total() }} doses.</p>
    </ng-container>
  `,
})
export class TreatmentMedicationsTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;
  @Input() canWrite = false;
  /** Emitted after a dose was scheduled or recorded so the page can refresh its counters. */
  @Output() changed = new EventEmitter<void>();

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  entries = signal<MedicationAdministration[]>([]);
  total = signal(0);
  view: ViewMode = 'table';

  readonly routes = ['PO', 'IV', 'IM', 'SC', 'SL', 'PR', 'Topical', 'Inhaled'];
  readonly routeOptions = this.routes.map(r => ({ label: r, value: r }));
  scheduleOpen = signal(false);
  savingDose = signal(false);
  submitted = signal(false);
  dose = this.emptyDose();

  constructor(
    private srv: TreatmentSheetService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  private emptyDose(): DoseDraft {
    return { medicationName: '', dose: '', route: null, frequency: '', scheduledDate: '', scheduledTime: '' };
  }

  toggleSchedule(): void {
    this.scheduleOpen.set(!this.scheduleOpen());
  }

  discardDraft(): void {
    this.dose = this.emptyDose();
    this.submitted.set(false);
    this.scheduleOpen.set(false);
  }

  /** First problem the backend would reject, so the user fixes it without a round trip. */
  validationMessage(): string | null {
    const d = this.dose;
    if (!d.medicationName.trim()) return 'Enter the medication.';
    if (!d.dose.trim()) return 'Enter the dose.';
    if (!d.route) return 'Choose the route.';
    if (!d.frequency.trim()) return 'Enter the frequency.';
    if (!d.scheduledDate || !d.scheduledTime) return 'Enter the scheduled date and time.';
    return null;
  }

  scheduleDose(): void {
    if (this.savingDose()) return;
    this.submitted.set(true);
    if (this.validationMessage()) return;

    const d = this.dose;
    const request: ScheduleMedicationRequest = {
      medicationName: d.medicationName.trim(),
      dose: d.dose.trim(),
      route: d.route!,
      frequency: d.frequency.trim(),
      scheduledAt: toLocalDateTime(d.scheduledDate, d.scheduledTime),
    };
    this.savingDose.set(true);
    this.srv.scheduleMedication(this.patientId, request).subscribe({
      next: res => {
        this.savingDose.set(false);
        if (!res.success) { this.toastSrv.error('Unable to schedule the dose'); return; }
        this.discardDraft();
        this.toastSrv.success('Dose scheduled');
        this.load();
        this.changed.emit();
      },
      // The draft stays as typed so the user can retry.
      error: () => { this.savingDose.set(false); this.toastSrv.error('Unable to schedule the dose'); }
    });
  }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.srv.getMedications(this.patientId).subscribe({
      next: (res) => {
        if (res.success) {
          this.entries.set(res.data.items);
          this.total.set(res.data.totalCount);
        } else {
          this.loadError.set('The medication record could not be loaded.');
        }
        this.isLoading.set(false);
      },
      error: () => { this.loadError.set('The medication record could not be loaded.'); this.isLoading.set(false); },
    });
  }

  truncated(): boolean { return this.total() > this.entries().length; }

  statusTone(status: MedicationAdministration['status']): BooBadgeTone {
    switch (status) {
      case 'Given': return 'success';
      case 'Missed': return 'danger';
      case 'Refused': return 'danger';
      case 'Held': return 'warning';
      default: return 'primary';
    }
  }

  /** The backend only records a dose that is still scheduled, or was held earlier. */
  isOpen(entry: MedicationAdministration): boolean {
    return entry.status === 'Scheduled' || entry.status === 'Held';
  }

  record(entry: MedicationAdministration, status: RecordableStatus): void {
    if (status === 'Given') {
      this.updateStatus(entry, status);
      return;
    }
    this.dialogSrv.confirm(
      `Record ${entry.medicationName} (${entry.dose}) as ${status.toLowerCase()}? This is saved to the patient's record.`,
      () => this.updateStatus(entry, status),
      `Mark dose as ${status.toLowerCase()}?`,
      'warning',
      `Mark ${status}`,
    );
  }

  private updateStatus(entry: MedicationAdministration, status: RecordableStatus): void {
    const key = 'med-' + entry.id;
    if (this.loadingSrv.isLoading(key)) return;
    this.loadingSrv.setLoading(key, true);
    this.srv.updateMedicationStatus(entry.id, status).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading(key, false);
        if (res.success && res.data) {
          // The saved row comes from the server, including who recorded it and when.
          this.entries.set(this.entries().map(e => e.id === entry.id ? res.data : e));
          this.toastSrv.success(`Dose marked as ${status.toLowerCase()}`);
          this.changed.emit();
        } else {
          this.toastSrv.error('Unable to update dose status');
        }
      },
      error: () => { this.loadingSrv.setLoading(key, false); this.toastSrv.error('Unable to update dose status'); },
    });
  }
}
