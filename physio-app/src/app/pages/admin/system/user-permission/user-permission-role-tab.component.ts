import { Component, EventEmitter, Input, Output, WritableSignal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { Role } from "../../../../shared/types/role.types";
import { ColorUtils } from "../../../../shared/utils/color.utils";

@Component({
    selector: 'admin-user-permission-role-tab',
    standalone: true,
    imports: [
    SharedModule,
    BooIconComponent
],
    template: `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
                *ngFor="let r of tableData()?.items"
                class="group bg-surface rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer"
                (click)="onEditClick(r)"
            >
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg flex items-center justify-center"
                            [style.background-color]="ColorUtils.softBg(ColorUtils.roleColorFor(r))"
                            [style.color]="ColorUtils.roleColorFor(r)"
                        >
                            <boo-icon
                                [name]="r.icon || 'shield'"
                                iconClass="w-5 h-5"
                            ></boo-icon>
                        </div>
                        <div class="min-w-0">
                            <div class="font-semibold text-primary truncate">
                                {{ r.name }}
                            </div>
                            <div class="text-xs text-secondary font-mono">{{ r.code }}</div>
                        </div>
                    </div>
                    <span
                        *ngIf="r.isSystemRole"
                        class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700"
                    >
                        System
                    </span>
                </div>
                <p class="text-sm text-secondary line-clamp-2 min-h-[2.5rem] mb-3">
                    {{ r.description || "No description provided." }}
                </p>
                <div
                    class="flex items-center justify-between text-xs text-secondary pt-3 border-t border-gray-100"
                >
                <span class="inline-flex items-center gap-1.5">
                    <span
                        class="w-1.5 h-1.5 rounded-full"
                        [ngClass]="r.isActive ? 'bg-emerald-500' : 'bg-gray-300'"
                    ></span>
                    {{ r.isActive ? "Active" : "Inactive" }}
                </span>
                <span
                    class="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center gap-1"
                >
                    Configure
                    <boo-icon name="arrow-right" iconClass="w-3 h-3"></boo-icon>
                </span>
                </div>
            </div>

            <button
                (click)="onNewClick()"
                class="bg-surface rounded-lg border-2 border-dashed border-gray-200 p-5 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[180px] text-secondary hover:text-primary"
            >
                <boo-icon name="plus" iconClass="w-8 h-8 mb-2"></boo-icon>
                <div class="text-sm font-medium">Create a new role</div>
                <div class="text-xs mt-1">Bundle permissions for a job function</div>
            </button>
        </div>

        <div
            *ngIf="!tableData()?.items?.length"
            class="bg-surface rounded-lg border border-dashed border-gray-300 py-16 text-center"
        >
            <div
                class="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3"
            >
                <boo-icon name="shield" iconClass="w-6 h-6 text-gray-400"></boo-icon>
            </div>
            <div class="text-sm font-medium text-primary mb-1">No roles yet</div>
            <div class="text-xs text-secondary">
                Create your first role to organize permissions.
            </div>
        </div>
    `
})

export class AdminUserPermissionRoleTabComponent {
    // #region Inputs, Outputs, Properties
    @Input({ required: true }) tableData!: WritableSignal<PaginationData<Role> | null>;
    @Output() editClick = new EventEmitter<Role>();
    @Output() newClick = new EventEmitter<void>();

    ColorUtils = ColorUtils;
    // #endregion

    // #region Methods
    onEditClick(role: Role) {
        this.editClick.emit(role);
    }

    onNewClick() {
        this.newClick.emit();
    }
    // #endregion
}