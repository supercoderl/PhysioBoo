import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { MedicalServiceService } from "../../../../../services/admin/medical-service.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CreateServiceRequest, MedicalService, ServiceAvailability, ServiceStatus } from "../../../../../shared/types/service.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'cms-service-drawer',
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
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="640" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative" [formGroup]="form">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Service' : 'New Service' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Service catalog entry, pricing, and operational rules.</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar>
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6 space-y-5">
                        <!-- Identity -->
                        <div>
                            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Identity</h3>
                            <div class="grid grid-cols-3 gap-3">
                                <div class="col-span-1">
                                    <boo-input label="Code" formControlName="code" placeholder="ECG-001" required></boo-input>
                                </div>
                                <div class="col-span-2">
                                    <boo-input label="Name" formControlName="name" placeholder="Resting ECG" required></boo-input>
                                </div>
                            </div>
                            <div class="mt-3">
                                <boo-input label="Short name" formControlName="shortName" placeholder="Optional, shown in chips & cards"></boo-input>
                            </div>
                            <div class="mt-3">
                                <boo-textarea label="Description" formControlName="description" [rows]="3" placeholder="What this service includes…"></boo-textarea>
                            </div>
                        </div>

                        <div class="h-px bg-gray-100"></div>

                        <!-- Classification & lifecycle -->
                        <div>
                            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Lifecycle</h3>
                            <div class="grid grid-cols-2 gap-3">
                                <boo-select label="Status" formControlName="status" [options]="statusOptions"></boo-select>
                                <boo-select label="Availability" formControlName="availability" [options]="availabilityOptions"></boo-select>
                            </div>
                            <div class="grid grid-cols-2 gap-3 mt-3" *ngIf="departmentOptions.length || doctorOptions.length">
                                <boo-select *ngIf="departmentOptions.length" label="Primary department" formControlName="primaryDepartmentId" [options]="departmentOptions"></boo-select>
                                <boo-select *ngIf="doctorOptions.length"     label="Primary doctor"     formControlName="primaryDoctorId"     [options]="doctorOptions"></boo-select>
                            </div>
                        </div>

                        <div class="h-px bg-gray-100"></div>

                        <!-- Pricing -->
                        <div>
                            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Pricing</h3>
                            <div class="grid grid-cols-3 gap-3">
                                <div class="col-span-2">
                                    <boo-input label="Base price" type="number" formControlName="basePrice" required></boo-input>
                                </div>
                                <boo-select label="Currency" formControlName="currency" [options]="currencyOptions"></boo-select>
                            </div>
                            <label class="flex items-center justify-between p-3 border border-gray-200 rounded-lg mt-3 cursor-pointer hover:bg-gray-50">
                                <span class="text-sm text-primary">VAT included in base price</span>
                                <boo-checkbox formControlName="vatIncluded"></boo-checkbox>
                            </label>
                        </div>

                        <div class="h-px bg-gray-100"></div>

                        <!-- Operational -->
                        <div class="pb-6">
                            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Operational</h3>
                            <boo-input label="Duration (minutes)" type="number" formControlName="durationMinutes" required></boo-input>
                            <div class="grid grid-cols-2 gap-3 mt-3">
                                <label class="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span class="text-sm text-primary">Requires appointment</span>
                                    <boo-checkbox formControlName="requiresAppointment"></boo-checkbox>
                                </label>
                                <label class="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <span class="text-sm text-primary">Requires referral</span>
                                    <boo-checkbox formControlName="requiresReferral"></boo-checkbox>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 z-20 sticky bottom-0">
                    <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                    <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
                        {{ currentId ? 'Save Changes' : 'Create Service' }}
                    </boo-button-admin>
                </div>
            </div>
        </drawer>
    `
})
export class CmsServiceDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Input() departmentOptions: { label: string; value: string }[] = [];
    @Input() doctorOptions: { label: string; value: string }[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<MedicalService>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    form: FormGroup;

    readonly statusOptions: { label: string; value: ServiceStatus }[] = [
        { label: 'Active',   value: 'Active' },
        { label: 'Draft',    value: 'Draft' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Archived', value: 'Archived' },
    ];

    readonly availabilityOptions: { label: string; value: ServiceAvailability }[] = [
        { label: 'Available',   value: 'Available' },
        { label: 'Limited',     value: 'Limited' },
        { label: 'Unavailable', value: 'Unavailable' },
    ];

    readonly currencyOptions = [
        { label: 'VND', value: 'VND' },
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private srv: MedicalServiceService,
        protected loadingSrv: LocalLoadingService,
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
            code:                ['', [Validators.required, Validators.maxLength(32)]],
            name:                ['', [Validators.required, Validators.maxLength(120)]],
            shortName:           [''],
            description:         [''],
            status:              ['Draft' as ServiceStatus,             [Validators.required]],
            availability:        ['Available' as ServiceAvailability,   [Validators.required]],
            primaryDepartmentId: [null],
            primaryDoctorId:     [null],
            basePrice:           [0, [Validators.required, Validators.min(0)]],
            currency:            ['VND', [Validators.required]],
            vatIncluded:         [false],
            durationMinutes:     [30, [Validators.required, Validators.min(1)]],
            requiresAppointment: [true],
            requiresReferral:    [false],
        });
    }

    private loadDetail(id: string): void {
        this.loadingSrv.setLoading('search-by-id', true);
        this.srv.search_by_id(id)
            .pipe(finalize(() => this.loadingSrv.setLoading('search-by-id', false)))
            .subscribe(res => {
                if (res.success && res.data) {
                    const s = res.data;
                    this.form.reset({
                        code: s.code,
                        name: s.name,
                        shortName: s.shortName ?? '',
                        description: s.description ?? '',
                        status: s.status,
                        availability: s.availability,
                        primaryDepartmentId: s.departmentIds[0] ?? null,
                        primaryDoctorId: s.primaryDoctorId ?? null,
                        basePrice: s.basePrice,
                        currency: s.currency,
                        vatIncluded: s.vatIncluded,
                        durationMinutes: s.durationMinutes,
                        requiresAppointment: s.requiresAppointment,
                        requiresReferral: s.requiresReferral,
                    });
                }
            });
    }

    private resetForm(): void {
        this.form.reset({
            code: '', name: '', shortName: '', description: '',
            status: 'Draft', availability: 'Available',
            primaryDepartmentId: null, primaryDoctorId: null,
            basePrice: 0, currency: 'VND', vatIncluded: false,
            durationMinutes: 30, requiresAppointment: true, requiresReferral: false,
        });
    }

    async onSave(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastSrv.error('Please complete the required fields');
            return;
        }

        const v = this.form.getRawValue();
        const body: CreateServiceRequest = {
            code: v.code,
            name: v.name,
            shortName: v.shortName || null,
            description: v.description || null,
            departmentIds: v.primaryDepartmentId ? [v.primaryDepartmentId] : [],
            status: v.status,
            availability: v.availability,
            basePrice: Number(v.basePrice) || 0,
            currency: v.currency,
            vatIncluded: !!v.vatIncluded,
            durationMinutes: Number(v.durationMinutes) || 30,
            requiresAppointment: !!v.requiresAppointment,
            requiresReferral: !!v.requiresReferral,
            primaryDoctorId: v.primaryDoctorId || null,
            doctorIds: v.primaryDoctorId ? [v.primaryDoctorId] : [],
        };

        this.loadingSrv.setLoading('update', true);
        try {
            let id: string;
            if (this.currentId) {
                await firstValueFrom(this.srv.update(this.currentId, body));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.srv.create(body));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.srv.search_by_id(id));
            if (response.success && response.data) {
                this.toastSrv.success(this.currentId ? 'Service updated' : 'Service created');
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        } finally {
            this.loadingSrv.setLoading('update', false);
        }
    }

    onClose(): void {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
        this.close.emit();
    }
    // #endregion
}
