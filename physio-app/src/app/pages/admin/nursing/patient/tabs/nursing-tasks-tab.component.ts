import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { NursingTask } from "../../../../../shared/types/nursing.types";

@Component({
  selector: 'nursing-tasks-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()" class="space-y-4">
      <section *ngFor="let group of groups()" class="bg-surface border border-gray-200 rounded-lg">
        <header class="px-5 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold m-0" [ngClass]="group.key === 'Overdue' ? 'text-red-600' : 'text-primary'">
            {{ group.key }} <span class="text-xs text-secondary font-normal">({{ group.items.length }})</span>
          </h3>
        </header>
        <ul class="divide-y divide-gray-100 m-0 p-0 list-none">
          <li *ngFor="let t of group.items" class="px-5 py-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm" [ngClass]="t.status === 'Completed' ? 'text-secondary line-through' : 'text-primary'">{{ t.label }}</div>
              <div class="text-xs text-secondary">{{ t.dueAt | date:'short' }} · {{ t.assignedNurseName }}</div>
            </div>
            <button *ngIf="t.status === 'Pending' || t.status === 'Overdue'" (click)="complete(t)" [disabled]="loadingSrv.isLoading('task-' + t.id)"
              class="shrink-0 px-2.5 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:opacity-50">
              Complete
            </button>
          </li>
        </ul>
        <div *ngIf="!group.items.length" class="px-5 py-4 text-center text-xs text-secondary">None.</div>
      </section>
    </div>
  `,
})
export class NursingTasksTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  tasks = signal<NursingTask[]>([]);

  constructor(private srv: NursingService, private toastSrv: ToastService, protected loadingSrv: LocalLoadingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getTasks(this.patientId).subscribe({
      next: (res) => { if (res.success) this.tasks.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  groups() {
    const all = this.tasks();
    return [
      { key: 'Overdue', items: all.filter(t => t.status === 'Overdue') },
      { key: 'Pending', items: all.filter(t => t.status === 'Pending') },
      { key: 'Completed', items: all.filter(t => t.status === 'Completed') },
    ];
  }

  complete(task: NursingTask): void {
    const key = 'task-' + task.id;
    this.loadingSrv.setLoading(key, true);
    this.srv.updateTaskStatus(task.id, 'Completed').subscribe({
      next: (res) => {
        this.loadingSrv.setLoading(key, false);
        if (res.success) {
          this.tasks.set(this.tasks().map(t => t.id === task.id ? { ...t, status: 'Completed' } : t));
          this.toastSrv.success('Task completed');
        } else {
          this.toastSrv.error('Unable to complete task');
        }
      },
      error: () => { this.loadingSrv.setLoading(key, false); this.toastSrv.error('Unable to complete task'); },
    });
  }
}
