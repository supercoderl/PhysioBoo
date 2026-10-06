import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BadgeTone, StatusBadgeComponent } from "../../../components/ui/status-badge.component";
import { BillingService } from "../../../services/admin/billing.service";
import { DialogService } from "../../../services/common/dialog.service";
import { ToastService } from "../../../services/common/toast.service";
import { SharedModule } from '../../../shared/shared-imports';
import {
  SaveSubscriptionPlanRequest,
  SubscriptionAction,
  SubscriptionInvoice,
  SubscriptionPlan,
  TenantSubscription,
  TenantSubscriptionDetail,
} from "../../../shared/types/billing.types";

/**
 * Super-admin SaaS billing: manage the plan catalog, each tenant's subscription, and
 * subscription invoices. Payments are recorded manually — no card data is collected here.
 */
@Component({
  selector: 'setting-billing',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    BooIconComponent,
    StatusBadgeComponent,
    SharedModule
  ],
  templateUrl: './billing.component.html'
})
export class BillingComponent implements OnInit {
  // #region Inject Services
  private readonly billingSrv = inject(BillingService);
  private readonly toastSrv = inject(ToastService);
  private readonly dialogSrv = inject(DialogService);
  // #endregion

  // #region State
  plans = signal<SubscriptionPlan[]>([]);
  tenants = signal<TenantSubscription[]>([]);
  totalTenants = signal(0);
  loading = signal(false);
  search = '';
  statusFilter = '';
  pageNumber = 1;
  readonly pageSize = 20;

  selected = signal<TenantSubscriptionDetail | null>(null);
  selectedPlanId = '';
  billingEmail = '';
  notes = '';
  paymentReference: Record<string, string> = {};

  /** Plan being edited (or created when id is null). */
  editingPlan = signal<(SaveSubscriptionPlanRequest & { id: string | null }) | null>(null);

  readonly statusOptions = ['Trial', 'Active', 'PastDue', 'Cancelled', 'None'];

  activePlans = computed(() => this.plans().filter(p => p.isActive));
  monthlyRecurring = computed(() => this.tenants()
    .filter(t => t.status === 'Active' || t.status === 'PastDue')
    .reduce((sum, t) => sum + t.monthlyPrice, 0));
  pastDueCount = computed(() => this.tenants().filter(t => t.status === 'PastDue').length);
  outstanding = computed(() => this.tenants().reduce((sum, t) => sum + t.outstandingAmount, 0));
  // #endregion

  ngOnInit(): void {
    this.loadPlans();
    this.loadTenants();
  }

  // #region Loading
  loadPlans(): void {
    this.billingSrv.getPlans(true).subscribe(res => {
      if (res.success) this.plans.set(res.data);
    });
  }

