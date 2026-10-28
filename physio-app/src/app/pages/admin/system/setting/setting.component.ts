import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../../services/auth/auth.service";
import { SETTINGS_MANAGEMENT } from "../../../../shared/data/dummy";
import { SharedModule } from "../../../../shared/shared-imports";
import { canOpenNavLink, childRoutePermissions } from "../../../../shared/utils/route-permission.utils";

/**
 * Settings frame: the section list on the left (a scrolling strip on narrow screens) and the routed section in a
 * card on the right. The routed page's host fills the card as a flex column (see `styles`), so list pages can give
 * their table every pixel left under the heading and form pages scroll inside their own pane.
 */
@Component({
    selector: 'admin-system-setting',
    standalone: true,
    imports: [
        SharedModule
    ],
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' },
    template: `
        <div class="flex flex-1 min-h-0 min-w-0 flex-col md:flex-row bg-[#F6F7F8] dark:bg-transparent">
            <nav
                class="shrink-0 md:w-[260px] xl:w-[300px] md:h-full md:overflow-y-auto boo-scrollbar"
                aria-label="Settings sections"
            >
                <p class="hidden md:block m-0 px-4 pt-4 pb-3 tracking-tight font-extrabold leading-none text-[24px] text-regular">Settings</p>
                <ul class="m-0 p-0 list-none flex md:flex-col gap-1 px-1 md:px-3 pb-2 overflow-x-auto md:overflow-visible boo-scrollbar">
                    <li *ngFor="let setting of settings" class="shrink-0">
                        <a
                            class="group flex items-center gap-2.5 p-2 rounded-md min-h-9 text-[13px] font-medium leading-none text-regular no-underline hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                            [routerLink]="setting.route"
                            routerLinkActive="!bg-black/[0.06]"
                            ariaCurrentWhenActive="page"
                            #rla="routerLinkActive"
                        >
                            <physio-icon [name]="setting.icon" [size]="16" class="shrink-0" [class.text-primary]="rla.isActive" />
                            <span class="flex min-w-0 flex-auto flex-col items-start gap-1">
                                <span class="leading-none truncate max-w-full text-[13px]" [class.font-semibold]="rla.isActive">{{ setting.name }}</span>
                                <span class="hidden md:block leading-none text-[11px] truncate max-w-full text-secondary font-normal">{{ setting.description }}</span>
                            </span>
                        </a>
                    </li>
                </ul>
            </nav>

            <div class="flex flex-col flex-1 min-h-0 min-w-0 md:pt-0.5 md:pl-0.5 z-[9999]">
                <div class="settings-pane bg-surface relative flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden shadow-card rounded-t-xl md:rounded-tr-none md:rounded-tl-xl">
                    <div class="settings-outlet flex flex-col flex-1 min-h-0 min-w-0 px-4 sm:px-6">
                        <router-outlet></router-outlet>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        /* Same contract as the shell's #wrapper: the routed page host is a flex column that fills the pane. */
        .settings-outlet > :not(router-outlet) {
            display: flex;
            flex: 1 1 0%;
            flex-direction: column;
            min-height: 0;
            min-width: 0;
        }
    `]
})

export class AdminSystemSettingComponent {
    // #region Inputs, Outputs, Properties
    private readonly requiredPermissions = childRoutePermissions(inject(ActivatedRoute));
    private readonly authSrv = inject(AuthService);

    /** Only the settings the signed-in user is allowed to open. */
    get settings() {
        return SETTINGS_MANAGEMENT.filter(s =>
            canOpenNavLink(s.route, this.requiredPermissions, code => this.authSrv.hasPermission(code)));
    }
    // #endregion
}
