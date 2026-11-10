import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { BooIconComponent } from '../icon/icon.component';
import { BooChoice, nextEnabledIndex } from './roving';

/** One option of `boo-segmented`. */
export type BooSegment<T = string> = BooChoice<T>;

/**
 * Segmented control: a short, single-choice switch between views or filters of the same data (WAI-ARIA radio group).
 * Use `boo-tabs` instead when each choice owns a panel of content. Arrow keys move between enabled options and select
 * them; only the selected option is in the tab order. `iconOnly` hides the labels (they stay as accessible names).
 */
@Component({
  selector: 'boo-segmented',
  standalone: true,
  imports: [NgFor, NgIf, BooIconComponent],
  template: `
    <div role="radiogroup" [attr.aria-label]="label" class="inline-flex max-w-full overflow-x-auto rounded-full bg-gray-100 p-0.5 gap-0.5">
      <button
        #optEl
        *ngFor="let opt of options; let i = index; trackBy: trackByValue"
        type="button"
        role="radio"
        [attr.aria-checked]="opt.value === value"
        [attr.aria-label]="iconOnly ? opt.label : null"
        [attr.title]="iconOnly ? opt.label : null"
        [attr.tabindex]="isTabbable(opt, i) ? 0 : -1"
        [disabled]="opt.disabled"
        [class]="optionClasses(opt)"
        (click)="select(opt)"
        (keydown)="onKeydown($event, i)"
      >
        <physio-icon *ngIf="opt.icon" [name]="opt.icon" [size]="14" aria-hidden="true" class="flex-none" />
        <span *ngIf="!iconOnly">{{ opt.label }}</span>
        <span *ngIf="!iconOnly && opt.count !== undefined && opt.count !== null" class="tabular-nums opacity-70">{{ opt.count }}</span>
      </button>
    </div>
  `,
  host: { class: 'inline-block max-w-full' },
})
export class BooSegmentedComponent<T = string> {
  @Input({ required: true }) options: readonly BooSegment<T>[] = [];
  @Input({ required: true }) value!: T | null;
  @Input({ required: true }) label = '';
  @Input() iconOnly = false;
  @Input() size: 'sm' | 'md' = 'md';
  @Output() valueChange = new EventEmitter<T>();
  @ViewChildren('optEl') private optEls!: QueryList<ElementRef<HTMLElement>>;

  optionClasses(opt: BooSegment<T>): string {
    const active = opt.value === this.value;
    const size = this.size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-sm';
    return `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${size} ${active ? 'bg-surface text-primaryDeep shadow-sm font-semibold' : 'text-secondary hover:text-regular'}`;
  }

  /** The selected item is in the tab order; when the value matches none (e.g. a custom range), the first enabled item is, so the strip stays reachable by keyboard. */
  isTabbable(item: BooChoice<T>, index: number): boolean {
    const items = this.options;
    if (items.some(x => x.value === this.value)) return item.value === this.value;
    return index === items.findIndex(x => !x.disabled);
  }

  trackByValue = (_: number, opt: BooSegment<T>) => opt.value;

  select(opt: BooSegment<T>): void {
    if (!opt.disabled && opt.value !== this.value) this.valueChange.emit(opt.value);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const next = nextEnabledIndex(this.options, index, event.key);
    if (next === null) return;
    event.preventDefault();
    this.select(this.options[next]);
    this.optEls.get(next)?.nativeElement.focus();
  }
}
