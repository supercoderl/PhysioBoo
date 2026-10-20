import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BooButtonComponent } from '../button/button.component';
import { BooIconComponent } from '../icon/icon.component';
import { booPageRange } from './page-range';

export type BooPaginationAppearance = 'compact' | 'labelled';

/**
 * Pager for the public listings. `compact` is icon-only previous/next around the page numbers; `labelled` spreads
 * "Previous" and "Next" to the edges and shows "Page x of y" instead of numbers on mobile.
 * Renders nothing when there is a single page. The parent owns the page: it handles `pageChange` and passes the new
 * `page` back (requests for the current page are emitted too, so the parent can ignore them).
 */
@Component({
  selector: 'boo-pagination',
  standalone: true,
  imports: [NgFor, NgIf, BooButtonComponent, BooIconComponent],
  template: `
    <nav *ngIf="appearance === 'compact'" aria-label="Pagination" class="flex justify-center md:justify-end items-center gap-1.5 flex-wrap">
      <button boo-button variant="secondary" [iconOnly]="true" (click)="pageChange.emit(page - 1)" [disabled]="page <= 1" aria-label="Previous page">
        <physio-icon name="chevron-left" [size]="18" />
      </button>
      <ng-container *ngFor="let p of pages">
        <span *ngIf="p === null" class="h-11 min-w-8 flex items-center justify-center text-gray-600" aria-hidden="true">…</span>
        <button
          *ngIf="p !== null"
          boo-button
          [variant]="p === page ? 'primary' : 'secondary'"
          (click)="pageChange.emit(p)"
          [attr.aria-current]="p === page ? 'page' : null"
          [attr.aria-label]="'Page ' + p"
          class="min-w-11 !px-2"
        >{{ p }}</button>
      </ng-container>
      <button boo-button variant="secondary" [iconOnly]="true" (click)="pageChange.emit(page + 1)" [disabled]="page >= totalPages" aria-label="Next page">
        <physio-icon name="chevron-right" [size]="18" />
      </button>
    </nav>

    <nav *ngIf="appearance === 'labelled'" aria-label="Pagination" class="flex justify-between items-center gap-3">
      <button boo-button variant="secondary" (click)="pageChange.emit(page - 1)" [disabled]="page <= 1" class="!gap-1.5">
        <physio-icon name="chevron-left" [size]="16" />Previous
      </button>
      <ol class="hidden md:flex list-none m-0 p-0 gap-1">
        <li *ngFor="let p of pages">
          <span *ngIf="p === null" aria-hidden="true" class="w-11 h-11 flex items-center justify-center text-gray-600">…</span>
          <button
            *ngIf="p !== null"
            boo-button
            [variant]="p === page ? 'primary' : 'secondary'"
            (click)="pageChange.emit(p)"
            [attr.aria-current]="p === page ? 'page' : null"
            [attr.aria-label]="'Page ' + p"
            class="min-w-11 !px-2"
          >{{ p }}</button>
        </li>
      </ol>
      <span class="md:hidden text-sm font-medium text-gray-800">Page {{ page }} of {{ totalPages }}</span>
      <button boo-button variant="secondary" (click)="pageChange.emit(page + 1)" [disabled]="page >= totalPages" class="!gap-1.5">
        Next<physio-icon name="chevron-right" [size]="16" />
      </button>
    </nav>
  `,
  host: {
    class: 'block',
    '[style.display]': 'totalPages > 1 ? null : "none"',
  },
})
export class BooPaginationComponent {
  /** Current page, 1-based. */
  @Input({ required: true }) page = 1;
  @Input({ required: true }) totalPages = 1;
  @Input() appearance: BooPaginationAppearance = 'compact';
  @Output() pageChange = new EventEmitter<number>();

  get pages(): (number | null)[] {
    return booPageRange(this.page, this.totalPages);
  }
}
