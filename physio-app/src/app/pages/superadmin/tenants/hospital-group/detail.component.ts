import { HttpErrorResponse } from "@angular/common/http";
import { Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, forkJoin, map, of, throwError } from "rxjs";
import { CommonCategoryHospitalGroupDrawerComponent } from "../../../../components/layout/admin/system/common-category/hospital-group/hospital-group-drawer.component";
import { SuperadminTab, SuperadminTabsComponent } from "../../../../components/layout/superadmin/shared/superadmin-tabs.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { BillingService } from "../../../../services/admin/billing.service";
import { HospitalGroupService } from "../../../../services/admin/hospital-group.service";
import { HospitalService } from "../../../../services/admin/hospital.service";
import { hospitalTypeLabel } from "../../../../shared/enums/hospital-type";
import { SharedModule } from "../../../../shared/shared-imports";
import { SubscriptionPlan as BillingPlan, TenantSubscriptionDetail } from "../../../../shared/types/billing.types";
import { Hospital, HospitalGroup } from "../../../../shared/types/support.types";
import { billingStatusLabel, billingStatusTone, formatMoney } from "../../../../shared/utils/billing.utils";

type DetailState = 'loading' | 'ready' | 'notFound' | 'error';
type TabId = 'overview' | 'hospitals' | 'subscription';

interface DetailRow {
    label: string;
    value: string;
    href?: string;
}

const OUTLINE_BUTTON = 'inline-flex items-center gap-1.5 h-9 px-3.5 rounded-1.5 border border-borderGray bg-surface text-[13px] font-medium text-regular hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors cursor-pointer';
const CARD = 'bg-surface rounded-2 border border-borderGray/60';

