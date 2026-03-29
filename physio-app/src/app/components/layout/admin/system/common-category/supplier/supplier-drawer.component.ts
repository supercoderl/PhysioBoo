import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { SupplierService } from "../../../../../../services/admin/supplier.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SupplierType } from "../../../../../../shared/enums/supplier-type";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Supplier } from "../../../../../../shared/types/support";
import { convertEnumToSelection, generateUUID } from "../../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooDevJsonFillerComponent } from "../../../../dev/json-input/boo-json-input.component";

@Component({
    selector: 'common-category-supplier-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooCheckboxComponent,
        BooDevJsonFillerComponent
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="720"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Supplier' : 'New Supplier' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure supplier details, financials, and legal information</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <boo-json-editor [targetForms]="form"></boo-json-editor>

                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>
                    
                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Basic Information</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Supplier Name" [required]="true" formControlName="supplierName" placeholder="Ex: Medtronic Inc."></boo-input>
                            <boo-select 
                                label="Select Type"
                                formControlName="type"
                                [options]="supplierTypeOptions"
                            ></boo-select>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Contact Information</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Contact Person" formControlName="contactPerson" placeholder="John Doe"></boo-input>
                            <boo-input type="email" label="Email Address" formControlName="email" placeholder="contact@supplier.com"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Primary Phone" formControlName="phone" placeholder="+1 234 567 890"></boo-input>
                            <boo-input label="Alternate Phone" formControlName="alternatePhone" placeholder="+1 098 765 432"></boo-input>
                        </div>
                        <div>
                            <boo-input label="Website" formControlName="website" placeholder="https://www..."></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Location</h3>
                        <div class="mb-4">
                            <boo-textarea label="Address" formControlName="address" [required]="true" placeholder="123 Industrial Park..."></boo-textarea>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="City" formControlName="city" [required]="true" placeholder="Ex: New York"></boo-input>
                            <boo-input label="State / Province" formControlName="stateProvince" [required]="true" placeholder="Ex: NY"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Country" formControlName="country" [required]="true" placeholder="Ex: USA"></boo-input>
                            <boo-input label="Postal Code" formControlName="postalCode" placeholder="Ex: 10001"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Legal & Registration</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Business Reg. Number" formControlName="businessRegistrationNumber" placeholder="BRN..."></boo-input>
                            <boo-input label="Tax ID (TIN)" formControlName="taxIdentificationNumber" placeholder="TIN..."></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="GST Number" formControlName="gstNumber" placeholder="GST..."></boo-input>
                            <boo-input label="PAN Number" formControlName="panNumber" placeholder="PAN..."></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Licenses & Certifications</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Drug License Number" formControlName="drugLicenseNumber" placeholder="DLN..."></boo-input>
                            <boo-input type="date" label="Drug License Expiry" formControlName="drugLicenseExpiry"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="FDA Registration Number" formControlName="fdaRegistrationNumber" placeholder="FDA..."></boo-input>
                            <boo-input label="ISO Certification" formControlName="isoCertification" placeholder="Ex: ISO 9001:2015"></boo-input>
                        </div>
                        <div 
                            class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm w-1/2"
                            [ngClass]="{'border-primary bg-primary/5': form.get('gmpCertified')?.value, 'border-gray-200': !form.get('gmpCertified')?.value}"
                            (click)="toggleCheck('gmpCertified')"
                        >
                            <div class="flex items-center gap-3">
                                <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                    <boo-icon name="circle-check-big" [size]="18" class="text-green-600"></boo-icon>
                                </div>
                                <span class="text-sm font-medium text-gray-700">GMP Certified</span>
                            </div>
                            <boo-checkbox formControlName="gmpCertified"></boo-checkbox>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Financial & Payment</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Payment Terms" formControlName="paymentTerms" placeholder="Ex: Net 30, COD..."></boo-input>
                            <boo-input label="Currency" [required]="true" formControlName="currency" placeholder="Ex: USD, VND..."></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="number" label="Credit Limit" formControlName="creditLimit" placeholder="0.00"></boo-input>
                            <boo-input type="number" label="Minimum Order Value" formControlName="minimumOrderValue" placeholder="0.00"></boo-input>
                        </div>
                        <div class="mb-4">
                            <boo-textarea label="Bank Account Details" formControlName="bankAccountDetails" placeholder="Bank Name, Account Number, Swift Code..."></boo-textarea>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Metrics & Logistics</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="number" label="Lead Time (Days)" formControlName="leadTimeDays" placeholder="Ex: 7"></boo-input>
                            <boo-input type="number" label="Delivery Reliability Score" formControlName="deliveryReliabilityScore" placeholder="0.0 - 100.0"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="number" label="Quality Rating" formControlName="qualityRating" placeholder="0.0 - 5.0"></boo-input>
                            <boo-input type="number" label="Service Rating" formControlName="serviceRating" placeholder="0.0 - 5.0"></boo-input>
                        </div>
                        <div class="grid grid-cols-3 gap-4">
                            <boo-input type="number" label="Total Orders" formControlName="totalOrders" placeholder="0"></boo-input>
                            <boo-input type="number" label="Total Purchase Value" formControlName="totalPurchaseValue" placeholder="0.00"></boo-input>
                            <boo-input type="date" label="Last Order Date" formControlName="lastOrderDate"></boo-input>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0 shadow-top-md">
                    <div>
                        <button 
                            *ngIf="currentId" class="group flex items-center gap-1.5 text-red-500 hover:text-red-700 px-2 py-1.5 rounded-md hover:bg-red-50 transition-all text-sm font-medium"
                            (click)="onDelete()"
                        >
                            <boo-icon 
                                name="trash-2" 
                                [size]="16" 
                                class="transition-transform group-hover:scale-110"
                                color="#ef4444"
                            ></boo-icon> 
                            <span>Delete</span>
                        </button>
                    </div>
                    <div class="flex gap-3">
                        <boo-button-admin
                            buttonClass="hover:!bg-gray-200"
                            background="transparent"
                            (click)="onClose()"
                            [disabled]="loadingSrv.isLoading('search-by-id')"
                        >
                            Cancel
                        </boo-button-admin>
                        <boo-button-admin
                            textColor="white"
                            (click)="onSave()"
                            [disabled]="loadingSrv.isLoading('search-by-id') || loadingSrv.isLoading('create') || loadingSrv.isLoading('update')"
                            [loading]="loadingSrv.isLoading('update')"
                        >
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})

