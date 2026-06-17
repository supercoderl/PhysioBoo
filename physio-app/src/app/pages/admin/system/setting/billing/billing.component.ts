import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminBreadcrumbComponent } from "../../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { ToastService } from '../../../../../services/common/toast.service';
import { SharedModule } from '../../../../../shared/shared-imports';

interface Plan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  price: number;
  interval: 'month' | 'year';
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
  downloadUrl?: string;
}

interface PaymentMethod {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
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

  loading = signal(false);
  changingPlan = signal<Plan['id'] | null>(null);

  currentPlanId = signal<Plan['id']>('pro');
  renewsAt = signal<string>('Jun 14, 2026');
  paymentMethod = signal<PaymentMethod | null>({
    brand: 'Visa', last4: '4242', expMonth: 6, expYear: 2027
  });

  invoices = signal<Invoice[]>([
    { id: '1', number: 'INV-2026-005', amount: 79, date: 'May 14, 2026', status: 'paid' },
    { id: '2', number: 'INV-2026-004', amount: 79, date: 'Apr 14, 2026', status: 'paid' },
    { id: '3', number: 'INV-2026-003', amount: 79, date: 'Mar 14, 2026', status: 'paid' },
    { id: '4', number: 'INV-2026-002', amount: 79, date: 'Feb 14, 2026', status: 'paid' },
  ]);

  plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 19,
      interval: 'month',
      description: 'For solo practitioners getting started.',
      features: [
        'Up to 100 patients',
        '1 staff member',
        'Email support',
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 79,
      interval: 'month',
      description: 'For growing clinics with multiple staff.',
      recommended: true,
      features: [
        'Unlimited patients',
        'Up to 10 staff members',
        'Priority email & chat support',
        'Custom branding',
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      interval: 'month',
      description: 'For hospital groups and large networks.',
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        'SLA-backed support',
        'On-premise option',
        'Custom integrations',
      ]
    }
  ];

  currentPlan = computed(() => this.plans.find(p => p.id === this.currentPlanId())!);

  ngOnInit(): void {
    // TODO: replace with real GET /api/billing/subscription + /api/billing/payment-method + /api/billing/invoices
  }

  selectPlan(plan: Plan): void {
    if (plan.id === this.currentPlanId() || this.changingPlan()) return;
    if (!confirm(`Change to ${plan.name} plan ($${plan.price}/${plan.interval})?`)) return;

    this.changingPlan.set(plan.id);
    // TODO: POST /api/billing/subscription { planId }
    setTimeout(() => {
      this.currentPlanId.set(plan.id);
      this.changingPlan.set(null);
      this.toastSrv.success(`Switched to ${plan.name} plan`);
    }, 600);
  }

  updatePaymentMethod(): void {
    // TODO: open Stripe / payment portal — POST /api/billing/portal-session and redirect
    this.toastSrv.success('Opening secure payment portal…');
  }

  removePaymentMethod(): void {
    if (!confirm('Remove your payment method? Your subscription will be paused.')) return;
    this.paymentMethod.set(null);
    this.toastSrv.success('Payment method removed');
  }

  downloadInvoice(inv: Invoice): void {
    if (inv.downloadUrl) {
      window.open(inv.downloadUrl, '_blank');
      return;
    }
    // TODO: GET /api/billing/invoices/{id}/download
    this.toastSrv.success(`Downloading ${inv.number}…`);
  }

  cancelSubscription(): void {
    if (!confirm('Cancel your subscription? Access will end at the next renewal date.')) return;
    // TODO: DELETE /api/billing/subscription
    this.toastSrv.success('Subscription cancelled. Access continues until ' + this.renewsAt());
  }
}
