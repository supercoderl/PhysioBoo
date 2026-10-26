import { ActivatedRoute } from "@angular/router";

/** Permission code a child route declares in `data.permission`, keyed by its path, for hiding navigation the user cannot open. */
export function childRoutePermissions(route: ActivatedRoute): Map<string, string> {
    const map = new Map<string, string>();
    for (const child of route.routeConfig?.children ?? []) {
        const permission = child.data?.['permission'];
        if (child.path && permission) map.set(child.path, permission);
    }
    return map;
}

/** True when the nav link's last path segment has no required permission or the user holds it. */
export function canOpenNavLink(link: string, required: Map<string, string>, has: (code: string) => boolean): boolean {
    const permission = required.get(link.split('/').pop() ?? '');
    return !permission || has(permission);
}
