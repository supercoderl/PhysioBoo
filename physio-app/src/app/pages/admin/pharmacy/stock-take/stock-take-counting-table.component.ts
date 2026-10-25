import { Component, ElementRef, EventEmitter, inject, Input, Output } from "@angular/core";
import { BooInputComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { STOCK_TAKE_REASONS, stockTakeReasonLabel } from "../../../../shared/types/stock-take.types";
import { CountRow } from "./stock-take-counting.model";

/**
 * The entry grid. A native table is used on purpose: every row is an editor with its own unsaved / invalid state and
 * Enter / arrow-key movement between the count fields, which the read-only admin table does not offer.
 */
@Component({
    selector: 'stock-take-counting-table',
    standalone: true,
    imports: [SharedModule, BooInputComponent, BooSelectComponent],
    host: { class: 'block h-full min-h-0 min-w-0' },
    template: `
    <div class="boo-scrollbar h-full overflow-auto">
      <table class="w-full min-w-[920px] text-sm border-collapse">
        <caption class="sr-only">Medicine batches to count. Enter the counted quantity of each batch.</caption>
        <thead class="sticky top-0 z-10 bg-gray-50">
          <tr class="text-left text-[11px] text-secondary uppercase tracking-wide bg-gray-50 border-y border-borderGray/60">
            <th scope="col" class="px-4 py-2.5 font-semibold">Medicine</th>
            <th scope="col" class="px-3 py-2.5 font-semibold">Batch / expiry</th>
            <th scope="col" class="px-3 py-2.5 font-semibold text-right">System</th>
            <th scope="col" class="px-3 py-2.5 font-semibold w-36">Counted</th>
            <th scope="col" class="px-3 py-2.5 font-semibold text-right">Difference</th>
            <th scope="col" class="px-3 py-2.5 font-semibold w-52">Reason</th>
            <th scope="col" class="px-4 py-2.5 font-semibold w-52">Note</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows; let i = index; trackBy: trackById" [attr.data-item-id]="row.item.id"
            class="border-b border-borderGray/50 align-top transition-colors"
            [ngClass]="row.error ? 'bg-rose-50/60' : row.dirty ? 'bg-amber-50/60' : ''">
            <td class="px-4 py-3 min-w-0">
              <div class="flex items-start gap-2">
                <span class="mt-1.5 flex-none w-2 h-2 rounded-full" [ngClass]="row.dirty ? 'bg-amber-500' : row.counted ? 'bg-emerald-500' : 'bg-gray-300'" aria-hidden="true"></span>
                <div class="min-w-0 leading-tight">
                  <p class="m-0 font-semibold text-regular break-words">{{ row.item.itemName || 'Unnamed medicine' }}</p>
                  <p class="m-0 mt-0.5 text-[11px] text-secondary">
                    {{ row.item.itemCode || 'No code' }}<ng-container *ngIf="row.item.unit"> · {{ row.item.unit }}</ng-container><ng-container *ngIf="row.item.barcode"> · {{ row.item.barcode }}</ng-container>
                  </p>
                  <p class="m-0 mt-0.5 text-[11px] font-medium" [ngClass]="row.dirty ? 'text-amber-700' : row.counted ? 'text-emerald-700' : 'text-secondary'">
                    {{ row.dirty ? 'Unsaved' : row.counted ? 'Counted' : 'Not counted' }}
                  </p>
                </div>
              </div>
            </td>

            <td class="px-3 py-3 leading-tight whitespace-nowrap">
              <div class="text-regular">{{ row.item.batchNo || '—' }}</div>
              <div class="text-[11px]" [ngClass]="row.expired ? 'text-rose-600 font-semibold' : 'text-secondary'">
                {{ row.item.expiryDate ? (row.item.expiryDate | date:'mediumDate') : 'No expiry' }}<ng-container *ngIf="row.expired"> · Expired</ng-container>
              </div>
            </td>

            <td class="px-3 py-3 text-right font-semibold text-regular tabular-nums">{{ row.item.systemQty | number }}</td>

            <td class="px-3 py-3" (keydown.enter)="move($event, i, 1)" (keydown.arrowdown)="move($event, i, 1)" (keydown.arrowup)="move($event, i, -1)">
              <boo-input *ngIf="editable; else qtyReadonly" size="small" type="number" label="Quantity" [maxlength]="10"
                [id]="qtyId(row.item.id)" [ngModel]="row.qtyText" (ngModelChange)="qtyChange.emit({ id: row.item.id, text: $event })"></boo-input>
              <ng-template #qtyReadonly>
                <span class="font-semibold tabular-nums text-regular">{{ row.qty === null ? '—' : (row.qty | number) }}</span>
              </ng-template>
              <p *ngIf="row.error" class="m-0 mt-1 text-xs text-danger" role="alert">{{ row.error }}</p>
            </td>

            <td class="px-3 py-3 text-right tabular-nums font-semibold whitespace-nowrap"
              [ngClass]="row.difference === null || row.difference === 0 ? 'text-secondary' : row.difference < 0 ? 'text-rose-600' : 'text-emerald-700'">
              <ng-container *ngIf="row.difference !== null; else noDiff">{{ row.difference > 0 ? '+' : '' }}{{ row.difference | number }}</ng-container>
              <ng-template #noDiff>—</ng-template>
            </td>

            <td class="px-3 py-3">
              <boo-select *ngIf="editable; else reasonReadonly" size="small" label="Reason" [options]="reasons" bindLabel="label" bindValue="value"
                [disabled]="!row.difference" [ngModel]="row.reason" (ngModelChange)="reasonChange.emit({ id: row.item.id, reason: $event })"></boo-select>
              <ng-template #reasonReadonly><span class="text-secondary">{{ row.reason ? reasonLabel(row.reason) : '—' }}</span></ng-template>
            </td>

            <td class="px-4 py-3">
              <boo-input *ngIf="editable; else noteReadonly" size="small" label="Note (optional)" [maxlength]="500"
                [ngModel]="row.notes" (ngModelChange)="notesChange.emit({ id: row.item.id, notes: $event })"></boo-input>
              <ng-template #noteReadonly><span class="text-secondary break-words">{{ row.notes || '—' }}</span></ng-template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class StockTakeCountingTableComponent {
    private readonly host = inject(ElementRef<HTMLElement>);

    @Input() rows: CountRow[] = [];
    /** False for sessions that are not being counted, or when the user cannot save counts. */
    @Input() editable = false;

    @Output() qtyChange = new EventEmitter<{ id: string; text: string }>();
    @Output() reasonChange = new EventEmitter<{ id: string; reason: string | null }>();
    @Output() notesChange = new EventEmitter<{ id: string; notes: string }>();

    readonly reasons = STOCK_TAKE_REASONS;
    reasonLabel = stockTakeReasonLabel;

    qtyId(itemId: string): string {
        return `qty-${itemId}`;
    }

    trackById(_: number, row: CountRow): string {
        return row.item.id;
    }

    focusQty(itemId: string): void {
        const input = (this.host.nativeElement as HTMLElement).querySelector<HTMLInputElement>(`[id="${this.qtyId(itemId)}"]`);
        input?.focus();
        input?.select();
    }

    /** Enter and the arrow keys step through the count fields instead of submitting or nudging the number. */
    move(event: Event, index: number, step: 1 | -1): void {
        event.preventDefault();
        const target = this.rows[index + step];
        if (target) this.focusQty(target.item.id);
    }
}
