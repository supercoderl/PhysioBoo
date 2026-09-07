/** Ported verbatim from physio-app/src/app/shared/contexts/option.context.ts. */
import { HttpContext, HttpContextToken } from "@angular/common/http";
import { LoadingKey } from "../types/loading";

export const LOADING_KEY = new HttpContextToken<string | null>(() => null);
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

export interface HttpContextOptions {
    loadingKey?: LoadingKey;
    skipErrorToast?: boolean;
}

export function createHttpContext(options: HttpContextOptions) {
    let context = new HttpContext();

    if (options.loadingKey) {
        context = context.set(LOADING_KEY, options.loadingKey);
    }

    if (options.skipErrorToast) {
        context = context.set(SKIP_ERROR_TOAST, true);
    }

    return context;
}
