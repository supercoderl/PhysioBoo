import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ProcedureStatus, TreatmentProcedureRow } from "../../../../../shared/types/treatment-sheet.types";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { toLocalDateTime } from "../../admission/admission.utils";

interface ProcedureDraft {
  name: string;
  status: ProcedureStatus | null;
  department: string;
  scheduledDate: string;
  scheduledTime: string;
  completionDate: string;
  completionTime: string;
  performerName: string;
}

@Component({
  selector: 'treatment-procedures-tab',
  standalone: true,
  imports: [SharedModule, BooDatepickerComponent, BooInputComponent, BooSelectComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent, BooButtonAdminComponent],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-primary m-0">Procedures</h3>
      <boo-button-admin *ngIf="canWrite" (click)="showForm.set(!showForm())" textColor="white" [fontSize]="12" [radius]="8" fontWeight="600">
        {{ showForm() ? 'Close form' : 'Add Procedure' }}
      </boo-button-admin>
    </div>

    <form *ngIf="showForm()" (ngSubmit)="submit()" class="rounded-lg border border-dashed border-amber-400 bg-amber-50/40 p-4 mb-4" aria-label="Record a procedure">
      <div class="flex items-center gap-2 mb-3">
        <h3 class="text-sm font-semibold text-primary m-0">New procedure</h3>
        <boo-status-badge label="Unsaved draft" tone="warning" [dotted]="true"></boo-status-badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <boo-input label="Procedure name" [(ngModel)]="form.name" name="name" [maxlength]="255" required size="small"></boo-input>
        <boo-input label="Department" [(ngModel)]="form.department" name="department" [maxlength]="120" required size="small"></boo-input>
        <boo-select label="Status" [(ngModel)]="form.status" name="status" [options]="statusOptions" required size="small"></boo-select>
        <boo-datepicker label="Scheduled date" [(ngModel)]="form.scheduledDate" name="scheduledDate" required size="small"></boo-datepicker>
        <boo-input label="Scheduled time" type="time" [(ngModel)]="form.scheduledTime" name="scheduledTime" required size="small"></boo-input>
        <boo-input label="Performed by (optional)" [(ngModel)]="form.performerName" name="performer" [maxlength]="120" size="small"></boo-input>
        <ng-container *ngIf="form.status === 'Completed'">
          <boo-datepicker label="Completion date (optional)" [(ngModel)]="form.completionDate" name="completionDate" size="small"></boo-datepicker>
          <boo-input label="Completion time (optional)" type="time" [(ngModel)]="form.completionTime" name="completionTime" size="small"></boo-input>
        </ng-container>
      </div>
      <p *ngIf="submitted() && validationMessage()" class="text-xs text-red-600 mt-2" role="alert">{{ validationMessage() }}</p>
      <div class="flex justify-end gap-2 mt-3">
        <boo-button-admin (click)="discardDraft()" [disabled]="saving()" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 12px" [fontSize]="12" [radius]="8">Discard</boo-button-admin>
        <boo-button-admin (click)="submit()" [disabled]="saving()" [loading]="saving()" textColor="white" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600">{{ saving() ? 'Saving…' : 'Save Procedure' }}</boo-button-admin>
      </div>
    </form>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16" aria-live="polite">
      <physio-icon name="loader" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
    </div>

    <boo-error-state *ngIf="!isLoading() && loadError()" title="Couldn't load procedures" [description]="loadError()" appearance="panel" (retry)="load()"></boo-error-state>

    <ng-container *ngIf="!isLoading() && !loadError()">
      <div *ngIf="!procedures().length"><boo-empty-state icon="stethoscope" title="No procedures recorded" description="Procedures recorded for this stay will appear here."></boo-empty-state></div>

      <div *ngIf="procedures().length" class="space-y-3">
        <div *ngFor="let p of procedures()" class="bg-surface border border-gray-200 rounded-lg p-4 hover:border-primary/40 transition-colors">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-sm font-semibold text-gray-800">{{ p.name }}</h4>
              <p class="text-xs text-secondary">{{ p.department }} · Scheduled {{ p.scheduledTime | date:'short' }}
                <span *ngIf="p.completionTime"> · Completed {{ p.completionTime | date:'short' }}</span>
                <span *ngIf="p.performerName"> · {{ p.performerName }}</span>
              </p>
            </div>
            <boo-status-badge [label]="p.status" [tone]="statusTone(p.status)"></boo-status-badge>
          </div>
        </div>
      </div>
      <p *ngIf="truncated()" class="text-xs text-secondary mt-3">Showing the {{ procedures().length }} most recent of {{ total() }} procedures.</p>
    </ng-container>
  `,
})
export class TreatmentProceduresTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;
  @Input() canWrite = false;
  /** Emitted after a procedure was saved so the page can refresh its counters. */
  @Output() changed = new EventEmitter<void>();

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  procedures = signal<TreatmentProcedureRow[]>([]);
  total = signal(0);

  showForm = signal(false);
  saving = signal(false);
  submitted = signal(false);
  form = this.emptyForm();

  readonly statusOptions: { label: string; value: ProcedureStatus }[] = [
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'In progress', value: 'InProgress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService) { }

  private emptyForm(): ProcedureDraft {
    return { name: '', status: null, department: '', scheduledDate: '', scheduledTime: '', completionDate: '', completionTime: '', performerName: '' };
  }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.srv.getProcedures(this.patientId).subscribe({
      next: (res) => {
        if (res.success) {
          this.procedures.set(res.data.items);
          this.total.set(res.data.totalCount);
        } else {
          this.loadError.set('The procedures could not be loaded.');
        }
        this.isLoading.set(false);
      },
      error: () => { this.loadError.set('The procedures could not be loaded.'); this.isLoading.set(false); },
    });
  }

  truncated(): boolean { return this.total() > this.procedures().length; }

  discardDraft(): void {
    this.form = this.emptyForm();
    this.submitted.set(false);
    this.showForm.set(false);
  }

  /** First problem the backend would reject, so the user fixes it without a round trip. */
  validationMessage(): string | null {
    const f = this.form;
    if (!f.name.trim()) return 'Enter the procedure name.';
    if (!f.department.trim()) return 'Enter the department.';
    if (!f.status) return 'Choose the status.';
    if (!f.scheduledDate || !f.scheduledTime) return 'Enter the scheduled date and time.';
    if (f.status === 'Completed' && f.completionDate && !f.completionTime) return 'Enter the completion time, or clear the completion date.';
    if (f.status === 'Completed' && f.completionTime && !f.completionDate) return 'Enter the completion date, or clear the completion time.';
    if (this.completion() && this.completion()! < toLocalDateTime(f.scheduledDate, f.scheduledTime)) return 'Completion time may not be before the scheduled time.';
    return null;
  }

  private completion(): string | null {
    const f = this.form;
    return f.status === 'Completed' && f.completionDate && f.completionTime ? toLocalDateTime(f.completionDate, f.completionTime) : null;
  }

  submit(): void {
    if (this.saving()) return;
    this.submitted.set(true);
    if (this.validationMessage()) return;

    const f = this.form;
    const procedure: Omit<TreatmentProcedureRow, 'id'> = {
      name: f.name.trim(),
      department: f.department.trim(),
      status: f.status!,
      scheduledTime: toLocalDateTime(f.scheduledDate, f.scheduledTime),
      completionTime: this.completion(),
      performerName: f.performerName.trim() || null,
    };
    this.saving.set(true);
    this.srv.addProcedure(this.patientId, procedure).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success && res.data) {
          this.procedures.set([res.data, ...this.procedures()]);
          this.total.update(t => t + 1);
          this.discardDraft();
          this.toastSrv.success('Procedure recorded');
          this.changed.emit();
        } else {
          this.toastSrv.error('Unable to record procedure');
        }
      },
      // The draft stays as typed so the user can retry.
      error: () => { this.saving.set(false); this.toastSrv.error('Unable to record procedure'); },
    });
  }

  statusTone(status: TreatmentProcedureRow['status']): BooBadgeTone {
    switch (status) {
      case 'Completed': return 'success';
      case 'InProgress': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }
}
