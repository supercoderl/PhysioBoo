import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';

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
        [style.color]="placeholderColor"
        *ngIf="!model" 
      >
        {{ label }} <span *ngIf="required" class="text-red-500 ml-0.5">*</span>
      </label>

      <div class="flex-auto relative w-full">
        <textarea
          #textareaElement
          [id]="id || name"
          [name]="name"
          [disabled]="disabled"
          [maxlength]="maxlength"
          [rows]="rows"
          [cols]="cols"
          
          [(ngModel)]="model" 
          (ngModelChange)="onModelChange($event)"
          (blur)="onTouched()"
          
          [class]="textareaClasses"
          [style.border-radius.px]="radius"
          [style.background-color]="backgroundColor"
          [style.border-width.px]="borderWidth"
          [style.border-color]="borderColor"
          
          autocomplete="off"
        ></textarea>

        <div class="absolute right-0 top-0 h-full flex items-start pr-3 pt-3">
            <ng-content select="[endfix]"></ng-content>
        </div>
      </div>
    </div>
  `,
  host: {
    'class': 'block w-full relative group mb-0',
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
  @Input() backgroundColor: string = 'white';
  @Input() borderWidth: number = 1;
  @Input() borderColor: string = '#e6e8ee';
  @Input() placeholderColor: string = '#64748B'; // Slate-500
  @ViewChild('textareaElement') textareaElement!: ElementRef;

  model: string = '';
  disabled: boolean = false;

  get labelClasses(): string {
    const base = 'absolute left-0 top-0 z-[1] flex items-center transition-all duration-300 cursor-text truncate pointer-events-none';
    const focusEffect = 'group-focus-within:translate-x-4 group-focus-within:opacity-0 group-focus-within:invisible';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 pt-2 text-xs'; break;
      case 'large':  sizeClass = 'px-5 pt-4 text-base'; break;
      default:       sizeClass = 'px-4 pt-3 text-sm'; break; // medium
    }

    return `${base} ${focusEffect} ${sizeClass}`;
  }

  get textareaClasses(): string {
    const base = 'block w-full text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-y';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 py-2 text-xs'; break;
      case 'large':  sizeClass = 'px-5 py-4 text-base'; break;
      default:       sizeClass = 'px-4 py-3 text-sm'; break; // medium
    }

    const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : '';

    return `${base} ${sizeClass} ${disabledClass}`;
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