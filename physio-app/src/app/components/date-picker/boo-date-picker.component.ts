import { AfterViewInit, Component, ElementRef, HostListener, Input, NgZone, OnDestroy, ViewChild, computed, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MONTH_NAMES, SHORT_WEEKDAY_NAMES } from '../../shared/constants/value.constant';
import { SharedModule } from '../../shared/shared-imports';
import { BooIconComponent } from "../icon/boo-icon/boo-icon.component";

type CalendarView = 'days' | 'months' | 'years';
type Size = 'small' | 'medium' | 'large';
export type DateFilterFn = (date: Date) => boolean;

@Component({
  selector: 'boo-datepicker',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooDatepickerComponent),
      multi: true
    }
  ],
  styles: [`
    :host { display: block; position: relative; width: 100%; }

    .cell { user-select: none; }
    .cell:not(.disabled) { cursor: pointer; }
    .cell.disabled { cursor: not-allowed; opacity: 0.35; }

    .popover-enter {
      animation: popIn 140ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes popIn {
      from { opacity: 0; transform: translateY(-4px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
  `],
  template: `
    <div class="flex w-full relative items-center" #anchor>
      <span
        *ngIf="!model() && label"
        (click)="open()"
        [class]="labelClasses"
        [style.color]="placeholderColor"
      >
        {{ label }} <span *ngIf="required" class="text-red-500 ml-0.5">*</span>
      </span>

      <button
        type="button"
        [disabled]="disabled"
        (click)="toggle()"
        [class]="inputClasses"
        [style.border-radius.px]="radius"
        [style.background-color]="backgroundColor"
        [style.border-width.px]="borderWidth"
        [style.border-color]="borderColor"
      >
        <span class="flex-1 text-left">{{ displayValue() }}</span>
        <span class="pl-2 text-slate-400">
          <boo-icon name="calendar" />
        </span>
      </button>

      <div *ngIf="isOpen()" #popover
        class="popover-enter fixed z-[9999] w-72 bg-surface border border-gray-200 rounded-lg shadow-xl overflow-hidden"
        [style.top.px]="popoverPos().top"
        [style.left.px]="popoverPos().left"
        (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
          <button type="button" (click)="prev()"
            class="w-7 h-7 rounded hover:bg-gray-100 inline-flex items-center justify-center text-gray-500">
            <boo-icon name="chevron-left" />
          </button>

          <button type="button" (click)="cycleView()"
            class="px-2 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded transition-colors">
            <ng-container [ngSwitch]="view()">
              <span *ngSwitchCase="'days'">{{ monthNames[viewMonth()] }} {{ viewYear() }}</span>
              <span *ngSwitchCase="'months'">{{ viewYear() }}</span>
              <span *ngSwitchCase="'years'">{{ yearRangeLabel() }}</span>
            </ng-container>
          </button>

          <button type="button" (click)="next()"
            class="w-7 h-7 rounded hover:bg-gray-100 inline-flex items-center justify-center text-gray-500">
            <boo-icon name="chevron-right" />
          </button>
        </div>
        <div *ngIf="view() === 'days'" class="p-2">
          <div class="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            <span *ngFor="let d of dayNames()" class="py-1">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-0.5">
            <button *ngFor="let cell of calendarGrid()" type="button"
              [disabled]="cell.disabled"
              (click)="selectDate(cell.date)"
              class="cell h-8 text-sm rounded inline-flex items-center justify-center transition-colors"
              [ngClass]="{
                'text-gray-300': !cell.inMonth && !cell.selected,
                'text-gray-700': cell.inMonth && !cell.selected && !cell.disabled,
                'disabled': cell.disabled,
                'bg-primary text-white hover:bg-primary/90': cell.selected,
                'hover:bg-primary/5': !cell.selected && !cell.disabled,
                'ring-1 ring-primary': cell.today && !cell.selected
              }">
              {{ cell.day }}
            </button>
          </div>
        </div>
        <div *ngIf="view() === 'months'" class="p-2 grid grid-cols-3 gap-1">
          <button *ngFor="let m of monthNames; let i = index" type="button"
            [disabled]="isMonthDisabled(i)"
            (click)="selectMonth(i)"
            class="cell h-10 text-xs rounded inline-flex items-center justify-center transition-colors"
            [ngClass]="{
              'bg-primary text-white': i === viewMonth() && viewYear() === selectedYear(),
              'hover:bg-primary/5': !(i === viewMonth() && viewYear() === selectedYear()) && !isMonthDisabled(i),
              'disabled': isMonthDisabled(i),
              'text-gray-700': !isMonthDisabled(i)
            }">
            {{ m.substring(0, 3) }}
          </button>
        </div>
        <div *ngIf="view() === 'years'" class="p-2 grid grid-cols-3 gap-1">
          <button *ngFor="let y of yearGrid()" type="button"
            [disabled]="isYearDisabled(y)"
            (click)="selectYear(y)"
            class="cell h-10 text-xs rounded inline-flex items-center justify-center transition-colors"
            [ngClass]="{
              'bg-primary text-white': y === viewYear(),
              'hover:bg-primary/5': y !== viewYear() && !isYearDisabled(y),
              'disabled': isYearDisabled(y),
              'text-gray-700': !isYearDisabled(y)
            }">
            {{ y }}
          </button>
        </div>
        <div class="flex items-center justify-between px-3 py-2 border-t border-gray-100 bg-gray-50/50">
          <button type="button" (click)="selectToday()"
            class="text-xs font-medium text-primary hover:underline disabled:opacity-30 disabled:no-underline"
            [disabled]="isDateDisabled(today)">
            Today
          </button>
          <button type="button" (click)="clear()"
            class="text-xs text-gray-500 hover:text-red-600 hover:underline disabled:opacity-30"
            [disabled]="!model()">
            Clear
          </button>
        </div>
      </div>
    </div>
  `
})
export class BooDatepickerComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  // #region Public inputs
  @Input() label = '';
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) required = false;
  @Input() id = '';
  @Input() name = '';
  @Input() size: Size = 'medium';
  @Input() radius = 6;
  @Input() backgroundColor = 'white';
  @Input() borderWidth = 1;
  @Input() borderColor = '#e6e8ee';
  @Input() placeholderColor = '#64748B';

  /** Min selectable date (inclusive). Accepts Date or 'yyyy-MM-dd'. */
  @Input() set min(v: Date | string | null | undefined) { this._min.set(this.parse(v)); }
  /** Max selectable date (inclusive). Accepts Date or 'yyyy-MM-dd'. */
  @Input() set max(v: Date | string | null | undefined) { this._max.set(this.parse(v)); }
  /** Disable any future date (max = today). Useful for DOB pickers. */
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) disableFuture = false;
  /** Disable any past date (min = today). Useful for appointment booking. */
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) disablePast = false;
  /** Disable weekends. */
  @Input({ transform: (v: unknown) => v === '' || v === true || v === 'true' }) disableWeekends = false;
  /** Custom predicate — return true to DISABLE the date. */
  @Input() dateFilter: DateFilterFn | null = null;
  /** Output format: 'yyyy-MM-dd' (default) | 'iso' (full ISO) */
  @Input() outputFormat: 'yyyy-MM-dd' | 'iso' = 'yyyy-MM-dd';
  /** First day of week. 0 = Sunday, 1 = Monday. */
  @Input() firstDayOfWeek: 0 | 1 = 1;
  // #endregion

  @ViewChild('anchor') anchor!: ElementRef<HTMLElement>;
  @ViewChild('popover') popover?: ElementRef<HTMLElement>;

  // #region Internal state
  model = signal<string>('');
  isOpen = signal(false);
  disabled = false;
  popoverPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  private reposition = () => this.positionPopover();

  private _min = signal<Date | null>(null);
  private _max = signal<Date | null>(null);

  view = signal<CalendarView>('days');
  viewYear = signal(new Date().getFullYear());
  viewMonth = signal(new Date().getMonth());

  readonly today = new Date(new Date().setHours(0, 0, 0, 0));
  readonly monthNames = MONTH_NAMES;
  // #endregion

  // #region Derived
  selectedDate = computed(() => this.parse(this.model()));
  selectedYear = computed(() => this.selectedDate()?.getFullYear() ?? this.viewYear());

  effectiveMin = computed<Date | null>(() => {
    if (this.disablePast) return this.today;
    return this._min();
  });
  effectiveMax = computed<Date | null>(() => {
    if (this.disableFuture) return this.today;
    return this._max();
  });

  displayValue = computed(() => {
    const d = this.selectedDate();
    return d ? this.formatDisplay(d) : (this.label ? '' : 'Select date');
  });

  dayNames = computed(() => {
    const names = SHORT_WEEKDAY_NAMES;
    return this.firstDayOfWeek === 1 ? [...names.slice(1), names[0]] : names;
  });

  yearRangeLabel = computed(() => {
    const grid = this.yearGrid();
    return `${grid[0]} - ${grid[grid.length - 1]}`;
  });

  calendarGrid = computed(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const offset = (startWeekday - this.firstDayOfWeek + 7) % 7;
    const startDate = new Date(year, month, 1 - offset);

    const sel = this.selectedDate();
    const todayMs = this.today.getTime();

    const cells: Array<{
      date: Date; day: number; inMonth: boolean; selected: boolean;
      today: boolean; disabled: boolean;
    }> = [];

    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      d.setHours(0, 0, 0, 0);

      cells.push({
        date: d,
        day: d.getDate(),
        inMonth: d.getMonth() === month,
        selected: !!sel && this.sameDay(d, sel),
        today: d.getTime() === todayMs,
        disabled: this.isDateDisabled(d),
      });
    }
    return cells;
  });

  yearGrid = computed(() => {
    const base = Math.floor(this.viewYear() / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => base + i);
  });
  // #endregion

  // #region Lifecycle
  ngAfterViewInit(): void {}
  ngOnDestroy(): void { this.detachWindowListeners(); }
  // #endregion

  // #region Public API (open/toggle/close)
  open(): void {
    if (this.disabled) return;
    const cur = this.selectedDate() ?? new Date();
    this.viewYear.set(cur.getFullYear());
    this.viewMonth.set(cur.getMonth());
    this.view.set('days');
    this.isOpen.set(true);

    // Position after the popover is in the DOM
    requestAnimationFrame(() => this.positionPopover());
    this.attachWindowListeners();
  }
  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.detachWindowListeners();
    this.onTouched();
  }
  toggle(): void { this.isOpen() ? this.close() : this.open(); }
  // #endregion

  // #region Positioning
  private positionPopover(): void {
    const anchorEl = this.anchor?.nativeElement;
    const popEl = this.popover?.nativeElement;
    if (!anchorEl || !popEl || !window) return;

    const aRect = anchorEl.getBoundingClientRect();
    const pRect = popEl.getBoundingClientRect();
    const gap = 4;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 8;

    const spaceBelow = vh - aRect.bottom;
    const spaceAbove = aRect.top;
    const placeAbove = spaceBelow < pRect.height + gap + pad && spaceAbove > spaceBelow;

    let top = placeAbove
      ? aRect.top - pRect.height - gap
      : aRect.bottom + gap;
    top = Math.max(pad, Math.min(top, vh - pRect.height - pad));

    let left = aRect.left;
    left = Math.max(pad, Math.min(left, vw - pRect.width - pad));

    this.popoverPos.set({ top, left });
  }

  private attachWindowListeners(): void {
    if (typeof window !== 'undefined') {
      this.zone.runOutsideAngular(() => {
        window.addEventListener('scroll', this.reposition, true); 
        window.addEventListener('resize', this.reposition);
      });
    }
  }
  private detachWindowListeners(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.reposition, true);
      window.removeEventListener('resize', this.reposition);
    }
  }
  // #endregion

  // #region Navigation
  prev(): void {
    const v = this.view();
    if (v === 'days') {
      let m = this.viewMonth() - 1, y = this.viewYear();
      if (m < 0) { m = 11; y--; }
      this.viewMonth.set(m); this.viewYear.set(y);
    } else if (v === 'months') {
      this.viewYear.set(this.viewYear() - 1);
    } else {
      this.viewYear.set(this.viewYear() - 12);
    }
  }
  next(): void {
    const v = this.view();
    if (v === 'days') {
      let m = this.viewMonth() + 1, y = this.viewYear();
      if (m > 11) { m = 0; y++; }
      this.viewMonth.set(m); this.viewYear.set(y);
    } else if (v === 'months') {
      this.viewYear.set(this.viewYear() + 1);
    } else {
      this.viewYear.set(this.viewYear() + 12);
    }
  }
  cycleView(): void {
    const v = this.view();
    this.view.set(v === 'days' ? 'months' : v === 'months' ? 'years' : 'days');
  }
  // #endregion

  // #region Selection
  selectDate(d: Date): void {
    if (this.isDateDisabled(d)) return;
    this.model.set(this.formatModel(d));
    this.onChange(this.formatModel(d));
    this.close();
  }
  selectMonth(m: number): void {
    if (this.isMonthDisabled(m)) return;
    this.viewMonth.set(m);
    this.view.set('days');
  }
  selectYear(y: number): void {
    if (this.isYearDisabled(y)) return;
    this.viewYear.set(y);
    this.view.set('months');
  }
  selectToday(): void {
    if (this.isDateDisabled(this.today)) return;
    this.selectDate(this.today);
  }
  clear(): void {
    this.model.set('');
    this.onChange(null);
    this.close();
  }
  // #endregion

  // #region Disabled checks
  isDateDisabled(d: Date): boolean {
    const min = this.effectiveMin(), max = this.effectiveMax();
    if (min && d.getTime() < this.startOfDay(min).getTime()) return true;
    if (max && d.getTime() > this.startOfDay(max).getTime()) return true;
    if (this.disableWeekends && (d.getDay() === 0 || d.getDay() === 6)) return true;
    if (this.dateFilter && this.dateFilter(d)) return true;
    return false;
  }
  isMonthDisabled(m: number): boolean {
    const min = this.effectiveMin(), max = this.effectiveMax();
    const monthEnd = new Date(this.viewYear(), m + 1, 0);
    const monthStart = new Date(this.viewYear(), m, 1);
    if (min && monthEnd.getTime() < this.startOfDay(min).getTime()) return true;
    if (max && monthStart.getTime() > this.startOfDay(max).getTime()) return true;
    return false;
  }
  isYearDisabled(y: number): boolean {
    const min = this.effectiveMin(), max = this.effectiveMax();
    if (min && y < min.getFullYear()) return true;
    if (max && y > max.getFullYear()) return true;
    return false;
  }
  // #endregion

  // #region Host bindings — close on outside click / escape
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.isOpen()) return;
    const el = this.anchor?.nativeElement;
    if (el && !el.contains(e.target as Node)) this.close();
  }
  @HostListener('document:keydown.escape')
  onEsc(): void { if (this.isOpen()) this.close(); }
  // #endregion

  // #region CVA
  onChange: (v: any) => void = () => { };
  onTouched: () => void = () => { };
  writeValue(v: any): void { this.model.set(typeof v === 'string' ? v : this.formatModel(this.parse(v))); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
  // #endregion

  // #region Style helpers
  get labelClasses(): string {
    const base = 'absolute left-0 z-[1] flex items-center transition-all duration-200 cursor-text truncate pointer-events-none';
    switch (this.size) {
      case 'small': return `${base} px-3 text-xs h-8 leading-8`;
      case 'large': return `${base} px-5 text-base h-12 leading-[3rem]`;
      default: return `${base} px-4 text-sm h-11 leading-[2.75rem]`;
    }
  }
  get inputClasses(): string {
    const base = 'w-full inline-flex items-center text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary border bg-surface';
    let sizeClass = '';
    switch (this.size) {
      case 'small': sizeClass = 'px-3 h-8 text-xs'; break;
      case 'large': sizeClass = 'px-5 h-12 text-base'; break;
      default: sizeClass = 'px-4 h-11 text-sm'; break;
    }
    const disabledClass = this.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'hover:border-gray-300';
    return `${base} ${sizeClass} ${disabledClass}`;
  }
  // #endregion

  // #region Helpers
  private parse(v: Date | string | null | undefined): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate());
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  private formatModel(d: Date | null): string {
    if (!d) return '';
    if (this.outputFormat === 'iso') return d.toISOString();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  private formatDisplay(d: Date): string {
    return `${this.monthNames[d.getMonth()].substring(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
  }
  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
  private startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  // #endregion
}
