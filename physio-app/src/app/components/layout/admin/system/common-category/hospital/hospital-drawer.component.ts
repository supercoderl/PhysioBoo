import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { HospitalService } from "../../../../../../services/admin/hospital.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { HospitalType } from "../../../../../../shared/enums/hospital-type";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Hospital } from "../../../../../../shared/types/support";
import { generateUUID } from "../../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'common-category-hospital-drawer',
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
                            {{ currentId ? 'Edit Hospital' : 'New Hospital' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure hospital details and facility settings</p>
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
                            <boo-input label="Hospital Name" formControlName="name" placeholder="Ex: City General Hospital"></boo-input>
                            <boo-input label="Code" formControlName="code" placeholder="Ex: CGH-001"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Hospital Group" formControlName="hospitalGroupId" [options]="[]"></boo-select>
                            <boo-select label="Type" formControlName="type" [options]="hospitalTypeOptions"></boo-select>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Contact & Location</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Phone" formControlName="phone" placeholder="+1..."></boo-input>
                            <boo-input label="Email" formControlName="email" placeholder="hospital@example.com"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Website" formControlName="website" placeholder="https://..."></boo-input>
                            <boo-input label="City" formControlName="city" placeholder="Ex: New York"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Country" formControlName="country" placeholder="Ex: United States"></boo-input>
                            <boo-input label="Address" formControlName="address" placeholder="Full address"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Facility Details</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="number" label="Total Beds" formControlName="totalBeds" placeholder="0"></boo-input>
                            <boo-input type="number" label="Operating Rooms" formControlName="operatingRooms" placeholder="0"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Accreditation Number" formControlName="accreditationNumber"></boo-input>
                            <boo-input label="License Number" formControlName="licenseNumber"></boo-input>
                        </div>

                        <div class="grid grid-cols-2 gap-3 mt-2">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('hasEmergencyServices')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('hasEmergencyServices')">
                                <span class="text-sm font-medium text-gray-700">Emergency Services</span>
                                <boo-checkbox formControlName="hasEmergencyServices"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('hasIcu')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('hasIcu')">
                                <span class="text-sm font-medium text-gray-700">ICU</span>
                                <boo-checkbox formControlName="hasIcu"></boo-checkbox>
                            </div>
                        </div>
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
export class CommonCategoryHospitalDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Hospital>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    readonly hospitalTypeOptions = [
        { label: 'General Hospital', value: HospitalType.GeneralHospital },
        { label: 'Specialist Hospital', value: HospitalType.SpecialistHospital },
        { label: 'Polyclinic', value: HospitalType.Polyclinic },
        { label: 'Clinic', value: HospitalType.Clinic },
        { label: 'Emergency Center', value: HospitalType.EmergencyCenter },
        { label: 'Rehabilitation Center', value: HospitalType.RehabilitationCenter },
        { label: 'Maternity Hospital', value: HospitalType.MaternityHospital },
        { label: 'Pediatric Hospital', value: HospitalType.PediatricHospital },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private hospitalSrv: HospitalService,
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
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: [''],
            hospitalGroupId: [null, [Validators.required]],
            type: [HospitalType.GeneralHospital, [Validators.required]],
            address: [''],
            city: [''],
            country: [''],
            phone: [''],
            email: ['', [Validators.email]],
            website: [''],
            totalBeds: [0, [Validators.required, Validators.min(0)]],
            operatingRooms: [0, [Validators.min(0)]],
            hasEmergencyServices: [false],
            hasIcu: [false],
            accreditationNumber: [''],
            licenseNumber: ['']
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.hospitalSrv.search_by_id({ id })
            .pipe(finalize(() => this.form.enable()))
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name ?? '',
                        code: _res.data?.code,
                        hospitalGroupId: _res.data?.hospitalGroupId,
                        type: _res.data?.type,
                        address: _res.data?.address,
                        city: _res.data?.city,
                        country: _res.data?.country,
                        phone: _res.data?.phone,
                        email: _res.data?.email,
                        website: _res.data?.website,
                        totalBeds: _res.data?.totalBeds ?? 0,
                        operatingRooms: _res.data?.operatingRooms ?? 0,
                        hasEmergencyServices: _res.data?.hasEmergencyServices ?? false,
                        hasIcu: _res.data?.hasIcu ?? false,
                        accreditationNumber: _res.data?.accreditationNumber,
                        licenseNumber: _res.data?.licenseNumber
                    });
                }
            });
    }

    toggleCheck(controlName: string) {
        const currentValue = this.form.get(controlName)?.value;
        this.form.patchValue({ [controlName]: !currentValue });
        this.form.markAsDirty();
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const targetId = this.currentId ?? generateUUID();
        const formData = { ...this.form.getRawValue(), id: targetId };

        const request$ = this.currentId
            ? this.hospitalSrv.update(formData)
            : this.hospitalSrv.create(formData);

        try {
            await firstValueFrom(request$);
            const response = await firstValueFrom(this.hospitalSrv.search_by_id({ id: targetId }));
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
            name: '',
            code: '',
            hospitalGroupId: null,
            type: HospitalType.GeneralHospital,
            address: '',
            city: '',
            country: '',
            phone: '',
            email: '',
            website: '',
            totalBeds: 0,
            operatingRooms: 0,
            hasEmergencyServices: false,
            hasIcu: false,
            accreditationNumber: '',
            licenseNumber: ''
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
    // #endregion
}
