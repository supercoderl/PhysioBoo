import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { BooButtonComponent, BooFilterChip, BooFilterChipsComponent, BooInputComponent } from '@physioboo/ui';
import { debounceTime, Subject, takeUntil } from "rxjs";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { CASHIER_BILL_STATUSES, CashierBillStatus, cashierStatusLabel } from "../../../../shared/types/cashier.types";

export type CashierFilterKey = 'search' | 'status' | 'dateFrom' | 'dateTo';

interface CashierFilterChip extends BooFilterChip {
    key: CashierFilterKey;
}

const SEARCH_DEBOUNCE_MS = 350;

@Component({
    selector: 'cashier-filter-bar',
    standalone: true,
    imports: [SharedModule, BooInputComponent, BooSelectComponent, BooDatepickerComponent, BooButtonComponent, BooFilterChipsComponent],
    template: `
    <section aria-label="Search and filters" class="bg-surface border border-borderGray/60 rounded-2 p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
        <boo-input
          class="md:col-span-2"
          label="Search by bill number or patient MRN"
          [maxlength]="100"
          [ngModel]="search"
          (ngModelChange)="onSearchInput($event)"
        >
          <physio-icon endfix name="search" [size]="16" class="text-gray-500"></physio-icon>
        </boo-input>

        <boo-select
          label="Status"
          [options]="statusOptions"
          [ngModel]="status"
          (ngModelChange)="statusChange.emit($event || null)"
        ></boo-select>

        <div class="grid grid-cols-2 gap-3">
          <boo-datepicker label="Billed from" [ngModel]="dateFrom" [max]="dateTo" (ngModelChange)="dateFromChange.emit($event || null)"></boo-datepicker>
          <boo-datepicker label="Billed to" [ngModel]="dateTo" [min]="dateFrom" (ngModelChange)="dateToChange.emit($event || null)"></boo-datepicker>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 flex-wrap" *ngIf="chips.length">
        <boo-filter-chips [chips]="chips" (remove)="onRemoveChip($event)"></boo-filter-chips>
        <button boo-button variant="ghost" size="sm" (click)="reset.emit()">
          <physio-icon name="rotate-ccw" [size]="16"></physio-icon>Reset
        </button>
      </div>
    </section>
  `,
})
export class CashierFilterBarComponent implements OnInit, OnDestroy {
    /** Applied values, owned by the page. */
    @Input() search = '';
    @Input() status: CashierBillStatus | null = null;
    @Input() dateFrom: string | null = null;
    @Input() dateTo: string | null = null;

    @Output() searchChange = new EventEmitter<string>();
    @Output() statusChange = new EventEmitter<CashierBillStatus | null>();
    @Output() dateFromChange = new EventEmitter<string | null>();
    @Output() dateToChange = new EventEmitter<string | null>();
    @Output() reset = new EventEmitter<void>();

    readonly statusOptions = CASHIER_BILL_STATUSES;

    private readonly typed$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    get chips(): CashierFilterChip[] {
        const chips: CashierFilterChip[] = [];
        if (this.search.trim()) chips.push({ key: 'search', label: `Search: ${this.search.trim()}` });
        if (this.status) chips.push({ key: 'status', label: `Status: ${cashierStatusLabel(this.status)}` });
        if (this.dateFrom) chips.push({ key: 'dateFrom', label: `From: ${this.dateFrom}` });
        if (this.dateTo) chips.push({ key: 'dateTo', label: `To: ${this.dateTo}` });
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

    onSearchInput(value: string | null): void {
        this.typed$.next(value ?? '');
    }

    onRemoveChip(chip: CashierFilterChip): void {
        switch (chip.key) {
            case 'search': this.searchChange.emit(''); break;
            case 'status': this.statusChange.emit(null); break;
            case 'dateFrom': this.dateFromChange.emit(null); break;
            case 'dateTo': this.dateToChange.emit(null); break;
        }
    }
}
