import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseLineAction, DispenseMedicationItem } from "../../../../shared/types/dispensing.types";
import {
  batchOptionLabel,
  hasUnacknowledgedCritical,
  itemStatusLabel,
  itemStatusTone,
  quantityError,
  selectedBatch,
  severityTone,
  usableStock,
} from "../../../../shared/utils/dispensing.utils";

export type DispenseCardMode = 'review' | 'dispense';

let nextCardId = 0;

@Component({
  selector: 'dispense-medicine-card',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooInputComponent, BooStatusBadgeComponent, BooSelectComponent],
  template: `
    <article class="rounded-2 border bg-surface" [ngClass]="blocked ? 'border-rose-300' : 'border-borderGray/60'" [attr.aria-label]="item.name">
      <header class="flex items-start justify-between gap-3 p-4 pb-3">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-regular m-0 flex items-center flex-wrap gap-x-2 gap-y-1">
            {{ item.name }}<span *ngIf="item.strength" class="font-normal text-secondary">{{ item.strength }}</span>
            <boo-status-badge *ngIf="item.isHighAlert" label="High alert" tone="danger"></boo-status-badge>
            <boo-status-badge *ngIf="item.isControlledSubstance" label="Controlled" tone="warning"></boo-status-badge>
          </h3>
          <p class="text-xs text-secondary mt-0.5 mb-0">{{ descriptor }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted></boo-status-badge>
          <button boo-button variant="ghost" size="sm" [iconOnly]="true" (click)="act.emit({ type: 'details', item })" [attr.aria-label]="'Medicine details for ' + item.name">
            <physio-icon name="info" [size]="18"></physio-icon>
          </button>
        </div>
      </header>

      <!-- Prescription: what the prescriber ordered -->
      <dl class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 px-4 pb-3 m-0">
        <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Dose</dt><dd class="text-sm font-medium text-regular m-0">{{ item.dose || '—' }}</dd></div>
        <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Frequency</dt><dd class="text-sm font-medium text-regular m-0">{{ item.frequency || '—' }}</dd></div>
        <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Duration</dt><dd class="text-sm font-medium text-regular m-0">{{ item.durationDays }} {{ item.durationDays === 1 ? 'day' : 'days' }}</dd></div>
        <div><dt class="text-[11px] uppercase tracking-wide text-secondary">Prescribed</dt><dd class="text-sm font-medium text-regular m-0">{{ item.qtyPrescribed }} {{ item.unit }}</dd></div>
      </dl>

      <!-- Quantity progress -->
      <div class="px-4 pb-3">
        <div class="flex items-center justify-between text-xs text-secondary mb-1">
          <span>To dispense</span><span class="font-medium text-regular">{{ item.qtyToDispense }} of {{ item.qtyPrescribed }} {{ item.unit }}</span>
        </div>
        <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-label="Quantity to dispense" aria-valuemin="0" [attr.aria-valuemax]="item.qtyPrescribed" [attr.aria-valuenow]="item.qtyToDispense">
          <div class="h-full rounded-full bg-primary transition-[width]" [style.width.%]="quantityPercent"></div>
        </div>
      </div>

      <!-- Stock -->
      <div class="mx-4 mb-3 rounded-1.5 bg-gray-50 px-3 py-2 text-xs text-secondary flex flex-wrap items-center gap-x-4 gap-y-1">
        <ng-container *ngIf="batch as b; else noBatch">
          <span>Batch <strong class="text-regular">{{ b.batchNo }}</strong></span>
          <span *ngIf="b.expiryDate" [ngClass]="b.isExpired ? 'text-rose-600 font-semibold' : b.isNearExpiry ? 'text-amber-700 font-semibold' : ''">Exp {{ b.expiryDate }}<ng-container *ngIf="b.isExpired"> (expired)</ng-container><ng-container *ngIf="!b.isExpired && b.isNearExpiry"> (near expiry)</ng-container></span>
          <span>{{ b.quantityAvailable }} available in batch</span>
        </ng-container>
        <ng-template #noBatch><span>No batch selected</span></ng-template>
        <span *ngIf="item.shelfLocation">Shelf {{ item.shelfLocation }}</span>
        <span>{{ totalStock }} {{ item.unit }} usable in stock</span>
      </div>

      <div *ngIf="stockWarning" class="mx-4 mb-3 flex items-start gap-2 rounded-1.5 bg-amber-50 px-3 py-2 text-xs text-amber-800" role="status">
        <physio-icon name="triangle-alert" [size]="14" class="mt-0.5 shrink-0"></physio-icon><span>{{ stockWarning }}</span>
      </div>

      <div *ngIf="item.warnings.length" class="mx-4 mb-3 flex flex-wrap items-center gap-2 text-xs">
        <physio-icon name="shield-alert" [size]="14" [class]="blocked ? 'text-rose-600' : 'text-amber-600'"></physio-icon>
        <ng-container *ngFor="let w of item.warnings">
          <boo-status-badge [label]="w.severity + (w.acknowledged ? ' · acknowledged' : '')" [tone]="w.acknowledged ? 'neutral' : severityTone(w.severity)"></boo-status-badge>
        </ng-container>
        <span *ngIf="blocked" class="text-rose-700 font-medium">Acknowledge the Critical alert to continue.</span>
      </div>

      <!-- Dispensing actions -->
      <footer *ngIf="mode === 'dispense' && item.status !== 'Dispensed'" class="border-t border-borderGray/60 bg-gray-50/60 p-4 rounded-b-2 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <div>
            <label class="block text-xs font-medium text-secondary mb-1" [for]="id + '-qty'">Quantity</label>
            <boo-input [id]="id + '-qty'" name="qty" label="Quantity" type="number" [maxlength]="6" [debounce]="600" [disabled]="locked"
              [ngModel]="qtyDraft" (ngModelChange)="qtyDraft = $event" (search)="commitQuantity($event)"></boo-input>
            <p *ngIf="qtyError" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ qtyError }}</p>
          </div>
          <div>
            <span class="block text-xs font-medium text-secondary mb-1">Batch</span>
            <boo-select label="Select batch" [options]="batchOptions" bindLabel="label" bindValue="value"
              [ngModel]="item.batchNo || null" (ngModelChange)="onBatch($event)" [disabled]="locked || !batchOptions.length"></boo-select>
          </div>
          <div>
            <label class="block text-xs font-medium text-secondary mb-1" [for]="id + '-scan'">Verify by scan</label>
            <boo-input [id]="id + '-scan'" name="scan" label="Barcode, drug code or batch no." [maxlength]="100" [disabled]="locked || blocked"
              [(ngModel)]="scanDraft" (keydown.enter)="submitScan()"></boo-input>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button *ngIf="item.status !== 'OnHold'" boo-button size="sm" [variant]="isPicked ? 'soft' : 'primary'" [disabled]="locked || (!isPicked && blocked)" [loading]="busyAction === 'status'"
            (click)="act.emit({ type: 'status', item, status: isPicked ? 'NotPicked' : 'Picked' })">
            <physio-icon [name]="isPicked ? 'rotate-cw' : 'check'" [size]="16"></physio-icon>{{ isPicked ? 'Undo pick' : 'Mark picked' }}
          </button>
          <button *ngIf="item.status === 'OnHold'" boo-button size="sm" variant="primary" [disabled]="locked" [loading]="busyAction === 'status'"
            (click)="act.emit({ type: 'status', item, status: 'NotPicked' })">Resume line</button>
          <button boo-button size="sm" variant="secondary" [disabled]="locked || !item.batchNo || item.status === 'Reserved'" [loading]="busyAction === 'reserve'"
            (click)="act.emit({ type: 'reserve', item })"><physio-icon name="package-search" [size]="16"></physio-icon>Reserve stock</button>
          <button *ngIf="item.alternatives.length" boo-button size="sm" variant="secondary" [disabled]="locked"
            (click)="act.emit({ type: 'substitute', item })"><physio-icon name="repeat" [size]="16"></physio-icon>Substitute</button>
          <button *ngIf="item.status !== 'OnHold'" boo-button size="sm" variant="ghost" [disabled]="locked" [loading]="busyAction === 'hold'"
            (click)="act.emit({ type: 'status', item, status: 'OnHold' })"><physio-icon name="pause" [size]="16"></physio-icon>Hold line</button>
        </div>
      </footer>
    </article>
  `,
})
export class DispenseMedicineCardComponent implements OnChanges {
  @Input({ required: true }) item!: DispenseMedicationItem;
  @Input() mode: DispenseCardMode = 'review';
  /** Any page mutation is in flight; every control is disabled so a request cannot be submitted twice. */
  @Input() locked = false;
  /** Which action of this card is the one in flight, to show its spinner. */
  @Input() busyAction: 'status' | 'reserve' | 'hold' | null = null;
  @Output() act = new EventEmitter<DispenseLineAction>();

