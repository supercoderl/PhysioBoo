import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import {
  BillingSummary,
  ClinicalNoteRow,
  ClinicalSnapshot,
  DiagnosisRow,
  EncounterRow,
  HistoricalSummary,
  ImagingStudyRow,
  LabReportRow,
  LabResultRow,
  PatientAllergy,
  PatientContext,
  PatientDemographics,
  PrescriptionRow,
} from "../../shared/types/medical-record.types";
import { createHttpContext } from "../../shared/contexts/option.context";

@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Methods
  getContext(patientId: string) {
    return this.http.get<PagedResponse<PatientContext>>(BASE_API.MEDICAL_RECORD.CONTEXT(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.CONTEXT }) });
  }
  getSnapshot(patientId: string) {
    return this.http.get<PagedResponse<ClinicalSnapshot>>(BASE_API.MEDICAL_RECORD.SNAPSHOT(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.SNAPSHOT }) });
  }
  getDemographics(patientId: string) {
    return this.http.get<PagedResponse<PatientDemographics>>(BASE_API.MEDICAL_RECORD.DEMOGRAPHICS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.DEMOGRAPHICS }) });
  }
  getHistory(patientId: string) {
    return this.http.get<PagedResponse<HistoricalSummary>>(BASE_API.MEDICAL_RECORD.HISTORY(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.HISTORY }) });
  }
  getAllergies(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<PatientAllergy>>>(BASE_API.MEDICAL_RECORD.ALLERGIES(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.ALLERGIES }) });
  }
  getEncounters(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<EncounterRow>>>(BASE_API.MEDICAL_RECORD.ENCOUNTERS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.ENCOUNTERS }) });
  }
  getDiagnoses(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<DiagnosisRow>>>(BASE_API.MEDICAL_RECORD.DIAGNOSES(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.DIAGNOSES }) });
  }
  getPrescriptions(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<PrescriptionRow>>>(BASE_API.MEDICAL_RECORD.PRESCRIPTIONS(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.PRESCRIPTIONS }) });
  }
  getLab(patientId: string) {
    return this.http.get<PagedResponse<{ results: LabResultRow[]; reports: LabReportRow[] }>>(BASE_API.MEDICAL_RECORD.LAB(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.LAB }) });
  }
  getImaging(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<ImagingStudyRow>>>(BASE_API.MEDICAL_RECORD.IMAGING(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.IMAGING }) });
  }
  getNotes(patientId: string) {
    return this.http.get<PagedResponse<PaginationData<ClinicalNoteRow>>>(BASE_API.MEDICAL_RECORD.NOTES(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.NOTES }) });
  }
  getBilling(patientId: string) {
    return this.http.get<PagedResponse<BillingSummary>>(BASE_API.MEDICAL_RECORD.BILLING(patientId), { context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.BILLING }) });
  }
  // #endregion
}
