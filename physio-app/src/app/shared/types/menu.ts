export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    route?: string;
    badge?: number;
    roles?: string[];
    children?: MenuItem[];
}