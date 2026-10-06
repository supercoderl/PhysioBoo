import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import {
    ChangeSubscriptionRequest,
    SaveSubscriptionPlanRequest,
    SubscriptionPlan,
    TenantSubscription,
    TenantSubscriptionDetail,
} from "../../shared/types/billing.types";
import { PagedResponse, PaginationData } from "../../shared/types/common";

/**
 * Super-admin SaaS billing: plans, tenant subscriptions and subscription invoices.
 */
@Injectable({ providedIn: 'root' })
export class BillingService {
    private readonly http = inject(HttpClient);

    getPlans(includeInactive = false) {
        return this.http.get<PagedResponse<SubscriptionPlan[]>>(BASE_API.BILLING.PLANS, { params: { includeInactive } });
    }

    createPlan(payload: SaveSubscriptionPlanRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.BILLING.PLANS, payload);
    }

    updatePlan(id: string, payload: SaveSubscriptionPlanRequest) {
        return this.http.put<PagedResponse<string>>(BASE_API.BILLING.PLAN(id), payload);
    }

    searchSubscriptions(params: { search?: string; status?: string; pageNumber: number; pageSize: number }) {
        const query: Record<string, string | number> = { pageNumber: params.pageNumber, pageSize: params.pageSize };
        if (params.search) query['search'] = params.search;
        if (params.status) query['status'] = params.status;
        return this.http.get<PagedResponse<PaginationData<TenantSubscription>>>(BASE_API.BILLING.SUBSCRIPTIONS, { params: query });
    }

    getSubscription(hospitalGroupId: string) {
        return this.http.get<PagedResponse<TenantSubscriptionDetail>>(BASE_API.BILLING.SUBSCRIPTION(hospitalGroupId));
    }

    changeSubscription(hospitalGroupId: string, payload: ChangeSubscriptionRequest) {
        return this.http.post<PagedResponse<TenantSubscriptionDetail>>(BASE_API.BILLING.SUBSCRIPTION(hospitalGroupId), payload);
    }

    issueInvoice(hospitalGroupId: string) {
        return this.http.post<PagedResponse<TenantSubscriptionDetail>>(BASE_API.BILLING.ISSUE_INVOICE(hospitalGroupId), {});
    }

    payInvoice(invoiceId: string, paymentReference: string | null) {
        return this.http.post<PagedResponse<string>>(BASE_API.BILLING.PAY_INVOICE(invoiceId), { paymentReference });
    }

    voidInvoice(invoiceId: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.BILLING.VOID_INVOICE(invoiceId), {});
    }
}
