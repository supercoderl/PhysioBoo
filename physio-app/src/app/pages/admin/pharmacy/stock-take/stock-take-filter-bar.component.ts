import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { BooButtonComponent, BooFilterChip, BooFilterChipsComponent, BooInputComponent } from '@physioboo/ui';
import { debounceTime, Subject, takeUntil } from "rxjs";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup } from "../../../../shared/types/common";
import { STOCK_TAKE_STATUSES, StockTakeFilter, stockTakeStatusLabel } from "../../../../shared/types/stock-take.types";

type FilterKey = 'search' | 'warehouseId' | 'departmentId' | 'status' | 'dateFrom' | 'dateTo';

interface StockTakeFilterChip extends BooFilterChip {
    key: FilterKey;
}

const SEARCH_DEBOUNCE_MS = 350;

@Component({
    selector: 'stock-take-filter-bar',
    standalone: true,
    imports: [SharedModule, BooInputComponent, BooSelectComponent, BooDatepickerComponent, BooButtonComponent, BooFilterChipsComponent],
    template: `
    <section aria-label="Search and filters" class="bg-surface border border-borderGray/60 rounded-2 p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
        <boo-input
          label="Search by stock take number"
          [maxlength]="50"
          [ngModel]="search"
          (ngModelChange)="onSearchInput($event)"
        >
          <physio-icon endfix name="search" [size]="16" class="text-gray-500"></physio-icon>
        </boo-input>

        <button boo-button variant="ghost" (click)="reset.emit()" [disabled]="!chips.length">
          <physio-icon name="rotate-ccw" [size]="16"></physio-icon>Reset
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <boo-select label="Warehouse" [options]="warehouses" bindLabel="name" bindValue="id"
          [ngModel]="filter.warehouseId" (ngModelChange)="patch('warehouseId', $event)"></boo-select>

        <boo-select label="Department" [options]="departments" bindLabel="name" bindValue="id"
          [ngModel]="filter.departmentId" (ngModelChange)="patch('departmentId', $event)"></boo-select>

        <boo-select label="Status" [options]="statuses" bindLabel="label" bindValue="value"
          [ngModel]="filter.status" (ngModelChange)="patch('status', $event)"></boo-select>

        <boo-datepicker label="Scheduled from" [max]="filter.dateTo"
          [ngModel]="filter.dateFrom" (ngModelChange)="patch('dateFrom', $event)"></boo-datepicker>

        <boo-datepicker label="Scheduled to" [min]="filter.dateFrom"
          [ngModel]="filter.dateTo" (ngModelChange)="patch('dateTo', $event)"></boo-datepicker>
      </div>

      <boo-filter-chips [chips]="chips" (remove)="onRemoveChip($event)"></boo-filter-chips>
    </section>
  `,
})
export class StockTakeFilterBarComponent implements OnInit, OnDestroy {
    /** Applied values, owned by the page. */
    @Input() search = '';
    @Input() filter: StockTakeFilter = {};
    @Input() warehouses: Lookup[] = [];
    @Input() departments: Lookup[] = [];

    @Output() searchChange = new EventEmitter<string>();
    @Output() filterChange = new EventEmitter<StockTakeFilter>();
    @Output() reset = new EventEmitter<void>();

    readonly statuses = STOCK_TAKE_STATUSES;

    private readonly typed$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    get chips(): StockTakeFilterChip[] {
        const f = this.filter;
        const chips: StockTakeFilterChip[] = [];
        if (this.search.trim()) chips.push({ key: 'search', label: `Number: ${this.search.trim()}` });
        if (f.warehouseId) chips.push({ key: 'warehouseId', label: `Warehouse: ${this.nameOf(this.warehouses, f.warehouseId)}` });
        if (f.departmentId) chips.push({ key: 'departmentId', label: `Department: ${this.nameOf(this.departments, f.departmentId)}` });
        if (f.status) chips.push({ key: 'status', label: `Status: ${stockTakeStatusLabel(f.status)}` });
        if (f.dateFrom) chips.push({ key: 'dateFrom', label: `From: ${f.dateFrom}` });
        if (f.dateTo) chips.push({ key: 'dateTo', label: `To: ${f.dateTo}` });
        return chips;
    }

    ngOnInit(): void {
        this.typed$.pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntil(this.destroy$)).subscribe(value => this.searchChange.emit(value));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchInput(value: string | null): void {
        this.typed$.next(value ?? '');
    }

    patch<K extends keyof StockTakeFilter>(key: K, value: StockTakeFilter[K] | undefined): void {
        const next = { ...this.filter, [key]: value || null };
        if (next[key] === this.filter[key] || (!next[key] && !this.filter[key])) return;
        this.filterChange.emit(next);
    }

    onRemoveChip(chip: StockTakeFilterChip): void {
        if (chip.key === 'search') this.searchChange.emit('');
        else this.patch(chip.key, null);
    }

    private nameOf(list: Lookup[], id: string): string {
        return list.find(i => i.id === id)?.name ?? 'Selected';
    }
}
