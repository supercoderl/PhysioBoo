import { Role } from "./role";

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