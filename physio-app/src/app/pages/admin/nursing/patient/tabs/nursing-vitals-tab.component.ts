import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooInlineErrorComponent,
  BooInputComponent, BooPaginationComponent, BooStatusBadgeComponent
} from '@physioboo/ui';
import { finalize } from "rxjs";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { AddVitalsRequest, VitalsReading } from "../../../../../shared/types/nursing.types";

type VitalField = keyof AddVitalsRequest;

/** Ranges the server accepts; a value outside them is rejected there, so it is caught here first. */
const FIELDS: { key: VitalField; label: string; unit: string; min: number; max: number }[] = [
  { key: 'bloodPressureSystolic', label: 'Systolic', unit: 'mmHg', min: 40, max: 300 },
  { key: 'bloodPressureDiastolic', label: 'Diastolic', unit: 'mmHg', min: 20, max: 200 },
  { key: 'heartRate', label: 'Heart rate', unit: 'bpm', min: 20, max: 300 },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: 30, max: 45 },
  { key: 'respiratoryRate', label: 'Respiratory rate', unit: '/min', min: 4, max: 80 },
  { key: 'spo2', label: 'SpO2', unit: '%', min: 40, max: 100 },
];

@Component({
  selector: 'nursing-vitals-tab',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, DatePipe, ReactiveFormsModule,
    BooButtonComponent, BooIconComponent, BooInputComponent, BooEmptyStateComponent, BooErrorStateComponent,
    BooInlineErrorComponent, BooPaginationComponent, BooStatusBadgeComponent,
  ],
  template: `
    <div *ngIf="loading()" aria-hidden="true" class="h-48 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="loading()" class="sr-only" role="status">Loading vital signs…</span>

    <boo-error-state *ngIf="!loading() && error() && !readings().length" appearance="panel" [headingLevel]="3"
      title="We couldn't load the vital signs" description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <div *ngIf="!loading() && (!error() || readings().length)" class="flex flex-col gap-4">
      <boo-inline-error *ngIf="error()" what="the vitals history" (retry)="load()" />

      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="m-0 text-sm font-semibold text-regular">Vital signs history</h2>
        <button *ngIf="canWrite" boo-button variant="primary" size="sm" [attr.aria-expanded]="showForm" (click)="showForm = !showForm">
          <physio-icon [name]="showForm ? 'x' : 'plus'" [size]="15" aria-hidden="true" />{{ showForm ? 'Cancel' : 'Record vitals' }}
        </button>
      </div>

      <form *ngIf="canWrite && showForm" [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Record vital signs"
        class="bg-surface border border-borderGray rounded-xl p-4 flex flex-col gap-3">
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <div *ngFor="let f of fields">
            <boo-input [formControlName]="f.key" [name]="f.key" type="number" [label]="f.label + ' (' + f.unit + ')'" [required]="true" />
            <p class="m-0 mt-1 text-xs text-secondary">{{ f.min }}–{{ f.max }} {{ f.unit }}</p>
          </div>
        </div>
        <p class="m-0 text-xs text-secondary">The time and your name are recorded automatically. Abnormal values raise an alert.</p>
        <div class="flex justify-end gap-2">
          <button type="button" boo-button variant="outline" size="sm" [disabled]="saving" (click)="cancel()">Cancel</button>
          <button type="submit" boo-button variant="primary" size="sm" [loading]="saving">Save reading</button>
        </div>
      </form>

      <boo-empty-state *ngIf="!readings().length" icon="activity" title="No vital signs recorded"
        [description]="canWrite ? 'Record the first reading for this patient.' : 'No readings have been recorded for this patient.'" />

      <div *ngIf="readings().length" class="bg-surface border border-borderGray rounded-xl overflow-x-auto">
        <table class="w-full text-sm text-left">
          <caption class="sr-only">Vital signs, newest first</caption>
          <thead class="text-xs text-secondary border-b border-rowDivider">
            <tr>
              <th scope="col" class="px-4 py-2.5 font-medium">Time</th>
              <th scope="col" class="px-4 py-2.5 font-medium">BP (mmHg)</th>
              <th scope="col" class="px-4 py-2.5 font-medium">HR (bpm)</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Temp (°C)</th>
              <th scope="col" class="px-4 py-2.5 font-medium">RR (/min)</th>
              <th scope="col" class="px-4 py-2.5 font-medium">SpO2 (%)</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Flag</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Recorded by</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rowDivider">
            <tr *ngFor="let v of readings(); trackBy: trackById" [ngClass]="v.isAbnormal ? 'bg-amber-50' : ''">
              <th scope="row" class="px-4 py-2.5 font-normal tabular-nums whitespace-nowrap">{{ v.recordedAt | date: 'MMM d, HH:mm' }}</th>
              <td class="px-4 py-2.5 tabular-nums">{{ v.bloodPressureSystolic }}/{{ v.bloodPressureDiastolic }}</td>
              <td class="px-4 py-2.5 tabular-nums">{{ v.heartRate }}</td>
              <td class="px-4 py-2.5 tabular-nums">{{ v.temperature }}</td>
              <td class="px-4 py-2.5 tabular-nums">{{ v.respiratoryRate }}</td>
              <td class="px-4 py-2.5 tabular-nums">{{ v.spo2 }}</td>
              <td class="px-4 py-2.5"><boo-status-badge *ngIf="v.isAbnormal" label="Abnormal" tone="warning" [dotted]="true" /></td>
              <td class="px-4 py-2.5 text-secondary">{{ v.recordedBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <boo-pagination *ngIf="totalPages > 1" [page]="page" [totalPages]="totalPages" (pageChange)="goTo($event)" />
    </div>
  `,
})
export class NursingVitalsTabComponent implements OnChanges {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) patientId!: string;
  @Input() refreshKey = 0;
  @Input() canWrite = false;
  /** A reading was saved, so the patient header (last vitals, alerts) is out of date. */
  @Output() changed = new EventEmitter<void>();

  private readonly srv = inject(NursingService);
  private readonly toastSrv = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  error = signal(false);
  readings = signal<VitalsReading[]>([]);
  page = 1;
  totalPages = 1;

  showForm = false;
  saving = false;
  readonly fields = FIELDS;
  readonly form = this.fb.group(Object.fromEntries(
    FIELDS.map(f => [f.key, this.fb.control<number | string | null>(null, [Validators.required, Validators.min(f.min), Validators.max(f.max)])])
  ));
  // #endregion

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.patientId) return;
    if (changes['patientId']) this.page = 1;
    if (changes['patientId'] || changes['refreshKey']) this.load();
  }

  load(): void {
    // Show the skeleton only while there is nothing to keep on screen.
    if (!this.readings().length) this.loading.set(true);
    this.error.set(false);
    const requested = this.patientId;
    this.srv.getVitals(requested, this.page).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (requested !== this.patientId) return;
        if (!res.success) { this.error.set(true); return; }
        this.readings.set(res.data.items);
        this.totalPages = res.data.totalPages || 1;
      },
      error: () => this.error.set(true),
    });
  }

  goTo(page: number): void {
    if (page === this.page) return;
    this.page = page;
    this.load();
  }

  cancel(): void {
    this.showForm = false;
    this.form.reset();
  }

  submit(): void {
    if (this.saving) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const reading = Object.fromEntries(FIELDS.map(f => [f.key, Number(v[f.key])])) as unknown as AddVitalsRequest;
    this.saving = true;
    this.srv.addVitalsReading(this.patientId, reading).pipe(finalize(() => this.saving = false)).subscribe({
      next: res => {
        // On failure the form keeps what was typed so the nurse can correct and resubmit.
        if (!res.success) { this.toastSrv.error('Unable to save the vital signs'); return; }
        this.toastSrv.success('Vital signs saved');
        this.showForm = false;
        this.form.reset();
        this.page = 1;
        this.load();
        this.changed.emit();
      },
    });
  }

  trackById = (_: number, item: { id: string }) => item.id;
}
