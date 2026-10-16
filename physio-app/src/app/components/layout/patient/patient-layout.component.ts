import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { SharedModule } from '../../../shared/shared-imports';
import { BooAvatarComponent } from '../../image/avatar/boo-avatar.component';

interface PatientNavItem {
    label: string;
    icon: string;
    route: string;
    exact: boolean;
}

/**
 * Patient shell. Deliberately separate from the admin/superadmin workspaces: no DB-driven staff menu,
 * a top bar with inline navigation on desktop and a bottom tab bar on mobile.
 * Add an item here only when its page exists in `pages/patient/patient.routes.ts`.
 */
export const PATIENT_NAV: readonly PatientNavItem[] = [
    { label: 'Overview', icon: 'layout-dashboard', route: '/patient', exact: true },
    { label: 'Profile', icon: 'user-round', route: '/patient/profile', exact: false },
    { label: 'Security', icon: 'shield', route: '/patient/security', exact: false },
];

@Component({
    selector: 'patient-layout',
    standalone: true,
    imports: [SharedModule, BooAvatarComponent],
    template: `
        <a
            href="#patient-main"
            class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-1.5 focus:bg-primary focus:text-white"
        >
            Skip to main content
        </a>

        <div id="patient-layout" class="flex flex-col h-svh overflow-hidden font-sans bg-body text-regular">
            <header class="flex-none h-14 bg-surface border-b border-borderGray/60 z-20">
                <div class="h-full max-w-6xl mx-auto px-4 flex items-center gap-4">
                    <a routerLink="/patient" class="flex items-center gap-2.5 shrink-0" aria-label="PhysioBoo patient home">
                        <span class="w-8 h-8 rounded-1.5 bg-logo flex items-center justify-center">
                            <physio-icon name="logo" class="text-white" />
                        </span>
                        <span class="hidden sm:block min-w-0">
                            <span class="block text-sm font-bold leading-none">PhysioBoo</span>
                            <span class="block text-[11px] text-secondary font-medium mt-1 leading-none">My health</span>
                        </span>
                    </a>

                    <nav class="hidden md:flex items-center gap-1 ml-4" aria-label="Patient navigation">
                        <a
                            *ngFor="let item of nav"
                            [routerLink]="item.route"
                            routerLinkActive="bg-sidebarActive text-primaryHover font-semibold"
                            [routerLinkActiveOptions]="{ exact: item.exact }"
                            ariaCurrentWhenActive="page"
                            class="flex items-center gap-2 px-3 py-2 rounded-1.5 text-[13px] text-brandDark hover:bg-sidebarHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                        >
                            <physio-icon [name]="item.icon" [size]="16" />
                            {{ item.label }}
                        </a>
                    </nav>

                    <div class="ml-auto flex items-center gap-2 min-w-0">
                        <a
                            routerLink="/"
                            class="hidden sm:flex items-center gap-1.5 px-2 py-2 rounded-1.5 text-xs text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                        >
                            <physio-icon name="globe" [size]="14" />
                            Website
                        </a>
                        <ng-container *ngIf="userInfo$ | async as user">
                            <boo-avatar [src]="user.avatarUrl" class="shrink-0" />
                            <span class="hidden lg:block text-[13px] font-semibold truncate max-w-[160px]">
                                {{ user.fullName || user.email }}
                            </span>
                        </ng-container>
                        <button
                            type="button"
                            class="w-11 h-11 flex items-center justify-center rounded-1.5 text-danger hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors shrink-0 cursor-pointer"
                            aria-label="Log out"
                            title="Log out"
                            (click)="logout()"
                        >
                            <physio-icon name="power" [size]="18" />
                        </button>
                    </div>
                </div>
            </header>

            <main
                id="patient-main"
                tabindex="-1"
                class="flex-1 min-h-0 overflow-auto focus:outline-none pb-16 md:pb-0"
                custom-scrollbar
            >
                <div class="max-w-6xl mx-auto px-4 h-full">
                    <router-outlet></router-outlet>
                </div>
            </main>

            <nav
                class="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-surface border-t border-borderGray/60 grid"
                [style.grid-template-columns]="'repeat(' + nav.length + ', minmax(0, 1fr))'"
                aria-label="Patient navigation"
            >
                <a
                    *ngFor="let item of nav"
                    [routerLink]="item.route"
                    routerLinkActive="text-primaryHover font-semibold"
                    [routerLinkActiveOptions]="{ exact: item.exact }"
                    ariaCurrentWhenActive="page"
                    class="flex flex-col items-center justify-center gap-1 text-[11px] text-brandDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                >
                    <physio-icon [name]="item.icon" [size]="20" />
                    {{ item.label }}
                </a>
            </nav>
        </div>
    `
})
export class PatientLayoutComponent {
    private authSrv = inject(AuthService);

    readonly nav = PATIENT_NAV;
    userInfo$ = this.authSrv.userInfo$;

    logout() {
        this.authSrv.signOut();
    }
}
