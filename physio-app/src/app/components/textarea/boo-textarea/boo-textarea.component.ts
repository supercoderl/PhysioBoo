import { Component, ElementRef, forwardRef, inject, Injector, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';
import { BOO_FORM_FIELD, booValidationMessage } from '@physioboo/ui';

@Component({
  selector: 'boo-textarea',
  standalone: true,
  imports: [
    SharedModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooTextareaComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex w-full relative items-start">
      <label
        (click)="focusTextarea()"
        [class]="labelClasses"
        [style.color]="placeholderColor || null"
        *ngIf="!model" 
      >
        {{ label }} <span *ngIf="required" class="text-form-error ml-0.5">*</span>
      </label>

      <div class="flex-auto relative w-full">
        <textarea
          #textareaElement
          [id]="id || name"
          [name]="name"
          [disabled]="disabled"
          [readOnly]="readonly"
          [maxlength]="maxlength"
          [rows]="rows"
          [cols]="cols"
          
          [(ngModel)]="model" 
          (ngModelChange)="onModelChange($event)"
          (blur)="onTouched()"
          
          [class]="textareaClasses"
          [style.border-radius.px]="radius"
          [style.background-color]="backgroundColor || null"
          [style.border-width.px]="borderWidth"
          [style.border-color]="errorText ? 'rgb(var(--form-error))' : success ? 'rgb(var(--form-success))' : (borderColor || null)"
          [attr.aria-invalid]="errorText ? true : null"
          
          autocomplete="off"
        ></textarea>

        <div class="absolute right-0 top-0 h-full flex items-start pr-3 pt-3">
            <ng-content select="[endfix]"></ng-content>
        </div>
      </div>
    </div>
    <p *ngIf="errorText && !inField" class="mt-1 mb-0 text-xs text-form-error" role="alert">{{ errorText }}</p>
  `,
  host: {
    'class': 'block w-full relative group/field mb-0',
  },
})
export class BooTextareaComponent {
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() size: "small" | "medium" | "large" = "medium";
  @Input() rows: number = 4;
  @Input() cols: number = 40;
  @Input() maxlength: number = 2000;
  @Input() radius: number = 6; 
  @Input() backgroundColor: string = '';
  @Input() borderWidth: number = 1;
  @Input() borderColor: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) readonly: boolean = false;
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) success: boolean = false;
  @Input() placeholderColor: string = '';
  @ViewChild('textareaElement') textareaElement!: ElementRef;

  private readonly injector = inject(Injector);
  /** Inside a `boo-form-field` the field shows the validation message. */
  readonly inField = !!inject(BOO_FORM_FIELD, { optional: true });
  model: string = '';
  disabled: boolean = false;

  /** Validation message of the bound form control, shown once it has been touched (e.g. by a failed save). */
  get errorText(): string | null {
    return booValidationMessage(this.injector.get(NgControl, null, { self: true, optional: true })?.control, this.label);
  }


  get labelClasses(): string {
    const base = 'absolute left-0 top-0 z-[1] text-form-muted flex items-center transition-all duration-300 cursor-text truncate pointer-events-none';
    const focusEffect = 'group-focus-within/field:translate-x-4 group-focus-within/field:opacity-0 group-focus-within/field:invisible';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 pt-2 text-xs'; break;
      case 'large':  sizeClass = 'px-5 pt-4 text-base'; break;
      default:       sizeClass = 'px-4 pt-3 text-sm'; break; // medium
    }

    return `${base} ${focusEffect} ${sizeClass}`;
  }

  get textareaClasses(): string {
    const base = 'block w-full bg-form-surface border-form-border hover:border-form-border-hover text-form-text transition-colors focus:outline-none focus:ring-1 focus:ring-form-accent focus:border-form-accent resize-y';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 py-2 text-xs'; break;
      case 'large':  sizeClass = 'px-5 py-4 text-base'; break;
      default:       sizeClass = 'px-4 py-3 text-sm'; break; // medium
    }

    const disabledClass = this.disabled ? '!bg-form-subtle !text-form-muted cursor-not-allowed' : '';
    const readonlyClass = this.readonly && !this.disabled ? '!bg-form-subtle focus:!ring-0' : '';

    return `${base} ${sizeClass} ${disabledClass} ${readonlyClass}`;
  }
  // #endregion

  // #region Methods
  focusTextarea(): void {
    if (!this.disabled) {
      this.textareaElement.nativeElement.focus();
    }
  }

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.model = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(val: string) {
    this.model = val;
    this.onChange(val);
  }
  // #endregion
}