import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { BooButtonAdminComponent } from '../../../components/button/boo-button-admin/boo-button-admin.component';
import { SuperadminPlanDrawerComponent } from '../../../components/layout/superadmin/billing/plan-drawer.component';
import { SuperadminSubscriptionTableCardComponent } from '../../../components/layout/superadmin/billing/subscription-table-card.component';
import { SuperadminTenantSubscriptionDrawerComponent } from '../../../components/layout/superadmin/billing/tenant-subscription-drawer.component';
import { SuperadminPageHeaderComponent } from '../../../components/layout/superadmin/shared/superadmin-page-header.component';
import { SuperadminTab, SuperadminTabsComponent } from '../../../components/layout/superadmin/shared/superadmin-tabs.component';
import { EmptyStateComponent } from '../../../components/ui/empty-state.component';
import { ErrorStateComponent } from '../../../components/ui/error-state.component';
import { StatCardComponent } from '../../../components/ui/stat-card.component';
import { StatusBadgeComponent } from '../../../components/ui/status-badge.component';
import { BillingService } from '../../../services/admin/billing.service';
import { SharedModule } from '../../../shared/shared-imports';
import { BillingSummary, SubscriptionPlan, SubscriptionStatus, TenantSubscription } from '../../../shared/types/billing.types';
import { PaginationData } from '../../../shared/types/common';
import { FilterConfig } from '../../../shared/types/filter.types';
import { billingStatusLabel, formatMoney } from '../../../shared/utils/billing.utils';

type BillingTab = 'subscriptions' | 'plans';

const STATUS_OPTIONS: SubscriptionStatus[] = ['Trial', 'Active', 'PastDue', 'Cancelled', 'None'];

/**
 * Super-admin SaaS billing: manage the plan catalog, each tenant's subscription, and
 * subscription invoices. Payments are recorded manually — no card data is collected here.
 */
@Component({
  selector: 'superadmin-billing',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonAdminComponent,
    SuperadminPageHeaderComponent,
    SuperadminTabsComponent,
    SuperadminSubscriptionTableCardComponent,
    SuperadminTenantSubscriptionDrawerComponent,
    SuperadminPlanDrawerComponent,
    StatCardComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    ErrorStateComponent
  ],
  templateUrl: './billing.component.html',
  host: { class: 'block h-full min-h-0' }
})
export class BillingComponent implements OnInit {
  // #region Inject Services
  private readonly billingSrv = inject(BillingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  // #endregion

  // #region State
  readonly money = formatMoney;
  activeTab = signal<BillingTab>('subscriptions');

  summary = signal<BillingSummary | null>(null);
  summaryFailed = signal(false);

  /** `null` = still loading. */
  plans = signal<SubscriptionPlan[] | null>(null);
  plansFailed = signal(false);

  tableData = signal<PaginationData<TenantSubscription> | null>(null);
  loading = signal(false);
  loadFailed = signal(false);

  params = { pageNumber: 1, pageSize: 20, search: '', status: '' };

  readonly filter_configs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: null,
      options: STATUS_OPTIONS.map(status => ({ label: billingStatusLabel(status), value: status }))
    }
  ];

  isTenantDrawerOpen = signal(false);
  selectedTenantId = signal<string | null>(null);
  isPlanDrawerOpen = signal(false);
  editingPlan = signal<SubscriptionPlan | null>(null);

  tabs = computed<SuperadminTab[]>(() => [
    { id: 'subscriptions', label: 'Subscriptions', count: this.summary()?.tenants ?? null },
    { id: 'plans', label: 'Plans', count: this.plans()?.length ?? null },
  ]);

  monthlyRecurringLabel = computed(() => this.summary()?.partial ? 'Monthly recurring (first 100)' : 'Monthly recurring');
  monthlyRecurringText = computed(() => this.moneyOrDash(this.summary()?.monthlyRecurring));
  outstandingText = computed(() => this.moneyOrDash(this.summary()?.outstanding));
  pastDueTone = computed<'warning' | 'neutral'>(() => (this.summary()?.pastDue ?? 0) > 0 ? 'warning' : 'neutral');
  outstandingTone = computed<'warning' | 'neutral'>(() => (this.summary()?.outstanding ?? 0) > 0 ? 'warning' : 'neutral');
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit(): void {
    this.loadAll();

    // Deep link from a tenant page: /superadmin/billing?tenant=<hospitalGroupId>
    this.route.queryParamMap.pipe(take(1)).subscribe(params => {
      const tenant = params.get('tenant');
      if (tenant) this.openTenant(tenant);
    });
  }
  // #endregion

  // #region Loading
  loadAll(): void {
    this.loadSummary();
    this.loadPlans();
    this.loadTenants();
  }

  loadSummary(): void {
    this.billingSrv.getSummary().subscribe({
      next: summary => {
        this.summaryFailed.set(false);
        this.summary.set(summary);
      },
      error: () => this.summaryFailed.set(true)
    });
  }

  loadPlans(): void {
    this.plansFailed.set(false);
    this.billingSrv.getPlans(true).subscribe({
      next: res => {
        if (res.success) this.plans.set(res.data ?? []);
        else this.plansFailed.set(true);
      },
      error: () => this.plansFailed.set(true)
    });
  }

  loadTenants(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.billingSrv.searchSubscriptions({
      search: this.params.search.trim(),
      status: this.params.status,
      pageNumber: this.params.pageNumber,
      pageSize: this.params.pageSize
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: res => {
        if (res.success) this.tableData.set(res.data);
        else this.loadFailed.set(true);
      },
      error: () => this.loadFailed.set(true)
    });
  }

  reload(): void {
    this.loadAll();
  }
  // #endregion

  // #region Subscriptions list
  onSearch(value: string): void {
    this.params = { ...this.params, pageNumber: 1, search: value };
    this.loadTenants();
  }

  onFilterApply(event: { key: string; value: any }): void {
    if (event.key !== 'status') return;
    this.params = { ...this.params, pageNumber: 1, status: event.value ?? '' };
    this.loadTenants();
  }

  onPageClick(page: number): void {
    this.params.pageNumber = page;
    this.loadTenants();
  }

  viewTenant(id: string): void {
    this.router.navigate(['/superadmin/tenants/hospital-group', id]);
  }
  // #endregion

  // #region Drawers
  onTabChange(id: string): void {
    this.activeTab.set(id as BillingTab);
  }

  openTenant(id: string): void {
    this.selectedTenantId.set(id);
    this.isTenantDrawerOpen.set(true);
  }

  closeTenant(): void {
    this.isTenantDrawerOpen.set(false);
    this.selectedTenantId.set(null);

    if (this.route.snapshot.queryParamMap.has('tenant')) {
      this.router.navigate([], { relativeTo: this.route, queryParams: { tenant: null }, queryParamsHandling: 'merge', replaceUrl: true });
    }
  }

  openPlan(plan: SubscriptionPlan | null): void {
    this.editingPlan.set(plan);
    this.isPlanDrawerOpen.set(true);
  }

  closePlan(): void {
    this.isPlanDrawerOpen.set(false);
    this.editingPlan.set(null);
  }

  /** A subscription changed: refresh the list, the stats and the plans' subscriber counts. */
  onSubscriptionChanged(): void {
    this.loadAll();
  }

  onPlanSaved(): void {
    this.closePlan();
    this.loadAll();
  }
  // #endregion

  private moneyOrDash(amount: number | null | undefined): string {
    return amount === null || amount === undefined ? '—' : formatMoney(amount, 'USD');
  }
}
