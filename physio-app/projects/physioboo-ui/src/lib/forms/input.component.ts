import { NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, inject, Injector, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { BooControlSize } from './control-size';
import { BOO_FORM_FIELD } from './form-field-context';
import { booValidationMessage } from './validation-message';

@Component({
  selector: 'boo-input',
  standalone: true,
  imports: [NgIf, FormsModule],
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
        *ngIf="!hasValue" 
      >
        {{ label }} <span *ngIf="required" class="text-form-error ml-0.5">*</span>
      </label>

      <div class="flex-auto relative w-full">
        <input
          #inputElement
          [id]="id || name"
          [name]="name"
          [type]="type"
          [disabled]="disabled"
          [readOnly]="readonly"
          [maxlength]="maxlength"
          [attr.min]="min"
          [attr.max]="max"
          [attr.step]="step"
          [attr.inputmode]="inputmode"
          [attr.aria-label]="ariaLabel || null"
          [attr.aria-describedby]="ariaDescribedby || null"
          
          [(ngModel)]="model" 
          (ngModelChange)="onModelChange($event)"
          (blur)="onTouched()"
          
          [class]="inputClasses"
          [attr.aria-invalid]="errorText ? true : null"
          [class.empty-date]="type === 'date' && !hasValue"
          [style.border-radius.px]="radius"
          [style.border-width.px]="borderWidth"
          
          autocomplete="off"
        />

        <div class="absolute right-0 top-0 h-full flex items-center pr-3">
            <ng-content select="[endfix]"></ng-content>
        </div>
      </div>
    </div>
    <p *ngIf="errorText && !inField" class="mt-1 mb-0 text-xs text-form-error" role="alert">{{ errorText }}</p>
  `,
  styles: [`
    input[type="date"].empty-date:not(:focus)::-webkit-datetime-edit {
      color: transparent;
    }
  `],
  host: {
    'class': 'block w-full relative group/field mb-0',
  },
})
export class BooInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  // #region Inputs, Outputs, Properties
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() type: string = 'text';
  @Input() size: BooControlSize = "middle";
  @Input() maxlength: number = 400;
  /** Native `min`, `max`, `step` and `inputmode` for numeric fields. */
  @Input() min: number | string | null = null;
  @Input() max: number | string | null = null;
  @Input() step: number | string | null = null;
  @Input() inputmode: string | null = null;
  /** Accessible name when no visible label sits outside the control (e.g. an inline editor). */
  @Input() ariaLabel: string = "";
  /** Id of the element that describes the field (helper text outside `boo-form-field`). */
  @Input() ariaDescribedby: string = "";
  /** Emit a number (null when empty) instead of a string; a native number input does this, a bound `type` does not. */
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) numberValue: boolean = false;
  @Input() radius: number = 6;
  @Input() borderWidth: number = 1;
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) readonly: boolean = false;
  /** Success border; the message belongs to the surrounding `boo-form-field`. */
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) success: boolean = false;
  /** Milliseconds of typing pause before `search` emits. */
  @Input() debounce: number = 500;
  @Output() search = new EventEmitter<string>();
  @ViewChild('inputElement') inputElement!: ElementRef;

  model: any = '';
  disabled: boolean = false;
  private readonly injector = inject(Injector);
  /** Inside a `boo-form-field` the field shows the validation message. */
  readonly inField = !!inject(BOO_FORM_FIELD, { optional: true });
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  /** Validation message of the bound form control, shown once it has been touched (e.g. by a failed save). */
  get errorText(): string | null {
    return booValidationMessage(this.injector.get(NgControl, null, { self: true, optional: true })?.control, this.label);
  }

  get hasValue(): boolean {
    return this.model !== null && this.model !== undefined && this.model !== '';
  }

  get labelClasses(): string {
    const base = 'absolute left-0 z-[1] text-form-muted flex items-center transition-all duration-300 cursor-text truncate pointer-events-none';
    const focusEffect = 'group-focus-within/field:translate-x-4 group-focus-within/field:opacity-0 group-focus-within/field:invisible';

    let sizeClass = '';
    switch (this.size) {
      case 'small': sizeClass = 'px-3 text-xs'; break;
      case 'large': sizeClass = 'px-5 text-base'; break;
      default: sizeClass = 'px-4 text-sm'; break; // middle
    }

    return `${base} ${focusEffect} ${sizeClass}`;
  }

  get inputClasses(): string {
    const base = 'block bg-form-surface border-form-border hover:border-form-border-hover w-full text-form-text transition-colors focus:outline-none focus:ring-1 focus:ring-form-accent focus:border-form-accent';

    let sizeClass = '';
    switch (this.size) {
      case 'small': sizeClass = 'px-3 h-8.5 text-xs'; break;
      case 'large': sizeClass = 'px-5 h-12 text-base'; break;
      default: sizeClass = 'px-4 h-11 text-sm'; break; // middle
    }

    const disabledClass = this.disabled ? '!bg-form-subtle !text-form-muted cursor-not-allowed hover:!border-form-border' : '';
    const readonlyClass = this.readonly && !this.disabled ? 'bg-form-subtle hover:!border-form-border focus:!border-form-border focus:!ring-0' : '';
    const successClass = this.success && !this.errorText ? '!border-form-success focus:!ring-form-success' : '';
    const errorClass = this.errorText ? '!border-form-error focus:!ring-form-error' : '';

    return `${base} ${sizeClass} ${disabledClass} ${readonlyClass} ${successClass} ${errorClass}`;
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(this.debounce),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.search.emit(val || '');
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  // #endregion

  // #region Methods
  focusInput(): void {
    if (!this.disabled) {
      this.inputElement.nativeElement.focus();
    }
  }

  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: any): void {
    if (value !== null && value !== undefined) {
      this.model = value;
    } else {
      this.model = '';
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
    this.onChange(this.numberValue ? (val === '' || val === null || val === undefined ? null : Number(val)) : val);
    this.searchSubject.next(val);
  }
  // #endregion
}
