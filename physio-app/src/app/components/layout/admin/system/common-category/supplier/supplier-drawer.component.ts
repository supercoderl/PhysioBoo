import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { SupplierService } from "../../../../../../services/admin/supplier.service";
import { SupplierType } from "../../../../../../shared/enums/supplier-type";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Supplier } from "../../../../../../shared/types/support.types";
import { convertEnumToSelection } from "../../../../../../shared/utils/common";
import { BooDatepickerComponent } from "../../../../../date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

const REQUIRED_TEXT = [Validators.required, Validators.pattern(/\S/)];

/**
 * Create / edit a supplier (POST /suppliers, PATCH /suppliers/{id}). The supplier code is assigned by the server, and
 * the create endpoint has no currency field, so currency is edited once the supplier exists.
 */
@Component({
    selector: 'common-category-supplier-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooCheckboxComponent,
        BooSelectComponent,
        BooDatepickerComponent
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit supplier' : 'New supplier'"
            subtitle="Contacts, registrations and the terms you buy on."
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
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Supplier</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_13rem] gap-4">
                        <boo-input label="Supplier name" [required]="true" formControlName="supplierName" [maxlength]="200" placeholder="e.g. Medtronic Inc." />
                        <boo-select label="Type" formControlName="type" [options]="supplierTypeOptions" [required]="true" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Contact</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Contact person" formControlName="contactPerson" [maxlength]="100" />
                        <boo-input type="email" label="Email" formControlName="email" [maxlength]="150" placeholder="orders@supplier.com" />
                        <boo-input label="Phone" formControlName="phone" [maxlength]="20" />
                        <boo-input label="Alternate phone" formControlName="alternatePhone" [maxlength]="20" />
                        <boo-input class="sm:col-span-2" label="Website" formControlName="website" [maxlength]="200" placeholder="https://…" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Location</h3>
                    <boo-textarea label="Address" formControlName="address" [required]="true" />
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="City" formControlName="city" [required]="true" [maxlength]="100" />
                        <boo-input label="State / province" formControlName="stateProvince" [required]="true" [maxlength]="100" />
                        <boo-input label="Country" formControlName="country" [required]="true" [maxlength]="100" />
                        <boo-input label="Postal code" formControlName="postalCode" [maxlength]="20" />
                    </div>
                    <p *ngIf="locationMissing" class="m-0 mt-2 text-xs text-danger" role="alert">Address, city, state and country are required.</p>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Registration and licenses</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Business registration no." formControlName="businessRegistrationNumber" [maxlength]="50" />
                        <boo-input label="Tax ID (TIN)" formControlName="taxIdentificationNumber" [maxlength]="50" />
                        <boo-input label="GST number" formControlName="gstNumber" [maxlength]="50" />
                        <boo-input label="PAN number" formControlName="panNumber" [maxlength]="50" />
                        <boo-input label="Drug license no." formControlName="drugLicenseNumber" [maxlength]="50" />
                        <boo-datepicker label="Drug license expiry" formControlName="drugLicenseExpiry" outputFormat="yyyy-MM-dd" />
                        <boo-input label="FDA registration no." formControlName="fdaRegistrationNumber" [maxlength]="50" />
                        <boo-input label="ISO certification" formControlName="isoCertification" [maxlength]="100" placeholder="e.g. ISO 9001:2015" />
                    </div>
                    <div class="mt-4 rounded-xl border border-borderGray px-3 py-2.5 sm:w-1/2">
                        <boo-checkbox formControlName="gmpCertified" label="GMP certified" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Purchasing terms</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Payment terms" formControlName="paymentTerms" [maxlength]="100" placeholder="e.g. Net 30" />
                        <boo-input *ngIf="isEdit" label="Currency" formControlName="currency" [maxlength]="3" placeholder="e.g. USD" />
                        <boo-input type="number" label="Credit limit" formControlName="creditLimit" placeholder="0.00" />
                        <boo-input type="number" label="Minimum order value" formControlName="minimumOrderValue" placeholder="0.00" />
                        <boo-input type="number" label="Lead time (days)" formControlName="leadTimeDays" placeholder="7" />
                    </div>
                    <div class="mt-4">
                        <boo-textarea label="Bank account details" formControlName="bankAccountDetails" placeholder="Bank, account number, SWIFT" />
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-1 text-xs font-semibold uppercase tracking-wider text-secondary">Performance</h3>
                    <p class="m-0 mb-4 text-xs text-secondary">Recorded figures for this supplier.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <boo-input type="number" label="Delivery reliability (0–100)" formControlName="deliveryReliabilityScore" />
                        <boo-input type="number" label="Quality rating (0–5)" formControlName="qualityRating" />
                        <boo-input type="number" label="Service rating (0–5)" formControlName="serviceRating" />
                        <boo-input type="number" label="Total orders" formControlName="totalOrders" />
                        <boo-input type="number" label="Total purchase value" formControlName="totalPurchaseValue" />
                        <boo-datepicker label="Last order date" formControlName="lastOrderDate" outputFormat="yyyy-MM-dd" [disableFuture]="true" />
                    </div>
                    <p *ngIf="ratingsInvalid" class="m-0 mt-2 text-xs text-danger" role="alert">Reliability is 0–100; quality and service ratings are 0–5.</p>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategorySupplierDrawerComponent extends CategoryDrawerBase<Supplier> {
    protected override readonly noun = 'supplier';
    protected override readonly service = inject(SupplierService);

    readonly supplierTypeOptions = convertEnumToSelection(SupplierType);

    override readonly form = inject(FormBuilder).group({
        supplierName: ['', [...REQUIRED_TEXT, Validators.maxLength(200)]],
        type: [SupplierType.Pharmaceutical as SupplierType | null, [Validators.required]],
        contactPerson: [null as string | null],
        phone: [null as string | null],
        alternatePhone: [null as string | null],
        email: [null as string | null, [Validators.email]],
        website: [null as string | null],
        address: ['', REQUIRED_TEXT],
        city: ['', REQUIRED_TEXT],
        stateProvince: ['', REQUIRED_TEXT],
        postalCode: [null as string | null],
        country: ['', REQUIRED_TEXT],
        businessRegistrationNumber: [null as string | null],
        taxIdentificationNumber: [null as string | null],
        gstNumber: [null as string | null],
        panNumber: [null as string | null],
        drugLicenseNumber: [null as string | null],
        drugLicenseExpiry: [null as string | null],
        fdaRegistrationNumber: [null as string | null],
        isoCertification: [null as string | null],
        gmpCertified: [false],
        paymentTerms: [null as string | null],
        creditLimit: [0 as number | string, [Validators.min(0)]],
        currency: ['' as string | null],
        bankAccountDetails: [null as string | null],
        leadTimeDays: [0 as number | string, [Validators.min(0)]],
        minimumOrderValue: [0 as number | string, [Validators.min(0)]],
        deliveryReliabilityScore: [0 as number | string, [Validators.min(0), Validators.max(100)]],
        qualityRating: [0 as number | string, [Validators.min(0), Validators.max(5)]],
        serviceRating: [0 as number | string, [Validators.min(0), Validators.max(5)]],
        totalOrders: [0 as number | string, [Validators.min(0)]],
        totalPurchaseValue: [0 as number | string, [Validators.min(0)]],
        lastOrderDate: [null as string | null]
    });

    get locationMissing(): boolean {
        return ['address', 'city', 'stateProvince', 'country'].some(k => this.form.get(k)?.touched && this.form.get(k)?.invalid);
    }

    get ratingsInvalid(): boolean {
        return ['deliveryReliabilityScore', 'qualityRating', 'serviceRating'].some(k => this.form.get(k)?.touched && this.form.get(k)?.invalid);
    }

    protected override defaults() {
        return {
            supplierName: '', type: SupplierType.Pharmaceutical, contactPerson: null, phone: null, alternatePhone: null,
            email: null, website: null, address: '', city: '', stateProvince: '', postalCode: null, country: '',
            businessRegistrationNumber: null, taxIdentificationNumber: null, gstNumber: null, panNumber: null,
            drugLicenseNumber: null, drugLicenseExpiry: null, fdaRegistrationNumber: null, isoCertification: null,
            gmpCertified: false, paymentTerms: null, creditLimit: 0, currency: '', bankAccountDetails: null, leadTimeDays: 0,
            minimumOrderValue: 0, deliveryReliabilityScore: 0, qualityRating: 0, serviceRating: 0, totalOrders: 0,
            totalPurchaseValue: 0, lastOrderDate: null
        };
    }

    protected override toFormValue(item: Supplier) {
        return {
            supplierName: item.supplierName,
            type: item.type,
            contactPerson: item.contactPerson,
            phone: item.phone,
            alternatePhone: item.alternatePhone,
            email: item.email,
            website: item.website,
            address: item.address ?? '',
            city: item.city ?? '',
            stateProvince: item.stateProvince ?? '',
            postalCode: item.postalCode,
            country: item.country ?? '',
            businessRegistrationNumber: item.businessRegistrationNumber,
            taxIdentificationNumber: item.taxIdentificationNumber,
            gstNumber: item.gstNumber,
            panNumber: item.panNumber,
            drugLicenseNumber: item.drugLicenseNumber,
            drugLicenseExpiry: (item.drugLicenseExpiry as unknown as string | null) ?? null,
            fdaRegistrationNumber: item.fdaRegistrationNumber,
            isoCertification: item.isoCertification,
            gmpCertified: !!item.gmpCertified,
            paymentTerms: item.paymentTerms,
            creditLimit: item.creditLimit ?? 0,
            currency: item.currency ?? '',
            bankAccountDetails: item.bankAccountDetails,
            leadTimeDays: item.leadTimeDays ?? 0,
            minimumOrderValue: item.minimumOrderValue ?? 0,
            deliveryReliabilityScore: item.deliveryReliabilityScore ?? 0,
            qualityRating: item.qualityRating ?? 0,
            serviceRating: item.serviceRating ?? 0,
            totalOrders: item.totalOrders ?? 0,
            totalPurchaseValue: item.totalPurchaseValue ?? 0,
            lastOrderDate: (item.lastOrderDate as unknown as string | null) ?? null
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        const payload: Record<string, any> = {
            supplierName: this.text(raw['supplierName']),
            type: Number(raw['type'] ?? SupplierType.Pharmaceutical),
            contactPerson: this.text(raw['contactPerson']),
            phone: this.text(raw['phone']),
            alternatePhone: this.text(raw['alternatePhone']),
            email: this.text(raw['email']),
            website: this.text(raw['website']),
            address: this.text(raw['address']),
            city: this.text(raw['city']),
            stateProvince: this.text(raw['stateProvince']),
            postalCode: this.text(raw['postalCode']),
            country: this.text(raw['country']),
            businessRegistrationNumber: this.text(raw['businessRegistrationNumber']),
            taxIdentificationNumber: this.text(raw['taxIdentificationNumber']),
            gstNumber: this.text(raw['gstNumber']),
            panNumber: this.text(raw['panNumber']),
            drugLicenseNumber: this.text(raw['drugLicenseNumber']),
            drugLicenseExpiry: this.text(raw['drugLicenseExpiry']),
            fdaRegistrationNumber: this.text(raw['fdaRegistrationNumber']),
            isoCertification: this.text(raw['isoCertification']),
            gmpCertified: !!raw['gmpCertified'],
            paymentTerms: this.text(raw['paymentTerms']),
            creditLimit: this.num(raw['creditLimit']),
            bankAccountDetails: this.text(raw['bankAccountDetails']),
            leadTimeDays: this.num(raw['leadTimeDays']),
            minimumOrderValue: this.num(raw['minimumOrderValue']),
            deliveryReliabilityScore: this.num(raw['deliveryReliabilityScore']),
            qualityRating: this.num(raw['qualityRating']),
            serviceRating: this.num(raw['serviceRating']),
            totalOrders: this.num(raw['totalOrders']),
            totalPurchaseValue: this.num(raw['totalPurchaseValue']),
            lastOrderDate: this.text(raw['lastOrderDate'])
        };
        // Only the update endpoint takes a currency, and it is not nullable there.
        if (this.isEdit) payload['currency'] = (this.text(raw['currency']) ?? '').toUpperCase();
        return payload;
    }
}