  loadTenants(): void {
    this.loading.set(true);
    this.billingSrv.searchSubscriptions({ search: this.search.trim(), status: this.statusFilter, pageNumber: this.pageNumber, pageSize: this.pageSize })
      .subscribe({
        next: res => {
          if (res.success) {
            this.tenants.set(res.data.items);
            this.totalTenants.set(res.data.totalCount);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadTenants();
  }

  changePage(delta: number): void {
    const next = this.pageNumber + delta;
    if (next < 1 || (next - 1) * this.pageSize >= this.totalTenants()) return;
    this.pageNumber = next;
    this.loadTenants();
  }
  // #endregion

  // #region Tenant subscription
  openTenant(row: TenantSubscription): void {
    this.billingSrv.getSubscription(row.hospitalGroupId).subscribe(res => {
      if (res.success) this.applyDetail(res.data);
    });
  }

  closeTenant(): void {
    this.selected.set(null);
  }

  private applyDetail(detail: TenantSubscriptionDetail | null): void {
    if (!detail) return;
    this.selected.set(detail);
    this.selectedPlanId = detail.planId ?? this.activePlans()[0]?.id ?? '';
    this.billingEmail = detail.billingEmail ?? '';
    this.notes = detail.notes ?? '';
    this.paymentReference = {};
    this.loadTenants();
    this.loadPlans();
  }

  change(action: SubscriptionAction): void {
    const tenant = this.selected();
    if (!tenant) return;

    const run = () => this.billingSrv.changeSubscription(tenant.hospitalGroupId, {
      action,
      planId: action === 'ChangePlan' ? this.selectedPlanId : null,
      billingEmail: this.billingEmail,
      notes: this.notes,
    }).subscribe(res => {
      if (!res.success) return;
      this.applyDetail(res.data);
      this.toastSrv.success(this.actionMessage(action, tenant.tenantName));
    });

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

  issueInvoice(): void {
    const tenant = this.selected();
    if (!tenant) return;
    this.billingSrv.issueInvoice(tenant.hospitalGroupId).subscribe(res => {
      if (!res.success) return;
      this.applyDetail(res.data);
      this.toastSrv.success('Invoice issued for the current period');
    });
  }

  payInvoice(invoice: SubscriptionInvoice): void {
    this.billingSrv.payInvoice(invoice.id, this.paymentReference[invoice.id]?.trim() || null).subscribe(res => {
      if (!res.success) return;
      this.toastSrv.success(`${invoice.invoiceNumber} marked as paid`);
      this.refreshSelected();
    });
  }

  voidInvoice(invoice: SubscriptionInvoice): void {
    this.dialogSrv.confirm(`Void invoice ${invoice.invoiceNumber}?`, () => {
      this.billingSrv.voidInvoice(invoice.id).subscribe(res => {
        if (!res.success) return;
        this.toastSrv.info(`${invoice.invoiceNumber} voided`);
        this.refreshSelected();
      });
    }, 'Void Invoice', 'warning', 'Void', 'Back');
  }

  private refreshSelected(): void {
    const tenant = this.selected();
    if (tenant) this.billingSrv.getSubscription(tenant.hospitalGroupId).subscribe(res => res.success && this.applyDetail(res.data));
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

  // #region Plans
  newPlan(): void {
    this.editingPlan.set({ id: null, code: '', name: '', description: null, monthlyPrice: 0, currency: 'USD', maxUsers: null, maxBranches: null, isActive: true, sortOrder: this.plans().length + 1 });
  }

  editPlan(plan: SubscriptionPlan): void {
    const { id, code, name, description, monthlyPrice, currency, maxUsers, maxBranches, isActive, sortOrder } = plan;
    this.editingPlan.set({ id, code, name, description, monthlyPrice, currency, maxUsers, maxBranches, isActive, sortOrder });
  }

  savePlan(): void {
    const plan = this.editingPlan();
    if (!plan) return;
    const { id, ...payload } = plan;
    const body: SaveSubscriptionPlanRequest = {
      ...payload,
      maxUsers: payload.maxUsers || null,
      maxBranches: payload.maxBranches || null,
      monthlyPrice: Number(payload.monthlyPrice) || 0,
    };
    const request = id ? this.billingSrv.updatePlan(id, body) : this.billingSrv.createPlan(body);
    request.subscribe(res => {
      if (!res.success) return;
      this.editingPlan.set(null);
      this.loadPlans();
      this.toastSrv.success(`Plan "${body.name}" saved`);
    });
  }
  // #endregion

  // #region View helpers
  statusTone(status: string): BadgeTone {
    switch (status) {
      case 'Active': case 'Paid': return 'success';
      case 'Trial': return 'primary';
      case 'PastDue': case 'Open': return 'warning';
      case 'Cancelled': case 'Void': return 'danger';
      default: return 'neutral';
    }
  }

  statusLabel(status: string): string {
    return status === 'PastDue' ? 'Past due' : status === 'None' ? 'No plan' : status;
  }

  money(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount ?? 0);
  }
  // #endregion
}
