import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { DrawerProperty, PopoverProperty } from "../../../shared/types/common";
import { DrawerComponent } from "../../drawer/drawer.component";
import { PopoverComponent } from "../../popover/popover.component";
import { AdminCloudComponent } from "./cloud/cloud.component";
import { AdminConnectionComponent } from "./connection/connection.component";
import { AdminLanguageComponent } from "./language/language.component";
import { AdminMainHeaderComponent } from "./main-header/main-header.component";
import { AdminNotificationComponent } from "./notification/notification.component";
import { AdminLayoutSideBarComponent } from "./sidebar/sidebar.component";
import { AdminSizeComponent } from "./size/size.component";

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [
    SharedModule,
    AdminLayoutSideBarComponent,
    AdminMainHeaderComponent,
    AdminConnectionComponent,
    DrawerComponent,
    AdminCloudComponent,
    PopoverComponent,
    AdminSizeComponent,
    AdminLanguageComponent,
    AdminNotificationComponent
],
    template: `
        <div id="admin-layout" class="flex flex-auto font-sans">
            <div class="flex min-w-0 flex-auto">
                <admin-layout-sidebar [isCollapsed]="isCollapsed" />
                <main 
                    id="physio-main" 
                    class="relative z-[2000] flex min-h-svh min-w-0 flex-auto flex-col max-h-svh"
                >
                    <admin-main-header 
                        (collapseEvent)="handleCollapse()"
                        (drawerEvent)="handleOpenDrawer($event)"
                        (popoverEvent)="handleOpenPopover($event)"
                    >
                        <popover
                            (onClose)="handleClosePopover()"
                            [isOpen]="popover.isOpen"
                            [trigger]="popover.data"
                        >
                            <admin-size *ngIf="popover.type === 'SIZE'" class="w-80"></admin-size>
                            <admin-language *ngIf="popover.type === 'LANGUAGE'" class="w-full"></admin-language>
                        </popover>
                    </admin-main-header>
                    <div class="flex-1 flex flex-col min-h-0 relative z-20">
                        <div class="flex-1 flex flex-col min-h-0 px-4 bg-[#F6F7F8] overflow-hidden">
                            <div 
                                id="wrapper"
                                class="flex-1 min-h-0 overflow-auto"
                            >
                                <router-outlet></router-outlet>
                            </div>
                        </div>
                    </div>
                </main>
                <admin-connection class="hidden md:block"></admin-connection>
                <div [ngClass]="{
                    'block md:hidden absolute w-full h-full transition-all duration-500': true,
                    'bg-[rgba(0,_0,_0,_0.4)] opacity-100 z-[10]': isCollapsed,
                    'opacity-0 z-[-1]': !isCollapsed
                }" (click)="handleCollapse()"></div>
            </div>
        </div>
        <drawer
           (onClose)="handleCloseDrawer()"
           [isOpen]="drawer.isOpen"
        >
            <admin-cloud *ngIf="drawer.type === 'CLOUD'"></admin-cloud>
            <admin-notification *ngIf="drawer.type === 'NOTIFICATION'"></admin-notification>
        </drawer>
    `,
    styles: `
        #wrapper::-webkit-scrollbar {
            display: none;
        }
    `
})

export class AdminLayoutComponent {
    @Input() currentPath: string = "";
    isCollapsed: boolean = false;
    drawer: DrawerProperty = {
        isOpen: false,
        type: null,
        data: null,
    };
    popover: PopoverProperty = {
        isOpen: false,
        type: null,
        data: null,
    }

    handleCollapse() {
        this.isCollapsed = !this.isCollapsed;
    }

    handleOpenDrawer(event: { type: string | null; data: HTMLElement | null }) {
        this.drawer = { isOpen: true, type: event.type, data: event.data };
    }

    handleCloseDrawer() {
        this.drawer = { isOpen: false, type: null, data: null };
    }

    handleOpenPopover(event: { type: string | null; data: HTMLElement | null }) {
        this.popover = { isOpen: true, type: event.type, data: event.data };
    }

    handleClosePopover() {
        this.popover = { isOpen: false, type: null, data: null };
    }
}