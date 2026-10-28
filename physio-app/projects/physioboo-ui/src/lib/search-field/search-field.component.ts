import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooIconComponent } from '../icon/icon.component';
import { BooControlSize } from '../forms/control-size';

/**
 * Search box with a search icon (a spinner while `busy`), visually hidden label and a clear button. `large` (the
 * default) is the search of the public listing intros; `small` and `middle` match the heights of `boo-input` and
 * `boo-select`, so the field lines up with them in admin filter toolbars. Bind it with `ngModel` or a form control.
 * The clear button only emits `clear`; the parent resets the value, so it can also reset whatever the search drives.
 */
@Component({
  selector: 'boo-search-field',
  standalone: true,
  imports: [NgIf, BooIconComponent],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BooSearchFieldComponent), multi: true }],
  template: `
    <label [class]="boxClasses" [style.height.px]="height">
      <physio-icon
        [name]="busy ? 'loader-circle' : 'search'"
        [size]="iconSize"
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
        [class]="inputClasses"
      />
      <button
        *ngIf="value"
        type="button"
        (click)="clear.emit()"
        [attr.aria-label]="clearLabel"
        [class]="clearClasses"
      >
        <physio-icon name="x" [size]="size === 'large' ? 16 : 14" />
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
  /** Height and type scale: small 34px, middle 44px, large 56px, as for `boo-input`. */
  @Input() size: BooControlSize = 'large';
  /** Fixed control height in px; overrides the height of `size`, as `boo-select` and `boo-datepicker` allow. */
  @Input() height?: number;
  @Output() clear = new EventEmitter<void>();

  value = '';
  disabled = false;

  get boxClasses(): string {
    const base = 'w-full flex items-center bg-surface border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20';
    switch (this.size) {
      case 'small': return `${base} h-8.5 gap-2 px-3 border-border rounded-md`;
      case 'middle': return `${base} h-11 gap-2.5 px-4 border-border rounded-md`;
      default: return `${base} h-14 gap-3 px-4 border-gray-300 rounded-xl`;
    }
  }

  get inputClasses(): string {
    const base = 'border-0 outline-none focus:outline-none w-full min-w-0 bg-transparent text-gray-900 placeholder:text-gray-500 [&::-webkit-search-cancel-button]:hidden';
    switch (this.size) {
      case 'small': return `${base} text-xs`;
      case 'middle': return `${base} text-sm`;
      default: return `${base} text-base`;
    }
  }

  get clearClasses(): string {
    const box = this.size === 'large' ? 'w-8 h-8 rounded-lg' : 'w-6 h-6 rounded';
    return `${box} flex-none bg-gray-100 flex items-center justify-center text-gray-700 cursor-pointer hover:bg-gray-200`;
  }

  get iconSize(): number {
    switch (this.size) {
      case 'small': return 15;
      case 'middle': return 17;
      default: return 19;
    }
  }

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
