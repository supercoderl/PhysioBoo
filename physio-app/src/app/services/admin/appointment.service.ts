import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { AppointmentFilter, AppointmentRecord, AppointmentStatus, CompleteConsultationRequest } from "../../shared/types/appointment.types";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";

// Order must match PhysioBoo.Domain.Enums.AppointmentStatus on the backend (serialized as its numeric index).
const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = [
    'Scheduled', 'Confirmed', 'CheckedIn', 'InProgress', 'Completed', 'Cancelled', 'NoShow', 'Rescheduled'
];

@Injectable({ providedIn: 'root' })
export class AppointmentService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<AppointmentFilter>) {
        return this.http.post<PagedResponse<PaginationData<AppointmentRecord>>>(BASE_API.APPOINTMENT.SEARCH, request);
    }

    updateStatus(id: string, status: AppointmentStatus) {
        return this.http.patch<void>(BASE_API.APPOINTMENT.STATUS(id), { status: APPOINTMENT_STATUS_ORDER.indexOf(status) });
    }

    completeConsultation(id: string, data: CompleteConsultationRequest) {
        return this.http.patch<PagedResponse<void>>(
            `${BASE_API.APPOINTMENT.BASE}/${id}/complete`, data
        );
    }
}
