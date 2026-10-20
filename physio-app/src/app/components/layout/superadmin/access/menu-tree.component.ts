import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { MenuItem } from "../../../../shared/types/menu.types";
import { isKnownMenuIcon, menuPermissionOf } from "../../../../shared/utils/menu.utils";
import { BooEmptyStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";

export interface MenuRowEvent {
    item: MenuItem;
    /** `null` when the row is a top-level section. */
    parent: MenuItem | null;
}

const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_132px] sm:grid-cols-[minmax(0,1fr)_100px_132px] md:grid-cols-[minmax(0,1fr)_240px_100px_132px]';
const ORDER_BADGE = 'shrink-0 inline-flex items-center justify-center rounded border border-borderGray/60 bg-gray-100 text-[11px] text-secondary tabular-nums';
const ICON_BUTTON = 'w-9 h-9 flex items-center justify-center rounded-1.5 text-secondary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors cursor-pointer';

/** Two-level menu table: sections (roots) with their pages joined by a dashed tree connector. */
@Component({
    selector: 'superadmin-menu-tree',
    standalone: true,
    imports: [SharedModule, BooStatusBadgeComponent, BooEmptyStateComponent, BooButtonAdminComponent],
    template: `
        <div *ngIf="loading" class="space-y-3" aria-busy="true">
            <div *ngFor="let _ of [1, 2, 3]" class="h-[120px] rounded-2 border border-borderGray/60 bg-surface animate-pulse motion-reduce:animate-none"></div>
        </div>

        <div *ngIf="!loading && !sections.length" class="bg-surface rounded-2 border border-borderGray/60" role="status">
            <boo-empty-state
                icon="layout-fluid"
                title="No menu sections yet"
                description="Sections group the pages in the sidebar. Add one, then add pages to it."
            >
                <boo-button-admin (click)="addSection.emit()" textColor="white" padding="8px 16px" fontWeight="600">
                    New section
                </boo-button-admin>
            </boo-empty-state>
        </div>

        <div *ngIf="!loading && sections.length" role="table" aria-label="Menu structure" class="bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
            <div role="row" [class]="rowGrid + ' bg-black/[0.03] border-b border-borderGray/60 text-[12px] font-semibold text-regular'">
                <div role="columnheader" class="px-4 py-3">Menu</div>
                <div role="columnheader" class="hidden md:block px-3 py-3">Permission</div>
                <div role="columnheader" class="hidden sm:block px-3 py-3">Status</div>
                <div role="columnheader" class="px-3 py-3 text-right"><span class="sr-only">Actions</span></div>
            </div>

            <div *ngFor="let section of sections" role="rowgroup" class="border-b border-borderGray/60 last:border-b-0">
                <div role="row" [class]="rowGrid + ' items-center hover:bg-black/[0.02] transition-colors cursor-pointer'" (click)="toggle(section)">
                    <div role="cell" class="flex items-center gap-2 px-3 py-3 min-w-0">
                        <button
                            type="button"
                            class="w-5 h-5 flex items-center justify-center shrink-0 rounded text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                            [class.invisible]="!section.children?.length"
                            [attr.aria-expanded]="isOpen(section)"
                            [attr.aria-label]="(isOpen(section) ? 'Collapse ' : 'Expand ') + section.label"
                        >
                            <physio-icon [name]="isOpen(section) ? 'chevron-down' : 'chevron-right'" [size]="14" />
                        </button>
                        <span [class]="orderBadge + ' w-10 h-7'" title="Display order">{{ section.order }}</span>
                        <span class="w-7 h-7 rounded-1.5 bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
                            <physio-icon *ngIf="isKnown(section.icon)" [name]="section.icon" [size]="14" />
                        </span>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="text-[15px] font-medium text-regular truncate">{{ section.label }}</span>
                                <span *ngIf="section.children?.length" class="text-[11px] text-secondary shrink-0">{{ section.children!.length }} {{ section.children!.length === 1 ? 'page' : 'pages' }}</span>
                                <span
                                    *ngIf="!isKnown(section.icon)"
                                    class="text-[11px] text-danger shrink-0"
                                    title="This icon is not registered, so the sidebar cannot draw it."
                                >Unknown icon “{{ section.icon }}”</span>
                            </div>
                            <div class="text-xs text-secondary font-mono truncate">{{ section.route }}</div>
                        </div>
                    </div>
                    <div role="cell" class="hidden md:block px-3 min-w-0">
                        <span *ngIf="permission(section)" class="px-1.5 py-0.5 rounded bg-gray-100 text-[11px] font-mono text-secondary truncate max-w-full inline-block align-middle" [title]="permission(section)">
                            {{ permission(section) }}
                        </span>
                    </div>
                    <div role="cell" class="hidden sm:block px-3">
                        <boo-status-badge [label]="section.isActive ? 'Active' : 'Inactive'" [tone]="section.isActive ? 'success' : 'neutral'" [dotted]="true" />
                    </div>
                    <div role="cell" class="flex items-center justify-end px-2" (click)="$event.stopPropagation()">
                        <button type="button" [class]="iconButton" [attr.aria-label]="'Add a page to ' + section.label" title="Add page" (click)="addChild.emit(section)">
                            <physio-icon name="plus" />
                        </button>
                        <button type="button" [class]="iconButton" [attr.aria-label]="'Edit section ' + section.label" title="Edit" (click)="edit.emit({ item: section, parent: null })">
                            <physio-icon name="pencil" />
                        </button>
                        <button type="button" [class]="iconButton + ' hover:!text-danger'" [attr.aria-label]="'Delete section ' + section.label" title="Delete" (click)="remove.emit({ item: section, parent: null })">
                            <physio-icon name="trash" />
                        </button>
                    </div>
                </div>

                <div
                    *ngFor="let child of (isOpen(section) ? section.children : []); let last = last"
                    role="row"
                    [class]="rowGrid + ' items-center relative border-t border-borderGray/40 hover:bg-black/[0.02] transition-colors'"
                >
                    <!-- Tree connector: dashed trunk down from the section's order badge, dashed branch into this row. -->
                    <span aria-hidden="true" class="absolute left-[60px] top-0 w-0 border-l border-dashed border-gray-400" [ngClass]="last ? 'h-1/2' : 'h-full'"></span>
                    <span aria-hidden="true" class="absolute left-[60px] top-1/2 w-4 border-t border-dashed border-gray-400"></span>

                    <div role="cell" class="flex items-center gap-3 pl-[84px] pr-4 py-2.5 min-w-0">
                        <span [class]="orderBadge + ' w-10 h-6'" title="Display order">{{ child.order }}</span>
                        <span class="w-6 h-6 flex items-center justify-center shrink-0 text-regular" aria-hidden="true">
                            <physio-icon *ngIf="isKnown(child.icon)" [name]="child.icon" [size]="16" />
                        </span>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="text-[15px] text-regular truncate">{{ child.label }}</span>
                                <span
                                    *ngIf="!isKnown(child.icon)"
                                    class="text-[11px] text-danger shrink-0"
                                    title="This icon is not registered, so the sidebar cannot draw it."
                                >Unknown icon “{{ child.icon }}”</span>
                            </div>
                            <div class="text-xs text-secondary font-mono truncate">{{ child.route }}</div>
                        </div>
                    </div>
                    <div role="cell" class="hidden md:block px-3 min-w-0">
                        <span class="px-1.5 py-0.5 rounded bg-gray-100 text-[11px] font-mono text-secondary truncate max-w-full inline-block align-middle" [title]="permission(child)">
                            {{ permission(child) || 'no permission' }}
                        </span>
                    </div>
                    <div role="cell" class="hidden sm:block px-3">
                        <boo-status-badge [label]="child.isActive ? 'Active' : 'Inactive'" [tone]="child.isActive ? 'success' : 'neutral'" [dotted]="true" />
                    </div>
                    <div role="cell" class="flex items-center justify-end px-2">
                        <button type="button" [class]="iconButton" [attr.aria-label]="'Edit page ' + child.label" title="Edit" (click)="edit.emit({ item: child, parent: section })">
                            <physio-icon name="pencil" />
                        </button>
                        <button type="button" [class]="iconButton + ' hover:!text-danger'" [attr.aria-label]="'Delete page ' + child.label" title="Delete" (click)="remove.emit({ item: child, parent: section })">
                            <physio-icon name="trash" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class SuperadminMenuTreeComponent {
    @Input() sections: MenuItem[] = [];
    @Input() loading = false;
    @Output() addSection = new EventEmitter<void>();
    @Output() addChild = new EventEmitter<MenuItem>();
    @Output() edit = new EventEmitter<MenuRowEvent>();
    @Output() remove = new EventEmitter<MenuRowEvent>();

    private readonly expanded = new Set<string>();

    readonly rowGrid = ROW_GRID;
    readonly orderBadge = ORDER_BADGE;
    readonly iconButton = ICON_BUTTON;
    readonly isKnown = isKnownMenuIcon;
    readonly permission = menuPermissionOf;

    isOpen(section: MenuItem): boolean {
        return this.expanded.has(section.id);
    }

    toggle(section: MenuItem): void {
        if (!section.children?.length) return;
        if (!this.expanded.delete(section.id)) this.expanded.add(section.id);
    }
}
