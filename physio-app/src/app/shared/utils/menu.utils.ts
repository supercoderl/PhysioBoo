import { PHYSIO_ICON_NAMES } from '../icons/icon-names';
import { MenuItem } from "../types/menu.types";

export type MenuArea = 'superadmin' | 'admin';

export const SUPERADMIN_ROUTE_PREFIX = '/superadmin';

/** Every icon the app ships, so a menu row can only point at an icon that will actually render. */
export const MENU_ICON_NAMES: string[] = [...PHYSIO_ICON_NAMES].sort();

const KNOWN_ICONS = new Set(MENU_ICON_NAMES);

export function isKnownMenuIcon(name: string | null | undefined): boolean {
    return !!name && KNOWN_ICONS.has(name);
}

/** Which sidebar a root menu row belongs to, decided by its route prefix. */
export function menuAreaOf(root: Pick<MenuItem, 'route'>): MenuArea {
    return root.route?.startsWith(SUPERADMIN_ROUTE_PREFIX) ? 'superadmin' : 'admin';
}

/** The API returns a single permission code per row, although `MenuItem` is typed as an array. */
export function menuPermissionOf(item: Pick<MenuItem, 'permissionCode'>): string {
    const code: unknown = item.permissionCode;
    return Array.isArray(code) ? code.join(', ') : (code as string | null | undefined) ?? '';
}
