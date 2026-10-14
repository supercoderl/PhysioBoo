import { Component, inject, OnInit, signal } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { PlatformService } from "../../../../services/admin/platform.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { User } from "../../../../shared/types/core.types";
import { HospitalGroup } from "../../../../shared/types/support.types";

interface QuickAction {
    label: string;
    /** `physio-icon` name (kebab-case, see `PHYSIO_ICON_NAMES`). */
    icon: string;
    route: string;
}

@Component({
    selector: 'superadmin-dashboard',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        SuperadminPageHeaderComponent,
        StatusBadgeComponent,
        EmptyStateComponent,
        ErrorStateComponent
    ],
    template: `
        <div class="space-y-5">
            <superadmin-page-header
                title="Platform overview"
                description="Your tenants, users and access across the platform."
            >
                <boo-button-admin
                    [icon]="{ name: 'refresh', size: 14, iconClass: 'text-secondary' }"
                    buttonClass="!bg-surface"
                    [radius]="8"
                    [border]="{ width: 1, color: '#EFE3E7' }"
                    (click)="load()"
                >
                    <span class="text-regular">Refresh</span>
                </boo-button-admin>
            </superadmin-page-header>

            <!-- Quick actions -->
            <section
                class="rounded-4 border border-borderGray/60 bg-surface shadow-card px-5 py-6 sm:px-8"
                aria-labelledby="quick-actions-title"
            >
                <h3 id="quick-actions-title" class="text-lg font-semibold text-regular m-0">
                    Welcome back{{ firstName((userInfo$ | async)?.fullName) }}
                </h3>
                <p class="text-[13px] text-secondary mt-0.5 mb-0">Jump straight to what you manage most.</p>

                <nav class="mt-6" aria-label="Quick actions">
                    <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-6 list-none p-0 m-0">
                        <li *ngFor="let action of quickActions" class="flex justify-center">
                            <a
                                [routerLink]="action.route"
                                class="group flex flex-col items-center gap-2.5 w-full max-w-[120px] rounded-2 py-1 text-center"
                            >
                                <span
                                    class="w-14 h-14 rounded-full bg-primarySoft text-primary flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--color-primary-active-soft)] group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                                >
                                    <physio-icon [name]="action.icon" [size]="24" />
                                </span>
                                <span class="text-[13px] font-medium text-regular leading-tight">{{ action.label }}</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </section>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Newest tenants -->
                <section class="bg-surface rounded-2 border border-borderGray/60" aria-labelledby="recent-tenants-title">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-borderGray/60">
                        <h3 id="recent-tenants-title" class="text-sm font-semibold text-regular m-0">Newest tenants</h3>
                        <a routerLink="/superadmin/tenants/hospital-group" class="text-xs font-semibold text-primary hover:text-primaryHover">
                            View all
                        </a>
                    </div>

                    <ul *ngIf="recentTenants() === null && !tenantsFailed()" class="divide-y divide-borderGray/60" aria-busy="true">
                        <li *ngFor="let _ of [1, 2, 3]" class="flex items-center gap-3 px-4 py-3">
                            <div class="w-9 h-9 rounded-1.5 bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                            <div class="flex-1 space-y-1.5">
                                <div class="h-3 w-1/2 rounded bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                                <div class="h-3 w-1/3 rounded bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                            </div>
                        </li>
                    </ul>

                    <boo-error-state
                        *ngIf="tenantsFailed()"
                        icon="info"
                        title="Couldn't load tenants"
                        (retry)="loadTenants()"
                    />

                    <boo-empty-state
                        *ngIf="recentTenants()?.length === 0"
                        icon="ambulance"
                        title="No tenants yet"
                        description="Tenants appear here as soon as they are created or onboarded."
                    />

                    <ul *ngIf="recentTenants()?.length" class="divide-y divide-borderGray/60">
                        <li *ngFor="let tenant of recentTenants()" class="flex items-center gap-3 px-4 py-3">
                            <div
                                class="w-9 h-9 rounded-1.5 bg-primarySoft text-primaryDeep flex items-center justify-center font-semibold text-sm shrink-0"
                                aria-hidden="true"
                            >
                                {{ initial(tenant.name) }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-[13px] font-medium text-regular truncate m-0">{{ tenant.name }}</p>
                                <p class="text-[12px] text-secondary m-0 tabular-nums">
                                    {{ tenant.hospitalCount }} {{ tenant.hospitalCount === 1 ? 'hospital' : 'hospitals' }}
                                    · {{ tenant.createdAt | date: 'mediumDate' }}
                                </p>
                            </div>
                            <boo-status-badge
                                [label]="tenant.isActive ? 'Active' : 'Inactive'"
                                [tone]="tenant.isActive ? 'success' : 'neutral'"
                                dotted
                            />
                        </li>
                    </ul>
                </section>

                <!-- Newest users -->
                <section class="bg-surface rounded-2 border border-borderGray/60" aria-labelledby="recent-users-title">
                    <div class="flex items-center justify-between px-4 py-3 border-b border-borderGray/60">
                        <h3 id="recent-users-title" class="text-sm font-semibold text-regular m-0">Newest users</h3>
                        <a routerLink="/superadmin/users" class="text-xs font-semibold text-primary hover:text-primaryHover">
                            View all
                        </a>
                    </div>

                    <ul *ngIf="recentUsers() === null && !usersFailed()" class="divide-y divide-borderGray/60" aria-busy="true">
                        <li *ngFor="let _ of [1, 2, 3]" class="flex items-center gap-3 px-4 py-3">
                            <div class="w-9 h-9 rounded-full bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                            <div class="flex-1 space-y-1.5">
                                <div class="h-3 w-2/3 rounded bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                                <div class="h-3 w-1/4 rounded bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                            </div>
                        </li>
                    </ul>

                    <boo-error-state
                        *ngIf="usersFailed()"
                        icon="info"
                        title="Couldn't load users"
                        (retry)="loadUsers()"
                    />

                    <boo-empty-state
                        *ngIf="recentUsers()?.length === 0"
                        icon="user"
                        title="No users yet"
                        description="New accounts appear here as people register or are invited."
                    />

                    <ul *ngIf="recentUsers()?.length" class="divide-y divide-borderGray/60">
                        <li *ngFor="let user of recentUsers()" class="flex items-center gap-3 px-4 py-3">
                            <div
                                class="w-9 h-9 rounded-full bg-primarySoft text-primaryDeep flex items-center justify-center font-semibold text-sm shrink-0"
                                aria-hidden="true"
                            >
                                {{ initial(user.email) }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-[13px] font-medium text-regular truncate m-0">{{ user.email }}</p>
                                <p class="text-[12px] text-secondary m-0 tabular-nums">
                                    Joined {{ user.createdAt | date: 'mediumDate' }}
                                </p>
                            </div>
                            <boo-status-badge
                                [label]="user.isActive ? 'Active' : 'Inactive'"
                                [tone]="user.isActive ? 'success' : 'neutral'"
                                dotted
                            />
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    `
})
export class SuperadminDashboardComponent implements OnInit {
    // #region Inject Services
    private readonly platformSrv = inject(PlatformService);
    private readonly authSrv = inject(AuthService);
    // #endregion

