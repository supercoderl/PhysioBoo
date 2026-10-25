import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTake, StockTakeItem, stockTakeReasonLabel } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-difference-dialog',
    standalone: true,
    imports: [SharedModule, BooEmptyStateComponent, BooErrorStateComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="stock-take-diff-title" (keydown.escape)="close.emit()">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-100 flex flex-col">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <physio-icon name="scale" [size]="20" class="text-primary"></physio-icon>
            </div>
            <div>
              <h3 id="stock-take-diff-title" class="text-lg font-semibold text-gray-900">Differences — {{ stockTake?.code }}</h3>
              <p class="text-sm text-gray-500 mt-1">Counted batches whose quantity differs from the system quantity at the start of counting</p>
            </div>
          </div>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close differences">
            <physio-icon name="x" [size]="18"></physio-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6" custom-scrollbar>
          <boo-error-state *ngIf="!loading && failed" title="We couldn't load the items" (retry)="load(stockTake!.id)"></boo-error-state>
          <boo-empty-state *ngIf="!loading && !failed && !differences.length" icon="circle-check" title="No differences found" description="Every counted item matches the system quantity."></boo-empty-state>

          <div *ngIf="loading" class="flex items-center justify-center py-10">
            <physio-icon name="loader-circle" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
          </div>

          <table class="w-full text-sm" *ngIf="!loading && !failed && differences.length">
            <thead>
              <tr class="text-left text-xs text-secondary uppercase tracking-wide border-b border-gray-100">
                <th scope="col" class="py-2 pr-2 font-semibold">Item</th>
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
                  <p class="text-xs text-gray-400">{{ item.itemCode || '—' }} · Batch {{ item.batchNo || '—' }}</p>
                </td>
                <td class="py-2.5 pr-2 text-right text-gray-600">{{ item.systemQty }}</td>
                <td class="py-2.5 pr-2 text-right text-gray-600">{{ item.actualQty }}</td>
                <td class="py-2.5 pr-2 text-right font-semibold" [ngClass]="item.difference < 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ item.difference > 0 ? '+' : '' }}{{ item.difference }}
                </td>
                <td class="py-2.5 text-gray-600">{{ reasonLabel(item.reason) }}</td>
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
    failed = false;
    reasonLabel = stockTakeReasonLabel;

    constructor(private srv: StockTakeService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isOpen && this.stockTake && (changes['isOpen'] || changes['stockTake'])) this.load(this.stockTake.id);
    }

    load(id: string): void {
        this.loading = true;
        this.failed = false;
        this.srv.getItems(id).subscribe({
            next: res => {
                this.failed = !res.success;
                this.differences = res.success ? res.data.filter(i => i.isCounted && i.difference !== 0) : [];
                this.loading = false;
            },
            error: () => { this.failed = true; this.loading = false; },
        });
    }
}
