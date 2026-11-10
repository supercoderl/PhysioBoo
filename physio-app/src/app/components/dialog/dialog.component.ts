import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BooButtonComponent, BooDialogComponent, booMotionState } from '@physioboo/ui';
import { DialogService } from '../../services/common/dialog.service';
import { SharedModule } from '../../shared/shared-imports';
import { isPublicUrl } from '../../shared/utils/motion.utils';

@Component({
  selector: 'global-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooDialogComponent],
  animations: [
    trigger('backdrop', [
      transition('void => admin', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition('admin => void', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ]),
      transition('void => full', [
        style({ opacity: 0 }),
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1 }))
      ]),
      transition('full => void', [
        animate('150ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0 }))
      ]),
      transition('void => reduced', [
        style({ opacity: 0 }),
        animate('100ms linear', style({ opacity: 1 }))
      ]),
      transition('reduced => void', [
        animate('80ms linear', style({ opacity: 0 }))
      ])
    ]),
  ],
  template: `
    @if (dialogService.dialogState(); as data) {
      <boo-dialog
        [@backdrop]="mode"
        [heading]="data.title"
        [description]="data.message"
        [tone]="data.type"
        [alert]="true"
        [closable]="false"
        (dismiss)="dialogService.close()"
      >
        <button type="button" boo-button boo-dialog-footer variant="secondary" size="sm" (click)="data.onCancel ? data.onCancel() : dialogService.close()">
          {{ data.cancelText }}
        </button>
        <button type="button" boo-button boo-dialog-footer size="sm" [variant]="data.type === 'danger' ? 'danger' : 'primary'" (click)="data.onConfirm()">
          {{ data.confirmText }}
        </button>
      </boo-dialog>
    }
  `
})
export class DialogComponent {
  // #region Inputs, Outputs, Properties
  dialogService = inject(DialogService);
  private readonly router = inject(Router);
  private readonly motion = booMotionState();

  get mode(): 'admin' | 'full' | 'reduced' {
    return isPublicUrl(this.router.url) ? this.motion : 'admin';
  }
  // #endregion

}