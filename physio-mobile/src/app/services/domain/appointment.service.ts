/** Reused from physio-app/src/app/services/admin/appointment.service.ts — pure API-facing, no desktop coupling. */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { AppointmentFilter, AppointmentRecord, CreateAppointmentRequest } from "../../shared/types/appointment.types";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { createHttpContext } from "../../shared/contexts/option.context";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    constructor(private http: HttpClient) { }

    /**
     * NOTE (see docs/mobile-app-redesign.md §9): gated by the staff permission
     * `Scheduling.AppointmentRead` today — a PATIENT-role user's own appointments will 403 until the
     * backend adds self-scoped authorization. Handle 403 as the "not available yet" empty state.
     */
    search(request: PagedRequest<AppointmentFilter>) {
        return this.http.post<PagedResponse<PaginationData<AppointmentRecord>>>(BASE_API.APPOINTMENT.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.APPOINTMENT.SEARCH, skipErrorToast: true })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<AppointmentRecord | null>>(`${BASE_API.APPOINTMENT.BASE}/${id}`, {
            context: createHttpContext({ loadingKey: LoadingKeys.APPOINTMENT.GET_BY_ID, skipErrorToast: true })
        });
    }

    create(request: CreateAppointmentRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.APPOINTMENT.BASE, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.APPOINTMENT.CREATE })
        });
    }
}
