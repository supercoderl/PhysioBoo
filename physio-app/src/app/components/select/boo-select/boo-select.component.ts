import { Component, ElementRef, HostListener, Input, OnChanges } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { BooIconComponent } from "../../icon/boo-icon/boo-icon.component";

@Component({
  selector: 'boo-select',
  standalone: true,
  imports: [
    BooIconComponent,
    SharedModule
  ],
  template: `
    <div
      class="min-h-7 w-full text-[13px] leading-[1.4375em] text-[#1F232B] inline-flex items-center relative rounded-[8px] h-auto bg-white border border-solid border-[#0000003b]"
    >
      <div
        tabindex="0"
        role="combobox"
        id="category-select"
        class="pr-8 min-h-0 h-auto truncate appearance-none cursor-pointer rounded-[8px] block min-w-0 w-full py-1 pl-3"
        (click)="toggleSelect()"
      >
        <span>{{selectedItem.label}}</span>
      </div>
      <input
        class="bottom-0 left-0 absolute opacity-0 pointer-events-none w-full"
        value="all"
      />
      <boo-icon 
        name="triangle" 
        classname="absolute top-1/2 -translate-y-1/2 pointer-events-none fill-[#4B5563] right-1.75 rotate-180"
        [size]="6"
      ></boo-icon>
    </div>
    <div 
      class="[transition:opacity_272ms_cubic-bezier(0.4,0,0.2,1),transform_181ms_cubic-bezier(0.4,0,0.2,1)] 
          absolute bg-white text-[#1F232B] shadow-select min-h-4 min-w-4 w-full px-1 rounded-[6px] z-[9999]"
      [ngClass]="{
        'opacity-100 scale-100 translate-y-0 pointer-events-auto': isOpen,
        'opacity-0 scale-95 translate-y-1 pointer-events-none': !isOpen
      }"
      style="transform-origin: 68px 0px;"
    >
      <ul class="m-0 relative py-1 outline-none gap-0.5 grid" role="listbox" tabindex="-1">
        <li 
          *ngFor="let option of options; let i = index; trackBy: trackByValue"
          class="cursor-pointer min-h-auto m-0 align-middle text-[13px] flex items-center relative whitespace-nowrap rounded-[4px] py-1.5 px-2 transition-colors duration-150 ease-in-out" 
          [ngClass]="{
            'bg-[#1f232b14]': option.value === selected,
            'hover:bg-[#1f232b1f]': true
          }"
          role="option" 
          [attr.aria-selected]="option.value === selected" 
        >
          <span> {{option.label}} </span>
        </li>
      </ul>
    </div>
  `
})
export class BooSelectComponent implements OnChanges {
  // #region Inputs / Outputs / Properties
  @Input() options: { label: string, value: string }[] = [];

  selected: string = '0';
  isOpen: boolean = false;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(private elementRef: ElementRef) { }

  ngOnChanges(): void {
    if (this.options) {
      const hasAll = this.options.some(o => o.value === '0');
      if (!hasAll) {
        this.options = [{ label: 'All', value: '0' }, ...this.options];
      }
    }
  }
  // #endregion

  // #region Events (User Interaction)
  get selectedItem() {
    return this.options.find((x) => x.value === this.selected) ?? { label: 'All', value: '0' };
  }

  toggleSelect() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  trackByValue(index: number, option: { label: string, value: string }) {
    return option.value;
  }
  // #region
}
