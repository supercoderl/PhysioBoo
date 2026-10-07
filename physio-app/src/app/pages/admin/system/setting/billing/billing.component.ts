import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { finalize } from 'rxjs';
import { BillingService } from '../../../../../services/admin/billing.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { SubscriptionPlan, TenantSubscriptionDetail } from '../../../../../shared/types/billing.types';
import { SharedModule } from '../../../../../shared/shared-imports';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month';
  description: string;
  features: string[];
  recommended?: boolean;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  label: string;
}

@Component({
  selector: 'setting-billing',
  standalone: true,
  imports: [
    SharedModule,
    AdminBreadcrumbComponent,
    BooIconComponent
  ],
  templateUrl: './billing.component.html'
})
export class SettingBillingComponent implements OnInit {
  private toastSrv = inject(ToastService);
  private billingSrv = inject(BillingService);

  loading = signal(false);
  changingPlan = signal<string | null>(null);

  subscription = signal<TenantSubscriptionDetail | null>(null);
  plans: Plan[] = [];

  currentPlanId = computed(() => this.subscription()?.planId ?? null);
  status = computed(() => this.subscription()?.status ?? 'None');
  isCancelled = computed(() => this.status() === 'Cancelled' || this.status() === 'None');
  renewsAt = computed(() => {
    const end = this.subscription()?.currentPeriodEnd;
    return end ? new Date(end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  });
  outstanding = computed(() => this.subscription()?.outstandingAmount ?? 0);

  invoices = computed<Invoice[]>(() => (this.subscription()?.invoices ?? []).map(i => ({
    id: i.id,
    number: i.invoiceNumber,
    amount: i.amount,
    date: new Date(i.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    status: i.status === 'Paid' ? 'paid' : i.status === 'Open' ? 'pending' : 'failed',
    label: i.status === 'Open' ? 'due' : `${i.status}`.toLowerCase(),
  })));

  currentPlan = computed<Plan>(() =>
    this.plans.find(p => p.id === this.currentPlanId()) ?? {
      id: '',
      name: this.subscription()?.planName ?? 'No',
      price: this.subscription()?.monthlyPrice ?? 0,
      currency: this.subscription()?.currency ?? 'USD',
      interval: 'month',
      description: '',
      features: [],
    });

  ngOnInit(): void {
    this.loading.set(true);
    this.billingSrv.getMyPlans().subscribe({
      next: res => { if (res.success) this.plans = this.toPlans(res.data); },
      error: () => this.toastSrv.error('Failed to load plans')
    });
    this.billingSrv.getMySubscription()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => { if (res.success) this.subscription.set(res.data); },
        error: () => this.toastSrv.error('Failed to load your subscription')
      });
  }

  private toPlans(plans: SubscriptionPlan[]): Plan[] {
    const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.map((p, index) => ({
      id: p.id,
      name: p.name,
      price: p.monthlyPrice,
      currency: p.currency,
      interval: 'month' as const,
      description: p.description ?? '',
      // The middle tier is highlighted, as on a pricing page.
      recommended: sorted.length > 2 && index === Math.floor(sorted.length / 2),
      features: [
        p.maxUsers ? `Up to ${p.maxUsers} staff accounts` : 'Unlimited staff accounts',
        p.maxBranches ? `Up to ${p.maxBranches} branch${p.maxBranches === 1 ? '' : 'es'}` : 'Unlimited branches',
      ],
    }));
  }

  selectPlan(plan: Plan): void {
    if (plan.id === this.currentPlanId() || this.changingPlan()) return;
    if (!confirm(`Change to ${plan.name} plan (${plan.price} ${plan.currency}/${plan.interval})?`)) return;

    this.changingPlan.set(plan.id);
    this.billingSrv.changeMyPlan(plan.id)
      .pipe(finalize(() => this.changingPlan.set(null)))
      .subscribe({
        next: res => {
          if (!res.success) { this.toastSrv.error('Unable to change plan'); return; }
          this.subscription.set(res.data);
          this.toastSrv.success(`Switched to ${plan.name} plan`);
        },
        error: () => this.toastSrv.error('Unable to change plan')
      });
  }

  downloadInvoice(inv: Invoice): void {
    this.billingSrv.downloadMyInvoice(inv.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${inv.number}.html`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.toastSrv.error(`Unable to download ${inv.number}`)
    });
  }

  cancelSubscription(): void {
    if (this.isCancelled()) return;
    if (!confirm('Cancel your subscription? Access will end at the next renewal date.')) return;
    this.billingSrv.cancelMySubscription().subscribe({
      next: res => {
        if (!res.success) { this.toastSrv.error('Unable to cancel the subscription'); return; }
        this.subscription.set(res.data);
        this.toastSrv.success('Subscription cancelled. Access continues until ' + this.renewsAt());
      },
      error: () => this.toastSrv.error('Unable to cancel the subscription')
    });
  }
}
