import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { MedicineCategoryService } from "../../../../../../services/admin/medicine-category.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { MedicineCategory } from "../../../../../../shared/types/clinical";
import { generateUUID } from "../../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'common-category-medicine-category-drawer',
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
            [width]="420"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Category' : 'New Category' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure category details and regulations</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>
                    
                    <div class="p-6">
                        <div class="space-y-4">
                            <boo-input label="Category Name" [required]="true" formControlName="name" placeholder="Ex: Antibiotics"></boo-input>
                            <boo-input label="Category Code" formControlName="code" placeholder="Ex: CAT-ANT-01"></boo-input>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
                                <boo-select 
                                    label="Select Parent (Optional)"
                                    formControlName="parentCategoryId"
                                    [options]="[
                                        { label: 'Root Level', value: null }
                                        ]"
                                ></boo-select>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Regulations</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isControlled')?.value, 'border-gray-200': !form.get('isControlled')?.value}"
                                (click)="toggleCheck('isControlled')"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                                        <boo-icon name="alert-triangle" [size]="18" class="text-red-600"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Controlled</span>
                                </div>
                                <boo-checkbox formControlName="isControlled"></boo-checkbox>
                            </div>

                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('requiresPrescription')?.value, 'border-gray-200': !form.get('requiresPrescription')?.value}"
                                (click)="toggleCheck('requiresPrescription')"
                            >
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <boo-icon name="file-text" [size]="18" class="text-blue-600"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Rx Required</span>
                                </div>
                                <boo-checkbox formControlName="requiresPrescription"></boo-checkbox>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Additional Info</h3>    
                        <div class="space-y-4">
                            <boo-textarea label="Storage Conditions" formControlName="storageConditions" placeholder="Ex: Store below 25°C, protect from direct sunlight..."></boo-textarea>
                            <boo-textarea label="Description" formControlName="description" placeholder="Enter category description..."></boo-textarea>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-10 sticky bottom-0">
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

export class CommonCategoryMedicineCategoryDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<MedicineCategory>();
    @Output() delete = new EventEmitter<string>();
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private medicineCategorySrv: MedicineCategoryService,
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
            code: [null],
            description: [null],
            parentCategoryId: [null],
            isControlled: [false],
            requiresPrescription: [false],
            storageConditions: [null]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.medicineCategorySrv.search_by_id({ id })
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name,
                        code: _res.data?.code,
                        description: _res.data?.description,
                        parentCategoryId: _res.data?.parentCategoryId,
                        isControlled: _res.data?.isControlled ?? false,
                        requiresPrescription: _res.data?.requiresPrescription ?? false,
                        storageConditions: _res.data?.storageConditions
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
            ? this.medicineCategorySrv.update(formData)
            : this.medicineCategorySrv.create(formData);

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
            name: '',
            code: null,
            description: null,
            parentCategoryId: null,
            isControlled: false,
            requiresPrescription: false,
            storageConditions: null
        });
    }

    onClose() {
        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
}