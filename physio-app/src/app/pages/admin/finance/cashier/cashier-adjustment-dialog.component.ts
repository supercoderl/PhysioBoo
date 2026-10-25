import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CashierInsuranceRequest, CashierInvoice, roundMoney } from "../../../../shared/types/cashier.types";
import { CashierDialogComponent } from "./cashier-dialog.component";

export type CashierAdjustmentKind = 'discount' | 'insurance' | 'void';
export type CashierCompaniesState = 'unavailable' | 'loading' | 'ready' | 'error';

export interface CashierCompanyOption {
    id: string;
    name: string;
}

export type CashierAdjustmentSubmit =
    | { kind: 'discount'; discountPercent: number }
    | { kind: 'insurance'; request: CashierInsuranceRequest }
    | { kind: 'void'; reason: string };

interface KindCopy {
    heading: string;
    description: string;
    submit: string;
    icon: string;
    tone: 'primary' | 'danger';
}

const REASON_MAX_LENGTH = 500;

const KIND_COPY: Record<CashierAdjustmentKind, KindCopy> = {
    discount: { heading: 'Apply discount', description: 'A percentage of the bill subtotal. It replaces any discount already on the bill.', submit: 'Apply discount', icon: 'badge-percent', tone: 'primary' },
    insurance: { heading: 'Apply insurance coverage', description: 'The covered amount is deducted from the bill total. It replaces any coverage already on the bill.', submit: 'Apply coverage', icon: 'shield-check', tone: 'primary' },
    void: { heading: 'Void bill', description: 'Cancels the bill so it can no longer be paid. This cannot be undone from this screen.', submit: 'Void bill', icon: 'ban', tone: 'danger' },
};

/** One dialog for the three bill-level changes, each with its own fields and validation. */
@Component({
    selector: 'cashier-adjustment-dialog',
    standalone: true,
    imports: [SharedModule, CashierDialogComponent, BooButtonComponent, BooInputComponent, BooSelectComponent, BooTextareaComponent],
    template: `
    <cashier-dialog
      [open]="open && !!bill && !!kind"
      [heading]="copy.heading"
      [description]="copy.description"
      [icon]="copy.icon"
      [tone]="copy.tone"
      [busy]="busy"
      (dismiss)="close.emit()"
      (submitForm)="submit()"
    >
      <ng-container *ngIf="bill as b">
        <p class="m-0 text-sm font-semibold text-regular truncate">{{ b.billNumber }} · {{ b.patientName || 'Unknown patient' }}</p>

        <fieldset class="m-0 p-0 border-0 space-y-4" [disabled]="busy" [ngSwitch]="kind">
          <ng-container *ngSwitchCase="'discount'">
            <div>
              <boo-input label="Discount (%)" type="number" [(ngModel)]="percent" required></boo-input>
              <p *ngIf="touched && percentError as msg; else percentHint" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              <ng-template #percentHint>
                <p class="mt-1 mb-0 text-xs text-secondary">Currently {{ b.discountPercent | number:'1.0-2' }}% ({{ b.discountAmount | currency:'USD':'symbol':'1.2-2' }}) on a subtotal of {{ b.subtotal | currency:'USD':'symbol':'1.2-2' }}.</p>
              </ng-template>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'insurance'">
            <div>
              <boo-select label="Insurance company" [options]="companies" bindLabel="name" bindValue="id" [(ngModel)]="companyId" required></boo-select>
              <p *ngIf="companiesState === 'loading'" class="mt-1 mb-0 text-xs text-secondary">Loading insurance companies…</p>
              <p *ngIf="companiesState === 'unavailable'" class="mt-1 mb-0 text-xs text-danger" role="alert">You don't have permission to list insurance companies.</p>
              <p *ngIf="companiesState === 'error'" class="mt-1 mb-0 text-xs text-danger" role="alert">Couldn't load insurance companies. Close this dialog and try again.</p>
              <p *ngIf="touched && !companyId" class="mt-1 mb-0 text-xs text-danger" role="alert">Choose the insurance company.</p>
            </div>
            <div>
              <boo-input label="Policy number" [(ngModel)]="policyNo" [maxlength]="100" required></boo-input>
              <p *ngIf="touched && !policyNo.trim()" class="mt-1 mb-0 text-xs text-danger" role="alert">Enter the policy number.</p>
            </div>
            <div>
              <boo-input label="Covered amount" type="number" [(ngModel)]="coverage" required></boo-input>
              <p *ngIf="touched && coverageError as msg; else coverageHint" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ msg }}</p>
              <ng-template #coverageHint>
                <p class="mt-1 mb-0 text-xs text-secondary">At most {{ maxCoverage | currency:'USD':'symbol':'1.2-2' }}, the bill total before coverage.</p>
              </ng-template>
            </div>
          </ng-container>

          <ng-container *ngSwitchCase="'void'">
            <div>
              <boo-textarea label="Reason" [(ngModel)]="reason" required [rows]="3" [maxlength]="reasonMaxLength"></boo-textarea>
              <p *ngIf="touched && !reason.trim()" class="mt-1 mb-0 text-xs text-danger" role="alert">Enter the reason for voiding this bill.</p>
            </div>
          </ng-container>
        </fieldset>
      </ng-container>

      <div dialogFooter class="contents">
        <button type="button" boo-button variant="ghost" (click)="close.emit()" [disabled]="busy">Cancel</button>
        <button type="submit" boo-button [variant]="copy.tone === 'danger' ? 'secondary' : 'primary'" [class.text-rose-700]="copy.tone === 'danger'" [loading]="busy" [disabled]="kind === 'insurance' && companiesState !== 'ready'">{{ copy.submit }}</button>
      </div>
    </cashier-dialog>
  `,
})
export class CashierAdjustmentDialogComponent implements OnChanges {
    @Input() open = false;
    @Input() kind: CashierAdjustmentKind | null = null;
    @Input() bill: CashierInvoice | null = null;
    @Input() companies: CashierCompanyOption[] = [];
    @Input() companiesState: CashierCompaniesState = 'loading';
    @Input() busy = false;

    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<CashierAdjustmentSubmit>();

