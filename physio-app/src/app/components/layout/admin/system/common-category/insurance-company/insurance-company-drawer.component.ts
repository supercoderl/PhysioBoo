import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { InsuranceCompanyService } from "../../../../../../services/admin/insurance-company.service";
import { InsuranceType } from "../../../../../../shared/enums/insurance-type";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { InsuranceCompany } from "../../../../../../shared/types/support.types";
import { convertEnumToSelection } from "../../../../../../shared/utils/common";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/** Create / edit an insurance company (POST /insurance-companies, PATCH /insurance-companies/{id}). */
@Component({
    selector: 'common-category-insurance-company-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooCheckboxComponent,
        BooSelectComponent
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit insurance company' : 'New insurance company'"
            subtitle="Who the insurer is and how claims are made and settled."
            [isEdit]="isEdit"
            [canDelete]="canDelete"
            [loading]="loading"
            [loadFailed]="loadFailed"
            [saving]="saving"
            (save)="save()"
            (cancel)="requestClose()"
            (discard)="discard()"
            (delete)="onDelete()"
            (retry)="loadDetail()"
        >
            <ng-container [formGroup]="form">
                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Company</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_12rem] gap-4">
                        <boo-input label="Company name" [required]="true" formControlName="name" [maxlength]="200" placeholder="e.g. Bao Viet Insurance" />
                        <boo-select label="Type" formControlName="type" [options]="insuranceTypeOptions" [required]="true" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Contact</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Contact person" formControlName="contactPerson" [maxlength]="100" />
                        <boo-input label="Phone" formControlName="phone" [maxlength]="20" placeholder="+84…" />
                        <boo-input type="email" label="Email" formControlName="email" [maxlength]="150" placeholder="claims@insurer.com" />
                        <boo-input label="Website" formControlName="website" [maxlength]="200" placeholder="https://…" />
                    </div>
                    <div class="mt-4">
                        <boo-textarea label="Address" formControlName="address" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Claims</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="cashlessFacility" label="Cashless claims" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="reimbursementFacility" label="Reimbursement claims" />
                        </div>
                    </div>
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <boo-input type="number" label="Maximum coverage" formControlName="maximumCoverageAmount" placeholder="0.00" />
                        <boo-input type="number" label="Settlement ratio (%)" formControlName="claimSettlementRatio" placeholder="95.5" />
                        <boo-input type="number" label="Avg. settlement (days)" formControlName="averageClaimSettlementTime" placeholder="7" />
                    </div>
                    <p *ngIf="form.controls['claimSettlementRatio'].touched && form.controls['claimSettlementRatio'].invalid" class="m-0 mt-1 text-xs text-danger" role="alert">The settlement ratio is a percentage between 0 and 100.</p>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Terms</h3>
                    <div class="flex flex-col gap-4">
                        <div>
                            <boo-textarea label="Required documents" formControlName="requiredDocuments" placeholder="ID card, Invoice, Medical records" />
                            <p class="m-0 mt-1 text-xs text-secondary">Separate documents with commas or new lines.</p>
                        </div>
                        <boo-textarea label="Network hospitals" formControlName="networkHospitals" placeholder="Hospitals in the insurer’s network" />
                        <boo-textarea label="Terms and conditions" formControlName="termAndConditions" />
                    </div>
                    <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                        <boo-checkbox formControlName="isActive" label="Active" />
                        <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this insurer inactive.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryInsuranceCompanyDrawerComponent extends CategoryDrawerBase<InsuranceCompany> {
    protected override readonly noun = 'insurance company';
    protected override readonly service = inject(InsuranceCompanyService);

    readonly insuranceTypeOptions = convertEnumToSelection(InsuranceType);

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
        type: [InsuranceType.Health as InsuranceType | null, [Validators.required]],
        contactPerson: [null as string | null],
        phone: [null as string | null],
        email: [null as string | null, [Validators.email]],
        address: [null as string | null],
        website: [null as string | null],
        cashlessFacility: [false],
        reimbursementFacility: [false],
        networkHospitals: [null as string | null],
        maximumCoverageAmount: [null as number | string | null, [Validators.min(0)]],
        claimSettlementRatio: [null as number | string | null, [Validators.min(0), Validators.max(100)]],
        averageClaimSettlementTime: [0 as number | string, [Validators.min(0)]],
        requiredDocuments: [''],
        termAndConditions: [null as string | null],
        isActive: [true]
    });

    protected override defaults() {
        return {
            name: '', type: InsuranceType.Health, contactPerson: null, phone: null, email: null, address: null, website: null,
            cashlessFacility: false, reimbursementFacility: false, networkHospitals: null, maximumCoverageAmount: null,
            claimSettlementRatio: null, averageClaimSettlementTime: 0, requiredDocuments: '', termAndConditions: null, isActive: true
        };
    }

    protected override toFormValue(item: InsuranceCompany) {
        return {
            name: item.name,
            type: item.type,
            contactPerson: item.contactPerson,
            phone: item.phone,
            email: item.email,
            address: item.address,
            website: item.website,
            cashlessFacility: !!item.cashlessFacility,
            reimbursementFacility: !!item.reimbursementFacility,
            networkHospitals: item.networkHospitals,
            maximumCoverageAmount: item.maximumCoverageAmount,
            claimSettlementRatio: item.claimSettlementRatio,
            averageClaimSettlementTime: item.averageClaimSettlementTime ?? 0,
            requiredDocuments: (item.requiredDocuments ?? []).join(', '),
            termAndConditions: item.termAndConditions,
            isActive: item.isActive
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            type: Number(raw['type'] ?? InsuranceType.Health),
            contactPerson: this.text(raw['contactPerson']),
            phone: this.text(raw['phone']),
            email: this.text(raw['email']),
            address: this.text(raw['address']),
            website: this.text(raw['website']),
            cashlessFacility: !!raw['cashlessFacility'],
            reimbursementFacility: !!raw['reimbursementFacility'],
            networkHospitals: this.text(raw['networkHospitals']),
            maximumCoverageAmount: this.num(raw['maximumCoverageAmount'], null),
            claimSettlementRatio: this.num(raw['claimSettlementRatio'], null),
            averageClaimSettlementTime: this.num(raw['averageClaimSettlementTime']),
            requiredDocuments: String(raw['requiredDocuments'] ?? '').split(/[,\n]/).map(d => d.trim()).filter(Boolean),
            termAndConditions: this.text(raw['termAndConditions']),
            // Update requires it (create ignores it); omitting it used to deactivate the insurer on every edit.
            isActive: !!raw['isActive']
        };
    }
}
