import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../shared/shared-imports';
import { DialogService } from '../../services/common/dialog.service';

@Component({
  selector: 'drawer',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div 
      [ngClass]="{
        'fixed inset-0 z-[10000]': true,
        'pointer-events-auto': isOpen,
        'pointer-events-none': !isOpen
      }"
    >
      <!-- overlay -->
      <div
        aria-hidden="true"
        (click)="onClose()"
        [ngClass]="{
          'transition-opacity duration-300 ease-in-out fixed fixed inset-0 bg-[rgba(0,_0,_0,_0.5)]': true,
          'opacity-100': isOpen,
          'opacity-0': !isOpen
        }"
      ></div>

      <div
        [ngClass]="{
          'transition-transform duration-300 ease-in-out w-[280px] bg-surface text-black flex flex-col h-full fixed top-0 right-0': true,
        }"
        [style.width.px]="width"
        [style.transform]="'translateX(' + (isOpen ? 0 : width) + 'px)'"
      >
        <div class="relative overscroll-contain min-h-full">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class DrawerComponent {
  // #region Inputs, Outputs, Properties
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Input() isOpen: boolean = false;
  @Input() isShowDialog: boolean = false;
  @Input() width: number = 280;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(private dialogSrv: DialogService) { }
  // #endregion

  // #region Methods 
  onClose() {
    if (this.isShowDialog) {
      this.dialogSrv.confirmUnsavedChanges(
        () => {
          this.close.emit();
        }
      );
    }
    else this.close.emit();
  }
  // #endregion
}
