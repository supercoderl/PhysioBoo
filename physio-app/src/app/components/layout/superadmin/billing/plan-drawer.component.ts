import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BillingService } from "../../../../services/admin/billing.service";
import { ToastService } from "../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { SaveSubscriptionPlanRequest, SubscriptionPlan } from "../../../../shared/types/billing.types";
import { DrawerComponent } from "../../../drawer/drawer.component";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { BooButtonComponent, BooCheckboxComponent, BooFormFieldComponent, BooInputComponent } from '@physioboo/ui';
import { BooTextareaComponent } from "../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'superadmin-plan-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooButtonAdminComponent, BooInputComponent, BooTextareaComponent, BooCheckboxComponent, BooButtonComponent, BooFormFieldComponent],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" (close)="close.emit()">
            <div
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="plan-drawer-title"
                [formGroup]="form"
            >
                <div class="flex-none px-6 py-4 border-b border-borderGray/60 flex items-center justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="plan-drawer-title" class="text-lg font-bold text-regular leading-tight m-0">
                            {{ plan ? 'Edit plan' : 'New plan' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Plan changes apply immediately to subscribed tenants.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="close.emit()">
                        <physio-icon name="x" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-4" custom-scrollbar>
                    <div class="grid grid-cols-2 gap-4">
                        <boo-form-field label="Code" for="plan-code" required [error]="showError('code') ? 'Enter a code.' : null" [helper]="plan ? 'The code cannot be changed once created.' : ''">
                            <boo-input [id]="'plan-code'" label="Code" formControlName="code" [maxlength]="32" size="small" />
                        </boo-form-field>
                        <boo-form-field label="Name" for="plan-name" required [error]="showError('name') ? 'Enter a name.' : null">
                            <boo-input [id]="'plan-name'" label="Name" formControlName="name" [maxlength]="80" size="small" />
                        </boo-form-field>
                    </div>

                    <div class="space-y-1">
                        <label for="plan-description" class="text-sm font-medium text-regular">Description</label>
                        <boo-textarea [id]="'plan-description'" formControlName="description" [rows]="3" [maxlength]="500" size="small"></boo-textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <boo-form-field label="Monthly price" for="plan-price" required [error]="showError('monthlyPrice') ? 'Enter a price of 0 or more.' : null">
                            <boo-input [id]="'plan-price'" label="Monthly price" type="number" numberValue min="0" step="0.01" inputmode="decimal" formControlName="monthlyPrice" size="small" />
                        </boo-form-field>
                        <boo-form-field label="Currency" for="plan-currency" required [error]="showError('currency') ? 'Use a 3-letter code, e.g. USD.' : null">
                            <boo-input [id]="'plan-currency'" class="uppercase" label="Currency" formControlName="currency" [maxlength]="3" size="small" />
                        </boo-form-field>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <boo-form-field label="Max users" for="plan-users" helper="Leave empty for unlimited.">
                            <boo-input [id]="'plan-users'" label="Unlimited" type="number" numberValue min="1" inputmode="numeric" formControlName="maxUsers" size="small" />
                        </boo-form-field>
                        <boo-form-field label="Max branches" for="plan-branches" helper="Leave empty for unlimited.">
                            <boo-input [id]="'plan-branches'" label="Unlimited" type="number" numberValue min="1" inputmode="numeric" formControlName="maxBranches" size="small" />
                        </boo-form-field>
                    </div>

                    <div class="grid grid-cols-2 gap-4 items-end">
                        <div class="space-y-1">
                            <label for="plan-sort" class="text-sm font-medium text-regular">Sort order</label>
                            <boo-input [id]="'plan-sort'" type="number" numberValue formControlName="sortOrder" size="small"></boo-input>
                        </div>
                        <boo-checkbox formControlName="isActive" class="h-9 flex items-center">
                            <span class="text-sm text-regular">Offered to tenants</span>
                        </boo-checkbox>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-borderGray/60 bg-black/[0.02] flex items-center justify-end gap-3">
                    <boo-button-admin (click)="close.emit()" background="transparent" textColor="rgb(var(--twc-regular))" padding="8px 16px" fontWeight="500">
                        Cancel
                    </boo-button-admin>
                    <boo-button-admin [disabled]="saving()" (click)="save()" textColor="white" padding="8px 16px" fontWeight="600">
                        {{ saving() ? 'Saving…' : 'Save plan' }}
                    </boo-button-admin>
                </div>
            </div>
        </drawer>
    `
})
export class SuperadminPlanDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    /** `null` creates a new plan; otherwise edits the given one. */
    @Input() plan: SubscriptionPlan | null = null;
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    saving = signal(false);
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private billingSrv: BillingService,
        private toastSrv: ToastService
    ) {
        this.form = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(32)]],
            name: ['', [Validators.required, Validators.maxLength(80)]],
            description: [''],
            monthlyPrice: [0, [Validators.required, Validators.min(0)]],
            currency: ['USD', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
            maxUsers: [null as number | null, [Validators.min(1)]],
            maxBranches: [null as number | null, [Validators.min(1)]],
            sortOrder: [0],
            isActive: [true],
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isOpen && (changes['isOpen'] || changes['plan'])) this.resetForm();
    }
    // #endregion

    // #region Methods
    private resetForm() {
        const plan = this.plan;
        this.form.reset({
            code: plan?.code ?? '',
            name: plan?.name ?? '',
            description: plan?.description ?? '',
            monthlyPrice: plan?.monthlyPrice ?? 0,
            currency: plan?.currency ?? 'USD',
            maxUsers: plan?.maxUsers ?? null,
            maxBranches: plan?.maxBranches ?? null,
            sortOrder: plan?.sortOrder ?? 0,
            isActive: plan?.isActive ?? true,
        });
        plan ? this.form.get('code')?.disable() : this.form.get('code')?.enable();
        this.form.markAsPristine();
    }

    showError(control: string): boolean {
        const c = this.form.get(control);
        return !!c && c.invalid && (c.touched || c.dirty);
    }

    async save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toastSrv.error('Please complete the required fields');
            return;
        }

        const v = this.form.getRawValue();
        const body: SaveSubscriptionPlanRequest = {
            code: String(v.code).trim(),
            name: String(v.name).trim(),
            description: v.description?.trim() || null,
            monthlyPrice: Number(v.monthlyPrice) || 0,
            currency: String(v.currency).trim().toUpperCase(),
            maxUsers: v.maxUsers ? Number(v.maxUsers) : null,
            maxBranches: v.maxBranches ? Number(v.maxBranches) : null,
            isActive: !!v.isActive,
            sortOrder: Number(v.sortOrder) || 0,
        };

        this.saving.set(true);
        try {
            const res = await firstValueFrom(
                this.plan ? this.billingSrv.updatePlan(this.plan.id, body) : this.billingSrv.createPlan(body)
            );
            if (!res.success) {
                this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                return;
            }
            this.toastSrv.success(`Plan "${body.name}" saved`);
            this.form.markAsPristine();
            this.saved.emit();
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        } finally {
            this.saving.set(false);
        }
    }
    // #endregion
}
