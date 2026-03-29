import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { ManufacturerService } from "../../../../../../services/admin/manufacturer.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Manufacturer } from "../../../../../../shared/types/support";
import { generateUUID } from "../../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooDevJsonFillerComponent } from "../../../../dev/json-input/boo-json-input.component";

@Component({
    selector: 'common-category-manufacturer-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooButtonAdminComponent,
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
                            {{ currentId ? 'Edit Manufacturer' : 'New Manufacturer' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure company details and certifications</p>
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
                                <boo-input label="Company Name" [required]="true" formControlName="name" placeholder="Ex: MedTech Inc."></boo-input>
                                <boo-input type="number" label="Established Year" formControlName="establishedYear" placeholder="Ex: 1990"></boo-input>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Contact & Location</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input type="email" label="Email Address" formControlName="email" placeholder="contact@company.com"></boo-input>
                            <boo-input label="Phone Number" formControlName="phone" placeholder="+1..."></boo-input>
                        </div>
                        <div class="mb-4">
                            <boo-input label="Website" formControlName="website" placeholder="https://www..."></boo-input>
                        </div>
                        <div class="mb-4">
                            <boo-input label="Address" formControlName="address" placeholder="123 Main St"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="City" formControlName="city" placeholder="Ex: New York"></boo-input>
                            <boo-input label="State / Province" formControlName="state" placeholder="Ex: NY"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Country" formControlName="country" placeholder="Ex: USA"></boo-input>
                            <boo-input label="Postal Code" formControlName="postalCode" placeholder="Ex: 10001"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Legal & Certifications</h3>
                        <div class="mb-5">
                            <boo-input label="License Number" formControlName="licenseNumber" placeholder="Enter license code..."></boo-input>
                        </div>
                        
                        <label class="block text-sm font-medium text-gray-700 mb-2">Quality & Compliance</label>
                        <div class="grid grid-cols-3 gap-4">
                            <div 
                                class="border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm gap-2"
                                [ngClass]="{'border-primary bg-primary/5': form.get('gmpCertified')?.value, 'border-gray-200': !form.get('gmpCertified')?.value}"
                                (click)="toggleCheck('gmpCertified')"
                            >
                                <span class="text-sm font-bold" [ngClass]="form.get('gmpCertified')?.value ? 'text-primary' : 'text-gray-500'">GMP</span>
                                <boo-checkbox formControlName="gmpCertified"></boo-checkbox>
                            </div>

                            <div 
                                class="border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm gap-2"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isoCertified')?.value, 'border-gray-200': !form.get('isoCertified')?.value}"
                                (click)="toggleCheck('isoCertified')"
                            >
                                <span class="text-sm font-bold" [ngClass]="form.get('isoCertified')?.value ? 'text-primary' : 'text-gray-500'">ISO</span>
                                <boo-checkbox formControlName="isoCertified"></boo-checkbox>
                            </div>

                            <div 
                                class="border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm gap-2"
                                [ngClass]="{'border-primary bg-primary/5': form.get('fdaApproved')?.value, 'border-gray-200': !form.get('fdaApproved')?.value}"
                                (click)="toggleCheck('fdaApproved')"
                            >
                                <span class="text-sm font-bold" [ngClass]="form.get('fdaApproved')?.value ? 'text-primary' : 'text-gray-500'">FDA</span>
                                <boo-checkbox formControlName="fdaApproved"></boo-checkbox>
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

export class CommonCategoryManufacturerDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Manufacturer>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private manufacturerSrv: ManufacturerService,
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
            address: [null],
            city: [null],
            state: [null],
            country: [null],
            postalCode: [null],
            phone: [null],
            email: [null],
            website: [null],
            licenseNumber: [null],
            gmpCertified: [false],
            isoCertified: [false],
            fdaApproved: [false],
            establishedYear: [0]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.manufacturerSrv.search_by_id({ id })
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name,
                        address: _res.data?.address,
                        city: _res.data?.city,
                        state: _res.data?.state,
                        country: _res.data?.country,
                        postalCode: _res.data?.postalCode,
                        phone: _res.data?.phone,
                        email: _res.data?.email,
                        website: _res.data?.website,
                        licenseNumber: _res.data?.licenseNumber,
                        gmpCertified: _res.data?.gmpCertified ?? false,
                        isoCertified: _res.data?.isoCertified ?? false,
                        fdaApproved: _res.data?.fdaApproved ?? false,
                        establishedYear: _res.data?.establishedYear ?? 0,
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
            ? this.manufacturerSrv.update(formData)
            : this.manufacturerSrv.create(formData);

        try {
            await firstValueFrom(request$);

            const response = await firstValueFrom(this.manufacturerSrv.search_by_id({ id: targetId }));
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
            address: null,
            city: null,
            state: null,
            country: null,
            postalCode: null,
            phone: null,
            email: null,
            website: null,
            licenseNumber: null,
            gmpCertified: false,
            isoCertified: false,
            fdaApproved: false,
            establishedYear: 0
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