import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooInlineErrorComponent,
  BooInputComponent, BooPaginationComponent
} from '@physioboo/ui';
import { finalize } from "rxjs";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { IntakeOutputCategory, IntakeOutputDirection, IntakeOutputEntry } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-io-tab',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, DatePipe, ReactiveFormsModule,
    BooButtonComponent, BooIconComponent, BooInputComponent, BooSelectComponent, BooEmptyStateComponent,
    BooErrorStateComponent, BooInlineErrorComponent, BooPaginationComponent,
  ],
  template: `
    <div *ngIf="loading()" aria-hidden="true" class="h-48 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="loading()" class="sr-only" role="status">Loading intake and output…</span>

    <boo-error-state *ngIf="!loading() && error() && !entries().length" appearance="panel" [headingLevel]="3"
      title="We couldn't load intake and output" description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <div *ngIf="!loading() && (!error() || entries().length)" class="flex flex-col gap-4">
      <boo-inline-error *ngIf="error()" what="the intake and output log" (retry)="load()" />

      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="m-0 text-sm font-semibold text-regular">Intake &amp; output</h2>
          <p *ngIf="entries().length" class="m-0 mt-0.5 text-xs text-secondary">
            Balance of the entries shown{{ totalPages > 1 ? ' (this page only)' : '' }}:
            <span class="font-semibold tabular-nums" [ngClass]="balance() >= 0 ? 'text-regular' : 'text-danger'">{{ balance() > 0 ? '+' : '' }}{{ balance() }} mL</span>
            (intake {{ totalIntake() }} mL, output {{ totalOutput() }} mL)
          </p>
        </div>
        <button *ngIf="canWrite" boo-button variant="primary" size="sm" [attr.aria-expanded]="showForm" (click)="showForm = !showForm">
          <physio-icon [name]="showForm ? 'x' : 'plus'" [size]="15" aria-hidden="true" />{{ showForm ? 'Cancel' : 'Add entry' }}
        </button>
      </div>

      <form *ngIf="canWrite && showForm" [formGroup]="form" (ngSubmit)="submit()" novalidate aria-label="Record intake or output"
        class="bg-surface border border-borderGray rounded-xl p-4 flex flex-col gap-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <boo-select label="Direction" formControlName="direction" [options]="directionOptions" bindLabel="label" bindValue="value" [required]="true" />
          <boo-select label="Category" formControlName="category" [options]="categoryOptions" bindLabel="label" bindValue="value" [required]="true" />
          <div>
            <boo-input label="Volume (mL)" name="volumeMl" type="number" formControlName="volumeMl" [required]="true" />
            <p class="m-0 mt-1 text-xs text-secondary">1–10,000 mL</p>
          </div>
          <boo-input label="Notes (optional)" name="notes" formControlName="notes" [maxlength]="500" />
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" boo-button variant="outline" size="sm" [disabled]="saving" (click)="cancel()">Cancel</button>
          <button type="submit" boo-button variant="primary" size="sm" [loading]="saving">Save entry</button>
        </div>
      </form>

      <boo-empty-state *ngIf="!entries().length" icon="droplets" title="Nothing recorded"
        [description]="canWrite ? 'Record the first intake or output entry for this patient.' : 'No intake or output has been recorded for this patient.'" />

      <div *ngIf="entries().length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section *ngFor="let group of groups()" class="bg-surface border border-borderGray rounded-xl overflow-hidden" [attr.aria-label]="group.label">
          <h3 class="m-0 px-4 py-3 text-sm font-semibold text-regular border-b border-rowDivider">
            {{ group.label }} <span class="text-xs font-normal text-secondary tabular-nums">· {{ group.total }} mL</span>
          </h3>
          <p *ngIf="!group.items.length" class="m-0 px-4 py-6 text-center text-xs text-secondary">None recorded{{ totalPages > 1 ? ' on this page' : '' }}.</p>
          <ul *ngIf="group.items.length" class="m-0 p-0 list-none divide-y divide-rowDivider">
            <li *ngFor="let e of group.items; trackBy: trackById" class="px-4 py-2.5 flex items-start justify-between gap-3 text-sm">
              <div class="min-w-0">
                <div class="text-regular">{{ e.category }} <span class="text-secondary tabular-nums">· {{ e.recordedAt | date: 'MMM d, HH:mm' }}</span></div>
                <div class="text-xs text-secondary">{{ e.recordedBy }}<ng-container *ngIf="e.notes"> · {{ e.notes }}</ng-container></div>
              </div>
              <span class="flex-none font-semibold tabular-nums text-regular">{{ e.volumeMl }} mL</span>
            </li>
          </ul>
        </section>
      </div>

      <boo-pagination *ngIf="totalPages > 1" [page]="page" [totalPages]="totalPages" (pageChange)="goTo($event)" />
    </div>
  `,
})
export class NursingIoTabComponent implements OnChanges {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) patientId!: string;
  @Input() refreshKey = 0;
  @Input() canWrite = false;

  private readonly srv = inject(NursingService);
  private readonly toastSrv = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  loading = signal(true);
  error = signal(false);
  entries = signal<IntakeOutputEntry[]>([]);
  page = 1;
  totalPages = 1;

  showForm = false;
  saving = false;
  readonly form = this.fb.group({
    direction: this.fb.control<IntakeOutputDirection | null>(null, Validators.required),
    category: this.fb.control<IntakeOutputCategory | null>(null, Validators.required),
    volumeMl: this.fb.control<number | string | null>(null, [Validators.required, Validators.min(1), Validators.max(10000)]),
    notes: this.fb.control<string | null>(null, Validators.maxLength(500)),
  });

  readonly directionOptions: { label: string; value: IntakeOutputDirection }[] = [
    { label: 'Intake', value: 'Intake' }, { label: 'Output', value: 'Output' },
  ];
  readonly categoryOptions: { label: string; value: IntakeOutputCategory }[] = [
    { label: 'Oral', value: 'Oral' }, { label: 'IV', value: 'IV' }, { label: 'Urine', value: 'Urine' },
    { label: 'Drain', value: 'Drain' }, { label: 'Other', value: 'Other' },
  ];
  // #endregion

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.patientId) return;
    if (changes['patientId']) this.page = 1;
    if (changes['patientId'] || changes['refreshKey']) this.load();
  }

  load(): void {
    if (!this.entries().length) this.loading.set(true);
    this.error.set(false);
    const requested = this.patientId;
    this.srv.getIntakeOutput(requested, this.page).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (requested !== this.patientId) return;
        if (!res.success) { this.error.set(true); return; }
        this.entries.set(res.data.items);
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

  // #region Derived data
  groups() {
    const all = this.entries();
    const intake = all.filter(e => e.direction === 'Intake');
    const output = all.filter(e => e.direction === 'Output');
    return [
      { label: 'Intake', items: intake, total: this.sum(intake) },
      { label: 'Output', items: output, total: this.sum(output) },
    ];
  }

  totalIntake(): number { return this.sum(this.entries().filter(e => e.direction === 'Intake')); }
  totalOutput(): number { return this.sum(this.entries().filter(e => e.direction === 'Output')); }
  balance(): number { return this.totalIntake() - this.totalOutput(); }

  private sum(items: IntakeOutputEntry[]): number { return items.reduce((total, e) => total + e.volumeMl, 0); }
  // #endregion

  cancel(): void {
    this.showForm = false;
    this.form.reset();
  }

  submit(): void {
    if (this.saving) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    this.saving = true;
    this.srv.addIntakeOutputEntry(this.patientId, {
      direction: v.direction!,
      category: v.category!,
      volumeMl: Number(v.volumeMl),
      notes: v.notes?.trim() || null,
    }).pipe(finalize(() => this.saving = false)).subscribe({
      next: res => {
        // On failure the form keeps what was typed so the nurse can correct and resubmit.
        if (!res.success) { this.toastSrv.error('Unable to record the entry'); return; }
        this.toastSrv.success('Entry recorded');
        this.showForm = false;
        this.form.reset();
        this.page = 1;
        this.load();
      },
    });
  }

  trackById = (_: number, item: { id: string }) => item.id;
}
