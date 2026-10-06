import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
    AddFavoriteMedicationRequest,
    ClinicalWarning,
    CreatePrescriptionTemplateRequest,
    FavoriteMedication,
    MedicineCatalogItem,
    PrescriptionDraft,
    PrescriptionSummaryTotals,
    PrescriptionTemplate,
    RecentPrescriptionSummary,
    RxMedicationItem,
} from "../../shared/types/prescription-rx.types";

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getDraft(prescriptionId: string) {
    return this.http.get<PagedResponse<PrescriptionDraft>>(BASE_API.PRESCRIPTION_RX.DRAFT(prescriptionId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.GET_DRAFT }) });
  }

  saveDraft(draft: PrescriptionDraft) {
    return this.http.put<PagedResponse<PrescriptionDraft>>(BASE_API.PRESCRIPTION_RX.UPDATE(draft.id), draft, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.SAVE_DRAFT }) });
  }

  issue(draft: PrescriptionDraft) {
    return this.http.post<PagedResponse<PrescriptionDraft>>(BASE_API.PRESCRIPTION_RX.ISSUE(draft.id), draft, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.ISSUE }) });
  }

  cancel(draft: PrescriptionDraft, reason: string) {
    return this.http.post<PagedResponse<PrescriptionDraft>>(BASE_API.PRESCRIPTION_RX.CANCEL(draft.id), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.CANCEL }) });
  }

  searchMedicines(query: string) {
    const url = `${BASE_API.PRESCRIPTION_RX.MEDICINE_SEARCH}?query=${encodeURIComponent(query)}`;
    return this.http.get<PagedResponse<MedicineCatalogItem[]>>(url, { context: createHttpContext({ loadingKey: LoadingKeys.MEDICINE.SEARCH }) });
  }

  checkClinicalWarnings(patientId: string, items: RxMedicationItem[]) {
    return this.http.post<PagedResponse<Record<string, ClinicalWarning[]>>>(
      BASE_API.PRESCRIPTION_RX.CDS_CHECK,
      { patientId, items },
      { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.CDS_CHECK }) }
    );
  }

  getCostEstimate(prescriptionId: string, items: RxMedicationItem[]) {
    return this.http.post<PagedResponse<PrescriptionSummaryTotals>>(
      BASE_API.PRESCRIPTION_RX.COST_ESTIMATE(prescriptionId),
      { items },
      { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.COST_ESTIMATE }) }
    );
  }

  getRecentPrescriptions(patientId: string) {
    return this.http.get<PagedResponse<RecentPrescriptionSummary[]>>(BASE_API.PRESCRIPTION_RX.RECENT(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.RECENT }) });
  }

  getFavorites(doctorId: string) {
    return this.http.get<PagedResponse<FavoriteMedication[]>>(BASE_API.PRESCRIPTION_RX.FAVORITES(doctorId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.FAVORITES }) });
  }

  addFavorite(doctorId: string, payload: AddFavoriteMedicationRequest) {
    return this.http.post<PagedResponse<FavoriteMedication | null>>(BASE_API.PRESCRIPTION_RX.FAVORITES(doctorId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.FAVORITES }) });
  }

  removeFavorite(doctorId: string, favoriteId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.PRESCRIPTION_RX.FAVORITE_DELETE(doctorId, favoriteId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.FAVORITES }) });
  }

  createTemplate(payload: CreatePrescriptionTemplateRequest) {
    return this.http.post<PagedResponse<PrescriptionTemplate | null>>(BASE_API.PRESCRIPTION_RX.TEMPLATE_CREATE, payload, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.TEMPLATES }) });
  }

  deleteTemplate(templateId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.PRESCRIPTION_RX.TEMPLATE_DELETE(templateId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.TEMPLATES }) });
  }

  getTemplates(doctorId: string) {
    return this.http.get<PagedResponse<PrescriptionTemplate[]>>(BASE_API.PRESCRIPTION_RX.TEMPLATES(doctorId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.TEMPLATES }) });
  }

  // #endregion
}
