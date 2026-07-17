import { Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTake, StockTakeCategoryNode, StockTakeItem, StockTakeStatus, StockTakeSummary } from "../../../../shared/types/stock-take.types";
import { StockTakeCategoryTreeComponent } from "./stock-take-category-tree.component";
import { StockTakeCompleteDialogComponent } from "./stock-take-complete-dialog.component";
import { StockTakeCountingTableComponent } from "./stock-take-counting-table.component";
import { StockTakeSummaryPanelComponent } from "./stock-take-summary-panel.component";

const STEPS: StockTakeStatus[] = ['Draft', 'Counting', 'PendingApproval', 'Approved'];

@Component({
    selector: 'admin-stock-take-counting',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        StockTakeCategoryTreeComponent,
        StockTakeCountingTableComponent,
        StockTakeSummaryPanelComponent,
        StockTakeCompleteDialogComponent,
    ],
    host: { class: 'block h-screen flex flex-col bg-gray-50' },
    template: `
    <div class="flex-none bg-surface border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3 min-w-0">
        <button type="button" (click)="back()" class="w-9 h-9 rounded-1.5 border border-gray-200 flex items-center justify-center hover:bg-gray-50" aria-label="Back to Stock Take list">
          <boo-icon name="arrow-left" [size]="16"></boo-icon>
        </button>
        <div class="min-w-0">
          <p class="text-sm font-bold text-regular truncate">{{ stockTake()?.code ?? 'Loading…' }}</p>
          <p class="text-xs text-secondary truncate">{{ stockTake()?.warehouseName }} · {{ stockTake()?.departmentName }}</p>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <ng-container *ngFor="let step of steps; let i = index">
          <div class="flex items-center gap-1.5">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
              [ngClass]="stepIndex() >= i ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'">{{ i + 1 }}</div>
            <span class="text-[11px] font-medium hidden sm:inline" [ngClass]="stepIndex() >= i ? 'text-regular' : 'text-gray-400'">{{ stepLabel(step) }}</span>
          </div>
          <div class="w-6 h-px bg-gray-200" *ngIf="i < steps.length - 1"></div>
        </ng-container>
      </div>

      <button type="button" (click)="completeOpen.set(true)" [disabled]="stockTake()?.status !== 'Counting'"
        class="px-4 py-2 rounded-1.5 bg-emerald-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
        <boo-icon name="circle-check-big" [size]="15"></boo-icon> Complete Counting
      </button>
    </div>

    <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 p-3 sm:p-4">
      <div class="h-[300px] lg:h-full">
        <stock-take-category-tree [categories]="categories()" [activeId]="activeCategoryId()"
          (select)="onSelectCategory($event)" (queryChange)="onSearch($event)"></stock-take-category-tree>
      </div>
      <div class="min-h-0">
        <stock-take-counting-table [items]="filteredItems()" [saving]="saving()"
          (itemsChange)="onItemsChange($event)" (autosave)="onAutosave($event)" (saveNow)="onAutosave(filteredItems())"></stock-take-counting-table>
      </div>
    </div>

    <stock-take-summary-panel [summary]="summary()"></stock-take-summary-panel>

    <stock-take-complete-dialog [isOpen]="completeOpen()" [summary]="summary()" (close)="completeOpen.set(false)" (confirm)="onComplete()"></stock-take-complete-dialog>
  `,
})
export class AdminStockTakeCountingComponent implements OnInit {
    stockTake = signal<StockTake | null>(null);
    categories = signal<StockTakeCategoryNode[]>([]);
    items = signal<StockTakeItem[]>([]);
    activeCategoryId = signal<string | null>(null);
    searchQuery = signal('');
    saving = signal(false);
    completeOpen = signal(false);

    readonly steps = STEPS;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private srv: StockTakeService,
        private toastSrv: ToastService,
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;
        this.srv.getById(id).subscribe(res => { if (res.success) this.stockTake.set(res.data); });
        this.srv.getCategories(id).subscribe(res => { if (res.success) this.categories.set(res.data); });
        this.srv.getItems(id).subscribe(res => { if (res.success) this.items.set(res.data); });
    }

    stepIndex(): number {
        const status = this.stockTake()?.status;
        if (status === 'Rejected') return 1;
        if (status === 'Cancelled') return 0;
        return Math.max(0, this.steps.indexOf(status ?? 'Draft'));
    }

    stepLabel(step: StockTakeStatus): string {
        return step === 'PendingApproval' ? 'Pending Approval' : step;
    }

    filteredItems(): StockTakeItem[] {
        let list = this.items();
        const catId = this.activeCategoryId();
        if (catId) list = list.filter(i => i.categoryId === catId);
        const q = this.searchQuery().toLowerCase();
        if (q) list = list.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q));
        return list;
    }

    summary(): StockTakeSummary {
        const items = this.items();
        const counted = items.filter(i => i.isCounted);
        return {
            totalItems: items.length,
            countedItems: counted.length,
            remainingItems: items.length - counted.length,
            positiveDifferenceCount: items.filter(i => i.difference > 0).length,
            negativeDifferenceCount: items.filter(i => i.difference < 0).length,
            valueDifference: items.reduce((sum, i) => sum + i.difference * 4.2, 0),
            completionPercent: items.length ? Math.round((counted.length / items.length) * 100) : 0,
        };
    }

    onSelectCategory(node: StockTakeCategoryNode | null): void {
        this.activeCategoryId.set(node?.id ?? null);
    }

    onSearch(query: string): void {
        this.searchQuery.set(query);
    }

    onItemsChange(items: StockTakeItem[]): void {
        this.items.set([...this.items()]);
    }

    onAutosave(items: StockTakeItem[]): void {
        const id = this.stockTake()?.id;
        if (!id) return;
        this.saving.set(true);
        this.srv.updateItems(id, items).subscribe({
            next: () => this.saving.set(false),
            error: () => this.saving.set(false),
        });
    }

    onComplete(): void {
        const st = this.stockTake();
        if (!st) return;
        this.srv.complete(st.id).subscribe(() => {
            this.toastSrv.success(`${st.code} submitted for approval`);
            this.completeOpen.set(false);
            this.router.navigate(['/admin/pharmacy/stock-take']);
        });
    }

    back(): void {
        this.router.navigate(['/admin/pharmacy/stock-take']);
    }
}
