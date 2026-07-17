import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { Article } from "../../shared/types/article.types";
import { ArticleFilter } from "../../shared/types/filter.types";

@Injectable({ providedIn: 'root' })
export class ArticleService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ArticleFilter>) {
        return this.http.post<PagedResponse<PaginationData<Article>>>(BASE_API.ARTICLE.SEARCH, request);
    }

    search_by_id(id: string) {
        return this.http.get<PagedResponse<Article | null>>(`${BASE_API.ARTICLE.BASE}/${id}`);
    }

    create(params: any) {
        return this.http.post<PagedResponse<string>>(BASE_API.ARTICLE.BASE, params);
    }

    update(id: string, params: any) {
        return this.http.patch<PagedResponse<string>>(`${BASE_API.ARTICLE.BASE}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete<PagedResponse<string>>(`${BASE_API.ARTICLE.BASE}/${id}`);
    }
}
