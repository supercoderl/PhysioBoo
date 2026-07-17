import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ClinicalSnapshot } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-clinical-snapshot',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="snapshot" class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200">
      <ng-container *ngFor="let c of cards()">
        <div class="bg-surface rounded-md border border-gray-200 px-3 py-2 flex items-center gap-3">
          <div class="w-9 h-9 rounded flex items-center justify-center shrink-0" [ngClass]="c.bg">
            <boo-icon [name]="c.icon" iconClass="w-4 h-4" [ngClass]="c.fg"></boo-icon>
          </div>
          <div class="min-w-0">
            <div class="text-[10px] uppercase tracking-wider text-secondary leading-none mb-1">{{ c.label }}</div>
            <div class="text-base font-semibold text-primary leading-none truncate">{{ c.value }}</div>
            <div *ngIf="c.sub" class="text-[10px] text-secondary truncate mt-0.5">{{ c.sub }}</div>
          </div>
        </div>
      </ng-container>
    </div>
    `,
})
export class ClinicalSnapshotComponent {
  @Input() snapshot: ClinicalSnapshot | null = null;

  cards() {
    const s = this.snapshot!;
    const criticalLabs = s.recentLabAlerts.filter(a => a.isCritical).length;
    const nextAppt = s.upcomingAppointments[0];

    return [
      { label: 'Active diagnoses', value: s.activeDiagnosesCount, sub: null, icon: 'stethoscope', fg: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Medications', value: s.activeMedicationsCount, sub: 'Currently active', icon: 'pill', fg: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Allergies', value: s.knownAllergiesCount, sub: null, icon: 'alert-triangle', fg: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Pending orders', value: s.pendingOrdersCount, sub: 'Lab + imaging', icon: 'clipboard-list', fg: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Lab alerts', value: s.recentLabAlerts.length, sub: criticalLabs ? `${criticalLabs} critical` : 'Last 7 days', icon: 'flask-conical', fg: criticalLabs ? 'text-red-600' : 'text-emerald-600', bg: criticalLabs ? 'bg-red-50' : 'bg-emerald-50' },
      { label: 'Next visit', value: nextAppt ? this.relative(nextAppt.scheduledAt) : '—', sub: nextAppt?.department ?? null, icon: 'calendar', fg: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Outstanding', value: this.formatMoney(s.outstandingBalance, s.currency), sub: 'Balance due', icon: 'wallet', fg: 'text-orange-600', bg: 'bg-orange-50' },
    ];
  }

  // tiny inline helpers
  private relative = (iso: string | null): string => {
    if (!iso) return '—';
    const d = new Date(iso); const now = new Date();
    const diff = Math.round((d.getTime() - now.getTime()) / 86_400_000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 0 && diff < 14) return `In ${diff}d`;
    return d.toLocaleDateString();
  };

  formatMoney(amount: number, currency: string): string {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount); }
    catch { return `${amount.toLocaleString()} ${currency}`; }
  }
}
