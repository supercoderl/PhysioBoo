import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import {
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
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class CashierService {
    // #region Inject Services
    private readonly http = inject(HttpClient);
    // #endregion

    // #region Methods
    getDashboardStats() {
        return this.http.get<PagedResponse<CashierDashboardStats>>(BASE_API.CASHIER.DASHBOARD, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.DASHBOARD }) });
    }

    searchInvoices(filter: CashierInvoiceFilter) {
        return this.http.get<PagedResponse<PaginationData<CashierInvoice>>>(BASE_API.CASHIER.INVOICES, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.INVOICES_SEARCH }) });
    }

    getInvoiceDetail(invoiceId: string) {
        return this.http.get<PagedResponse<CashierInvoice>>(BASE_API.CASHIER.INVOICE_DETAIL(invoiceId), { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.INVOICE_DETAIL }) });
    }

    searchPatients(query: string) {
        return this.http.get<PagedResponse<CashierPatientMatch[]>>(`${BASE_API.CASHIER.PATIENTS_SEARCH}?q=${encodeURIComponent(query)}`, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PATIENTS_SEARCH }) });
    }

    receivePayment(invoiceId: string, splits: CashierPaymentSplit[], amountTendered: number) {
        return this.http.post<PagedResponse<CashierPaymentResult>>(BASE_API.CASHIER.PAYMENTS, { invoiceId, splits, amountTendered }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PAYMENT }) });
    }

    refundPayment(invoiceId: string, amount: number, reason: string, method: CashierPaymentMethod) {
        return this.http.post<PagedResponse<CashierRefundResult>>(BASE_API.CASHIER.REFUNDS, { invoiceId, amount, reason, method }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.REFUND }) });
    }

    applyDiscount(invoiceId: string, discountPercent: number) {
        return this.http.post<PagedResponse<{ invoiceId: string; discountPercent: number }>>(BASE_API.CASHIER.DISCOUNTS(invoiceId), { discountPercent }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.DISCOUNT }) });
    }

    applyInsurance(invoiceId: string, provider: string, policyNo: string, coverageAmount: number) {
        return this.http.post<PagedResponse<{ invoiceId: string; coverageAmount: number }>>(BASE_API.CASHIER.INSURANCE(invoiceId), { provider, policyNo, coverageAmount }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.INSURANCE }) });
    }

    voidInvoice(invoiceId: string, reason: string) {
        return this.http.post<PagedResponse<{ invoiceId: string }>>(BASE_API.CASHIER.VOID(invoiceId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.VOID }) });
    }

    getPaymentHistory() {
        return this.http.get<PagedResponse<CashierTransactionEvent[]>>(BASE_API.CASHIER.PAYMENT_HISTORY, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PAYMENT_HISTORY }) });
    }

    printInvoice(invoiceId: string) {
        return this.http.post<PagedResponse<{ printed: boolean }>>(BASE_API.CASHIER.PRINT_INVOICE, { invoiceId }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PRINT_INVOICE }) });
    }

    printReceipt(paymentId: string) {
        return this.http.post<PagedResponse<{ printed: boolean }>>(BASE_API.CASHIER.PRINT_RECEIPT, { paymentId }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PRINT_RECEIPT }) });
    }
    // #endregion
}