    readonly reasonMaxLength = REASON_MAX_LENGTH;

    percent = '';
    companyId: string | null = null;
    policyNo = '';
    coverage = '';
    reason = '';
    touched = false;

    get copy(): KindCopy {
        return KIND_COPY[this.kind ?? 'discount'];
    }

    /** The server computes total = subtotal + tax − discount − coverage, so coverage beyond the pre-coverage total would zero the bill. */
    get maxCoverage(): number {
        return this.bill ? roundMoney(this.bill.totalAmount + this.bill.insuranceCoverageAmount) : 0;
    }

    get percentError(): string | null {
        const value = Number(this.percent);
        if (this.percent === '' || Number.isNaN(value)) return 'Enter a percentage between 0 and 100.';
        if (value < 0 || value > 100) return 'The discount must be between 0 and 100%.';
        if (roundMoney(value) !== value) return 'Use at most 2 decimals.';
        return null;
    }

    get coverageError(): string | null {
        const value = Number(this.coverage);
        if (this.coverage === '' || Number.isNaN(value) || value < 0) return 'Enter an amount of 0 or more.';
        if (roundMoney(value) !== value) return 'Use at most 2 decimals.';
        if (value > this.maxCoverage) return `Coverage cannot exceed ${this.maxCoverage.toFixed(2)}.`;
        return null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['open'] || changes['kind']) && this.open && this.bill) {
            this.touched = false;
            this.percent = String(this.bill.discountPercent);
            this.coverage = this.bill.insuranceCoverageAmount.toFixed(2);
            this.companyId = null;
            this.policyNo = '';
            this.reason = '';
        }
    }

    submit(): void {
        if (this.busy || !this.kind) return;
        this.touched = true;

        switch (this.kind) {
            case 'discount':
                if (this.percentError) return;
                this.confirm.emit({ kind: 'discount', discountPercent: Number(this.percent) });
                break;
            case 'insurance':
                if (!this.companyId || !this.policyNo.trim() || this.coverageError) return;
                this.confirm.emit({ kind: 'insurance', request: { insuranceCompanyId: this.companyId, policyNo: this.policyNo.trim(), coverageAmount: Number(this.coverage) } });
                break;
            case 'void':
                if (!this.reason.trim()) return;
                this.confirm.emit({ kind: 'void', reason: this.reason.trim() });
                break;
        }
    }
}
