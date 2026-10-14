import { SocialAuthService } from "@abacritt/angularx-social-login";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { MenuService } from "../../../../services/admin/menu.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { AVATAR } from "../../../../shared/data/dummy";
import { SharedModule } from "../../../../shared/shared-imports";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { BooAvatarComponent } from "../../../image/avatar/boo-avatar.component";
import { PopupComponent } from "../../../popup/popup.component";
import { SidebarItemComponent } from "./sidebar-item/sidebar-item.component";

@Component({
    selector: 'admin-layout-sidebar',
    standalone: true,
    imports: [
        SharedModule,
        SidebarItemComponent,
        BooAvatarComponent,
        PopupComponent,
        ButtonIconComponent
    ],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})

export class AdminLayoutSideBarComponent {
    // #region Inputs, Outputs, Properties
    menus = this.menuSrv.adminMenus;
    userInfo$ = this.authSrv.userInfo$;
    defaultAvatar = AVATAR;
    isOpen: boolean = false;

    @Input() isCollapsed!: boolean;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private authSrv: AuthService,
        private menuSrv: MenuService,
        private router: Router,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private oauthSrv: SocialAuthService
    ) { }
    // #endregion

    // #region Events
    logout() {
        this.oauthSrv.signOut().catch(() => { });
        this.router.navigate(['/auth/login']).then(() => {
            this.authSrv.logout().subscribe({ error: () => { } });
        });
    }
    // #endregion
}