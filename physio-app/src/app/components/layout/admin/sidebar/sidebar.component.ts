import { Component, Input } from "@angular/core";
import { ChevronUp, FileCheck, Info } from "lucide-angular";
import { MENUS } from "../../../../shared/data/dummy";
import { SharedModule } from "../../../../shared/shared-imports";
import { SidebarItemComponent } from "./sidebar-item/sidebar-item.component";

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

export class AdminLayoutSideBarComponent {
    fileCheck = FileCheck;
    info = Info;
    chevronUp = ChevronUp;
    menus = MENUS;

    @Input() isCollapsed!: boolean;
}