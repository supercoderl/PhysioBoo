/** Ported from physio-app/src/app/shared/types/common.ts (contract-shape subset used by the mobile app). */

export interface PagedResponse<T> {
    data: T;
    detailedErrors: string[];
    errors: any;
    success: boolean;
}

export interface PaginationData<T> {
    hasNext: boolean;
    hasPrevious: boolean;
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export function PaginationDataWithInit<T>(): PaginationData<T> {
    return {
        hasNext: false,
        hasPrevious: false,
        items: [],
        pageNumber: 0,
        pageSize: 0,
        totalCount: 0,
        totalPages: 0,
    };
}

export interface QueryParameters {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    disableCache?: boolean;
}

export interface PagedRequest<TFilter> extends QueryParameters {
    filter?: TFilter;
}

export interface Lookup {
    id: string;
    name: string;
}
