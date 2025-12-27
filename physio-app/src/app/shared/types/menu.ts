export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    route: string;
    isActive: boolean;
    order: number;
    permissionCode: string[];
    children?: MenuItem[] | null;
}

export interface MenuCache {
    version: string;
    items: MenuItem[];
}