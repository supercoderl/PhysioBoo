import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, signal } from "@angular/core";
import {
  BooBadgeTone, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooPaginationComponent,
  BooSearchFieldComponent, BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, Subscription, debounceTime, distinctUntilChanged, finalize } from "rxjs";
import { BooDatepickerComponent } from "../../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SurgeryPriority, SurgerySearchParams, SurgeryRow, SurgeryStatus } from "../../../../../shared/types/surgery.types";

type ViewMode = 'table' | 'timeline' | 'calendar';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

@Component({
  selector: 'surgery-schedule-tab',
  standalone: true,
  imports: [
    SharedModule, BooSearchFieldComponent, BooSelectComponent, BooDatepickerComponent, BooButtonComponent, BooPaginationComponent,
    BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent,
  ],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-end gap-3">
        <boo-search-field size="middle" class="w-full md:w-72" label="Search surgeries" placeholder="Surgery #, patient or MRN"
          [(ngModel)]="search" (ngModelChange)="searchInput$.next($event)" (clear)="search = ''; applyFilters()" />
        <boo-select class="w-44" label="Priority" [(ngModel)]="priorityFilter" (ngModelChange)="applyFilters()" [options]="priorityOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-select class="w-52" label="Status" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()" [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-datepicker class="w-44" label="From" [(ngModel)]="dateFrom" (ngModelChange)="applyFilters()" [max]="dateTo"></boo-datepicker>
        <boo-datepicker class="w-44" label="To" [(ngModel)]="dateTo" (ngModelChange)="applyFilters()" [min]="dateFrom"></boo-datepicker>
        <button boo-button variant="secondary" size="sm" type="button" [attr.aria-pressed]="emergencyOnly" (click)="toggleEmergency()">Emergency only</button>
        <button boo-button variant="ghost" size="sm" type="button" [disabled]="isLoading()" (click)="load()">
          <physio-icon name="refresh-cw" [size]="14"></physio-icon> Refresh
        </button>
      </div>

      <div class="flex items-center bg-gray-100 rounded-lg p-0.5" role="group" aria-label="Schedule view">
        <button *ngFor="let v of viewModes" type="button" (click)="viewMode.set(v.key)" [attr.aria-pressed]="viewMode() === v.key"
          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          [ngClass]="viewMode() === v.key ? 'bg-surface text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          <physio-icon [name]="v.icon" [size]="14"></physio-icon> {{ v.label }}
        </button>
      </div>
    </div>

    <div *ngIf="isLoading() && !cases().length" aria-hidden="true" class="h-64 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="isLoading()" class="sr-only" role="status">Loading surgeries…</span>

    <boo-error-state *ngIf="!isLoading() && error()" appearance="panel" icon="cloud-off" title="We couldn't load the surgery schedule"
      description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <boo-empty-state *ngIf="!isLoading() && !error() && !cases().length" icon="filter" appearance="panel"
      [title]="hasFilters() ? 'No surgeries match these filters' : 'No surgeries scheduled'"
      [description]="hasFilters() ? 'Try a different search or clear the filters.' : (canSchedule ? 'Use Schedule Surgery to book the first case.' : 'Scheduled surgeries appear here.')">
      <button *ngIf="hasFilters()" boo-button variant="outline" size="sm" type="button" (click)="clearFilters()">Clear filters</button>
    </boo-empty-state>

    <!-- Table view -->
    <div *ngIf="!error() && cases().length && viewMode() === 'table'" class="bg-surface border border-gray-200 rounded-lg overflow-hidden overflow-x-auto">
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
            <th scope="col" class="px-4 py-3 text-left"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let s of cases()" class="hover:bg-gray-50" [ngClass]="hasConflict(s) ? 'bg-rose-50' : ''">
            <td class="px-4 py-3 font-medium text-gray-800">{{ s.surgeryNumber }}</td>
            <td class="px-4 py-3">{{ s.patientName }}<div class="text-xs text-gray-400">{{ s.mrn }}</div></td>
            <td class="px-4 py-3 text-gray-700">{{ s.procedure }}</td>
            <td class="px-4 py-3 text-gray-500">{{ s.primarySurgeon }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">{{ s.operatingRoomNumber }}
                <physio-icon *ngIf="hasConflict(s)" name="triangle-alert" [size]="12" class="text-rose-500"></physio-icon>
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ s.scheduledStart | date:'short' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ s.estimatedDurationMinutes }} min</td>
            <td class="px-4 py-3"><boo-status-badge [label]="s.priority" [tone]="priorityTone(s.priority)"></boo-status-badge></td>
            <td class="px-4 py-3"><boo-status-badge [label]="s.status" [tone]="statusTone(s.status)"></boo-status-badge></td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <button type="button" (click)="viewCase.emit(s.id)" class="text-primary text-xs font-semibold hover:underline">View</button>
                <button *ngIf="canSchedule && s.status !== 'Cancelled' && s.status !== 'Discharged'" type="button" (click)="cancelCase.emit(s)" class="text-rose-600 text-xs font-semibold hover:underline">Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Timeline view: per-room swimlane for today -->
    <div *ngIf="!error() && cases().length && viewMode() === 'timeline'" class="bg-surface border border-gray-200 rounded-lg p-4 overflow-x-auto">
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
    <div *ngIf="!error() && cases().length && viewMode() === 'calendar'" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
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

    <div *ngIf="!error() && cases().length" class="flex flex-wrap items-center justify-between gap-3 mt-4">
      <p class="m-0 text-xs text-secondary" role="status">Showing {{ cases().length }} of {{ total() }} surgeries, oldest scheduled first. Timeline and calendar show this page only.</p>
      <boo-pagination *ngIf="totalPages() > 1" [page]="page()" [totalPages]="totalPages()" (pageChange)="goTo($event)" />
    </div>
  `,
})
export class SurgeryScheduleTabComponent implements OnInit, OnChanges, OnDestroy {
  /** Bumped by the parent after a case is created or cancelled so the list reloads. */
  @Input() refreshKey = 0;
  @Input() canSchedule = false;
  @Output() viewCase = new EventEmitter<string>();
  @Output() cancelCase = new EventEmitter<SurgeryRow>();

  isLoading = signal(true);
  error = signal(false);
  cases = signal<SurgeryRow[]>([]);
  total = signal(0);
  page = signal(1);
  totalPages = signal(1);
  viewMode = signal<ViewMode>('table');

  search = '';
  priorityFilter: SurgeryPriority | null = null;
  statusFilter: SurgeryStatus | null = null;
  emergencyOnly = false;
  dateFrom: string | null = null;
  dateTo: string | null = null;
  readonly searchInput$ = new Subject<string>();
  private searchSub?: Subscription;
  private requestSub?: Subscription;
  private initialised = false;

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

  constructor(private srv: SurgeryService) { }

  ngOnInit(): void {
    this.searchSub = this.searchInput$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()).subscribe(() => this.applyFilters());
    this.initialised = true;
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialised && changes['refreshKey'] && !changes['refreshKey'].firstChange) this.load();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
    this.requestSub?.unsubscribe();
  }

  load(): void {
    const query: SurgerySearchParams = {
      search: this.search.trim() || null,
      priority: this.priorityFilter,
      status: this.statusFilter,
      emergencyOnly: this.emergencyOnly || null,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      pageNumber: this.page(),
      pageSize: PAGE_SIZE,
    };

    this.isLoading.set(true);
    this.error.set(false);
    // A newer request supersedes an older one so a slow response cannot overwrite fresh filters.
    this.requestSub?.unsubscribe();
    this.requestSub = this.srv.getCases(query).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: res => {
        if (!res.success) { this.error.set(true); return; }
        this.cases.set(res.data.items);
        this.total.set(res.data.totalCount);
        this.totalPages.set(Math.max(1, res.data.totalPages));
      },
      error: () => this.error.set(true),
    });
  }

  applyFilters(): void {
    this.page.set(1);
    this.load();
  }

  goTo(page: number): void {
    this.page.set(page);
    this.load();
  }

  toggleEmergency(): void {
    this.emergencyOnly = !this.emergencyOnly;
    this.applyFilters();
  }

  hasFilters(): boolean {
    return !!(this.search.trim() || this.priorityFilter || this.statusFilter || this.emergencyOnly || this.dateFrom || this.dateTo);
  }

  clearFilters(): void {
    this.search = '';
    this.priorityFilter = null;
    this.statusFilter = null;
    this.emergencyOnly = false;
    this.dateFrom = null;
    this.dateTo = null;
    this.applyFilters();
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
    for (const s of this.cases()) map.set(s.operatingRoomNumber, [...(map.get(s.operatingRoomNumber) ?? []), s]);
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
      case 'Recovery': case 'ProcedureCompleted': case 'AnesthesiaStarted': case 'PreOpReady': return 'rgb(251 113 133)';
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
    for (const s of this.cases()) {
      const d = new Date(s.scheduledStart); d.setHours(0, 0, 0, 0);
      const day = days.find(x => x.date.getTime() === d.getTime());
      if (day) day.items.push(s);
    }
    return days.map(({ label, items }) => ({ label, items: items.sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()) }));
  }

  priorityTone(priority: SurgeryPriority): BooBadgeTone {
    switch (priority) {
      case 'Emergency': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }

  statusTone(status: SurgeryStatus): BooBadgeTone {
    switch (status) {
      case 'Discharged': return 'success';
      case 'InProgress': return 'warning';
      case 'Delayed': case 'Cancelled': return 'danger';
      case 'ProcedureCompleted': case 'Recovery': case 'PreOpReady': case 'AnesthesiaStarted': return 'primary';
      default: return 'neutral';
    }
  }
}
