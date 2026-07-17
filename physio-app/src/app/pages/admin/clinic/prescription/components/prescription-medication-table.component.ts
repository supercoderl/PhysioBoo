import { Component, EventEmitter, Input, Output, computed, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RxMedicationItem, RxMedicationStatus } from "../../../../../shared/types/prescription-rx.types";
import { formatCurrency, severityIcon, severityRank, totalDailyDosesOf } from "../prescription-rx.util";

type EditableField = 'dose' | 'frequency' | 'durationDays' | 'quantity' | 'instructions';

@Component({
    selector: 'rx-medication-table',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooInputComponent, StatusBadgeComponent],
    template: `
    <div class="bg-surface border border-gray-200 rounded-lg flex flex-col">
      <!-- Toolbar -->
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
        <div class="w-56">
          <boo-input placeholder="Search medication..." [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" size="small"></boo-input>
        </div>
        <button *ngFor="let f of statusFilters" type="button" (click)="statusFilter.set(f)"
          class="px-2.5 py-1 text-xs rounded-full transition-colors"
          [ngClass]="statusFilter() === f ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">
          {{ f }}
        </button>
        <button type="button" (click)="insuranceOnly.set(!insuranceOnly())"
          class="px-2.5 py-1 text-xs rounded-full transition-colors"
          [ngClass]="insuranceOnly() ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">
          Insurance covered
        </button>
        <button type="button" (click)="controlledOnly.set(!controlledOnly())"
          class="px-2.5 py-1 text-xs rounded-full transition-colors"
          [ngClass]="controlledOnly() ? 'bg-rose-600 text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">
          Controlled
        </button>

        <button *ngIf="editable" type="button" (click)="addMedication.emit()"
          class="ml-auto inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-3.5 py-2 rounded-lg hover:bg-primary/90">
          <boo-icon name="plus" [size]="16"></boo-icon> Add Medication
        </button>
      </div>

      <!-- Table -->
      <div class="overflow-auto max-h-[55vh]" *ngIf="filtered().length">
        <table class="w-full text-sm border-collapse">
          <thead class="sticky top-0 z-10 bg-gray-50 text-left text-xs text-secondary">
            <tr>
              <th class="sticky left-0 z-20 bg-gray-50 px-4 py-2.5 font-semibold uppercase tracking-wider cursor-pointer min-w-[200px]" (click)="toggleSort('name')">Medication</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Strength</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Form</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Route</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Dose</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Frequency</th>
              <th class="px-2 py-2.5 font-semibold uppercase tracking-wider text-center" title="Morning">AM</th>
              <th class="px-2 py-2.5 font-semibold uppercase tracking-wider text-center" title="Noon">Noon</th>
              <th class="px-2 py-2.5 font-semibold uppercase tracking-wider text-center" title="Afternoon">Aft.</th>
              <th class="px-2 py-2.5 font-semibold uppercase tracking-wider text-center" title="Evening">Eve.</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider text-right">Duration</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider text-right cursor-pointer" (click)="toggleSort('quantity')">Qty</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider min-w-[160px]">Instructions</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Insurance</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Stock</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider">Warnings</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider cursor-pointer" (click)="toggleSort('status')">Status</th>
              <th class="px-3 py-2.5 font-semibold uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let item of filtered()" [id]="'rx-row-' + item.id" class="hover:bg-gray-50/60">
              <!-- Medication identity + badges -->
              <td class="sticky left-0 z-10 bg-surface px-4 py-2.5 align-top">
                <div class="font-medium text-primary">{{ item.name }}</div>
                <div *ngIf="item.genericName" class="text-xs text-secondary italic">{{ item.genericName }}</div>
                <div class="flex gap-1 flex-wrap mt-1">
                  <span *ngFor="let b of rowBadges(item).slice(0,3)" class="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded" [ngClass]="b.cls">{{ b.label }}</span>
                  <span *ngIf="rowBadges(item).length > 3" class="text-[10px] text-secondary px-1">+{{ rowBadges(item).length - 3 }}</span>
                </div>
              </td>
              <td class="px-3 py-2.5 align-top text-secondary">{{ item.strength || '—' }}</td>
              <td class="px-3 py-2.5 align-top text-secondary">{{ item.dosageForm || '—' }}</td>
              <td class="px-3 py-2.5 align-top text-secondary">{{ item.route || '—' }}</td>

              <!-- Dose (inline edit) -->
              <td class="px-3 py-2.5 align-top">
                <ng-container *ngIf="isEditing(item.id, 'dose'); else doseView">
                  <input class="w-20 border border-primary rounded px-1.5 py-1 text-sm" [(ngModel)]="editBuffer"
                    (keydown.enter)="commitEdit(item)" (keydown.escape)="cancelEdit()" (blur)="commitEdit(item)" autofocus>
                </ng-container>
                <ng-template #doseView>
                  <span class="text-primary" [class.cursor-pointer]="editable" (click)="startEdit(item, 'dose', item.dose)">{{ item.dose }}</span>
                </ng-template>
              </td>

              <!-- Frequency (inline edit) -->
              <td class="px-3 py-2.5 align-top">
                <ng-container *ngIf="isEditing(item.id, 'frequency'); else freqView">
                  <input class="w-20 border border-primary rounded px-1.5 py-1 text-sm" [(ngModel)]="editBuffer"
                    (keydown.enter)="commitEdit(item)" (keydown.escape)="cancelEdit()" (blur)="commitEdit(item)" autofocus>
                </ng-container>
                <ng-template #freqView>
                  <span class="text-primary" [class.cursor-pointer]="editable" (click)="startEdit(item, 'frequency', item.frequency)">{{ item.frequency }}</span>
                </ng-template>
              </td>

              <td class="px-2 py-2.5 align-top text-center"><boo-icon *ngIf="item.timing.morning" name="check" [size]="14" color="#059669"></boo-icon></td>
              <td class="px-2 py-2.5 align-top text-center"><boo-icon *ngIf="item.timing.noon" name="check" [size]="14" color="#059669"></boo-icon></td>
              <td class="px-2 py-2.5 align-top text-center"><boo-icon *ngIf="item.timing.afternoon" name="check" [size]="14" color="#059669"></boo-icon></td>
              <td class="px-2 py-2.5 align-top text-center"><boo-icon *ngIf="item.timing.evening" name="check" [size]="14" color="#059669"></boo-icon></td>

              <!-- Duration (inline edit) -->
              <td class="px-3 py-2.5 align-top text-right">
                <ng-container *ngIf="isEditing(item.id, 'durationDays'); else durView">
                  <input type="number" class="w-16 border border-primary rounded px-1.5 py-1 text-sm text-right" [(ngModel)]="editBuffer"
                    (keydown.enter)="commitEdit(item)" (keydown.escape)="cancelEdit()" (blur)="commitEdit(item)" autofocus>
                </ng-container>
                <ng-template #durView>
                  <span class="text-secondary" [class.cursor-pointer]="editable" (click)="startEdit(item, 'durationDays', item.durationDays)">{{ item.durationDays }}d</span>
                </ng-template>
              </td>

              <!-- Quantity (inline edit) -->
              <td class="px-3 py-2.5 align-top text-right">
                <ng-container *ngIf="isEditing(item.id, 'quantity'); else qtyView">
                  <input type="number" class="w-16 border border-primary rounded px-1.5 py-1 text-sm text-right" [(ngModel)]="editBuffer"
                    (keydown.enter)="commitEdit(item)" (keydown.escape)="cancelEdit()" (blur)="commitEdit(item)" autofocus>
                </ng-container>
                <ng-template #qtyView>
                  <span class="font-medium text-primary" [class.cursor-pointer]="editable" (click)="startEdit(item, 'quantity', item.quantity)">{{ item.quantity }}</span>
                </ng-template>
              </td>

              <!-- Instructions (inline edit) -->
              <td class="px-3 py-2.5 align-top max-w-[200px]">
                <ng-container *ngIf="isEditing(item.id, 'instructions'); else instrView">
                  <input class="w-full border border-primary rounded px-1.5 py-1 text-sm" [(ngModel)]="editBuffer"
                    (keydown.enter)="commitEdit(item)" (keydown.escape)="cancelEdit()" (blur)="commitEdit(item)" autofocus>
                </ng-container>
                <ng-template #instrView>
                  <span class="text-secondary truncate block" [title]="item.instructions || ''" [class.cursor-pointer]="editable" (click)="startEdit(item, 'instructions', item.instructions || '')">{{ item.instructions || '—' }}</span>
                </ng-template>
              </td>

              <td class="px-3 py-2.5 align-top">
                <boo-status-badge [label]="item.insuranceCovered ? 'Covered' : 'Not Covered'" [tone]="item.insuranceCovered ? 'success' : 'neutral'"></boo-status-badge>
              </td>
              <td class="px-3 py-2.5 align-top">
                <boo-status-badge [label]="stockLabel(item)" [tone]="stockTone(item)" [dotted]="true"></boo-status-badge>
              </td>

              <!-- Clinical warnings -->
              <td class="px-3 py-2.5 align-top">
                <div class="flex items-center gap-1" *ngIf="item.warnings.length">
                  <span *ngFor="let w of topWarnings(item)" class="relative group cursor-pointer">
                    <boo-icon [name]="severityIcon(w.severity)" [size]="16" [color]="warningColor(w.severity)"></boo-icon>
                    <span class="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1 w-max max-w-[240px] bg-gray-900 text-white text-[11px] rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-40">
                      <strong>{{ w.severity }}:</strong> {{ w.message }}
                      <span *ngIf="w.recommendation" class="block mt-0.5 text-gray-300">{{ w.recommendation }}</span>
                    </span>
                  </span>
                  <span *ngIf="item.warnings.length > 2" class="text-[11px] text-secondary">+{{ item.warnings.length - 2 }}</span>
                </div>
                <span *ngIf="!item.warnings.length" class="text-secondary text-xs">—</span>
              </td>

              <td class="px-3 py-2.5 align-top">
                <boo-status-badge [label]="item.status" [tone]="statusTone(item.status)"></boo-status-badge>
              </td>

              <td class="px-3 py-2.5 align-top text-right whitespace-nowrap">
                <button *ngIf="editable" type="button" (click)="editMedication.emit(item)" class="text-secondary hover:text-primary p-1" title="Edit">
                  <boo-icon name="pencil" [size]="15"></boo-icon>
                </button>
                <button *ngIf="editable" type="button" (click)="duplicateItem(item)" class="text-secondary hover:text-primary p-1" title="Duplicate">
                  <boo-icon name="copy" [size]="15"></boo-icon>
                </button>
                <button *ngIf="editable" type="button" (click)="removeItem(item)" class="text-secondary hover:text-rose-600 p-1" title="Remove">
                  <boo-icon name="trash-2" [size]="15"></boo-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div *ngIf="!filtered().length" class="py-14 text-center">
        <boo-icon name="clipboard-list" [size]="40" class="text-gray-300 mx-auto mb-3"></boo-icon>
        <p class="text-secondary text-sm mb-3">{{ itemsSignal().length ? 'No medications match the current filters.' : 'No medications added yet.' }}</p>
        <button *ngIf="editable && !itemsSignal().length" type="button" (click)="addMedication.emit()" class="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90">
          Add First Medication
        </button>
      </div>

      <!-- Summary strip -->
      <div class="px-4 py-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center bg-gray-50/60 rounded-b-lg">
        <div><div class="text-xs text-secondary">Medications</div><div class="font-bold text-primary">{{ summary().totalMedications }}</div></div>
        <div><div class="text-xs text-secondary">Total Qty</div><div class="font-bold text-primary">{{ summary().totalQuantity }}</div></div>
        <div><div class="text-xs text-secondary">Daily Doses</div><div class="font-bold text-primary">{{ summary().totalDailyDoses }}</div></div>
        <div><div class="text-xs text-secondary">Est. Cost</div><div class="font-bold text-primary">{{ fmt(summary().estimatedCost) }}</div></div>
        <div><div class="text-xs text-secondary">Insurance</div><div class="font-bold text-emerald-600">{{ fmt(summary().insuranceCoverageAmount) }} ({{ summary().insuranceCoveragePercent }}%)</div></div>
        <div><div class="text-xs text-secondary">Patient Pays</div><div class="font-bold text-primary">{{ fmt(summary().patientPayment) }}</div></div>
      </div>
    </div>
  `,
})
export class PrescriptionMedicationTableComponent {
    @Input() set items(v: RxMedicationItem[]) { this._items.set(v ?? []); }
    itemsSignal() { return this._items(); }
    @Input() editable = true;

