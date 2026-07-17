import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTakeCategoryNode } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-category-tree',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="h-full flex flex-col bg-surface border border-borderGray/60 rounded-2 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60">
        <div class="relative">
          <boo-icon name="search" [size]="14" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
          <input type="text" [(ngModel)]="query" (ngModelChange)="queryChange.emit(query)"
            placeholder="Search categories or items..."
            class="w-full pl-8 pr-3 h-9 border border-gray-300 rounded-1.5 text-[13px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <button type="button" (click)="select.emit(null)"
          class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-1.5 text-left transition-colors"
          [ngClass]="!activeId ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-regular'">
          <span class="flex items-center gap-2 text-sm font-semibold">
            <boo-icon name="layout-grid" [size]="15"></boo-icon> All Items
          </span>
        </button>

        <button *ngFor="let node of categories" type="button" (click)="select.emit(node)"
          class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-1.5 text-left transition-colors"
          [ngClass]="activeId === node.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-regular'">
          <span class="flex items-center gap-2 text-sm font-medium min-w-0">
            <boo-icon [name]="node.icon" [size]="15" iconClass="shrink-0"></boo-icon>
            <span class="truncate">{{ node.name }}</span>
          </span>
          <span class="text-[11px] font-semibold shrink-0" [ngClass]="activeId === node.id ? 'text-primary' : 'text-gray-400'">
            {{ node.countedCount }}/{{ node.itemCount }}
          </span>
        </button>
      </div>
    </div>
  `,
})
export class StockTakeCategoryTreeComponent {
    @Input() categories: StockTakeCategoryNode[] = [];
    @Input() activeId: string | null = null;
    @Output() select = new EventEmitter<StockTakeCategoryNode | null>();
    @Output() queryChange = new EventEmitter<string>();

    query = '';
}
