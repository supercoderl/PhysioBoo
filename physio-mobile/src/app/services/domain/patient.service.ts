/** Reused from physio-app/src/app/services/admin/patient.service.ts — pure API-facing, no desktop coupling. Search/create/delete dropped (staff-only, not used by the Patient self-service screens). */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { Patient, UpdatePatientRequest } from "../../shared/types/patient.types";
import { createHttpContext } from "../../shared/contexts/option.context";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class PatientService {
    constructor(private http: HttpClient) { }

    /**
     * NOTE (see docs/mobile-app-redesign.md §9): this endpoint is gated by the staff permission
     * `Reception.PatientRead` on the backend today. A PATIENT-role user calling it for their own
     * record will get a 403 until the backend adds self-scoped authorization. Screens using this
     * must handle that 403 as the "not available yet" empty state, not a generic error.
     */
    getById(id: string) {
        return this.http.get<PagedResponse<Patient | null>>(`${BASE_API.PATIENT.BASE}/${id}`, {
            context: createHttpContext({ loadingKey: LoadingKeys.PATIENT.GET_BY_ID, skipErrorToast: true })
        });
    }

    update(id: string, params: UpdatePatientRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.PATIENT.BASE}/${id}`, params, {
            context: createHttpContext({ loadingKey: LoadingKeys.PATIENT.UPDATE })
        });
    }
}
