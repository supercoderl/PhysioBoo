import { Component, Input } from '@angular/core';
import { BooIconComponent } from '../icon/icon.component';

/**
 * Validation message under a form field. Put the message inside the element and give the host the id the field's
 * `aria-describedby` points to:
 * `<boo-field-error *ngIf="errorFor('name') as e" id="ct-name-err">{{ e }}</boo-field-error>`.
 *
 * `size="sm"` is the compact 12px message used in drawers and dialogs; `announce` makes screen readers read it out
 * as soon as it appears (use it for messages that show after a failed save, not for per-keystroke hints).
 */
@Component({
  selector: 'boo-field-error',
  standalone: true,
  imports: [BooIconComponent],
  template: `<physio-icon name="circle-alert" [size]="size === 'sm' ? 12 : 14" [class]="size === 'sm' ? 'flex-none mt-px' : 'flex-none mt-[3px]'" /><span><ng-content></ng-content></span>`,
  host: {
    '[class]': 'hostClass',
    '[attr.role]': "announce ? 'alert' : null",
  },
})
export class BooFieldErrorComponent {
  @Input() size: 'sm' | 'md' = 'md';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) announce = false;

  get hostClass(): string {
    return 'motion-feedback text-danger flex gap-1.5 items-start ' + (this.size === 'sm' ? 'text-xs' : 'text-[13px] leading-[19px]');
  }
}
