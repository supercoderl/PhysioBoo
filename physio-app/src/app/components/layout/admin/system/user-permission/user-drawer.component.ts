import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { DrawerComponent } from "../../../../drawer/drawer.component";

@Component({
    selector: 'user-permission-user-drawer',
    standalone: true,
    imports: [
    SharedModule,
    DrawerComponent
],
    template: `
        <drawer
            [isOpen]="isUserDrawerOpen()"
            [isShowDialog]="true"
            [width]="640"
            (close)="closeUserDrawer()"
        >
            <div class="flex flex-col h-full bg-surface" [formGroup]="userForm">
                <div
                    class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between"
                >
                    <div>
                    <h2 class="text-xl font-bold text-primary leading-none mb-1">
                        {{ selectedUserId() ? "Edit User" : "New User" }}
                    </h2>
                    <p class="text-sm text-secondary m-0">
                        Account credentials and role assignments
                    </p>
                    </div>
                    <button
                        (click)="closeUserDrawer()"
                        class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-5" custom-scrollbar>
                    <!-- Profile summary for existing user -->
                    <div
                        *ngIf="selectedUser() as su"
                        class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                        <div
                            *ngIf="!su.profilePicture"
                            class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary"
                        >
                            {{ userInitial(su) }}
                        </div>
                        <img
                            *ngIf="su.profilePicture"
                            [src]="su.profilePicture"
                            class="w-12 h-12 rounded-full object-cover"
                        />
                        <div class="min-w-0 flex-1">
                            <div class="font-medium text-primary truncate">{{ su.email }}</div>
                            <div class="text-xs text-secondary">
                            <span
                                *ngIf="su.isVerified"
                                class="inline-flex items-center gap-1 mr-2"
                            >
                                <boo-icon
                                name="badge-check"
                                iconClass="w-3 h-3 text-emerald-500"
                                ></boo-icon>
                                Verified
                            </span>
                            <span
                                *ngIf="su.twoFactorEnabled"
                                class="inline-flex items-center gap-1"
                            >
                                <boo-icon
                                name="shield-check"
                                iconClass="w-3 h-3 text-indigo-500"
                                ></boo-icon>
                                2FA on
                            </span>
                            </div>
                        </div>
                    </div>

                    <!-- Credentials -->
                    <div>
                        <h3
                            class="text-xs font-bold text-secondary uppercase tracking-wider mb-3"
                        >
                            Credentials
                        </h3>
                        <div class="space-y-3">
                            <boo-input
                                label="Email"
                                formControlName="email"
                                placeholder="user@hospital.com"
                                required
                            ></boo-input>
                            <boo-input
                                label="Phone"
                                formControlName="phone"
                                placeholder="+1..."
                            ></boo-input>
                            <boo-input
                                *ngIf="!selectedUserId()"
                                label="Initial Password"
                                type="password"
                                formControlName="password"
                                required
                            ></boo-input>
                        </div>
                    </div>

                    <!-- Role assignment -->
                    <div>
                    <h3
                        class="text-xs font-bold text-secondary uppercase tracking-wider mb-3"
                    >
                        Roles
                    </h3>
                    <p class="text-xs text-secondary mb-3">
                        Pick the roles that apply. Permissions accumulate across all
                        selected roles.
                    </p>
                    <div class="space-y-2">
                        <label
                            *ngFor="let r of rolesData()?.items"
                            class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                            [ngClass]="
                                isUserRoleSelected(r.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                            "
                            (click)="toggleUserRole(r.id)"
                        >
                            <boo-checkbox
                                [ngModel]="isUserRoleSelected(r.id)"
                                [ngModelOptions]="{ standalone: true }"
                            ></boo-checkbox>
                            <div
                                class="w-8 h-8 rounded-md flex items-center justify-center"
                                    [style.background-color]="softBg(roleColorFor(r))"
                                    [style.color]="roleColorFor(r)"
                            >
                                <boo-icon
                                    [name]="r.icon || 'shield'"
                                    iconClass="w-4 h-4"
                                ></boo-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-primary">{{ r.name }}</div>
                                <div class="text-xs text-secondary truncate">
                                    {{ r.description || r.code }}
                                </div>
                            </div>
                        </label>

                        <div
                            *ngIf="!rolesData()?.items?.length"
                            class="text-center py-6 text-xs text-secondary"
                        >
                            No roles available yet. Create one in the Roles tab.
                        </div>
                    </div>
                    </div>
                </div>

                <div
                    class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3"
                >
                    <boo-button-admin background="transparent" (click)="closeUserDrawer()">
                        Cancel
                    </boo-button-admin>
                    <boo-button-admin textColor="white" (click)="saveUser()">
                        {{ selectedUserId() ? "Save Changes" : "Create User" }}
                    </boo-button-admin>
                </div>
            </div>
        </drawer>
    `
})

export class UserPermissionUserDrawerComponent {

}