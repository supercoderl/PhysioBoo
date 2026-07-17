import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SurgeryCase, SurgeryRow } from "../../../../../shared/types/surgery.types";

@Component({
  selector: 'surgery-intraop-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !cases().length"><boo-empty-state icon="activity" title="No surgeries currently in progress"></boo-empty-state></div>

    <div *ngIf="!isLoading() && cases().length" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div *ngFor="let s of cases()" class="bg-surface border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <div class="text-sm font-semibold text-gray-800">{{ s.surgeryNumber }} · {{ s.procedure }}</div>
            <div class="text-xs text-gray-500">{{ s.patientName }} · {{ s.operatingRoomNumber }} · {{ s.primarySurgeon }}</div>
          </div>
          <button (click)="viewCase.emit(s.id)" class="text-primary text-xs font-semibold hover:underline">View Details</button>
        </div>

        <div class="mb-3">
          <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span [ngClass]="isOverrunning(s) ? 'text-rose-600 font-semibold' : ''">{{ isOverrunning(s) ? 'Overrunning' : remainingLabel(s) }}</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full" [ngClass]="isOverrunning(s) ? 'bg-rose-500' : 'bg-amber-500'" [style.width.%]="progressPct(s)"></div>
          </div>
        </div>

        <div *ngIf="detail[s.id]" class="grid grid-cols-2 gap-3 text-xs mb-3">
          <div><span class="text-gray-400">Blood Loss</span><div class="font-medium text-gray-700">{{ detail[s.id].bloodLossMl ?? '—' }} mL</div></div>
          <div><span class="text-gray-400">Complications</span><div class="font-medium text-gray-700">{{ detail[s.id].complications ?? 'None reported' }}</div></div>
        </div>

        <div *ngIf="detail[s.id]" class="mb-3">
          <div class="text-xs text-gray-400 mb-1">Surgical Team</div>
          <div class="flex flex-wrap gap-1.5">
            <span *ngFor="let m of detail[s.id].team" class="px-2 py-0.5 bg-gray-100 rounded-full text-[11px] text-gray-600">{{ m.name }} · {{ m.role }}</span>
          </div>
        </div>

        <div *ngIf="detail[s.id]?.notes" class="text-xs text-gray-600 bg-gray-50 rounded-md p-2">{{ detail[s.id].notes }}</div>
      </div>
    </div>
  `,
})
export class SurgeryIntraopTabComponent implements OnInit {
  @Output() viewCase = new EventEmitter<string>();

  isLoading = signal(true);
  cases = signal<SurgeryRow[]>([]);
  detail: Record<string, SurgeryCase> = {};

  constructor(private srv: SurgeryService) { }

  ngOnInit(): void {
    this.srv.getCases().subscribe({
      next: (res) => {
        if (res.success) {
          const list = res.data.items.filter(s => s.status === 'InProgress');
          this.cases.set(list);
          for (const s of list) {
            this.srv.getCaseDetail(s.id).subscribe((d: any) => { if (d.success) this.detail[s.id] = d.data; });
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  progressPct(s: SurgeryRow): number {
    const remaining = this.detail[s.id]?.estimatedRemainingMinutes;
    if (remaining == null) return 50;
    const pct = ((s.estimatedDurationMinutes - remaining) / s.estimatedDurationMinutes) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }

  isOverrunning(s: SurgeryRow): boolean {
    const remaining = this.detail[s.id]?.estimatedRemainingMinutes;
    return remaining != null && remaining <= 0;
  }

  remainingLabel(s: SurgeryRow): string {
    const remaining = this.detail[s.id]?.estimatedRemainingMinutes;
    return remaining != null ? `~${remaining} min remaining` : 'Tracking…';
  }
}
