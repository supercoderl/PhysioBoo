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
    <div class="flex w-full relative items-center">
      <label
        (click)="focusInput()"
        [class]="labelClasses"
        [style.color]="placeholderColor"
        *ngIf="!model" 
      >
        {{ label }} <span *ngIf="required" class="text-red-500 ml-0.5">*</span>
      </label>

      <div class="flex-auto relative w-full">
        <input
          #inputElement
          [id]="id || name"
          [name]="name"
          [type]="type"
          [disabled]="disabled"
          [maxlength]="maxlength"
          
          [(ngModel)]="model" 
          (ngModelChange)="onModelChange($event)"
          (blur)="onTouched()"
          
          [class]="inputClasses"
          [style.border-radius.px]="radius"
          [style.background-color]="backgroundColor"
          [style.border-width.px]="borderWidth"
          [style.border-color]="borderColor"
          
          autocomplete="off"
        />

        <div class="absolute right-0 top-0 h-full flex items-center pr-3">
            <ng-content select="[endfix]"></ng-content>
        </div>
      </div>
    </div>
  `,
  host: {
    'class': 'block w-full relative group mb-0',
  },
})
export class BooInputComponent {
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() type: string = 'text';
  @Input() size: "small" | "medium" | "large" = "medium";
  @Input() maxlength: number = 400;
  @Input() radius: number = 6; 
  @Input() backgroundColor: string = 'white';
  @Input() borderWidth: number = 1;
  @Input() borderColor: string = '#e6e8ee';
  @Input() placeholderColor: string = '#64748B'; // Slate-500
  @ViewChild('inputElement') inputElement!: ElementRef;

  model: string = '';
  disabled: boolean = false;

  get labelClasses(): string {
    const base = 'absolute left-0 z-[1] flex items-center transition-all duration-300 cursor-text truncate pointer-events-none';
    const focusEffect = 'group-focus-within:translate-x-4 group-focus-within:opacity-0 group-focus-within:invisible';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 text-xs'; break;
      case 'large':  sizeClass = 'px-5 text-base'; break;
      default:       sizeClass = 'px-4 text-sm'; break; // medium
    }

    return `${base} ${focusEffect} ${sizeClass}`;
  }

  get inputClasses(): string {
    const base = 'block w-full text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 h-8.5 text-xs'; break;
      case 'large':  sizeClass = 'px-5 h-12 text-base'; break;
      default:       sizeClass = 'px-4 h-11 text-sm'; break; // medium
    }

    const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : '';

    return `${base} ${sizeClass} ${disabledClass}`;
  }
  // #endregion

  // #region Methods
  focusInput(): void {
    if (!this.disabled) {
      this.inputElement.nativeElement.focus();
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
