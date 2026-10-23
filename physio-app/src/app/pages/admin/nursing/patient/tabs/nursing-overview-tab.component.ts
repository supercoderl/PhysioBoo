import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from "@angular/core";
import { BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooInlineErrorComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { catchError, finalize, forkJoin, map, Observable, of } from "rxjs";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { PagedResponse, PaginationData } from "../../../../../shared/types/common";
import { IntakeOutputEntry, MarEntry, NursingTask, VitalsReading } from "../../../../../shared/types/nursing.types";

/** `null` when the request failed, so one failing source doesn't blank the others. */
function page<T>(request: Observable<PagedResponse<PaginationData<T>>>): Observable<PaginationData<T> | null> {
  return request.pipe(map(r => r.success ? r.data : null), catchError(() => of(null)));
}

@Component({
  selector: 'nursing-overview-tab',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, DatePipe,
    BooIconComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent, BooStatusBadgeComponent,
  ],
  template: `
    <div *ngIf="loading()" aria-hidden="true" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div class="h-40 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
      <div class="h-40 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    </div>
    <span *ngIf="loading()" class="sr-only" role="status">Loading the overview…</span>

    <boo-error-state *ngIf="!loading() && allFailed()" appearance="panel" [headingLevel]="3"
      title="We couldn't load the overview" description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <div *ngIf="!loading() && !allFailed()" class="flex flex-col gap-4">
      <boo-inline-error *ngIf="someFailed()" what="part of the overview" (retry)="load()" />

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <!-- Medications due -->
        <section class="bg-surface border border-borderGray rounded-xl overflow-hidden" aria-labelledby="ov-meds">
          <h2 id="ov-meds" class="m-0 px-4 py-3 text-sm font-semibold text-regular border-b border-rowDivider flex items-center gap-2">
            <physio-icon name="pill" [size]="16" class="text-secondary" aria-hidden="true" />Medications due
          </h2>
          <p *ngIf="!mar()" class="m-0 px-4 py-6 text-center text-xs text-secondary">Unavailable right now.</p>
          <p *ngIf="mar() && !dueMeds().length" class="m-0 px-4 py-6 text-center text-xs text-secondary">No medications are due.</p>
          <ul *ngIf="dueMeds().length" class="m-0 p-0 list-none divide-y divide-rowDivider">
            <li *ngFor="let m of dueMeds(); trackBy: trackById" class="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <span class="min-w-0 text-regular">{{ m.medicationName }} <span class="text-secondary">· {{ m.dosage }} · {{ m.route }}</span></span>
              <span class="flex-none flex items-center gap-2 tabular-nums text-xs" [ngClass]="isPast(m.scheduledAt) ? 'text-danger font-semibold' : 'text-secondary'">
                <boo-status-badge *ngIf="isPast(m.scheduledAt)" label="Late" tone="danger" />{{ m.scheduledAt | date: 'MMM d, HH:mm' }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Open tasks -->
        <section class="bg-surface border border-borderGray rounded-xl overflow-hidden" aria-labelledby="ov-tasks">
          <h2 id="ov-tasks" class="m-0 px-4 py-3 text-sm font-semibold text-regular border-b border-rowDivider flex items-center gap-2">
            <physio-icon name="clipboard" [size]="16" class="text-secondary" aria-hidden="true" />Open tasks
          </h2>
          <p *ngIf="!tasks()" class="m-0 px-4 py-6 text-center text-xs text-secondary">Unavailable right now.</p>
          <p *ngIf="tasks() && !openTasks().length" class="m-0 px-4 py-6 text-center text-xs text-secondary">No open tasks.</p>
          <ul *ngIf="openTasks().length" class="m-0 p-0 list-none divide-y divide-rowDivider">
            <li *ngFor="let t of openTasks(); trackBy: trackById" class="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <span class="min-w-0 text-regular break-words">{{ t.label }}</span>
              <span class="flex-none flex items-center gap-2 tabular-nums text-xs" [ngClass]="t.status === 'Overdue' ? 'text-danger font-semibold' : 'text-secondary'">
                <boo-status-badge *ngIf="t.status === 'Overdue'" label="Overdue" tone="danger" />{{ t.dueAt | date: 'MMM d, HH:mm' }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Recent vitals -->
        <section class="bg-surface border border-borderGray rounded-xl overflow-hidden" aria-labelledby="ov-vitals">
          <h2 id="ov-vitals" class="m-0 px-4 py-3 text-sm font-semibold text-regular border-b border-rowDivider flex items-center gap-2">
            <physio-icon name="activity" [size]="16" class="text-secondary" aria-hidden="true" />Recent vital signs
          </h2>
          <p *ngIf="!vitals()" class="m-0 px-4 py-6 text-center text-xs text-secondary">Unavailable right now.</p>
          <p *ngIf="vitals() && !recentVitals().length" class="m-0 px-4 py-6 text-center text-xs text-secondary">No readings recorded yet.</p>
          <ul *ngIf="recentVitals().length" class="m-0 p-0 list-none divide-y divide-rowDivider">
            <li *ngFor="let v of recentVitals(); trackBy: trackById" class="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <span class="text-secondary tabular-nums">{{ v.recordedAt | date: 'MMM d, HH:mm' }}</span>
              <span class="flex items-center gap-2 tabular-nums text-regular">
                <boo-status-badge *ngIf="v.isAbnormal" label="Abnormal" tone="warning" [dotted]="true" />
                BP {{ v.bloodPressureSystolic }}/{{ v.bloodPressureDiastolic }} · HR {{ v.heartRate }} · SpO2 {{ v.spo2 }}%
              </span>
            </li>
          </ul>
        </section>

        <!-- Intake and output -->
        <section class="bg-surface border border-borderGray rounded-xl overflow-hidden" aria-labelledby="ov-io">
          <h2 id="ov-io" class="m-0 px-4 py-3 text-sm font-semibold text-regular border-b border-rowDivider flex items-center gap-2">
            <physio-icon name="droplets" [size]="16" class="text-secondary" aria-hidden="true" />Intake &amp; output
          </h2>
          <p *ngIf="!io()" class="m-0 px-4 py-6 text-center text-xs text-secondary">Unavailable right now.</p>
          <p *ngIf="io() && !io()!.items.length" class="m-0 px-4 py-6 text-center text-xs text-secondary">Nothing recorded yet.</p>
          <ng-container *ngIf="io()?.items?.length">
            <dl class="m-0 p-4 grid grid-cols-3 gap-4 text-sm">
              <div><dt class="text-xs text-secondary mb-0.5">Intake</dt><dd class="m-0 font-semibold tabular-nums text-regular">{{ totalIntake() }} mL</dd></div>
              <div><dt class="text-xs text-secondary mb-0.5">Output</dt><dd class="m-0 font-semibold tabular-nums text-regular">{{ totalOutput() }} mL</dd></div>
              <div><dt class="text-xs text-secondary mb-0.5">Balance</dt><dd class="m-0 font-semibold tabular-nums" [ngClass]="balance() >= 0 ? 'text-regular' : 'text-danger'">{{ balance() > 0 ? '+' : '' }}{{ balance() }} mL</dd></div>
            </dl>
            <p class="m-0 px-4 pb-3 text-xs text-secondary">
              Based on the {{ io()!.items.length }} most recent {{ io()!.items.length === 1 ? 'entry' : 'entries' }}<ng-container *ngIf="io()!.totalCount > io()!.items.length"> of {{ io()!.totalCount }}</ng-container>.
            </p>
          </ng-container>
        </section>
      </div>
    </div>
  `,
})
export class NursingOverviewTabComponent implements OnChanges {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) patientId!: string;
  @Input() refreshKey = 0;

  private readonly srv = inject(NursingService);

  loading = signal(true);
  tasks = signal<PaginationData<NursingTask> | null>(null);
  vitals = signal<PaginationData<VitalsReading> | null>(null);
  io = signal<PaginationData<IntakeOutputEntry> | null>(null);
  mar = signal<PaginationData<MarEntry> | null>(null);
  // #endregion

  ngOnChanges(changes: SimpleChanges): void {
    if (this.patientId && (changes['patientId'] || changes['refreshKey'])) this.load();
  }

  load(): void {
    // Keep what is on screen during a refresh; only the first load shows the skeleton.
    if (!this.tasks() && !this.vitals() && !this.io() && !this.mar()) this.loading.set(true);
    const requested = this.patientId;
    forkJoin({
      tasks: page(this.srv.getTasks(requested)),
      vitals: page(this.srv.getVitals(requested)),
      io: page(this.srv.getIntakeOutput(requested)),
      mar: page(this.srv.getMar(requested)),
    }).pipe(finalize(() => this.loading.set(false))).subscribe(r => {
      if (requested !== this.patientId) return;
      this.tasks.set(r.tasks);
      this.vitals.set(r.vitals);
      this.io.set(r.io);
      this.mar.set(r.mar);
    });
  }

  // #region Derived data
  private sources() { return [this.tasks(), this.vitals(), this.io(), this.mar()]; }
  allFailed(): boolean { return this.sources().every(s => !s); }
  someFailed(): boolean { return this.sources().some(s => !s); }

  openTasks(): NursingTask[] { return (this.tasks()?.items ?? []).filter(t => t.status === 'Pending' || t.status === 'Overdue'); }
  dueMeds(): MarEntry[] { return (this.mar()?.items ?? []).filter(m => m.status === 'Due'); }
  recentVitals(): VitalsReading[] { return (this.vitals()?.items ?? []).slice(0, 5); }

  totalIntake(): number { return this.sumOf('Intake'); }
  totalOutput(): number { return this.sumOf('Output'); }
  balance(): number { return this.totalIntake() - this.totalOutput(); }

  private sumOf(direction: IntakeOutputEntry['direction']): number {
    return (this.io()?.items ?? []).filter(e => e.direction === direction).reduce((total, e) => total + e.volumeMl, 0);
  }

  isPast(at: string): boolean { return new Date(at).getTime() < Date.now(); }
  trackById = (_: number, item: { id: string }) => item.id;
  // #endregion
}
