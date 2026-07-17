export interface RevenueSummary {
    totalRevenue: number;
    totalRevenueGrowthPct: number;
    netRevenue: number;
    totalPatients: number;
    totalTransactions: number;
    averageBillValue: number;
    outstandingRevenue: number;
    outstandingCount: number;
    totalRefunds: number;
    refundCount: number;
    totalDiscounts: number;
    discountCount: number;
    insuranceRevenue: number;
    revenueTrend: number[];
}

export interface RevenueTrendPoint {
    label: string;
    date: string;
    cashPayments: number;
    cardPayments: number;
    insurancePayments: number;
    upiPayments: number;
    otherPayments: number;
    total: number;
}

export interface PaymentMethodBreakdown {
    method: string;
    amount: number;
    count: number;
    percentage: number;
}

export interface DepartmentRevenuePerformance {
    departmentId: string;
    name: string;
    revenue: number;
    patients: number;
    transactions: number;
    percentage: number;
    growthPct: number;
}

export interface DoctorRevenuePerformance {
    doctorId: string;
    name: string;
    department: string;
    revenue: number;
    patients: number;
    transactions: number;
    averageBillValue: number;
    growthPct: number;
}

export interface InsuranceProviderRevenue {
    providerId: string;
    providerName: string;
    claimedAmount: number;
    approvedAmount: number;
    pendingAmount: number;
    rejectedAmount: number;
    claimCount: number;
    approvalRatePct: number;
}

export type OutstandingAgingBucket = '0-30' | '31-60' | '61-90' | '90+';

export interface OutstandingAgingSummary {
    bucket: OutstandingAgingBucket;
    amount: number;
    count: number;
}

export interface OutstandingInvoice {
    invoiceId: string;
    billNo: string;
    patientName: string;
    department: string;
    dueDate: string | null;
    amountDue: number;
    agingBucket: OutstandingAgingBucket;
    daysOverdue: number;
}

export interface RefundRecord {
    refundId: string;
    billNo: string;
    patientName: string;
    department: string;
    reason: string;
    amount: number;
    date: string;
    processedBy: string;
}

export interface DiscountRecord {
    discountId: string;
    billNo: string;
    patientName: string;
    department: string;
    discountType: string;
    amount: number;
    approvedBy: string;
    date: string;
}

export type RevenueTransactionStatus = 'Paid' | 'Partial' | 'Pending' | 'Refunded' | 'Void';

export interface RevenueTransaction {
    id: string;
    billNo: string;
    datetime: string;
    patientName: string;
    department: string;
    doctorName: string;
    paymentMethod: string;
    amount: number;
    discount: number;
    refund: number;
    status: RevenueTransactionStatus;
}

export interface RevenueTransactionLineItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface RevenueTransactionPaymentSplit {
    method: string;
    amount: number;
    reference?: string | null;
}

export interface RevenueTransactionInsuranceClaim {
    providerName: string;
    claimedAmount: number;
    approvedAmount: number;
    status: string;
}

export interface RevenueTransactionDetail extends RevenueTransaction {
    lineItems: RevenueTransactionLineItem[];
    paymentSplits: RevenueTransactionPaymentSplit[];
    insuranceClaim?: RevenueTransactionInsuranceClaim | null;
    notes?: string | null;
}
