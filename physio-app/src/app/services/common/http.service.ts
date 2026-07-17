import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, Observable, of } from "rxjs";
import { createHttpContext } from "../../shared/contexts/option.context";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKey } from "../../shared/types/loading";

@Injectable({ providedIn: 'root' })
export class HttpService {
    // #region Inject Methods
    private readonly http = inject(HttpClient);
    // #endregion

    public getOr<T>(url: string, fallback: T, key: LoadingKey): Observable<PagedResponse<T>> {
        return this.http.get<PagedResponse<T>>(url, {
            context: createHttpContext({
                loadingKey: key,
                skipErrorToast: true
            })
        }).pipe(
            catchError(() => of({ success: true, data: fallback, detailedErrors: [], errors: null } as PagedResponse<T>)),
        );
    }

    public postOr<T>(url: string, body: unknown, fallback: T, key: LoadingKey): Observable<PagedResponse<T>> {
        return this.http.post<PagedResponse<T>>(url, body, {
            context: createHttpContext({
                loadingKey: key,
                skipErrorToast: true
            })
        }).pipe(
            catchError(() => of({ success: true, data: fallback, detailedErrors: [], errors: null } as PagedResponse<T>)),
        );
    }

    public patchOr<T>(url: string, body: any, fallback: T, key: LoadingKey): Observable<PagedResponse<T>> {
        return this.http.patch<PagedResponse<T>>(url, body, {
            context: createHttpContext({
                skipErrorToast: true,
                loadingKey: key
            })
        }).pipe(
            catchError(() => of({ success: true, data: fallback } as PagedResponse<T>)),
        );
    }

    public putOr<T>(url: string, body: any, fallback: T, key: LoadingKey): Observable<PagedResponse<T>> {
        return this.http.put<PagedResponse<T>>(url, body, {
            context: createHttpContext({
                skipErrorToast: true,
                loadingKey: key
            })
        }).pipe(
            catchError(() => of({ success: true, data: fallback } as PagedResponse<T>)),
        );
    }
}

