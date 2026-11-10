import { NgIf } from '@angular/common';
import { Component, ContentChild, forwardRef, Input } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { BOO_FORM_FIELD } from './form-field-context';
import { booValidationMessage } from './validation-message';

function flag(v: unknown): boolean { return v === '' || v === true || v === 'true'; }

/**
 * Label above a form control plus one message line below it.
 *
 * `<boo-form-field label="First name" for="reg-first-name" required helper="As on the ID card">
 *    <boo-input name="reg-first-name" formControlName="firstName" label="First name" />
 *  </boo-form-field>`
 *
 * The message line is always reserved (unless `reserveMessageSpace` is false), so an error appearing never moves the
 * fields below. It shows the error, else the success text, else the helper. The error comes from the `error` input, or
 * from the bound control inside the field (shown once it is touched or dirty, like the standalone controls).
 */
@Component({
  selector: 'boo-form-field',
  standalone: true,
  imports: [NgIf],
  providers: [{ provide: BOO_FORM_FIELD, useExisting: forwardRef(() => BooFormFieldComponent) }],
  template: `
    <div *ngIf="label" class="flex items-baseline justify-between gap-2 mb-1.5 min-w-0">
      <label
        [attr.for]="controlId || null"
        [attr.title]="label"
        class="block min-w-0 truncate text-[13px] font-medium leading-[18px] text-form-muted"
      >
        {{ label }}
        <ng-container *ngIf="required">
          <span class="text-form-error" aria-hidden="true">*</span><span class="sr-only"> (required)</span>
        </ng-container>
      </label>
      <span *ngIf="optional" class="flex-none text-xs leading-[18px] text-form-muted">Optional</span>
    </div>

    <ng-content></ng-content>

    <div [class]="messageClasses">
      <p *ngIf="errorText as e; else secondary" role="alert" class="m-0 text-form-error">{{ e }}</p>
      <ng-template #secondary>
        <p *ngIf="success; else helperTpl" class="m-0 text-form-success">{{ success }}</p>
      </ng-template>
      <ng-template #helperTpl>
        <p *ngIf="helper" class="m-0 text-form-muted">{{ helper }}</p>
      </ng-template>
    </div>
  `,
  host: { class: 'block min-w-0' },
})
export class BooFormFieldComponent {
  /** Visible label. Also names the field in the built-in validation messages. */
  @Input() label = '';
  /** `id` of the control the label points to (`name` for boo-input, `id` for the others). */
  @Input('for') controlId = '';
  @Input({ transform: flag }) required = false;
  /** Shows "Optional" beside the label. */
  @Input({ transform: flag }) optional = false;
  @Input() helper = '';
  /** Explicit error text; wins over the bound control's validation message. */
  @Input() error: string | null = null;
  @Input() success: string | null = null;
  /** Control to read validation from when it is not the one inside the field. */
  @Input() control: AbstractControl | null = null;
  /** Keep one message line free under the control so messages never shift the layout. */
  @Input({ transform: (v: unknown) => v !== false && v !== 'false' }) reserveMessageSpace = true;

  @ContentChild(NgControl) private readonly projected?: NgControl;

  get errorText(): string | null {
    return this.error ?? booValidationMessage(this.control ?? this.projected?.control, this.label);
  }

  get messageClasses(): string {
    const base = 'mt-1 text-xs leading-[18px] break-words';
    return this.reserveMessageSpace ? `${base} min-h-[18px]` : base;
  }
}
