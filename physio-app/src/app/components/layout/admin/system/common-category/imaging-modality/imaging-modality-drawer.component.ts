import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { ImagingModalityService } from "../../../../../../services/admin/imaging-modality.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { ImagingModality } from "../../../../../../shared/types/laboratory-imaging.types";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'common-category-imaging-modality-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooCheckboxComponent
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
                            {{ currentId ? 'Edit Imaging Modality' : 'New Imaging Modality' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure imaging modality details and parameters</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Basic Information</h3>
                        <div class="space-y-4">
                            <boo-input label="Modality Name" [required]="true" formControlName="name" placeholder="Ex: Magnetic Resonance Imaging"></boo-input>
                            <div class="flex gap-4">
                                <div class="flex-1">
                                    <boo-input label="Code" formControlName="code" placeholder="Ex: MRI"></boo-input>
                                </div>
                                <div class="flex-1">
                                    <boo-select 
                                        label="Category"
                                        formControlName="category"
                                        [options]="[
                                            { label: 'X-Ray', value: 'X-Ray' },
                                            { label: 'Ultrasound', value: 'Ultrasound' },
                                            { label: 'MRI', value: 'MRI' },
                                            { label: 'CT Scan', value: 'CT Scan' },
                                            { label: 'Nuclear Medicine', value: 'Nuclear Medicine' }
                                        ]"
                                    ></boo-select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Metrics & Parameters</h3>
                        <div class="flex gap-4">
                            <div class="flex-1">
                                <boo-input type="number" label="Avg. Duration (Mins)" formControlName="averageDurationMinutes" placeholder="30"></boo-input>
                            </div>
                            <div class="flex-1">
                                <boo-input type="number" label="Radiation Dose (mSv)" formControlName="radiationDose" placeholder="0.00"></boo-input>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">* Note: Set Radiation Dose to 0 for Ultrasound and MRI.</p>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Clinical Settings</h3>
                        <div class="grid grid-cols-2 gap-4">
                            
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-purple-400 hover:shadow-sm"
                                [ngClass]="{'border-purple-500 bg-purple-50/50': form.get('requiresContrast')?.value, 'border-gray-200': !form.get('requiresContrast')?.value}"
                                (click)="toggleCheck('requiresContrast')"
                            >
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                        <boo-icon name="droplet" [size]="16" color="#a855f7"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Requires Contrast</span>
                                </div>
                                <boo-checkbox formControlName="requiresContrast"></boo-checkbox>
                            </div>

                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-orange-400 hover:shadow-sm"
                                [ngClass]="{'border-orange-500 bg-orange-50/50': form.get('preparationRequired')?.value, 'border-gray-200': !form.get('preparationRequired')?.value}"
                                (click)="toggleCheck('preparationRequired')"
                            >
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <boo-icon name="clipboard-list" [size]="16" color="#f97316"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Preparation Needed</span>
                                </div>
                                <boo-checkbox formControlName="preparationRequired"></boo-checkbox>
                            </div>

                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Details & Instructions</h3>    
                        <div class="space-y-4">
                            <div *ngIf="form.get('preparationRequired')?.value" class="animate-fade-in-up">
                                <boo-textarea 
                                    label="Preparation Instructions" 
                                    formControlName="preparationInstructions" 
                                    placeholder="Ex: Patient must fast for 6 hours prior. Drink 1 liter of water..."></boo-textarea>
                            </div>
                            <boo-textarea 
                                label="Description" 
                                formControlName="description" 
                                placeholder="General description of this modality..."></boo-textarea>
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

export class CommonCategoryImagingModalityDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<ImagingModality>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private imagingModalitySrv: ImagingModalityService,
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
            code: [''],
            category: ['Clinical'],
            description: [''],
            requiresContrast: [false],
            preparationRequired: [false],
            preparationInstructions: [null],
            averageDurationMinutes: [0],
            radiationDose: [0]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.imagingModalitySrv.search_by_id(id)
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name,
                        code: _res.data?.code,
                        category: _res.data?.category,
                        description: _res.data?.description,
                        requiresContrast: _res.data?.requiresContrast || false,
                        preparationRequired: _res.data?.preparationRequired || false,
                        preparationInstructions: _res.data?.preparationInstructions,
                        averageDurationMinutes: _res.data?.averageDurationMinutes || 0,
                        radiationDose: _res.data?.radiationDose || 0,
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
                await firstValueFrom(this.imagingModalitySrv.update(this.currentId, formData));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.imagingModalitySrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.imagingModalitySrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    resetForm() {
        this.form.reset({
            requiresContrast: false,
            preparationRequired: false,
            averageDurationMinutes: 0,
            radiationDose: 0
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