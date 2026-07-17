import { SocialAuthService } from "@abacritt/angularx-social-login";
import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ChevronUp, FileCheck, Info } from "lucide-angular";
import { AuthService } from "../../../../services/auth/auth.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { AVATAR } from "../../../../shared/data/dummy";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { MenuItem } from "../../../../shared/types/menu.types";
import { LocalStorage } from "../../../../shared/utils/storage";
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

export class AdminLayoutSideBarComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    fileCheck = FileCheck;
    info = Info;
    chevronUp = ChevronUp;
    menus: MenuItem[] = [];
    userInfo$ = this.authSrv.userInfo$;
    defaultAvatar = AVATAR;
    isOpen: boolean = false;

    @Input() isCollapsed!: boolean;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private authSrv: AuthService,
        private router: Router,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
        private oauthSrv: SocialAuthService
    ) {

    }

    ngOnInit(): void {
        const cache = LocalStorage.load<PaginationData<MenuItem>>("menu_data");
        if (cache) {
            this.menus = cache.items.sort((a, b) => a.order - b.order);
        }
    }
    // #endregion

    // #region Events
    logout() {
        this.oauthSrv.signOut();
        this.authSrv.logout().subscribe({
            next: _ => this.router.navigate(['/auth/login']),
            error: err => this.toastSrv.error(err.message)
        })
    }
    // #endregion
}