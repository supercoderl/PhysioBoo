import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooErrorStateComponent, BooFilterChip, BooFilterChipsComponent, BooIconComponent, BooInlineErrorComponent } from "@physioboo/ui";

/** An active search term or filter; `key` is the filter property, or `search`. */
export interface CategoryFilterChip extends BooFilterChip {
    key: string;
}

/**
 * Frame shared by the Common Category list pages: heading with live count and the create action, the active
 * search/filter chips with a reset, load errors, and a region that takes every pixel left in the content pane.
 * The projected table card fills that region and scrolls its own rows (docs/admin-layout-contract.md).
 */
@Component({
    selector: 'common-category-page',
    standalone: true,
    imports: [NgIf, BooButtonComponent, BooIconComponent, BooFilterChipsComponent, BooErrorStateComponent, BooInlineErrorComponent],
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col gap-3 pt-3 pb-5' },
    template: `
        <header class="shrink-0 flex flex-wrap items-end justify-between gap-3">
            <div class="min-w-0">
                <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">{{ heading }}</h1>
                <p class="m-0 mt-0.5 text-xs leading-5 text-secondary">
                    {{ description }}<ng-container *ngIf="countLabel"><span aria-hidden="true"> · </span><span class="tabular-nums">{{ countLabel }}</span></ng-container>
                </p>
            </div>
            <button *ngIf="canCreate" type="button" boo-button variant="primary" size="sm" aria-haspopup="dialog" (click)="create.emit()">
                <physio-icon name="plus" [size]="15" aria-hidden="true" />{{ createLabel }}
            </button>
        </header>

        <div *ngIf="chips.length" class="shrink-0 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span class="text-xs font-medium text-secondary">Filtered by</span>
            <boo-filter-chips [chips]="chips" (remove)="removeChip.emit($event)" />
            <button type="button" boo-button variant="link" size="sm" (click)="clearFilters.emit()">Reset filters</button>
        </div>

        <!-- A reload failed while earlier results are still on screen -->
        <boo-inline-error *ngIf="loadFailed && hasData" class="shrink-0" [what]="'the latest ' + plural" [state]="loading ? 'retrying' : 'failed'" (retry)="retry.emit()" />

        <section class="flex-1 min-h-[22rem] min-w-0 flex flex-col" [attr.aria-label]="heading + ' list'" [attr.aria-busy]="loading">
            <div *ngIf="loadFailed && !hasData && !loading; else tableTpl" class="flex-1 bg-surface border border-borderGray rounded-xl">
                <boo-error-state
                    [title]="'We couldn’t load ' + plural"
                    description="Check your connection and try again."
                    (retry)="retry.emit()"
                />
            </div>
            <ng-template #tableTpl><ng-content></ng-content></ng-template>
        </section>
    `
})
export class CommonCategoryPageComponent {
    /** Page heading. Not `title`, which would also put a tooltip on the whole page. */
    @Input({ required: true }) heading!: string;
    @Input() description = '';
    @Input() countLabel = '';
    /** Plural noun, used in error messages ("We couldn’t load suppliers"). */
    @Input({ required: true }) plural!: string;
    @Input() createLabel = 'New item';
    @Input() canCreate = false;
    @Input() chips: CategoryFilterChip[] = [];
    @Input() loading = false;
    @Input() loadFailed = false;
    @Input() hasData = false;
    @Output() create = new EventEmitter<void>();
    @Output() removeChip = new EventEmitter<CategoryFilterChip>();
    @Output() clearFilters = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();
}
