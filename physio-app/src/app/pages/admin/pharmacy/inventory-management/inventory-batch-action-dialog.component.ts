import { Component, ElementRef, EventEmitter, HostListener, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { BatchActionKind, BatchActionRequest, freeQuantity, InventoryBatch, InventoryZone } from "../../../../shared/types/inventory-management.types";

type FieldName = 'quantity' | 'newQuantity' | 'purchasePrice' | 'expiryDate' | 'toZoneId' | 'reason';

interface ActionCopy {
    title: string;
    description: string;
    submit: string;
    icon: string;
    tone: 'primary' | 'danger';
}

const REASON_MAX_LENGTH = 500;

const ACTION_COPY: Record<BatchActionKind, ActionCopy> = {
    receive: { title: 'Receive stock', description: 'Add delivered units to this batch.', submit: 'Receive stock', icon: 'inbox', tone: 'primary' },
    adjust: { title: 'Adjust quantity', description: 'Correct the on-hand quantity after a count. The change is logged with your reason.', submit: 'Save adjustment', icon: 'pencil', tone: 'primary' },
    transfer: { title: 'Transfer batch', description: 'Move units to another warehouse zone.', submit: 'Transfer', icon: 'truck', tone: 'primary' },
    dispose: { title: 'Dispose stock', description: 'Write off damaged or expired units. This cannot be undone.', submit: 'Dispose', icon: 'trash', tone: 'danger' },
};

@Component({
    selector: 'inventory-batch-action-dialog',
    standalone: true,
    imports: [SharedModule, BooButtonComponent, BooInputComponent, BooSelectComponent, BooDatepickerComponent, BooTextareaComponent],
    template: `
    <div *ngIf="isOpen && kind && batch" class="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" aria-hidden="true" (click)="requestClose()"></div>

      <form
        #dialogEl
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-labelledby]="titleId"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        novalidate
        class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-100 outline-none"
      >
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [ngClass]="copy.tone === 'danger' ? 'bg-rose-50' : 'bg-primary/10'">
            <physio-icon [name]="copy.icon" [size]="20" [class]="copy.tone === 'danger' ? 'text-rose-600' : 'text-primary'"></physio-icon>
          </div>
          <div class="min-w-0">
            <h3 [id]="titleId" class="text-lg font-semibold text-gray-900 m-0">{{ copy.title }}</h3>
            <p class="text-sm text-secondary mt-1 mb-0 leading-relaxed">{{ copy.description }}</p>
          </div>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4" custom-scrollbar>
          <dl class="grid grid-cols-3 gap-2 m-0 text-center">
            <div class="col-span-3 text-left">
              <dt class="sr-only">Batch</dt>
              <dd class="m-0 text-sm font-semibold text-regular truncate">{{ medicineName }} · {{ batch.batchNo || 'No batch number' }}</dd>
            </div>
            <div class="rounded-1.5 bg-gray-50 px-2 py-2">
              <dt class="text-[11px] text-secondary">On hand</dt>
              <dd class="m-0 text-sm font-semibold text-regular tabular-nums">{{ batch.quantity | number }}</dd>
            </div>
            <div class="rounded-1.5 bg-gray-50 px-2 py-2">
              <dt class="text-[11px] text-secondary">Reserved</dt>
              <dd class="m-0 text-sm font-semibold text-regular tabular-nums">{{ batch.reservedQuantity | number }}</dd>
            </div>
            <div class="rounded-1.5 bg-gray-50 px-2 py-2">
              <dt class="text-[11px] text-secondary">Free</dt>
              <dd class="m-0 text-sm font-semibold text-regular tabular-nums">{{ free | number }}</dd>
            </div>
          </dl>
          <p *ngIf="unit" class="text-xs text-secondary m-0 -mt-2">Quantities are in {{ unit }}.</p>

          <ng-container [ngSwitch]="kind">
            <ng-container *ngSwitchCase="'receive'">
              <div>
                <boo-input label="Quantity received" type="number" formControlName="quantity" required></boo-input>
                <p *ngIf="error('quantity') as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              </div>
              <div>
                <boo-input label="Unit purchase price (optional)" type="number" formControlName="purchasePrice"></boo-input>
                <p *ngIf="error('purchasePrice') as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              </div>
              <boo-datepicker label="Expiry date (optional)" formControlName="expiryDate"></boo-datepicker>
            </ng-container>

            <ng-container *ngSwitchCase="'adjust'">
              <div>
                <boo-input label="New on-hand quantity" type="number" formControlName="newQuantity" required></boo-input>
                <p *ngIf="error('newQuantity') as msg; else adjustHint" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
                <ng-template #adjustHint>
                  <p class="mt-1 mb-0 text-xs text-secondary">Currently {{ batch.quantity | number }}<ng-container *ngIf="batch.reservedQuantity"> · cannot go below the {{ batch.reservedQuantity | number }} reserved</ng-container>.</p>
                </ng-template>
              </div>
              <div>
                <boo-textarea label="Reason" formControlName="reason" required [rows]="3" [maxlength]="reasonMaxLength"></boo-textarea>
                <p *ngIf="error('reason') as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'transfer'">
              <div>
                <boo-select label="Destination zone" formControlName="toZoneId" required [options]="zones" bindLabel="name" bindValue="id"></boo-select>
                <p *ngIf="zonesState === 'loading'" class="mt-1 mb-0 text-xs text-secondary">Loading zones…</p>
                <p *ngIf="zonesState === 'error'" class="mt-1 mb-0 text-xs text-danger" role="alert">Couldn't load warehouse zones. Close this dialog and try again.</p>
                <p *ngIf="error('toZoneId') as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              </div>
              <div>
                <boo-input label="Quantity to move" type="number" formControlName="quantity" required></boo-input>
                <p *ngIf="error('quantity') as msg; else transferHint" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
                <ng-template #transferHint>
                  <p class="mt-1 mb-0 text-xs text-secondary">Up to {{ free | number }} unreserved units. Moving part of the batch splits it.</p>
                </ng-template>
              </div>
            </ng-container>

            <ng-container *ngSwitchCase="'dispose'">
              <div>
                <boo-input label="Quantity to dispose" type="number" formControlName="quantity" required></boo-input>
                <p *ngIf="error('quantity') as msg; else disposeHint" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
                <ng-template #disposeHint>
                  <p class="mt-1 mb-0 text-xs text-secondary">Up to {{ free | number }} unreserved units.</p>
                </ng-template>
              </div>
              <div>
                <boo-textarea label="Reason" formControlName="reason" required [rows]="3" [maxlength]="reasonMaxLength"></boo-textarea>
                <p *ngIf="error('reason') as msg" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              </div>
              <p class="m-0 rounded-1.5 bg-rose-50 px-3 py-2 text-xs text-rose-700" role="note">
                Disposed units leave the sellable pool for good. Disposing the whole batch closes it.
              </p>
            </ng-container>
          </ng-container>
        </div>

        <div class="flex-none px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button boo-button type="button" variant="secondary" (click)="requestClose()" [disabled]="submitting">Cancel</button>
          <button
            boo-button
            type="submit"
            variant="primary"
            [classname]="copy.tone === 'danger' ? '!bg-rose-600 hover:!bg-rose-700' : ''"
            [loading]="submitting"
            [disabled]="submitting || (kind === 'transfer' && zonesState !== 'ready')"
          >{{ copy.submit }}</button>
        </div>
      </form>
    </div>
  `,
})
export class InventoryBatchActionDialogComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() kind: BatchActionKind | null = null;
    @Input() batch: InventoryBatch | null = null;
    @Input() medicineName = '';
    @Input() unit: string | null = null;
    @Input() zones: InventoryZone[] = [];
    @Input() zonesState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
    /** Owned by the parent: true from the moment the request is sent until it settles. */
    @Input() submitting = false;
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<BatchActionRequest>();
    @ViewChild('dialogEl') dialogEl?: ElementRef<HTMLFormElement>;

    readonly titleId = 'inventory-batch-action-title';
    readonly reasonMaxLength = REASON_MAX_LENGTH;

    private readonly fb = inject(FormBuilder);

    readonly form = this.fb.group({
        quantity: [null as number | string | null],
        newQuantity: [null as number | string | null],
        purchasePrice: [null as number | string | null],
        expiryDate: [null as string | null],
        toZoneId: [null as string | null],
        reason: [''],
    });

    private attempted = false;
    private returnFocusTo: HTMLElement | null = null;

    get copy(): ActionCopy {
        return ACTION_COPY[this.kind ?? 'receive'];
    }

    get free(): number {
        return this.batch ? freeQuantity(this.batch) : 0;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['isOpen'] && this.isOpen;
        const retargeted = this.isOpen && (changes['kind'] || changes['batch']) && !changes['isOpen'];
        if (opened || retargeted) this.reset();

        if (changes['isOpen'] && !this.isOpen) {
            const target = this.returnFocusTo;
            this.returnFocusTo = null;
            setTimeout(() => target?.focus());
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscape(event: Event): void {
        if (!this.isOpen) return;
        // Marks the key as handled so the stock panel behind the dialog stays open.
        event.preventDefault();
        this.requestClose();
    }

    requestClose(): void {
        if (!this.submitting) this.close.emit();
    }

    /** The message for a field, once it has been touched or a submit was attempted. */
    error(field: FieldName): string | null {
        const control = this.form.controls[field];
        if (!this.attempted && !control.touched && !control.dirty) return null;
        return this.validate()[field] ?? null;
    }

    onSubmit(): void {
        if (this.submitting || !this.kind || !this.batch) return;

        this.attempted = true;
        this.form.markAllAsTouched();
        if (Object.keys(this.validate()).length > 0) return;

        const v = this.form.getRawValue();
        switch (this.kind) {
            case 'receive':
                this.confirm.emit({
                    kind: 'receive',
                    payload: {
                        quantity: Number(v.quantity),
                        purchasePrice: this.isBlank(v.purchasePrice) ? null : Number(v.purchasePrice),
                        expiryDate: v.expiryDate || null,
                    },
                });
                break;
            case 'adjust':
                this.confirm.emit({ kind: 'adjust', payload: { newQuantity: Number(v.newQuantity), reason: (v.reason ?? '').trim() } });
                break;
            case 'transfer':
                this.confirm.emit({ kind: 'transfer', payload: { toZoneId: v.toZoneId as string, quantity: Number(v.quantity) } });
                break;
            case 'dispose':
                this.confirm.emit({ kind: 'dispose', payload: { quantity: Number(v.quantity), reason: (v.reason ?? '').trim() } });
                break;
        }
    }

    /** Same rules as the API (`ChangeBatchCommandValidation` / `ChangeBatchCommandHandler`), checked before sending. */
    private validate(): Partial<Record<FieldName, string>> {
        const errors: Partial<Record<FieldName, string>> = {};
        const batch = this.batch;
        if (!this.kind || !batch) return errors;

        const v = this.form.getRawValue();
        const free = freeQuantity(batch);
        const reason = (v.reason ?? '').trim();

        const checkQuantity = (value: unknown, field: 'quantity' | 'newQuantity', max?: number, min = 1) => {
            if (this.isBlank(value)) { errors[field] = 'Enter a quantity.'; return; }
            const n = Number(value);
            if (!Number.isInteger(n)) errors[field] = 'Enter a whole number.';
            else if (n < min) errors[field] = min === 0 ? 'Quantity cannot be negative.' : 'Quantity must be greater than 0.';
            else if (max !== undefined && n > max) errors[field] = `Only ${max} unreserved unit${max === 1 ? '' : 's'} available.`;
        };

        const checkReason = () => {
            if (!reason) errors.reason = 'A reason is required.';
            else if (reason.length > REASON_MAX_LENGTH) errors.reason = `Reason may not exceed ${REASON_MAX_LENGTH} characters.`;
        };

        switch (this.kind) {
            case 'receive':
                checkQuantity(v.quantity, 'quantity');
                if (!this.isBlank(v.purchasePrice) && !(Number(v.purchasePrice) >= 0)) errors.purchasePrice = 'Price cannot be negative.';
                break;
            case 'adjust':
                // 0 is valid: it empties the batch.
                checkQuantity(v.newQuantity, 'newQuantity', undefined, 0);
                if (!errors.newQuantity && Number(v.newQuantity) < batch.reservedQuantity) errors.newQuantity = `${batch.reservedQuantity} units are reserved; the quantity can't go below that.`;
                else if (!errors.newQuantity && Number(v.newQuantity) === batch.quantity) errors.newQuantity = 'This is already the on-hand quantity.';
                checkReason();
                break;
            case 'transfer':
                if (!v.toZoneId) errors.toZoneId = 'Choose a destination zone.';
                checkQuantity(v.quantity, 'quantity', free);
                break;
            case 'dispose':
                checkQuantity(v.quantity, 'quantity', free);
                checkReason();
                break;
        }

        return errors;
    }

    private isBlank(value: unknown): boolean {
        return value === null || value === undefined || value === '';
    }

    private reset(): void {
        this.attempted = false;
        this.form.reset({ quantity: null, newQuantity: null, purchasePrice: null, expiryDate: null, toZoneId: null, reason: '' });

        // A sensible starting point: adjust opens on the current quantity so only the change needs typing.
        if (this.kind === 'adjust' && this.batch) this.form.patchValue({ newQuantity: this.batch.quantity });

        this.returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setTimeout(() => {
            const el = this.dialogEl?.nativeElement;
            (el?.querySelector('input, textarea') as HTMLElement | null ?? el)?.focus();
        });
    }
}
