import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedResponse } from "../../shared/types/common";
import { AudienceSegment } from "../../shared/types/audience-segment.types";

@Injectable({ providedIn: 'root' })
export class AudienceSegmentService {
    constructor(private http: HttpClient) { }

    lookup() {
        return this.http.get<PagedResponse<AudienceSegment[]>>(BASE_API.AUDIENCE_SEGMENT.LOOKUP);
    }
}
