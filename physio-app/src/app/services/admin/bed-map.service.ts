import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { AssignPatientRequest, Bed, BedHistoryEntry, DischargeRequest } from "../../shared/types/bed.types";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { BedFilter } from "../../shared/types/filter.types";
import { BedMapSnapshot, BedMapStats, Ward } from "../../shared/types/ward.types";

@Injectable({ providedIn: 'root' })
export class BedMapService {
    constructor(private http: HttpClient) { }

    wards() {
        return this.http.get<PagedResponse<Ward[]>>(BASE_API.BED_MAP.WARDS);
    }

    snapshot() {
        return this.http.get<PagedResponse<BedMapSnapshot>>(BASE_API.BED_MAP.SNAPSHOT);
    }

    stats() {
        return this.http.get<PagedResponse<BedMapStats>>(BASE_API.BED_MAP.STATS);
    }

    search(request: PagedRequest<BedFilter>) {
        return this.http.post<PagedResponse<PaginationData<Bed>>>(BASE_API.BED_MAP.SEARCH, request);
    }

    search_by_id(bedId: string) {
        return this.http.get<PagedResponse<Bed | null>>(BASE_API.BED_MAP.BED_BY_ID(bedId));
    }

    assign(bedId: string, params: AssignPatientRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.BED_MAP.ASSIGN(bedId), params);
    }

    discharge(bedId: string, params: DischargeRequest) {
        return this.http.post<PagedResponse<string>>(BASE_API.BED_MAP.DISCHARGE(bedId), params);
    }

    history(bedId: string) {
        return this.http.get<PagedResponse<BedHistoryEntry[]>>(BASE_API.BED_MAP.HISTORY(bedId));
    }
}