  readonly id = `dispense-line-${++nextCardId}`;
  readonly statusLabel = itemStatusLabel;
  readonly statusTone = itemStatusTone;
  readonly severityTone = severityTone;

  qtyDraft: number | string = 0;
  scanDraft = '';
  qtyError: string | null = null;
  batchOptions: { label: string; value: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['item']) return;
    this.qtyDraft = this.item.qtyToDispense;
    this.qtyError = null;
    this.batchOptions = this.item.availableBatches
      .filter(b => !b.isExpired || b.batchNo === this.item.batchNo)
      .map(b => ({ label: batchOptionLabel(b), value: b.batchNo }));
  }

  get descriptor(): string {
    return [this.item.genericName, this.item.dosageForm, this.item.route].filter(Boolean).join(' · ');
  }

  get batch() {
    return selectedBatch(this.item);
  }

  get totalStock(): number {
    return usableStock(this.item);
  }

  get blocked(): boolean {
    return hasUnacknowledgedCritical(this.item);
  }

  get isPicked(): boolean {
    return this.item.status === 'Picked' || this.item.status === 'Verified';
  }

  get quantityPercent(): number {
    return this.item.qtyPrescribed > 0 ? Math.min(100, (this.item.qtyToDispense / this.item.qtyPrescribed) * 100) : 0;
  }

  /** Same rule the server applies at completion: the chosen batch must cover the quantity. */
  get stockWarning(): string | null {
    if (this.item.status === 'Dispensed') return null;
    if (this.totalStock === 0) return 'No usable stock for this medicine. Reserve is unavailable and completion will be rejected.';
    const batch = this.batch;
    if (batch && this.item.qtyToDispense > batch.quantityAvailable) {
      return `Batch ${batch.batchNo} has ${batch.quantityAvailable} available but ${this.item.qtyToDispense} are needed. Choose another batch or lower the quantity.`;
    }
    return null;
  }

  commitQuantity(value: string): void {
    this.qtyError = quantityError(value, this.item.qtyPrescribed);
    if (this.qtyError || Number(value) === this.item.qtyToDispense) return;
    this.act.emit({ type: 'quantity', item: this.item, qty: Number(value) });
  }

  onBatch(batchNo: string | null): void {
    if (!batchNo || batchNo === this.item.batchNo) return;
    this.act.emit({ type: 'batch', item: this.item, batchNo });
  }

  submitScan(): void {
    const code = this.scanDraft.trim();
    if (!code || this.locked || this.blocked) return;
    this.act.emit({ type: 'scan', item: this.item, code });
    this.scanDraft = '';
  }
}