export class CommonCategorySupplierDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Supplier>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    supplierTypeOptions = convertEnumToSelection(SupplierType);
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private supplierSrv: SupplierService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['currentId'] && this.currentId) {
            this.loadDetail(this.currentId);
        } else if (!this.currentId) {
            this.resetForm();
        }
    }
    // #endregion

    // #region Methods
    private initForm(): FormGroup {
        return this.fb.group({
            supplierName: ['', [Validators.required]],
            type: [SupplierType.Consumable],
            contactPerson: [null],
            phone: [null],
            alternatePhone: [null],
            email: [null],
            website: [null],
            address: [''],
            city: [''],
            stateProvince: [''],
            postalCode: [null],
            country: [''],
            businessRegistrationNumber: [null],
            taxIdentificationNumber: [null],
            gstNumber: [null],
            panNumber: [null],
            drugLicenseNumber: [null],
            drugLicenseExpiry: [null],
            fdaRegistrationNumber: [null],
            isoCertification: [null],
            gmpCertified: [false],
            paymentTerms: [null],
            creditLimit: [0],
            currency: [''],
            bankAccountDetails: [null],
            leadTimeDays: [0],
            minimumOrderValue: [0],
            deliveryReliabilityScore: [0],
            qualityRating: [0],
            serviceRating: [0],
            totalOrders: [0],
            totalPurchaseValue: [0],
            lastOrderDate: [null],
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.supplierSrv.search_by_id({ id })
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        supplierName: _res.data?.supplierName ?? '',
                        type: _res.data?.type ?? SupplierType.Consumable,
                        contactPerson: _res.data?.contactPerson,
                        phone: _res.data?.phone,
                        alternatePhone: _res.data?.alternatePhone,
                        email: _res.data?.email,
                        website: _res.data?.website,
                        address: _res.data?.address ?? '',
                        city: _res.data?.city ?? '',
                        stateProvince: _res.data?.stateProvince ?? '',
                        postalCode: _res.data?.postalCode,
                        country: _res.data?.country ?? '',
                        businessRegistrationNumber: _res.data?.businessRegistrationNumber,
                        taxIdentificationNumber: _res.data?.taxIdentificationNumber,
                        gstNumber: _res.data?.gstNumber,
                        panNumber: _res.data?.panNumber,
                        drugLicenseNumber: _res.data?.drugLicenseNumber,
                        drugLicenseExpiry: _res.data?.drugLicenseExpiry,
                        fdaRegistrationNumber: _res.data?.fdaRegistrationNumber,
                        isoCertification: _res.data?.isoCertification,
                        gmpCertified: _res.data?.gmpCertified ?? false,
                        paymentTerms: _res.data?.paymentTerms,
                        creditLimit: _res.data?.creditLimit ?? 0,
                        currency: _res.data?.currency ?? '',
                        bankAccountDetails: _res.data?.bankAccountDetails,
                        leadTimeDays: _res.data?.leadTimeDays ?? 0,
                        minimumOrderValue: _res.data?.minimumOrderValue ?? 0,
                        deliveryReliabilityScore: _res.data?.deliveryReliabilityScore ?? 0,
                        qualityRating: _res.data?.qualityRating ?? 0,
                        serviceRating: _res.data?.serviceRating ?? 0,
                        totalOrders: _res.data?.totalOrders ?? 0,
                        totalPurchaseValue: _res.data?.totalPurchaseValue ?? 0,
                        lastOrderDate: _res.data?.lastOrderDate,
                    })
                }
            })
    }

    toggleCheck(controlName: string) {
        const currentValue = this.form.get(controlName)?.value;

        this.form.patchValue({
            [controlName]: !currentValue
        });
        this.form.markAsDirty();
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const targetId = this.currentId ?? generateUUID();
        const formData = { ...this.form.getRawValue(), id: targetId }

        const request$ = this.currentId
            ? this.supplierSrv.update(formData)
            : this.supplierSrv.create(formData);

        try {
            await firstValueFrom(request$);

            const response = await firstValueFrom(this.supplierSrv.search_by_id({ id: targetId }));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (error) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            console.error(error);
        }
    }

    resetForm() {
        this.form.reset({
            supplierName: '',
            type: [SupplierType.Consumable],
            contactPerson: null,
            phone: null,
            alternatePhone: null,
            email: null,
            website: null,
            address: '',
            city: '',
            stateProvince: '',
            postalCode: null,
            country: '',
            businessRegistrationNumber: null,
            taxIdentificationNumber: null,
            gstNumber: null,
            panNumber: null,
            drugLicenseNumber: null,
            drugLicenseExpiry: null,
            fdaRegistrationNumber: null,
            isoCertification: null,
            gmpCertified: false,
            paymentTerms: null,
            creditLimit: 0,
            currency: '',
            bankAccountDetails: null,
            leadTimeDays: 0,
            minimumOrderValue: 0,
            deliveryReliabilityScore: 0,
            qualityRating: 0,
            serviceRating: 0,
            totalOrders: 0,
            totalPurchaseValue: 0,
            lastOrderDate: null,
        });
    }

    onClose() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }

        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
}