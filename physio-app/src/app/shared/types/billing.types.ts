export type SubscriptionStatus = 'Trial' | 'Active' | 'PastDue' | 'Cancelled' | 'None';
export type SubscriptionInvoiceStatus = 'Open' | 'Paid' | 'Void';
export type SubscriptionAction = 'ChangePlan' | 'Activate' | 'MarkPastDue' | 'Cancel' | 'UpdateDetails';

export interface SubscriptionPlan {
    id: string;
    code: string;
    name: string;
    description: string | null;
    monthlyPrice: number;
    currency: string;
    maxUsers: number | null;
    maxBranches: number | null;
    isActive: boolean;
    sortOrder: number;
    subscriberCount: number;
}

export interface SaveSubscriptionPlanRequest {
    code: string;
    name: string;
    description: string | null;
    monthlyPrice: number;
    currency: string;
    maxUsers: number | null;
    maxBranches: number | null;
    isActive: boolean;
    sortOrder: number;
}

export interface TenantSubscription {
    hospitalGroupId: string;
    tenantName: string;
    tenantEmail: string | null;
    subscriptionId: string | null;
    planId: string | null;
    planName: string | null;
    monthlyPrice: number;
    currency: string;
    status: SubscriptionStatus;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    openInvoiceCount: number;
    outstandingAmount: number;
}

export interface SubscriptionInvoice {
    id: string;
    invoiceNumber: string;
    planName: string;
    periodStart: string;
    periodEnd: string;
    amount: number;
    currency: string;
    status: SubscriptionInvoiceStatus;
    issuedAt: string;
    dueDate: string;
    paidAt: string | null;
    paymentReference: string | null;
}

export interface TenantSubscriptionDetail extends TenantSubscription {
    startedAt: string | null;
    cancelledAt: string | null;
    billingEmail: string | null;
    notes: string | null;
    invoices: SubscriptionInvoice[];
}

export interface ChangeSubscriptionRequest {
    action: SubscriptionAction;
    planId?: string | null;
    billingEmail?: string | null;
    notes?: string | null;
}
