/** Reused from physio-app/src/app/services/admin/article.service.ts — pure API-facing, no desktop coupling. Write/delete methods dropped (not used by Guest/Patient). */
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { Article, ArticleFilter } from "../../shared/types/article.types";
import { createHttpContext } from "../../shared/contexts/option.context";
import { LoadingKeys } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class ArticleService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<ArticleFilter>) {
        return this.http.post<PagedResponse<PaginationData<Article>>>(BASE_API.ARTICLE.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.ARTICLE.SEARCH })
        });
    }

    getById(id: string) {
        return this.http.get<PagedResponse<Article | null>>(`${BASE_API.ARTICLE.BASE}/${id}`, {
            context: createHttpContext({ loadingKey: LoadingKeys.ARTICLE.GET_BY_ID })
        });
    }
}
