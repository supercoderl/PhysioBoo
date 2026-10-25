import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import {
    CashierDashboardStats,
    CashierInsuranceRequest,
    CashierInvoice,
    CashierInvoiceFilter,
    CashierPaymentRequest,
    CashierRefundRequest,
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
        return this.http.get<PagedResponse<CashierDashboardStats>>(BASE_API.CASHIER.DASHBOARD, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.DASHBOARD, skipErrorToast: true }) });
    }

    searchInvoices(filter: CashierInvoiceFilter) {
        let params = new HttpParams()
            .set('pageNumber', filter.pageNumber)
            .set('pageSize', filter.pageSize);
        if (filter.search.trim()) params = params.set('search', filter.search.trim());
        if (filter.status) params = params.set('status', filter.status);
        if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
        if (filter.dateTo) params = params.set('dateTo', filter.dateTo);

        return this.http.get<PagedResponse<PaginationData<CashierInvoice>>>(BASE_API.CASHIER.INVOICES, { params, context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.INVOICES_SEARCH, skipErrorToast: true }) });
    }

    getInvoiceDetail(invoiceId: string) {
        return this.http.get<PagedResponse<CashierInvoice | null>>(BASE_API.CASHIER.INVOICE_DETAIL(invoiceId), { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.INVOICE_DETAIL }) });
    }

    getPaymentHistory(limit: number) {
        const params = new HttpParams().set('limit', limit);
        return this.http.get<PagedResponse<CashierTransactionEvent[]>>(BASE_API.CASHIER.PAYMENT_HISTORY, { params, context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PAYMENT_HISTORY, skipErrorToast: true }) });
    }

    /** Every mutation answers with the refreshed invoice, which callers use instead of recomputing totals. */
    receivePayment(request: CashierPaymentRequest) {
        return this.http.post<PagedResponse<CashierInvoice | null>>(BASE_API.CASHIER.PAYMENTS, request, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.PAYMENT }) });
    }

    refundPayment(request: CashierRefundRequest) {
        return this.http.post<PagedResponse<CashierInvoice | null>>(BASE_API.CASHIER.REFUNDS, request, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.REFUND }) });
    }

    applyDiscount(invoiceId: string, discountPercent: number) {
        return this.http.post<PagedResponse<CashierInvoice | null>>(BASE_API.CASHIER.DISCOUNTS(invoiceId), { discountPercent }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.DISCOUNT }) });
    }

    applyInsurance(invoiceId: string, request: CashierInsuranceRequest) {
        return this.http.post<PagedResponse<CashierInvoice | null>>(BASE_API.CASHIER.INSURANCE(invoiceId), request, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.INSURANCE }) });
    }

    voidInvoice(invoiceId: string, reason: string) {
        return this.http.post<PagedResponse<CashierInvoice | null>>(BASE_API.CASHIER.VOID(invoiceId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.CASHIER.VOID }) });
    }
    // #endregion
}
