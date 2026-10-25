import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { BooButtonComponent, BooFilterChip, BooFilterChipsComponent, BooInputComponent } from '@physioboo/ui';
import { Subject, debounceTime, takeUntil } from "rxjs";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { INSURANCE_SORT_OPTIONS } from "../../../../shared/types/insurance-company.types";

export type InsuranceFilterKey = 'search' | 'range';

interface InsuranceFilterChip extends BooFilterChip {
    key: InsuranceFilterKey;
}

const SEARCH_DEBOUNCE_MS = 350;

/** Search, sort and the "added between" range: the only filters the insurance-company search endpoint supports. */
@Component({
    selector: 'insurance-company-filter-bar',
    standalone: true,
    imports: [SharedModule, BooInputComponent, BooSelectComponent, BooDatepickerComponent, BooButtonComponent, BooFilterChipsComponent],
    template: `
    <section aria-label="Search and filters" class="bg-surface border border-borderGray/60 rounded-2 p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] gap-3 items-start">
        <boo-input
          label="Search by insurer name or code"
          [maxlength]="100"
          [ngModel]="search"
          (ngModelChange)="onSearchInput($event)"
        >
          <physio-icon endfix name="search" [size]="16" class="text-gray-500"></physio-icon>
        </boo-input>

        <boo-select
          label="Sort by"
          [options]="sortOptions"
          [ngModel]="sort"
          (ngModelChange)="onSort($event)"
        ></boo-select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <boo-datepicker label="Added from" [ngModel]="dateFrom" [max]="dateTo" (ngModelChange)="dateFromChange.emit($event || null)"></boo-datepicker>
        <boo-datepicker label="Added to" [ngModel]="dateTo" [min]="dateFrom" (ngModelChange)="dateToChange.emit($event || null)"></boo-datepicker>
      </div>
      <p *ngIf="!!dateFrom !== !!dateTo" class="m-0 text-xs text-secondary" role="status">Choose both dates to filter by when an insurer was added.</p>

      <div class="flex items-center justify-between gap-3 flex-wrap" *ngIf="chips.length">
        <boo-filter-chips [chips]="chips" (remove)="onRemoveChip($event)"></boo-filter-chips>
        <button boo-button variant="ghost" size="sm" (click)="reset.emit()">
          <physio-icon name="rotate-ccw" [size]="16"></physio-icon>Reset
        </button>
      </div>
    </section>
  `,
})
export class InsuranceCompanyFilterBarComponent implements OnInit, OnDestroy {
    /** Applied values, owned by the page. */
    @Input() search = '';
    @Input() sort = '-createdAt';
    @Input() dateFrom: string | null = null;
    @Input() dateTo: string | null = null;

    @Output() searchChange = new EventEmitter<string>();
    @Output() sortChange = new EventEmitter<string>();
    @Output() dateFromChange = new EventEmitter<string | null>();
    @Output() dateToChange = new EventEmitter<string | null>();
    @Output() reset = new EventEmitter<void>();

    readonly sortOptions = INSURANCE_SORT_OPTIONS;

    private readonly typed$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    get chips(): InsuranceFilterChip[] {
        const chips: InsuranceFilterChip[] = [];
        if (this.search.trim()) chips.push({ key: 'search', label: `Search: ${this.search.trim()}` });
        if (this.dateFrom && this.dateTo) chips.push({ key: 'range', label: `Added: ${this.dateFrom} to ${this.dateTo}` });
        return chips;
    }

    ngOnInit(): void {
        // The page ignores a value equal to the one already applied, so no distinct filter is needed here.
        this.typed$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntil(this.destroy$)).subscribe(value => this.searchChange.emit(value));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string): void {
        this.typed$.next(value ?? '');
    }

    onSort(value: string | null): void {
        if (value) this.sortChange.emit(value);
    }

    onRemoveChip(chip: InsuranceFilterChip): void {
        if (chip.key === 'search') this.searchChange.emit('');
        else {
            this.dateFromChange.emit(null);
            this.dateToChange.emit(null);
        }
    }
}
