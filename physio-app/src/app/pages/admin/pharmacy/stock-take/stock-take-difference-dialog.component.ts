import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooEmptyStateComponent, BooErrorStateComponent, BooButtonComponent, BooDialogComponent, BooSpinnerComponent } from '@physioboo/ui';
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTake, StockTakeItem, stockTakeReasonLabel } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-difference-dialog',
    standalone: true,
    imports: [SharedModule, BooEmptyStateComponent, BooErrorStateComponent, BooButtonComponent, BooDialogComponent, BooSpinnerComponent],
    template: `
    <boo-dialog *ngIf="isOpen" size="lg" [heading]="'Differences — ' + stockTake?.code" description="Counted batches whose quantity differs from the system quantity at the start of counting" icon="scale" (dismiss)="close.emit()">
        <div>
          <boo-error-state *ngIf="!loading && failed" title="We couldn't load the items" (retry)="load(stockTake!.id)"></boo-error-state>
          <boo-empty-state *ngIf="!loading && !failed && !differences.length" icon="circle-check" title="No differences found" description="Every counted item matches the system quantity."></boo-empty-state>

          <div *ngIf="loading" class="flex items-center justify-center py-10">
            <boo-spinner [inline]="true" tone="primary" [size]="24" />
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
    </boo-dialog>
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
