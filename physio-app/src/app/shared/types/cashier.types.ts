import { BooBadgeTone } from '@physioboo/ui';

/** Mirrors `PaymentStatus` on the server. */
export type CashierBillStatus = 'Pending' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded' | 'Waived';

/** Mirrors `PaymentMethod` on the server. */
export type CashierPaymentMethod = 'Cash' | 'Card' | 'Upi' | 'NetBanking' | 'Cheque' | 'DemandDraft' | 'Insurance' | 'Wallet' | 'Qr';

export type CashierTransactionType = 'Payment' | 'Refund' | 'Void' | 'Reprint';

export interface CashierChargeLine {
    id: string;
    category: string;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    isInsuranceCovered: boolean;
}

export interface CashierInvoice {
    id: string;
    billNumber: string;
    billDate: string;
    visitType: string;
    departmentName: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    patientPhone: string;
    charges: CashierChargeLine[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountPercent: number;
    discountAmount: number;
    insuranceCoverageAmount: number;
    totalAmount: number;
    paidAmount: number;
    remainingBalance: number;
    status: CashierBillStatus;
}

export interface CashierTransactionEvent {
    /** The payment row id; a refunded payment yields a Payment and a Refund event with the same id. */
    id: string;
    type: CashierTransactionType;
    invoiceId: string;
    invoiceNumber: string;
    patientName: string;
    /** Negative for refunds. */
    amount: number;
    method: CashierPaymentMethod | '';
    occurredAt: string;
    performedBy: string;
}

export interface CashierDashboardStats {
    todayRevenue: number;
    cashCollected: number;
    cardPayments: number;
    insuranceClaims: number;
    outstandingBills: number;
    refundAmount: number;
    completedTransactions: number;
    averagePaymentTimeSeconds: number;
}

export interface CashierInvoiceFilter {
    search: string;
    status: CashierBillStatus | null;
    dateFrom: string | null;
    dateTo: string | null;
    pageNumber: number;
    pageSize: number;
}

export interface CashierPaymentSplit {
    method: CashierPaymentMethod;
    amount: number;
}

export interface CashierPaymentRequest {
    invoiceId: string;
    splits: CashierPaymentSplit[];
    amountTendered: number;
}

export interface CashierRefundRequest {
    invoiceId: string;
    paymentId: string;
    amount: number;
    reason: string;
    method: CashierPaymentMethod;
}

export interface CashierInsuranceRequest {
    insuranceCompanyId: string;
    policyNo: string;
    coverageAmount: number;
}

/** A payment that can still be refunded, derived from the payment history. */
export interface CashierRefundablePayment {
    paymentId: string;
    method: CashierPaymentMethod;
    paidAt: string;
    /** What the payment collected. */
    amount: number;
    /** What can still be refunded on it. */
    refundable: number;
}

export const CASHIER_BILL_STATUSES: { value: CashierBillStatus; label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Partial', label: 'Partially paid' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Overdue', label: 'Overdue' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Waived', label: 'Waived' },
];

/** Methods a cashier can tender with. `Insurance` is excluded: coverage is applied to the bill, not collected as a payment. */
export const CASHIER_PAYMENT_METHODS: { value: CashierPaymentMethod; label: string }[] = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Card', label: 'Card' },
    { value: 'Qr', label: 'QR code' },
    { value: 'Upi', label: 'UPI' },
    { value: 'NetBanking', label: 'Net banking' },
    { value: 'Wallet', label: 'Wallet' },
    { value: 'Cheque', label: 'Cheque' },
    { value: 'DemandDraft', label: 'Demand draft' },
];

const STATUS_TONE: Record<CashierBillStatus, BooBadgeTone> = {
    Pending: 'warning',
    Partial: 'primary',
    Paid: 'success',
    Overdue: 'danger',
    Cancelled: 'neutral',
    Refunded: 'danger',
    Waived: 'neutral',
};

export function cashierStatusLabel(status: CashierBillStatus): string {
    return CASHIER_BILL_STATUSES.find(s => s.value === status)?.label ?? status;
}

export function cashierStatusTone(status: CashierBillStatus): BooBadgeTone {
    return STATUS_TONE[status] ?? 'neutral';
}

export function cashierMethodLabel(method: string): string {
    return CASHIER_PAYMENT_METHODS.find(m => m.value === method)?.label ?? (method || '—');
}

const CLOSED_STATUSES: CashierBillStatus[] = ['Cancelled', 'Paid'];

export function canCollectPayment(bill: CashierInvoice): boolean {
    return !CLOSED_STATUSES.includes(bill.status) && bill.remainingBalance > 0;
}

export function canAdjustBill(bill: CashierInvoice): boolean {
    return !CLOSED_STATUSES.includes(bill.status);
}

export function canRefundBill(bill: CashierInvoice): boolean {
    return bill.status !== 'Cancelled' && bill.paidAmount > 0;
}

/** The server does not check for collected money when voiding, so the UI only offers it on untouched bills. */
export function canVoidBill(bill: CashierInvoice): boolean {
    return bill.status !== 'Cancelled' && bill.paidAmount <= 0;
}

/**
 * Payments on a bill that can be refunded. The server overwrites a payment's refund amount rather than adding to it,
 * so a payment that was already refunded is not offered again.
 */
export function cashierRefundablePayments(events: CashierTransactionEvent[], invoiceId: string): CashierRefundablePayment[] {
    const refundedIds = new Set(events.filter(e => e.invoiceId === invoiceId && e.type === 'Refund').map(e => e.id));
    return events
        .filter(e => e.invoiceId === invoiceId && e.type === 'Payment' && e.amount > 0 && !refundedIds.has(e.id) && e.method)
        .map(e => ({ paymentId: e.id, method: e.method as CashierPaymentMethod, paidAt: e.occurredAt, amount: e.amount, refundable: e.amount }));
}

/** Rounds to cents so comparisons against currency amounts are not thrown off by float noise. */
export function roundMoney(value: number): number {
    return Math.round((Number(value) || 0) * 100) / 100;
}
