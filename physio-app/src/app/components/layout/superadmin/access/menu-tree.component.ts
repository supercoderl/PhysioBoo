import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { MenuItem } from "../../../../shared/types/menu.types";
import { isKnownMenuIcon, menuPermissionOf } from "../../../../shared/utils/menu.utils";
import { EmptyStateComponent } from "../../../ui/empty-state.component";
import { StatusBadgeComponent } from "../../../ui/status-badge.component";

export interface MenuRowEvent {
    item: MenuItem;
    /** `null` when the row is a top-level section. */
    parent: MenuItem | null;
}

const ICON_BUTTON = 'w-9 h-9 flex items-center justify-center rounded-1.5 text-secondary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors cursor-pointer';

/** Two-level menu: sections (roots) with their items. */
@Component({
    selector: 'superadmin-menu-tree',
    standalone: true,
    imports: [SharedModule, StatusBadgeComponent, EmptyStateComponent],
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
                <button
                    type="button"
                    class="h-9 px-4 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                    (click)="addSection.emit()"
                >
                    New section
                </button>
            </boo-empty-state>
        </div>

        <ul *ngIf="!loading && sections.length" class="list-none p-0 m-0 space-y-3">
            <li
                *ngFor="let section of sections"
                class="bg-surface rounded-2 border border-borderGray/60 overflow-hidden"
            >
                <div class="flex items-center gap-3 px-4 py-3 bg-black/[0.02]">
                    <span class="w-8 h-8 rounded-1.5 bg-primary/10 text-primary flex items-center justify-center shrink-0" aria-hidden="true">
                        <lucide-icon *ngIf="isKnown(section.icon)" [name]="section.icon" class="w-4 h-4"></lucide-icon>
                    </span>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm font-semibold text-regular m-0 truncate">{{ section.label }}</h3>
                            <boo-status-badge *ngIf="!section.isActive" label="Inactive" tone="neutral" />
                        </div>
                        <p class="text-xs text-secondary font-mono m-0 truncate">{{ section.route }}</p>
                    </div>
                    <span class="hidden sm:inline text-[11px] text-secondary tabular-nums shrink-0">#{{ section.order }}</span>
                    <div class="flex items-center shrink-0">
                        <button type="button" [class]="iconButton" [attr.aria-label]="'Add a page to ' + section.label" title="Add page" (click)="addChild.emit(section)">
                            <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
                        </button>
                        <button type="button" [class]="iconButton" [attr.aria-label]="'Edit section ' + section.label" title="Edit" (click)="edit.emit({ item: section, parent: null })">
                            <lucide-icon name="pencil" class="w-4 h-4"></lucide-icon>
                        </button>
                        <button type="button" [class]="iconButton + ' hover:!text-danger'" [attr.aria-label]="'Delete section ' + section.label" title="Delete" (click)="remove.emit({ item: section, parent: null })">
                            <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                        </button>
                    </div>
                </div>

                <ul *ngIf="section.children?.length" class="list-none p-0 m-0 divide-y divide-borderGray/60">
                    <li *ngFor="let child of section.children" class="flex items-center gap-3 pl-8 pr-4 py-2.5">
                        <span class="w-7 h-7 rounded-1.5 bg-gray-100 text-secondary flex items-center justify-center shrink-0" aria-hidden="true">
                            <lucide-icon *ngIf="isKnown(child.icon)" [name]="child.icon" class="w-3.5 h-3.5"></lucide-icon>
                        </span>
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[13px] font-medium text-regular truncate">{{ child.label }}</span>
                                <boo-status-badge *ngIf="!child.isActive" label="Inactive" tone="neutral" />
                                <span
                                    *ngIf="!isKnown(child.icon)"
                                    class="text-[11px] text-danger"
                                    title="This icon is not registered, so the sidebar cannot draw it."
                                >Unknown icon “{{ child.icon }}”</span>
                            </div>
                            <p class="text-xs text-secondary font-mono m-0 truncate">{{ child.route }}</p>
                        </div>
                        <span class="hidden md:inline px-1.5 py-0.5 rounded bg-gray-100 text-[11px] font-mono text-secondary truncate max-w-[220px]" [title]="permission(child)">
                            {{ permission(child) || 'no permission' }}
                        </span>
                        <span class="hidden sm:inline text-[11px] text-secondary tabular-nums shrink-0">#{{ child.order }}</span>
                        <div class="flex items-center shrink-0">
                            <button type="button" [class]="iconButton" [attr.aria-label]="'Edit page ' + child.label" title="Edit" (click)="edit.emit({ item: child, parent: section })">
                                <lucide-icon name="pencil" class="w-4 h-4"></lucide-icon>
                            </button>
                            <button type="button" [class]="iconButton + ' hover:!text-danger'" [attr.aria-label]="'Delete page ' + child.label" title="Delete" (click)="remove.emit({ item: child, parent: section })">
                                <lucide-icon name="trash-2" class="w-4 h-4"></lucide-icon>
                            </button>
                        </div>
                    </li>
                </ul>

                <p *ngIf="!section.children?.length" class="text-[13px] text-secondary m-0 px-4 py-3 pl-8">No pages in this section yet.</p>
            </li>
        </ul>
    `
})
export class SuperadminMenuTreeComponent {
    @Input() sections: MenuItem[] = [];
    @Input() loading = false;
    @Output() addSection = new EventEmitter<void>();
    @Output() addChild = new EventEmitter<MenuItem>();
    @Output() edit = new EventEmitter<MenuRowEvent>();
    @Output() remove = new EventEmitter<MenuRowEvent>();

    readonly iconButton = ICON_BUTTON;
    readonly isKnown = isKnownMenuIcon;
    readonly permission = menuPermissionOf;
}
