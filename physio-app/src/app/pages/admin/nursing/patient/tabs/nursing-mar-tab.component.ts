import { DatePipe, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import {
  BooBadgeTone, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent,
  BooInlineErrorComponent, BooPaginationComponent, BooStatusBadgeComponent
} from '@physioboo/ui';
import { finalize } from "rxjs";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { MarEntry } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-mar-tab',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe,
    BooButtonComponent, BooIconComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent,
    BooPaginationComponent, BooStatusBadgeComponent,
  ],
  template: `
    <div *ngIf="loading()" aria-hidden="true" class="h-48 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="loading()" class="sr-only" role="status">Loading medications…</span>

    <boo-error-state *ngIf="!loading() && error() && !entries().length" appearance="panel" [headingLevel]="3"
      title="We couldn't load the medications" description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <div *ngIf="!loading() && (!error() || entries().length)" class="flex flex-col gap-4">
      <boo-inline-error *ngIf="error()" what="the medication record" (retry)="load()" />

      <div *ngIf="hasAllergies" role="note" class="px-4 py-2.5 rounded-lg border border-dangerBorder bg-dangerSoft text-sm text-danger flex items-start gap-2">
        <physio-icon name="triangle-alert" [size]="16" class="flex-none mt-0.5" aria-hidden="true" />
        <span>This patient has a recorded allergy. Check it before giving any medication.</span>
      </div>

      <h2 class="m-0 text-sm font-semibold text-regular">Medication administration record</h2>

      <boo-empty-state *ngIf="!entries().length" icon="pill" title="No medications scheduled" description="No doses have been scheduled for this patient." />

      <div *ngIf="entries().length" class="bg-surface border border-borderGray rounded-xl overflow-x-auto">
        <table class="w-full text-sm text-left">
          <caption class="sr-only">Medication doses, newest first</caption>
          <thead class="text-xs text-secondary border-b border-rowDivider">
            <tr>
              <th scope="col" class="px-4 py-2.5 font-medium">Medication</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Dose</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Route</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Scheduled</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Status</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Administered</th>
              <th scope="col" class="px-4 py-2.5 font-medium">Note</th>
              <th *ngIf="canWrite" scope="col" class="px-4 py-2.5 font-medium"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rowDivider">
            <tr *ngFor="let m of entries(); trackBy: trackById">
              <th scope="row" class="px-4 py-2.5 font-medium text-regular">{{ m.medicationName }}</th>
              <td class="px-4 py-2.5">{{ m.dosage }}</td>
              <td class="px-4 py-2.5">{{ m.route }}</td>
              <td class="px-4 py-2.5 tabular-nums whitespace-nowrap">{{ m.scheduledAt | date: 'MMM d, HH:mm' }}</td>
              <td class="px-4 py-2.5">
                <div class="flex flex-wrap gap-1">
                  <boo-status-badge [label]="m.status" [tone]="statusTone(m.status)" [dotted]="true" />
                  <boo-status-badge *ngIf="isLate(m)" label="Late" tone="danger" />
                </div>
              </td>
              <td class="px-4 py-2.5 text-secondary">
                <ng-container *ngIf="m.givenBy || m.givenAt; else none">
                  <span class="tabular-nums" *ngIf="m.givenAt">{{ m.givenAt | date: 'MMM d, HH:mm' }}</span>
                  <span *ngIf="m.givenBy"> · {{ m.givenBy }}</span>
                </ng-container>
                <ng-template #none>—</ng-template>
              </td>
              <td class="px-4 py-2.5 text-secondary">{{ m.reason || '—' }}</td>
              <td *ngIf="canWrite" class="px-4 py-2.5">
                <div *ngIf="m.status === 'Due'" class="flex justify-end gap-1.5">
                  <button boo-button variant="primary" size="sm" [loading]="busy.has(m.id)" [disabled]="busy.has(m.id)" (click)="confirmGiven(m)">
                    Given<span class="sr-only"> {{ m.medicationName }}</span>
                  </button>
                  <button boo-button variant="outline" size="sm" [disabled]="busy.has(m.id)" (click)="confirmMissed(m)">
                    Missed<span class="sr-only"> {{ m.medicationName }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <boo-pagination *ngIf="totalPages > 1" [page]="page" [totalPages]="totalPages" (pageChange)="goTo($event)" />
    </div>
  `,
})
export class NursingMarTabComponent implements OnChanges {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) patientId!: string;
  @Input() refreshKey = 0;
  @Input() canWrite = false;
  @Input() hasAllergies = false;
  /** A dose was recorded, so the patient header (medications due) is out of date. */
  @Output() changed = new EventEmitter<void>();

  private readonly srv = inject(NursingService);
  private readonly toastSrv = inject(ToastService);
  private readonly dialogSrv = inject(DialogService);

  loading = signal(true);
  error = signal(false);
  entries = signal<MarEntry[]>([]);
  page = 1;
  totalPages = 1;
  /** Doses with a request in flight; a second click on the same dose is ignored. */
  busy = new Set<string>();
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
    this.srv.getMar(requested, this.page).pipe(finalize(() => this.loading.set(false))).subscribe({
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

  statusTone(status: MarEntry['status']): BooBadgeTone {
    switch (status) {
      case 'Given': return 'success';
      case 'Missed': return 'danger';
      case 'Held': return 'warning';
      default: return 'primary';
    }
  }

  isLate(entry: MarEntry): boolean {
    return entry.status === 'Due' && new Date(entry.scheduledAt).getTime() < Date.now();
  }

  // #region Recording a dose
  confirmGiven(entry: MarEntry): void {
    this.dialogSrv.confirm(
      `Confirm you gave ${entry.medicationName}, ${entry.dosage} by ${entry.route}.${this.hasAllergies ? ' This patient has a recorded allergy.' : ''}`,
      () => this.updateStatus(entry, 'Given'),
      'Record dose as given?',
      'warning',
      'Mark given',
    );
  }

  confirmMissed(entry: MarEntry): void {
    this.dialogSrv.confirm(
      `Confirm ${entry.medicationName} (${entry.dosage}) was not given.`,
      () => this.updateStatus(entry, 'Missed'),
      'Record dose as missed?',
      'warning',
      'Mark missed',
    );
  }

  private updateStatus(entry: MarEntry, status: 'Given' | 'Missed'): void {
    if (this.busy.has(entry.id)) return;
    this.busy = new Set(this.busy).add(entry.id);
    this.srv.updateMarStatus(entry.id, status).pipe(
      finalize(() => {
        const next = new Set(this.busy);
        next.delete(entry.id);
        this.busy = next;
      })
    ).subscribe({
      next: res => {
        if (!res.success || !res.data) { this.toastSrv.error('Unable to update the dose'); return; }
        // The server stamps the time and the nurse, so show what it returned.
        this.entries.set(this.entries().map(e => e.id === entry.id ? res.data : e));
        this.toastSrv.success(`Dose marked as ${status.toLowerCase()}`);
        this.changed.emit();
      },
    });
  }
  // #endregion

  trackById = (_: number, item: { id: string }) => item.id;
}
