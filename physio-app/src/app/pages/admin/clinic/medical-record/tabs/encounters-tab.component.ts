import { Component, Input, computed, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { AppointmentStatus, EncounterRow } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-encounters-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <!-- Filter strip -->
      <div class="px-5 py-3 border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <boo-icon name="search" iconClass="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></boo-icon>
          <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)"
            placeholder="Search by doctor, department, complaint…"
            class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <select [value]="dept()" (change)="dept.set(any($event.target).value)"
          class="border border-gray-200 rounded-md px-3 py-1.5 text-sm">
          <option value="">All departments</option>
          <option *ngFor="let d of departments()" [value]="d">{{ d }}</option>
        </select>
        <select [value]="status()" (change)="status.set(any($event.target).value)"
          class="border border-gray-200 rounded-md px-3 py-1.5 text-sm">
          <option value="">All status</option>
          <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
        </select>
      </div>

      <!-- Timeline -->
      <div *ngIf="filtered().length; else empty" class="relative">
        <div class="absolute left-[34px] top-0 bottom-0 w-px bg-gray-200"></div>
        <ul class="m-0 p-0 list-none">
          <li *ngFor="let e of filtered()" class="relative pl-16 pr-5 py-4 hover:bg-gray-50/60 transition-colors">
            <div class="absolute left-[26px] top-5 w-4 h-4 rounded-full border-2 border-surface" [ngClass]="dotBg(e.status)"></div>

            <div class="flex items-baseline gap-3 mb-1 flex-wrap">
              <span class="text-sm font-semibold text-primary">{{ e.scheduledAt | date:'longDate' }}</span>
              <span class="text-xs text-secondary">{{ e.scheduledAt | date:'shortTime' }}<span *ngIf="e.durationMinutes"> · {{ e.durationMinutes }}m</span></span>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(e.status)">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotBg(e.status)"></span>
                {{ e.status }}
              </span>
              <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{{ e.consultationType }}</span>
              <span class="text-xs font-mono text-secondary ml-auto">{{ e.appointmentNumber }}</span>
            </div>

            <div class="text-sm text-primary font-medium mb-1">{{ e.doctorName }} · <span class="font-normal text-secondary">{{ e.departmentName }}</span></div>

            <div *ngIf="e.chiefComplaint" class="text-sm text-primary mb-1">
              <span class="text-xs text-gray-400 mr-1.5">Chief complaint</span>{{ e.chiefComplaint }}
            </div>
            <div *ngIf="e.diagnosis" class="text-sm text-primary mb-1">
              <span class="text-xs text-gray-400 mr-1.5">Assessment</span>{{ e.diagnosis }}
            </div>
            <div *ngIf="e.treatmentPlan" class="text-sm text-secondary mb-1">
              <span class="text-xs text-gray-400 mr-1.5">Plan</span>{{ e.treatmentPlan }}
            </div>
            <div *ngIf="e.followUpDate" class="text-xs text-secondary mt-1.5 inline-flex items-center gap-1">
              <boo-icon name="calendar" iconClass="w-3 h-3"></boo-icon>
              Follow-up {{ e.followUpDate | date:'mediumDate' }}
            </div>
          </li>
        </ul>
      </div>

      <ng-template #empty>
        <div class="py-16 text-center text-sm text-secondary">No encounters match the current filters.</div>
      </ng-template>
    </div>
    `,
})
export class EncountersTabComponent {
  @Input() set data(v: EncounterRow[] | null) { this._data.set(v ?? []); }
  private _data = signal<EncounterRow[]>([]);

  search = signal('');
  dept = signal('');
  status = signal('');

  readonly allStatuses: AppointmentStatus[] = ['Scheduled', 'Confirmed', 'CheckedIn', 'InProgress', 'Completed', 'Cancelled', 'NoShow', 'Rescheduled'];
  departments = computed(() => Array.from(new Set(this._data().map(e => e.departmentName))).sort());

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const d = this.dept();
    const s = this.status();
    return this._data()
      .filter(e => !d || e.departmentName === d)
      .filter(e => !s || e.status === s)
      .filter(e => !q ||
        e.doctorName.toLowerCase().includes(q) ||
        e.departmentName.toLowerCase().includes(q) ||
        (e.chiefComplaint ?? '').toLowerCase().includes(q) ||
        (e.diagnosis ?? '').toLowerCase().includes(q))
      .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt));
  });

  statusClass(s: AppointmentStatus): string {
    switch (s) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700';
      case 'Confirmed':
      case 'Scheduled': return 'bg-blue-50 text-blue-700';
      case 'InProgress':
      case 'CheckedIn': return 'bg-amber-50 text-amber-700';
      case 'Cancelled':
      case 'NoShow': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
  dotBg(s: AppointmentStatus): string {
    switch (s) {
      case 'Completed': return 'bg-emerald-500';
      case 'Confirmed':
      case 'Scheduled': return 'bg-blue-500';
      case 'InProgress':
      case 'CheckedIn': return 'bg-amber-500';
      case 'Cancelled':
      case 'NoShow': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }
  any(t: EventTarget | null) { return t as HTMLSelectElement; }
}
