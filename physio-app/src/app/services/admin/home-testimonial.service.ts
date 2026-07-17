import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { TestimonialFilter } from "../../shared/types/filter.types";
import { Testimonial } from "../../shared/types/testimonial.types";

@Injectable({ providedIn: 'root' })
export class HomeTestimonialService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<TestimonialFilter>) {
        return this.http.post<PagedResponse<PaginationData<Testimonial>>>(BASE_API.HOME_TESTIMONIAL.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Testimonial | null>>(`${BASE_API.HOME_TESTIMONIAL.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.HOME_TESTIMONIAL.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.HOME_TESTIMONIAL.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.HOME_TESTIMONIAL.BASE}/${id}`);
    }
}
