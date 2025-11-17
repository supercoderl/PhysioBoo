import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { GlobalLoadingService } from "../common/global-loading.service";
import { LocalLoadingService } from "../common/local-loading.service";

@Injectable({
    providedIn: 'root'
})
export class HttpLoadingInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];

    constructor(
        private locLoadingSrv: LocalLoadingService,
        private gloLoadingSrv: GlobalLoadingService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.requests.push(req);
        if (req.headers.has('X-Global-Loading')) {
            this.gloLoadingSrv.show();
            
            return next.handle(req).pipe(
                finalize(() => {
                    this.requests = this.requests.filter(x => x !== req);
                    setTimeout(() => {
                        this.gloLoadingSrv.forceSkipLoading();
                    }, 1200);
                })
            );
        }

        const url = req.url.split('?')[0];
        const parts = url.split('/').filter(x => x);
        const key = parts[parts.length - 1];
        this.locLoadingSrv.setLoading(key, true);

        return next.handle(req).pipe(
            finalize(() => {
                this.requests = this.requests.filter(x => x !== req);
                if (this.requests.length === 0) this.locLoadingSrv.setLoading(key, false);
            })
        );
    }
}