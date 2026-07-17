import { Component, Input, computed, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { Severity } from "../../../../../shared/enums/severity";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CurrentStatus, DiagnosisRow } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-diagnoses-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-5 py-3 border-b border-gray-200 flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <boo-icon name="search" iconClass="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"></boo-icon>
          <input type="text" [ngModel]="search()" (ngModelChange)="search.set($event)"
            placeholder="Search ICD-10, condition, category…"
            class="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
        </div>
        <select [value]="status()" (change)="status.set($any($event.target).value)" class="border border-gray-200 rounded-md px-3 py-1.5 text-sm">
          <option value="">All status</option>
          <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr class="text-left">
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider w-28">ICD-10</th>
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider">Diagnosis</th>
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider hidden md:table-cell">Category</th>
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider">Severity</th>
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider hidden lg:table-cell">Diagnosed</th>
              <th class="px-4 py-2.5 text-xs font-semibold text-secondary uppercase tracking-wider hidden lg:table-cell">Physician</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let d of filtered()" class="hover:bg-gray-50/60">
              <td class="px-4 py-3 font-mono text-xs text-primary">{{ d.icd10Code || '—' }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-primary">{{ d.conditionName }}</div>
                <div *ngIf="d.notes" class="text-xs text-secondary italic mt-0.5">{{ d.notes }}</div>
              </td>
              <td class="px-4 py-3 text-secondary hidden md:table-cell">{{ d.conditionCategory || '—' }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="severityClass(d.severity)">
                  <span class="w-1.5 h-1.5 rounded-full" [ngClass]="severityDot(d.severity)"></span>
                  {{ d.severity }}
                </span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(d.currentStatus)">
                  {{ d.currentStatus }}
                </span>
              </td>
              <td class="px-4 py-3 text-secondary hidden lg:table-cell">{{ d.diagnosedDate ? (d.diagnosedDate | date:'mediumDate') : '—' }}</td>
              <td class="px-4 py-3 text-secondary hidden lg:table-cell">{{ d.diagnosedByName || '—' }}</td>
            </tr>

            <tr *ngIf="!filtered().length">
              <td colspan="7" class="px-4 py-12 text-center text-sm text-secondary">No diagnoses recorded.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    `,
})
export class DiagnosesTabComponent {
  @Input() set data(v: DiagnosisRow[] | null) { this._data.set(v ?? []); }
  private _data = signal<DiagnosisRow[]>([]);

  search = signal('');
  status = signal('');
  readonly allStatuses: CurrentStatus[] = ['Active', 'Managed', 'InRemission', 'Resolved', 'Cured'];

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const s = this.status();
    return this._data()
      .filter(d => !s || d.currentStatus === s)
      .filter(d => !q ||
        d.conditionName.toLowerCase().includes(q) ||
        (d.icd10Code ?? '').toLowerCase().includes(q) ||
        (d.conditionCategory ?? '').toLowerCase().includes(q));
  });

  severityClass(s: Severity) {
    switch (s) {
      case Severity.Critical: return 'bg-red-100 text-red-700';
      case Severity.Severe: return 'bg-red-50 text-red-700';
      case Severity.Moderate: return 'bg-amber-50 text-amber-700';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  }
  severityDot(s: Severity) {
    switch (s) {
      case Severity.Critical: case Severity.Severe: return 'bg-red-500';
      case Severity.Moderate: return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  }
  statusClass(s: CurrentStatus) {
    switch (s) {
      case 'Active': return 'bg-red-50 text-red-700';
      case 'Managed': return 'bg-blue-50 text-blue-700';
      case 'InRemission': return 'bg-violet-50 text-violet-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
