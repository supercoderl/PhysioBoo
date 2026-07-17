import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { QueueEntry, QueueStatus, RadiologyPriority } from "../../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-queue-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !entries().length">
      <boo-empty-state icon="list-ordered" title="The examination queue is empty"></boo-empty-state>
    </div>

    <div *ngIf="!isLoading() && entries().length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <div *ngFor="let col of columns" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase flex items-center justify-between">
          <span>{{ col.label }}</span>
          <span class="text-gray-400">{{ entriesByStatus(col.key).length }}</span>
        </div>
        <div class="p-2 space-y-2 min-h-[100px]">
          <div *ngFor="let e of entriesByStatus(col.key)" class="bg-gray-50 border border-gray-200 rounded-lg p-2.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-gray-800 truncate">{{ e.patientName }}</span>
              <boo-status-badge [label]="e.priority" [tone]="priorityTone(e.priority)"></boo-status-badge>
            </div>
            <div class="text-xs text-gray-500">{{ e.examinationName }} · {{ e.roomName }}</div>
            <div class="text-xs text-gray-400" *ngIf="e.calledAt">Called {{ e.calledAt | date:'shortTime' }}</div>
            <button *ngIf="nextAction(col.key)" (click)="advance(e, nextAction(col.key)!.status)"
              class="mt-2 text-primary text-[11px] font-semibold hover:underline">
              {{ nextAction(col.key)!.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RadiologyQueueTabComponent implements OnInit {
  isLoading = signal(true);
  entries = signal<QueueEntry[]>([]);

  readonly columns: { key: QueueStatus; label: string }[] = [
    { key: 'Waiting', label: 'Waiting' },
    { key: 'Called', label: 'Called' },
    { key: 'InProgress', label: 'In Progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' },
  ];

  constructor(private srv: RadiologyService, private toastSrv: ToastService) { }

  ngOnInit(): void {
    this.srv.getQueue().subscribe({
      next: (res) => { if (res.success) this.entries.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  entriesByStatus(status: QueueStatus): QueueEntry[] {
    return this.entries().filter(e => e.status === status);
  }

  nextAction(status: QueueStatus): { status: QueueStatus; label: string } | null {
    switch (status) {
      case 'Waiting': return { status: 'Called', label: 'Call Next' };
      case 'Called': return { status: 'InProgress', label: 'Start' };
      case 'InProgress': return { status: 'Completed', label: 'Complete' };
      default: return null;
    }
  }

  advance(entry: QueueEntry, status: QueueStatus): void {
    this.srv.advanceQueueEntry(entry.id, status).subscribe(res => {
      if (res.success) {
        this.entries.update(list => list.map(e => e.id === entry.id ? { ...e, status, calledAt: status === 'Called' ? new Date().toISOString() : e.calledAt } : e));
        this.toastSrv.success(`${entry.patientName} moved to ${status}`);
      } else {
        this.toastSrv.error('Unable to update queue entry');
      }
    });
  }

  priorityTone(priority: RadiologyPriority): BadgeTone {
    switch (priority) {
      case 'Stat': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }
}
