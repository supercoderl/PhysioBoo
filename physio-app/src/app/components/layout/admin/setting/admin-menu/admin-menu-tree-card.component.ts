import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { NzTreeNodeOptions } from "ng-zorro-antd/tree";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MenuItem } from "../../../../../shared/types/menu";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'setting-admin-menu-tree-card',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent
    ],
    template: `
        <div class="bg-surface rounded-[6px] border border-gray-200 overflow-hidden">
            <!-- Loading overlay -->
            <div *ngIf="loadingSrv.isLoading('search')" class="p-8 flex items-center justify-center">
                <boo-icon name="loader-circle" [size]="28" class="animate-spin text-primary"></boo-icon>
            </div>

            <!-- Empty state -->
            <div *ngIf="!loadingSrv.isLoading('search') && treeNodes.length === 0" class="p-12 flex flex-col items-center gap-3 text-center">
                <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <boo-icon name="layout-list" [size]="22" color="#94a3b8"></boo-icon>
                </div>
                <p class="text-sm text-secondary m-0">No menu items yet. Click <strong>New Item</strong> to get started.</p>
            </div>

            <!-- Tree -->
            <nz-tree
                *ngIf="!loadingSrv.isLoading('search') && treeNodes.length > 0"
                [nzData]="treeNodes"
                [nzExpandAll]="true"
                nzBlockNode
                [nzTreeTemplate]="treeNodeTpl"
                class="p-3 block"
            >
            </nz-tree>

            <ng-template #treeNodeTpl let-node let-origin="origin">
                <div class="group flex items-center justify-between w-full py-2 px-3 rounded-lg">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <!-- Icon -->
                        <div class="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <boo-icon [name]="origin['icon'] || 'layout-list'" [size]="14" class="text-primary"></boo-icon>
                        </div>

                        <!-- Label + route -->
                        <div class="min-w-0 flex-1">
                            <span class="text-sm font-semibold text-primary truncate block">{{ node.title }}</span>
                            <span *ngIf="origin['route']" class="text-xs text-secondary font-mono truncate block">
                                /{{ origin['route'] }}
                            </span>
                        </div>

                        <!-- Order badge -->
                        <span class="text-xs text-secondary bg-gray-100 rounded px-1.5 py-0.5 shrink-0 hidden sm:inline">
                            #{{ origin['order'] ?? 0 }}
                        </span>

                        <!-- Active badge -->
                        <span
                            class="text-xs rounded-full px-2 py-0.5 shrink-0 font-medium"
                            [ngClass]="origin['isActive'] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                        >
                            {{ origin['isActive'] ? 'Active' : 'Inactive' }}
                        </span>
                    </div>

                    <!-- Actions (visible on hover) -->
                    <div class="flex items-center gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                            nz-tooltip nzTooltipTitle="Add child"
                            class="w-6 h-6 flex items-center justify-center rounded hover:bg-primary/10 text-primary transition-colors"
                            (click)="$event.stopPropagation(); onAddChild(origin)"
                        >
                            <boo-icon name="plus" [size]="13"></boo-icon>
                        </button>
                        <button
                            nz-tooltip nzTooltipTitle="Edit"
                            class="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-secondary transition-colors"
                            (click)="$event.stopPropagation(); onEdit(origin)"
                        >
                            <boo-icon name="pencil" [size]="13"></boo-icon>
                        </button>
                        <button
                            nz-tooltip nzTooltipTitle="Delete"
                            class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-red-500 transition-colors"
                            (click)="$event.stopPropagation(); onDelete(origin)"
                        >
                            <boo-icon name="trash-2" [size]="13"></boo-icon>
                        </button>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class SettingAdminMenuTreeCardComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() data: MenuItem[] = [];
    @Output() editClick = new EventEmitter<MenuItem>();
    @Output() deleteClick = new EventEmitter<string>();
    @Output() addChildClick = new EventEmitter<string>();

    treeNodes: NzTreeNodeOptions[] = [];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(protected loadingSrv: LocalLoadingService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data']) {
            this.treeNodes = this.toTreeNodes(this.data);
        }
    }
    // #endregion

    // #region Methods
    private toTreeNodes(items: MenuItem[]): NzTreeNodeOptions[] {
        return items.map(item => ({
            title: item.label,
            key: item.id,
            icon: item.icon,
            route: item.route,
            isActive: item.isActive,
            order: item.order,
            permissionCode: item.permissionCode,
            // keep original for emitting back
            _original: item,
            isLeaf: !item.children || item.children.length === 0,
            expanded: true,
            children: item.children?.length ? this.toTreeNodes(item.children) : []
        }));
    }

    onEdit(origin: any) {
        this.editClick.emit(origin['_original'] as MenuItem);
    }

    onDelete(origin: any) {
        this.deleteClick.emit(origin['key'] as string);
    }

    onAddChild(origin: any) {
        this.addChildClick.emit(origin['key'] as string);
    }
    // #endregion
}
