import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from "@angular/core";
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { BooButtonComponent, BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { DialogService } from "../../../../services/common/dialog.service";
import { InsuranceType } from "../../../../shared/enums/insurance-type";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    INSURANCE_TYPE_OPTIONS,
    InsuranceCompanyPayload,
    parseNetworkHospitals,
    serializeNetworkHospitals,
    splitRequiredDocuments,
} from "../../../../shared/types/insurance-company.types";
import { InsuranceCompany } from "../../../../shared/types/support.types";

// Mirrors the server rules (CreateInsuranceCompanyCommandValidation) so the user sees them before the round trip.
const PHONE_PATTERN = /^\+?[0-9][0-9\s\-().]{5,19}$/;

const httpUrl: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
    } catch {
        return { url: true };
    }
};

const requiredDocuments: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
    splitRequiredDocuments(String(control.value ?? '')).length ? null : { required: true };

const integerValue: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw === null || raw === '' || raw === undefined) return null;
    return Number.isInteger(Number(raw)) ? null : { integer: true };
};

/**
 * Create / edit form for one insurer. The page owns the request: it passes `busy` while saving and closes the drawer
 * only on success, so a failed save leaves every entered value in place.
 */
@Component({
    selector: 'insurance-company-form-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooButtonComponent, BooInputComponent, BooSelectComponent, BooTextareaComponent, BooCheckboxComponent],
    template: `
    <drawer [isOpen]="open" [isShowDialog]="true" (close)="requestClose()">
      <form
        *ngIf="open"
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        role="dialog"
        aria-modal="true"
        aria-labelledby="insurer-form-title"
        [attr.aria-busy]="busy ? 'true' : null"
        class="flex flex-col h-full bg-surface"
      >
        <header class="flex-none px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 id="insurer-form-title" class="text-xl font-bold text-regular leading-tight m-0">{{ company ? 'Edit insurer' : 'New insurer' }}</h2>
            <p class="text-sm text-secondary mt-1 mb-0">{{ company ? (company.code || 'No code') + ' · ' + company.name : 'The insurer code is assigned automatically when you save.' }}</p>
          </div>
          <button type="button" boo-button variant="ghost" [iconOnly]="true" (click)="requestClose()" [disabled]="busy" aria-label="Close form">
            <physio-icon name="x" [size]="20"></physio-icon>
          </button>
        </header>

        <fieldset class="flex-1 min-h-0 overflow-y-auto m-0 p-0 border-0" custom-scrollbar [disabled]="busy">
          <section class="px-6 py-5 space-y-4" aria-labelledby="insurer-form-basics">
            <h3 id="insurer-form-basics" class="text-xs font-bold uppercase tracking-wider text-secondary m-0">Insurer</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <boo-input label="Company name" formControlName="name" [maxlength]="255" required></boo-input>
              <boo-select label="Insurance type" formControlName="type" [options]="typeOptions" required></boo-select>
            </div>
            <boo-checkbox *ngIf="company" label="Active (available when applying insurance to bills and claims)" formControlName="isActive"></boo-checkbox>
          </section>

          <div class="h-px bg-gray-100 mx-6"></div>

          <section class="px-6 py-5 space-y-4" aria-labelledby="insurer-form-contact">
            <h3 id="insurer-form-contact" class="text-xs font-bold uppercase tracking-wider text-secondary m-0">Contact</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <boo-input label="Contact person" formControlName="contactPerson" [maxlength]="255"></boo-input>
              <boo-input label="Phone" type="tel" formControlName="phone" [maxlength]="20"></boo-input>
              <boo-input label="Email" type="email" formControlName="email" [maxlength]="255"></boo-input>
              <boo-input label="Website (https://…)" type="url" formControlName="website" [maxlength]="255"></boo-input>
            </div>
            <boo-textarea label="Address" formControlName="address" [rows]="3"></boo-textarea>
          </section>

          <div class="h-px bg-gray-100 mx-6"></div>

          <section class="px-6 py-5 space-y-4" aria-labelledby="insurer-form-settlement">
            <h3 id="insurer-form-settlement" class="text-xs font-bold uppercase tracking-wider text-secondary m-0">Settlement and coverage</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <boo-checkbox label="Cashless facility" formControlName="cashlessFacility"></boo-checkbox>
              <boo-checkbox label="Reimbursement facility" formControlName="reimbursementFacility"></boo-checkbox>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <boo-input label="Max. coverage amount" type="number" formControlName="maximumCoverageAmount"></boo-input>
              <boo-input label="Settlement ratio (0–100 %)" type="number" formControlName="claimSettlementRatio"></boo-input>
              <boo-input label="Avg. settlement (days)" type="number" formControlName="averageClaimSettlementTime"></boo-input>
            </div>
            <p *ngIf="numberErrors as msg" class="m-0 text-xs text-danger" role="alert">{{ msg }}</p>
          </section>

          <div class="h-px bg-gray-100 mx-6"></div>

          <section class="px-6 py-5 space-y-4" aria-labelledby="insurer-form-docs">
            <h3 id="insurer-form-docs" class="text-xs font-bold uppercase tracking-wider text-secondary m-0">Claim requirements</h3>
            <boo-textarea label="Required documents (one per line or comma separated)" formControlName="requiredDocuments" [rows]="3" [required]="!company"></boo-textarea>
            <div>
              <boo-textarea label="Network hospitals (one per line)" formControlName="networkHospitals" [rows]="4"></boo-textarea>
              <p *ngIf="!networkEditable" class="mt-1 mb-0 text-xs text-secondary">This insurer's network list is stored in a structured format and is kept as is. Edit it outside this form.</p>
            </div>
            <boo-textarea label="Terms and conditions" formControlName="termAndConditions" [rows]="4" [maxlength]="4000"></boo-textarea>
          </section>
        </fieldset>

        <footer class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <p class="m-0 text-xs text-secondary" aria-live="polite">{{ submitted && form.invalid ? 'Fix the highlighted fields to continue.' : '' }}</p>
          <div class="flex gap-2">
            <button type="button" boo-button variant="ghost" (click)="requestClose()" [disabled]="busy">Cancel</button>
            <button type="submit" boo-button variant="primary" [loading]="busy" [disabled]="busy">{{ company ? 'Save changes' : 'Create insurer' }}</button>
          </div>
        </footer>
      </form>
    </drawer>
  `,
})
export class InsuranceCompanyFormDrawerComponent implements OnChanges {
    private readonly fb = inject(FormBuilder);
    private readonly dialogSrv = inject(DialogService);

