import { Component, Input, OnInit } from "@angular/core";
import { ChevronUp, FileCheck, Info } from "lucide-angular";
import { SharedModule } from "../../../../shared/shared-imports";
import { SidebarItemComponent } from "./sidebar-item/sidebar-item.component";
import { LocalStorage } from "../../../../shared/utils/storage";
import { MenuItem } from "../../../../shared/types/menu";
import { PaginationData } from "../../../../shared/types/common";

@Component({
    selector: 'admin-layout-sidebar',
    standalone: true,
    imports: [
        SharedModule,
        SidebarItemComponent
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

    @Input() isCollapsed!: boolean;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        const cache = LocalStorage.load<PaginationData<MenuItem>>("menu_data");
        if (cache) {
            this.menus = cache.items.sort((a, b) => a.order - b.order);
        }
    }
    // #endregion
}