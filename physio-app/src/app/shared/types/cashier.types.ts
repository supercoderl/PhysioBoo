export type CashierInvoiceStatus = 'Pending' | 'PartiallyPaid' | 'Paid' | 'Cancelled' | 'Refunded' | 'InsurancePending';
export type CashierPaymentMethod = 'Cash' | 'CreditCard' | 'DebitCard' | 'BankTransfer' | 'QRCode' | 'Insurance' | 'Corporate' | 'Mixed';
export type CashierVisitType = 'Outpatient' | 'Inpatient' | 'Emergency';
export type CashierChargeCategory = 'Medication' | 'Laboratory' | 'Imaging' | 'Procedure' | 'Room' | 'Service';
export type CashierTransactionEventType = 'Payment' | 'Refund' | 'Void' | 'Reprint';

export interface CashierChargeLine {
    id: string;
    category: CashierChargeCategory;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface CashierInvoice {
    id: string;
    invoiceNo: string;
    patientId: string;
    patientName: string;
    patientMrn: string;
    patientPhone: string;
    visitType: CashierVisitType;
    department: string;
    doctorName: string;
    invoiceDate: string;
    charges: CashierChargeLine[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountPercent: number;
    discountAmount: number;
    insuranceProvider?: string | null;
    insurancePolicyNo?: string | null;
    insuranceCoverageAmount: number;
    totalAmount: number;
    paidAmount: number;
    remainingBalance: number;
    status: CashierInvoiceStatus;
}

export interface CashierPaymentSplit {
    method: CashierPaymentMethod;
    amount: number;
    reference?: string;
}

export interface CashierPaymentResult {
    id: string;
    invoiceId: string;
    invoiceNo: string;
    amountPaid: number;
    splits: CashierPaymentSplit[];
    changeDue: number;
    paidAt: string;
    cashierName: string;
}

export interface CashierRefundResult {
    id: string;
    invoiceId: string;
    invoiceNo: string;
    amount: number;
    reason: string;
    method: CashierPaymentMethod;
    refundedAt: string;
    cashierName: string;
}

export interface CashierTransactionEvent {
    id: string;
    type: CashierTransactionEventType;
    invoiceNo: string;
    patientName: string;
    amount: number;
    method?: CashierPaymentMethod | null;
    timestamp: string;
    cashierName: string;
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

export interface CashierPatientMatch {
    id: string;
    fullName: string;
    mrn: string;
    phone: string;
    outstandingBalance: number;
    invoiceCount: number;
}

export interface CashierInvoiceFilter {
    search?: string;
    status?: CashierInvoiceStatus | 'All';
    pageNumber: number;
    pageSize: number;
}
