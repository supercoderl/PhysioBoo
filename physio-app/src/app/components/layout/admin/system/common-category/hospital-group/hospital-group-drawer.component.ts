import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { HospitalGroupService } from "../../../../../../services/admin/hospital-group.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SubscriptionPlan } from "../../../../../../shared/enums/subscription-plan";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { HospitalGroup } from "../../../../../../shared/types/support.types";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'common-category-hospital-group-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Hospital Group' : 'New Hospital Group' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Manage hospital group details and subscription</p>
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
                            <boo-input label="Group Name" formControlName="name" placeholder="Ex: MediCare Group"></boo-input>
                            <boo-input label="Code" formControlName="code" placeholder="Ex: MCG-001"></boo-input>
                        </div>
                        <boo-textarea label="Description" formControlName="description"></boo-textarea>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Contact Information</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="Contact Person" formControlName="contactPerson" placeholder="Ex: John Doe"></boo-input>
                            <boo-input label="Email" formControlName="email" placeholder="group@example.com"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Phone" formControlName="phone" placeholder="+1..."></boo-input>
                            <boo-input label="Logo URL" formControlName="logoUrl" placeholder="https://..."></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Location</h3>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <boo-input label="City" formControlName="city" placeholder="Ex: New York"></boo-input>
                            <boo-input label="Country" formControlName="country" placeholder="Ex: United States"></boo-input>
                        </div>
                        <boo-input label="Address" formControlName="address" placeholder="Full address"></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Subscription</h3>
                        <boo-select label="Subscription Plan" formControlName="subscriptionPlan" [options]="subscriptionPlanOptions"></boo-select>
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
export class CommonCategoryHospitalGroupDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<HospitalGroup>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    readonly subscriptionPlanOptions = [
        { label: 'Free', value: SubscriptionPlan.Free },
        { label: 'Basic', value: SubscriptionPlan.Basic },
        { label: 'Professional', value: SubscriptionPlan.Professional },
        { label: 'Enterprise', value: SubscriptionPlan.Enterprise },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private hospitalGroupSrv: HospitalGroupService,
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
            description: [''],
            logoUrl: [''],
            contactPerson: [''],
            email: ['', [Validators.email]],
            phone: [''],
            address: [''],
            city: [''],
            country: [''],
            subscriptionPlan: [SubscriptionPlan.Free]
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
                        address: _res.data?.address,
                        city: _res.data?.city,
                        country: _res.data?.country,
                        subscriptionPlan: _res.data?.subscriptionPlan
                    });
                }
            });
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const formData = { ...this.form.getRawValue() };

        try {
            let id: string;
            if (this.currentId) {
                await firstValueFrom(this.hospitalGroupSrv.update(this.currentId, formData));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.hospitalGroupSrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.hospitalGroupSrv.search_by_id(id));
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
            name: '',
            code: '',
            description: '',
            logoUrl: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            country: '',
            subscriptionPlan: SubscriptionPlan.Free
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
