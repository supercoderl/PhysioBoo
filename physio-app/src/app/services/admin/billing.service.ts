import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import {
    BillingSummary,
    ChangeSubscriptionRequest,
    SaveSubscriptionPlanRequest,
    SubscriptionPlan,
    TenantSubscription,
    TenantSubscriptionDetail,
} from "../../shared/types/billing.types";
import { PagedResponse, PaginationData } from "../../shared/types/common";

/**
 * SaaS billing. Super-admin: plans, every tenant's subscription and invoices.
 * Tenant self-service (Settings > Billing): the `my*` methods, always scoped to the caller's tenant.
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

    /**
     * Placeholder until `GET /api/billing/summary` exists (see docs/superadmin-billing-redesign.md §12):
     * sums the first page of up to 100 tenants, so `partial` flags when more tenants exist.
     */
    getSummary(): Observable<BillingSummary> {
        return this.searchSubscriptions({ pageNumber: 1, pageSize: 100 }).pipe(
            map(res => {
                const data = res.success ? res.data : null;
                const items = data?.items ?? [];
                const tenants = data?.totalCount ?? 0;
                return {
                    tenants,
                    monthlyRecurring: items
                        .filter(t => t.status === 'Active' || t.status === 'PastDue')
                        .reduce((sum, t) => sum + t.monthlyPrice, 0),
                    pastDue: items.filter(t => t.status === 'PastDue').length,
                    outstanding: items.reduce((sum, t) => sum + t.outstandingAmount, 0),
                    partial: tenants > items.length
                };
            })
        );
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

    getMySubscription() {
        return this.http.get<PagedResponse<TenantSubscriptionDetail | null>>(BASE_API.BILLING.MY_SUBSCRIPTION);
    }

    getMyPlans() {
        return this.http.get<PagedResponse<SubscriptionPlan[]>>(BASE_API.BILLING.MY_PLANS);
    }

    changeMyPlan(planId: string) {
        return this.http.post<PagedResponse<TenantSubscriptionDetail | null>>(BASE_API.BILLING.MY_CHANGE_PLAN, { planId });
    }

    cancelMySubscription() {
        return this.http.post<PagedResponse<TenantSubscriptionDetail | null>>(BASE_API.BILLING.MY_CANCEL, {});
    }

    downloadMyInvoice(invoiceId: string) {
        return this.http.get(BASE_API.BILLING.MY_INVOICE_DOWNLOAD(invoiceId), { responseType: 'blob' });
    }
}