    @Output() itemsChange = new EventEmitter<RxMedicationItem[]>();
    @Output() addMedication = new EventEmitter<void>();
    @Output() editMedication = new EventEmitter<RxMedicationItem>();

    private _items = signal<RxMedicationItem[]>([]);

    searchTerm = signal('');
    statusFilter = signal<'All' | RxMedicationStatus>('All');
    insuranceOnly = signal(false);
    controlledOnly = signal(false);
    sortKey = signal<'name' | 'quantity' | 'status'>('name');
    sortDir = signal<1 | -1>(1);

    readonly statusFilters: ('All' | RxMedicationStatus)[] = ['All', 'Active', 'Held', 'Discontinued'];
    readonly severityIcon = severityIcon;

    editingId: string | null = null;
    editingField: EditableField | null = null;
    editBuffer: string | number = '';

    filtered = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        const status = this.statusFilter();
        const insOnly = this.insuranceOnly();
        const ctrlOnly = this.controlledOnly();
        const key = this.sortKey();
        const dir = this.sortDir();

        let list = this._items().filter(i => {
            if (term && !`${i.name} ${i.genericName} ${i.brandName}`.toLowerCase().includes(term)) return false;
            if (status !== 'All' && i.status !== status) return false;
            if (insOnly && !i.insuranceCovered) return false;
            if (ctrlOnly && !i.isControlledSubstance) return false;
            return true;
        });

