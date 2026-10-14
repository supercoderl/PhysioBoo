import { Component, ElementRef, forwardRef, HostListener, inject, Injector, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports';
import { validationMessage } from '../../../shared/utils/validation-message';

/** Searchable icon picker: shows a preview of every icon next to its name. Value is the icon name. */
@Component({
  selector: 'boo-icon-select',
  standalone: true,
  imports: [SharedModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooIconSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full relative" #container (keydown.escape)="close(true)">
      <button
        type="button"
        #trigger
        class="w-full h-9 px-3 flex items-center gap-2 rounded-1.5 border bg-surface text-[13px] text-regular text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-gray-100"
        [class.border-borderGray]="!isOpen && !errorText"
        [class.border-rose-400]="isOpen"
        [class.border-danger]="!isOpen && errorText"
        [disabled]="disabled"
        [id]="inputId"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen"
        [attr.aria-invalid]="errorText ? true : null"
        (click)="toggle()"
        (blur)="onTouched()"
      >
        <span *ngIf="model" class="w-5 h-5 flex items-center justify-center shrink-0 text-regular" aria-hidden="true">
          <physio-icon [name]="model" [size]="16" />
        </span>
        <span class="flex-1 truncate" [class.text-placeholder]="!model">{{ model || placeholder }}</span>
        <physio-icon name="chevron-down" [size]="16" [class]="'shrink-0 text-slate-400 transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')" />
      </button>

      <div
        *ngIf="isOpen"
        class="absolute left-0 w-full bg-surface shadow-xl border border-slate-100 rounded-1.5 overflow-hidden z-50"
        [ngClass]="dropUp ? 'bottom-[calc(100%+4px)]' : 'top-[calc(100%+4px)]'"
      >
        <div class="p-2 border-b border-slate-100">
          <input
            #searchInput
            type="text"
            [(ngModel)]="searchTerm"
            [ngModelOptions]="{ standalone: true }"
            placeholder="Search icons..."
            aria-label="Search icons"
            autocomplete="off"
            class="w-full h-8 px-3 text-xs rounded-md border border-border bg-surface text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/70"
            (keydown.enter)="$event.preventDefault(); pickFirst()"
          />
        </div>

        <div class="max-h-64 overflow-y-auto p-2" custom-scrollbar>
          <div *ngIf="filtered.length; else noResult" role="listbox" [attr.aria-label]="label" class="grid grid-cols-3 gap-1">
            <button
              *ngFor="let name of filtered"
              type="button"
              role="option"
              [attr.aria-selected]="name === model"
              [title]="name"
              class="flex flex-col items-center gap-1 px-1 py-2 rounded-1.5 text-[11px] text-secondary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              [ngClass]="name === model ? 'bg-primary/10 !text-primary font-medium' : ''"
              (click)="select(name)"
            >
              <physio-icon [name]="name" [size]="20" />
              <span class="w-full truncate text-center">{{ name }}</span>
            </button>
          </div>
          <ng-template #noResult>
            <p class="m-0 px-4 py-3 text-sm text-slate-400 text-center italic">No icons found</p>
          </ng-template>
        </div>
      </div>
    </div>
    <p *ngIf="errorText" class="mt-1 mb-0 text-xs text-danger" role="alert">{{ errorText }}</p>
  `,
  host: { class: 'block w-full relative mb-0' }
})
export class BooIconSelectComponent implements ControlValueAccessor {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('trigger') triggerRef!: ElementRef<HTMLButtonElement>;
  /** The search box only exists while the dropdown is open, so focusing it here puts the cursor in it on open. */
  @ViewChild('searchInput') set searchInput(input: ElementRef<HTMLInputElement> | undefined) {
    input?.nativeElement.focus();
  }

  /** Registered icon names to choose from. */
  @Input() icons: string[] = [];
  @Input() label = 'Icon';
  @Input() placeholder = 'Choose an icon';
  /** Id of the trigger, so an external `<label for>` can point at it. */
  @Input() inputId?: string;

  model: string | null = null;
  searchTerm = '';
  isOpen = false;
  disabled = false;
  dropUp = false;

  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Validation message of the bound form control, shown once it has been touched (e.g. by a failed save). */
  get errorText(): string | null {
    return validationMessage(this.injector.get(NgControl, null, { self: true, optional: true })?.control, this.label);
  }

  get filtered(): string[] {
    const term = this.searchTerm.trim().toLowerCase();
    return term ? this.icons.filter(name => name.toLowerCase().includes(term)) : this.icons;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.host.nativeElement.contains(event.target)) this.close();
  }

  toggle(): void {
    if (this.disabled) return;
    if (this.isOpen) { this.close(); return; }
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    this.dropUp = spaceBelow < 340 && rect.top > spaceBelow;
    this.searchTerm = '';
    this.isOpen = true;
  }

  close(restoreFocus = false): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.searchTerm = '';
    if (restoreFocus) this.triggerRef.nativeElement.focus();
  }

  select(name: string): void {
    this.model = name;
    this.onChange(name);
    this.close(true);
  }

  pickFirst(): void {
    const first = this.filtered[0];
    if (first) this.select(first);
  }

  // #region ControlValueAccessor
  onChange: (value: string | null) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: string | null): void {
    this.model = value || null;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  // #endregion
}
