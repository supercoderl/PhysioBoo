import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooIconComponent } from '../icon/icon.component';

/**
 * Large search box of the public listing intros: search icon (a spinner while `busy`), visually hidden label and a
 * clear button. Bind it with `ngModel` or a form control. The clear button only emits `clear`; the parent resets the
 * value, so it can also reset whatever the search drives.
 */
@Component({
  selector: 'boo-search-field',
  standalone: true,
  imports: [NgIf, BooIconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BooSearchFieldComponent), multi: true }],
  template: `
    <label class="w-full h-14 flex gap-3 items-center px-4 bg-surface border border-gray-300 rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <physio-icon
        [name]="busy ? 'loader-circle' : 'search'"
        [size]="19"
        class="text-gray-600 flex-none"
        [class.animate-spin]="busy"
      />
      <span class="sr-only">{{ label }}</span>
      <input
        type="search"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [placeholder]="placeholder"
        [attr.maxlength]="maxlength"
        [disabled]="disabled"
        autocomplete="off"
        class="border-0 outline-none text-base w-full bg-transparent text-gray-900 placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden"
      />
      <button
        *ngIf="value"
        type="button"
        (click)="clear.emit()"
        [attr.aria-label]="clearLabel"
        class="w-8 h-8 flex-none rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-200"
      >
        <physio-icon name="x" [size]="16" />
      </button>
    </label>
  `,
  host: { class: 'block' },
})
export class BooSearchFieldComponent implements ControlValueAccessor {
  /** Accessible name of the input (visually hidden). */
  @Input({ required: true }) label = '';
  @Input() placeholder = '';
  @Input() maxlength: number | null = 100;
  @Input() clearLabel = 'Clear search';
  /** Shows a spinner in place of the search icon, e.g. between a keystroke and its debounced search. */
  @Input() busy = false;
  @Output() clear = new EventEmitter<void>();

  value = '';
  disabled = false;

  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  writeValue(value: string | null | undefined): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
