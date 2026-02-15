// popup.component.ts
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupPosition } from '../../shared/types/common';

@Component({
    selector: 'popup',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative inline-block w-full" #triggerRef>
      <div (click)="toggle()">
        <ng-content select="[trigger]"></ng-content>
      </div>

      <div 
        *ngIf="isOpen"
        [ngClass]="getPositionClasses()"
        class="absolute z-50 mt-2 bg-surface rounded-lg shadow-lg border border-gray-200 min-w-max"
        #popupRef
      >
        <ng-content select="[content]"></ng-content>
      </div>
    </div>

    <div 
      *ngIf="isOpen && backdrop"
      class="fixed inset-0 z-40"
      (click)="close()"
    ></div>
  `,
    styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class PopupComponent {
    @Input() isOpen = false;
    @Input() position: PopupPosition = 'bottom-right';
    @Input() backdrop = true;
    @Input() closeOnClickOutside = true;
    @Output() isOpenChange = new EventEmitter<boolean>();
    @Output() onOpen = new EventEmitter<void>();
    @Output() onClose = new EventEmitter<void>();

    toggle() {
        this.isOpen = !this.isOpen;
        this.isOpenChange.emit(this.isOpen);

        if (this.isOpen) {
            this.onOpen.emit();
        } else {
            this.onClose.emit();
        }
    }

    open() {
        this.isOpen = true;
        this.isOpenChange.emit(true);
        this.onOpen.emit();
    }

    close() {
        if (this.closeOnClickOutside) {
            this.isOpen = false;
            this.isOpenChange.emit(false);
            this.onClose.emit();
        }
    }

    getPositionClasses(): string {
        const positions: Record<PopupPosition, string> = {
            'bottom-left': 'left-0',
            'bottom-right': 'right-0',
            'top-left': 'left-0 bottom-full mb-2 mt-0',
            'top-right': 'right-0 bottom-full mb-2 mt-0',
            'bottom-center': 'left-1/2 -translate-x-1/2',
            'top-center': 'left-1/2 -translate-x-1/2 bottom-full mb-2 mt-0'
        };

        return positions[this.position] || positions['bottom-right'];
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.isOpen) {
            this.close();
        }
    }
}