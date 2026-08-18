import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import {
  AuditLogEntry,
  ClaimDocument,
  ClaimNote,
  ClaimTimelineEvent,
  CommunicationMessage,
  CreateInsuranceClaimRequest,
  InsuranceClaimCard,
  InsuranceClaimDetail,
  InsuranceClaimStats,
  InsuranceProviderNode,
} from "../../shared/types/insurance-claims.types";
import { LoadingKeys } from "../../shared/types/loading";

/**
 * Insurance Claims data layer. Every method calls the live REST endpoint (see
 * docs/insurance-claims-redesign.md §9). Failures propagate to the caller — no
 * mock-data fallback — and the global HTTP interceptor surfaces an error toast.
 */
@Injectable({ providedIn: 'root' })
export class InsuranceClaimsService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getStats() {
    return this.http.get<PagedResponse<InsuranceClaimStats>>(BASE_API.INSURANCE_CLAIMS.STATS, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.STATS }) });
  }

  getProvidersTree() {
    return this.http.get<PagedResponse<InsuranceProviderNode[]>>(BASE_API.INSURANCE_CLAIMS.PROVIDERS_TREE, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.PROVIDERS_TREE }) });
  }

  getClaims() {
    return this.http.get<PagedResponse<PaginationData<InsuranceClaimCard>>>(BASE_API.INSURANCE_CLAIMS.CLAIMS_SEARCH, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIMS_SEARCH }) });
  }

  getClaimDetail(claimId: string) {
    return this.http.get<PagedResponse<InsuranceClaimDetail>>(BASE_API.INSURANCE_CLAIMS.CLAIM_DETAIL(claimId), { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_DETAIL }) });
  }

  createClaim(payload: CreateInsuranceClaimRequest) {
    return this.http.post<PagedResponse<InsuranceClaimDetail>>(BASE_API.INSURANCE_CLAIMS.CLAIM_CREATE, payload, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_CREATE }) });
  }

  submitClaim(claimId: string, notes?: string) {
    return this.http.post<PagedResponse<InsuranceClaimCard>>(BASE_API.INSURANCE_CLAIMS.CLAIM_SUBMIT(claimId), { notes }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_SUBMIT }) });
  }

  approveClaim(claimId: string, approvedAmount: number, notes?: string) {
    return this.http.post<PagedResponse<InsuranceClaimCard>>(BASE_API.INSURANCE_CLAIMS.CLAIM_APPROVE(claimId), { approvedAmount, notes }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_APPROVE }) });
  }

  rejectClaim(claimId: string, reason: string) {
    return this.http.post<PagedResponse<InsuranceClaimCard>>(BASE_API.INSURANCE_CLAIMS.CLAIM_REJECT(claimId), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_REJECT }) });
  }

  appealClaim(claimId: string, groundsForAppeal: string) {
    return this.http.post<PagedResponse<InsuranceClaimCard>>(BASE_API.INSURANCE_CLAIMS.CLAIM_APPEAL(claimId), { groundsForAppeal }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_APPEAL }) });
  }

  settleClaim(claimId: string, settledAmount: number, settlementDate: string, method: string) {
    return this.http.post<PagedResponse<InsuranceClaimCard>>(BASE_API.INSURANCE_CLAIMS.CLAIM_SETTLE(claimId), { settledAmount, settlementDate, method }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.CLAIM_SETTLE }) });
  }

  uploadDocument(claimId: string, file: File, documentType: string) {
    const form = new FormData();
    form.append('claimId', claimId);
    form.append('documentType', documentType);
    form.append('file', file);
    return this.http.post<PagedResponse<ClaimDocument>>(BASE_API.INSURANCE_CLAIMS.UPLOAD, form, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.UPLOAD }) });
  }

  getTimeline(claimId: string) {
    return this.http.get<PagedResponse<ClaimTimelineEvent[]>>(BASE_API.INSURANCE_CLAIMS.TIMELINE(claimId), { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.TIMELINE }) });
  }

  getNotes(claimId: string) {
    return this.http.get<PagedResponse<ClaimNote[]>>(BASE_API.INSURANCE_CLAIMS.NOTES(claimId), { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.NOTES }) });
  }

  addNote(claimId: string, message: string) {
    return this.http.post<PagedResponse<ClaimNote>>(BASE_API.INSURANCE_CLAIMS.NOTES(claimId), { message }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.NOTES }) });
  }

  getCommunication(claimId: string) {
    return this.http.get<PagedResponse<CommunicationMessage[]>>(BASE_API.INSURANCE_CLAIMS.COMMUNICATION(claimId), { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.COMMUNICATION }) });
  }

  sendMessage(claimId: string, message: string) {
    return this.http.post<PagedResponse<CommunicationMessage>>(BASE_API.INSURANCE_CLAIMS.COMMUNICATION(claimId), { message, direction: 'Outbound' }, { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.COMMUNICATION }) });
  }

  getAuditLogs(claimId: string) {
    return this.http.get<PagedResponse<AuditLogEntry[]>>(BASE_API.INSURANCE_CLAIMS.AUDIT_LOGS(claimId), { context: createHttpContext({ loadingKey: LoadingKeys.INSURANCE_CLAIMS.AUDIT_LOGS }) });
  }
  // #endregion
}
