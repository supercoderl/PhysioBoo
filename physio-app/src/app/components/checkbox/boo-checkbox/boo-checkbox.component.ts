import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';
import { Size } from '../../../shared/types/common';

@Component({
  selector: 'boo-checkbox',
  standalone: true,
  imports: [
    SharedModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooCheckboxComponent),
      multi: true
    }
  ],
  template: `
    <label 
      [class]="labelContainerClasses"
      [class.cursor-not-allowed]="disabled"
      [class.opacity-60]="disabled"
    >
      <input
        type="checkbox"
        [id]="id || name"
        [name]="name"
        [disabled]="disabled"
        [checked]="model"
        (change)="onCheckboxChange($event)"
        [class]="checkboxClasses"
        [style.border-radius.px]="radius"
      />

      <span [class]="labelTextClasses">
        <ng-content></ng-content>
        <span *ngIf="label && !hasContent">{{ label }}</span>
        <span *ngIf="required" class="text-red-500 ml-0.5">*</span>
      </span>
    </label>
  `,
  host: {
    'class': 'block relative mb-0',
  },
})
export class BooCheckboxComponent implements ControlValueAccessor {
  // #region Inputs
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() size: Size = "middle";
  @Input() radius: number = 4;
  @Input() borderColor: string = '#D1D5DB';

  model: boolean = false;
  disabled: boolean = false;

  get hasContent(): boolean {
    return false;
  }

  get labelContainerClasses(): string {
    return 'flex items-start cursor-pointer group';
  }

  get labelTextClasses(): string {
    const base = 'inline-block text-[#1d3349] select-none pt-0.5';

    let sizeClass = '';
    switch (this.size) {
      case 'small': sizeClass = 'text-xs'; break;
      case 'large': sizeClass = 'text-base'; break;
      default: sizeClass = 'text-sm'; break; // middle
    }

    return `${base} ${sizeClass}`;
  }

  get checkboxClasses(): string {
    const base = `
      appearance-none
      inline-block relative
      p-0 mr-[0.5em]
      border border-solid
      cursor-pointer
      transition-all duration-200 ease-in-out
      before:absolute before:content-[''] before:z-[2] before:inset-0 before:m-auto
      before:border-l-2 before:border-b-2 before:border-solid
      before:border-white before:bg-transparent
      before:rounded-none before:-rotate-45
    `;

    let sizeClass = '';
    switch (this.size) {
      case 'small': sizeClass = 'top-0.5 min-w-3.5 w-3.5 h-3.5 before:-top-0.5 before:w-1.5 before:h-1'; break;
      case 'large': sizeClass = 'top-1 min-w-5 h-5 w-5 before:-top-1 before:w-2.5 before:h-1.5'; break;
      default: sizeClass = 'top-0.5 min-w-4 w-4 h-4 before:-top-0.5 before:w-2 before:h-1.25'; break; // middle
    }

    const stateClass = this.model
      ? `bg-primary border-primary before:opacity-100`
      : `bg-surface border-gray-300 before:opacity-0 hover:border-primary`;
    const disabledClass = this.disabled ? '!cursor-not-allowed !bg-gray-100 !border-gray-200' : '';
    return `${base} ${sizeClass} ${stateClass} ${disabledClass}`;
  }
  // #endregion

  // #region Methods
  private onChangeCallback: (value: boolean) => void = () => { };
  public onTouchedCallback: () => void = () => { };

  writeValue(value: any): void {
    this.model = !!value;
  }

  registerOnChange(fn: any): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onCheckboxChange(event: Event): void {
    if (this.disabled) return;
    const isChecked = (event.target as HTMLInputElement).checked;
    this.model = isChecked;
    this.onChangeCallback(isChecked);
    this.onTouchedCallback();
  }
  // #endregion
}