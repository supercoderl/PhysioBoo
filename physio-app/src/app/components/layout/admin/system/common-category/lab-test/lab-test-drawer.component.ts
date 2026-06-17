import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom, Observable } from "rxjs";
import { LabTestCategoryService } from "../../../../../../services/admin/lab-test-category.service";
import { LabTestService } from "../../../../../../services/admin/lab-test.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Lookup } from "../../../../../../shared/types/common";
import { LabTest } from "../../../../../../shared/types/laboratory-imaging";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooDevJsonFillerComponent } from "../../../../dev/json-input/boo-json-input.component";

@Component({
    selector: 'common-category-lab-test-drawer',
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
                            {{ currentId ? 'Edit Test' : 'New Test' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure diagnostic test details and requirements</p>
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
                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <boo-input label="Test Name" [required]="true" formControlName="testName" placeholder="Ex: Complete Blood Count (CBC)"></boo-input>
                                <boo-select 
                                    label="Category"
                                    formControlName="categoryId"
                                    [options]="(labTestCategorySrv.lookup() | async) || []"
                                ></boo-select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <boo-input label="Sample Type" formControlName="sampleType" placeholder="Ex: Blood, Urine..."></boo-input>
                                <boo-input label="Sample Volume" formControlName="sampleVolume" placeholder="Ex: 5 ml"></boo-input>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <boo-input label="Unit of Measurement" formControlName="unitOfMeasurement" placeholder="Ex: mg/dL, mmol/L"></boo-input>
                                <boo-input label="Methodology" formControlName="methodology" placeholder="Ex: Spectrophotometry"></boo-input>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Patient Preparation</h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('preparationRequired')?.value, 'border-gray-200': !form.get('preparationRequired')?.value}"
                                (click)="toggleCheck('preparationRequired')">
                                <span class="text-sm font-medium text-gray-700">Preparation Required</span>
                                <boo-checkbox formControlName="preparationRequired"></boo-checkbox>
                            </div>
                            
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('fastingRequired')?.value, 'border-gray-200': !form.get('fastingRequired')?.value}"
                                (click)="toggleCheck('fastingRequired')">
                                <span class="text-sm font-medium text-gray-700">Fasting Required</span>
                                <boo-checkbox formControlName="fastingRequired"></boo-checkbox>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div *ngIf="form.get('fastingRequired')?.value">
                                <boo-input type="number" label="Fasting Hours" formControlName="fastingHours" placeholder="Ex: 8"></boo-input>
                            </div>

                            <boo-textarea label="Preparation Instructions" formControlName="preparationInstructions" placeholder="Specific instructions for the patient..."></boo-textarea>
                            <boo-textarea label="Collection Instructions" formControlName="collectionInstructions" placeholder="Instructions for the medical staff collecting the sample..."></boo-textarea>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Normal Ranges</h3>
                        <div class="grid grid-cols-3 gap-4">
                            <boo-input label="Male" formControlName="normalRangeMale" placeholder="Ex: 4.5 - 5.5"></boo-input>
                            <boo-input label="Female" formControlName="normalRangeFemale" placeholder="Ex: 4.0 - 5.0"></boo-input>
                            <boo-input label="Pediatric" formControlName="normalPediatric" placeholder="Ex: 3.8 - 4.8"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Pricing & Logistics</h3>
                        
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isProfile')?.value, 'border-gray-200': !form.get('isProfile')?.value}"
                                (click)="toggleCheck('isProfile')">
                                <span class="text-sm font-medium text-gray-700">Is Profile (Panel)</span>
                                <boo-checkbox formControlName="isProfile"></boo-checkbox>
                            </div>

                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('requiresAppoinment')?.value, 'border-gray-200': !form.get('requiresAppoinment')?.value}"
                                (click)="toggleCheck('requiresAppoinment')">
                                <span class="text-sm font-medium text-gray-700">Requires Appointment</span>
                                <boo-checkbox formControlName="requiresAppoinment"></boo-checkbox>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="number" label="Standard Cost" formControlName="cost" placeholder="0.00"></boo-input>
                            <boo-input type="number" label="Reporting Time (Hours)" formControlName="reportingTimeHours" placeholder="Ex: 24"></boo-input>
                        </div>

                        <div class="mb-4">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm mb-3"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isUrgentAvailable')?.value, 'border-gray-200': !form.get('isUrgentAvailable')?.value}"
                                (click)="toggleCheck('isUrgentAvailable')">
                                <span class="text-sm font-medium text-gray-700">Urgent Processing Available</span>
                                <boo-checkbox formControlName="isUrgentAvailable"></boo-checkbox>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4" *ngIf="form.get('isUrgentAvailable')?.value">
                                <boo-input type="number" label="Urgent Cost" formControlName="urgentCost" placeholder="0.00"></boo-input>
                                <boo-input type="number" label="Urgent Reporting (Hours)" formControlName="urgentReportingTimeHours" placeholder="Ex: 2"></boo-input>
                            </div>
                        </div>

                        <div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm mb-3"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isHomeCollectionAvailable')?.value, 'border-gray-200': !form.get('isHomeCollectionAvailable')?.value}"
                                (click)="toggleCheck('isHomeCollectionAvailable')">
                                <span class="text-sm font-medium text-gray-700">Home Collection Available</span>
                                <boo-checkbox formControlName="isHomeCollectionAvailable"></boo-checkbox>
                            </div>
                            
                            <div *ngIf="form.get('isHomeCollectionAvailable')?.value">
                                <boo-input type="number" label="Home Collection Charge" formControlName="homeCollectionCharge" placeholder="0.00"></boo-input>
                            </div>
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

export class CommonCategoryLabTestDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<LabTest>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    categories$?: Observable<Lookup[]>;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private labTestSrv: LabTestService,
        protected labTestCategorySrv: LabTestCategoryService,
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
            testName: ['', [Validators.required]],
            categoryId: [null, [Validators.required]],
            description: [null],
            sampleType: [null],
            sampleVolume: [null],
            unitOfMeasurement: [null],
            methodology: [null],
            preparationRequired: [false],
            preparationInstructions: [null],
            fastingRequired: [false],
            fastingHours: [0],
            collectionInstructions: [null],
            normalRangeMale: [null],
            normalRangeFemale: [null],
            normalPediatric: [null],
            cost: [0],
            reportingTimeHours: [0],
            isProfile: [false],
            requiresAppoinment: [false],
            isUrgentAvailable: [false],
            urgentCost: [0],
            urgentReportingTimeHours: [0],
            isHomeCollectionAvailable: [false],
            homeCollectionCharge: [0]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.labTestSrv.search_by_id(id)
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        testName: _res.data?.testName,
                        categoryId: _res.data?.categoryId,
                        description: _res.data?.description,
                        sampleType: _res.data?.sampleType,
                        sampleVolume: _res.data?.sampleVolume,
                        unitOfMeasurement: _res.data?.unitOfMeasurement,
                        methodology: _res.data?.methodology,
                        preparationRequired: _res.data?.preparationRequired ?? false,
                        preparationInstructions: _res.data?.preparationInstructions,
                        fastingRequired: _res.data?.fastingRequired ?? false,
                        fastingHours: _res.data?.fastingHours ?? 0,
                        collectionInstructions: _res.data?.collectionInstructions,
                        normalRangeMale: _res.data?.normalRangeMale,
                        normalRangeFemale: _res.data?.normalRangeFemale,
                        normalPediatric: _res.data?.normalPediatric,
                        cost: _res.data?.cost ?? 0,
                        reportingTimeHours: _res.data?.reportingTimeHours ?? 0,
                        isProfile: _res.data?.isProfile ?? false,
                        requiresAppoinment: _res.data?.requiresAppoinment ?? false,
                        isUrgentAvailable: _res.data?.isUrgentAvailable ?? false,
                        urgentCost: _res.data?.urgentCost ?? 0,
                        urgentReportingTimeHours: _res.data?.urgentReportingTimeHours ?? 0,
                        isHomeCollectionAvailable: _res.data?.isHomeCollectionAvailable ?? false,
                        homeCollectionCharge: _res.data?.homeCollectionCharge ?? 0
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

        const formData = { ...this.form.getRawValue() }

        try {
            let id: string;
            if (this.currentId) {
                const updateRes = await firstValueFrom(this.labTestSrv.update(this.currentId, formData));
                if (!updateRes.success) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.labTestSrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.labTestSrv.search_by_id(id));
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
            testName: '',
            categoryId: null,
            description: null,
            sampleType: null,
            sampleVolume: null,
            unitOfMeasurement: null,
            methodology: null,
            preparationRequired: false,
            preparationInstructions: null,
            fastingRequired: false,
            fastingHours: 0,
            collectionInstructions: null,
            normalRangeMale: null,
            normalRangeFemale: null,
            normalPediatric: null,
            cost: 0,
            reportingTimeHours: 0,
            isProfile: false,
            requiresAppoinment: false,
            isUrgentAvailable: false,
            urgentCost: 0,
            urgentReportingTimeHours: 0,
            isHomeCollectionAvailable: false,
            homeCollectionCharge: 0
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