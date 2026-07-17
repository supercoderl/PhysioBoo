import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { RevenueReportFilter } from "../../shared/types/filter.types";
import {
    DepartmentRevenuePerformance,
    DiscountRecord,
    DoctorRevenuePerformance,
    InsuranceProviderRevenue,
    OutstandingAgingSummary,
    OutstandingInvoice,
    PaymentMethodBreakdown,
    RefundRecord,
    RevenueSummary,
    RevenueTransaction,
    RevenueTransactionDetail,
    RevenueTrendPoint,
} from "../../shared/types/revenue.types";

@Injectable({ providedIn: 'root' })
export class RevenueReportService {
    constructor(private http: HttpClient) { }

    getSummary(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<RevenueSummary>>(BASE_API.REVENUE_REPORT.SUMMARY, filter);
    }

    getTrend(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<RevenueTrendPoint[]>>(BASE_API.REVENUE_REPORT.TREND, filter);
    }

    getPaymentMethodBreakdown(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<PaymentMethodBreakdown[]>>(BASE_API.REVENUE_REPORT.PAYMENT_METHODS, filter);
    }

    getDepartmentPerformance(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<DepartmentRevenuePerformance[]>>(BASE_API.REVENUE_REPORT.DEPARTMENTS, filter);
    }

    getDoctorPerformance(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<DoctorRevenuePerformance[]>>(BASE_API.REVENUE_REPORT.DOCTORS, filter);
    }

    getInsuranceRevenue(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<InsuranceProviderRevenue[]>>(BASE_API.REVENUE_REPORT.INSURANCE, filter);
    }

    getOutstandingSummary(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<OutstandingAgingSummary[]>>(BASE_API.REVENUE_REPORT.OUTSTANDING_SUMMARY, filter);
    }

    searchOutstanding(request: PagedRequest<RevenueReportFilter>) {
        return this.http.post<PagedResponse<PaginationData<OutstandingInvoice>>>(BASE_API.REVENUE_REPORT.OUTSTANDING_SEARCH, request);
    }

    searchRefunds(request: PagedRequest<RevenueReportFilter>) {
        return this.http.post<PagedResponse<PaginationData<RefundRecord>>>(BASE_API.REVENUE_REPORT.REFUNDS_SEARCH, request);
    }

    searchDiscounts(request: PagedRequest<RevenueReportFilter>) {
        return this.http.post<PagedResponse<PaginationData<DiscountRecord>>>(BASE_API.REVENUE_REPORT.DISCOUNTS_SEARCH, request);
    }

    searchTransactions(request: PagedRequest<RevenueReportFilter>) {
        return this.http.post<PagedResponse<PaginationData<RevenueTransaction>>>(BASE_API.REVENUE_REPORT.TRANSACTIONS_SEARCH, request);
    }

    getTransactionDetail(id: string) {
        return this.http.get<PagedResponse<RevenueTransactionDetail>>(BASE_API.REVENUE_REPORT.TRANSACTION_DETAIL(id));
    }

    export(filter: RevenueReportFilter) {
        return this.http.post<PagedResponse<{ fileUrl: string }>>(BASE_API.REVENUE_REPORT.EXPORT, filter);
    }
}
