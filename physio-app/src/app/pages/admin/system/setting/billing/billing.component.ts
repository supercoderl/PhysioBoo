import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { BooBadgeTone, BooButtonComponent, BooEmptyStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { SettingPageComponent } from '../../../../../components/layout/admin/setting/shared/setting-page.component';
import { SettingSectionComponent } from '../../../../../components/layout/admin/setting/shared/setting-section.component';
import { BillingService } from '../../../../../services/admin/billing.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { Permissions } from '../../../../../shared/constants/permission.constant';
import { SharedModule } from '../../../../../shared/shared-imports';
import { SubscriptionInvoice, SubscriptionInvoiceStatus, SubscriptionPlan, SubscriptionStatus, TenantSubscriptionDetail } from '../../../../../shared/types/billing.types';

const STATUS: Record<SubscriptionStatus, { label: string; tone: BooBadgeTone }> = {
  Trial: { label: 'Trial', tone: 'primary' },
  Active: { label: 'Active', tone: 'success' },
  PastDue: { label: 'Past due', tone: 'warning' },
  Cancelled: { label: 'Cancelled', tone: 'neutral' },
  None: { label: 'No subscription', tone: 'neutral' },
};

const INVOICE_STATUS: Record<SubscriptionInvoiceStatus, { label: string; tone: BooBadgeTone }> = {
  Open: { label: 'Due', tone: 'warning' },
  Paid: { label: 'Paid', tone: 'success' },
  Void: { label: 'Void', tone: 'neutral' },
};

/**
 * Settings > Plan & Billing: the tenant's own subscription (GET /api/billing/me/subscription), the active plans it
 * can switch to (GET /api/billing/me/plans) and its invoices. Switching plan and cancelling go through
 * /api/billing/me/subscription/* and need `subscription:own:manage`. Payments are recorded by the platform's billing
 * team once a bank transfer arrives; there is no card or online payment here.
 */
@Component({
  selector: 'setting-billing',
  standalone: true,
  imports: [
    SharedModule,
    SettingPageComponent,
    SettingSectionComponent,
    BooButtonComponent,
    BooStatusBadgeComponent,
    BooEmptyStateComponent
  ],
  templateUrl: './billing.component.html'
})
export class SettingBillingComponent implements OnInit {
  private authSrv = inject(AuthService);
  private billingSrv = inject(BillingService);
  private dialogSrv = inject(DialogService);
  private toastSrv = inject(ToastService);

  readonly canManage = this.authSrv.hasPermission(Permissions.Subscription.OwnManage);

  readonly loading = signal(true);
  readonly loadFailed = signal(false);
  readonly changingPlan = signal<string | null>(null);
  readonly cancelling = signal(false);
  readonly downloading = signal<string | null>(null);

  readonly subscription = signal<TenantSubscriptionDetail | null>(null);
  readonly plans = signal<SubscriptionPlan[]>([]);

  readonly status = computed<SubscriptionStatus>(() => this.subscription()?.status ?? 'None');
  readonly statusInfo = computed(() => STATUS[this.status()] ?? STATUS.None);
  readonly hasSubscription = computed(() => !!this.subscription()?.subscriptionId && this.status() !== 'None');
  readonly isCancelled = computed(() => this.status() === 'Cancelled');
  readonly currentPlanId = computed(() => this.hasSubscription() ? this.subscription()?.planId ?? null : null);
  readonly invoices = computed(() => [...(this.subscription()?.invoices ?? [])]
    .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()));
  readonly outstanding = computed(() => this.subscription()?.outstandingAmount ?? 0);
  readonly openInvoices = computed(() => this.subscription()?.openInvoiceCount ?? 0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    forkJoin({
      subscription: this.billingSrv.getMySubscription(),
      // Without the plan list the page still shows the subscription and invoices.
      plans: this.billingSrv.getMyPlans().pipe(catchError(() => of(null)))
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ subscription, plans }) => {
          if (!subscription.success) { this.loadFailed.set(true); return; }
          this.subscription.set(subscription.data ?? null);
          this.plans.set(plans?.success ? [...(plans.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder) : []);
        },
        error: () => this.loadFailed.set(true)
      });
  }

  invoiceStatus(inv: SubscriptionInvoice) {
    return INVOICE_STATUS[inv.status] ?? { label: inv.status, tone: 'neutral' as BooBadgeTone };
  }

  /** Limits come from the plan; `null` means the plan sets none. */
  planLimits(p: SubscriptionPlan): string[] {
    return [
      p.maxUsers ? `Up to ${p.maxUsers} staff account${p.maxUsers === 1 ? '' : 's'}` : 'No limit on staff accounts',
      p.maxBranches ? `Up to ${p.maxBranches} branch${p.maxBranches === 1 ? '' : 'es'}` : 'No limit on branches',
    ];
  }

  selectPlan(plan: SubscriptionPlan): void {
    if (!this.canManage || plan.id === this.currentPlanId() || this.changingPlan()) return;
    const current = this.subscription()?.planName;
    const reactivates = this.isCancelled();
    this.dialogSrv.confirm(
      `${current ? `Your clinic moves from ${current} to ${plan.name}` : `Your clinic is subscribed to ${plan.name}`} ` +
      `(${plan.monthlyPrice.toLocaleString()} ${plan.currency} per month) immediately.` +
      (reactivates ? ' This also reactivates your cancelled subscription.' : ''),
      () => {
        this.changingPlan.set(plan.id);
        this.billingSrv.changeMyPlan(plan.id)
          .pipe(finalize(() => this.changingPlan.set(null)))
          .subscribe({
            next: res => {
              if (!res.success || !res.data) { this.toastSrv.error('Unable to change the plan'); return; }
              this.subscription.set(res.data);
              this.toastSrv.success(`Your clinic is now on the ${res.data.planName ?? plan.name} plan`);
            },
            error: () => undefined
          });
      },
      `Switch to ${plan.name}?`,
      'warning',
      'Switch plan'
    );
  }

  cancelSubscription(): void {
    if (!this.canManage || !this.hasSubscription() || this.isCancelled() || this.cancelling()) return;
    this.dialogSrv.confirm(
      'Your clinic’s subscription will be cancelled. You can subscribe again later by choosing a plan.',
      () => {
        this.cancelling.set(true);
        this.billingSrv.cancelMySubscription()
          .pipe(finalize(() => this.cancelling.set(false)))
          .subscribe({
            next: res => {
              if (!res.success || !res.data) { this.toastSrv.error('Unable to cancel the subscription'); return; }
              this.subscription.set(res.data);
              this.toastSrv.success('Subscription cancelled');
            },
            error: () => undefined
          });
      },
      'Cancel subscription?',
      'danger',
      'Cancel subscription',
      'Keep subscription'
    );
  }

  downloadInvoice(inv: SubscriptionInvoice): void {
    if (this.downloading()) return;
    this.downloading.set(inv.id);
    this.billingSrv.downloadMyInvoice(inv.id)
      .pipe(finalize(() => this.downloading.set(null)))
      .subscribe({
        next: blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${inv.invoiceNumber}.html`;
          link.click();
          URL.revokeObjectURL(url);
        },
        error: () => undefined
      });
  }
}
