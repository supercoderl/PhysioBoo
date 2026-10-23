import { DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from "@angular/core";
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent, BooPaginationComponent
} from '@physioboo/ui';
import { finalize } from "rxjs";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { NursingTask } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-tasks-tab',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, DatePipe,
    BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent, BooPaginationComponent,
  ],
  template: `
    <div *ngIf="loading()" aria-hidden="true" class="h-48 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="loading()" class="sr-only" role="status">Loading tasks…</span>

    <boo-error-state *ngIf="!loading() && error() && !tasks().length" appearance="panel" [headingLevel]="3"
      title="We couldn't load the tasks" description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <div *ngIf="!loading() && (!error() || tasks().length)" class="flex flex-col gap-4">
      <boo-inline-error *ngIf="error()" what="the task list" (retry)="load()" />

      <boo-empty-state *ngIf="!tasks().length" icon="clipboard" title="No nursing tasks" description="No tasks have been created for this patient." />

      <section *ngFor="let group of groups()" [hidden]="!group.items.length" class="bg-surface border border-borderGray rounded-xl overflow-hidden">
        <h2 class="m-0 px-4 py-3 text-sm font-semibold border-b border-rowDivider" [ngClass]="group.key === 'Overdue' ? 'text-danger' : 'text-regular'">
          {{ group.key }} <span class="text-xs font-normal text-secondary tabular-nums">({{ group.items.length }})</span>
        </h2>
        <ul class="m-0 p-0 list-none divide-y divide-rowDivider">
          <li *ngFor="let t of group.items; trackBy: trackById" class="px-4 py-2.5 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm break-words" [ngClass]="t.status === 'Completed' || t.status === 'Cancelled' ? 'text-secondary line-through' : 'text-regular'">{{ t.label }}</div>
              <div class="text-xs text-secondary tabular-nums">
                <span *ngIf="t.status === 'Overdue'" class="font-semibold text-danger">Overdue · </span>Due {{ t.dueAt | date: 'MMM d, HH:mm' }}
                <ng-container *ngIf="t.assignedNurseName"> · {{ t.assignedNurseName }}</ng-container>
              </div>
            </div>
            <button *ngIf="canWrite && (t.status === 'Pending' || t.status === 'Overdue')" boo-button variant="outline" size="sm" class="flex-none"
              [loading]="busy.has(t.id)" (click)="confirmComplete(t)">
              Complete<span class="sr-only"> {{ t.label }}</span>
            </button>
          </li>
        </ul>
      </section>

      <boo-pagination *ngIf="totalPages > 1" [page]="page" [totalPages]="totalPages" (pageChange)="goTo($event)" />
    </div>
  `,
})
export class NursingTasksTabComponent implements OnChanges {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) patientId!: string;
  @Input() refreshKey = 0;
  @Input() canWrite = false;
  /** A task was completed, so the patient header (next task) is out of date. */
  @Output() changed = new EventEmitter<void>();

  private readonly srv = inject(NursingService);
  private readonly toastSrv = inject(ToastService);
  private readonly dialogSrv = inject(DialogService);

  loading = signal(true);
  error = signal(false);
  tasks = signal<NursingTask[]>([]);
  page = 1;
  totalPages = 1;
  /** Tasks with a request in flight; a second click on the same task is ignored. */
  busy = new Set<string>();
  // #endregion

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.patientId) return;
    if (changes['patientId']) this.page = 1;
    if (changes['patientId'] || changes['refreshKey']) this.load();
  }

  load(): void {
    if (!this.tasks().length) this.loading.set(true);
    this.error.set(false);
    const requested = this.patientId;
    this.srv.getTasks(requested, this.page).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (requested !== this.patientId) return;
        if (!res.success) { this.error.set(true); return; }
        this.tasks.set(res.data.items);
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

  groups() {
    const all = this.tasks();
    return [
      { key: 'Overdue', items: all.filter(t => t.status === 'Overdue') },
      { key: 'Pending', items: all.filter(t => t.status === 'Pending') },
      { key: 'Completed', items: all.filter(t => t.status === 'Completed') },
      { key: 'Cancelled', items: all.filter(t => t.status === 'Cancelled') },
    ];
  }

  confirmComplete(task: NursingTask): void {
    this.dialogSrv.confirm(
      `Mark "${task.label}" as completed?`,
      () => this.complete(task),
      'Complete task',
      'warning',
      'Complete',
    );
  }

  private complete(task: NursingTask): void {
    if (this.busy.has(task.id)) return;
    this.busy = new Set(this.busy).add(task.id);
    this.srv.updateTaskStatus(task.id, 'Completed').pipe(
      finalize(() => {
        const next = new Set(this.busy);
        next.delete(task.id);
        this.busy = next;
      })
    ).subscribe({
      next: res => {
        if (!res.success || !res.data) { this.toastSrv.error('Unable to complete the task'); return; }
        this.tasks.set(this.tasks().map(t => t.id === task.id ? res.data : t));
        this.toastSrv.success('Task completed');
        this.changed.emit();
      },
    });
  }

  trackById = (_: number, item: { id: string }) => item.id;
}
