import { Component } from '@angular/core';
import { BooIconComponent } from '../icon/icon.component';

/**
 * Validation message under a public-site form field. Put the message inside the element and give the host the id the
 * field's `aria-describedby` points to:
 * `<boo-field-error *ngIf="errorFor('name') as e" id="ct-name-err">{{ e }}</boo-field-error>`.
 */
@Component({
  selector: 'boo-field-error',
  standalone: true,
  imports: [BooIconComponent],
  template: `<physio-icon name="circle-alert" [size]="14" class="mt-[3px] flex-none" /><span><ng-content></ng-content></span>`,
  host: { class: 'motion-feedback text-[13px] leading-[19px] text-danger flex gap-1.5 items-start' },
})
export class BooFieldErrorComponent { }
