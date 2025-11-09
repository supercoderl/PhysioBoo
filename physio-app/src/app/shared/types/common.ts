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