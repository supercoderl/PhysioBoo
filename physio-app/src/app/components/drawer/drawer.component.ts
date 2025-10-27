import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';

@Component({
  selector: 'drawer',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div 
      [ngClass]="{
        'fixed inset-0 z-[1000]': true,
        'pointer-events-auto': isOpen,
        'pointer-events-none': !isOpen
      }"
    >
      <!-- overlay -->
      <div
        aria-hidden="true"
        (click)="onClose.emit()"
        [ngClass]="{
          'transition-opacity duration-300 ease-in-out fixed fixed inset-0 bg-[rgba(0,_0,_0,_0.5)]': true,
          'opacity-100': isOpen,
          'opacity-0': !isOpen
        }"
      ></div>

      <div
        [ngClass]="{
          'transition-transform duration-300 ease-in-out w-[280px] bg-white text-black flex flex-col h-full fixed top-0 right-0': true,
          'translate-x-0': isOpen,
          'translate-x-[280px]': !isOpen
        }"
      >
        <div class="relative overscroll-contain min-h-full">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class DrawerComponent {
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @Input() isOpen: boolean = false;
}
