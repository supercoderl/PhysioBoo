/** Reused (trimmed to read-only self-view queries) from physio-app/src/app/services/admin/medical-record.service.ts — pure API-facing, no desktop coupling. */
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { BillingSummary, HistoricalSummary, ImagingStudyRow, LabReportRow, LabResultRow, PrescriptionRow } from "../../shared/types/medical-record.types";
import { createHttpContext } from "../../shared/contexts/option.context";

/** NOTE (see docs/mobile-app-redesign.md §9): every method here is gated by staff permissions today; a PATIENT-role user's own record will 403 until the backend adds self-scoped authorization. */
@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
    private readonly http = inject(HttpClient);

    getHistory(patientId: string) {
        return this.http.get<PagedResponse<HistoricalSummary>>(BASE_API.MEDICAL_RECORD.HISTORY(patientId), {
            context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.HISTORY, skipErrorToast: true })
        });
    }

    getPrescriptions(patientId: string) {
        return this.http.get<PagedResponse<PrescriptionRow[]>>(BASE_API.MEDICAL_RECORD.PRESCRIPTIONS(patientId), {
            context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.PRESCRIPTIONS, skipErrorToast: true })
        });
    }

    getLab(patientId: string) {
        return this.http.get<PagedResponse<{ results: LabResultRow[]; reports: LabReportRow[] }>>(BASE_API.MEDICAL_RECORD.LAB(patientId), {
            context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.LAB, skipErrorToast: true })
        });
    }

    getImaging(patientId: string) {
        return this.http.get<PagedResponse<ImagingStudyRow[]>>(BASE_API.MEDICAL_RECORD.IMAGING(patientId), {
            context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.IMAGING, skipErrorToast: true })
        });
    }

    getBilling(patientId: string) {
        return this.http.get<PagedResponse<BillingSummary>>(BASE_API.MEDICAL_RECORD.BILLING(patientId), {
            context: createHttpContext({ loadingKey: LoadingKeys.MEDICAL_RECORD.BILLING, skipErrorToast: true })
        });
    }
}
