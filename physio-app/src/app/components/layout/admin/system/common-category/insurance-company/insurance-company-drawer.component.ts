import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { InsuranceCompanyService } from "../../../../../../services/admin/insurance-company.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { InsuranceType } from "../../../../../../shared/enums/insurance-type";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { InsuranceCompany } from "../../../../../../shared/types/support";
import { convertEnumToSelection } from "../../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooJsonInputComponent } from "../../../../../input/boo-json-input/boo-json-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooDevJsonFillerComponent } from "../../../../dev/json-input/boo-json-input.component";

@Component({
    selector: 'common-category-insurance-company-drawer',
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
        BooJsonInputComponent,
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
                            {{ currentId ? 'Edit Insurance Company' : 'New Insurance Company' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure company details and policies</p>
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
                        <div class="flex gap-5">
                            <div class="flex-1 space-y-4">
                                <div class="grid grid-cols-2 gap-4">
                                    <boo-input label="Company Name" [required]="true" formControlName="name" placeholder="Ex: Bao Viet Insurance"></boo-input>
                                    <div>
                                        <boo-select 
                                            label="Select Type"
                                            formControlName="type"
                                            [options]="insuranceTypeOptions"
                                        ></boo-select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="h-px bg-gray-100 mx-6"></div>
                    
                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Contact Information</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Contact Person" formControlName="contactPerson" placeholder="John Doe"></boo-input>
                            <boo-input label="Phone Number" formControlName="phone" placeholder="+84..."></boo-input>
                        </div>
                        <div class="space-y-4">
                            <boo-input type="email" label="Email Address" formControlName="email" placeholder="contact@insurance.com"></boo-input>
                            <boo-input label="Website" formControlName="website" placeholder="https://www..."></boo-input>
                            <boo-textarea label="Address" formControlName="address" placeholder="123 Main St..."></boo-textarea>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>
                    
                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Facilities & Metrics</h3>
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('cashlessFacility')?.value, 'border-gray-200': !form.get('cashlessFacility')?.value}"
                                (click)="toggleCheck('cashlessFacility')"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                        <boo-icon name="credit-card" [size]="18" class="text-green-600"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Cashless</span>
                                </div>
                                <boo-checkbox formControlName="cashlessFacility"></boo-checkbox>
                            </div>
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('reimbursementFacility')?.value, 'border-gray-200': !form.get('reimbursementFacility')?.value}"
                                (click)="toggleCheck('reimbursementFacility')"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <boo-icon name="refresh-cw" [size]="18" class="text-blue-600"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Reimbursement</span>
                                </div>
                                <boo-checkbox formControlName="reimbursementFacility"></boo-checkbox>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <boo-input type="number" label="Max Coverage Amount" formControlName="maximumCoverageAmount" placeholder="0.00"></boo-input>
                            <boo-input type="number" label="Claim Settlement Ratio (%)" formControlName="claimSettlementRatio" placeholder="95.5"></boo-input>
                        </div>
                        <div class="mt-4">
                            <boo-input type="number" label="Avg Claim Settlement Time (Days)" formControlName="averageClaimSettlementTime" placeholder="7"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>
                    
                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Additional Info</h3>    
                        <div class="space-y-4">
                            <boo-json-input 
                                formControlName="NetworkHospitals" 
                                label="Network Hospitals (JSON or Text)" 
                                [required]="true"
                                placeholder="List of hospitals..."
                                [minHeight]="250"
                            >
                            </boo-json-input>
                            <boo-textarea label="Required Documents" formControlName="requiredDocuments" placeholder="ID, Invoices, Medical Records (comma separated)..."></boo-textarea>
                            <boo-textarea label="Terms & Conditions" formControlName="termAndConditions" placeholder="Enter terms and conditions..."></boo-textarea>
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

export class CommonCategoryInsuranceCompanyDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<InsuranceCompany>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    insuranceTypeOptions = convertEnumToSelection(InsuranceType);
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private insuranceCompanySrv: InsuranceCompanyService,
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
            name: ['', [Validators.required]],
            type: [InsuranceType.Health],
            contactPerson: [''],
            phone: [''],
            email: [''],
            address: [''],
            website: [''],
            cashlessFacility: [false],
            reimbursementFacility: [false],
            networkHospitals: [''],
            maximumCoverageAmount: [null],
            claimSettlementRatio: [null],
            averageClaimSettlementTime: [0],
            requiredDocuments: [''],
            termAndConditions: ['']
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.insuranceCompanySrv.search_by_id(id)
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name,
                        type: _res.data?.type,
                        contactPerson: _res.data?.contactPerson,
                        phone: _res.data?.phone,
                        email: _res.data?.email,
                        address: _res.data?.address,
                        website: _res.data?.website,
                        cashlessFacility: _res.data?.cashlessFacility,
                        reimbursementFacility: _res.data?.reimbursementFacility,
                        networkHospitals: _res.data?.networkHospitals,
                        maximumCoverageAmount: _res.data?.maximumCoverageAmount,
                        claimSettlementRatio: _res.data?.claimSettlementRatio,
                        averageClaimSettlementTime: _res.data?.averageClaimSettlementTime,
                        requiredDocuments: Array.isArray(_res.data?.requiredDocuments) ? _res.data?.requiredDocuments.join(', ') : _res.data?.requiredDocuments,
                        termAndConditions: _res.data?.termAndConditions
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

        const formValues = this.form.getRawValue();

        let parsedDocuments: string[] = [];
        const rawDocs = formValues.requiredDocuments;

        if (rawDocs) {
            if (typeof rawDocs === 'string' && rawDocs.trim() !== '') {
                try {
                    const parsed = JSON.parse(rawDocs);
                    if (Array.isArray(parsed))
                        parsedDocuments = parsed;
                    else parsedDocuments = [rawDocs];
                }
                catch (e) {
                    parsedDocuments = rawDocs.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
                }
            } else if (Array.isArray(rawDocs))
                parsedDocuments = rawDocs;
        }

        const payload = {
            ...formValues,
            type: Number(formValues.type ?? InsuranceType.Health),
            averageClaimSettlementTime: Number(formValues.averageClaimSettlementTime) || 0,
            maximumCoverageAmount: formValues.maximumCoverageAmount ? Number(formValues.maximumCoverageAmount) : null,
            claimSettlementRatio: formValues.claimSettlementRatio ? Number(formValues.claimSettlementRatio) : null,
            requiredDocuments: parsedDocuments
        }

        try {
            let id: string;
            if (this.currentId) {
                const updateRes = await firstValueFrom(this.insuranceCompanySrv.update(this.currentId, payload));
                if (!updateRes.success) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.insuranceCompanySrv.create(payload));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.insuranceCompanySrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            console.error(err);
        }
    }

    resetForm() {
        this.form.reset({
            category: 'Clinical',
            averageConsultationDuration: 0,
            isDiagnostic: false,
            isSurgical: false
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