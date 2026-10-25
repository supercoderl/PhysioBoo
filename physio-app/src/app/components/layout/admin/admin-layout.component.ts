import { Component, Input, OnDestroy } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { ScrollbarAutoHideService } from "../../../shared/directives/scrollbar-autohide.service";
import { SharedModule } from "../../../shared/shared-imports";
import { DrawerProperty, PopoverProperty } from "../../../shared/types/common";
import { AdminBreadcrumbComponent } from "../../breadcrumb/admin-breadcrumb.component";
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
    // The shell owns the viewport: a definite dynamic-viewport height that everything below inherits.
    host: { class: 'relative block h-dvh overflow-hidden' },
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
        AdminNotificationComponent,
        AdminBreadcrumbComponent
    ],
    template: `
        <div id="admin-layout" class="flex h-full font-sans">
            <div class="flex h-full min-w-0 flex-auto">
                <admin-layout-sidebar [isCollapsed]="isCollapsed" />
                <main 
                    id="physio-main" 
                    class="relative z-[2000] flex h-full min-h-0 min-w-0 flex-auto flex-col"
                >
                    <admin-main-header 
                        (collapseEvent)="handleCollapse()"
                        (drawerEvent)="handleOpenDrawer($event)"
                        (popoverEvent)="handleOpenPopover($event)"
                    />
                    <div class="flex-1 flex flex-col min-h-0 relative z-20">
                        <div class="flex-1 flex flex-col min-h-0 px-4 bg-body overflow-hidden transition-all duration-300">
                            <admin-breadcrumb class="block shrink-0 pt-4" />
                            <div
                                id="wrapper"
                                class="boo-scrollbar -mr-4 flex-1 min-h-0 min-w-0 flex flex-col overflow-auto pr-4"
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
        <popover
            (onClose)="handleClosePopover()"
            [isOpen]="popover.isOpen"
            [trigger]="popover.data"
        >
            <admin-size *ngIf="popover.type === 'SIZE'" class="w-80"></admin-size>
            <admin-language *ngIf="popover.type === 'LANGUAGE'" class="w-full" (selected)="handleClosePopover()"></admin-language>
        </popover>
        <drawer
           (close)="handleCloseDrawer()"
           [isOpen]="drawer.isOpen"
        >
            <admin-cloud *ngIf="drawer.type === 'CLOUD'"></admin-cloud>
            <admin-notification *ngIf="drawer.type === 'NOTIFICATION'"></admin-notification>
        </drawer>
    `
})

export class AdminLayoutComponent implements OnDestroy {
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

    constructor(router: Router, private scrollbarAutoHide: ScrollbarAutoHideService) {
        this.scrollbarAutoHide.attach();
        // Links inside a drawer or popover navigate away; don't leave the panel over the new page.
        router.events
            .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
            .subscribe(() => {
                if (this.drawer.isOpen) this.handleCloseDrawer();
                if (this.popover.isOpen) this.handleClosePopover();
            });
    }

    ngOnDestroy() {
        this.scrollbarAutoHide.detach();
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