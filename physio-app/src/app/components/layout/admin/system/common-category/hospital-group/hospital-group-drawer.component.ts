import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { environment } from "../../../../../../../environments/environment.development";
import { BillingService } from "../../../../../../services/admin/billing.service";
import { HospitalGroupService } from "../../../../../../services/admin/hospital-group.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { SubscriptionPlan } from "../../../../../../shared/types/billing.types";
import { EMPTY_LOCATION_VALUE } from "../../../../../../shared/types/location.types";
import { HospitalGroup } from "../../../../../../shared/types/support.types";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooLocationSelectComponent } from "../../../../../select/boo-location-select/boo-location-select.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooUploadComponent } from "../../../../../upload/boo-upload/boo-upload.component";

@Component({
    selector: 'common-category-hospital-group-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooLocationSelectComponent,
        BooUploadComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Hospital Group' : 'New Hospital Group' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Manage hospital group details and subscription</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <physio-icon name="x" [size]="20"></physio-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <physio-icon name="loader" [size]="32" [class]="'animate-spin text-primary'"></physio-icon>
                    </div>

                    <div class="p-6 space-y-4">
                        <div class="flex items-center gap-4">
                            <boo-upload
                                formControlName="logoUrl"
                                width="8rem"
                                height="8rem"
                                [radius]="12"
                                [folder]="logoFolder"
                                accept="image/*"
                                aria-label="Upload group logo"
                            />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Group Name" [required]="true" formControlName="name" placeholder="Ex: MediCare Group"></boo-input>
                            <boo-input label="Code" [required]="true" formControlName="code" placeholder="Ex: MCG-001"></boo-input>
                        </div>
                        <boo-textarea label="Description" formControlName="description"></boo-textarea>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Contact Information</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Contact Person" [required]="true" formControlName="contactPerson" placeholder="Ex: John Doe"></boo-input>
                            <boo-input label="Email" [required]="true" formControlName="email" placeholder="group@example.com"></boo-input>
                        </div>
                        <boo-input label="Phone" [required]="true" formControlName="phone" placeholder="+1..."></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Location</h3>
                        <boo-location-select formControlName="location" [required]="true" class="mb-4"></boo-location-select>
                        <boo-input label="Address" [required]="true" formControlName="headquartersAddress" placeholder="Full address"></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Subscription</h3>
                        <boo-select label="Subscription Plan" [required]="true" formControlName="subscriptionPlanId" [options]="subscriptionPlanOptions"></boo-select>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end z-20 sticky bottom-0">
                    <div class="flex gap-3">
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
export class CommonCategoryHospitalGroupDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<HospitalGroup>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    readonly logoFolder = `${environment.CLOUDINARY.BASE_FOLDER}/hospital-groups`;

    /** Active plans from `GET api/billing/plans`; loaded the first time the drawer opens. */
    subscriptionPlanOptions: { label: string; value: string }[] = [];
    private currentPlanId: string | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private hospitalGroupSrv: HospitalGroupService,
        private billingSrv: BillingService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (!this.subscriptionPlanOptions.length) this.loadPlans();

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
            code: ['', [Validators.required, Validators.maxLength(50)]],
            description: [''],
            logoUrl: [''],
            contactPerson: ['', [Validators.required, Validators.maxLength(100)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.maxLength(20)]],
            headquartersAddress: ['', [Validators.required, Validators.maxLength(255)]],
            location: [{ ...EMPTY_LOCATION_VALUE }],
            subscriptionPlanId: [null, [Validators.required]]
        });
    }

    private loadPlans() {
        this.billingSrv.getPlans().subscribe({
            next: res => {
                if (!res.success) return;
                this.subscriptionPlanOptions = res.data
                    .filter((plan: SubscriptionPlan) => plan.isActive)
                    .sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.sortOrder - b.sortOrder)
                    .map((plan: SubscriptionPlan) => ({ label: plan.name, value: plan.id }));
            },
            error: () => this.toastSrv.error('Could not load subscription plans')
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.hospitalGroupSrv.search_by_id(id)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name ?? '',
                        code: _res.data?.code,
                        description: _res.data?.description,
                        logoUrl: _res.data?.logoUrl,
                        contactPerson: _res.data?.contactPerson,
                        email: _res.data?.email,
                        phone: _res.data?.phone,
                        headquartersAddress: _res.data?.headquartersAddress,
                        location: {
                            countryId: _res.data?.countryId ?? null,
                            cityId: _res.data?.cityId ?? null,
                            districtId: _res.data?.districtId ?? null,
                            wardId: _res.data?.wardId ?? null
                        },
                    });
                    this.loadCurrentPlan(id);
                }
            });
    }

    private loadCurrentPlan(hospitalGroupId: string) {
        this.billingSrv.getSubscription(hospitalGroupId).subscribe({
            next: res => {
                this.currentPlanId = res.success ? res.data?.planId ?? null : null;
                this.form.patchValue({ subscriptionPlanId: this.currentPlanId });
            },
            error: () => this.currentPlanId = null
        });
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const { location, subscriptionPlanId, ...fields } = this.form.getRawValue();
        const formData = { ...fields, ...location };

        try {
            let id: string;
            if (this.currentId) {
                const updateRes = await firstValueFrom(this.hospitalGroupSrv.update(this.currentId, formData));
                if (!updateRes.success) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.hospitalGroupSrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            await this.applySubscriptionPlan(id, subscriptionPlanId);

            const response = await firstValueFrom(this.hospitalGroupSrv.search_by_id(id));
            if (response.success && response.data) {
                this.toastSrv.success(this.currentId ? 'Hospital group updated' : 'Hospital group created');
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    /** The plan lives in the billing module, so it is assigned through the subscription endpoint once the group is saved. */
    private async applySubscriptionPlan(hospitalGroupId: string, planId: string | null) {
        if (!planId || planId === this.currentPlanId) return;

        try {
            await firstValueFrom(this.billingSrv.changeSubscription(hospitalGroupId, { action: 'ChangePlan', planId }));
            this.currentPlanId = planId;
        } catch {
            this.toastSrv.error('Hospital group saved, but the subscription plan could not be changed');
        }
    }

    resetForm() {
        this.currentPlanId = null;
        this.form.reset({
            name: '',
            code: '',
            description: '',
            logoUrl: '',
            contactPerson: '',
            email: '',
            phone: '',
            headquartersAddress: '',
            location: { ...EMPTY_LOCATION_VALUE },
            subscriptionPlanId: null
        });
    }

    onClose() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
        this.close.emit();
    }
    // #endregion
}
