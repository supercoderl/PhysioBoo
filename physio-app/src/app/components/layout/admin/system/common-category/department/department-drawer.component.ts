import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { DepartmentService } from "../../../../../../services/admin/department.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Department } from "../../../../../../shared/types/operation";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'common-category-department-drawer',
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
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Department' : 'New Department' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure department logistics and service settings</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6 space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Department Name" formControlName="name" placeholder="Ex: Cardiology"></boo-input>
                            <boo-input label="Department Code" formControlName="departmentCode" placeholder="Ex: DEPT-CARD"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Head of Department" formControlName="headOfDepartment" [options]="[]"></boo-select>
                            <boo-input label="Hospital ID" formControlName="hospitalId"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Location & Contact</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="number" label="Floor Number" formControlName="floorNumber" placeholder="1"></boo-input>
                            <boo-input label="Wing/Block" formControlName="wing" placeholder="East Wing"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Phone" formControlName="phone" placeholder="+1..."></boo-input>
                            <boo-input label="Email" formControlName="email" placeholder="dept@hospital.com"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Capacity & Services</h3>
                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <boo-input type="number" label="Bed Count" formControlName="bedCount" placeholder="0"></boo-input>
                            <boo-input type="number" label="Budget Allocated" formControlName="budgetAllocated" prefix="$"></boo-input>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-3">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isEmergency')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isEmergency')">
                                <span class="text-sm font-medium text-gray-700">Emergency</span>
                                <boo-checkbox formControlName="isEmergency"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isCriticalCare')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isCriticalCare')">
                                <span class="text-sm font-medium text-gray-700">Critical Care</span>
                                <boo-checkbox formControlName="isCriticalCare"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isOutPatient')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isOutPatient')">
                                <span class="text-sm font-medium text-gray-700">Out-Patient</span>
                                <boo-checkbox formControlName="isOutPatient"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isInPatient')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isInPatient')">
                                <span class="text-sm font-medium text-gray-700">In-Patient</span>
                                <boo-checkbox formControlName="isInPatient"></boo-checkbox>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Operational Details</h3>
                        <boo-input label="Operation Hours" formControlName="operationHours" placeholder="24/7 or 08:00 - 17:00"></boo-input>
                        <boo-textarea label="Description" formControlName="description"></boo-textarea>
                        <boo-textarea label="Equipment List" formControlName="equipmentList" placeholder="Ventilators, MRI, etc."></boo-textarea>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})

export class CommonCategoryDepartmentDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Department>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private departmentSrv: DepartmentService,
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
            hospitalId: [null, [Validators.required]],
            name: ['', [Validators.required, Validators.maxLength(100)]],
            departmentCode: [''],
            description: [''],
            headOfDepartment: [null],
            budgetAllocated: [null, [Validators.min(0)]],
            floorNumber: [null],
            wing: [''],
            phone: [''],
            email: ['', [Validators.email]],
            bedCount: [0, [Validators.required, Validators.min(0)]],
            isEmergency: [false],
            isCriticalCare: [false],
            isOutPatient: [false],
            isInPatient: [false],
            operationHours: [''],
            equipmentList: ['']
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.departmentSrv.search_by_id(id)
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        hospitalId: _res.data?.hospitalId,
                        name: _res.data?.name ?? '',
                        departmentCode: _res.data?.departmentCode,
                        description: _res.data?.description,
                        headOfDepartment: _res.data?.headOfDepartment,
                        floorNumber: _res.data?.floorNumber,
                        wing: _res.data?.wing,
                        phone: _res.data?.phone,
                        email: _res.data?.email,
                        budgetAllocated: _res.data?.budgetAllocated,
                        bedCount: _res.data?.bedCount ?? 0,
                        isEmergency: _res.data?.isEmergency ?? false,
                        isCriticalCare: _res.data?.isCriticalCare ?? false,
                        isOutPatient: _res.data?.isOutPatient ?? false,
                        isInPatient: _res.data?.isInPatient ?? false,
                        operationHours: _res.data?.operationHours,
                        equipmentList: _res.data?.equipmentList
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
                const updateRes = await firstValueFrom(this.departmentSrv.update(this.currentId, formData));
                if (!updateRes.success) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.departmentSrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.departmentSrv.search_by_id(id));
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
            hospitalId: null,
            name: '',
            departmentCode: '',
            description: '',
            headOfDepartment: null,
            budgetAllocated: null,
            floorNumber: null,
            wing: '',
            phone: '',
            email: '',
            bedCount: 0,
            isEmergency: false,
            isCriticalCare: false,
            isOutPatient: false,
            isInPatient: false,
            operationHours: '',
            equipmentList: ''
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