import { Component, ElementRef, forwardRef, HostListener, inject, Injector, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';
import { Size } from '../../../shared/types/common';
import { BOO_FORM_FIELD, booValidationMessage } from '@physioboo/ui';

@Component({
  selector: 'boo-select',
  standalone: true,
  imports: [
    SharedModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full relative group/field" #container>      
      <div
        (click)="toggleDropdown()"
        [class]="inputClasses"
        [style.height.px.important]="height"
        [style.border-radius.px]="radius"
        [style.border-width.px]="borderWidth"
        [style.border-color]="isOpen ? 'rgb(var(--form-accent))' : errorText ? 'rgb(var(--form-error))' : success ? 'rgb(var(--form-success))' : (borderColor || null)"
        [class.ring-1]="isOpen"
        [class.ring-form-accent]="isOpen"
        [attr.aria-invalid]="errorText ? true : null"
        tabindex="0"
        (blur)="onTouched()"
      >
        <div class="flex-1 truncate mr-2 select-none">      
            <span [class.text-form-text]="hasValidSelection()" [class.text-form-muted]="!hasValidSelection()">
                {{ getDisplayLabel() }}
                <span *ngIf="!hasValidSelection() && required" class="text-form-error ml-0.5">*</span>
            </span>
        </div>

        <div 
          class="flex-none text-slate-400 flex items-center pointer-events-none transition-transform duration-200"
          [class.rotate-180]="isOpen"
        >
          <physio-icon name="chevron-down" [size]="16" class="stroke-regular" />
        </div>
      </div>

      <div 
        #dropdownList
        *ngIf="isOpen"
        class="absolute top-[calc(100%+4px)] left-0 w-full bg-form-surface shadow-xl border border-form-border overflow-hidden z-50 animate-fade-in-down"
        [ngClass]="{
          'top-[calc(100%+4px)] animate-fade-in-down': !dropUp,
          'bottom-[calc(100%+4px)] animate-fade-in-up': dropUp
        }"
        [style.border-radius.px]="radius"
      >
        <div *ngIf="showSearch" class="p-2 border-b border-form-border">
          <input
            #searchInput
            type="text"
            [(ngModel)]="searchTerm"
            [ngModelOptions]="{ standalone: true }"
            placeholder="Search..."
            aria-label="Search options"
            autocomplete="off"
            class="w-full h-8 px-3 text-xs rounded-md border border-form-border bg-form-surface text-form-text focus:outline-none focus:ring-1 focus:ring-form-accent focus:border-form-accent"
          />
        </div>
        <ul class="max-h-60 overflow-y-auto py-1 m-0" custom-scrollbar>
            <li 
              *ngIf="!required && label"
              (click)="selectOption(null)"
              class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between text-slate-400 italic hover:bg-slate-50"
            >
              <span>-- {{ label }} --</span>
            </li>
            <ng-container *ngIf="filteredOptions.length > 0; else emptyData">
                <li 
                    *ngFor="let opt of filteredOptions"
                    (click)="selectOption(opt)"
                    class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group/item hover:bg-form-subtle"
                    [class.bg-form-subtle]="opt[bindValue] === model"
                    [class.text-form-accent]="opt[bindValue] === model"
                    [class.font-medium]="opt[bindValue] === model"
                    [class.text-form-text]="opt[bindValue] !== model"
                >
                    <span>{{ opt[bindLabel] }}</span>
                    
                    <span *ngIf="opt[bindValue] === model" class="text-form-accent">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                </li>
            </ng-container>

            <ng-template #emptyData>
                <li class="px-4 py-3 text-sm text-slate-400 text-center italic">
                    {{ searchTerm ? 'No results found' : 'Empty data' }}
                </li>
            </ng-template>
        </ul>
      </div>
    </div>
    <p *ngIf="errorText && !inField" class="mt-1 mb-0 text-xs text-form-error" role="alert">{{ errorText }}</p>
  `,
  styles: [`
    .animate-fade-in-down {
        animation: fadeInDown 0.2s ease-out forwards;
    }
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .animate-fade-in-up {
        animation: fadeInUp 0.2s ease-out forwards;
    }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E3D5DA; border-radius: 20px; }
  `],
  host: {
    'class': 'block w-full relative mb-0',
  }
})
export class BooSelectComponent implements ControlValueAccessor {
  // #region Inputs
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  /** The search box only exists while the dropdown is open, so focusing it here puts the cursor in it on open. */
  @ViewChild('searchInput') set searchInput(input: ElementRef<HTMLInputElement> | undefined) {
    input?.nativeElement.focus();
  }
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() height?: number;
  @Input() size: Size = "middle";
  @Input() radius: number = 6;
  @Input() borderWidth: number = 1;
  @Input() borderColor: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) success: boolean = false;
  @Input() fitLabel: boolean = false;
  @Input() options: any[] = [];
  /** `auto` shows the search box only when the list is long enough to need it. */
  @Input() searchable: boolean | 'auto' = 'auto';
  @Input() searchThreshold: number = 8;
  @Input() bindLabel: string = 'label';
  @Input() bindValue: string = 'value';

  model: any = null;
  searchTerm: string = '';
  isOpen: boolean = false;
  disabled: boolean = false;
  dropUp: boolean = false;

  private readonly injector = inject(Injector);
  /** Inside a `boo-form-field` the field shows the validation message. */
  readonly inField = !!inject(BOO_FORM_FIELD, { optional: true });

  constructor(private _elementRef: ElementRef) { }

  /** Validation message of the bound form control, shown once it has been touched (e.g. by a failed save). */
  get errorText(): string | null {
    return booValidationMessage(this.injector.get(NgControl, null, { self: true, optional: true })?.control, this.label);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.searchTerm = '';
    }
  }

  get showSearch(): boolean {
    return this.searchable === 'auto' ? (this.options?.length ?? 0) >= this.searchThreshold : this.searchable;
  }

  get filteredOptions(): any[] {
    const term = this.fold(this.searchTerm.trim());
    if (!term) return this.options ?? [];
    return (this.options ?? []).filter(opt => this.fold(String(opt[this.bindLabel] ?? '')).includes(term));
  }

  /** Case- and accent-insensitive, so "ha noi" finds "Hà Nội". */
  private fold(text: string): string {
    return text.replace(/đ/g, 'd').replace(/Đ/g, 'D').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  get labelClasses(): string {
    const base = 'flex items-center justify-between w-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer border-solid';
    const focusEffect = 'group-focus-within/field:translate-x-4 group-focus-within/field:opacity-0 group-focus-within/field:invisible';

    let sizeClass = '';
    switch (this.size) {
      case 'small': sizeClass = 'px-3 text-[12px]'; break;
      case 'large': sizeClass = 'px-5 text-[14px]'; break;
      default: sizeClass = 'px-4 text-sm'; break;
    }

    return `${base} ${focusEffect} ${sizeClass}`;
  }

  get inputClasses(): string {
    const base =
      'bg-form-surface flex items-center w-full text-form-text transition-colors focus:outline-none focus:ring-1 focus:ring-form-accent focus:border-form-accent cursor-pointer border-solid border-form-border hover:border-form-border-hover';

    let sizeClass = '';
    switch (this.size) {
      case 'small':
        sizeClass = 'px-3 text-[12px]';
        if (!this.height) sizeClass += ' h-8.5';
        break;

      case 'large':
        sizeClass = 'px-5 text-[14px]';
        if (!this.height) sizeClass += ' h-12';
        break;

      default:
        sizeClass = 'px-4 text-sm';
        if (!this.height) sizeClass += ' h-11';
        break;
    }

    const disabledClass = this.disabled
      ? '!bg-form-subtle !text-form-muted cursor-not-allowed hover:!border-form-border'
      : '';

    return `${base} ${sizeClass} ${disabledClass}`;
  }
  // #endregion

  // #region Methods
  toggleDropdown() {
    if (this.disabled) return;
    if (!this.isOpen) {
      this.calculateDropdownPosition();
    }
    this.searchTerm = '';

    this.isOpen = !this.isOpen;
  }

  calculateDropdownPosition() {
    if (!this.containerRef) return;

    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const expectedDropdownHeight = 250;

    if (spaceBelow < expectedDropdownHeight && rect.top > spaceBelow) {
      this.dropUp = true;
    } else {
      this.dropUp = false;
    }
  }

  selectOption(opt: any | null) {
    const value = opt ? opt[this.bindValue] : null;
    this.model = value;
    this.onChange(value);
    this.isOpen = false;
    this.searchTerm = '';
  }

  hasValidSelection(): boolean {
    return this.model !== null && this.model !== undefined;
  }

  getDisplayLabel(): string {
    if (this.hasValidSelection()) {
      const found = this.options?.find(o => o[this.bindValue] === this.model);
      return found ? found[this.bindLabel] : this.label;
    }
    return this.label || 'Select an option...';
  }

  // #region ControlValueAccessor boilerplate
  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(obj: any): void {
    this.model = obj;
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