@Component({
    selector: 'superadmin-tenant-detail',
    standalone: true,
    imports: [
        SharedModule,
        SuperadminTabsComponent,
        StatCardComponent,
        StatusBadgeComponent,
        EmptyStateComponent,
        ErrorStateComponent,
        CommonCategoryHospitalGroupDrawerComponent
    ],
    template: `
        <div class="space-y-5">
            <a
                routerLink="/superadmin/tenants/hospital-group"
                class="inline-flex items-center gap-1.5 -ml-1 px-1 py-1 rounded-1.5 text-xs text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
            >
                <lucide-icon name="arrow-left" class="w-3.5 h-3.5"></lucide-icon>
                Hospital groups
            </a>

            <!-- Loading -->
            <div *ngIf="state() === 'loading'" class="space-y-5" aria-busy="true">
                <div class="h-[92px] rounded-2 border border-borderGray/60 bg-surface animate-pulse motion-reduce:animate-none"></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div
                        *ngFor="let _ of [1, 2, 3, 4]"
                        class="h-[70px] rounded-2 border border-borderGray/60 bg-surface animate-pulse motion-reduce:animate-none"
                    ></div>
                </div>
                <div class="h-[220px] rounded-2 border border-borderGray/60 bg-surface animate-pulse motion-reduce:animate-none"></div>
            </div>

            <!-- Error -->
            <div *ngIf="state() === 'error'" [class]="card" role="alert">
                <boo-error-state
                    icon="info"
                    title="Couldn't load this tenant"
                    description="Check your connection and try again."
                    (retry)="load()"
                />
            </div>

            <!-- Not found -->
            <div *ngIf="state() === 'notFound'" [class]="card" role="status">
                <boo-empty-state
                    icon="ambulance"
                    title="Tenant not found"
                    description="It may have been deleted or the link is out of date."
                >
                    <a routerLink="/superadmin/tenants/hospital-group" class="text-xs15 font-semibold text-primary hover:underline">
                        Back to hospital groups
                    </a>
                </boo-empty-state>
            </div>

            <ng-container *ngIf="state() === 'ready' && group() as g">
                <!-- Header -->
                <section [class]="card + ' p-4 sm:p-5'">
                    <div class="flex items-start justify-between gap-4 flex-wrap">
                        <div class="flex items-center gap-4 min-w-0">
                            <img *ngIf="g.logoUrl" [src]="g.logoUrl" alt="" class="w-14 h-14 rounded-2 object-cover shrink-0" />
                            <div
                                *ngIf="!g.logoUrl"
                                class="w-14 h-14 rounded-2 bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shrink-0"
                                aria-hidden="true"
                            >
                                {{ initial(g.name) }}
                            </div>
                            <div class="min-w-0">
                                <h2 class="text-xl font-bold text-regular leading-tight m-0 truncate">{{ g.name }}</h2>
                                <div class="mt-1.5 flex items-center gap-2 flex-wrap">
                                    <span *ngIf="g.code" class="text-[11px] font-mono bg-gray-100 text-secondary px-1.5 py-0.5 rounded">{{ g.code }}</span>
                                    <boo-status-badge
                                        [label]="g.isActive ? 'Active' : 'Inactive'"
                                        [tone]="g.isActive ? 'success' : 'neutral'"
                                        dotted
                                    />
                                    <boo-status-badge
                                        *ngIf="subscription() as s"
                                        [label]="statusLabel(s.status)"
                                        [tone]="statusTone(s.status)"
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <button type="button" [class]="outlineButton" (click)="openDrawer()">
                                <lucide-icon name="pencil" class="w-3.5 h-3.5"></lucide-icon>
                                Edit
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <boo-stat-card label="Hospitals" [value]="g.hospitalCount" icon="pharmacy" tone="primary" />
                    <boo-stat-card label="Plan" [value]="subscription()?.planName ?? 'No plan'" icon="badge-check" tone="primary" />
                    <boo-stat-card label="Branch usage" [value]="branchUsageText()" icon="layers" [tone]="branchUsage().over ? 'danger' : 'neutral'" />
                    <boo-stat-card label="Outstanding" [value]="outstandingText()" icon="info" [tone]="outstandingTone()" />
                </div>

                <!-- Tabs -->
                <div>
                    <superadmin-tabs
                        label="Tenant sections"
                        [tabs]="tabs"
                        [active]="activeTab()"
                        (activeChange)="onTabChange($event)"
                    />

                    <!-- Overview -->
                    <div
                        *ngIf="activeTab() === 'overview'"
                        id="panel-overview"
                        role="tabpanel"
                        aria-labelledby="tab-overview"
                        class="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4"
                    >
                        <section [class]="card" aria-labelledby="org-title">
                            <h3 id="org-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Organization</h3>
                            <dl class="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-3 text-[13px] m-0 p-4">
                                <ng-container *ngFor="let row of organizationRows()">
                                    <dt class="text-secondary">{{ row.label }}</dt>
                                    <dd class="text-regular m-0 break-words">{{ row.value }}</dd>
                                </ng-container>
                            </dl>
                        </section>

                        <section [class]="card" aria-labelledby="contact-title">
                            <h3 id="contact-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Contact &amp; location</h3>
                            <dl class="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-3 text-[13px] m-0 p-4">
                                <ng-container *ngFor="let row of contactRows()">
                                    <dt class="text-secondary">{{ row.label }}</dt>
                                    <dd class="text-regular m-0 break-words">
                                        <a *ngIf="row.href; else plainValue" [href]="row.href" class="text-primary hover:underline">{{ row.value }}</a>
                                        <ng-template #plainValue>{{ row.value }}</ng-template>
                                    </dd>
                                </ng-container>
                            </dl>
                        </section>
                    </div>

                    <!-- Hospitals -->
                    <div
                        *ngIf="activeTab() === 'hospitals'"
                        id="panel-hospitals"
                        role="tabpanel"
                        aria-labelledby="tab-hospitals"
                        class="pt-4"
                    >
                        <div [class]="card">
                            <boo-error-state
                                *ngIf="hospitalsFailed()"
                                icon="info"
                                title="Couldn't load hospitals"
                                (retry)="load()"
                            />

                            <boo-empty-state
                                *ngIf="!hospitalsFailed() && !hospitals().length"
                                icon="pharmacy"
                                title="No hospitals yet"
                                description="This tenant has not added any hospital or clinic."
                            />

                            <p *ngIf="!hospitalsFailed() && hospitals().length" class="text-xs text-secondary m-0 px-4 pt-3">
                                Read-only. Each tenant manages its own hospitals from its admin area.
                            </p>

                            <div *ngIf="!hospitalsFailed() && hospitals().length" class="overflow-x-auto max-h-[50svh]" custom-scrollbar>
                                <table class="w-full text-[13px] text-left">
                                    <caption class="sr-only">Hospitals of {{ g.name }}</caption>
                                    <thead class="sticky top-0 z-[1] bg-surface">
                                        <tr class="border-b border-borderGray/60 text-secondary">
                                            <th scope="col" class="px-4 py-2.5 font-medium">Hospital</th>
                                            <th scope="col" class="px-4 py-2.5 font-medium">Type</th>
                                            <th scope="col" class="px-4 py-2.5 font-medium">Location</th>
                                            <th scope="col" class="px-4 py-2.5 font-medium text-right">Beds</th>
                                            <th scope="col" class="px-4 py-2.5 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let h of hospitals()" class="border-b border-borderGray/60 last:border-b-0">
                                            <td class="px-4 py-3">
                                                <div class="font-medium text-regular">{{ h.name }}</div>
                                                <div class="text-xs text-secondary tabular-nums">{{ h.hospitalCode || '—' }}</div>
                                            </td>
                                            <td class="px-4 py-3 text-regular">{{ typeLabel(h.hospitalType) }}</td>
                                            <td class="px-4 py-3 text-regular">{{ location(h) }}</td>
                                            <td class="px-4 py-3 text-regular text-right tabular-nums">{{ h.bedCapacity }}</td>
                                            <td class="px-4 py-3">
                                                <boo-status-badge
                                                    [label]="h.isActive ? 'Active' : 'Inactive'"
                                                    [tone]="h.isActive ? 'success' : 'neutral'"
                                                    dotted
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Subscription -->
                    <div
                        *ngIf="activeTab() === 'subscription'"
                        id="panel-subscription"
                        role="tabpanel"
                        aria-labelledby="tab-subscription"
                        class="pt-4 space-y-4"
                    >
                        <div *ngIf="billingFailed()" [class]="card" role="alert">
                            <boo-error-state
                                icon="info"
                                title="Couldn't load billing details"
                                (retry)="load()"
                            />
                        </div>

                        <div *ngIf="!billingFailed() && !hasSubscription()" [class]="card" role="status">
                            <boo-empty-state
                                icon="badge-check"
                                title="No subscription yet"
                                description="This tenant has no plan assigned."
                            >
                                <a routerLink="/superadmin/billing" [queryParams]="{ tenant: tenantId }" class="text-xs15 font-semibold text-primary hover:underline">
                                    Open billing
                                </a>
                            </boo-empty-state>
                        </div>

                        <ng-container *ngIf="!billingFailed() && hasSubscription() && subscription() as s">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <section [class]="card" aria-labelledby="sub-title">
                                    <div class="flex items-center justify-between px-4 py-3 border-b border-borderGray/60">
                                        <h3 id="sub-title" class="text-sm font-semibold text-regular m-0">Subscription</h3>
                                        <a routerLink="/superadmin/billing" [queryParams]="{ tenant: tenantId }" class="text-xs font-semibold text-primary hover:underline">Manage in billing</a>
                                    </div>
                                    <dl class="grid grid-cols-[130px_minmax(0,1fr)] gap-x-4 gap-y-3 text-[13px] m-0 p-4">
                                        <dt class="text-secondary">Plan</dt>
                                        <dd class="text-regular m-0">{{ s.planName ?? '—' }}</dd>
                                        <dt class="text-secondary">Status</dt>
                                        <dd class="m-0"><boo-status-badge [label]="statusLabel(s.status)" [tone]="statusTone(s.status)" dotted /></dd>
                                        <dt class="text-secondary">Price</dt>
                                        <dd class="text-regular m-0 tabular-nums">{{ money(s.monthlyPrice, s.currency) }} / month</dd>
                                        <dt class="text-secondary">Current period</dt>
                                        <dd class="text-regular m-0 tabular-nums">{{ formatDate(s.currentPeriodStart) }} – {{ formatDate(s.currentPeriodEnd) }}</dd>
                                        <dt class="text-secondary">Trial ends</dt>
                                        <dd class="text-regular m-0 tabular-nums">{{ formatDate(s.trialEndsAt) }}</dd>
                                        <dt class="text-secondary">Billing email</dt>
                                        <dd class="text-regular m-0 break-words">{{ s.billingEmail || '—' }}</dd>
                                    </dl>
                                </section>

                                <section [class]="card" aria-labelledby="limits-title" *ngIf="branchUsage() as usage">
                                    <h3 id="limits-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Plan limits</h3>
                                    <div class="p-4">
                                        <div class="flex items-baseline justify-between text-[13px]">
                                            <span class="text-regular">Branches</span>
                                            <span class="text-regular tabular-nums">{{ usage.used }} / {{ usage.max ?? '∞' }}</span>
                                        </div>
                                        <div
                                            *ngIf="usage.percent !== null"
                                            class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden"
                                            role="progressbar"
                                            aria-label="Branches used"
                                            aria-valuemin="0"
                                            [attr.aria-valuenow]="usage.used"
                                            [attr.aria-valuemax]="usage.max"
                                        >
                                            <div
                                                class="h-full rounded-full"
                                                [ngClass]="usage.over ? 'bg-danger' : 'bg-primary'"
                                                [style.width.%]="usage.percent"
                                            ></div>
                                        </div>
                                        <p *ngIf="usage.over" class="text-[12px] text-danger mt-2 mb-0">This tenant is over its plan limit.</p>
                                        <p *ngIf="usage.max === null" class="text-[12px] text-secondary mt-2 mb-0">No branch limit on this plan.</p>
                                    </div>
                                </section>
                            </div>

                            <section [class]="card" aria-labelledby="invoices-title">
                                <h3 id="invoices-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Recent invoices</h3>
                                <p *ngIf="!s.invoices.length" class="text-[13px] text-secondary m-0 p-4">No invoices yet.</p>
                                <div *ngIf="s.invoices.length" class="overflow-x-auto">
                                    <table class="w-full text-[13px] text-left">
                                        <caption class="sr-only">Recent invoices</caption>
                                        <thead>
                                            <tr class="border-b border-borderGray/60 text-secondary">
                                                <th scope="col" class="px-4 py-2.5 font-medium">Invoice</th>
                                                <th scope="col" class="px-4 py-2.5 font-medium">Period</th>
                                                <th scope="col" class="px-4 py-2.5 font-medium text-right">Amount</th>
                                                <th scope="col" class="px-4 py-2.5 font-medium">Due</th>
                                                <th scope="col" class="px-4 py-2.5 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr *ngFor="let inv of s.invoices.slice(0, 10)" class="border-b border-borderGray/60 last:border-b-0">
                                                <td class="px-4 py-3 font-medium text-regular tabular-nums">{{ inv.invoiceNumber }}</td>
                                                <td class="px-4 py-3 text-regular tabular-nums">{{ formatDate(inv.periodStart) }} – {{ formatDate(inv.periodEnd) }}</td>
                                                <td class="px-4 py-3 text-regular text-right tabular-nums">{{ money(inv.amount, inv.currency) }}</td>
                                                <td class="px-4 py-3 text-regular tabular-nums">{{ formatDate(inv.dueDate) }}</td>
                                                <td class="px-4 py-3">
                                                    <boo-status-badge [label]="statusLabel(inv.status)" [tone]="statusTone(inv.status)" dotted />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </ng-container>
                    </div>
                </div>
            </ng-container>
        </div>

        <common-category-hospital-group-drawer
            [isOpen]="isDrawerOpen()"
            [currentId]="drawerId()"
            (close)="closeDrawer()"
            (saveSuccess)="onSaved()"
        />
    `
})
export class SuperadminTenantDetailComponent implements OnInit {
    // #region Inject Services
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroyRef = inject(DestroyRef);
    private readonly hospitalGroupSrv = inject(HospitalGroupService);
    private readonly hospitalSrv = inject(HospitalService);
    private readonly billingSrv = inject(BillingService);
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly card = CARD;
    readonly outlineButton = OUTLINE_BUTTON;
    readonly statusTone = billingStatusTone;
    readonly statusLabel = billingStatusLabel;
    readonly money = formatMoney;
    readonly typeLabel = hospitalTypeLabel;

