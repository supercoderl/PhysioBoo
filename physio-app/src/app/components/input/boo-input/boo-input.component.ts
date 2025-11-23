import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'boo-input',
  standalone: true,
  imports: [
    SharedModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooInputComponent),
      multi: true
    }
  ],
  template: `
    <p class="group flex w-full gap-x-2.5 mb-0">
      <label
        (click)="focusInput()"
        [ngClass]="{
          'flex absolute items-center mb-0 z-[1] transition-all duration-300 group-focus-within:translate-x-5 group-focus-within:opacity-0 group-focus-within:visibility-hidden cursor-text': true,
          'px-3 h-10': size === 'small',
          'px-5 h-12.5': size === 'medium',
          'px-7 h-14.5': size === 'large'
        }"
        [style.color]="placeholderColor"
        *ngIf="model === ''"
      >
        {{ label }} <span *ngIf="required" class="ml-1">*</span>
      </label>
      <span class="inline-flex w-auto flex-col relative flex-auto">
        <input
          #inputElement
          [id]="id || name"
          [name]="name"
          [type]="type"
          [value]="model"
          (input)="onInputChange($event)"
          (blur)="onTouched()"
          [disabled]="disabled"
          size="40"
          maxlength="400"
          [ngClass]="{
            'mb-0 w-full text-[16px] text-[#1D3349] block focus:outline-none': true,
            'px-3 py-0.5 h-10': size === 'small',
            'px-5 py-1.5 h-12.5': size === 'medium',
            'px-7 py-2 h-14.5': size === 'large'
          }"
          [style.border-radius.px]="radius"
          [style.background-color]="backgroundColor"
          [style.border-width.px]="borderWidth"
          [style.border-color]="borderColor"
        />
        <ng-content select="[endfix]"></ng-content>
      </span>
    </p>
  `
})
export class BooInputComponent {
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() type: string = 'text';
  @Input() radius: number = 0;
  @Input() size: "small" | "medium" | "large" = "medium";
  @Input() class: string = '';
  @Input() backgroundColor: string = '#F0F5FF';
  @Input() borderWidth: number = 0;
  @Input() borderColor: string = '#fff';
  @Input() placeholderColor: string = '#1d3349';
  @ViewChild('inputElement') inputElement!: ElementRef;

  model: string = '';
  disabled: boolean = false;
  // #endregion

  // #region Events
  focusInput(): void {
    this.inputElement.nativeElement.focus();
  }

  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.model = input.value;
    this.onChange(this.model);
  }

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
  // #endregion
}
