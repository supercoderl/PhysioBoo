import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';
import { BooIconComponent } from "../../icon/boo-icon/boo-icon.component";
import { Size } from '../../../shared/types/common';

@Component({
  selector: 'boo-select',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent
],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full relative group" #container>      
      <div
        (click)="toggleDropdown()"
        [class]="inputClasses"
        [style.border-radius.px]="radius"
        [style.border-width.px]="borderWidth"
        [style.border-color]="isOpen ? '#60A5FA' : borderColor" 
        tabindex="0"
        (blur)="onTouched()"
      >
        <div class="flex-1 truncate mr-2 select-none">      
            <span *ngIf="!fitLabel && model; else showLabel" class="text-regular">
                {{ getDisplayLabel(model) }}
            </span>
            <ng-template #showLabel>
              <span class="text-regular">
                {{ label }}
                <span *ngIf="required" class="text-red-500 ml-0.5">*</span>
              </span>
            </ng-template>
        </div>

        <div 
          class="flex-none text-slate-400 flex items-center pointer-events-none transition-transform duration-200"
          [class.rotate-180]="isOpen"
        >
          <boo-icon name="chevron-down" iconClass="stroke-regular" [size]="16" />
        </div>
      </div>

      <div 
        *ngIf="isOpen"
        class="absolute top-[calc(100%+4px)] left-0 w-full bg-surface shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in-down"
        [style.border-radius.px]="radius"
      >
        <ul class="max-h-60 overflow-y-auto py-1 m-0" custom-scrollbar>
            <li 
                *ngFor="let opt of options"
                (click)="selectOption(opt)"
                class="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group/item hover:bg-slate-50 hover:text-slate-900"
                [class.bg-blue-50]="opt[bindValue] === model"
                [class.text-blue-600]="opt[bindValue] === model"
                [class.font-medium]="opt[bindValue] === model"
                [class.text-slate-600]="opt[bindValue] !== model"
            >
                <span class="text-regular group-hover/item:text-surface">{{ opt[bindLabel] }}</span>
                
                <span *ngIf="opt[bindValue] === model" class="text-blue-500">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
            </li>

            <li *ngIf="options.length === 0" class="px-4 py-3 text-sm text-slate-400 text-center italic">
                Empty data
            </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in-down {
        animation: fadeInDown 0.2s ease-out forwards;
    }
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
  `],
  host: {
    'class': 'block w-full relative mb-0',
  }
})
export class BooSelectComponent implements ControlValueAccessor {
  // #region Inputs
  @Input() label: string = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required: boolean = false;
  @Input() size: Size = "middle";
  @Input() radius: number = 6; 
  @Input() borderWidth: number = 1;
  @Input() borderColor: string = '#e6e8ee';
  @Input() fitLabel: boolean = false;
  @Input() options: any[] = [];
  @Input() bindLabel: string = 'label'; 
  @Input() bindValue: string = 'value';
  
  model: any = null;
  isOpen: boolean = false;
  disabled: boolean = false;

  constructor(private _elementRef: ElementRef) {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  get labelClasses(): string {
    const base = 'flex items-center justify-between w-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer border-solid';
    const focusEffect = 'group-focus-within:translate-x-4 group-focus-within:opacity-0 group-focus-within:invisible';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 text-[12px]'; break;
      case 'large':  sizeClass = 'px-5 text-[14px]'; break;
      default:       sizeClass = 'px-4 text-[13px]'; break;
    }

    return `${base} ${focusEffect} ${sizeClass}`;
  }

  get inputClasses(): string {
    const base = 'bg-surface flex items-center w-full text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer border-solid';
    
    let sizeClass = '';
    switch (this.size) {
      case 'small':  sizeClass = 'px-3 h-8.5 text-[12px]'; break;
      case 'large':  sizeClass = 'px-5 h-10 text-[14px]'; break;
      default:       sizeClass = 'px-4 h-9 text-[13px]'; break;
    }

    const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : '';

    return `${base} ${sizeClass} ${disabledClass}`;
  }
  // #endregion

  // #region Methods
  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  selectOption(opt: any) {
    const value = opt[this.bindValue];
    this.model = value;
    this.onChange(value);
    this.isOpen = false;
  }

  getDisplayLabel(currentValue: any): string {
    const found = this.options.find(o => o[this.bindValue] === currentValue);
    return found ? found[this.bindLabel] : '';
  }

  // #region ControlValueAccessor boilerplate
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

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