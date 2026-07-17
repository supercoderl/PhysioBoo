import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTake, StockTakeItem } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-difference-dialog',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-100 flex flex-col">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <boo-icon name="scale" iconClass="text-primary" [size]="20"></boo-icon>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Difference Detail — {{ stockTake?.code }}</h3>
              <p class="text-sm text-gray-500 mt-1">Items with a variance between System Qty and Actual Qty</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">
            <boo-icon name="x" [size]="18"></boo-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6" custom-scrollbar>
          <boo-empty-state *ngIf="!loading && !differences.length" icon="circle-check" title="No differences found" description="Every counted item matches system stock."></boo-empty-state>

          <div *ngIf="loading" class="flex items-center justify-center py-10">
            <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
          </div>

          <table class="w-full text-sm" *ngIf="!loading && differences.length">
            <thead>
              <tr class="text-left text-xs text-secondary uppercase tracking-wide border-b border-gray-100">
                <th class="py-2 pr-2 font-semibold">Item</th>
                <th class="py-2 pr-2 font-semibold text-right">System</th>
                <th class="py-2 pr-2 font-semibold text-right">Actual</th>
                <th class="py-2 pr-2 font-semibold text-right">Diff</th>
                <th class="py-2 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of differences" class="border-b border-gray-50">
                <td class="py-2.5 pr-2">
                  <p class="font-medium text-gray-800">{{ item.itemName }}</p>
                  <p class="text-xs text-gray-400">{{ item.itemCode }} · {{ item.batchNo }}</p>
                </td>
                <td class="py-2.5 pr-2 text-right text-gray-600">{{ item.systemQty }}</td>
                <td class="py-2.5 pr-2 text-right text-gray-600">{{ item.actualQty }}</td>
                <td class="py-2.5 pr-2 text-right font-semibold" [ngClass]="item.difference < 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ item.difference > 0 ? '+' : '' }}{{ item.difference }}
                </td>
                <td class="py-2.5 text-gray-600">{{ item.reason ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeDifferenceDialogComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() stockTake: StockTake | null = null;
    @Output() close = new EventEmitter<void>();

    differences: StockTakeItem[] = [];
    loading = false;

    constructor(private srv: StockTakeService) { }

    ngOnChanges(): void {
        if (this.isOpen && this.stockTake) this.load(this.stockTake.id);
    }

    private load(id: string): void {
        this.loading = true;
        this.srv.getItems(id).subscribe({
            next: res => { if (res.success) this.differences = res.data.filter(i => i.difference !== 0); this.loading = false; },
            error: () => this.loading = false,
        });
    }
}
