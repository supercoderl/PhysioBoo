import { Component, ElementRef, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '../../shared/shared-imports';

@Component({
    selector: 'boo-datepicker',
    standalone: true,
    imports: [
        SharedModule
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BooDatepickerComponent),
            multi: true
        }
    ],
    template: `
    <div class="flex w-full relative items-center">
      <label
        (click)="focusInput()"
        [class]="labelClasses"
        [style.color]="placeholderColor"
        *ngIf="!model && inputType === 'text'" 
      >
        {{ label }} <span *ngIf="required" class="text-red-500 ml-0.5">*</span>
      </label>

      <div class="flex-auto relative w-full">
        <input
          #inputElement
          [id]="id || name"
          [name]="name"
          [type]="inputType" 
          [disabled]="disabled"
          
          [(ngModel)]="model" 
          (ngModelChange)="onModelChange($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          (click)="onFocus()"
          
          [class]="inputClasses"
          [style.border-radius.px]="radius"
          [style.background-color]="backgroundColor"
          [style.border-width.px]="borderWidth"
          [style.border-color]="borderColor"
          
          autocomplete="off"
        />

        <div 
            class="absolute right-0 top-0 h-full flex items-center pr-3 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
            (click)="openPicker($event)"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        </div>
      </div>
    </div>
  `,
    host: {
        'class': 'block w-full relative group mb-0',
    },
})
export class BooDatepickerComponent implements ControlValueAccessor {
    // #region Inputs, Outputs, Properties
    @Input() label: string = '';
    @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
    @Input() id: string = '';
    @Input() name: string = '';
    @Input() size: "small" | "medium" | "large" = "medium";
    @Input() radius: number = 6;
    @Input() backgroundColor: string = 'white';
    @Input() borderWidth: number = 1;
    @Input() borderColor: string = '#e6e8ee';
    @Input() placeholderColor: string = '#64748B';

    @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

    model: string = '';
    disabled: boolean = false;

    inputType: 'text' | 'date' = 'text';

    get labelClasses(): string {
        const base = 'absolute left-0 z-[1] flex items-center transition-all duration-300 cursor-text truncate pointer-events-none';
        const focusEffect = 'group-focus-within:translate-x-4 group-focus-within:opacity-0 group-focus-within:invisible';

        let sizeClass = '';
        switch (this.size) {
            case 'small': sizeClass = 'px-3 text-xs'; break;
            case 'large': sizeClass = 'px-5 text-base'; break;
            default: sizeClass = 'px-4 text-sm'; break;
        }

        return `${base} ${focusEffect} ${sizeClass}`;
    }

    get inputClasses(): string {
        const base = 'block w-full text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 placeholder:text-transparent';

        let sizeClass = '';
        switch (this.size) {
            case 'small': sizeClass = 'px-3 h-8.5 text-xs'; break;
            case 'large': sizeClass = 'px-5 h-12 text-base'; break;
            default: sizeClass = 'px-4 h-11 text-sm'; break;
        }

        const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : '';

        return `${base} ${sizeClass} ${disabledClass} boo-date-input`;
    }
    // #endregion

    // #region Methods
    focusInput(): void {
        if (!this.disabled) {
            this.inputElement.nativeElement.focus();
            this.onFocus();
        }
    }

    openPicker(event: MouseEvent): void {
        event.stopPropagation();
        if (!this.disabled) {
            this.inputType = 'date';
            setTimeout(() => {
                try {
                    if (this.inputElement.nativeElement.showPicker) {
                        this.inputElement.nativeElement.showPicker();
                    } else {
                        this.inputElement.nativeElement.focus();
                    }
                } catch (error) {
                    this.inputElement.nativeElement.focus();
                }
            }, 0);
        }
    }

    onFocus() {
        this.inputType = 'date';
    }

    onBlur() {
        this.onTouched();
        if (!this.model) {
            this.inputType = 'text';
        }
    }

    onChange: (value: any) => void = () => { };
    onTouched: () => void = () => { };

    writeValue(value: any): void {
        this.model = value || '';
        if (this.model) {
            this.inputType = 'date';
        } else {
            this.inputType = 'text';
        }
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