import { Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { SharedModule } from '../../../shared/shared-imports';
import { Size } from '../../../shared/types/common';

@Component({
    selector: 'boo-json-input',
    standalone: true,
    imports: [SharedModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BooJsonInputComponent),
            multi: true
        }
    ],
    template: `
    <div class="flex flex-col w-full relative border border-border transition-all duration-300 group"
         [class.border-red-400]="!isValid"
         [class.focus-within:border-blue-400]="isValid"
         [class.focus-within:ring-2]="isValid"
         [class.focus-within:ring-blue-100]="isValid"
         [style.border-radius.px]="radius">
      
      <div class="flex items-center justify-between px-3 py-1.5 bg-gray-50/50 border-b border-border">
        <label (click)="focusInput()" class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {{ label }} <span *ngIf="required" class="text-red-500">*</span>
        </label>
        <button type="button" 
                (click)="formatJson()"
                class="text-[10px] bg-white border border-border px-2 py-1 rounded hover:bg-slate-50 transition-colors">
          BEAUTIFY JSON
        </button>
      </div>

      <div class="relative w-full h-full">
        <textarea
          #inputElement
          [id]="id || name"
          [name]="name"
          [disabled]="disabled"
          [(ngModel)]="displayText" 
          (ngModelChange)="onTextChange($event)"
          (blur)="onTouched()"
          [class]="textareaClasses"
          spellcheck="false"
          [style.min-height.px]="minHeight"
          autocomplete="off"
          placeholder='{ "data": [] }'
        ></textarea>
      </div>

      <div class="flex items-center justify-between px-3 py-1 text-[11px] border-t border-border"
           [class.bg-red-50]="!isValid"
           [class.text-red-600]="!isValid"
           [class.text-slate-500]="isValid">
        <span class="truncate">
          {{ isValid ? '✓ Valid JSON' : '✗ ' + errorMessage }}
        </span>
        <span class="ml-2 whitespace-nowrap">Chars: {{ displayText.length }}</span>
      </div>
    </div>
  `,
    host: {
        'class': 'block w-full mb-4',
    },
})
export class BooJsonInputComponent implements OnInit, OnDestroy {
    // #region Inputs, Outputs, Properties
    @ViewChild('inputElement') inputElement!: ElementRef;
    @Input() label: string = 'JSON Editor';
    @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
    @Input() id: string = '';
    @Input() name: string = '';
    @Input() size: Size = "middle";
    @Input() radius: number = 6;
    @Input() minHeight: number = 180;
    @Output() jsonValid = new EventEmitter<boolean>();

    displayText: string = '';
    isValid: boolean = true;
    errorMessage: string = '';
    disabled: boolean = false;

    private destroy$ = new Subject<void>();
    private changeSubject = new Subject<string>();

    get textareaClasses(): string {
        const base = 'block bg-surface w-full text-slate-700 font-mono text-xs p-3 outline-none transition-all leading-relaxed resize-y';
        const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : '';
        return `${base} ${disabledClass}`;
    }
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.changeSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this.destroy$)
        ).subscribe(val => {
            this.processJson(val);
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
    // #endregion

    // #region Methods
    focusInput(): void {
        if (!this.disabled) {
            this.inputElement?.nativeElement.focus();
        }
    }

    onChange: (value: any) => void = () => { };
    onTouched: () => void = () => { };

    writeValue(value: any): void {
        if (value !== null && value !== undefined) {
            this.displayText = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
        } else {
            this.displayText = '';
        }
        this.validateQuietly(this.displayText);
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
    setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

    onTextChange(val: string) {
        this.displayText = val;
        this.changeSubject.next(val);
    }

    private processJson(val: string) {
        if (!val || val.trim() === '') {
            this.isValid = true;
            this.errorMessage = '';
            this.onChange(null);
            this.jsonValid.emit(true);
            return;
        }

        try {
            const parsed = JSON.parse(val);
            this.isValid = true;
            this.errorMessage = '';
            this.onChange(parsed);
            this.jsonValid.emit(true);
        } catch (e: any) {
            this.isValid = false;
            this.errorMessage = e.message;
            this.onChange(null);
            this.jsonValid.emit(false);
        }
    }

    private validateQuietly(val: string) {
        try {
            if (val) JSON.parse(val);
            this.isValid = true;
        } catch (e) {
            this.isValid = false;
        }
    }

    formatJson() {
        try {
            const obj = JSON.parse(this.displayText);
            this.displayText = JSON.stringify(obj, null, 2);
            this.processJson(this.displayText);
        } catch (e) { }
    }
    // #endregion
}