    readonly tabs: SuperadminTab[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'hospitals', label: 'Hospitals' },
        { id: 'subscription', label: 'Subscription' },
    ];

    tenantId: string | null = null;
    state = signal<DetailState>('loading');
    activeTab = signal<TabId>('overview');
    isDrawerOpen = signal(false);
    drawerId = signal<string | null>(null);

    group = signal<HospitalGroup | null>(null);
    hospitals = signal<Hospital[]>([]);
    subscription = signal<TenantSubscriptionDetail | null>(null);
    plans = signal<BillingPlan[]>([]);
    hospitalsFailed = signal(false);
    billingFailed = signal(false);

    hasSubscription = computed(() => {
        const s = this.subscription();
        return !!s && s.status !== 'None';
    });

    plan = computed(() => {
        const planId = this.subscription()?.planId;
        return planId ? this.plans().find(p => p.id === planId) ?? null : null;
    });

    branchUsage = computed(() => {
        const used = this.group()?.hospitalCount ?? this.hospitals().length;
        const max = this.plan()?.maxBranches ?? null;
        return {
            used,
            max,
            percent: max ? Math.min(100, Math.round((used / max) * 100)) : null,
            over: max !== null && used > max
        };
    });

    branchUsageText = computed(() => {
        const usage = this.branchUsage();
        return `${usage.used} / ${usage.max ?? '∞'}`;
    });

    outstandingText = computed(() => {
        const s = this.subscription();
        return s && this.hasSubscription() ? formatMoney(s.outstandingAmount, s.currency) : '—';
    });

    outstandingTone = computed<'warning' | 'neutral'>(() =>
        (this.subscription()?.outstandingAmount ?? 0) > 0 ? 'warning' : 'neutral'
    );

    organizationRows = computed<DetailRow[]>(() => {
        const g = this.group();
        if (!g) return [];
        return [
            { label: 'Name', value: g.name },
            { label: 'Code', value: g.code || '—' },
            { label: 'Description', value: g.description || '—' },
            { label: 'Created', value: this.formatDate(g.createdAt) },
        ];
    });

    contactRows = computed<DetailRow[]>(() => {
        const g = this.group();
        if (!g) return [];
        return [
            { label: 'Contact person', value: g.contactPerson || '—' },
            { label: 'Email', value: g.email || '—', href: g.email ? `mailto:${g.email}` : undefined },
            { label: 'Phone', value: g.phone || '—', href: g.phone ? `tel:${g.phone}` : undefined },
            { label: 'Address', value: g.address || '—' },
            { label: 'City', value: g.city || '—' },
            { label: 'Country', value: g.country || '—' },
        ];
    });
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
            const id = params.get('id');
            if (!id) return;
            this.tenantId = id;
            this.activeTab.set('overview');
            this.load();
        });
    }
    // #endregion

    // #region Methods
    load() {
        const id = this.tenantId;
        if (!id) return;

        this.state.set('loading');
        this.hospitalsFailed.set(false);
        this.billingFailed.set(false);

        forkJoin({
            group: this.hospitalGroupSrv.search_by_id(id).pipe(
                map(res => res.success ? res.data : null),
                catchError((err: HttpErrorResponse) => err.status === 404 ? of(null) : throwError(() => err))
            ),
            hospitals: this.hospitalSrv.searchByGroup(id).pipe(
                catchError(() => {
                    this.hospitalsFailed.set(true);
                    return of([] as Hospital[]);
                })
            ),
            subscription: this.billingSrv.getSubscription(id).pipe(
                map(res => res.success ? res.data : null),
                catchError(() => {
                    this.billingFailed.set(true);
                    return of(null);
                })
            ),
            plans: this.billingSrv.getPlans(true).pipe(
                map(res => res.success ? res.data ?? [] : []),
                catchError(() => {
                    this.billingFailed.set(true);
                    return of([] as BillingPlan[]);
                })
            )
        }).subscribe({
            next: ({ group, hospitals, subscription, plans }) => {
                if (!group) {
                    this.state.set('notFound');
                    return;
                }
                this.group.set(group);
                this.hospitals.set(hospitals);
                this.subscription.set(subscription);
                this.plans.set(plans);
                this.state.set('ready');
            },
            error: () => this.state.set('error')
        });
    }

    onTabChange(id: string) {
        this.activeTab.set(id as TabId);
    }

    openDrawer() {
        this.drawerId.set(this.tenantId);
        this.isDrawerOpen.set(true);
    }

    closeDrawer() {
        this.isDrawerOpen.set(false);
        this.drawerId.set(null);
    }

    onSaved() {
        this.closeDrawer();
        this.load();
    }

    initial(name: string | null | undefined): string {
        return (name?.trim()[0] ?? '?').toUpperCase();
    }

    location(hospital: Hospital): string {
        return [hospital.city, hospital.country].filter(Boolean).join(', ') || '—';
    }

    formatDate(value: string | Date | null | undefined): string {
        if (!value) return '—';
        const date = new Date(value);
        return isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
    }
    // #endregion
}
