import { Component, Input, computed, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabReportRow, LabResultRow } from "../../../../../shared/types/medical-record.types";

interface LabPanelGroup {
  panel: string;
  items: LabResultRow[];
  abnormalCount: number;
  criticalCount: number;
  latestAt: string;
}

@Component({
  selector: 'mr-laboratory-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="space-y-3">
      <!-- Critical / abnormal banner -->
      <div *ngIf="criticalCount() > 0" class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <boo-icon name="alert-triangle" iconClass="w-5 h-5 text-red-600"></boo-icon>
        <div class="text-sm">
          <strong class="text-red-700 font-semibold">{{ criticalCount() }} critical value{{ criticalCount() === 1 ? '' : 's' }}</strong>
          <span class="text-red-600 ml-1">require attention. Review highlighted rows below.</span>
        </div>
      </div>

      <!-- Toggle: abnormal only -->
      <div class="bg-surface border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <span class="text-xs text-secondary">Show:</span>
        <button (click)="abnormalOnly.set(false)" class="px-2.5 py-1 text-xs rounded-full"
          [ngClass]="!abnormalOnly() ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">All ({{ allCount() }})</button>
        <button (click)="abnormalOnly.set(true)" class="px-2.5 py-1 text-xs rounded-full"
          [ngClass]="abnormalOnly() ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">Abnormal only ({{ abnormalCount() }})</button>
      </div>

      <!-- Panel groups -->
      <article *ngFor="let g of grouped()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <header class="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
            <boo-icon name="flask-conical" iconClass="w-4 h-4 text-secondary"></boo-icon>
            {{ g.panel }}
            <span class="text-xs text-secondary font-normal">({{ g.items.length }})</span>
          </h3>
          <div class="flex items-center gap-2 text-xs">
            <span *ngIf="g.criticalCount" class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">{{ g.criticalCount }} critical</span>
            <span *ngIf="g.abnormalCount" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">{{ g.abnormalCount }} abnormal</span>
            <span class="text-secondary">Collected {{ g.latestAt | date:'mediumDate' }}</span>
          </div>
        </header>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs text-secondary">
              <tr>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Test</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider text-right">Result</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Flag</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider hidden md:table-cell">Reference</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider hidden lg:table-cell">Ordered by</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider hidden lg:table-cell">Resulted</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let r of g.items" [class.bg-red-50]="r.isCritical">
                <td class="px-5 py-2.5">
                  <div class="font-medium text-primary">{{ r.testName }}</div>
                </td>
                <td class="px-5 py-2.5 text-right">
                  <span class="font-semibold tabular-nums" [ngClass]="valueClass(r)">
                    {{ r.resultValue || '—' }}<span *ngIf="r.resultUnit" class="font-normal text-secondary ml-1">{{ r.resultUnit }}</span>
                  </span>
                </td>
                <td class="px-5 py-2.5">
                  <span *ngIf="r.isCritical" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">CRIT</span>
                  <span *ngIf="!r.isCritical && r.abnormalFlag && r.abnormalFlag !== 'N'"
                    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                    [ngClass]="flagPillClass(r.abnormalFlag)">{{ r.abnormalFlag }}</span>
                </td>
                <td class="px-5 py-2.5 text-secondary hidden md:table-cell">{{ r.referenceRange || '—' }}</td>
                <td class="px-5 py-2.5 text-secondary hidden lg:table-cell">{{ r.orderingDoctorName }}</td>
                <td class="px-5 py-2.5 text-secondary hidden lg:table-cell">{{ r.resultedAt ? (r.resultedAt | date:'short') : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <!-- Reports section -->
      <article *ngIf="reports?.length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <header class="px-5 py-3 border-b border-gray-100">
          <h3 class="text-sm font-semibold text-primary m-0 flex items-center gap-2">
            <boo-icon name="file-text" iconClass="w-4 h-4 text-secondary"></boo-icon>
            Pathologist reports
          </h3>
        </header>
        <ul class="divide-y divide-gray-100 m-0 p-0 list-none">
          <li *ngFor="let r of reports" class="px-5 py-3">
            <div class="flex items-center justify-between gap-3 mb-1">
              <span class="font-mono text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded">{{ r.reportNumber }}</span>
              <span class="text-xs text-secondary">{{ r.reportedAt | date:'medium' }}</span>
            </div>
            <div class="text-sm text-primary mb-1"><strong>Impression:</strong> {{ r.overallImpression || '—' }}</div>
            <div *ngIf="r.recommendations" class="text-sm text-secondary"><strong>Recommendations:</strong> {{ r.recommendations }}</div>
            <div *ngIf="r.criticalValues" class="text-sm text-red-700 mt-1"><strong>Critical:</strong> {{ r.criticalValues }}</div>
          </li>
        </ul>
      </article>

      <div *ngIf="!grouped().length" class="bg-surface border border-gray-200 rounded-lg py-12 text-center text-sm text-secondary">
        No lab results recorded.
      </div>
    </div>
    `,
})
export class LaboratoryTabComponent {
  @Input() set results(v: LabResultRow[] | null) { this._results.set(v ?? []); }
  @Input() reports: LabReportRow[] | null = null;
  private _results = signal<LabResultRow[]>([]);

  abnormalOnly = signal(false);

  allCount = computed(() => this._results().length);
  abnormalCount = computed(() => this._results().filter(r => r.abnormalFlag && r.abnormalFlag !== 'N').length);
  criticalCount = computed(() => this._results().filter(r => r.isCritical).length);

  grouped = computed<LabPanelGroup[]>(() => {
    const items = this.abnormalOnly()
      ? this._results().filter(r => r.abnormalFlag && r.abnormalFlag !== 'N')
      : this._results();
    const groups = new Map<string, LabResultRow[]>();
    for (const r of items) {
      const key = r.panelName || 'Other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    return Array.from(groups.entries()).map(([panel, list]) => ({
      panel,
      items: list,
      abnormalCount: list.filter(x => x.abnormalFlag && x.abnormalFlag !== 'N' && !x.isCritical).length,
      criticalCount: list.filter(x => x.isCritical).length,
      latestAt: list.reduce<string>((acc, x) => (x.resultedAt && (!acc || x.resultedAt > acc)) ? x.resultedAt : acc, ''),
    }));
  });

  valueClass(r: LabResultRow): string {
    if (r.isCritical) return 'text-red-700';
    if (!r.abnormalFlag || r.abnormalFlag === 'N') return 'text-primary';
    if (r.abnormalFlag.startsWith('H')) return 'text-red-600';
    if (r.abnormalFlag.startsWith('L')) return 'text-blue-600';
    return 'text-amber-700';
  }

  flagPillClass(flag: string): string {
    if (flag.startsWith('HH') || flag.startsWith('LL')) return 'bg-red-100 text-red-700';
    if (flag.startsWith('H')) return 'bg-red-50 text-red-700';
    if (flag.startsWith('L')) return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
  }
}
