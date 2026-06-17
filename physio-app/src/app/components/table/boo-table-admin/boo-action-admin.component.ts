import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { ActionItem } from '../../../shared/types/common';
import { BooIconComponent } from "../../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'boo-action-admin',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent
    ],
    template: `
        <div class="relative inline-block text-left">
            <button 
                type="button"
                #triggerBtn
                (click)="toggle($event)"
                class="flex items-center justify-center w-8 h-8 rounded-sm hover:bg-borderGray focus:outline-none transition-colors duration-200"
                [class.bg-gray-100]="isOpen" 
            >
                <div class="pointer-events-none flex items-center">
                    <boo-icon name="ellipsis" iconClass="stroke-regular" />
                </div>
            </button>

            <div 
                *ngIf="isOpen"
                class="fixed z-[9999] w-48 rounded-md bg-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-down"
                [style.top.px]="menuPosition.y"
                [style.left.px]="menuPosition.x"
                (click)="$event.stopPropagation()" 
            >
                <div class="py-1">
                <button
                    *ngFor="let item of items"
                    (click)="handleAction(item, $event)"
                    class="group flex w-full items-center px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                    [class.text-red-600]="item.isDanger"
                    [class.text-gray-700]="!item.isDanger"
                >
                    <span *ngIf="item.icon" class="mr-3 text-gray-400 group-hover:text-gray-500">
                        <boo-icon [name]="item.icon" />
                    </span>
                    {{ item.label }}
                </button>
                </div>
            </div>
        </div>
    `,
})
export class BooActionAdminComponent {
    // #region Inputs, Outputs, Properties
    @Input() items: ActionItem[] = [];
    @Input() data: any = null;
    isOpen = false;
    menuPosition = { x: 0, y: 0 };
    private static currentOpenMenu: BooActionAdminComponent | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(private eRef: ElementRef) { }
    // #endregion

    // #region Methods
    toggle(event: MouseEvent) {
        event.stopPropagation();
        if (this.isOpen) {
            this.close();
        } else {
            if (BooActionAdminComponent.currentOpenMenu && BooActionAdminComponent.currentOpenMenu !== this) {
                BooActionAdminComponent.currentOpenMenu.close();
            }

            this.calculatePosition();
            this.isOpen = true;

            BooActionAdminComponent.currentOpenMenu = this;
        }
    }

    close() {
        this.isOpen = false;
        if (BooActionAdminComponent.currentOpenMenu === this) {
            BooActionAdminComponent.currentOpenMenu = null;
        }
    }

    handleAction(item: ActionItem, event: MouseEvent) {
        event.stopPropagation();
        this.close();
        if (item.onClick) {
            item.onClick(this.data);
        }
    }

    calculatePosition() {
        const rect = this.eRef.nativeElement.getBoundingClientRect();
        const screenHeight = window.innerHeight;
        const spaceBelow = screenHeight - rect.bottom;

        if (spaceBelow < 200) {
            this.menuPosition = {
                x: rect.right - 192,
                y: rect.top - 5 - (this.items.length * 40)
            };
        } else {
            this.menuPosition = {
                x: rect.right - 192,
                y: rect.bottom + 5
            };
        }
    }

    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (this.isOpen && !this.eRef.nativeElement.contains(event.target)) {
            this.close();
        }
    }

    @HostListener('window:scroll', ['$event'])
    onScroll(event: Event) {
        if (this.isOpen) {
            this.close();
        }
    }
    // #endregion
}