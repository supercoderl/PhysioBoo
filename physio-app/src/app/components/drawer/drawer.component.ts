import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogService } from '../../services/common/dialog.service';
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
        'fixed inset-0 z-[10000]': true,
      }"
      [style.pointer-events]="isOpen ? 'auto' : 'none'"
    >
      <!-- overlay -->
      <div
        aria-hidden="true"
        (click)="onClose()"
        class="transition-opacity duration-300 ease-in-out fixed inset-0 bg-[rgba(0,_0,_0,_0.5)]"
        style="opacity: 0;"
        style="opacity: 0;"
        [style.opacity]="isOpen ? '1' : '0'"
      ></div>

      <div
        class="transition-transform duration-300 ease-in-out bg-surface text-black flex flex-col h-full fixed top-0 right-0"
        style="transform: translateX(100%);"
        [style.transform]="isOpen ? 'translateX(0)' : 'translateX(100%)'"
        [style.width.px]="width"
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
