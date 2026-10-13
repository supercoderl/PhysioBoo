import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BillingService } from "../../../../services/admin/billing.service";
import { ToastService } from "../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { SaveSubscriptionPlanRequest, SubscriptionPlan } from "../../../../shared/types/billing.types";
import { DrawerComponent } from "../../../drawer/drawer.component";

const FIELD = 'w-full h-9 px-3 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:bg-black/5 disabled:cursor-not-allowed';

@Component({
    selector: 'superadmin-plan-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent],
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
                        <p class="text-[13px] text-secondary m-0">Plan changes apply immediately to subscribed tenants.</p>
                    </div>
                    <button
                        type="button"
                        class="w-9 h-9 shrink-0 flex items-center justify-center rounded-1.5 text-secondary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                        aria-label="Close"
                        (click)="close.emit()"
                    >
                        <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-4" custom-scrollbar>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label for="plan-code" class="text-[13px] font-medium text-regular">Code <span class="text-danger" aria-hidden="true">*</span></label>
                            <input id="plan-code" type="text" formControlName="code" maxlength="32" [class]="field" autocomplete="off" />
                            <p *ngIf="showError('code')" class="text-[12px] text-danger m-0">Enter a code.</p>
                            <p *ngIf="plan" class="text-[12px] text-secondary m-0">The code can't be changed once created.</p>
                        </div>
                        <div class="space-y-1">
                            <label for="plan-name" class="text-[13px] font-medium text-regular">Name <span class="text-danger" aria-hidden="true">*</span></label>
                            <input id="plan-name" type="text" formControlName="name" maxlength="80" [class]="field" autocomplete="off" />
                            <p *ngIf="showError('name')" class="text-[12px] text-danger m-0">Enter a name.</p>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label for="plan-description" class="text-[13px] font-medium text-regular">Description</label>
                        <textarea
                            id="plan-description"
                            formControlName="description"
                            rows="3"
                            maxlength="500"
                            class="w-full px-3 py-2 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        ></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label for="plan-price" class="text-[13px] font-medium text-regular">Monthly price <span class="text-danger" aria-hidden="true">*</span></label>
                            <input id="plan-price" type="number" min="0" step="0.01" formControlName="monthlyPrice" [class]="field" inputmode="decimal" />
                            <p *ngIf="showError('monthlyPrice')" class="text-[12px] text-danger m-0">Enter a price of 0 or more.</p>
                        </div>
                        <div class="space-y-1">
                            <label for="plan-currency" class="text-[13px] font-medium text-regular">Currency <span class="text-danger" aria-hidden="true">*</span></label>
                            <input id="plan-currency" type="text" formControlName="currency" maxlength="3" [class]="field + ' uppercase'" autocomplete="off" />
                            <p *ngIf="showError('currency')" class="text-[12px] text-danger m-0">Use a 3-letter code, e.g. USD.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label for="plan-users" class="text-[13px] font-medium text-regular">Max users</label>
                            <input id="plan-users" type="number" min="1" formControlName="maxUsers" [class]="field" placeholder="Unlimited" inputmode="numeric" />
                            <p class="text-[12px] text-secondary m-0">Leave empty for unlimited.</p>
                        </div>
                        <div class="space-y-1">
                            <label for="plan-branches" class="text-[13px] font-medium text-regular">Max branches</label>
                            <input id="plan-branches" type="number" min="1" formControlName="maxBranches" [class]="field" placeholder="Unlimited" inputmode="numeric" />
                            <p class="text-[12px] text-secondary m-0">Leave empty for unlimited.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 items-end">
                        <div class="space-y-1">
                            <label for="plan-sort" class="text-[13px] font-medium text-regular">Sort order</label>
                            <input id="plan-sort" type="number" formControlName="sortOrder" [class]="field" inputmode="numeric" />
                        </div>
                        <label class="flex items-center gap-2 h-9 text-[13px] text-regular cursor-pointer">
                            <input type="checkbox" formControlName="isActive" class="w-4 h-4 accent-[rgb(var(--twc-primary))]" />
                            Offered to tenants
                        </label>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-borderGray/60 bg-black/[0.02] flex items-center justify-end gap-3">
                    <button
                        type="button"
                        class="h-9 px-4 rounded-1.5 text-[13px] font-medium text-regular hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                        (click)="close.emit()"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="h-9 px-4 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        [disabled]="saving()"
                        (click)="save()"
                    >
                        {{ saving() ? 'Saving…' : 'Save plan' }}
                    </button>
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

    readonly field = FIELD;
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
