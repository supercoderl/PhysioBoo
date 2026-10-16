import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { PublicService, PublicServiceDetail, PublicServiceFilter, PublicServiceFilterOptions } from "../../shared/types/public-service.types";

/** Service directory of the public website. Pages render their own empty/error states, so no global toast. */
@Injectable({ providedIn: 'root' })
export class PublicServiceService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PublicServiceFilter>) {
        return this.http.post<PagedResponse<PaginationData<PublicService>>>(BASE_API.PUBLIC.SERVICES.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_SERVICE.SEARCH, skipErrorToast: true })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<PublicServiceDetail>>(BASE_API.PUBLIC.SERVICES.DETAIL(id), {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_SERVICE.DETAIL, skipErrorToast: true })
        });
    }

    getFilterOptions() {
        return this.http.get<PagedResponse<PublicServiceFilterOptions>>(BASE_API.PUBLIC.SERVICES.FILTERS, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_SERVICE.FILTERS, skipErrorToast: true })
        });
    }
}
