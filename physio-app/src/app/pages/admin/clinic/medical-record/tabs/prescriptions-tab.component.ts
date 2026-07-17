import { Component, Input, computed, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PrescriptionRow, PrescriptionStatus } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-prescriptions-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="space-y-3">
      <!-- Filter chips -->
      <div class="bg-surface border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <span class="text-xs text-secondary mr-2">Status:</span>
        <button *ngFor="let f of filters" type="button" (click)="status.set(f.key)"
          class="px-2.5 py-1 text-xs rounded-full transition-colors"
          [ngClass]="status() === f.key ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">
          {{ f.label }}
          <span class="ml-1 opacity-70">{{ countOf(f.key) }}</span>
        </button>
      </div>

      <!-- Prescription cards -->
      <article *ngFor="let rx of filtered()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <header class="px-5 py-3 border-b border-gray-100 flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <span class="font-mono text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded">{{ rx.prescriptionNumber }}</span>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(rx.status)">
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {{ rx.status }}
              </span>
              <span *ngIf="rx.items[0]?.isControlledSubstance"
                class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 text-red-700 inline-flex items-center gap-1">
                <boo-icon name="alert-triangle" iconClass="w-3 h-3"></boo-icon>
                Controlled
              </span>
            </div>
            <div class="text-sm text-primary"><span class="text-gray-400 mr-1">Prescribed</span>{{ rx.prescriptionDate | date:'mediumDate' }} by <span class="font-medium">{{ rx.doctorName }}</span></div>
            <div *ngIf="rx.diagnosis" class="text-xs text-secondary mt-0.5">For: {{ rx.diagnosis }}</div>
          </div>
          <div class="text-right shrink-0 text-xs text-secondary">
            <div>Refills: <span class="text-primary font-medium">{{ rx.refillCount }}/{{ rx.maxRefills }}</span></div>
            <div *ngIf="rx.validUntil">Valid until {{ rx.validUntil | date:'mediumDate' }}</div>
          </div>
        </header>

        <!-- Items table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-left text-xs text-secondary">
              <tr>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Medication</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider hidden md:table-cell">Dosage</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider">Frequency</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider hidden lg:table-cell">Route</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider text-right">Duration</th>
                <th class="px-5 py-2 font-semibold uppercase tracking-wider text-right">Qty</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr *ngFor="let i of rx.items">
                <td class="px-5 py-2.5">
                  <div class="font-medium text-primary">{{ i.medicineName }}<span *ngIf="i.strength" class="text-secondary font-normal"> · {{ i.strength }}</span></div>
                  <div *ngIf="i.genericName && i.genericName !== i.medicineName" class="text-xs text-secondary italic">{{ i.genericName }}</div>
                  <div *ngIf="i.specialInstructions" class="text-xs text-amber-700 mt-0.5 inline-flex items-center gap-1">
                    <boo-icon name="info" iconClass="w-3 h-3"></boo-icon>
                    {{ i.specialInstructions }}
                  </div>
                </td>
                <td class="px-5 py-2.5 text-primary hidden md:table-cell">{{ i.dosageInstructions }}</td>
                <td class="px-5 py-2.5 text-primary">{{ i.frequency }}</td>
                <td class="px-5 py-2.5 text-secondary hidden lg:table-cell">{{ i.routeOfAdministration || '—' }}</td>
                <td class="px-5 py-2.5 text-right text-secondary">{{ i.durationDays }}d</td>
                <td class="px-5 py-2.5 text-right text-primary font-medium">{{ i.quantityPrescribed }}<span *ngIf="i.quantityDispensed < i.quantityPrescribed" class="text-secondary"> / {{ i.quantityDispensed }} disp.</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer *ngIf="rx.instructions" class="px-5 py-2.5 border-t border-gray-100 bg-amber-50/40 text-xs text-amber-800">
          <strong class="font-semibold">Patient instructions:</strong> {{ rx.instructions }}
        </footer>
      </article>

      <div *ngIf="!filtered().length" class="bg-surface border border-gray-200 rounded-lg py-12 text-center text-sm text-secondary">
        No prescriptions in this view.
      </div>
    </div>
    `,
})
export class PrescriptionsTabComponent {
  @Input() set data(v: PrescriptionRow[] | null) { this._data.set(v ?? []); }
  private _data = signal<PrescriptionRow[]>([]);

  status = signal<'All' | PrescriptionStatus>('Active');

  readonly filters: { key: 'All' | PrescriptionStatus, label: string }[] = [
    { key: 'Active', label: 'Active' },
    { key: 'Dispensed', label: 'Dispensed' },
    { key: 'Expired', label: 'Expired' },
    { key: 'Cancelled', label: 'Cancelled' },
    { key: 'All', label: 'All' },
  ];

  countOf(key: 'All' | PrescriptionStatus) {
    return key === 'All' ? this._data().length : this._data().filter(x => x.status === key).length;
  }

  filtered = computed(() => {
    const s = this.status();
    return this._data()
      .filter(rx => s === 'All' || rx.status === s)
      .sort((a, b) => +new Date(b.prescriptionDate) - +new Date(a.prescriptionDate));
  });

  statusClass(s: PrescriptionStatus) {
    switch (s) {
      case 'Active': return 'bg-emerald-50 text-emerald-700';
      case 'Dispensed': return 'bg-blue-50 text-blue-700';
      case 'PartiallyDispensed': return 'bg-amber-50 text-amber-700';
      case 'Expired': return 'bg-gray-100 text-gray-500';
      case 'Cancelled': return 'bg-red-50 text-red-600';
    }
  }
}
