import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { finalize } from "rxjs";
import { BillingService } from "../../../../services/admin/billing.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
    SubscriptionAction,
    SubscriptionInvoice,
    SubscriptionPlan,
    TenantSubscriptionDetail
} from "../../../../shared/types/billing.types";
import { billingStatusLabel, billingStatusTone, formatMoney } from "../../../../shared/utils/billing.utils";
import { DrawerComponent } from "../../../drawer/drawer.component";
import { BooSelectComponent } from "../../../select/boo-select/boo-select.component";
import { ErrorStateComponent } from "../../../ui/error-state.component";
import { StatusBadgeComponent } from "../../../ui/status-badge.component";

const FIELD = 'w-full h-9 px-3 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
const BTN_PRIMARY = `h-9 px-3.5 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 ${FOCUS}`;
const BTN_OUTLINE = `h-9 px-3.5 rounded-1.5 border border-borderGray bg-surface text-[13px] font-medium text-regular hover:bg-black/5 ${FOCUS}`;
const BTN_SUCCESS = `h-9 px-3.5 rounded-1.5 border border-emerald-300 bg-surface text-[13px] font-medium text-emerald-700 hover:bg-emerald-50 ${FOCUS}`;
const BTN_WARNING = `h-9 px-3.5 rounded-1.5 border border-amber-300 bg-surface text-[13px] font-medium text-amber-700 hover:bg-amber-50 ${FOCUS}`;
const BTN_DANGER = `h-9 px-3.5 rounded-1.5 border border-danger/30 bg-surface text-[13px] font-medium text-danger hover:bg-danger/5 ${FOCUS}`;

