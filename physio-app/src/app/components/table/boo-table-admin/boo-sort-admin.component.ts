import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BooButtonAdminComponent } from '../../button/boo-button-admin/boo-button-admin.component';
import { DEFAULT_SORT_OPTIONS, SortOption } from '../../../shared/types/sort';

@Component({
  selector: 'boo-sort-admin',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonAdminComponent
  ],
  template: `
    <div class="dropdown">
      <boo-button-admin
        buttonClass="!bg-surface h-full min-w-[140px] justify-between"
        [border]="{ width: 1, color: '#e3e3e3' }"
        (click)="toggle()"
      >
        <span class="text-placeholder mr-1">Sort By:</span>
        <span class="font-medium text-regular">{{ selectedLabel }}</span>
        
        <lucide-icon name="chevronDown" class="w-3 h-3 ml-2 text-gray-400"></lucide-icon>
      </boo-button-admin>
    </div>

    <div 
      *ngIf="isOpen"
      class="absolute right-0 mt-2 w-48 origin-top-right bg-surface rounded-lg shadow-lg border border-gray-100 py-1 z-50 focus:outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <ul class="m-0 p-1 list-none">
        <li *ngFor="let opt of options">
          <button
            type="button"
            (click)="selectOption(opt, true)"
            class="w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between group"
            [class.bg-blue-50]="opt.value === value"
            [class.text-blue-600]="opt.value === value"
            [class.text-slate-600]="opt.value !== value"
            [class.hover:bg-gray-50]="opt.value !== value"
          >
            <span class="text-regular group-hover:text-surface">{{ opt.label }}</span>
            <lucide-icon *ngIf="opt.value === value" name="check" class="w-3.5 h-3.5"></lucide-icon>
          </button>
        </li>
      </ul>
    </div>
  `
})
export class BooSortAdminComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  @Input() options: SortOption[] = [];
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() change = new EventEmitter<SortOption>();

  isOpen = false;

  get selectedLabel(): string {
    const found = this.options.find(o => o.value === this.value);
    return found ? found.label : 'Select';
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    if (this.options.length === 0) {
      this.options = [...DEFAULT_SORT_OPTIONS];
    }
    if (!this.value && this.options.length > 0) {
      this.selectOption(this.options[0], false);
    }
  }
  // #endregion

  // #region Methods
  toggle() {
    this.isOpen = !this.isOpen;
  }

  selectOption(opt: SortOption, emit: boolean = true) {
    this.value = opt.value;
    if (emit) {
      this.valueChange.emit(this.value);
      this.change.emit(opt);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
  // #endregion
}