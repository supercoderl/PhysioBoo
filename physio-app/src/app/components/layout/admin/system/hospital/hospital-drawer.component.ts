import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { HospitalService } from "../../../../../services/admin/hospital.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { HOSPITAL_TYPE_LABELS, HospitalType } from "../../../../../shared/enums/hospital-type";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Hospital, SaveHospitalRequest } from "../../../../../shared/types/support.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../date-picker/boo-date-picker.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

/** At least one non-empty entry in a comma separated list. */
const listRequired = (control: AbstractControl): ValidationErrors | null =>
    splitList(control.value).length ? null : { required: true };

const splitList = (value: unknown): string[] =>
    String(value ?? '').split(',').map(item => item.trim()).filter(Boolean);

const orNull = (value: unknown): string | null => {
    const text = String(value ?? '').trim();
    return text ? text : null;
};

const toCount = (value: unknown): number => Math.max(0, Math.trunc(Number(value) || 0));

/** Create / edit one branch. Fields the form does not show are carried over from the loaded record on update. */
@Component({
    selector: 'admin-hospital-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooDatepickerComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooCheckboxComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Branch' : 'New Branch' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Identity, location, capacity and compliance of this branch</p>
                    </div>
                    <button type="button" aria-label="Close" (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <physio-icon name="x" [size]="20"></physio-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingDetail" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <physio-icon name="loader" [size]="32" [class]="'animate-spin text-primary'"></physio-icon>
                    </div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Identity</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-input label="Branch name" required formControlName="name" placeholder="Ex: Riverside Rehabilitation Center"></boo-input>
                            <boo-select label="Type" required formControlName="hospitalType" [options]="hospitalTypeOptions"></boo-select>
                        </div>
                        <boo-textarea label="Description" formControlName="description"></boo-textarea>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Location</h3>
                        <boo-input label="Address" required formControlName="address" placeholder="Street and number"></boo-input>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-input label="City" required formControlName="city"></boo-input>
                            <boo-input label="State / Province" required formControlName="stateProvince"></boo-input>
                            <boo-input label="Postal code" formControlName="postalCode"></boo-input>
                            <boo-input label="Country" required formControlName="country"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Contact</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-input label="Phone" formControlName="phone" placeholder="+1..."></boo-input>
                            <boo-input label="Emergency phone" formControlName="emergencyPhone"></boo-input>
                            <boo-input label="Ambulance phone" formControlName="ambulancePhone"></boo-input>
                            <boo-input label="Fax" formControlName="fax"></boo-input>
                            <boo-input label="Email" formControlName="email" placeholder="branch@example.com"></boo-input>
                            <boo-input label="Website" formControlName="website" placeholder="https://..."></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Capacity</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-input type="number" label="Emergency capacity" formControlName="emergencyCapacity"></boo-input>
                            <boo-input type="number" label="Operation theaters" formControlName="operationTheaters"></boo-input>
                            <ng-container *ngIf="currentId">
                                <boo-input type="number" label="Bed capacity" formControlName="bedCapacity"></boo-input>
                                <boo-input type="number" label="ICU capacity" formControlName="icuCapacity"></boo-input>
                            </ng-container>
                        </div>
                        <p *ngIf="!currentId" class="text-xs text-secondary m-0">Bed and ICU capacity can be set after the branch is created.</p>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Compliance</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <boo-input label="License number" formControlName="licenseNumber"></boo-input>
                            <boo-datepicker label="License expiry" formControlName="licenseExpiry"></boo-datepicker>
                            <boo-input label="Accreditation body" required formControlName="accreditationBody" placeholder="Ex: Joint Commission International"></boo-input>
                            <boo-datepicker label="Accreditation expiry" formControlName="accreditationExpiry"></boo-datepicker>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Services</h3>
                        <boo-input label="Insurance accepted" required formControlName="insuranceAccepted" placeholder="Comma separated, ex: Aurora Health, BlueLeaf"></boo-input>
                        <boo-input label="Languages supported" required formControlName="languagesSupported" placeholder="Comma separated, ex: English, Vietnamese"></boo-input>

                        <div *ngIf="currentId" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('is24Hours')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('is24Hours')">
                                <span class="text-sm font-medium text-gray-700">Open 24 hours</span>
                                <boo-checkbox formControlName="is24Hours"></boo-checkbox>
                            </div>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('isActive')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('isActive')">
                                <span class="text-sm font-medium text-gray-700">Active</span>
                                <boo-checkbox formControlName="isActive"></boo-checkbox>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" type="button" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <physio-icon name="trash" [size]="16"></physio-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="saving">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class AdminHospitalDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Hospital>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    form: FormGroup;
    loadingDetail = false;
    saving = false;

    /** The record as loaded: source of every value the form does not show (coordinates, facilities, logo, …). */
    private loaded: Hospital | null = null;

    readonly hospitalTypeOptions = Object.entries(HOSPITAL_TYPE_LABELS)
        .map(([value, label]) => ({ label, value: Number(value) as HospitalType }));
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private hospitalSrv: HospitalService
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
            name: ['', [Validators.required, Validators.maxLength(255)]],
            hospitalType: [HospitalType.General, [Validators.required]],
            description: [''],
            address: ['', [Validators.required]],
            city: ['', [Validators.required, Validators.maxLength(100)]],
            stateProvince: ['', [Validators.required, Validators.maxLength(100)]],
            postalCode: ['', [Validators.maxLength(20)]],
            country: ['', [Validators.required, Validators.maxLength(100)]],
            phone: ['', [Validators.maxLength(20)]],
            emergencyPhone: ['', [Validators.maxLength(20)]],
            ambulancePhone: ['', [Validators.maxLength(20)]],
            fax: ['', [Validators.maxLength(20)]],
            email: ['', [Validators.email, Validators.maxLength(255)]],
            website: ['', [Validators.maxLength(255)]],
            emergencyCapacity: [0, [Validators.min(0)]],
            operationTheaters: [0, [Validators.min(0)]],
            bedCapacity: [0, [Validators.min(0)]],
            icuCapacity: [0, [Validators.min(0)]],
            licenseNumber: ['', [Validators.maxLength(100)]],
            licenseExpiry: [null as string | null],
            accreditationBody: ['', [Validators.required, Validators.maxLength(255)]],
            accreditationExpiry: [null as string | null],
            insuranceAccepted: ['', [listRequired]],
            languagesSupported: ['', [listRequired]],
            is24Hours: [false],
            isActive: [true]
        });
    }

    private resetForm(): void {
        this.loaded = null;
        this.form.reset({
            name: '', hospitalType: HospitalType.General, description: '',
            address: '', city: '', stateProvince: '', postalCode: '', country: '',
            phone: '', emergencyPhone: '', ambulancePhone: '', fax: '', email: '', website: '',
            emergencyCapacity: 0, operationTheaters: 0, bedCapacity: 0, icuCapacity: 0,
            licenseNumber: '', licenseExpiry: null, accreditationBody: '', accreditationExpiry: null,
            insuranceAccepted: '', languagesSupported: '', is24Hours: false, isActive: true
        });
    }

    private loadDetail(id: string): void {
        this.loadingDetail = true;
        this.form.disable();

        this.hospitalSrv.search_by_id(id).pipe(
            finalize(() => {
                this.loadingDetail = false;
                this.form.enable();
            })
        ).subscribe(res => {
            const hospital = res.success ? res.data : null;
            if (!hospital) return;

            this.loaded = hospital;
            this.form.patchValue({
                name: hospital.name,
                hospitalType: hospital.hospitalType,
                description: hospital.description ?? '',
                address: hospital.address,
                city: hospital.city,
                stateProvince: hospital.stateProvince,
                postalCode: hospital.postalCode ?? '',
                country: hospital.country,
                phone: hospital.phone ?? '',
                emergencyPhone: hospital.emergencyPhone ?? '',
                ambulancePhone: hospital.ambulancePhone ?? '',
                fax: hospital.fax ?? '',
                email: hospital.email ?? '',
                website: hospital.website ?? '',
                emergencyCapacity: hospital.emergencyCapacity,
                operationTheaters: hospital.operationTheaters,
                bedCapacity: hospital.bedCapacity,
                icuCapacity: hospital.icuCapacity,
                licenseNumber: hospital.licenseNumber ?? '',
                licenseExpiry: hospital.licenseExpiry?.slice(0, 10) ?? null,
                accreditationBody: hospital.accreditationBody,
                accreditationExpiry: hospital.accreditationExpiry?.slice(0, 10) ?? null,
                insuranceAccepted: hospital.insuranceAccepted.join(', '),
                languagesSupported: hospital.languagesSupported.join(', '),
                is24Hours: hospital.is24Hours,
                isActive: hospital.isActive
            });
            this.form.markAsPristine();
        });
    }

    toggleCheck(controlName: string): void {
        const current = this.form.get(controlName)?.value;
        this.form.patchValue({ [controlName]: !current });
        this.form.markAsDirty();
    }

    private buildPayload(): SaveHospitalRequest {
        const v = this.form.getRawValue();
        const kept = this.loaded;

        return {
            name: String(v.name).trim(),
            hospitalType: Number(v.hospitalType) as HospitalType,
            emergencyCapacity: toCount(v.emergencyCapacity),
            operationTheaters: toCount(v.operationTheaters),
            bedCapacity: toCount(v.bedCapacity),
            icuCapacity: toCount(v.icuCapacity),
            address: String(v.address).trim(),
            city: String(v.city).trim(),
            stateProvince: String(v.stateProvince).trim(),
            postalCode: orNull(v.postalCode),
            country: String(v.country).trim(),
            phone: orNull(v.phone),
            fax: orNull(v.fax),
            email: orNull(v.email),
            website: orNull(v.website),
            emergencyPhone: orNull(v.emergencyPhone),
            ambulancePhone: orNull(v.ambulancePhone),
            latitude: kept?.latitude ?? null,
            longtitude: kept?.longtitude ?? null,
            establishedDate: kept?.establishedDate ?? null,
            licenseNumber: orNull(v.licenseNumber),
            licenseExpiry: orNull(v.licenseExpiry),
            accreditationBody: String(v.accreditationBody).trim(),
            accreditationExpiry: orNull(v.accreditationExpiry),
            insuranceAccepted: splitList(v.insuranceAccepted),
            languagesSupported: splitList(v.languagesSupported),
            facilities: kept?.facilities ?? null,
            operatingHours: kept?.operatingHours ?? null,
            is24Hours: !!v.is24Hours,
            isActive: !!v.isActive,
            logoUrl: kept?.logoUrl ?? null,
            images: kept?.images ?? null,
            description: orNull(v.description),
            missionStatement: kept?.missionStatement ?? null,
            visionStatement: kept?.visionStatement ?? null
        };
    }

    async onSave(): Promise<void> {
        if (this.saving) return;
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        this.saving = true;
        try {
            const payload = this.buildPayload();
            let id: string;

            if (this.currentId) {
                await firstValueFrom(this.hospitalSrv.update(this.currentId, payload));
                id = this.currentId;
            } else {
                const created = await firstValueFrom(this.hospitalSrv.create(payload));
                if (!created.success || !created.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = created.data;
            }

            const saved = await firstValueFrom(this.hospitalSrv.search_by_id(id));
            if (saved.success && saved.data) {
                this.toastSrv.success(this.currentId ? 'Branch updated' : 'Branch created');
                this.saveSuccess.emit(saved.data);
            } else {
                this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
            }
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        } finally {
            this.saving = false;
        }
    }

    onClose(): void {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
        this.close.emit();
    }

    onDelete(): void {
        if (this.currentId) this.delete.emit(this.currentId);
    }
    // #endregion
}
