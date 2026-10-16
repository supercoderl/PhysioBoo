import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { PublicHospital, PublicHospitalDetail, PublicHospitalFilter } from "../../shared/types/public-hospital.types";

/** Clinic directory of the public website. Pages render their own empty/error states, so no global toast. */
@Injectable({ providedIn: 'root' })
export class PublicHospitalService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PublicHospitalFilter>) {
        return this.http.post<PagedResponse<PaginationData<PublicHospital>>>(BASE_API.PUBLIC.HOSPITALS.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_HOSPITAL.SEARCH, skipErrorToast: true })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<PublicHospitalDetail>>(BASE_API.PUBLIC.HOSPITALS.DETAIL(id), {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_HOSPITAL.DETAIL, skipErrorToast: true })
        });
    }
}
