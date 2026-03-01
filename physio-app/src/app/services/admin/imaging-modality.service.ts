import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { ImagingModality } from "../../shared/types/laboratory-imaging";
import { BASE_API } from "../../shared/api/base";
import { ImagingModalityFilter } from "../../shared/types/filter";

@Injectable({ providedIn: 'root' })
export class ImagingModalityService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ImagingModalityFilter>) {
        return this.http.post<PagedResponse<PaginationData<ImagingModality>>>(BASE_API.IMAGINGMODALITY.SEARCH, request);
    }

    search_by_id(params: { id: string }) {
        return this.http.post<PagedResponse<ImagingModality | null>>(BASE_API.IMAGINGMODALITY.SEARCH_BY_ID, params);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.IMAGINGMODALITY.CREATE, params);
    }

    update(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.IMAGINGMODALITY.UPDATE, params);
    }

    delete(id: string, isHard: boolean = false) {
        return this.http.post<PagedResponse<string>>(BASE_API.IMAGINGMODALITY.DELETE, {
            id, isHard
        });
    }
}