@Component({
    selector: 'superadmin-tenant-subscription-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooSelectComponent, StatusBadgeComponent, ErrorStateComponent],
    template: `
        <drawer [isOpen]="isOpen" (close)="close.emit()">
            <div
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="subscription-drawer-title"
            >
                <div class="flex-none px-6 py-4 border-b border-borderGray/60 flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="subscription-drawer-title" class="text-lg font-bold text-regular leading-tight m-0 truncate">
                            {{ detail()?.tenantName ?? 'Subscription' }}
                        </h2>
                        <p class="text-[13px] text-secondary m-0 truncate">{{ detail()?.tenantEmail || 'Tenant subscription' }}</p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                        <a
                            *ngIf="hospitalGroupId"
                            [routerLink]="['/superadmin/tenants/hospital-group', hospitalGroupId]"
                            class="h-9 px-3 inline-flex items-center rounded-1.5 text-[13px] font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            (click)="close.emit()"
                        >
                            View tenant
                        </a>
                        <button
                            type="button"
                            class="w-9 h-9 flex items-center justify-center rounded-1.5 text-secondary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                            aria-label="Close"
                            (click)="close.emit()"
                        >
                            <lucide-icon name="x" class="w-4 h-4"></lucide-icon>
                        </button>
                    </div>
                </div>

                <div class="flex-1 overflow-y-auto" custom-scrollbar>
                    <div *ngIf="loading()" class="p-6 space-y-4" aria-busy="true">
                        <div class="h-16 rounded-2 bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                        <div class="h-24 rounded-2 bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                        <div class="h-32 rounded-2 bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                    </div>

                    <div *ngIf="!loading() && loadFailed()" role="alert">
                        <boo-error-state
                            icon="info"
                            title="Couldn't load this subscription"
                            description="Check your connection and try again."
                            (retry)="load()"
                        />
                    </div>

                    <div *ngIf="!loading() && !loadFailed() && detail() as t" class="p-6 space-y-6">
                        <!-- Overview -->
                        <section aria-labelledby="sub-overview-title">
                            <h3 id="sub-overview-title" class="sr-only">Overview</h3>
                            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] m-0">
                                <div>
                                    <dt class="text-secondary">Status</dt>
                                    <dd class="m-0 mt-1"><boo-status-badge [label]="statusLabel(t.status)" [tone]="statusTone(t.status)" dotted /></dd>
                                </div>
                                <div>
                                    <dt class="text-secondary">Outstanding</dt>
                                    <dd class="m-0 mt-1 font-medium tabular-nums" [class.text-amber-700]="t.outstandingAmount > 0">
                                        {{ t.outstandingAmount > 0 ? money(t.outstandingAmount, t.currency) : '—' }}
                                    </dd>
                                </div>
                                <div>
                                    <dt class="text-secondary">Subscribed since</dt>
                                    <dd class="m-0 mt-1 font-medium tabular-nums">{{ (t.startedAt | date: 'mediumDate') || '—' }}</dd>
                                </div>
                                <div>
                                    <dt class="text-secondary">Current period</dt>
                                    <dd class="m-0 mt-1 font-medium tabular-nums">
                                        {{ (t.currentPeriodStart | date: 'shortDate') || '—' }} – {{ (t.currentPeriodEnd | date: 'shortDate') || '—' }}
                                    </dd>
                                </div>
                                <div *ngIf="t.trialEndsAt">
                                    <dt class="text-secondary">Trial ends</dt>
                                    <dd class="m-0 mt-1 font-medium tabular-nums">{{ t.trialEndsAt | date: 'mediumDate' }}</dd>
                                </div>
                            </dl>
                        </section>

                        <!-- Plan -->
                        <section aria-labelledby="sub-plan-title" class="space-y-3">
                            <h3 id="sub-plan-title" class="text-xs font-bold text-secondary uppercase tracking-wider m-0">Plan</h3>
                            <div class="space-y-1">
                                <span class="block text-[13px] font-medium text-regular">Plan</span>
                                <boo-select
                                    label="Choose a plan"
                                    required
                                    [height]="36"
                                    [options]="planOptions"
                                    [(ngModel)]="selectedPlanId"
                                ></boo-select>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    [class]="btnPrimary"
                                    [disabled]="busy() || !selectedPlanId || selectedPlanId === t.planId"
                                    (click)="change('ChangePlan')"
                                >
                                    {{ t.status === 'None' ? 'Subscribe' : 'Change plan' }}
                                </button>
                                <button
                                    *ngIf="t.status === 'Trial' || t.status === 'PastDue' || t.status === 'Cancelled'"
                                    type="button"
                                    [class]="btnSuccess"
                                    [disabled]="busy()"
                                    (click)="change('Activate')"
                                >
                                    Activate
                                </button>
                                <button
                                    *ngIf="t.status === 'Active'"
                                    type="button"
                                    [class]="btnWarning"
                                    [disabled]="busy()"
                                    (click)="change('MarkPastDue')"
                                >
                                    Mark past due
                                </button>
                                <button
                                    *ngIf="t.status !== 'Cancelled' && t.status !== 'None'"
                                    type="button"
                                    [class]="btnDanger"
                                    [disabled]="busy()"
                                    (click)="change('Cancel')"
                                >
                                    Cancel subscription
                                </button>
                            </div>
                        </section>

                        <!-- Billing details -->
                        <section *ngIf="t.status !== 'None'" aria-labelledby="sub-details-title" class="space-y-3">
                            <h3 id="sub-details-title" class="text-xs font-bold text-secondary uppercase tracking-wider m-0">Billing details</h3>
                            <div class="space-y-1">
                                <label for="sub-email" class="text-[13px] font-medium text-regular">Billing email</label>
                                <input id="sub-email" type="email" [(ngModel)]="billingEmail" [class]="field" autocomplete="off" />
                            </div>
                            <div class="space-y-1">
                                <label for="sub-notes" class="text-[13px] font-medium text-regular">Notes</label>
                                <textarea
                                    id="sub-notes"
                                    rows="3"
                                    maxlength="1000"
                                    [(ngModel)]="notes"
                                    class="w-full px-3 py-2 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                ></textarea>
                            </div>
                            <button type="button" [class]="btnOutline" [disabled]="busy()" (click)="change('UpdateDetails')">Save details</button>
                        </section>

                        <!-- Invoices -->
                        <section aria-labelledby="sub-invoices-title" class="space-y-3">
                            <div class="flex items-center justify-between gap-2">
                                <h3 id="sub-invoices-title" class="text-xs font-bold text-secondary uppercase tracking-wider m-0">Invoices</h3>
                                <button
                                    *ngIf="t.status === 'Active' || t.status === 'PastDue'"
                                    type="button"
                                    class="text-[13px] font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-1.5 disabled:opacity-50 cursor-pointer"
                                    [disabled]="busy()"
                                    (click)="issueInvoice()"
                                >
                                    Bill current period
                                </button>
                            </div>

                            <p *ngIf="!t.invoices.length" class="text-[13px] text-secondary m-0">No invoices yet.</p>

                            <article
                                *ngFor="let inv of t.invoices"
                                class="rounded-2 border border-borderGray/60 p-3 text-[13px]"
                            >
                                <div class="flex items-center justify-between gap-2">
                                    <span class="font-mono font-semibold text-regular">{{ inv.invoiceNumber }}</span>
                                    <boo-status-badge [label]="statusLabel(inv.status)" [tone]="statusTone(inv.status)" dotted />
                                </div>
                                <p class="text-secondary m-0 mt-1 tabular-nums">
                                    {{ inv.planName }} · {{ inv.periodStart | date: 'shortDate' }} – {{ inv.periodEnd | date: 'shortDate' }}
                                </p>
                                <div class="flex items-center justify-between gap-2 mt-1">
                                    <span class="font-semibold text-regular tabular-nums">{{ money(inv.amount, inv.currency) }}</span>
                                    <span *ngIf="inv.status === 'Open'" class="text-secondary tabular-nums">Due {{ inv.dueDate | date: 'mediumDate' }}</span>
                                    <span *ngIf="inv.status === 'Paid'" class="text-secondary tabular-nums">
                                        Paid {{ inv.paidAt | date: 'mediumDate' }}{{ inv.paymentReference ? ' · ' + inv.paymentReference : '' }}
                                    </span>
                                </div>

                                <div *ngIf="inv.status === 'Open'" class="flex items-center gap-2 mt-3">
                                    <input
                                        type="text"
                                        maxlength="120"
                                        placeholder="Payment reference (optional)"
                                        [attr.aria-label]="'Payment reference for ' + inv.invoiceNumber"
                                        [(ngModel)]="paymentReference[inv.id]"
                                        [class]="field"
                                    />
                                    <button type="button" [class]="btnSuccess + ' shrink-0'" [disabled]="busy()" (click)="payInvoice(inv)">Mark paid</button>
                                    <button type="button" [class]="btnDanger + ' shrink-0'" [disabled]="busy()" (click)="voidInvoice(inv)">Void</button>
                                </div>
                            </article>
                        </section>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class SuperadminTenantSubscriptionDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() hospitalGroupId: string | null = null;
    @Input() plans: SubscriptionPlan[] = [];
    @Output() close = new EventEmitter<void>();
    /** Emitted after any change so the page can refresh its list, stats and plan subscriber counts. */
    @Output() changed = new EventEmitter<void>();

    readonly field = FIELD;
    readonly btnPrimary = BTN_PRIMARY;
    readonly btnOutline = BTN_OUTLINE;
    readonly btnSuccess = BTN_SUCCESS;
    readonly btnWarning = BTN_WARNING;
    readonly btnDanger = BTN_DANGER;
    readonly money = formatMoney;
    readonly statusTone = billingStatusTone;
    readonly statusLabel = billingStatusLabel;

    detail = signal<TenantSubscriptionDetail | null>(null);
    loading = signal(false);
    loadFailed = signal(false);
    busy = signal(false);

    planOptions: { label: string; value: string }[] = [];
    selectedPlanId = '';
    billingEmail = '';
    notes = '';
    paymentReference: Record<string, string> = {};
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private billingSrv: BillingService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['plans']) {
            this.planOptions = this.activePlans.map(p => ({
                label: `${p.name} — ${formatMoney(p.monthlyPrice, p.currency)}/mo`,
                value: p.id
            }));
        }
        if (this.isOpen && this.hospitalGroupId && (changes['isOpen'] || changes['hospitalGroupId'])) {
            this.detail.set(null);
            this.load();
        }
    }
    // #endregion

    // #region Methods
    get activePlans(): SubscriptionPlan[] {
        return this.plans.filter(p => p.isActive);
    }

    load() {
        const id = this.hospitalGroupId;
        if (!id) return;

        this.loading.set(true);
        this.loadFailed.set(false);
        this.billingSrv.getSubscription(id).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (res.success) this.apply(res.data);
                else this.loadFailed.set(true);
            },
            error: () => this.loadFailed.set(true)
        });
    }

    private apply(detail: TenantSubscriptionDetail | null) {
        if (!detail) return;
        this.detail.set(detail);
        this.selectedPlanId = detail.planId ?? this.activePlans[0]?.id ?? '';
        this.billingEmail = detail.billingEmail ?? '';
        this.notes = detail.notes ?? '';
        this.paymentReference = {};
    }

    change(action: SubscriptionAction) {
        const tenant = this.detail();
        if (!tenant) return;

        const run = () => {
            this.busy.set(true);
            this.billingSrv.changeSubscription(tenant.hospitalGroupId, {
                action,
                planId: action === 'ChangePlan' ? this.selectedPlanId : null,
                billingEmail: this.billingEmail,
                notes: this.notes,
            }).pipe(
                finalize(() => this.busy.set(false))
            ).subscribe(res => {
                if (!res.success) return;
                this.apply(res.data);
                this.toastSrv.success(this.actionMessage(action, tenant.tenantName));
                this.changed.emit();
            });
        };

        if (action === 'Cancel' || action === 'MarkPastDue') {
            this.dialogSrv.confirm(
                action === 'Cancel' ? `Cancel ${tenant.tenantName}'s subscription?` : `Mark ${tenant.tenantName} as past due?`,
                run,
                action === 'Cancel' ? 'Cancel Subscription' : 'Mark Past Due',
                'warning',
                'Confirm',
                'Back',
            );
            return;
        }
        run();
    }

    issueInvoice() {
        const tenant = this.detail();
        if (!tenant) return;

        this.busy.set(true);
        this.billingSrv.issueInvoice(tenant.hospitalGroupId).pipe(
            finalize(() => this.busy.set(false))
        ).subscribe(res => {
            if (!res.success) return;
            this.apply(res.data);
            this.toastSrv.success('Invoice issued for the current period');
            this.changed.emit();
        });
    }

    payInvoice(invoice: SubscriptionInvoice) {
        this.busy.set(true);
        this.billingSrv.payInvoice(invoice.id, this.paymentReference[invoice.id]?.trim() || null).pipe(
            finalize(() => this.busy.set(false))
        ).subscribe(res => {
            if (!res.success) return;
            this.toastSrv.success(`${invoice.invoiceNumber} marked as paid`);
            this.refresh();
        });
    }

    voidInvoice(invoice: SubscriptionInvoice) {
        this.dialogSrv.confirm(`Void invoice ${invoice.invoiceNumber}?`, () => {
            this.busy.set(true);
            this.billingSrv.voidInvoice(invoice.id).pipe(
                finalize(() => this.busy.set(false))
            ).subscribe(res => {
                if (!res.success) return;
                this.toastSrv.info(`${invoice.invoiceNumber} voided`);
                this.refresh();
            });
        }, 'Void Invoice', 'warning', 'Void', 'Back');
    }

    private refresh() {
        const id = this.hospitalGroupId;
        if (!id) return;
        this.billingSrv.getSubscription(id).subscribe(res => {
            if (res.success) this.apply(res.data);
            this.changed.emit();
        });
    }

    private actionMessage(action: SubscriptionAction, tenant: string): string {
        switch (action) {
            case 'ChangePlan': return `${tenant} moved to the selected plan`;
            case 'Activate': return `${tenant}'s subscription is active`;
            case 'MarkPastDue': return `${tenant} marked as past due`;
            case 'Cancel': return `${tenant}'s subscription cancelled`;
            default: return 'Billing details saved';
        }
    }
    // #endregion
}