    @Input() open = false;
    /** The insurer being edited; null creates a new one. */
    @Input() company: InsuranceCompany | null = null;
    @Input() busy = false;

    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<InsuranceCompanyPayload>();

    readonly typeOptions = INSURANCE_TYPE_OPTIONS;
    networkEditable = true;
    submitted = false;
    /** Raw stored network value, resent unchanged when it cannot be edited as lines. */
    private originalNetwork: string | null = null;

    readonly form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(255)]],
        type: [InsuranceType.Health as InsuranceType, [Validators.required]],
        isActive: [true],
        contactPerson: ['', [Validators.maxLength(255)]],
        phone: ['', [Validators.maxLength(20), Validators.pattern(PHONE_PATTERN)]],
        email: ['', [Validators.maxLength(255), Validators.email]],
        website: ['', [Validators.maxLength(255), httpUrl]],
        address: [''],
        cashlessFacility: [false],
        reimbursementFacility: [true],
        maximumCoverageAmount: [null as number | string | null, [Validators.min(0)]],
        claimSettlementRatio: [null as number | string | null, [Validators.min(0), Validators.max(100)]],
        averageClaimSettlementTime: [0 as number | string | null, [Validators.min(0), integerValue]],
        requiredDocuments: ['', [requiredDocuments]],
        networkHospitals: [''],
        termAndConditions: [''],
    });

    get numberErrors(): string | null {
        const f = this.form.controls;
        if (!(f.maximumCoverageAmount.touched || f.claimSettlementRatio.touched || f.averageClaimSettlementTime.touched || this.submitted)) return null;
        if (f.maximumCoverageAmount.invalid) return 'Maximum coverage cannot be negative.';
        if (f.claimSettlementRatio.invalid) return 'Settlement ratio must be between 0 and 100.';
        if (f.averageClaimSettlementTime.errors?.['integer']) return 'Average settlement time must be a whole number of days.';
        if (f.averageClaimSettlementTime.invalid) return 'Average settlement time cannot be negative.';
        return null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Rebuild only when the drawer opens, never while it is open, so a failed save keeps what the user typed.
        if (!changes['open'] || !this.open) return;
        this.submitted = false;
        const c = this.company;
        const network = parseNetworkHospitals(c?.networkHospitals);
        this.networkEditable = network.editable;
        this.originalNetwork = c?.networkHospitals ?? null;

        this.form.reset({
            name: c?.name ?? '',
            type: c?.type ?? InsuranceType.Health,
            isActive: c?.isActive ?? true,
            contactPerson: c?.contactPerson ?? '',
            phone: c?.phone ?? '',
            email: c?.email ?? '',
            website: c?.website ?? '',
            address: c?.address ?? '',
            cashlessFacility: c?.cashlessFacility ?? false,
            reimbursementFacility: c?.reimbursementFacility ?? true,
            maximumCoverageAmount: c?.maximumCoverageAmount ?? null,
            claimSettlementRatio: c?.claimSettlementRatio ?? null,
            averageClaimSettlementTime: c?.averageClaimSettlementTime ?? 0,
            requiredDocuments: (c?.requiredDocuments ?? []).join('\n'),
            networkHospitals: network.names.join('\n'),
            termAndConditions: c?.termAndConditions ?? '',
        });
        if (network.editable) this.form.controls.networkHospitals.enable();
        else this.form.controls.networkHospitals.disable();
        // The create form only needs required documents; the edit form keeps whatever the insurer already has.
        if (c) this.form.controls.requiredDocuments.clearValidators();
        else this.form.controls.requiredDocuments.setValidators([requiredDocuments]);
        this.form.controls.requiredDocuments.updateValueAndValidity();
    }

    requestClose(): void {
        if (this.busy) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.close.emit());
        else this.close.emit();
    }

    submit(): void {
        if (this.busy) return;
        this.submitted = true;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.save.emit(this.toPayload());
    }

    private toPayload(): InsuranceCompanyPayload {
        const v = this.form.getRawValue();
        const text = (s: string | null) => (s ?? '').trim() || null;
        const num = (n: number | string | null) => (n === null || n === '' ? null : Number(n));

        const payload: InsuranceCompanyPayload = {
            name: v.name!.trim(),
            type: Number(v.type) as InsuranceType,
            contactPerson: text(v.contactPerson),
            phone: text(v.phone),
            email: text(v.email),
            address: text(v.address),
            website: text(v.website),
            cashlessFacility: !!v.cashlessFacility,
            reimbursementFacility: !!v.reimbursementFacility,
            networkHospitals: this.networkEditable ? serializeNetworkHospitals(v.networkHospitals ?? '') : this.originalNetwork,
            maximumCoverageAmount: num(v.maximumCoverageAmount),
            claimSettlementRatio: num(v.claimSettlementRatio),
            averageClaimSettlementTime: Number(v.averageClaimSettlementTime) || 0,
            requiredDocuments: splitRequiredDocuments(v.requiredDocuments ?? ''),
            termAndConditions: text(v.termAndConditions),
        };
        if (this.company) payload.isActive = !!v.isActive;
        return payload;
    }
}
