import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { ServiceFilter } from "../../shared/types/filter.types";
import { CreateServiceRequest, MedicalService, ServiceStats, UpdateServiceRequest } from "../../shared/types/service.types";

@Injectable({ providedIn: 'root' })
export class MedicalServiceService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ServiceFilter>) {
        return this.http.post<PagedResponse<PaginationData<MedicalService>>>(BASE_API.MEDICAL_SERVICE.SEARCH, request);
    }

    stats() {
        return this.http.get<PagedResponse<ServiceStats>>(BASE_API.MEDICAL_SERVICE.STATS);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<MedicalService | null>>(`${BASE_API.MEDICAL_SERVICE.BASE}/${id}`);
    }

    create(params: CreateServiceRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.BASE, params);
    }

    update(id: string, params: UpdateServiceRequest) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.MEDICAL_SERVICE.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.MEDICAL_SERVICE.BASE}/${id}`);
    }

    archive(id: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.ARCHIVE(id), null);
    }

    restore(id: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.RESTORE(id), null);
    }

    publish(id: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.PUBLISH(id), null);
    }

    duplicate(id: string) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.DUPLICATE(id), null);
    }

    bulkArchive(ids: string[]) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.BULK_ARCHIVE, { ids });
    }

    bulkDelete(ids: string[]) {
        return this.http.post<PagedResponse<string>>(BASE_API.MEDICAL_SERVICE.BULK_DELETE, { ids });
    }

    export(request: PagedRequest<ServiceFilter>) {
        return this.http.post(BASE_API.MEDICAL_SERVICE.EXPORT, request, { responseType: 'blob' });
    }
}
