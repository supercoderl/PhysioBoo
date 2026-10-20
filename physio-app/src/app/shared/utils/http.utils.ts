import { isDevMode } from '@angular/core';
import { HttpParams } from '@angular/common/http';

export function createHttpParams(request: any): HttpParams {
    let params = new HttpParams();

    if (!request) return params;

    Object.keys(request).forEach(key => {
        const value = request[key];

        if (value === null || value === undefined || value === '') {
            return;
        }

        if (key === 'filter' && typeof value === 'object') {
            Object.keys(value).forEach(filterKey => {
                const filterValue = value[filterKey];
                if (filterValue !== null && filterValue !== undefined && filterValue !== '') {
                    params = params.append(`filter.${filterKey}`, filterValue.toString());
                }
            });
        }
        else if (key === 'filters' && typeof value === 'object') {
            Object.keys(value).forEach(dictKey => {
                const dictValue = value[dictKey];
                params = params.append(`Filters[${dictKey}]`, dictValue);
            });
        }

        else {
            params = params.append(key, value.toString());
        }
    });

    return params;
}
export interface PublicFailure {
    /** `unavailable` = the service answered 503 (not configured or down); `network` = no response; `rejected` = other 4xx. */
    kind: 'network' | 'unavailable' | 'rejected' | 'server';
    description: string;
    /** Retrying can only help when the failure is transient. */
    retryable: boolean;
}

export const GENERIC_PUBLIC_FAILURE: PublicFailure = {
    kind: 'server',
    description: 'Something went wrong on our side. Your search and filters are kept, so you can try again.',
    retryable: true
};

/**
 * Turns a failed public-site request into user-safe copy. The status and body never reach the UI;
 * they are logged in development so the real cause stays diagnosable.
 */
export function describePublicFailure(err: unknown, context: string): PublicFailure {
    const status = (err as { status?: number } | null)?.status;
    if (isDevMode()) console.error(`[public-api] ${context} failed`, err);

    if (status === 0) {
        return { kind: 'network', description: 'Check your connection and try again. Your search and filters are kept.', retryable: true };
    }
    if (status === 503) {
        return { kind: 'unavailable', description: 'This part of the site is temporarily unavailable. Please try again later.', retryable: true };
    }
    if (status !== undefined && status >= 400 && status < 500) {
        return { kind: 'rejected', description: 'We couldn’t process this request. Adjust your search or filters and try again.', retryable: false };
    }
    return GENERIC_PUBLIC_FAILURE;
}
