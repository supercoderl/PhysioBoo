import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { ImagingModalityFilter } from "../../shared/types/filter.types";
import { ImagingModality } from "../../shared/types/laboratory-imaging.types";

@Injectable({ providedIn: 'root' })
export class ImagingModalityService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ImagingModalityFilter>) {
        return this.http.post<PagedResponse<PaginationData<ImagingModality>>>(BASE_API.IMAGINGMODALITY.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<ImagingModality | null>>(`${BASE_API.IMAGINGMODALITY.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.IMAGINGMODALITY.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.IMAGINGMODALITY.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.IMAGINGMODALITY.BASE}/${id}`);
    }
}