        list = [...list].sort((a, b) => {
            if (key === 'name') return a.name.localeCompare(b.name) * dir;
            if (key === 'quantity') return (a.quantity - b.quantity) * dir;
            return a.status.localeCompare(b.status) * dir;
        });

        return list;
    });

    summary = computed(() => {
        const list = this._items();
        const totalQuantity = list.reduce((s, i) => s + i.quantity, 0);
        const totalDailyDoses = list.reduce((s, i) => s + totalDailyDosesOf(i), 0);
        const estimatedCost = list.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
        const insuranceCoverageAmount = list.filter(i => i.insuranceCovered).reduce((s, i) => s + i.quantity * i.unitPrice * 0.8, 0);
        return {
            totalMedications: list.length,
            totalQuantity,
            totalDailyDoses,
            estimatedCost,
            insuranceCoverageAmount,
            insuranceCoveragePercent: estimatedCost ? Math.round((insuranceCoverageAmount / estimatedCost) * 100) : 0,
            patientPayment: estimatedCost - insuranceCoverageAmount,
        };
    });

    fmt(amount: number) { return formatCurrency(amount, 'VND'); }

    toggleSort(key: 'name' | 'quantity' | 'status') {
        if (this.sortKey() === key) this.sortDir.set(this.sortDir() === 1 ? -1 : 1);
        else { this.sortKey.set(key); this.sortDir.set(1); }
    }

    rowBadges(item: RxMedicationItem) {
        const out: { label: string; cls: string }[] = [];
        if (item.isAntibiotic) out.push({ label: 'Antibiotic', cls: 'bg-blue-50 text-blue-700' });
        if (item.isControlledSubstance) out.push({ label: 'Controlled', cls: 'bg-rose-50 text-rose-700' });
        if (item.isHighAlert) out.push({ label: 'High Alert', cls: 'bg-orange-50 text-orange-700' });
        if (item.isOtc) out.push({ label: 'OTC', cls: 'bg-gray-100 text-secondary' });
        if (item.isPrescriptionOnly) out.push({ label: 'Rx Only', cls: 'bg-gray-100 text-secondary' });
        if (item.isCustomMedication) out.push({ label: 'Not catalog-verified', cls: 'bg-amber-50 text-amber-700' });
        return out;
    }

    stockLabel(item: RxMedicationItem) {
        switch (item.stockStatus) {
            case 'InStock': return 'In Stock';
            case 'Low': return 'Low Stock';
            default: return 'Out of Stock';
        }
    }

    stockTone(item: RxMedicationItem): 'success' | 'warning' | 'danger' {
        switch (item.stockStatus) {
            case 'InStock': return 'success';
            case 'Low': return 'warning';
            default: return 'danger';
        }
    }

    statusTone(status: RxMedicationStatus): 'success' | 'warning' | 'neutral' {
        switch (status) {
            case 'Active': return 'success';
            case 'Held': return 'warning';
            default: return 'neutral';
        }
    }

    topWarnings(item: RxMedicationItem) {
        return [...item.warnings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity)).slice(0, 2);
    }

    warningColor(sev: string) {
        switch (sev) {
            case 'Critical': return '#dc2626';
            case 'High': return '#ea580c';
            case 'Medium': return '#d97706';
            case 'Low': return '#2563eb';
            default: return '#64748b';
        }
    }

    isEditing(id: string, field: EditableField) {
        return this.editingId === id && this.editingField === field;
    }

    startEdit(item: RxMedicationItem, field: EditableField, value: string | number) {
        if (!this.editable) return;
        this.editingId = item.id;
        this.editingField = field;
        this.editBuffer = value;
    }

    cancelEdit() {
        this.editingId = null;
        this.editingField = null;
    }

    commitEdit(item: RxMedicationItem) {
        if (!this.editingField) return;
        const field = this.editingField;
        const value = field === 'durationDays' || field === 'quantity' ? Number(this.editBuffer) || 0 : String(this.editBuffer);
        const next = this._items().map(i => i.id === item.id ? { ...i, [field]: value } : i);
        this._items.set(next);
        this.itemsChange.emit(next);
        this.cancelEdit();
    }

    duplicateItem(item: RxMedicationItem) {
        const copy: RxMedicationItem = { ...item, id: `${item.id}-copy-${Date.now()}`, warnings: [...item.warnings] };
        const next = [...this._items(), copy];
        this._items.set(next);
        this.itemsChange.emit(next);
    }

    removeItem(item: RxMedicationItem) {
        const next = this._items().filter(i => i.id !== item.id);
        this._items.set(next);
        this.itemsChange.emit(next);
    }
}