    // #region Inputs, Outputs, Properties
    userInfo$ = this.authSrv.userInfo$;

    readonly quickActions: QuickAction[] = [
        { label: 'Tenants', icon: 'landmark', route: '/superadmin/tenants/hospital-group' },
        { label: 'Plans & billing', icon: 'credit-card', route: '/superadmin/billing' },
        { label: 'Users', icon: 'users', route: '/superadmin/users' },
        { label: 'Roles & access', icon: 'key', route: '/superadmin/roles' },
        { label: 'Menu management', icon: 'list', route: '/superadmin/menus' },
        { label: 'Master data', icon: 'database', route: '/superadmin/master-data' },
        { label: 'Audit logs', icon: 'history', route: '/superadmin/security/audit-logs' },
        { label: 'IP access', icon: 'lock', route: '/superadmin/security/ip-access' },
        { label: 'Sequence rules', icon: 'hash', route: '/superadmin/platform/sequence-rules' },
        { label: 'Localization', icon: 'globe', route: '/superadmin/platform/localization' },
    ];

    recentTenants = signal<HospitalGroup[] | null>(null);
    recentUsers = signal<User[] | null>(null);
    tenantsFailed = signal(false);
    usersFailed = signal(false);
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.load();
    }
    // #endregion

    // #region Methods
    load() {
        this.loadTenants();
        this.loadUsers();
    }

    loadTenants() {
        this.tenantsFailed.set(false);
        this.recentTenants.set(null);
        this.platformSrv.getRecentTenants().subscribe({
            next: tenants => this.recentTenants.set(tenants),
            error: () => this.tenantsFailed.set(true)
        });
    }

    loadUsers() {
        this.usersFailed.set(false);
        this.recentUsers.set(null);
        this.platformSrv.getRecentUsers().subscribe({
            next: users => this.recentUsers.set(users),
            error: () => this.usersFailed.set(true)
        });
    }

    /** ", Tom" for "Tom Halland"; empty when the name is unknown so the greeting still reads well. */
    firstName(fullName: string | null | undefined): string {
        const first = fullName?.trim().split(/\s+/)[0];
        return first ? `, ${first}` : '';
    }

    initial(text: string | null | undefined): string {
        return (text?.trim()[0] ?? '?').toUpperCase();
    }
    // #endregion
}
