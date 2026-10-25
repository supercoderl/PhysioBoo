import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTakeCategoryNode } from "../../../../shared/types/stock-take.types";

/** Medicine categories of the session with their saved count progress; selecting one narrows the items table. */
@Component({
    selector: 'stock-take-category-tree',
    standalone: true,
    imports: [SharedModule],
    host: { class: 'block min-h-0 lg:h-full' },
    template: `
    <nav aria-label="Categories" class="bg-surface border border-borderGray/60 rounded-2 p-2 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      <h2 class="text-xs font-bold text-secondary uppercase tracking-wider px-2 pt-1.5 pb-2 m-0">Categories</h2>
      <ul class="list-none m-0 p-0 space-y-0.5 max-h-[16rem] overflow-y-auto lg:min-h-0 lg:max-h-none lg:flex-1" custom-scrollbar>
        <li>
          <button type="button" (click)="select.emit(null)" [attr.aria-current]="activeId ? null : 'true'"
            class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-1.5 text-left text-sm transition-colors"
            [ngClass]="!activeId ? 'bg-primarySoft text-primaryDeep font-semibold' : 'hover:bg-gray-50 text-regular'">
            <span>All items</span>
            <span class="text-[11px] tabular-nums text-secondary">{{ countedTotal }}/{{ total }}</span>
          </button>
        </li>
        <li *ngFor="let node of categories; trackBy: trackById">
          <button type="button" (click)="select.emit(node)" [attr.aria-current]="activeId === node.id ? 'true' : null"
            class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-1.5 text-left text-sm transition-colors"
            [ngClass]="activeId === node.id ? 'bg-primarySoft text-primaryDeep font-semibold' : 'hover:bg-gray-50 text-regular'">
            <span class="truncate">{{ node.name }}</span>
            <span class="flex-none text-[11px] tabular-nums" [ngClass]="node.countedCount === node.itemCount ? 'text-emerald-600 font-semibold' : 'text-secondary'">
              {{ node.countedCount }}/{{ node.itemCount }}
            </span>
          </button>
        </li>
      </ul>
    </nav>
  `,
})
export class StockTakeCategoryTreeComponent {
    @Input() categories: StockTakeCategoryNode[] = [];
    @Input() activeId: string | null = null;
    @Input() total = 0;
    @Input() countedTotal = 0;
    @Output() select = new EventEmitter<StockTakeCategoryNode | null>();

    trackById(_: number, node: StockTakeCategoryNode): string {
        return node.id;
    }
}
