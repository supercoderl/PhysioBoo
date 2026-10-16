import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { PublicAppointmentRequest, PublicAppointmentRequestResult, PublicDoctor, PublicDoctorDetail, PublicDoctorFilter, PublicDoctorFilterOptions } from "../../shared/types/public-doctor.types";

/** Doctor directory of the public website. Pages render their own empty/error states, so no global toast. */
@Injectable({ providedIn: 'root' })
export class PublicDoctorService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PublicDoctorFilter>) {
        return this.http.post<PagedResponse<PaginationData<PublicDoctor>>>(BASE_API.PUBLIC.DOCTORS.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_DOCTOR.SEARCH, skipErrorToast: true })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<PublicDoctorDetail>>(BASE_API.PUBLIC.DOCTORS.DETAIL(id), {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_DOCTOR.DETAIL, skipErrorToast: true })
        });
    }

    getRelated(id: string) {
        return this.http.get<PagedResponse<PublicDoctor[]>>(BASE_API.PUBLIC.DOCTORS.RELATED(id), {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_DOCTOR.RELATED, skipErrorToast: true })
        });
    }

    requestAppointment(doctorId: string, request: PublicAppointmentRequest) {
        return this.http.post<PagedResponse<PublicAppointmentRequestResult>>(BASE_API.PUBLIC.DOCTORS.APPOINTMENT_REQUEST(doctorId), request, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_DOCTOR.APPOINTMENT_REQUEST, skipErrorToast: true })
        });
    }

    getFilterOptions() {
        return this.http.get<PagedResponse<PublicDoctorFilterOptions>>(BASE_API.PUBLIC.DOCTORS.FILTERS, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_DOCTOR.FILTERS, skipErrorToast: true })
        });
    }
}
