import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';
import { AVATAR } from '../../../shared/data/dummy';
import { SharedModule } from '../../../shared/shared-imports';
import { BooIconComponent } from '../../icon/boo-icon/boo-icon.component';
import { BooAvatarComponent } from '../../image/avatar/boo-avatar.component';

interface NavGroup {
    label: string;
    items: NavItem[];
}

interface NavItem {
    label: string;
    icon: string;
    route: string;
    exact?: boolean;
}

@Component({
    selector: 'superadmin-layout',
    standalone: true,
    imports: [
        SharedModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        BooAvatarComponent,
        BooIconComponent
    ],
    template: `
        <div id="superadmin-layout" class="flex min-h-svh font-sans bg-body">
            <aside class="flex flex-col w-60 shrink-0 bg-surface border-r border-gray-200 min-h-svh sticky top-0">
                <div class="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                    <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <physio-icon name="logo" class="text-white" />
                    </div>
                    <div>
                        <div class="text-sm font-bold text-brandDark leading-none">PhysioBoo</div>
                        <div class="text-[10px] text-brandDark font-medium mt-0.5">Super Admin</div>
                    </div>
                </div>

                <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    <div *ngFor="let group of navGroups">
                        <div class="px-2 mb-1.5 text-[10px] font-bold text-brandDark uppercase tracking-widest">
                            {{ group.label }}
                        </div>
                        <ul class="space-y-0.5">
                            <li *ngFor="let item of group.items">
                                <div
                                    [routerLink]="item.route"
                                    routerLinkActive="bg-primary/8 font-semibold"
                                    [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
                                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-brandDark hover:bg-gray-100 hover:text-primary cursor-pointer transition-colors"
                                >
                                    <physio-icon [name]="item.icon" />
                                    {{ item.label }}
                                </div>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div class="border-t border-gray-100 px-4 py-3 flex items-center gap-2.5">
                    <boo-avatar
                        [src]="(userInfo$ | async)?.avatarUrl"
                        class="shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                        <div class="text-xs font-semibold text-brandDark truncate">
                            {{ (userInfo$ | async)?.fullName ?? (userInfo$ | async)?.email }}
                        </div>
                        <div class="text-[10px] text-brandDark truncate">
                            {{ (userInfo$ | async)?.email }}
                        </div>
                    </div>
                    <button
                        class="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-brandDark hover:text-red-500 transition-colors shrink-0"
                        title="Logout"
                        (click)="logout()"
                    >
                        <physio-icon name="logout" />
                    </button>
                </div>
            </aside>

            <main class="flex-1 flex flex-col min-w-0 min-h-svh">
                <header class="flex-none flex items-center justify-between px-6 py-3 bg-surface border-b border-gray-200 sticky top-0 z-10">
                    <div>
                        <h1 class="text-sm font-semibold text-brandDark m-0">{{ pageTitle }}</h1>
                    </div>
                    <a
                        routerLink="/admin"
                        class="flex items-center gap-1.5 text-xs text-brandDark hover:text-primary transition-colors"
                    >
                        <boo-icon name="arrow-left" [size]="13"></boo-icon>
                        Back to Admin
                    </a>
                </header>
                <div class="flex-1 overflow-auto p-5">
                    <router-outlet></router-outlet>
                </div>
            </main>
        </div>
    `
})
export class SuperadminLayoutComponent implements OnInit, OnDestroy {
    // #region Inject Services
    private authSrv = inject(AuthService);
    private router = inject(Router);
    private toastSrv = inject(ToastService);
    private oauthSrv = inject(SocialAuthService);
    // #endregion

    // #region Inputs, Outputs, Properties
    userInfo$ = this.authSrv.userInfo$;
    defaultAvatar = AVATAR;
    pageTitle = 'Dashboard';
    private destroy$ = new Subject<void>();

    readonly navGroups: NavGroup[] = [
        {
            label: 'Overview',
            items: [
                { label: 'Dashboard', icon: 'layout-fluid', route: '/superadmin/overview/dashboard', exact: true }
            ]
        },
        // {
        //     label: 'Tenants',
        //     items: [
        //         { label: 'Hospital Groups', icon: 'ambulance', route: '/superadmin/tenants/hospital-group' },
        //         { label: 'Hospitals', icon: 'pharmacy', route: '/superadmin/tenants/hospital' }
        //     ]
        // },
        {
            label: 'Access Control',
            items: [
                { label: 'Users', icon: 'user', route: '/superadmin/users' },
                { label: 'Roles', icon: 'key', route: '/superadmin/roles' }
            ]
        }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            const url = this.router.url;
            const allItems = this.navGroups.flatMap(g => g.items);
            const match = allItems.find(i => url.startsWith(i.route));
            this.pageTitle = match?.label ?? 'Super Admin';
        });
    }
    // #endregion

    // #region Methods
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    logout() {
        this.oauthSrv.signOut();
        this.authSrv.logout().subscribe({
            next: () => this.router.navigate(['/auth/login']),
            error: err => this.toastSrv.error(err.message)
        });
    }
    // #endregion
}
