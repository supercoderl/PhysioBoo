import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedRequest, PagedResponse, PaginationData } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";
import { PublicArticle, PublicArticleFilter } from "../../shared/types/public-article.types";

/** Articles on the public website. Pages render their own empty/error states, so no global toast. */
@Injectable({ providedIn: 'root' })
export class PublicArticleService {
    constructor(private http: HttpClient) { }

    search(request: PagedRequest<PublicArticleFilter>) {
        return this.http.post<PagedResponse<PaginationData<PublicArticle>>>(BASE_API.PUBLIC.ARTICLES.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_ARTICLE.SEARCH, skipErrorToast: true })
        });
    }

    /** Data is null for missing, draft and archived articles. */
    getById(id: string) {
        return this.http.get<PagedResponse<PublicArticle | null>>(BASE_API.PUBLIC.ARTICLES.DETAIL(id), {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_ARTICLE.DETAIL, skipErrorToast: true })
        });
    }

    /** Up to `count` of the latest published articles in the category, without the current one. */
    related(article: Pick<PublicArticle, 'id' | 'category'>, count = 3) {
        const request: PagedRequest<PublicArticleFilter> = {
            pageNumber: 1,
            pageSize: count + 1,
            sort: '-publishDate',
            filter: { start: '', end: '', category: article.category, status: null }
        };
        return this.http.post<PagedResponse<PaginationData<PublicArticle>>>(BASE_API.PUBLIC.ARTICLES.SEARCH, request, {
            context: createHttpContext({ loadingKey: LoadingKeys.PUBLIC_ARTICLE.RELATED, skipErrorToast: true })
        }).pipe(
            map(res => (res.data?.items ?? []).filter(a => a.id !== article.id).slice(0, count))
        );
    }
}
