import { Component, EventEmitter, Input, Output, Signal, WritableSignal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Role } from "../../../../../shared/types/role.types";
import { ColorUtils } from "../../../../../shared/utils/color.utils";
import { IconUtils } from "../../../../../shared/utils/icon.utils";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'user-permission-role-drawer',
    standalone: true,
    imports: [
        DrawerComponent, 
        BooButtonAdminComponent, 
        BooIconComponent, 
        BooInputComponent, 
        BooTextareaComponent,
        SharedModule
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="780"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface" [formGroup]="form">
                <div
                    class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between"
                >
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-lg flex items-center justify-center"
                            [style.background-color]="ColorUtils.softBg(form.get('color')?.value)"
                            [style.color]="form.get('color')?.value"
                        >
                            <boo-icon
                                [name]="form.get('icon')?.value || 'shield'"
                                iconClass="w-5 h-5"
                            ></boo-icon>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-primary leading-none mb-1">
                                {{ selectedRoleId() ? "Edit Role" : "New Role" }}
                            </h2>
                            <p class="text-sm text-secondary m-0">
                                Bundle the permissions that define this job function
                            </p>
                        </div>
                    </div>
                    <button
                        (click)="onClose()"
                        class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6" custom-scrollbar>
                    <div>
                        <h3
                            class="text-xs font-bold text-secondary uppercase tracking-wider mb-3"
                        >
                            Identity
                        </h3>
                        <div class="grid grid-cols-2 gap-4 mb-3">
                            <boo-input
                                label="Display Name"
                                formControlName="name"
                                placeholder="Ex: Cardiologist"
                                required
                            ></boo-input>
                            <boo-input
                                label="Code"
                                formControlName="code"
                                placeholder="Ex: CARDIO_DOC"
                                required
                            ></boo-input>
                        </div>
                        <boo-textarea
                            label="Description"
                            formControlName="description"
                            [rows]="2"
                            placeholder="Short summary of what this role can do..."
                        ></boo-textarea>
                    </div>
                    <div>
                        <h3
                            class="text-xs font-bold text-secondary uppercase tracking-wider mb-3"
                        >
                            Appearance
                        </h3>
                        <div class="space-y-3">
                            <div>
                                <div class="text-xs text-secondary mb-2">Color</div>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        *ngFor="let c of ColorUtils.roleColors"
                                        (click)="onSelectRoleColor(c.value)"
                                        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                                        [style.background-color]="c.value"
                                        [title]="c.label"
                                    >
                                        <boo-icon
                                            *ngIf="form.get('color')?.value === c.value"
                                            name="check"
                                            iconClass="w-4 h-4 text-white"
                                        ></boo-icon>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div class="text-xs text-secondary mb-2">Icon</div>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        *ngFor="let i of IconUtils.roleIcons"
                                        (click)="onSelectRoleIcon(i)"
                                        class="w-9 h-9 rounded-md border flex items-center justify-center transition-all"
                                        [ngClass]="
                                            form.get('icon')?.value === i
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-gray-200 text-secondary hover:border-gray-300'
                                        "
                                    >
                                        <boo-icon [name]="i" iconClass="w-4 h-4"></boo-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h3
                                class="text-xs font-bold text-secondary uppercase tracking-wider"
                            >
                                Permissions
                            </h3>
                            <span class="text-xs text-secondary">
                                <span class="font-semibold text-primary">{{rolePermissionsDraft().size}}</span> selected
                            </span>
                        </div>
                        <div
                            *ngIf="!permissionsData()?.items?.length"
                            class="text-center py-8 text-xs text-secondary bg-gray-50 rounded-lg"
                        >
                            No permissions defined yet. Add some in the Permissions tab first.
                        </div>

                        <div class="space-y-3">
                            <div
                                *ngFor="let cat of permissionCategories()"
                                class="border border-gray-200 rounded-lg overflow-hidden"
                            >
                                <div
                                    class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200"
                                >
                                    <div class="flex items-center gap-2">
                                        <boo-icon
                                            name="folder"
                                            iconClass="w-4 h-4 text-secondary"
                                        ></boo-icon>
                                        <span class="text-sm font-semibold text-primary">{{
                                            cat
                                        }}</span>
                                    </div>
                                    <label
                                        class="text-xs text-secondary flex items-center gap-2 cursor-pointer"
                                    >
                                    <input
                                        type="checkbox"
                                        [checked]="categoryAllSelected(cat)"
                                        (change)="onToggleCategoryAll(cat, $any($event.target).checked)"
                                        class="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                        Select all
                                    </label>
                                </div>
                                <div class="divide-y divide-gray-100">
                                    <label
                                        *ngFor="let p of permsByCategory(cat)"
                                        class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/60"
                                        (click)="onTogglePermission(p.id)"
                                    >
                                        <div class="flex items-start gap-3 min-w-0">
                                            <input
                                                type="checkbox"
                                                [checked]="isPermSelected(p.id)"
                                                (click)="$event.stopPropagation()"
                                                (change)="onTogglePermission(p.id)"
                                                class="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                            <div class="min-w-0">
                                                <div class="text-sm text-primary">{{ p.name }}</div>
                                                <div class="text-xs text-secondary truncate">
                                                    {{ p.description || p.code }}
                                                </div>
                                            </div>
                                        </div>
                                        <code
                                            class="text-[10px] text-gray-400 font-mono shrink-0 ml-3"
                                        >{{ p.code }}
                                        </code>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3"
                >
                    <button
                        *ngIf="selectedRole() && !selectedRole()!.isSystemRole"
                        (click)="onDeleteRole(selectedRole()!)"
                    class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5"
                    >
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete Role
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">
                            Cancel
                        </boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSaveRole()">
                            {{ selectedRoleId() ? "Save Changes" : "Create Role" }}
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})

