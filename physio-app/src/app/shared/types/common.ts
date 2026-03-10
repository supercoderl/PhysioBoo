import { Role } from "./role";
import { Language } from "./sys-language";

export interface DrawerProperty {
    isOpen: boolean;
    type: string | null;
    data: HTMLElement | null;
}

export interface PopoverProperty {
    isOpen: boolean;
    type: string | null;
    data: HTMLElement | null;
}

export interface PagedResponse<T> {
    data: T;
    detailedErrors: string[],
    errors: any;
    success: boolean;
}

export interface AppConfig {
    version: string;
    features: Record<string, boolean>;
    registrationRoles: Role[];
    languages: Language[];
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

export type PopupPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'bottom-center' | 'top-center';

export interface QueryParameters {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    disableCache?: boolean;
    export?: boolean;
    filters?: { [key: string]: string };
}

export interface PagedRequest<TFilter> extends QueryParameters {
    filter?: TFilter;
}

export type Size = 'small' | 'middle' | 'large';

export interface ActionItem {
    label: string;
    icon?: string;
    onClick?: (data?: any) => void;
    isDanger?: boolean;
}

export interface Lookup {
    id: string;
    name: string;
}