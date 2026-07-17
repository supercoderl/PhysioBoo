import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PreOpChecklistItem, SurgeryCase, SurgeryRow, SurgeryStatus } from "../../../../../shared/types/surgery.types";

const QUEUE_STATUSES: SurgeryStatus[] = ['Scheduled', 'PatientArrived', 'PreOpReady', 'AnesthesiaStarted'];

@Component({
  selector: 'surgery-queue-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !queue().length"><boo-empty-state icon="clipboard-check" title="The surgical queue is empty" description="No cases are currently in pre-operative stages."></boo-empty-state></div>

    <div *ngIf="!isLoading() && queue().length" class="space-y-3">
      <div *ngFor="let s of queue()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <button type="button" (click)="toggleExpand(s.id)" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
          <div class="flex items-center gap-4 min-w-0">
            <boo-icon name="user-round" [size]="18" iconClass="text-gray-400 shrink-0"></boo-icon>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-800 truncate">{{ s.surgeryNumber }} · {{ s.procedure }}</div>
              <div class="text-xs text-gray-500 truncate">{{ s.patientName }} ({{ s.mrn }}) · {{ s.operatingRoomNumber }} · {{ s.scheduledStart | date:'shortTime' }}</div>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span *ngIf="checklists[s.id]" class="text-xs font-semibold text-gray-600">{{ completionFraction(s.id) }}</span>
            <boo-status-badge [label]="s.status" [tone]="statusTone(s.status)"></boo-status-badge>
            <boo-icon name="chevron-down" [size]="16" iconClass="text-gray-400 transition-transform" [ngClass]="expanded() === s.id ? 'rotate-180' : ''"></boo-icon>
          </div>
        </button>

        <div *ngIf="expanded() === s.id" class="border-t border-gray-100 px-4 py-4 bg-gray-50">
          <div *ngIf="!checklists[s.id]" class="flex items-center justify-center py-6">
            <boo-icon name="loader" iconClass="w-5 h-5 text-primary animate-spin"></boo-icon>
          </div>

          <div *ngIf="checklists[s.id]" class="space-y-1.5">
            <div *ngFor="let item of checklists[s.id]" class="flex items-center justify-between gap-2 px-3 py-2 bg-surface rounded-md border border-gray-100">
              <div class="flex items-center gap-2 min-w-0">
                <boo-icon [name]="item.status === 'Completed' ? 'check-circle-2' : item.status === 'NotApplicable' ? 'circle-x' : 'clock'"
                  [size]="16" [ngClass]="item.status === 'Completed' ? 'text-emerald-500' : item.status === 'NotApplicable' ? 'text-gray-400' : 'text-amber-500'"></boo-icon>
                <span class="text-sm text-gray-700 truncate" [attr.aria-label]="item.label + ' — ' + item.status">{{ item.label }}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span *ngIf="item.signedBy" class="text-[11px] text-gray-400">{{ item.signedBy }} · {{ item.signedAt | date:'shortTime' }}</span>
                <button *ngIf="item.status === 'Pending'" (click)="signOff(s, item)" class="text-primary text-xs font-semibold hover:underline">Sign Off</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SurgeryQueueTabComponent implements OnInit {
  @Output() viewCase = new EventEmitter<string>();

  isLoading = signal(true);
  queue = signal<SurgeryRow[]>([]);
  expanded = signal<string | null>(null);
  checklists: Record<string, PreOpChecklistItem[]> = {};

  constructor(private srv: SurgeryService, private toastSrv: ToastService, private dialogSrv: DialogService) { }

  ngOnInit(): void {
    this.srv.getCases().subscribe({
      next: (res) => {
        if (res.success) this.queue.set(res.data.items.filter(s => QUEUE_STATUSES.includes(s.status)).sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleExpand(id: string): void {
    const next = this.expanded() === id ? null : id;
    this.expanded.set(next);
    if (next && !this.checklists[next]) {
      this.srv.getCaseDetail(next).subscribe((res: any) => {
        if (res.success) this.checklists[next] = (res.data as SurgeryCase).checklist;
      });
    }
  }

  completionFraction(surgeryId: string): string {
    const items = this.checklists[surgeryId] ?? [];
    const applicable = items.filter(i => i.status !== 'NotApplicable');
    const done = applicable.filter(i => i.status === 'Completed').length;
    return `${done}/${applicable.length}`;
  }

  statusTone(status: SurgeryStatus): BadgeTone {
    switch (status) {
      case 'PreOpReady': case 'AnesthesiaStarted': return 'primary';
      case 'PatientArrived': return 'warning';
      default: return 'neutral';
    }
  }

  signOff(s: SurgeryRow, item: PreOpChecklistItem): void {
    const apply = () => {
      this.srv.updateChecklistItem(s.id, item.id, 'Completed', 'You').subscribe(res => {
        if (res.success) {
          this.checklists[s.id] = this.checklists[s.id].map(i => i.id === item.id ? { ...i, status: 'Completed', signedBy: 'You', signedAt: new Date().toISOString() } : i);
          this.toastSrv.success(`${item.label} signed off`);
        } else {
          this.toastSrv.error('Unable to sign off item');
        }
      });
    };

    if (item.label === 'Timeout Verification') {
      this.dialogSrv.confirm(`Confirm WHO Surgical Safety Checklist timeout for ${s.patientName} — ${s.procedure}?`, apply, 'Timeout Verification');
    } else {
      apply();
    }
  }
}
