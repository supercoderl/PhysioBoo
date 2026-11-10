import { NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { BooIconComponent } from '../icon/icon.component';
import { BooChoice, nextEnabledIndex } from './roving';

/** One tab of `boo-tabs`. */
export type BooTab<T = string> = BooChoice<T>;

/**
 * Tab strip (WAI-ARIA tablist). The parent owns the active value and renders the panels; each tab is
 * `id="<idPrefix>-<value>"` and points at `<panelPrefix>-<value>` (or the single `controls` id) so a panel can name itself
 * with `aria-labelledby`. Arrow keys, Home and End move between enabled tabs and select them; only the active tab is
 * in the tab order. A strip wider than its container scrolls horizontally.
 *
 * `variant="underline"` is the page/section style; `variant="pill"` suits dense toolbars. `variant="segment"` is a boxed switch between panels. `variant="stat"` stacks the label over a large count (a pipeline strip); there a
 * missing count (`null`) shows as a dash.
 */
@Component({
  selector: 'boo-tabs',
  standalone: true,
  imports: [NgFor, NgIf, BooIconComponent],
  template: `
    <div class="boo-scrollbar overflow-x-auto" [class.border-b]="bordered && (variant === 'underline' || variant === 'stat')" [class.border-rowDivider]="bordered && (variant === 'underline' || variant === 'stat')" [class.inline-block]="variant === 'segment'" [class.max-w-full]="variant === 'segment'">
      <div role="tablist" [attr.aria-label]="label" class="flex min-w-max gap-1" [class]="listClass || listDefault" [class.items-stretch]="variant === 'stat'">
        <ng-container *ngFor="let tab of tabs; let i = index; trackBy: trackByValue">
          <span *ngIf="tab.divider === 'line'" class="self-center w-px h-8 mx-1.5 bg-rowDivider flex-none" aria-hidden="true"></span>
          <physio-icon *ngIf="tab.divider === 'arrow'" name="chevron-right" [size]="14" class="self-center flex-none text-placeholder" aria-hidden="true" />
          <button
            #tabEl
            type="button"
            role="tab"
            [id]="idPrefix + '-' + tab.value"
            [attr.aria-selected]="tab.value === value"
            [attr.aria-controls]="controls || (panelPrefix ? panelPrefix + '-' + tab.value : null)"
            [attr.tabindex]="isTabbable(tab, i) ? 0 : -1"
            [disabled]="tab.disabled"
            [class]="tabClasses(tab)"
            (click)="select(tab)"
            (keydown)="onKeydown($event, i)"
          >
            <ng-container *ngIf="variant !== 'stat'; else statTpl">
              <span *ngIf="tab.dot" class="w-1.5 h-1.5 rounded-full flex-none" [class]="tab.dot" aria-hidden="true"></span>
              <physio-icon *ngIf="tab.icon" [name]="tab.icon" [size]="16" aria-hidden="true" class="flex-none" />
              <span>{{ tab.label }}</span>
              <span *ngIf="tab.count !== undefined && tab.count !== null" class="px-1.5 py-0.5 rounded-full bg-black/5 text-xs font-semibold tabular-nums leading-none">{{ tab.count }}</span>
            </ng-container>
            <ng-template #statTpl>
              <span class="flex items-center gap-1.5 text-xs whitespace-nowrap" [class.font-semibold]="tab.value === value" [class.text-primaryDeep]="tab.value === value" [class.font-medium]="tab.value !== value" [class.text-secondary]="tab.value !== value">
                <span *ngIf="tab.dot" class="w-1.5 h-1.5 rounded-full flex-none" [class]="tab.dot" aria-hidden="true"></span>{{ tab.label }}
              </span>
              <span class="text-lg leading-6 font-semibold tabular-nums" [class.text-regular]="tab.count != null" [class.text-placeholder]="tab.count == null">
                <ng-container *ngIf="tab.count != null; else noCount">{{ tab.count }}</ng-container>
                <ng-template #noCount><span aria-hidden="true">–</span></ng-template>
              </span>
              <span *ngIf="tab.count != null && tab.countUnit" class="sr-only">{{ tab.countUnit }}</span>
            </ng-template>
          </button>
        </ng-container>
      </div>
    </div>
  `,
  host: { class: 'block' },
})
export class BooTabsComponent<T = string> {
  @Input({ required: true }) tabs: readonly BooTab<T>[] = [];
  @Input({ required: true }) value!: T | null;
  /** Accessible name of the tab list. */
  @Input() label = 'Sections';
  @Input() variant: 'underline' | 'pill' | 'stat' | 'segment' = 'underline';
  @Input() idPrefix = 'tab';
  @Input() panelPrefix = 'panel';
  /** One panel id for every tab, when the tabs filter a single results region instead of switching panels. */
  @Input() controls = '';
  /** Replaces the default horizontal padding of the tab list (e.g. `px-4` to line up with a card's content). */
  @Input() listClass = '';
  /** Draws the rule under an underline or stat strip. Turn off when the surrounding header already has one. */
  @Input() bordered = true;
  @Output() valueChange = new EventEmitter<T>();
  @ViewChildren('tabEl') private tabEls!: QueryList<ElementRef<HTMLElement>>;

  get listDefault(): string {
    switch (this.variant) {
      case 'underline': return 'px-1';
      case 'stat': return 'px-2';
      case 'segment': return 'bg-gray-100 rounded-2 p-1';
      default: return '';
    }
  }

  tabClasses(tab: BooTab<T>): string {
    const active = tab.value === this.value;
    const base = 'relative inline-flex items-center gap-1.5 whitespace-nowrap text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
    if (this.variant === 'pill') {
      return `${base} h-9 px-3 rounded-full border ${active ? 'border-primary bg-primarySoft text-primaryDeep font-semibold' : 'border-transparent text-secondary font-medium hover:bg-gray-100 hover:text-regular'}`;
    }
    if (this.variant === 'segment') {
      return `${base} px-4 h-9 rounded-1.5 font-semibold ${active ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'}`;
    }
    if (this.variant === 'stat') {
      return `relative -mb-px flex flex-col items-start gap-0.5 px-3 py-2.5 min-w-[92px] bg-transparent border-0 border-b-2 text-left cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary rounded-t disabled:opacity-50 disabled:cursor-not-allowed ${active ? 'border-primary' : 'border-transparent hover:bg-body'}`;
    }
    return `${base} -mb-px px-3 py-3 bg-transparent border-0 border-b-2 rounded-t ${active ? 'border-primary text-primaryDeep font-semibold' : 'border-transparent text-secondary font-medium hover:text-regular'}`;
  }

  /** The selected item is in the tab order; when the value matches none (e.g. a custom range), the first enabled item is, so the strip stays reachable by keyboard. */
  isTabbable(item: BooChoice<T>, index: number): boolean {
    const items = this.tabs;
    if (items.some(x => x.value === this.value)) return item.value === this.value;
    return index === items.findIndex(x => !x.disabled);
  }

  trackByValue = (_: number, tab: BooTab<T>) => tab.value;

  select(tab: BooTab<T>): void {
    if (!tab.disabled && tab.value !== this.value) this.valueChange.emit(tab.value);
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    const next = nextEnabledIndex(this.tabs, index, event.key);
    if (next === null) return;
    event.preventDefault();
    this.select(this.tabs[next]);
    this.tabEls.get(next)?.nativeElement.focus();
  }
}
