import { BooBadgeTone } from '@physioboo/ui';
import { SubscriptionInvoiceStatus, SubscriptionStatus } from "../types/billing.types";

/** Badge tone for a subscription or invoice status. */
export function billingStatusTone(status: SubscriptionStatus | SubscriptionInvoiceStatus | string): BooBadgeTone {
    switch (status) {
        case 'Active': case 'Paid': return 'success';
        case 'Trial': return 'primary';
        case 'PastDue': case 'Open': return 'warning';
        case 'Cancelled': case 'Void': return 'danger';
        default: return 'neutral';
    }
}

export function billingStatusLabel(status: SubscriptionStatus | SubscriptionInvoiceStatus | string): string {
    switch (status) {
        case 'PastDue': return 'Past due';
        case 'None': return 'No plan';
        default: return status;
    }
}

export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount ?? 0);
}
