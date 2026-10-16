import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { MenuService } from '../../../services/admin/menu.service';
import { AuthService } from '../../../services/auth/auth.service';
import { SharedModule } from '../../../shared/shared-imports';
import { isStaff } from '../../../shared/utils/role.utils';
import { BooAvatarComponent } from '../../image/avatar/boo-avatar.component';
import { SidebarItemComponent } from '../admin/sidebar/sidebar-item/sidebar-item.component';

@Component({
    selector: 'superadmin-layout',
    standalone: true,
    imports: [
        SharedModule,
        RouterOutlet,
        RouterLink,
        SidebarItemComponent,
        BooAvatarComponent,
    ],
    template: `
        <a
            href="#superadmin-main"
            class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-1.5 focus:bg-primary focus:text-white"
        >
            Skip to main content
        </a>

        <div id="superadmin-layout" class="flex h-svh overflow-hidden font-sans bg-body text-regular">
            <div
                *ngIf="isNavOpen()"
                class="fixed inset-0 z-30 bg-black/40 lg:hidden"
                aria-hidden="true"
                (click)="closeNav()"
            ></div>

            <aside
                id="superadmin-sidebar"
                class="fixed lg:sticky top-0 left-0 z-40 flex flex-col w-60 shrink-0 h-svh bg-menu border-r border-sidebarDivider transition-transform duration-200 motion-reduce:transition-none"
                [ngClass]="isNavOpen() ? 'translate-x-0 shadow-lg lg:transform-none lg:shadow-none' : '-translate-x-full lg:transform-none'"
            >
                <div class="flex h-14 shrink-0 items-center gap-2.5 px-5 border-b border-sidebarDivider">
                    <div class="w-8 h-8 rounded-1.5 bg-logo flex items-center justify-center shrink-0">
                        <physio-icon name="logo" class="text-white" />
                    </div>
                    <div class="min-w-0">
                        <div class="text-sm font-bold text-regular leading-none">PhysioBoo</div>
                        <div class="text-[11px] text-secondary font-medium mt-1 leading-none">Super Admin</div>
                    </div>
                </div>

                <nav class="flex-1 min-h-0 py-4 px-3" aria-label="Super admin navigation" custom-scrollbar>
                    <div *ngFor="let group of menus()" class="mb-4">
                        <p class="px-2.5 mb-1.5 leading-none truncate font-medium text-xs text-sidebarGroup">
                            {{ group.label }}
                        </p>
                        <sidebar-item *ngFor="let item of group.children" [item]="item"></sidebar-item>
                    </div>
                    <div *ngIf="!loaded()" class="px-2 space-y-2" aria-hidden="true">
                        <div class="h-3 w-20 rounded bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                        <div class="h-8 rounded-1.5 bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                        <div class="h-8 rounded-1.5 bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                    </div>
                </nav>

                <div class="shrink-0 border-t border-sidebarDivider p-3 flex items-center gap-2.5">
                    <boo-avatar [src]="(userInfo$ | async)?.avatarUrl" class="shrink-0" />
                    <div class="flex-1 min-w-0">
                        <div class="text-[13px] font-semibold text-regular truncate">
                            {{ (userInfo$ | async)?.fullName ?? (userInfo$ | async)?.email }}
                        </div>
                        <div class="text-[11px] text-secondary truncate">{{ (userInfo$ | async)?.email }}</div>
                    </div>
                    <button
                        type="button"
                        class="w-9 h-9 flex bg-surface items-center justify-center rounded-1.5 text-danger hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors shrink-0 cursor-pointer"
                        aria-label="Log out"
                        title="Log out"
                        (click)="logout()"
                    >
                        <physio-icon name="power" [size]="18" />
                    </button>
                </div>
            </aside>

            <div class="flex-1 flex flex-col min-w-0 min-h-0">
                <header class="flex-none flex items-center justify-between gap-3 h-14 px-4 lg:px-6 bg-surface border-b border-borderGray/60 z-20">
                    <div class="flex items-center gap-2 min-w-0">
                        <button
                            type="button"
                            class="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center rounded-1.5 text-regular hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                            aria-label="Open navigation"
                            aria-controls="superadmin-sidebar"
                            [attr.aria-expanded]="isNavOpen()"
                            (click)="openNav()"
                        >
                            <physio-icon name="menu" [size]="20" />
                        </button>
                        <h1 class="text-sm font-semibold text-regular m-0 truncate">{{ pageTitle }}</h1>
                    </div>
                    <a
                        *ngIf="hasStaffRole$ | async"
                        routerLink="/admin"
                        class="flex items-center gap-1.5 px-2 py-2 -mr-2 rounded-1.5 text-xs text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                    >
                        <physio-icon name="arrow-left" [size]="14" />
                        Back to Admin
                    </a>
                </header>

                <main id="superadmin-main" tabindex="-1" class="flex-1 min-h-0 min-w-0 overflow-auto p-4 focus:outline-none" custom-scrollbar>
                    <router-outlet *ngIf="!loaded() || menus().length"></router-outlet>
                    <div
                        *ngIf="loaded() && !menus().length"
                        class="h-full min-h-[60vh] flex flex-col items-center justify-center text-center gap-2"
                        role="status"
                    >
                        <h2 class="text-lg font-bold text-regular m-0">No pages available</h2>
                        <p class="text-sm text-secondary m-0 max-w-sm">
                            No Super Admin menu has been configured for your account, so there is no page to open.
                            Add menu items in the admin menu settings, or contact an administrator.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    `
})
export class SuperadminLayoutComponent implements OnInit, OnDestroy {
    // #region Inject Services
    private authSrv = inject(AuthService);
    private router = inject(Router);
    private menuSrv = inject(MenuService);
    // #endregion

    // #region Inputs, Outputs, Properties
    userInfo$ = this.authSrv.userInfo$;
    /** `/admin` is the tenant workspace; a SUPER_ADMIN only reaches it when also holding a staff role. */
    hasStaffRole$ = this.authSrv.role$.pipe(map(isStaff));
    pageTitle = 'Super Admin';
    menus = this.menuSrv.superadminMenus;
    loaded = this.menuSrv.loaded;
    isNavOpen = signal(false);
    private destroy$ = new Subject<void>();
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.updateTitle();
        this.router.events.pipe(
            filter(e => e instanceof NavigationEnd),
            takeUntil(this.destroy$)
        ).subscribe(() => {
            this.updateTitle();
            this.closeNav();
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    // #endregion

    // #region Methods
    @HostListener('document:keydown.escape')
    closeNav() {
        this.isNavOpen.set(false);
    }

    openNav() {
        this.isNavOpen.set(true);
    }

    logout() {
        this.authSrv.signOut();
    }

    private updateTitle() {
        const url = this.router.url;
        const items = this.menus().flatMap(g => g.children ?? []);
        const match = items.find(i => url.startsWith(i.route));
        this.pageTitle = match?.label ?? 'Super Admin';
    }
    // #endregion
}