export class UserPermissionRoleDrawerComponent {
    // #region Inputs, Outputs, Properties
    @Input({ required: true }) isOpen: boolean = false; 
    @Input({ required: true }) form!: FormGroup;
    @Input({ required: true }) selectedRoleId!: WritableSignal<string | null>;
    @Input({ required: true }) selectedRole!: WritableSignal<Role | null>;
    @Input({ required: true }) rolePermissionsDraft!: WritableSignal<Set<string>>;
    @Input({ required: true }) permissionsData!: WritableSignal<any>;
    @Input({ required: true }) permissionCategories!: Signal<string[]>;
    @Input({ required: true }) permsByCategory!: (category: string) => any[];
    @Input({ required: true }) isPermSelected!: (permId: string) => boolean;
    @Input({ required: true }) categoryAllSelected!: (category: string) => boolean;
    @Output() close = new EventEmitter<void>();
    @Output() selectRoleColor = new EventEmitter<string>();
    @Output() selectRoleIcon = new EventEmitter<string>();
    @Output() toggleCategoryAll = new EventEmitter<{ category: string, on: boolean }>();
    @Output() togglePermission = new EventEmitter<string>();
    @Output() deleteRole = new EventEmitter<Role>();
    @Output() saveRole = new EventEmitter<void>();

    ColorUtils = ColorUtils;
    IconUtils = IconUtils;
    // #endregion

    // #region Methods  
    onClose() {
        this.close.emit();
    }

    onSelectRoleColor(color: string) {
        this.selectRoleColor.emit(color);
    }

    onSelectRoleIcon(icon: string) {
        this.selectRoleIcon.emit(icon);
    }

    onToggleCategoryAll(category: string, on: boolean) {
        this.toggleCategoryAll.emit({ category, on });
    }

    onTogglePermission(permission: string) {
        this.togglePermission.emit(permission);
    }

    onDeleteRole(role: Role) {
        this.deleteRole.emit(role);
    }

    onSaveRole() {
        this.saveRole.emit();
    }
    // #endregion
}