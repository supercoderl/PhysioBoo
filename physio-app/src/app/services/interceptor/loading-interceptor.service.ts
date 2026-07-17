import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { GLOBAL_LOADING, LOADING_KEY } from "../../shared/contexts/option.context";
import { GlobalLoadingService } from "../common/global-loading.service";
import { LocalLoadingService } from "../common/local-loading.service";
@Injectable({
    providedIn: 'root'
})
export class HttpLoadingInterceptor implements HttpInterceptor {
    private loadingMap = new Map<string, number>();

    constructor(
        private locLoadingSrv: LocalLoadingService,
        private gloLoadingSrv: GlobalLoadingService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.context.get(GLOBAL_LOADING)) {
            this.gloLoadingSrv.show();

            return next.handle(req).pipe(
                finalize(() => {
                    setTimeout(this.gloLoadingSrv.forceSkipLoading, 1200);
                })
            );
        }

        const key = req.context.get(LOADING_KEY);
        if (!key) {
            return next.handle(req);
        }

        this.increase(key);
        return next.handle(req).pipe(
            finalize(() => this.decrease(key))
        );
    }

    private increase(key: string) {
        const count = this.loadingMap.get(key) ?? 0;

        this.loadingMap.set(key, count + 1);

        if (count === 0) {
            this.locLoadingSrv.setLoading(key, true);
        }
    }

    private decrease(key: string) {
        const count = (this.loadingMap.get(key) ?? 1) - 1;

        if (count <= 0) {
            this.loadingMap.delete(key);
            this.locLoadingSrv.setLoading(key, false);
        } else {
            this.loadingMap.set(key, count);
        }
    }
}