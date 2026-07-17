import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SurgeryPriority, SurgeryRow, SurgeryStatus } from "../../../../../shared/types/surgery.types";

type ViewMode = 'table' | 'timeline' | 'calendar';

@Component({
  selector: 'surgery-schedule-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, BooSelectComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-center gap-3">
        <boo-input label="Search surgery #, patient, MRN..." size="small" (search)="onSearch($event)"></boo-input>
        <boo-select label="Priority" [(ngModel)]="priorityFilter" [options]="priorityOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-select label="Status" [(ngModel)]="statusFilter" [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>
        <button (click)="emergencyOnly = !emergencyOnly"
          class="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
          [ngClass]="emergencyOnly ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-surface border-gray-200 text-gray-600'">
          Emergency Only
        </button>
      </div>

      <div class="flex items-center bg-gray-100 rounded-lg p-0.5">
        <button *ngFor="let v of viewModes" type="button" (click)="viewMode.set(v.key)"
          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          [ngClass]="viewMode() === v.key ? 'bg-surface text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          <boo-icon [name]="v.icon" [size]="14"></boo-icon> {{ v.label }}
        </button>
      </div>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !filtered().length">
      <boo-empty-state icon="list-filter" title="No surgeries match these filters">
        <button (click)="clearFilters()" class="text-primary text-xs font-semibold hover:underline">Clear Filters</button>
      </boo-empty-state>
    </div>

    <!-- Table view -->
    <div *ngIf="!isLoading() && filtered().length && viewMode() === 'table'" class="bg-surface border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Surgery #</th>
            <th class="px-4 py-3 text-left">Patient</th>
            <th class="px-4 py-3 text-left">Procedure</th>
            <th class="px-4 py-3 text-left">Surgeon</th>
            <th class="px-4 py-3 text-left">OR</th>
            <th class="px-4 py-3 text-left">Scheduled</th>
            <th class="px-4 py-3 text-left">Duration</th>
            <th class="px-4 py-3 text-left">Priority</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let s of filtered()" class="hover:bg-gray-50" [ngClass]="hasConflict(s) ? 'bg-rose-50' : ''">
            <td class="px-4 py-3 font-medium text-gray-800">{{ s.surgeryNumber }}</td>
            <td class="px-4 py-3">{{ s.patientName }}<div class="text-xs text-gray-400">{{ s.mrn }}</div></td>
            <td class="px-4 py-3 text-gray-700">{{ s.procedure }}</td>
            <td class="px-4 py-3 text-gray-500">{{ s.primarySurgeon }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">{{ s.operatingRoomNumber }}
                <boo-icon *ngIf="hasConflict(s)" name="alert-triangle" [size]="12" iconClass="text-rose-500"></boo-icon>
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ s.scheduledStart | date:'short' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ s.estimatedDurationMinutes }} min</td>
            <td class="px-4 py-3"><boo-status-badge [label]="s.priority" [tone]="priorityTone(s.priority)"></boo-status-badge></td>
            <td class="px-4 py-3"><boo-status-badge [label]="s.status" [tone]="statusTone(s.status)"></boo-status-badge></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <button (click)="viewCase.emit(s.id)" class="text-primary text-xs font-semibold hover:underline">View</button>
                <button *ngIf="s.status !== 'Cancelled' && s.status !== 'Discharged'" (click)="cancel(s)" class="text-rose-600 text-xs font-semibold hover:underline">Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Timeline view: per-room swimlane for today -->
    <div *ngIf="!isLoading() && filtered().length && viewMode() === 'timeline'" class="bg-surface border border-gray-200 rounded-lg p-4 overflow-x-auto">
      <div class="min-w-[900px]">
        <div class="flex items-center text-[11px] text-gray-400 pl-28 mb-2">
          <span *ngFor="let h of hourMarks" class="flex-1 text-center">{{ h }}</span>
        </div>
        <div *ngFor="let lane of timelineLanes()" class="flex items-center mb-2">
          <span class="w-28 shrink-0 text-xs font-semibold text-gray-700">{{ lane.room }}</span>
          <div class="relative flex-1 h-10 bg-gray-50 rounded-md border border-gray-100">
            <div *ngFor="let s of lane.items" class="absolute top-1 bottom-1 rounded-md px-2 flex items-center text-[11px] font-medium text-white overflow-hidden whitespace-nowrap"
              [ngClass]="hasConflict(s) ? 'ring-2 ring-rose-500' : ''"
              [style.left.%]="timelineLeft(s)" [style.width.%]="timelineWidth(s)"
              [ngStyle]="{ background: timelineColor(s.status) }"
              [title]="s.surgeryNumber + ' — ' + s.procedure"
              (click)="viewCase.emit(s.id)">
              {{ s.procedure }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendar view: surgeries grouped by day -->
    <div *ngIf="!isLoading() && filtered().length && viewMode() === 'calendar'" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
      <div *ngFor="let day of calendarDays()" class="bg-surface border border-gray-200 rounded-lg p-3 min-h-[140px]">
        <div class="text-xs font-semibold text-gray-700 mb-2">{{ day.label }}</div>
        <div *ngIf="!day.items.length" class="text-[11px] text-gray-400">No surgeries</div>
        <button *ngFor="let s of day.items" type="button" (click)="viewCase.emit(s.id)"
          class="w-full text-left mb-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium hover:opacity-90 transition-opacity"
          [ngStyle]="{ background: timelineColor(s.status) + '22', color: timelineColor(s.status) }">
          {{ s.scheduledStart | date:'shortTime' }} · {{ s.patientName }} · {{ s.operatingRoomNumber }}
        </button>
      </div>
    </div>
  `,
})
export class SurgeryScheduleTabComponent implements OnInit {
  @Output() viewCase = new EventEmitter<string>();

  isLoading = signal(true);
  cases = signal<SurgeryRow[]>([]);
  viewMode = signal<ViewMode>('table');

  search = '';
  priorityFilter: SurgeryPriority | null = null;
  statusFilter: SurgeryStatus | null = null;
  emergencyOnly = false;

  readonly hourMarks = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  readonly viewModes: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'table', label: 'Table', icon: 'rows-4' },
    { key: 'timeline', label: 'Timeline', icon: 'bar-chart-3' },
    { key: 'calendar', label: 'Calendar', icon: 'calendar-days' },
  ];

  readonly priorityOptions: { label: string; value: SurgeryPriority | null }[] = [
    { label: 'All Priorities', value: null },
    { label: 'Elective', value: 'Elective' }, { label: 'Urgent', value: 'Urgent' }, { label: 'Emergency', value: 'Emergency' },
  ];
  readonly statusOptions: { label: string; value: SurgeryStatus | null }[] = [
    { label: 'All Statuses', value: null },
    { label: 'Scheduled', value: 'Scheduled' }, { label: 'Patient Arrived', value: 'PatientArrived' },
    { label: 'Pre-Op Ready', value: 'PreOpReady' }, { label: 'Anesthesia Started', value: 'AnesthesiaStarted' },
    { label: 'In Progress', value: 'InProgress' }, { label: 'Procedure Completed', value: 'ProcedureCompleted' },
    { label: 'Recovery', value: 'Recovery' }, { label: 'Discharged', value: 'Discharged' },
    { label: 'Delayed', value: 'Delayed' }, { label: 'Cancelled', value: 'Cancelled' },
  ];

  constructor(private srv: SurgeryService, private toastSrv: ToastService, private dialogSrv: DialogService) { }

  ngOnInit(): void {
    this.srv.getCases().subscribe({
      next: (res) => { if (res.success) this.cases.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  onSearch(query: string): void { this.search = query; }

  clearFilters(): void {
    this.search = '';
    this.priorityFilter = null;
    this.statusFilter = null;
    this.emergencyOnly = false;
  }

  filtered(): SurgeryRow[] {
    let list = this.cases();
    if (this.priorityFilter) list = list.filter(s => s.priority === this.priorityFilter);
    if (this.statusFilter) list = list.filter(s => s.status === this.statusFilter);
    if (this.emergencyOnly) list = list.filter(s => s.priority === 'Emergency');
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(s => s.surgeryNumber.toLowerCase().includes(q) || s.patientName.toLowerCase().includes(q) || s.mrn.toLowerCase().includes(q));
    }
    return list;
  }

  hasConflict(s: SurgeryRow): boolean {
    const start = new Date(s.scheduledStart).getTime();
    const end = start + s.estimatedDurationMinutes * 60_000;
    return this.cases().some(other => {
      if (other.id === s.id || other.operatingRoomNumber !== s.operatingRoomNumber) return false;
      const oStart = new Date(other.scheduledStart).getTime();
      const oEnd = oStart + other.estimatedDurationMinutes * 60_000;
      return start < oEnd && oStart < end;
    });
  }

  timelineLanes(): { room: string; items: SurgeryRow[] }[] {
    const map = new Map<string, SurgeryRow[]>();
    for (const s of this.filtered()) map.set(s.operatingRoomNumber, [...(map.get(s.operatingRoomNumber) ?? []), s]);
    return Array.from(map.entries()).map(([room, items]) => ({ room, items })).sort((a, b) => a.room.localeCompare(b.room));
  }

  private dayBounds(): { start: number; spanMs: number } {
    const start = new Date(); start.setHours(6, 0, 0, 0);
    const end = new Date(); end.setHours(22, 0, 0, 0);
    return { start: start.getTime(), spanMs: end.getTime() - start.getTime() };
  }

  timelineLeft(s: SurgeryRow): number {
    const { start, spanMs } = this.dayBounds();
    const pos = ((new Date(s.scheduledStart).getTime() - start) / spanMs) * 100;
    return Math.max(0, Math.min(96, pos));
  }

  timelineWidth(s: SurgeryRow): number {
    const { spanMs } = this.dayBounds();
    return Math.max(4, Math.min(100, (s.estimatedDurationMinutes * 60_000 / spanMs) * 100));
  }

  timelineColor(status: SurgeryStatus): string {
    switch (status) {
      case 'InProgress': return 'rgb(217 119 6)';
      case 'Delayed': case 'Cancelled': return 'rgb(225 29 72)';
      case 'Recovery': case 'ProcedureCompleted': case 'AnesthesiaStarted': case 'PreOpReady': return 'rgb(99 102 241)';
      case 'Discharged': return 'rgb(16 185 129)';
      default: return 'rgb(107 114 128)';
    }
  }

  calendarDays(): { label: string; items: SurgeryRow[] }[] {
    const days: { label: string; date: Date; items: SurgeryRow[] }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 86_400_000);
      days.push({ label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), date: d, items: [] });
    }
    for (const s of this.filtered()) {
      const d = new Date(s.scheduledStart); d.setHours(0, 0, 0, 0);
      const day = days.find(x => x.date.getTime() === d.getTime());
      if (day) day.items.push(s);
    }
    return days.map(({ label, items }) => ({ label, items: items.sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()) }));
  }

  priorityTone(priority: SurgeryPriority): BadgeTone {
    switch (priority) {
      case 'Emergency': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }

  statusTone(status: SurgeryStatus): BadgeTone {
    switch (status) {
      case 'Discharged': return 'success';
      case 'InProgress': return 'warning';
      case 'Delayed': case 'Cancelled': return 'danger';
      case 'ProcedureCompleted': case 'Recovery': case 'PreOpReady': case 'AnesthesiaStarted': return 'primary';
      default: return 'neutral';
    }
  }

  cancel(s: SurgeryRow): void {
    this.dialogSrv.confirm(
      `Cancel ${s.procedure} for ${s.patientName}? This cannot be undone.`,
      () => {
        this.srv.cancelCase(s.id, 'Cancelled from Schedule tab').subscribe(res => {
          if (res.success) {
            this.cases.update(list => list.map(x => x.id === s.id ? { ...x, status: 'Cancelled' as const } : x));
            this.toastSrv.success('Surgery cancelled');
          } else {
            this.toastSrv.error('Unable to cancel surgery');
          }
        });
      },
      'Cancel Surgery',
      'danger',
      'Cancel Surgery',
    );
  }
}
