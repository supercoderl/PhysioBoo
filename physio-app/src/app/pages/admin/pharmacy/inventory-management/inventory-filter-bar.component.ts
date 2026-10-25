import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { BooButtonComponent, BooFilterChip, BooFilterChipsComponent, BooInputComponent } from '@physioboo/ui';
import { debounceTime, Subject, takeUntil } from "rxjs";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup } from "../../../../shared/types/common";

interface InventoryFilterChip extends BooFilterChip {
    key: 'search' | 'category';
}

const SEARCH_DEBOUNCE_MS = 350;

@Component({
    selector: 'inventory-filter-bar',
    standalone: true,
    imports: [SharedModule, BooInputComponent, BooSelectComponent, BooButtonComponent, BooFilterChipsComponent],
    template: `
    <section aria-label="Search and filters" class="bg-surface border border-borderGray/60 rounded-2 p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)_auto] gap-3 items-start">
        <boo-input
          label="Search by medicine name, generic name or barcode"
          [maxlength]="100"
          [ngModel]="search"
          (ngModelChange)="onSearchInput($event)"
        >
          <physio-icon endfix name="search" [size]="16" class="text-gray-500"></physio-icon>
        </boo-input>

        <boo-select
          label="Category"
          [options]="categories"
          bindLabel="name"
          bindValue="id"
          [ngModel]="categoryId"
          (ngModelChange)="categoryChange.emit($event)"
        ></boo-select>

        <button boo-button variant="ghost" (click)="reset.emit()" [disabled]="!chips.length">
          <physio-icon name="rotate-ccw" [size]="16"></physio-icon>Reset
        </button>
      </div>

      <boo-filter-chips [chips]="chips" (remove)="onRemoveChip($event)"></boo-filter-chips>
    </section>
  `,
})
export class InventoryFilterBarComponent implements OnInit, OnDestroy {
    /** Applied values, owned by the page. */
    @Input() search = '';
    @Input() categoryId: string | null = null;
    @Input() categories: Lookup[] = [];

    @Output() searchChange = new EventEmitter<string>();
    @Output() categoryChange = new EventEmitter<string | null>();
    @Output() reset = new EventEmitter<void>();

    private readonly typed$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    get chips(): InventoryFilterChip[] {
        const chips: InventoryFilterChip[] = [];
        if (this.search.trim()) chips.push({ key: 'search', label: `Search: ${this.search.trim()}` });
        if (this.categoryId) {
            const name = this.categories.find(c => c.id === this.categoryId)?.name ?? 'Selected';
            chips.push({ key: 'category', label: `Category: ${name}` });
        }
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

    onRemoveChip(chip: InventoryFilterChip): void {
        if (chip.key === 'search') this.searchChange.emit('');
        else this.categoryChange.emit(null);
    }
}
