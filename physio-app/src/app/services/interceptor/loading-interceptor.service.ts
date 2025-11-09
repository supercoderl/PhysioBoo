import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { finalize, Observable } from "rxjs";
import { LoadingService } from "../common/loading.service";

@Injectable({
    providedIn: 'root'
})
export class HttpLoadingInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];

    constructor(private loading: LoadingService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.requests.push(req);
        this.loading.show();

        return next.handle(req).pipe(
            finalize(() => {
                this.requests = this.requests.filter(x => x !== req);
                if (this.requests.length === 0) this.loading.hide();
            })
        );
    }
}