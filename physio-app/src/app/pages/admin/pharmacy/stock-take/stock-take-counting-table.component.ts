import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { Subject, debounceTime } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { STOCK_TAKE_REASONS, StockTakeItem } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-counting-table',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div class="h-full flex flex-col bg-surface border border-borderGray/60 rounded-2 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 flex items-center gap-3">
        <div class="relative flex-1 max-w-xs">
          <boo-icon name="scan-barcode" [size]="15" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
          <input #barcodeInput type="text" [(ngModel)]="barcode" (keyup.enter)="onScan()"
            placeholder="Scan or type barcode, then Enter"
            class="w-full pl-8 pr-3 h-9 border border-gray-300 rounded-1.5 text-[13px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
        </div>
        <div class="flex-1"></div>
        <span class="text-[11px] font-medium flex items-center gap-1.5" [ngClass]="saving ? 'text-amber-600' : 'text-emerald-600'">
          <boo-icon [name]="saving ? 'loader-circle' : 'check'" [size]="12" [iconClass]="saving ? 'animate-spin' : ''"></boo-icon>
          {{ saving ? 'Saving…' : (lastSavedLabel) }}
        </span>
      </div>

      <div class="flex-1 overflow-auto" custom-scrollbar>
        <boo-empty-state *ngIf="!items.length" icon="package-search" title="No items in this category" class="py-16"></boo-empty-state>

        <table class="w-full text-sm" *ngIf="items.length">
          <thead class="sticky top-0 bg-gray-50 z-[1]">
            <tr class="text-left text-[11px] text-secondary uppercase tracking-wide">
              <th class="px-3 py-2.5 font-semibold">Item Code</th>
              <th class="px-3 py-2.5 font-semibold">Item Name</th>
              <th class="px-3 py-2.5 font-semibold">Batch</th>
              <th class="px-3 py-2.5 font-semibold">Expiry</th>
              <th class="px-3 py-2.5 font-semibold text-right">System Qty</th>
              <th class="px-3 py-2.5 font-semibold text-right">Actual Qty</th>
              <th class="px-3 py-2.5 font-semibold text-right">Difference</th>
              <th class="px-3 py-2.5 font-semibold">Reason</th>
              <th class="px-3 py-2.5 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items; trackBy: trackById" [attr.data-item-id]="item.id"
              class="border-b border-gray-50 transition-colors"
              [ngClass]="item.difference !== 0 ? 'bg-rose-50/40' : ''">
              <td class="px-3 py-2 text-gray-700 font-medium whitespace-nowrap">{{ item.itemCode }}</td>
              <td class="px-3 py-2 text-gray-800">
                <p class="font-medium">{{ item.itemName }}</p>
                <p class="text-[11px] text-gray-400">{{ item.unit }} · {{ item.barcode }}</p>
              </td>
              <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ item.batchNo }}</td>
              <td class="px-3 py-2 text-gray-600 whitespace-nowrap">{{ item.expiryDate ? (item.expiryDate | date:'mediumDate') : '—' }}</td>
              <td class="px-3 py-2 text-right text-gray-600 font-medium">{{ item.systemQty }}</td>
              <td class="px-3 py-2 text-right">
                <input type="number" min="0" [ngModel]="item.actualQty" (ngModelChange)="onActualQtyChange(item, $event)"
                  class="w-20 text-right px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </td>
              <td class="px-3 py-2 text-right font-semibold whitespace-nowrap" [ngClass]="item.difference < 0 ? 'text-rose-600' : item.difference > 0 ? 'text-emerald-600' : 'text-gray-400'">
                {{ item.difference > 0 ? '+' : '' }}{{ item.difference }}
              </td>
              <td class="px-3 py-2">
                <select [ngModel]="item.reason" (ngModelChange)="onFieldChange(item, 'reason', $event)"
                  [disabled]="item.difference === 0"
                  class="w-36 px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none disabled:bg-gray-50 disabled:text-gray-400">
                  <option [ngValue]="null">Select reason</option>
                  <option *ngFor="let r of reasons" [ngValue]="r.value">{{ r.label }}</option>
                </select>
              </td>
              <td class="px-3 py-2">
                <input type="text" [ngModel]="item.notes" (ngModelChange)="onFieldChange(item, 'notes', $event)"
                  placeholder="Optional note"
                  class="w-32 px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex-none p-3 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0">
        <button type="button" (click)="saveNow.emit()"
          class="px-4 py-2 rounded-1.5 bg-primary text-white text-sm font-semibold hover:opacity-90 flex items-center gap-1.5">
          <boo-icon name="save" [size]="15"></boo-icon> Save Progress
        </button>
      </div>
    </div>
  `,
})
export class StockTakeCountingTableComponent implements OnChanges, OnDestroy {
    @Input() items: StockTakeItem[] = [];
    @Input() saving = false;
    @Output() itemsChange = new EventEmitter<StockTakeItem[]>();
    @Output() autosave = new EventEmitter<StockTakeItem[]>();
    @Output() saveNow = new EventEmitter<void>();

    barcode = '';
    lastSavedAt = new Date();
    reasons = STOCK_TAKE_REASONS;

    private changeSubject = new Subject<void>();
    private sub = this.changeSubject.pipe(debounceTime(800)).subscribe(() => {
        this.autosave.emit(this.items);
        this.lastSavedAt = new Date();
    });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['items']) this.lastSavedAt = new Date();
    }

    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    get lastSavedLabel(): string {
        const secs = Math.round((Date.now() - this.lastSavedAt.getTime()) / 1000);
        if (secs < 5) return 'Saved just now';
        return `Saved ${secs}s ago`;
    }

    onActualQtyChange(item: StockTakeItem, value: number | null): void {
        item.actualQty = value;
        item.difference = value === null ? 0 : value - item.systemQty;
        item.isCounted = value !== null;
        if (item.difference === 0) item.reason = null;
        this.itemsChange.emit(this.items);
        this.changeSubject.next();
    }

    onFieldChange(item: StockTakeItem, field: 'reason' | 'notes', value: string | null): void {
        (item as any)[field] = value;
        this.itemsChange.emit(this.items);
        this.changeSubject.next();
    }

    onScan(): void {
        const code = this.barcode.trim();
        if (!code) return;
        const match = this.items.find(i => i.barcode === code);
        if (!match) {
            this.barcode = '';
            return;
        }
        this.barcode = '';
        setTimeout(() => {
            const row = document.querySelector(`[data-item-id="${match.id}"]`);
            row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const input = row?.querySelector('input[type="number"]') as HTMLInputElement | null;
            input?.focus();
        });
    }

    trackById(_: number, item: StockTakeItem): string {
        return item.id;
    }
}
