import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierInvoiceStatus } from "../../../../shared/types/cashier.types";

interface StatusChip {
    label: string;
    value: CashierInvoiceStatus | 'All';
}

@Component({
    selector: 'cashier-search-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="bg-surface rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <boo-icon name="search" [size]="15" iconClass="text-amber-600"></boo-icon>
          Find a Bill
        </h2>
        <button type="button" (click)="advancedOpen.set(!advancedOpen())"
          class="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1">
          {{ advancedOpen() ? 'Hide Filters' : 'Advanced Filters' }}
          <boo-icon [name]="advancedOpen() ? 'chevron-up' : 'chevron-down'" [size]="12"></boo-icon>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="lg:col-span-2 relative">
          <boo-icon name="user-round-search" [size]="14" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></boo-icon>
          <input type="text" [(ngModel)]="query" (ngModelChange)="onQueryChange($event)"
            placeholder="Patient name, MRN, invoice no. or phone"
            class="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none transition-colors" />
        </div>
        <div class="relative">
          <boo-icon name="scan-barcode" [size]="14" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></boo-icon>
          <input type="text" [(ngModel)]="barcode" (keydown.enter)="onBarcodeSubmit()"
            placeholder="Scan barcode…"
            class="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none transition-colors" />
        </div>
        <button type="button" (click)="onQueryChange(query)"
          class="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5">
          <boo-icon name="search" [size]="14"></boo-icon> Search
        </button>
      </div>

      <div *ngIf="advancedOpen()" class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Invoice Date From</label>
          <input type="date" [(ngModel)]="dateFrom" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400/40" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Invoice Date To</label>
          <input type="date" [(ngModel)]="dateTo" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400/40" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Department</label>
          <input type="text" [(ngModel)]="department" placeholder="Any department" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400/40" />
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-1.5">
        <button *ngFor="let chip of statusChips" type="button" (click)="selectStatus(chip.value)"
          class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          [ngClass]="activeStatus() === chip.value
            ? 'bg-amber-500/15 border-amber-400 text-amber-800'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'">
          {{ chip.label }}
        </button>
      </div>
    </div>
  `,
})
export class CashierSearchPanelComponent {
    @Output() searchChange = new EventEmitter<string>();
    @Output() statusChange = new EventEmitter<CashierInvoiceStatus | 'All'>();
    @Output() barcodeSubmit = new EventEmitter<string>();

    advancedOpen = signal(false);
    activeStatus = signal<CashierInvoiceStatus | 'All'>('All');

    query = '';
    barcode = '';
    dateFrom = '';
    dateTo = '';
    department = '';

    readonly statusChips: StatusChip[] = [
        { label: 'All', value: 'All' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Partially Paid', value: 'PartiallyPaid' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Insurance Pending', value: 'InsurancePending' },
        { label: 'Cancelled', value: 'Cancelled' },
        { label: 'Refunded', value: 'Refunded' },
    ];

    private searchDebounce?: ReturnType<typeof setTimeout>;

    onQueryChange(value: string): void {
        clearTimeout(this.searchDebounce);
        this.searchDebounce = setTimeout(() => this.searchChange.emit(value), 250);
    }

    onBarcodeSubmit(): void {
        if (!this.barcode.trim()) return;
        this.barcodeSubmit.emit(this.barcode.trim());
        this.barcode = '';
    }

    selectStatus(status: CashierInvoiceStatus | 'All'): void {
        this.activeStatus.set(status);
        this.statusChange.emit(status);
    }
}
