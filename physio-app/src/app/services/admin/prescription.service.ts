import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
    CdsCheckRequest,
    CdsCheckResult,
    MedicineSearchResult,
    PatientPrescriptionRow,
    Prescription,
    UpdatePrescriptionRequest,
} from "../../shared/types/prescription-rx.types";

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  /** Loads and mutations report their own errors in the page, so the global error toast is skipped for loads only. */
  get(id: string) {
    return this.http.get<PagedResponse<Prescription>>(BASE_API.PRESCRIPTION_RX.BY_ID(id), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.GET, skipErrorToast: true }) });
  }

  update(request: UpdatePrescriptionRequest) {
    return this.http.put<PagedResponse<string>>(BASE_API.PRESCRIPTION_RX.BY_ID(request.id), request, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.SAVE }) });
  }

  issue(id: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.PRESCRIPTION_RX.ISSUE(id), null, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.ISSUE }) });
  }

  cancel(id: string, reason: string) {
    return this.http.post<PagedResponse<string>>(BASE_API.PRESCRIPTION_RX.CANCEL(id), { reason }, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.CANCEL }) });
  }

  checkWarnings(request: CdsCheckRequest) {
    return this.http.post<PagedResponse<CdsCheckResult>>(BASE_API.PRESCRIPTION_RX.CDS_CHECK, request, { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.CDS_CHECK }) });
  }

  searchMedicines(search: string) {
    const params = new HttpParams().set('search', search).set('pageNumber', 1).set('pageSize', 15);
    return this.http.get<PagedResponse<PaginationData<MedicineSearchResult>>>(BASE_API.PRESCRIPTION_RX.MEDICINE_SEARCH, { params, context: createHttpContext({ loadingKey: LoadingKeys.MEDICINE.SEARCH, skipErrorToast: true }) });
  }

  getPatientPrescriptions(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<PatientPrescriptionRow>>>(BASE_API.PRESCRIPTION_RX.PATIENT_PRESCRIPTIONS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.PRESCRIPTION.LIST, skipErrorToast: true }) });
  }
  // #endregion
}
