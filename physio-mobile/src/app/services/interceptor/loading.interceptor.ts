/** Adapted from physio-app/src/app/services/interceptor/loading-interceptor.service.ts as a functional interceptor. Reused as-is: per-key loading-count logic. Dropped: GLOBAL_LOADING full-screen overlay (mobile screens show inline/skeleton loading per key instead). */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LOADING_KEY } from '../../shared/contexts/option.context';
import { LocalLoadingService } from '../common/local-loading.service';

const loadingMap = new Map<string, number>();

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const locLoadingSrv = inject(LocalLoadingService);

    const key = req.context.get(LOADING_KEY);
    if (!key) {
        return next(req);
    }

    increase(key, locLoadingSrv);
    return next(req).pipe(
        finalize(() => decrease(key, locLoadingSrv))
    );
};

function increase(key: string, svc: LocalLoadingService) {
    const count = loadingMap.get(key) ?? 0;
    loadingMap.set(key, count + 1);
    if (count === 0) svc.setLoading(key, true);
}

function decrease(key: string, svc: LocalLoadingService) {
    const count = (loadingMap.get(key) ?? 1) - 1;
    if (count <= 0) {
        loadingMap.delete(key);
        svc.setLoading(key, false);
    } else {
        loadingMap.set(key, count);
    }
}
