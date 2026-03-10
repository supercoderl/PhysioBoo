import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { MedicalSpecialtyService } from "../../../../../../services/admin/medical-specialty.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { MedicalSpecialty } from "../../../../../../shared/types/medical-staff";
import { generateUUID } from "../../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooUploadComponent } from "../../../../../upload/boo-upload/boo-upload.component";

@Component({
    selector: 'common-category-medical-specialty-drawer',
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
        BooUploadComponent
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
                            {{ currentId ? 'Edit Specialty' : 'New Specialty' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure specialty details and settings</p>
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
                        <div class="flex gap-5">
                            <div class="flex-shrink-0">
                                <boo-upload 
                                    formControlName="iconUrl"
                                    width="5rem" 
                                    height="5rem"
                                    [radius]="12"
                                    [accept]="'.svg'"
                                    [svgSize]="126"
                                    (uploadSuccess)="onIconUploaded($event)"
                                />
                            </div>
                            <div class="flex-1 space-y-4">
                                <boo-input label="Specialty Name" [required]="true" formControlName="name" placeholder="Ex: Cardiology"></boo-input>
                                <boo-input label="Code" formControlName="code" placeholder="Ex: CARD-01"></boo-input>
                            </div>
                        </div>
                    </div>
                    <div class="h-px bg-gray-100 mx-6"></div>
                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Classification</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1.5">Parent Specialty</label>
                                <boo-select 
                                    label="Root Level"
                                    formControlName="parentSpecialtyId"
                                    [options]="[
                                        { label: 'Root Level', value: null }
                                    ]"
                                ></boo-select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1.5">Category Type</label>
                                <boo-select 
                                    label="Clinical"
                                    formControlName="category"
                                    [options]="[
                                        { label: 'Clinical', value: 'Clinical' },
                                        { label: 'Paraclinical', value: 'Paraclinical' },
                                        { label: 'Adminstrative', value: 'Adminstrative' }
                                    ]"
                                ></boo-select>
                            </div>
                        </div>
                    </div>
                    <div class="h-px bg-gray-100 mx-6"></div>
                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Settings & Configuration</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isSurgical')?.value, 'border-gray-200': !form.get('isSurgical')?.value}"
                                (click)="toggleCheck('isSurgical')"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <img src="assets/images/default/surgery.png" class="w-5 h-5 opacity-80" alt="icon" onerror="this.style.display='none'">
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Surgical</span>
                                </div>
                                <boo-checkbox formControlName="isSurgical"></boo-checkbox>
                            </div>
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isDiagnostic')?.value, 'border-gray-200': !form.get('isDiagnostic')?.value}"
                                (click)="toggleCheck('isDiagnostic')"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <img src="assets/images/default/diagnostic.png" class="w-5 h-5 opacity-80" alt="icon" onerror="this.style.display='none'">
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Diagnostic</span>
                                </div>
                                <boo-checkbox formControlName="isDiagnostic"></boo-checkbox>
                            </div>
                        </div>
                        <div>
                            <boo-input type="number" label="Avg. Consultation Duration (Minutes)" formControlName="averageConsultationDuration" placeholder="30"></boo-input>
                        </div>
                    </div>
                    <div class="h-px bg-gray-100 mx-6"></div>
                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Additional Info</h3>    
                        <div class="space-y-4">
                            <boo-textarea label="Description" formControlName="description" placeholder="Enter specialty description..."></boo-textarea>
                            <boo-textarea label="Required Qualifications" formControlName="requiredQualifications" placeholder="Degrees, certificates required..."></boo-textarea>
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

export class CommonCategoryMedicalSpecialtyDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<MedicalSpecialty>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private medicalSpecialtySrv: MedicalSpecialtyService,
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
            requiredQualifications: [''],
            isDiagnostic: [false],
            isSurgical: [false],
            parentSpecialtyId: [null],
            averageConsultationDuration: [0],
            iconUrl: [null],
            iconPublicId: [null]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.medicalSpecialtySrv.search_by_id({ id })
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
                        requiredQualifications: _res.data?.requiredQualifications,
                        isDiagnostic: _res.data?.isDiagnostic,
                        isSurgical: _res.data?.isSurgical,
                        parentSpecialtyId: _res.data?.parentSpecialtyId,
                        averageConsultationDuration: _res.data?.averageConsultationDuration,
                        iconUrl: _res.data?.iconUrl
                    })
                }
            })
    }

    toggleCheck(controlName: 'isSurgical' | 'isDiagnostic') {
        const otherControlName = controlName === 'isSurgical' ? 'isDiagnostic' : 'isSurgical';
        const currentValue = this.form.get(controlName)?.value;

        this.form.patchValue({
            [controlName]: !currentValue,
            [otherControlName]: !currentValue ? false : this.form.get(otherControlName)?.value
        });
        this.form.markAsDirty();
    }

    onIconUploaded(data: { url: string; publicId: string }) {
        this.form.patchValue({
            iconUrl: data.url,
            iconPublicId: data.publicId
        });
        this.form.markAsDirty();
    }

    onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const formData = { ...this.form.getRawValue(), id: this.currentId ?? generateUUID() }

        const request$ = this.currentId
            ? this.medicalSpecialtySrv.update(formData)
            : this.medicalSpecialtySrv.create(formData);

        request$.subscribe({
            next: (res) => this.saveSuccess.emit({
                id: res.data,
                ...this.form.getRawValue(),
                createdAt: new Date()
            })
        });
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
        if(this.currentId) this.delete.emit(this.currentId);
    }
}