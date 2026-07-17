import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import {
    CashierChargeLine,
    CashierDashboardStats,
    CashierInvoice,
    CashierInvoiceFilter,
    CashierPatientMatch,
    CashierPaymentMethod,
    CashierPaymentResult,
    CashierPaymentSplit,
    CashierRefundResult,
    CashierTransactionEvent,
} from "../../shared/types/cashier.types";
import { PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { HttpService } from "../common/http.service";

@Injectable({ providedIn: 'root' })
export class CashierService {
    // #region Inject Services
    private readonly httpSrv = inject(HttpService);
    // #endregion

    // #region Methods
    getDashboardStats() {
        return this.httpSrv.getOr<CashierDashboardStats>(BASE_API.CASHIER.DASHBOARD, MOCK.stats, LoadingKeys.CASHIER.DASHBOARD);
    }

    searchInvoices(filter: CashierInvoiceFilter) {
        return this.httpSrv.getOr<PaginationData<CashierInvoice>>(BASE_API.CASHIER.INVOICES, MOCK.invoicePage(filter), LoadingKeys.CASHIER.INVOICES_SEARCH);
    }

    getInvoiceDetail(invoiceId: string) {
        const match = MOCK.invoices().find(i => i.id === invoiceId) ?? MOCK.invoices()[0];
        return this.httpSrv.getOr<CashierInvoice>(BASE_API.CASHIER.INVOICE_DETAIL(invoiceId), match, LoadingKeys.CASHIER.INVOICE_DETAIL);
    }

    searchPatients(query: string) {
        const q = query.toLowerCase();
        const filtered = MOCK.patients.filter(p =>
            p.fullName.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.phone.includes(q));
        return this.httpSrv.getOr<CashierPatientMatch[]>(`${BASE_API.CASHIER.PATIENTS_SEARCH}?q=${encodeURIComponent(query)}`, filtered, LoadingKeys.CASHIER.PATIENTS_SEARCH);
    }

    receivePayment(invoiceId: string, splits: CashierPaymentSplit[], amountTendered: number) {
        const invoice = MOCK.invoices().find(i => i.id === invoiceId) ?? MOCK.invoices()[0];
        const result = MOCK.paymentResult(invoice, splits, amountTendered);
        return this.httpSrv.postOr<CashierPaymentResult>(BASE_API.CASHIER.PAYMENTS, { invoiceId, splits, amountTendered }, result, LoadingKeys.CASHIER.PAYMENT);
    }

    refundPayment(invoiceId: string, amount: number, reason: string, method: CashierPaymentMethod) {
        const invoice = MOCK.invoices().find(i => i.id === invoiceId) ?? MOCK.invoices()[0];
        const result = MOCK.refundResult(invoice, amount, reason, method);
        return this.httpSrv.postOr<CashierRefundResult>(BASE_API.CASHIER.REFUNDS, { invoiceId, amount, reason, method }, result, LoadingKeys.CASHIER.REFUND);
    }

    applyDiscount(invoiceId: string, discountPercent: number) {
        return this.httpSrv.postOr<{ invoiceId: string; discountPercent: number }>(BASE_API.CASHIER.DISCOUNTS(invoiceId), { discountPercent }, { invoiceId, discountPercent }, LoadingKeys.CASHIER.DISCOUNT);
    }

    applyInsurance(invoiceId: string, provider: string, policyNo: string, coverageAmount: number) {
        return this.httpSrv.postOr<{ invoiceId: string; coverageAmount: number }>(BASE_API.CASHIER.INSURANCE(invoiceId), { provider, policyNo, coverageAmount }, { invoiceId, coverageAmount }, LoadingKeys.CASHIER.INSURANCE);
    }

    voidInvoice(invoiceId: string, reason: string) {
        return this.httpSrv.postOr<{ invoiceId: string }>(BASE_API.CASHIER.VOID(invoiceId), { reason }, { invoiceId }, LoadingKeys.CASHIER.VOID);
    }

    getPaymentHistory() {
        return this.httpSrv.getOr<CashierTransactionEvent[]>(BASE_API.CASHIER.PAYMENT_HISTORY, MOCK.transactions(), LoadingKeys.CASHIER.PAYMENT_HISTORY);
    }

    printInvoice(invoiceId: string) {
        return this.httpSrv.postOr<{ printed: boolean }>(BASE_API.CASHIER.PRINT_INVOICE, { invoiceId }, { printed: true }, LoadingKeys.CASHIER.PRINT_INVOICE);
    }

    printReceipt(paymentId: string) {
        return this.httpSrv.postOr<{ printed: boolean }>(BASE_API.CASHIER.PRINT_RECEIPT, { paymentId }, { printed: true }, LoadingKeys.CASHIER.PRINT_RECEIPT);
    }
    // #endregion
}

let invoiceSeq = 1;
let eventSeq = 1;

function charge(category: CashierChargeLine['category'], description: string, quantity: number, unitPrice: number): CashierChargeLine {
    return { id: `chg-${invoiceSeq}-${category}-${quantity}-${unitPrice}`, category, description, quantity, unitPrice, total: quantity * unitPrice };
}

function buildInvoice(overrides: Partial<CashierInvoice> & { charges: CashierChargeLine[] }): CashierInvoice {
    const subtotal = overrides.charges.reduce((s, c) => s + c.total, 0);
    const discountPercent = overrides.discountPercent ?? 0;
    const discountAmount = subtotal * discountPercent / 100;
    const insuranceCoverageAmount = overrides.insuranceCoverageAmount ?? 0;
    const taxRate = overrides.taxRate ?? 5;
    const taxableBase = Math.max(0, subtotal - discountAmount - insuranceCoverageAmount);
    const taxAmount = taxableBase * taxRate / 100;
    const totalAmount = Math.max(0, taxableBase + taxAmount);
    const paidAmount = overrides.paidAmount ?? 0;
    const remainingBalance = Math.max(0, totalAmount - paidAmount);
    const n = invoiceSeq++;
    return {
        id: `inv-${n}`,
        invoiceNo: `INV-${new Date().getFullYear()}-${String(n).padStart(5, '0')}`,
        patientId: `pat-${n}`,
        patientName: 'Patient',
        patientMrn: `MRN${String(n).padStart(6, '0')}`,
        patientPhone: '+1 555-010' + n,
        visitType: 'Outpatient',
        department: 'General',
        doctorName: 'Dr. Unassigned',
        invoiceDate: new Date().toISOString(),
        taxRate,
        taxAmount,
        discountPercent,
        discountAmount,
        insuranceProvider: null,
        insurancePolicyNo: null,
        insuranceCoverageAmount,
        subtotal,
        totalAmount,
        paidAmount,
        remainingBalance,
        status: remainingBalance === 0 ? 'Paid' : (paidAmount > 0 ? 'PartiallyPaid' : 'Pending'),
        ...overrides,
    } as CashierInvoice;
}

const MOCK = {
    invoices: (): CashierInvoice[] => [
        buildInvoice({
            patientName: 'Nguyen Van An', visitType: 'Outpatient', department: 'Physiotherapy', doctorName: 'Dr. Le Minh Tuan',
            charges: [charge('Service', 'Physiotherapy Session', 2, 45), charge('Procedure', 'Ultrasound Therapy', 1, 60), charge('Medication', 'Anti-inflammatory Gel', 1, 18)],
            discountPercent: 0, paidAmount: 0, status: 'Pending',
        }),
        buildInvoice({
            patientName: 'Tran Thi Bich', visitType: 'Inpatient', department: 'Orthopedics', doctorName: 'Dr. Pham Quoc Bao',
            charges: [charge('Room', 'Standard Room (2 nights)', 2, 120), charge('Laboratory', 'Blood Panel', 1, 55), charge('Imaging', 'X-Ray Knee', 1, 80), charge('Medication', 'Painkillers', 3, 12)],
            insuranceProvider: 'Bao Viet Insurance', insurancePolicyNo: 'BV-88213', insuranceCoverageAmount: 180,
            discountPercent: 5, paidAmount: 150, status: 'PartiallyPaid',
        }),
        buildInvoice({
            patientName: 'Le Hoang Nam', visitType: 'Emergency', department: 'Emergency', doctorName: 'Dr. Vu Thi Hoa',
            charges: [charge('Service', 'Emergency Consultation', 1, 90), charge('Imaging', 'CT Scan', 1, 220), charge('Procedure', 'Wound Suturing', 1, 75)],
            discountPercent: 0, paidAmount: 385, status: 'Paid',
        }),
        buildInvoice({
            patientName: 'Pham Thi Cam', visitType: 'Outpatient', department: 'Cardiology', doctorName: 'Dr. Dang Van Long',
            charges: [charge('Service', 'Cardiology Consultation', 1, 65), charge('Laboratory', 'Lipid Panel', 1, 40), charge('Procedure', 'ECG', 1, 35)],
            insuranceProvider: 'Prudential VN', insurancePolicyNo: 'PRU-44521', insuranceCoverageAmount: 0,
            discountPercent: 0, paidAmount: 0, status: 'InsurancePending',
        }),
        buildInvoice({
            patientName: 'Do Minh Khoa', visitType: 'Outpatient', department: 'Dermatology', doctorName: 'Dr. Ngo Thi Lan',
            charges: [charge('Service', 'Skin Consultation', 1, 50), charge('Medication', 'Topical Cream', 2, 15)],
            discountPercent: 10, paidAmount: 72, status: 'Paid',
        }),
        buildInvoice({
            patientName: 'Vo Thi Ngoc', visitType: 'Inpatient', department: 'Surgery', doctorName: 'Dr. Ho Anh Dung',
            charges: [charge('Room', 'Private Room (3 nights)', 3, 180), charge('Procedure', 'Minor Surgery', 1, 450), charge('Laboratory', 'Pre-op Panel', 1, 70)],
            discountPercent: 0, paidAmount: 0, status: 'Cancelled',
        }),
        buildInvoice({
            patientName: 'Bui Van Phuc', visitType: 'Outpatient', department: 'Physiotherapy', doctorName: 'Dr. Le Minh Tuan',
            charges: [charge('Service', 'Physiotherapy Session', 1, 45)],
            discountPercent: 0, paidAmount: 45, status: 'Refunded',
        }),
    ],

    invoicePage: (filter: CashierInvoiceFilter): PaginationData<CashierInvoice> => {
        let items = MOCK.invoices();
        if (filter.status && filter.status !== 'All') items = items.filter(i => i.status === filter.status);
        if (filter.search) {
            const q = filter.search.toLowerCase();
            items = items.filter(i =>
                i.invoiceNo.toLowerCase().includes(q) ||
                i.patientName.toLowerCase().includes(q) ||
                i.patientMrn.toLowerCase().includes(q) ||
                i.patientPhone.includes(q));
        }
        const pageSize = filter.pageSize || 10;
        const pageNumber = filter.pageNumber || 1;
        const start = (pageNumber - 1) * pageSize;
        const pageItems = items.slice(start, start + pageSize);
        return {
            items: pageItems,
            pageNumber,
            pageSize,
            totalCount: items.length,
            totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
            hasNext: start + pageSize < items.length,
            hasPrevious: pageNumber > 1,
        };
    },

    stats: {
        todayRevenue: 4820,
        cashCollected: 2150,
        cardPayments: 1680,
        insuranceClaims: 990,
        outstandingBills: 2340,
        refundAmount: 45,
        completedTransactions: 38,
        averagePaymentTimeSeconds: 96,
    } as CashierDashboardStats,

    patients: [
        { id: 'pat-1', fullName: 'Nguyen Van An', mrn: 'MRN000001', phone: '+15550101', outstandingBalance: 168, invoiceCount: 1 },
        { id: 'pat-2', fullName: 'Tran Thi Bich', mrn: 'MRN000002', phone: '+15550102', outstandingBalance: 0, invoiceCount: 2 },
        { id: 'pat-3', fullName: 'Le Hoang Nam', mrn: 'MRN000003', phone: '+15550103', outstandingBalance: 0, invoiceCount: 1 },
        { id: 'pat-4', fullName: 'Pham Thi Cam', mrn: 'MRN000004', phone: '+15550104', outstandingBalance: 130, invoiceCount: 1 },
    ] as CashierPatientMatch[],

    paymentResult: (invoice: CashierInvoice, splits: CashierPaymentSplit[], amountTendered: number): CashierPaymentResult => {
        const totalPaid = splits.reduce((s, p) => s + p.amount, 0);
        return {
            id: `pay-${invoiceSeq++}`,
            invoiceId: invoice.id,
            invoiceNo: invoice.invoiceNo,
            amountPaid: totalPaid,
            splits,
            changeDue: Math.max(0, amountTendered - totalPaid),
            paidAt: new Date().toISOString(),
            cashierName: 'Current Cashier',
        };
    },

    refundResult: (invoice: CashierInvoice, amount: number, reason: string, method: CashierPaymentMethod): CashierRefundResult => ({
        id: `ref-${invoiceSeq++}`,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        amount,
        reason,
        method,
        refundedAt: new Date().toISOString(),
        cashierName: 'Current Cashier',
    }),

    transactions: (): CashierTransactionEvent[] => {
        const now = Date.now();
        return [
            { id: `evt-${eventSeq++}`, type: 'Payment', invoiceNo: 'INV-2026-00003', patientName: 'Le Hoang Nam', amount: 385, method: 'Cash', timestamp: new Date(now - 5 * 60000).toISOString(), cashierName: 'Current Cashier' },
            { id: `evt-${eventSeq++}`, type: 'Payment', invoiceNo: 'INV-2026-00005', patientName: 'Do Minh Khoa', amount: 72, method: 'CreditCard', timestamp: new Date(now - 22 * 60000).toISOString(), cashierName: 'Current Cashier' },
            { id: `evt-${eventSeq++}`, type: 'Refund', invoiceNo: 'INV-2026-00007', patientName: 'Bui Van Phuc', amount: 45, method: 'Cash', timestamp: new Date(now - 48 * 60000).toISOString(), cashierName: 'Current Cashier' },
            { id: `evt-${eventSeq++}`, type: 'Reprint', invoiceNo: 'INV-2026-00003', patientName: 'Le Hoang Nam', amount: 385, method: null, timestamp: new Date(now - 60 * 60000).toISOString(), cashierName: 'Current Cashier' },
            { id: `evt-${eventSeq++}`, type: 'Void', invoiceNo: 'INV-2026-00006', patientName: 'Vo Thi Ngoc', amount: 1420, method: null, timestamp: new Date(now - 130 * 60000).toISOString(), cashierName: 'Current Cashier' },
            { id: `evt-${eventSeq++}`, type: 'Payment', invoiceNo: 'INV-2026-00002', patientName: 'Tran Thi Bich', amount: 150, method: 'BankTransfer', timestamp: new Date(now - 175 * 60000).toISOString(), cashierName: 'Current Cashier' },
        ];
    },
};
